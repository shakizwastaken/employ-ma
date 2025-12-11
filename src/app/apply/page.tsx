import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";

interface ApplyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : undefined;

  return (
    <div className="bg-background min-h-screen pb-20 sm:pb-0">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen p-4">Loading...</div>}>
        <ApplicationForm initialEmail={email} />
      </Suspense>
    </div>
  );
}
