import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

import { adminProcedure } from "@/server/api/trpc";
import { createTRPCRouter } from "@/server/api/trpc";
import {
  application,
  experience,
  language,
  skill,
  social,
} from "@/server/db/schema";

const listApplicationsSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["name", "email", "category"]).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterStatus: z.string().optional(),
  filterCategory: z.string().optional(),
});

export const adminRouter = createTRPCRouter({
  listApplications: adminProcedure
    .input(listApplicationsSchema)
    .query(async ({ ctx, input }) => {
      const conditions = [];

      // Search functionality
      if (input.searchValue) {
        const searchTerm = `%${input.searchValue}%`;
        if (input.searchField === "name") {
          conditions.push(
            or(
              ilike(application.firstName, searchTerm),
              ilike(application.lastName, searchTerm),
              ilike(
                sql`${application.firstName} || ' ' || ${application.lastName}`,
                searchTerm,
              ),
            ),
          );
        } else if (input.searchField === "email") {
          conditions.push(ilike(application.email, searchTerm));
        } else if (input.searchField === "category") {
          conditions.push(ilike(application.category, searchTerm));
        } else {
          // Default: search in name and email
          conditions.push(
            or(
              ilike(application.firstName, searchTerm),
              ilike(application.lastName, searchTerm),
              ilike(
                sql`${application.firstName} || ' ' || ${application.lastName}`,
                searchTerm,
              ),
              ilike(application.email, searchTerm),
            ),
          );
        }
      }

      // Filter by status
      if (input.filterStatus) {
        conditions.push(eq(application.status, input.filterStatus));
      }

      // Filter by category
      if (input.filterCategory) {
        conditions.push(eq(application.category, input.filterCategory));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(application)
        .where(whereClause);
      const total = Number(totalResult[0]?.count ?? 0);

      // Get applications
      const orderBy =
        input.sortBy === "createdAt"
          ? input.sortDirection === "asc"
            ? application.createdAt
            : desc(application.createdAt)
          : input.sortBy === "name"
            ? input.sortDirection === "asc"
              ? application.firstName
              : desc(application.firstName)
            : desc(application.createdAt);

      const applications = await ctx.db
        .select()
        .from(application)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      return {
        applications,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  getApplication: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [app] = await ctx.db
        .select()
        .from(application)
        .where(eq(application.id, input.id))
        .limit(1);

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // Get related data
      const [languages, skills, experiences, socials] = await Promise.all([
        ctx.db
          .select()
          .from(language)
          .where(eq(language.applicationId, input.id)),
        ctx.db.select().from(skill).where(eq(skill.applicationId, input.id)),
        ctx.db
          .select()
          .from(experience)
          .where(eq(experience.applicationId, input.id)),
        ctx.db.select().from(social).where(eq(social.applicationId, input.id)),
      ]);

      return {
        ...app,
        languages,
        skills,
        experiences,
        socials,
      };
    }),

  togglePublicLink: adminProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        isPublic: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [app] = await ctx.db
        .select()
        .from(application)
        .where(eq(application.id, input.applicationId))
        .limit(1);

      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      let publicToken: string | null = null;

      if (input.isPublic) {
        // Generate unique token
        publicToken = randomBytes(32).toString("hex");
        
        // Ensure uniqueness
        let exists = true;
        while (exists) {
          const existing = await ctx.db
            .select()
            .from(application)
            .where(eq(application.publicToken, publicToken))
            .limit(1);
          if (existing.length === 0) {
            exists = false;
          } else {
            publicToken = randomBytes(32).toString("hex");
          }
        }
      }

      const [updated] = await ctx.db
        .update(application)
        .set({
          isPublic: input.isPublic,
          publicToken: input.isPublic ? publicToken : null,
        })
        .where(eq(application.id, input.applicationId))
        .returning();

      return {
        ...updated,
        shareableUrl: input.isPublic && publicToken
          ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/application/${publicToken}`
          : null,
      };
    }),

  exportApplications: adminProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json"]).default("csv"),
        filterStatus: z.string().optional(),
        filterCategory: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.filterStatus) {
        conditions.push(eq(application.status, input.filterStatus));
      }

      if (input.filterCategory) {
        conditions.push(eq(application.category, input.filterCategory));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const applications = await ctx.db
        .select()
        .from(application)
        .where(whereClause)
        .orderBy(desc(application.createdAt));

      // Get related data for each application
      const applicationsWithRelations = await Promise.all(
        applications.map(async (app) => {
          const [languages, skills, experiences, socials] = await Promise.all([
            ctx.db
              .select()
              .from(language)
              .where(eq(language.applicationId, app.id)),
            ctx.db.select().from(skill).where(eq(skill.applicationId, app.id)),
            ctx.db
              .select()
              .from(experience)
              .where(eq(experience.applicationId, app.id)),
            ctx.db
              .select()
              .from(social)
              .where(eq(social.applicationId, app.id)),
          ]);

          return {
            ...app,
            languages,
            skills,
            experiences,
            socials,
          };
        }),
      );

      if (input.format === "json") {
        return {
          format: "json",
          data: JSON.stringify(applicationsWithRelations, null, 2),
        };
      }

      // CSV format
      if (applicationsWithRelations.length === 0) {
        return {
          format: "csv",
          data: "",
        };
      }

      // Flatten data for CSV
      const csvRows = applicationsWithRelations.map((app) => {
        return {
          id: app.id,
          firstName: app.firstName,
          lastName: app.lastName,
          email: app.email,
          phoneNumber: app.phoneNumber ?? "",
          category: app.category,
          status: app.status ?? "",
          countryOfResidence: app.countryOfResidence,
          countryOfOrigin: app.countryOfOrigin ?? "",
          city: app.city ?? "",
          currentJobStatus: app.currentJobStatus ?? "",
          highestFormalEducationLevel: app.highestFormalEducationLevel ?? "",
          availability: app.availability ?? "",
          hoursPerWeek: app.hoursPerWeek ?? "",
          expectedSalary: app.expectedSalary?.toString() ?? "",
          resumeUrl: app.resumeUrl ?? "",
          videoUrl: app.videoUrl ?? "",
          notes: app.notes ?? "",
          tags: app.tags?.join("; ") ?? "",
          languages: app.languages.map((l) => `${l.name} (${l.proficiency})`).join("; "),
          skills: app.skills.map((s) => s.name).join("; "),
          experiences: app.experiences.map((e) => `${e.position} at ${e.company}`).join("; "),
          socials: app.socials.map((s) => `${s.platform}: ${s.url}`).join("; "),
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
        };
      });

      // Convert to CSV
      const headers = Object.keys(csvRows[0] ?? {});
      const csvLines = [
        headers.join(","),
        ...csvRows.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in CSV
              if (typeof value === "string") {
                const escaped = value.replace(/"/g, '""');
                return `"${escaped}"`;
              }
              return value ?? "";
            })
            .join(","),
        ),
      ];

      return {
        format: "csv",
        data: csvLines.join("\n"),
      };
    }),
});

