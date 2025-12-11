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
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="from-background to-muted flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-12 pb-12">
          <div className="mx-auto max-w-xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Find your perfect remote job
              </h1>
              <p className="text-muted-foreground text-xl">
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
        </CardContent>
      </Card>

      {openJobs.length > 0 && (
        <div className="mt-16 w-full max-w-4xl space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute h-3 w-3 animate-ping rounded-full bg-green-500 opacity-75"></div>
              <div className="relative h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <h2 className="text-2xl font-semibold">Live open remote jobs</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
    <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-card-foreground text-lg font-semibold">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>
          </div>
          <Link
            href="/apply"
            className="text-primary hover:text-primary/80 flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
          >
            apply{" "}
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        <div className="border-border flex flex-wrap gap-2 border-t pt-3">
          {requirements.map((req, index) => (
            <span
              key={index}
              className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
            >
              {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
