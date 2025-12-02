import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
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
  templates: many(template),
  account: many(account),
  session: many(session),
  members: many(member),
  invitations: many(invitation),
}));

export const template = pgTable("template", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  name: text("name").notNull(),

  description: text("description"),
  content: text("content").notNull(),

  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const templatePage = pgTable("template_page", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  templateId: uuid("template_id")
    .notNull()
    .references(() => template.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  content: text("content").notNull(),

  createdAt,
  updatedAt,
});

export const templateSection = pgTable("template_section", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),

  name: text("name").notNull(),
  description: text("description"),
  pageId: uuid("page_id")
    .notNull()
    .references(() => templatePage.id, { onDelete: "cascade" }),

  createdAt,
  updatedAt,
});

export const templatePageRelations = relations(templatePage, ({ one }) => ({
  template: one(template, {
    fields: [templatePage.templateId],
    references: [template.id],
  }),
}));

export const templateSectionRelations = relations(
  templateSection,
  ({ one }) => ({
    page: one(templatePage, {
      fields: [templateSection.pageId],
      references: [templatePage.id],
    }),
  }),
);

export const templateRelations = relations(template, ({ one, many }) => ({
  pages: many(templatePage),
  user: one(user, { fields: [template.userId], references: [user.id] }),
}));
