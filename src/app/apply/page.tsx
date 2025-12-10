import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";

interface ApplyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : undefined;

  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <ApplicationForm initialEmail={email} />
      </Suspense>
    </div>
  );
}
