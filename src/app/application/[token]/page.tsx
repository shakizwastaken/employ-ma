import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { application, experience, language, skill, social } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { PublicApplicationView } from "./_components/public-application-view";

export const metadata: Metadata = {
  title: "Application",
  description: "View application details",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicApplicationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Get application by public token
  const [app] = await db
    .select()
    .from(application)
    .where(and(eq(application.publicToken, token), eq(application.isPublic, true)))
    .limit(1);

  if (!app) {
    notFound();
  }

  // Get related data
  const [languages, skills, experiences, socials] = await Promise.all([
    db
      .select()
      .from(language)
      .where(eq(language.applicationId, app.id)),
    db.select().from(skill).where(eq(skill.applicationId, app.id)),
    db
      .select()
      .from(experience)
      .where(eq(experience.applicationId, app.id)),
    db.select().from(social).where(eq(social.applicationId, app.id)),
  ]);

  const applicationData = {
    ...app,
    languages,
    skills,
    experiences,
    socials,
  };

  return <PublicApplicationView application={applicationData} />;
}

