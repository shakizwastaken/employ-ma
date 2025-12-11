import { z } from "zod";

// Enum types from schema
export const formalEducationLevelEnum = z.enum([
  "bachelor",
  "master",
  "doctorate",
  "postdoctoral",
  "none",
  "other",
]);

export const currentJobStatusEnum = z.enum([
  "employed",
  "unemployed",
  "self_employed",
  "retired",
  "student",
  "other",
]);

export const availabilityEnum = z.enum(["full_time", "part_time", "freelance"]);

export const skillLevelEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const languageProficiencyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "native",
]);

export const socialPlatformEnum = z.enum([
  "linkedin",
  "github",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
]);

// Step 1: User Identity
export const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

// Step 2: Professional Baseline
export const step2Schema = z.object({
  highestFormalEducationLevel: formalEducationLevelEnum,
  currentJobStatus: currentJobStatusEnum,
  category: z.string().min(1, "Category is required"),
});

// Step 3: Personal Profile
export const step3Schema = z.object({
  countryOfResidence: z.string().length(2, "Country of residence is required"), // ISO 3166-1 alpha-2 code
  timeZone: z.string().min(1, "Time zone is required"),
  countryOfOrigin: z.string().length(2).optional(),
  city: z.string().optional(),
  birthYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
});

// Step 4: Language Proficiency
export const languageSchema = z.object({
  name: z.string(),
  proficiency: languageProficiencyEnum,
});

export const step4Schema = z.object({
  languages: z
    .array(languageSchema)
    .min(1, "At least English must be provided")
    .refine(
      (languages) =>
        languages.some((lang) => lang.name.toLowerCase() === "english"),
      {
        message: "English language is required",
      },
    )
    .refine(
      (languages) => {
        const english = languages.find(
          (lang) => lang.name.toLowerCase() === "english",
        );
        return english !== undefined;
      },
      {
        message: "English proficiency must be selected",
      },
    )
    .refine(
      (languages) => {
        return languages.every(
          (lang) =>
            lang.name.trim() === "" ||
            (lang.name.trim() !== "" && lang.proficiency !== undefined),
        );
      },
      {
        message: "Proficiency is required if language name is provided",
      },
    ),
});

// Step 5: Social Profiles
export const socialProfileSchema = z.object({
  platform: socialPlatformEnum,
  url: z.string().url("Please enter a valid URL"),
});

export const step5Schema = z
  .object({
    linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
    socialProfiles: z.array(socialProfileSchema).default([]),
  })
  .refine(
    (data) => {
      const platforms = data.socialProfiles.map((sp) => sp.platform);
      return new Set(platforms).size === platforms.length;
    },
    {
      message: "No duplicate platforms allowed",
      path: ["socialProfiles"],
    },
  );

// Step 6: Availability & Compensation
export const step6Schema = z
  .object({
    availability: availabilityEnum,
    availableIn: z.number().int().min(0).optional(),
    hoursPerWeek: z.number().int().min(1).max(80).optional(),
    availableFrom: z.date().optional(),
    expectedSalary: z
      .number()
      .min(0, "Salary must be positive")
      .multipleOf(0.01),
  })
  .refine(
    (data) => {
      if (data.availability === "full_time") {
        return data.availableIn !== undefined;
      }
      return true;
    },
    {
      message: "Available in days is required for full-time availability",
      path: ["availableIn"],
    },
  )
  .refine(
    (data) => {
      if (data.availability !== "full_time") {
        return data.hoursPerWeek !== undefined;
      }
      return true;
    },
    {
      message: "Hours per week is required for part-time or freelance",
      path: ["hoursPerWeek"],
    },
  );

// Step 7: Skills
export const skillSchema = z
  .object({
    name: z.string().min(1, "Skill name is required"),
    tags: z.array(z.string()).default([]),
    level: skillLevelEnum,
    totalExperience: z.number().int().min(0).optional(),
    startYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional(),
    institution: z.string().optional(),
    selfTaught: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startYear !== undefined) {
        return data.startYear <= new Date().getFullYear();
      }
      return true;
    },
    {
      message: "Start year must be less than or equal to current year",
      path: ["startYear"],
    },
  );

export const step7Schema = z
  .object({
    skills: z.array(skillSchema).default([]),
  })
  .refine(
    (data) => {
      const names = data.skills.map((s) => s.name.toLowerCase());
      return new Set(names).size === names.length;
    },
    {
      message: "No duplicate skill names allowed",
      path: ["skills"],
    },
  );

// Step 8: Work Experience
export const experienceSchema = z
  .object({
    company: z.string().optional(),
    position: z.string().optional(),
    description: z.string().optional(),
    startYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional(),
    endYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .optional(),
    isCurrent: z.boolean().default(false),
    links: z.array(z.string().url()).default([]),
    achievements: z.array(z.string()).default([]),
    categoryIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => {
      if (data.isCurrent) {
        return data.endYear === undefined;
      }
      return true;
    },
    {
      message: "End year must be empty if this is a current position",
      path: ["endYear"],
    },
  )
  .refine(
    (data) => {
      if (data.endYear !== undefined && data.startYear !== undefined) {
        return data.endYear >= data.startYear;
      }
      return true;
    },
    {
      message: "End year must be greater than or equal to start year",
      path: ["endYear"],
    },
  )
  .refine(
    (data) => {
      if (!data.isCurrent && data.endYear === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "End year is required if this is not a current position",
      path: ["endYear"],
    },
  )
  .refine(
    (data) => {
      return (
        (data.company !== undefined && data.company.trim() !== "") ||
        (data.position !== undefined && data.position.trim() !== "") ||
        (data.description !== undefined && data.description.trim() !== "")
      );
    },
    {
      message: "At least one of company, position, or description is required",
    },
  );

export const step8Schema = z.object({
  experiences: z.array(experienceSchema).default([]),
});

// Step 9: Resume & Video
export const step9Schema = z.object({
  resumeUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

// Step 10: Final Notes
export const step10Schema = z.object({
  notes: z.string().optional(),
});

// Combined form schema for submission
export const applicationFormSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema)
  .and(step5Schema)
  .and(step6Schema)
  .and(step7Schema)
  .and(step8Schema)
  .and(step9Schema)
  .and(step10Schema)
  .refine(
    (data) => {
      if (data.availability === "full_time") {
        return data.availableIn !== undefined;
      }
      return true;
    },
    {
      message: "Available in days is required for full-time availability",
      path: ["availableIn"],
    },
  )
  .refine(
    (data) => {
      if (data.availability !== "full_time") {
        return data.hoursPerWeek !== undefined;
      }
      return true;
    },
    {
      message: "Hours per week is required for part-time or freelance",
      path: ["hoursPerWeek"],
    },
  );

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;
export type Step9Data = z.infer<typeof step9Schema>;
export type Step10Data = z.infer<typeof step10Schema>;
export type LanguageData = z.infer<typeof languageSchema>;
export type SocialProfileData = z.infer<typeof socialProfileSchema>;
export type SkillData = z.infer<typeof skillSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
