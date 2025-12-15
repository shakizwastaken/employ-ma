import { type Metadata } from "next";
import { HydrateClient } from "@/trpc/server";
import { ApplicationDetailPageClient } from "./_components/application-detail-page-client";

export const metadata: Metadata = {
  title: "Application Details",
  description: "View application details",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <HydrateClient>
      <ApplicationDetailPageClient params={params} />
    </HydrateClient>
  );
}

