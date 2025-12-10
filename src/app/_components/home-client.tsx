"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function HomeClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    <div className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-12 pb-12">
          <div className="mx-auto max-w-xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Get started with your application
              </h1>
              <p className="text-muted-foreground text-xl">
                We will help you land your dream remote job.
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
    </div>
  );
}
