import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

import { adminProcedure } from "@/server/api/trpc";
import { createTRPCRouter } from "@/server/api/trpc";
import {
  application,
  experience,
  favorite,
  language,
  skill,
  social,
  user,
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
  filterMinSkills: z.boolean().default(false),
  filterMinExperiences: z.boolean().default(false),
  filterMinSocials: z.boolean().default(false),
  filterHasPortfolio: z.boolean().default(false),
  filterHasNote: z.boolean().default(false),
  filterHasResume: z.boolean().default(false),
  filterHasVideo: z.boolean().default(false),
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

      // Check if any advanced filters are enabled
      const hasAdvancedFilters =
        input.filterMinSkills ||
        input.filterMinExperiences ||
        input.filterMinSocials ||
        input.filterHasPortfolio ||
        input.filterHasNote ||
        input.filterHasResume ||
        input.filterHasVideo;

      // Add SQL-level filters that can be done directly
      if (input.filterHasNote) {
        conditions.push(
          sql`${application.notes} IS NOT NULL AND ${application.notes} != ''`,
        );
      }

      if (input.filterHasResume) {
        conditions.push(
          sql`${application.resumeUrl} IS NOT NULL AND ${application.resumeUrl} != ''`,
        );
      }

      if (input.filterHasVideo) {
        conditions.push(
          sql`${application.videoUrl} IS NOT NULL AND ${application.videoUrl} != ''`,
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get applications first
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

      let applications = await ctx.db
        .select()
        .from(application)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(hasAdvancedFilters ? input.limit * 3 : input.limit) // Get more to account for filtering
        .offset(hasAdvancedFilters ? 0 : input.offset); // Apply offset after filtering if needed

      // If any advanced filters requiring related data or portfolio, filter further
      if (
        hasAdvancedFilters &&
        (input.filterMinSkills ||
          input.filterMinExperiences ||
          input.filterMinSocials ||
          input.filterHasPortfolio) &&
        applications.length > 0
      ) {
        const applicationIds = applications.map((app) => app.id);

        // Get counts for each application
        const queries = [];
        if (input.filterMinSkills) {
          queries.push(
            ctx.db
              .select({
                applicationId: skill.applicationId,
                count: sql<number>`count(*)`,
              })
              .from(skill)
              .where(inArray(skill.applicationId, applicationIds))
              .groupBy(skill.applicationId),
          );
        }
        if (input.filterMinExperiences) {
          queries.push(
            ctx.db
              .select({
                applicationId: experience.applicationId,
                count: sql<number>`count(*)`,
              })
              .from(experience)
              .where(inArray(experience.applicationId, applicationIds))
              .groupBy(experience.applicationId),
          );
        }
        if (input.filterMinSocials) {
          queries.push(
            ctx.db
              .select({
                applicationId: social.applicationId,
                count: sql<number>`count(*)`,
              })
              .from(social)
              .where(inArray(social.applicationId, applicationIds))
              .groupBy(social.applicationId),
          );
        }

        const results = await Promise.all(queries);

        // Create maps for quick lookup
        const skillMap = new Map<string, number>();
        const experienceMap = new Map<string, number>();
        const socialMap = new Map<string, number>();

        let resultIndex = 0;
        if (input.filterMinSkills) {
          results[resultIndex]!.forEach((s) => {
            skillMap.set(s.applicationId, Number(s.count));
          });
          resultIndex++;
        }
        if (input.filterMinExperiences) {
          results[resultIndex]!.forEach((e) => {
            experienceMap.set(e.applicationId, Number(e.count));
          });
          resultIndex++;
        }
        if (input.filterMinSocials) {
          results[resultIndex]!.forEach((s) => {
            socialMap.set(s.applicationId, Number(s.count));
          });
        }

        // Filter applications based on selected criteria
        applications = applications.filter((app) => {
          if (input.filterMinSkills) {
            const hasSkills = (skillMap.get(app.id) ?? 0) >= 1;
            if (!hasSkills) return false;
          }
          if (input.filterMinExperiences) {
            const hasExperiences = (experienceMap.get(app.id) ?? 0) >= 1;
            if (!hasExperiences) return false;
          }
          if (input.filterMinSocials) {
            const hasSocials = (socialMap.get(app.id) ?? 0) >= 1;
            if (!hasSocials) return false;
          }
          if (input.filterHasPortfolio) {
            const hasPortfolioLinks =
              app.portfolioLinks !== null &&
              app.portfolioLinks !== undefined &&
              app.portfolioLinks.length > 0;
            const hasPortfolioFile =
              app.portfolioFileUrl !== null &&
              app.portfolioFileUrl !== undefined &&
              app.portfolioFileUrl.trim() !== "";
            if (!hasPortfolioLinks && !hasPortfolioFile) return false;
          }
          return true;
        });

        // Apply limit and offset after filtering
        applications = applications.slice(
          input.offset,
          input.offset + input.limit,
        );
      } else if (hasAdvancedFilters && applications.length === 0) {
        applications = [];
      }

      // Get total count
      let total: number;
      if (
        hasAdvancedFilters &&
        (input.filterMinSkills ||
          input.filterMinExperiences ||
          input.filterMinSocials ||
          input.filterHasPortfolio)
      ) {
        // Need to count with filters applied
        const allMatching = await ctx.db
          .select()
          .from(application)
          .where(whereClause)
          .limit(10000);

        const allIds = allMatching.map((app) => app.id);

        if (allIds.length === 0) {
          total = 0;
        } else {
          const countQueries = [];
          if (input.filterMinSkills) {
            countQueries.push(
              ctx.db
                .select({
                  applicationId: skill.applicationId,
                  count: sql<number>`count(*)`,
                })
                .from(skill)
                .where(inArray(skill.applicationId, allIds))
                .groupBy(skill.applicationId),
            );
          }
          if (input.filterMinExperiences) {
            countQueries.push(
              ctx.db
                .select({
                  applicationId: experience.applicationId,
                  count: sql<number>`count(*)`,
                })
                .from(experience)
                .where(inArray(experience.applicationId, allIds))
                .groupBy(experience.applicationId),
            );
          }
          if (input.filterMinSocials) {
            countQueries.push(
              ctx.db
                .select({
                  applicationId: social.applicationId,
                  count: sql<number>`count(*)`,
                })
                .from(social)
                .where(inArray(social.applicationId, allIds))
                .groupBy(social.applicationId),
            );
          }

          const countResults = await Promise.all(countQueries);

          const allSkillMap = new Map<string, number>();
          const allExpMap = new Map<string, number>();
          const allSocialMap = new Map<string, number>();

          let countIndex = 0;
          if (input.filterMinSkills) {
            countResults[countIndex]!.forEach((s) => {
              allSkillMap.set(s.applicationId, Number(s.count));
            });
            countIndex++;
          }
          if (input.filterMinExperiences) {
            countResults[countIndex]!.forEach((e) => {
              allExpMap.set(e.applicationId, Number(e.count));
            });
            countIndex++;
          }
          if (input.filterMinSocials) {
            countResults[countIndex]!.forEach((s) => {
              allSocialMap.set(s.applicationId, Number(s.count));
            });
          }

          total = allMatching.filter((app) => {
            if (input.filterMinSkills) {
              const hasSkills = (allSkillMap.get(app.id) ?? 0) >= 1;
              if (!hasSkills) return false;
            }
            if (input.filterMinExperiences) {
              const hasExperiences = (allExpMap.get(app.id) ?? 0) >= 1;
              if (!hasExperiences) return false;
            }
            if (input.filterMinSocials) {
              const hasSocials = (allSocialMap.get(app.id) ?? 0) >= 1;
              if (!hasSocials) return false;
            }
            if (input.filterHasPortfolio) {
              const hasPortfolioLinks =
                app.portfolioLinks !== null &&
                app.portfolioLinks !== undefined &&
                app.portfolioLinks.length > 0;
              const hasPortfolioFile =
                app.portfolioFileUrl !== null &&
                app.portfolioFileUrl !== undefined &&
                app.portfolioFileUrl.trim() !== "";
              if (!hasPortfolioLinks && !hasPortfolioFile) return false;
            }
            return true;
          }).length;
        }
      } else {
        const totalResult = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(application)
          .where(whereClause);
        total = Number(totalResult[0]?.count ?? 0);
      }

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
        shareableUrl:
          input.isPublic && publicToken
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
    .mutation(async ({ ctx, input }) => {
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
          languages: app.languages
            .map((l) => `${l.name} (${l.proficiency})`)
            .join("; "),
          skills: app.skills.map((s) => s.name).join("; "),
          experiences: app.experiences
            .map((e) => `${e.position} at ${e.company}`)
            .join("; "),
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

  toggleFavorite: adminProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const userId = ctx.session.user.id;

      // Check if favorite already exists
      const [existing] = await ctx.db
        .select()
        .from(favorite)
        .where(
          and(
            eq(favorite.userId, userId),
            eq(favorite.applicationId, input.applicationId),
          ),
        )
        .limit(1);

      if (existing) {
        // Remove favorite
        await ctx.db
          .delete(favorite)
          .where(
            and(
              eq(favorite.userId, userId),
              eq(favorite.applicationId, input.applicationId),
            ),
          );
        return { isFavorite: false };
      } else {
        // Add favorite
        await ctx.db.insert(favorite).values({
          userId,
          applicationId: input.applicationId,
        });
        return { isFavorite: true };
      }
    }),

  getFavoriteStatus: adminProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        return { isFavorite: false };
      }

      const userId = ctx.session.user.id;

      const [existing] = await ctx.db
        .select()
        .from(favorite)
        .where(
          and(
            eq(favorite.userId, userId),
            eq(favorite.applicationId, input.applicationId),
          ),
        )
        .limit(1);

      return { isFavorite: !!existing };
    }),

  listFavorites: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Get all favorites from all staff with user information
      const favorites = await ctx.db
        .select({
          applicationId: favorite.applicationId,
          favoritedAt: favorite.createdAt,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
        })
        .from(favorite)
        .innerJoin(user, eq(favorite.userId, user.id))
        .orderBy(desc(favorite.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      if (favorites.length === 0) {
        return {
          applications: [],
          total: 0,
          limit: input.limit,
          offset: input.offset,
        };
      }

      const applicationIds = favorites.map((f) => f.applicationId);

      // Get applications
      const applications = await ctx.db
        .select()
        .from(application)
        .where(inArray(application.id, applicationIds));

      // Get total count of all favorites
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(favorite);
      const total = Number(totalResult[0]?.count ?? 0);

      // Sort applications by favorite order and include favoritedBy info
      const applicationsMap = new Map(applications.map((app) => [app.id, app]));
      const sortedApplications = favorites
        .map((f) => {
          const app = applicationsMap.get(f.applicationId);
          if (!app) return null;
          return {
            ...app,
            favoritedBy: {
              id: f.userId,
              name: f.userName,
              email: f.userEmail,
              image: f.userImage,
            },
            favoritedAt: f.favoritedAt,
          };
        })
        .filter((app): app is NonNullable<typeof app> => app !== null);

      return {
        applications: sortedApplications,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),
});
