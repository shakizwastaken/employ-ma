import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  application,
  category,
  experience,
  experienceCategory,
  language,
  skill,
  social,
} from "@/server/db/schema";
import { applicationFormSchema } from "@/server/api/validators/application";

export const applicationRouter = createTRPCRouter({
  // Get all categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db
      .select()
      .from(category)
      .orderBy(category.name);
    return categories;
  }),

  // Check if email is unique
  checkEmailUnique: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select()
        .from(application)
        .where(eq(application.email, input.email))
        .limit(1);

      return { isUnique: existing.length === 0 };
    }),

  // Submit application
  submitApplication: publicProcedure
    .input(applicationFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Check email uniqueness again (in case of race condition)
      const existingEmail = await ctx.db
        .select()
        .from(application)
        .where(eq(application.email, input.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An application with this email already exists",
        });
      }

      // Use a transaction for atomicity
      return await ctx.db.transaction(async (tx) => {
        // Insert application
        const [newApplication] = await tx
          .insert(application)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phoneNumber: input.phoneNumber,
            birthYear: input.birthYear ?? null,
            countryOfOrigin: input.countryOfOrigin ?? null,
            countryOfResidence: input.countryOfResidence,
            timeZone: input.timeZone,
            city: input.city ?? null,
            currentJobStatus: input.currentJobStatus,
            highestFormalEducationLevel: input.highestFormalEducationLevel,
            availability: input.availability,
            hoursPerWeek: input.hoursPerWeek ?? null,
            availableIn:
              input.availability === "full_time" ? (input.availableIn ?? 0) : 0,
            availableFrom: input.availableFrom
              ? new Date(input.availableFrom).toISOString().split("T")[0]
              : null,
            expectedSalary: input.expectedSalary,
            resumeUrl: input.resumeUrl || null,
            videoUrl: input.videoUrl || null,
            notes: input.notes ?? null,
            category: input.categoryId,
            status: "active",
          })
          .returning();

        if (!newApplication) {
          throw new Error("Failed to create application");
        }

        const applicationId = newApplication.id;

        // Insert languages
        if (input.languages && input.languages.length > 0) {
          await tx.insert(language).values(
            input.languages.map((lang) => ({
              applicationId,
              name: lang.name,
              proficiency: lang.proficiency,
            })),
          );
        }

        // Insert LinkedIn social profile
        await tx.insert(social).values({
          applicationId,
          platform: "linkedin",
          url: input.linkedinUrl,
        });

        // Insert additional social profiles
        if (input.socialProfiles && input.socialProfiles.length > 0) {
          await tx.insert(social).values(
            input.socialProfiles.map((profile) => ({
              applicationId,
              platform: profile.platform,
              url: profile.url,
            })),
          );
        }

        // Insert skills
        if (input.skills && input.skills.length > 0) {
          const skillInserts = input.skills.map((skillData) => ({
            applicationId,
            name: skillData.name,
            tags: skillData.tags,
            level: skillData.level,
            totalExperience: skillData.totalExperience ?? null,
            startYear: skillData.startYear ?? null,
            institution: skillData.institution ?? null,
            selfTaught: skillData.selfTaught ?? null,
          }));

          const insertedSkills = await tx
            .insert(skill)
            .values(skillInserts)
            .returning();

          // Note: skillExperience mapping would go here if needed in the future
        }

        // Insert experiences
        if (input.experiences && input.experiences.length > 0) {
          const experienceInserts = input.experiences.map((exp) => ({
            applicationId,
            company: exp.company ?? null,
            position: exp.position ?? null,
            description: exp.description ?? null,
            startYear: exp.startYear ?? null,
            endYear: exp.isCurrent ? null : (exp.endYear ?? null),
            isCurrent: exp.isCurrent,
            links: exp.links ?? [],
            achievements: exp.achievements ?? [],
          }));

          const insertedExperiences = await tx
            .insert(experience)
            .values(experienceInserts)
            .returning();

          // Insert experience categories (many-to-many)
          for (let i = 0; i < insertedExperiences.length; i++) {
            const exp = input.experiences[i];
            if (exp && exp.categoryIds && exp.categoryIds.length > 0) {
              await tx.insert(experienceCategory).values(
                exp.categoryIds.map((categoryId) => ({
                  experienceId: insertedExperiences[i]!.id,
                  categoryId,
                })),
              );
            }
          }
        }

        return {
          id: applicationId,
          email: newApplication.email,
          message: "Application submitted successfully",
        };
      });
    }),
});
