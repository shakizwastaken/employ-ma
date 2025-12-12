import { type Metadata } from "next";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";

export const metadata: Metadata = {
  title: "Apply for Remote Job",
  description:
    "Apply for remote job opportunities. Complete your application to join our team of talented professionals working remotely from anywhere in the world.",
  robots: {
    index: false,
    follow: true,
  },
};

interface ApplyPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : undefined;

  return (
    <div className="bg-background min-h-screen pb-20 sm:pb-0">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center p-4">
            Loading...
          </div>
        }
      >
        <ApplicationForm initialEmail={email} />
      </Suspense>
    </div>
  );
}
