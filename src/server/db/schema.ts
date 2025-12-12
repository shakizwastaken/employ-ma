import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at")
  .$defaultFn(() => /*@__PURE__*/ new Date())
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at")
  .$onUpdate(() => /*@__PURE__*/ new Date())
  .notNull()
  .defaultNow();

export const user = pgTable("user", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),

  createdAt,
  updatedAt,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),

  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),

  createdAt,
  updatedAt,
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),

  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),

  createdAt,
  updatedAt,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),

  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt,
  updatedAt,
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),

  createdAt,
  updatedAt,
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),

  createdAt,
  updatedAt,
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),

  email: text("email").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt,
  updatedAt,
});

export const jobStatus = pgEnum("current_job_status", [
  "employed",
  "unemployed",
  "self_employed",
  "retired",
  "student",
  "other",
]);

export const formalEducationLevel = pgEnum("formal_education_level", [
  "bachelor",
  "master",
  "doctorate",
  "postdoctoral",
  "none",
  "other",
]);

export const availability = pgEnum("availability", [
  "full_time",
  "part_time",
  "freelance",
]);

export const skillLevel = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const application = pgTable(
  "application",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phoneNumber: text("phone_number"),

    birthYear: integer("birth_year"),

    countryOfOrigin: text("country_of_origin"), // ISO 3166-1 alpha-2 code (e.g., "US", "MA")
    countryOfResidence: text("country_of_residence").notNull(), // ISO 3166-1 alpha-2 code
    timeZone: text("time_zone"), // IANA timezone name (e.g., "America/New_York")
    city: text("city"),

    currentJobStatus: jobStatus("current_job_status"),
    highestFormalEducationLevel: formalEducationLevel(
      "highest_formal_education_level",
    ),

    availability: availability("availability"),
    hoursPerWeek: integer("hours_per_week"),
    availableFrom: date("available_from"),

    resumeUrl: text("resume_url"),
    videoUrl: text("video_url"),

    expectedSalary: numeric("expected_salary", {
      mode: "number",
      precision: 10,
      scale: 2,
    }), // in USD

    status: text("status").default("active"),
    archivedAt: timestamp("archived_at"),

    source: text("source"),
    notes: text("notes"),

    category: text("category").notNull(),

    tags: text("tags").array().default([]),

    availableIn: integer("available_in").default(0),

    isPublic: boolean("is_public").default(false).notNull(),
    publicToken: text("public_token").unique(),

    createdAt,
    updatedAt,
  },
  (table) => ({
    emailIdx: index("application_email_idx").on(table.email),
    publicTokenIdx: index("application_public_token_idx").on(table.publicToken),
  }),
);

export const tagSuggestion = pgTable("tag_suggestion", {
  id: uuid("id").primaryKey().defaultRandom(),

  value: text("value").notNull(),

  createdAt,
  updatedAt,
});

export const languageProficiency = pgEnum("language_proficiency", [
  "beginner",
  "intermediate",
  "advanced",
  "native",
]);

export const language = pgTable("language", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  proficiency: languageProficiency("proficiency").notNull(),

  createdAt,
  updatedAt,
});

export const socialPlatform = pgEnum("social_platform", [
  "linkedin",
  "github",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
]);

export const social = pgTable("social", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),
  platform: socialPlatform("platform").notNull(),
  url: text("url").notNull(),

  createdAt,
  updatedAt,
});

export const skill = pgTable("skill", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),

  institution: text("institution"),
  selfTaught: boolean("self_taught"),

  level: skillLevel("level"),
  totalExperience: integer("total_experience"),
  startYear: integer("start_year"),

  tags: text("tags").array().default([]),

  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const experience = pgTable("experience", {
  id: uuid("id").primaryKey().defaultRandom(),

  company: text("company"),
  position: text("position"),
  description: text("description"),

  startYear: integer("start_year"),
  endYear: integer("end_year"),

  links: text("links").array().default([]),
  achievements: text("achievements").array().default([]),
  categories: text("categories").array().default([]),
  isCurrent: boolean("is_current").default(false).notNull(),

  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const skillExperience = pgTable("skill_experience", {
  id: uuid("id").primaryKey().defaultRandom(),

  skillId: uuid("skill_id")
    .notNull()
    .references(() => skill.id, { onDelete: "cascade" }),
  experienceId: uuid("experience_id")
    .notNull()
    .references(() => experience.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const applicationRelations = relations(application, ({ many }) => ({
  skills: many(skill),
  experiences: many(experience),
  socials: many(social),
  languages: many(language),
}));

export const languageRelations = relations(language, ({ one }) => ({
  application: one(application, {
    fields: [language.applicationId],
    references: [application.id],
  }),
}));

export const skillRelations = relations(skill, ({ one, many }) => ({
  application: one(application, {
    fields: [skill.applicationId],
    references: [application.id],
  }),
  experiences: many(skillExperience),
}));

export const experienceRelations = relations(experience, ({ one, many }) => ({
  application: one(application, {
    fields: [experience.applicationId],
    references: [application.id],
  }),
  skills: many(skillExperience),
}));

export const skillExperienceRelations = relations(
  skillExperience,
  ({ one }) => ({
    skill: one(skill, {
      fields: [skillExperience.skillId],
      references: [skill.id],
    }),
    experience: one(experience, {
      fields: [skillExperience.experienceId],
      references: [experience.id],
    }),
    application: one(application, {
      fields: [skillExperience.applicationId],
      references: [application.id],
    }),
  }),
);

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, { fields: [member.userId], references: [user.id] }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  inviter: one(user, { fields: [invitation.inviterId], references: [user.id] }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  members: many(member),
  invitations: many(invitation),
}));
