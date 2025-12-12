"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import openJobsData from "@/lib/open-jobs.json";

export function HomeClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const openJobs = openJobsData;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Navigate to application form with email as query param
    router.push(`/apply?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="from-background to-muted flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-4 sm:p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-12">
          <div className="mx-auto max-w-xl space-y-6 text-center sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Find your perfect remote job
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
                Join talented professionals working remotely from anywhere in
                the world.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="sr-only">
                    Email address
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="h-12 text-base"
                    aria-invalid={!!error}
                  />
                  {error && <FieldError>{error}</FieldError>}
                </Field>
                <Button type="submit" size="lg" className="w-full">
                  Start Application
                </Button>
              </FieldGroup>
            </form>
          </div>
          <CardFooter>
            <CardDescription className="text-center">
              Need help? Contact us at <strong>yahya@drip.ma</strong>
            </CardDescription>
          </CardFooter>
        </CardContent>
      </Card>

      {openJobs.length > 0 && (
        <div className="mt-8 w-full max-w-4xl space-y-4 px-4 sm:mt-12 sm:space-y-6 md:mt-16">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-green-500 opacity-75 sm:h-3 sm:w-3"></div>
              <div className="relative h-2.5 w-2.5 rounded-full bg-green-500 sm:h-3 sm:w-3"></div>
            </div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Live open remote jobs
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {openJobs.map((job) => (
              <JobCard
                key={job.id}
                title={job.name}
                description={job.description}
                requirements={job.requirements}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({
  title,
  description,
  requirements,
}: {
  title: string;
  description: string;
  requirements: string[];
}) {
  return (
    <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md active:scale-[0.98] sm:p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <h3 className="text-card-foreground text-base leading-tight font-semibold sm:text-lg">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed sm:text-sm">
              {description}
            </p>
          </div>
          <Link
            href="/apply"
            className="text-primary hover:text-primary/80 active:text-primary/70 flex min-h-[44px] shrink-0 items-center justify-center gap-1 text-sm font-medium transition-colors sm:min-h-0 sm:justify-start"
          >
            apply{" "}
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        <div className="border-border flex flex-wrap gap-1.5 border-t pt-2.5 sm:gap-2 sm:pt-3">
          {requirements.map((req, index) => (
            <span
              key={index}
              className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium sm:text-xs"
            >
              {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
