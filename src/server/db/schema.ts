import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at")
  .$defaultFn(() => /*@__PURE__*/ new Date())
  .notNull();
const updatedAt = timestamp("updated_at")
  .$onUpdate(() => /*@__PURE__*/ new Date())
  .notNull();

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

// Applicant tables
export const applicant = pgTable("applicant", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  currentJobStatus: text("current_job_status").notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  highestEducationLevel: text("highest_education_level").notNull(),
  skills: text("skills"),
  availability: text("availability").notNull(), // "full-time" or "part-time"
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

  createdAt,
  updatedAt,
});

export const role = pgTable("role", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active")
    .$defaultFn(() => true)
    .notNull(),

  createdAt,
  updatedAt,
});

export const applicantRole = pgTable(
  "applicant_role",
  {
    id: text("id").primaryKey(),
    applicantId: text("applicant_id")
      .notNull()
      .references(() => applicant.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueApplicantRole: unique().on(table.applicantId, table.roleId),
  }),
);

export const questionTemplate = pgTable("question_template", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // "text", "textarea", "select", "radio", "checkbox", "file"
  options: text("options"), // JSON string for select/radio/checkbox options
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
    id: text("id").primaryKey(),
    applicantId: text("applicant_id")
      .notNull()
      .references(() => applicant.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => questionTemplate.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(), // denormalized for easier querying
    answer: text("answer").notNull(), // can be JSON for complex answers

    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueApplicantTemplate: unique().on(table.applicantId, table.templateId),
  }),
);

export const applicantLanguage = pgTable("applicant_language", {
  id: text("id").primaryKey(),
  applicantId: text("applicant_id")
    .notNull()
    .references(() => applicant.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  level: text("level").notNull(), // "native", "fluent", "intermediate", "basic"

  createdAt,
  updatedAt,
});

// Applicant relations
export const applicantRelations = relations(applicant, ({ many, one }) => ({
  roles: many(applicantRole),
  pathAnswers: many(pathAnswer),
  languages: many(applicantLanguage),
  user: one(user, { fields: [applicant.userId], references: [user.id] }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  applicants: many(applicantRole),
  questionTemplates: many(questionTemplate),
}));

export const applicantRoleRelations = relations(applicantRole, ({ one }) => ({
  applicant: one(applicant, {
    fields: [applicantRole.applicantId],
    references: [applicant.id],
  }),
  role: one(role, {
    fields: [applicantRole.roleId],
    references: [role.id],
  }),
}));

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
  applicant: one(applicant, {
    fields: [pathAnswer.applicantId],
    references: [applicant.id],
  }),
  template: one(questionTemplate, {
    fields: [pathAnswer.templateId],
    references: [questionTemplate.id],
  }),
}));

export const applicantLanguageRelations = relations(
  applicantLanguage,
  ({ one }) => ({
    applicant: one(applicant, {
      fields: [applicantLanguage.applicantId],
      references: [applicant.id],
    }),
  }),
);
