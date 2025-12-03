import { TRPCError } from "@trpc/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  application,
  role,
  applicationRole,
  questionTemplate,
  pathAnswer,
  applicationLanguage,
  applicationSkill,
  applicationExperience,
  experienceSkill,
  user,
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
        skills: z
          .array(
            z.object({
              skill: z.string().min(1),
              educationMethod: z.enum([
                "self-taught",
                "high-school",
                "associate",
                "bachelor",
                "master",
                "phd",
                "bootcamp",
                "online-course",
                "certification",
                "work-experience",
              ]),
              institution: z.string().optional(),
              year: z.number().int().optional(),
            }),
          )
          .optional(),
        experiences: z
          .array(
            z.object({
              company: z.string().min(1),
              role: z.string().min(1),
              startDate: z.string(), // ISO date string
              endDate: z.string().optional(), // ISO date string
              description: z.string().optional(),
              achievements: z.string().optional(),
              isCurrent: z.boolean(),
              order: z.number().int(),
              linkedSkillIds: z.array(z.string()).optional(),
            }),
          )
          .max(15)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create user
      let userRecord = await ctx.db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1)
        .then((users) => users[0]);

      if (!userRecord) {
        // Create new user account
        try {
          const signUpResult = await auth.api.signUpEmail({
            body: {
              email: input.email,
              password: crypto.randomUUID(), // Generate random password, user will use OTP to login
              name: input.fullName,
            },
          });

          if (
            !signUpResult ||
            ("error" in signUpResult && signUpResult.error)
          ) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user account",
            });
          }

          // Fetch the created user
          userRecord = await ctx.db
            .select()
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1)
            .then((users) => users[0]);

          if (!userRecord) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "User account created but not found",
            });
          }
        } catch (error) {
          // If user already exists (from another source), just fetch it
          userRecord = await ctx.db
            .select()
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1)
            .then((users) => users[0]);

          if (!userRecord) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create or find user account",
            });
          }
        }
      }

      // Update user phone if provided
      if (input.phone && userRecord.phone !== input.phone) {
        await ctx.db
          .update(user)
          .set({ phone: input.phone, updatedAt: new Date() })
          .where(eq(user.id, userRecord.id));
      }

      // Check if application already exists for this user
      const existingApplications = await ctx.db
        .select()
        .from(application)
        .where(eq(application.userId, userRecord.id))
        .limit(1);

      let applicationId: string;
      if (existingApplications[0]) {
        // Update existing application
        applicationId = existingApplications[0].id;
        await ctx.db
          .update(application)
          .set({
            fullName: input.fullName,
            city: input.city,
            currentJobStatus: input.currentJobStatus,
            yearsOfExperience: input.yearsOfExperience,
            highestEducationLevel: input.highestEducationLevel,
            availability: input.availability,
            updatedAt: new Date(),
          })
          .where(eq(application.id, applicationId));
      } else {
        // Create new application
        const newApplication = await ctx.db
          .insert(application)
          .values({
            userId: userRecord.id,
            fullName: input.fullName,
            city: input.city,
            currentJobStatus: input.currentJobStatus,
            yearsOfExperience: input.yearsOfExperience,
            highestEducationLevel: input.highestEducationLevel,
            availability: input.availability,
          })
          .returning()
          .then((apps) => apps[0]);

        if (!newApplication) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create application",
          });
        }
        applicationId = newApplication.id;
      }

      // Handle role assignment (remove existing roles and add new one)
      const existingRoles = await ctx.db
        .select()
        .from(applicationRole)
        .where(eq(applicationRole.applicationId, applicationId));

      // Remove existing roles
      for (const existingRole of existingRoles) {
        await ctx.db
          .delete(applicationRole)
          .where(eq(applicationRole.id, existingRole.id));
      }

      // Add new role
      await ctx.db.insert(applicationRole).values({
        applicationId,
        roleId: input.roleId,
      });

      // Handle languages
      if (input.languages && input.languages.length > 0) {
        // Remove existing languages
        const existingLanguages = await ctx.db
          .select()
          .from(applicationLanguage)
          .where(eq(applicationLanguage.applicationId, applicationId));

        for (const existingLang of existingLanguages) {
          await ctx.db
            .delete(applicationLanguage)
            .where(eq(applicationLanguage.id, existingLang.id));
        }

        // Add new languages
        for (const lang of input.languages) {
          await ctx.db.insert(applicationLanguage).values({
            applicationId,
            language: lang.language,
            level: lang.level,
          });
        }
      }

      // Handle skills
      if (input.skills && input.skills.length > 0) {
        // Remove existing skills
        const existingSkills = await ctx.db
          .select()
          .from(applicationSkill)
          .where(eq(applicationSkill.applicationId, applicationId));

        for (const existingSkill of existingSkills) {
          await ctx.db
            .delete(applicationSkill)
            .where(eq(applicationSkill.id, existingSkill.id));
        }

        // Add new skills
        const skillIds: string[] = [];
        for (const skill of input.skills) {
          const newSkill = await ctx.db
            .insert(applicationSkill)
            .values({
              applicationId,
              skill: skill.skill,
              educationMethod: skill.educationMethod,
              institution: skill.institution ?? null,
              year: skill.year ?? null,
            })
            .returning()
            .then((skills) => skills[0]);

          if (newSkill) {
            skillIds.push(newSkill.id);
          }
        }

        // Handle experiences with skill linking
        if (input.experiences && input.experiences.length > 0) {
          // Remove existing experiences
          const existingExperiences = await ctx.db
            .select()
            .from(applicationExperience)
            .where(eq(applicationExperience.applicationId, applicationId));

          for (const existingExp of existingExperiences) {
            // Remove experience-skill links
            const existingLinks = await ctx.db
              .select()
              .from(experienceSkill)
              .where(eq(experienceSkill.experienceId, existingExp.id));

            for (const link of existingLinks) {
              await ctx.db
                .delete(experienceSkill)
                .where(eq(experienceSkill.id, link.id));
            }

            // Remove experience
            await ctx.db
              .delete(applicationExperience)
              .where(eq(applicationExperience.id, existingExp.id));
          }

          // Add new experiences
          for (const exp of input.experiences) {
            const newExperience = await ctx.db
              .insert(applicationExperience)
              .values({
                applicationId,
                company: exp.company,
                role: exp.role,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                description: exp.description ?? null,
                achievements: exp.achievements ?? null,
                isCurrent: exp.isCurrent,
                order: exp.order,
              })
              .returning()
              .then((exps) => exps[0]);

            if (
              newExperience &&
              exp.linkedSkillIds &&
              exp.linkedSkillIds.length > 0
            ) {
              // Link skills to experience if provided
              for (const skillId of exp.linkedSkillIds) {
                // Verify skill belongs to this application
                if (skillIds.includes(skillId)) {
                  await ctx.db.insert(experienceSkill).values({
                    experienceId: newExperience.id,
                    skillId,
                  });
                }
              }
            }
          }
        }
      } else if (input.experiences && input.experiences.length > 0) {
        // Handle experiences without skills (skills might be added later)
        const existingExperiences = await ctx.db
          .select()
          .from(applicationExperience)
          .where(eq(applicationExperience.applicationId, applicationId));

        for (const existingExp of existingExperiences) {
          const existingLinks = await ctx.db
            .select()
            .from(experienceSkill)
            .where(eq(experienceSkill.experienceId, existingExp.id));

          for (const link of existingLinks) {
            await ctx.db
              .delete(experienceSkill)
              .where(eq(experienceSkill.id, link.id));
          }

          await ctx.db
            .delete(applicationExperience)
            .where(eq(applicationExperience.id, existingExp.id));
        }

        for (const exp of input.experiences) {
          await ctx.db.insert(applicationExperience).values({
            applicationId,
            company: exp.company,
            role: exp.role,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description ?? null,
            achievements: exp.achievements ?? null,
            isCurrent: exp.isCurrent,
            order: exp.order,
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
        applicationId,
        email: input.email,
      };
    }),

  submitPathAnswers: publicProcedure
    .input(
      z.object({
        applicationId: z.string(),
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
      // Verify application exists
      const applications = await ctx.db
        .select()
        .from(application)
        .where(eq(application.id, input.applicationId))
        .limit(1);

      if (!applications[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      const applicationId = applications[0].id;

      // Remove existing answers for this application
      const existingAnswers = await ctx.db
        .select()
        .from(pathAnswer)
        .where(eq(pathAnswer.applicationId, applicationId));

      for (const existingAnswer of existingAnswers) {
        await ctx.db
          .delete(pathAnswer)
          .where(eq(pathAnswer.id, existingAnswer.id));
      }

      // Insert new answers
      for (const answer of input.answers) {
        await ctx.db.insert(pathAnswer).values({
          applicationId,
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

        // User email verification is handled by better-auth
        // No need to update application table since emailVerified is in user table

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
    if (!ctx.session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User ID not found in session",
      });
    }

    const userId = ctx.session.user.id;

    const applications = await ctx.db
      .select()
      .from(application)
      .where(eq(application.userId, userId))
      .limit(1);

    if (!applications[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Application not found. Please submit an application first.",
      });
    }

    const applicationRecord = applications[0];

    // Get roles
    const applicationRoles = await ctx.db
      .select({
        role: role,
        applicationRole: applicationRole,
      })
      .from(applicationRole)
      .innerJoin(role, eq(applicationRole.roleId, role.id))
      .where(eq(applicationRole.applicationId, applicationRecord.id));

    // Get languages
    const languages = await ctx.db
      .select()
      .from(applicationLanguage)
      .where(eq(applicationLanguage.applicationId, applicationRecord.id));

    // Get skills
    const skills = await ctx.db
      .select()
      .from(applicationSkill)
      .where(eq(applicationSkill.applicationId, applicationRecord.id));

    // Get experiences
    const experiences = await ctx.db
      .select()
      .from(applicationExperience)
      .where(eq(applicationExperience.applicationId, applicationRecord.id))
      .orderBy(applicationExperience.order);

    // Get experience-skill links for all experiences
    const experienceIds = experiences.map((e) => e.id);
    const experienceSkillLinks =
      experienceIds.length > 0
        ? await ctx.db
            .select()
            .from(experienceSkill)
            .where(inArray(experienceSkill.experienceId, experienceIds))
        : [];

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
      .where(eq(pathAnswer.applicationId, applicationRecord.id));

    // Get user data
    const userRecord = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
      .then((users) => users[0]);

    return {
      application: applicationRecord,
      user: userRecord
        ? {
            email: userRecord.email,
            phone: userRecord.phone,
            emailVerified: userRecord.emailVerified,
          }
        : null,
      roles: applicationRoles.map((ar) => ar.role),
      languages,
      skills,
      experiences: experiences.map((exp) => ({
        ...exp,
        linkedSkillIds:
          experienceSkillLinks
            .filter((link) => link.experienceId === exp.id)
            .map((link) => link.skillId) || [],
      })),
      pathAnswers: answers.map((a) => ({
        ...a.answer,
        question: a.template,
      })),
    };
  }),

  submitSkills: publicProcedure
    .input(
      z.object({
        applicationId: z.string(),
        skills: z.array(
          z.object({
            id: z.string().optional(), // Optional for new skills
            skill: z.string().min(1),
            educationMethod: z.string().min(1),
            institution: z.string().optional().nullable(),
            year: z
              .number()
              .int()
              .min(1900)
              .max(new Date().getFullYear())
              .optional()
              .nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applications = await ctx.db
        .select()
        .from(application)
        .where(eq(application.id, input.applicationId))
        .limit(1);

      if (!applications[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }
      const applicationId = applications[0].id;

      // Delete existing skills not in the new input
      const existingSkills = await ctx.db
        .select()
        .from(applicationSkill)
        .where(eq(applicationSkill.applicationId, applicationId));

      const skillsToDelete = existingSkills.filter(
        (es) => !input.skills.some((s) => s.id === es.id),
      );
      for (const skillToDelete of skillsToDelete) {
        await ctx.db
          .delete(applicationSkill)
          .where(eq(applicationSkill.id, skillToDelete.id));
      }

      // Insert or update skills
      for (const skillInput of input.skills) {
        if (skillInput.id) {
          // Update existing skill
          await ctx.db
            .update(applicationSkill)
            .set({
              skill: skillInput.skill,
              educationMethod: skillInput.educationMethod,
              institution: skillInput.institution ?? null,
              year: skillInput.year ?? null,
              updatedAt: new Date(),
            })
            .where(eq(applicationSkill.id, skillInput.id));
        } else {
          // Insert new skill
          await ctx.db.insert(applicationSkill).values({
            applicationId,
            skill: skillInput.skill,
            educationMethod: skillInput.educationMethod,
            institution: skillInput.institution ?? null,
            year: skillInput.year ?? null,
          });
        }
      }

      return { success: true };
    }),

  submitExperiences: publicProcedure
    .input(
      z.object({
        applicationId: z.string(),
        experiences: z.array(
          z.object({
            id: z.string().optional(), // Optional for new experiences
            company: z.string().min(1),
            role: z.string().min(1),
            startDate: z.string().transform((str) => new Date(str)),
            endDate: z
              .string()
              .transform((str) => new Date(str))
              .optional()
              .nullable(),
            description: z.string().optional().nullable(),
            achievements: z.string().optional().nullable(), // Can be JSON string
            isCurrent: z.boolean(),
            order: z.number().int().min(0),
            linkedSkillIds: z.array(z.string()).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applications = await ctx.db
        .select()
        .from(application)
        .where(eq(application.id, input.applicationId))
        .limit(1);

      if (!applications[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }
      const applicationId = applications[0].id;

      // Delete existing experiences not in the new input
      const existingExperiences = await ctx.db
        .select()
        .from(applicationExperience)
        .where(eq(applicationExperience.applicationId, applicationId));

      const experiencesToDelete = existingExperiences.filter(
        (ee) => !input.experiences.some((e) => e.id === ee.id),
      );
      for (const expToDelete of experiencesToDelete) {
        await ctx.db
          .delete(applicationExperience)
          .where(eq(applicationExperience.id, expToDelete.id));
      }

      // Insert or update experiences
      for (const expInput of input.experiences) {
        let experienceId: string;
        if (expInput.id) {
          // Update existing experience
          experienceId = expInput.id;
          await ctx.db
            .update(applicationExperience)
            .set({
              company: expInput.company,
              role: expInput.role,
              startDate: expInput.startDate,
              endDate: expInput.endDate ?? null,
              description: expInput.description ?? null,
              achievements: expInput.achievements ?? null,
              isCurrent: expInput.isCurrent,
              order: expInput.order,
              updatedAt: new Date(),
            })
            .where(eq(applicationExperience.id, experienceId));
        } else {
          // Insert new experience
          const newExp = await ctx.db
            .insert(applicationExperience)
            .values({
              applicationId,
              company: expInput.company,
              role: expInput.role,
              startDate: expInput.startDate,
              endDate: expInput.endDate ?? null,
              description: expInput.description ?? null,
              achievements: expInput.achievements ?? null,
              isCurrent: expInput.isCurrent,
              order: expInput.order,
            })
            .returning()
            .then((exps) => exps[0]);

          if (!newExp) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create experience",
            });
          }
          experienceId = newExp.id;
        }

        // Handle linked skills for this experience
        if (expInput.linkedSkillIds) {
          // Delete existing links for this experience
          await ctx.db
            .delete(experienceSkill)
            .where(eq(experienceSkill.experienceId, experienceId));

          // Add new links
          for (const skillId of expInput.linkedSkillIds) {
            await ctx.db.insert(experienceSkill).values({
              experienceId,
              skillId,
            });
          }
        }
      }

      return { success: true };
    }),
});
