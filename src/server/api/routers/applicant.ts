import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  applicant,
  role,
  applicantRole,
  questionTemplate,
  pathAnswer,
  applicantLanguage,
} from "@/server/db/schema";
import { auth } from "@/server/better-auth";

export const applicantRouter = createTRPCRouter({
  getRoles: publicProcedure.query(async ({ ctx }) => {
    const roles = await ctx.db
      .select()
      .from(role)
      .where(eq(role.isActive, true))
      .orderBy(role.name);

    return roles;
  }),

  getQuestions: publicProcedure
    .input(
      z.object({
        roleId: z.string().optional(),
        roleSlug: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.roleId && !input.roleSlug) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either roleId or roleSlug must be provided",
        });
      }

      let roleRecord;
      if (input.roleId) {
        const roles = await ctx.db
          .select()
          .from(role)
          .where(and(eq(role.id, input.roleId), eq(role.isActive, true)))
          .limit(1);
        roleRecord = roles[0];
      } else if (input.roleSlug) {
        const roles = await ctx.db
          .select()
          .from(role)
          .where(and(eq(role.slug, input.roleSlug), eq(role.isActive, true)))
          .limit(1);
        roleRecord = roles[0];
      }

      if (!roleRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        });
      }

      const questions = await ctx.db
        .select()
        .from(questionTemplate)
        .where(eq(questionTemplate.roleId, roleRecord.id))
        .orderBy(questionTemplate.order);

      return {
        role: roleRecord,
        questions,
      };
    }),

  submitApplication: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        city: z.string().min(1),
        currentJobStatus: z.string().min(1),
        yearsOfExperience: z.number().int().min(0),
        highestEducationLevel: z.string().min(1),
        skills: z.string().optional(),
        availability: z.enum(["full-time", "part-time"]),
        roleId: z.string(),
        languages: z
          .array(
            z.object({
              language: z.string().min(1),
              level: z.string().min(1),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if applicant already exists with this email
      const existingApplicants = await ctx.db
        .select()
        .from(applicant)
        .where(eq(applicant.email, input.email))
        .limit(1);

      let applicantId: string;
      if (existingApplicants[0]) {
        // Update existing applicant
        applicantId = existingApplicants[0].id;
        await ctx.db
          .update(applicant)
          .set({
            fullName: input.fullName,
            phone: input.phone,
            city: input.city,
            currentJobStatus: input.currentJobStatus,
            yearsOfExperience: input.yearsOfExperience,
            highestEducationLevel: input.highestEducationLevel,
            skills: input.skills ?? null,
            availability: input.availability,
            updatedAt: new Date(),
          })
          .where(eq(applicant.id, applicantId));
      } else {
        // Create new applicant
        applicantId = randomUUID();
        await ctx.db.insert(applicant).values({
          id: applicantId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          city: input.city,
          currentJobStatus: input.currentJobStatus,
          yearsOfExperience: input.yearsOfExperience,
          highestEducationLevel: input.highestEducationLevel,
          skills: input.skills ?? null,
          availability: input.availability,
          emailVerified: false,
        });
      }

      // Handle role assignment (remove existing roles and add new one)
      const existingRoles = await ctx.db
        .select()
        .from(applicantRole)
        .where(eq(applicantRole.applicantId, applicantId));

      // Remove existing roles
      for (const existingRole of existingRoles) {
        await ctx.db
          .delete(applicantRole)
          .where(eq(applicantRole.id, existingRole.id));
      }

      // Add new role
      await ctx.db.insert(applicantRole).values({
        id: randomUUID(),
        applicantId,
        roleId: input.roleId,
      });

      // Handle languages
      if (input.languages && input.languages.length > 0) {
        // Remove existing languages
        const existingLanguages = await ctx.db
          .select()
          .from(applicantLanguage)
          .where(eq(applicantLanguage.applicantId, applicantId));

        for (const existingLang of existingLanguages) {
          await ctx.db
            .delete(applicantLanguage)
            .where(eq(applicantLanguage.id, existingLang.id));
        }

        // Add new languages
        for (const lang of input.languages) {
          await ctx.db.insert(applicantLanguage).values({
            id: randomUUID(),
            applicantId,
            language: lang.language,
            level: lang.level,
          });
        }
      }

      // Send OTP for email verification
      try {
        await auth.api.sendVerificationOTP({
          body: {
            email: input.email,
            type: "email-verification",
          },
        });
      } catch (error) {
        console.error("Failed to send verification OTP:", error);
        // Don't fail the mutation if OTP sending fails
      }

      return {
        applicantId,
        email: input.email,
      };
    }),

  submitPathAnswers: publicProcedure
    .input(
      z.object({
        applicantEmail: z.string().email(),
        answers: z.array(
          z.object({
            templateId: z.string(),
            questionId: z.string(),
            answer: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find applicant by email
      const applicants = await ctx.db
        .select()
        .from(applicant)
        .where(eq(applicant.email, input.applicantEmail))
        .limit(1);

      if (!applicants[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Applicant not found",
        });
      }

      const applicantId = applicants[0].id;

      // Remove existing answers for this applicant
      const existingAnswers = await ctx.db
        .select()
        .from(pathAnswer)
        .where(eq(pathAnswer.applicantId, applicantId));

      for (const existingAnswer of existingAnswers) {
        await ctx.db
          .delete(pathAnswer)
          .where(eq(pathAnswer.id, existingAnswer.id));
      }

      // Insert new answers
      for (const answer of input.answers) {
        await ctx.db.insert(pathAnswer).values({
          id: randomUUID(),
          applicantId,
          templateId: answer.templateId,
          questionId: answer.questionId,
          answer: answer.answer,
        });
      }

      return { success: true };
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify OTP with better-auth
        const verifyResult = await auth.api.verifyEmailOTP({
          body: {
            email: input.email,
            otp: input.otp,
          },
        });

        // Check if verification was successful
        if (!verifyResult || ("error" in verifyResult && verifyResult.error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid OTP",
          });
        }

        // Update applicant emailVerified status
        await ctx.db
          .update(applicant)
          .set({ emailVerified: true })
          .where(eq(applicant.email, input.email));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to verify email",
        });
      }
    }),

  getMyApplication: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User email not found in session",
      });
    }

    const userEmail = ctx.session.user.email;

    const applicants = await ctx.db
      .select()
      .from(applicant)
      .where(eq(applicant.email, userEmail))
      .limit(1);

    if (!applicants[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Application not found. Please submit an application first.",
      });
    }

    const applicantRecord = applicants[0];

    // Get roles
    const applicantRoles = await ctx.db
      .select({
        role: role,
        applicantRole: applicantRole,
      })
      .from(applicantRole)
      .innerJoin(role, eq(applicantRole.roleId, role.id))
      .where(eq(applicantRole.applicantId, applicantRecord.id));

    // Get languages
    const languages = await ctx.db
      .select()
      .from(applicantLanguage)
      .where(eq(applicantLanguage.applicantId, applicantRecord.id));

    // Get path answers
    const answers = await ctx.db
      .select({
        answer: pathAnswer,
        template: questionTemplate,
      })
      .from(pathAnswer)
      .innerJoin(
        questionTemplate,
        eq(pathAnswer.templateId, questionTemplate.id),
      )
      .where(eq(pathAnswer.applicantId, applicantRecord.id));

    return {
      applicant: applicantRecord,
      roles: applicantRoles.map((ar) => ar.role),
      languages,
      pathAnswers: answers.map((a) => ({
        ...a.answer,
        question: a.template,
      })),
    };
  }),
});
