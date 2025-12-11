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
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g., name@example.com)"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be less than 20 characters"),
});

// Step 2: Professional Baseline
export const step2Schema = z.object({
  highestFormalEducationLevel: formalEducationLevelEnum,
  currentJobStatus: currentJobStatusEnum,
  category: z
    .string()
    .min(1, "Please select or enter your specialization")
    .max(200, "Specialization must be less than 200 characters"),
});

// Step 3: Personal Profile
export const step3Schema = z.object({
  countryOfResidence: z
    .string()
    .length(2, "Please select your country of residence"), // ISO 3166-1 alpha-2 code
  timeZone: z.string().min(1, "Please select your time zone"),
  countryOfOrigin: z
    .string()
    .length(2, "Country code must be 2 characters")
    .optional(),
  city: z
    .string()
    .max(100, "City name must be less than 100 characters")
    .optional(),
  birthYear: z
    .number()
    .int()
    .min(1900, "Birth year must be 1900 or later")
    .max(new Date().getFullYear(), `Birth year cannot be in the future`)
    .optional(),
});

// Step 4: Language Proficiency
export const languageSchema = z.object({
  name: z
    .string()
    .min(1, "Language name is required")
    .max(50, "Language name must be less than 50 characters"),
  proficiency: languageProficiencyEnum,
});

export const step4Schema = z.object({
  languages: z
    .array(languageSchema)
    .min(1, "Please add at least one language")
    .refine(
      (languages) =>
        languages.some((lang) => lang.name.toLowerCase() === "english"),
      {
        message: "English is required. Please add English to your languages.",
      },
    )
    .refine(
      (languages) => {
        const english = languages.find(
          (lang) => lang.name.toLowerCase() === "english",
        );
        return english?.proficiency !== undefined;
      },
      {
        message: "Please select your English proficiency level",
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
        message: "Please select a proficiency level for all languages",
      },
    ),
});

// Step 5: Social Profiles
export const socialProfileSchema = z.object({
  platform: socialPlatformEnum,
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL (e.g., https://example.com)"),
});

export const step5Schema = z
  .object({
    linkedinUrl: z
      .string()
      .min(1, "LinkedIn URL is required")
      .url(
        "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/yourprofile)",
      ),
    socialProfiles: z.array(socialProfileSchema).default([]),
  })
  .refine(
    (data) => {
      const platforms = data.socialProfiles.map((sp) => sp.platform);
      return new Set(platforms).size === platforms.length;
    },
    {
      message:
        "You cannot add the same platform twice. Please remove the duplicate.",
      path: ["socialProfiles"],
    },
  );

// Step 6: Availability & Compensation
export const step6Schema = z
  .object({
    availability: availabilityEnum,
    availableIn: z
      .number()
      .int()
      .min(0, "Available days must be 0 or greater")
      .max(365, "Available days cannot exceed 365")
      .optional(),
    hoursPerWeek: z
      .number()
      .int()
      .min(1, "Hours per week must be at least 1")
      .max(80, "Hours per week cannot exceed 80")
      .optional(),
    availableFrom: z.date().optional(),
    expectedSalary: z
      .number()
      .min(0, "Expected salary must be 0 or greater")
      .max(10000000, "Expected salary cannot exceed $10,000,000")
      .multipleOf(0.01, "Salary must have at most 2 decimal places"),
  })
  .refine(
    (data) => {
      if (data.availability === "full_time") {
        return data.availableIn !== undefined;
      }
      return true;
    },
    {
      message:
        "Please specify how many days until you're available for full-time work",
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
      message: "Please specify how many hours per week you're available",
      path: ["hoursPerWeek"],
    },
  );

// Step 7: Skills
export const skillSchema = z
  .object({
    name: z
      .string()
      .min(1, "Skill name is required")
      .max(100, "Skill name must be less than 100 characters"),
    tags: z.array(z.string()).default([]),
    level: skillLevelEnum,
    totalExperience: z
      .number()
      .int()
      .min(0, "Total experience must be 0 or greater")
      .max(100, "Total experience cannot exceed 100 years")
      .optional(),
    startYear: z
      .number()
      .int()
      .min(1900, "Start year must be 1900 or later")
      .max(new Date().getFullYear(), `Start year cannot be in the future`)
      .optional(),
    institution: z
      .string()
      .max(200, "Institution name must be less than 200 characters")
      .optional(),
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
      message: "Start year cannot be in the future",
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
      message:
        "You cannot add the same skill twice. Please remove the duplicate.",
      path: ["skills"],
    },
  );

// Step 8: Work Experience
export const experienceSchema = z
  .object({
    company: z
      .string()
      .max(200, "Company name must be less than 200 characters")
      .optional(),
    position: z
      .string()
      .max(200, "Position title must be less than 200 characters")
      .optional(),
    description: z
      .string()
      .max(5000, "Description must be less than 5000 characters")
      .optional(),
    startYear: z
      .number()
      .int()
      .min(1900, "Start year must be 1900 or later")
      .max(new Date().getFullYear(), `Start year cannot be in the future`)
      .optional(),
    endYear: z
      .number()
      .int()
      .min(1900, "End year must be 1900 or later")
      .max(new Date().getFullYear(), `End year cannot be in the future`)
      .optional(),
    isCurrent: z.boolean().default(false),
    links: z.array(z.string()).default([]),
    achievements: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.isCurrent) {
        return data.endYear === undefined;
      }
      return true;
    },
    {
      message: "End year should be empty for current positions",
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
      message: "End year must be the same as or after the start year",
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
      message:
        "Please provide an end year for past positions, or mark this as your current position",
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
      message:
        "Please provide at least a company name, position title, or description",
    },
  );

export const step8Schema = z.object({
  experiences: z.array(experienceSchema).default([]),
});

// Step 9: Resume & Video
export const step9Schema = z.object({
  resumeUrl: z
    .string()
    .url(
      "Please enter a valid resume URL (e.g., https://example.com/resume.pdf)",
    )
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url(
      "Please enter a valid video URL (e.g., https://youtube.com/watch?v=...)",
    )
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(5000, "Additional notes must be less than 5000 characters")
    .optional(),
});

// Step 10: Review (no additional fields)
export const step10Schema = z.object({});

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
      message:
        "Please specify how many days until you're available for full-time work",
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
      message: "Please specify how many hours per week you're available",
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
