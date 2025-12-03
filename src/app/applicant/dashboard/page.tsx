"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export default function ApplicantDashboardPage() {
  const { data, isLoading, error } = api.applicant.getMyApplication.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">
              {error?.message || "Failed to load application"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { applicant, roles, languages, pathAnswers } = data;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>My Application</CardTitle>
          <CardDescription>
            View your submitted application details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <p className="text-sm">{applicant.fullName}</p>
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <p className="text-sm">{applicant.email}</p>
                    {applicant.emailVerified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <p className="text-sm">{applicant.phone}</p>
                  </Field>
                  <Field>
                    <FieldLabel>City</FieldLabel>
                    <p className="text-sm">{applicant.city}</p>
                  </Field>
                  <Field>
                    <FieldLabel>Current Job Status</FieldLabel>
                    <p className="text-sm capitalize">
                      {applicant.currentJobStatus}
                    </p>
                  </Field>
                  <Field>
                    <FieldLabel>Years of Experience</FieldLabel>
                    <p className="text-sm">{applicant.yearsOfExperience}</p>
                  </Field>
                  <Field>
                    <FieldLabel>Highest Education Level</FieldLabel>
                    <p className="text-sm capitalize">
                      {applicant.highestEducationLevel.replace("-", " ")}
                    </p>
                  </Field>
                  <Field>
                    <FieldLabel>Availability</FieldLabel>
                    <p className="text-sm capitalize">
                      {applicant.availability === "full-time"
                        ? "Full-time (80+ hours/week)"
                        : "Part-time (40+ hours/week)"}
                    </p>
                  </Field>
                  {applicant.skills && (
                    <Field className="md:col-span-2">
                      <FieldLabel>Skills</FieldLabel>
                      <p className="text-sm">{applicant.skills}</p>
                    </Field>
                  )}
                </div>
              </div>

              {languages.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Languages & Levels
                    </h3>
                    <div className="space-y-2">
                      {languages.map((lang) => (
                        <div key={lang.id} className="flex gap-4">
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-muted-foreground capitalize">
                            {lang.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {roles.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Role(s) of Interest
                    </h3>
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <div key={role.id}>
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <p className="text-sm text-muted-foreground">
                              {role.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {pathAnswers.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Path-Specific Answers
                    </h3>
                    <div className="space-y-4">
                      {pathAnswers.map((answer) => (
                        <div key={answer.id}>
                          <FieldLabel className="font-medium">
                            {answer.question?.questionText}
                          </FieldLabel>
                          <p className="text-sm mt-1">{answer.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}

