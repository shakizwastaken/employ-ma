import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

const createdAt = timestamp("created_at").defaultNow().notNull();
const updatedAt = timestamp("updated_at")
  .defaultNow()
  .$onUpdate(() => /*@__PURE__*/ new Date())
  .notNull();

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"), // Added phone field
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),

  createdAt,
  updatedAt,
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),

  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: uuid("active_organization_id"),

  createdAt,
  updatedAt,
});

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),

  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
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
  id: uuid("id").primaryKey().defaultRandom(),

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
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),

  createdAt,
  updatedAt,
});

export const member = pgTable("member", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),

  createdAt,
  updatedAt,
});

export const invitation = pgTable("invitation", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  inviterId: uuid("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt,
  updatedAt,
});

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

export const userRelations = relations(user, ({ many, one }) => ({
  account: many(account),
  session: many(session),
  members: many(member),
  invitations: many(invitation),
  applications: many(application),
}));

// Application tables (renamed from applicant)
export const application = pgTable("application", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  city: text("city").notNull(),
  currentJobStatus: text("current_job_status").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  highestEducationLevel: text("highest_education_level").notNull(),
  availability: text("availability").notNull(), // "full-time" or "part-time"

  createdAt,
  updatedAt,
});

export const role = pgTable("role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active")
    .$defaultFn(() => true)
    .notNull(),

  createdAt,
  updatedAt,
});

export const applicationRole = pgTable(
  "application_role",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueApplicationRole: unique().on(table.applicationId, table.roleId),
  }),
);

export const questionTemplate = pgTable("question_template", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // "text", "textarea", "select", "radio", "checkbox", "file"
  options: text("options"), // JSON string for select/radio/checkbox options
  explanation: text("explanation"), // Optional explanation for why question is asked
  isRequired: boolean("is_required")
    .$defaultFn(() => true)
    .notNull(),
  order: integer("order").notNull(),

  createdAt,
  updatedAt,
});

export const pathAnswer = pgTable(
  "path_answer",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => questionTemplate.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull(), // denormalized for easier querying
    answer: text("answer").notNull(), // can be JSON for complex answers

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueApplicationTemplate: unique().on(
      table.applicationId,
      table.templateId,
    ),
  }),
);

export const applicationLanguage = pgTable("application_language", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  level: text("level").notNull(), // "native", "fluent", "intermediate", "basic"

  createdAt,
  updatedAt,
});

export const applicationSkill = pgTable("application_skill", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
  educationMethod: text("education_method").notNull(), // "self-taught", "high-school", "associate", "bachelor", "master", "phd", "bootcamp", "online-course", "certification", "work-experience"
  institution: text("institution"), // school/bootcamp/course name if applicable
  year: integer("year"), // year completed/learned

  createdAt,
  updatedAt,
});

export const applicationExperience = pgTable("application_experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null for current position
  description: text("description"),
  achievements: text("achievements"), // JSON array or text
  isCurrent: boolean("is_current")
    .$defaultFn(() => false)
    .notNull(),
  order: integer("order").notNull(), // for sorting

  createdAt,
  updatedAt,
});

export const experienceSkill = pgTable(
  "experience_skill",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => applicationExperience.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => applicationSkill.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueExperienceSkill: unique().on(table.experienceId, table.skillId),
  }),
);

// Application relations
export const applicationRelations = relations(application, ({ many, one }) => ({
  roles: many(applicationRole),
  pathAnswers: many(pathAnswer),
  languages: many(applicationLanguage),
  skills: many(applicationSkill),
  experiences: many(applicationExperience),
  user: one(user, { fields: [application.userId], references: [user.id] }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  applications: many(applicationRole),
  questionTemplates: many(questionTemplate),
}));

export const applicationRoleRelations = relations(
  applicationRole,
  ({ one }) => ({
    application: one(application, {
      fields: [applicationRole.applicationId],
      references: [application.id],
    }),
    role: one(role, {
      fields: [applicationRole.roleId],
      references: [role.id],
    }),
  }),
);

export const questionTemplateRelations = relations(
  questionTemplate,
  ({ one, many }) => ({
    role: one(role, {
      fields: [questionTemplate.roleId],
      references: [role.id],
    }),
    pathAnswers: many(pathAnswer),
  }),
);

export const pathAnswerRelations = relations(pathAnswer, ({ one }) => ({
  application: one(application, {
    fields: [pathAnswer.applicationId],
    references: [application.id],
  }),
  template: one(questionTemplate, {
    fields: [pathAnswer.templateId],
    references: [questionTemplate.id],
  }),
}));

export const applicationLanguageRelations = relations(
  applicationLanguage,
  ({ one }) => ({
    application: one(application, {
      fields: [applicationLanguage.applicationId],
      references: [application.id],
    }),
  }),
);

export const applicationSkillRelations = relations(
  applicationSkill,
  ({ one, many }) => ({
    application: one(application, {
      fields: [applicationSkill.applicationId],
      references: [application.id],
    }),
    experienceSkills: many(experienceSkill),
  }),
);

export const applicationExperienceRelations = relations(
  applicationExperience,
  ({ one, many }) => ({
    application: one(application, {
      fields: [applicationExperience.applicationId],
      references: [application.id],
    }),
    experienceSkills: many(experienceSkill),
  }),
);

export const experienceSkillRelations = relations(
  experienceSkill,
  ({ one }) => ({
    experience: one(applicationExperience, {
      fields: [experienceSkill.experienceId],
      references: [applicationExperience.id],
    }),
    skill: one(applicationSkill, {
      fields: [experienceSkill.skillId],
      references: [applicationSkill.id],
    }),
  }),
);
