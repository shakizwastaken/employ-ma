"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { ApplicationDetail } from "@/app/admin/_components/application-detail";

export function ApplicationDetailPageClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <ApplicationDetail
      applicationId={id}
      onBack={() => router.push("/admin")}
    />
  );
}

