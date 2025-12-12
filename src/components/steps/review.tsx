"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import type { ApplicationFormData } from "@/server/api/validators/application";
import { getAllCountries } from "@/lib/form-utils";

interface Step10ReviewProps {
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function Step10Review({
  onEditStep,
  onSubmit,
  isSubmitting,
}: Step10ReviewProps) {
  const { getValues } = useFormContext<ApplicationFormData>();
  const countries = useMemo(() => getAllCountries(), []);

  // Use getValues() for non-reactive read
  const formData = getValues();

  const getCountryName = (code?: string) => {
    if (!code) return "Not provided";
    return (
      countries.find((c: { name: string; code: string }) => c.code === code)
        ?.name ?? code
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">Review & Submit</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Review your information before submitting
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 1: User Identity
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(1)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            <p>
              <strong>Name:</strong> {String(formData.firstName)}{" "}
              {String(formData.lastName)}
            </p>
            <p>
              <strong>Email:</strong> {String(formData.email)}
            </p>
            <p>
              <strong>Phone:</strong> {String(formData.phoneNumber)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 2: Professional Baseline
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(2)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            <p>
              <strong>Education:</strong>{" "}
              {String(formData.highestFormalEducationLevel)}
            </p>
            <p>
              <strong>Job Status:</strong> {String(formData.currentJobStatus)}
            </p>
            <p>
              <strong>Specialization:</strong>{" "}
              {formData.category || "Not provided"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 3: Personal Profile
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(3)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            <p>
              <strong>Residence:</strong>{" "}
              {getCountryName(formData.countryOfResidence)}
            </p>
            <p>
              <strong>Origin:</strong>{" "}
              {formData.countryOfOrigin
                ? getCountryName(formData.countryOfOrigin)
                : "Not provided"}
            </p>
            <p>
              <strong>Time Zone:</strong> {String(formData.timeZone)}
            </p>
            {formData.city ? (
              <p>
                <strong>City:</strong> {String(formData.city)}
              </p>
            ) : null}
            {formData.birthYear ? (
              <p>
                <strong>Birth Year:</strong> {String(formData.birthYear)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 4: Languages (
                {formData.languages && Array.isArray(formData.languages)
                  ? formData.languages.length
                  : 0}
                )
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(4)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            {formData.languages &&
            Array.isArray(formData.languages) &&
            formData.languages.length > 0
              ? formData.languages.map(
                  (lang: { name: string; proficiency: string }, i: number) => (
                    <p key={i}>
                      <strong>{String(lang.name)}:</strong>{" "}
                      {String(lang.proficiency)}
                    </p>
                  ),
                )
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 5: Social Profiles
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(5)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            <p>
              <strong>LinkedIn:</strong>{" "}
              {formData.linkedinUrl && formData.linkedinUrl.trim() !== ""
                ? String(formData.linkedinUrl)
                : "Not provided"}
            </p>
            {Array.isArray(formData.socialProfiles) &&
            formData.socialProfiles.length > 0
              ? formData.socialProfiles.map(
                  (profile: { platform: string; url: string }, i: number) => (
                    <p key={i}>
                      <strong>{String(profile.platform)}:</strong>{" "}
                      {String(profile.url)}
                    </p>
                  ),
                )
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 6: Availability & Compensation
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(6)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            <p>
              <strong>Availability:</strong> {String(formData.availability)}
            </p>
            {formData.availability === "full_time" ? (
              <p>
                <strong>Available In:</strong>{" "}
                {String(formData.availableIn ?? 0)} days
              </p>
            ) : (
              <p>
                <strong>Hours/Week:</strong>{" "}
                {String(formData.hoursPerWeek ?? 0)}
              </p>
            )}
            <p>
              <strong>Expected Salary:</strong> $
              {String(formData.expectedSalary)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 7: Skills (
                {formData.skills && Array.isArray(formData.skills)
                  ? formData.skills.length
                  : 0}
                )
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(7)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            {Array.isArray(formData.skills) && formData.skills.length > 0
              ? formData.skills.map(
                  (skill: { name: string; level: string }, i: number) => (
                    <p key={i}>
                      <strong>{String(skill.name)}:</strong>{" "}
                      {String(skill.level)}
                    </p>
                  ),
                )
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 8: Work Experience (
                {formData.experiences && Array.isArray(formData.experiences)
                  ? formData.experiences.length
                  : 0}
                )
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(8)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            {Array.isArray(formData.experiences) &&
            formData.experiences.length > 0
              ? formData.experiences.map(
                  (
                    exp: {
                      position?: string;
                      company?: string;
                      startYear?: number;
                      endYear?: number;
                      isCurrent?: boolean;
                    },
                    i: number,
                  ) => (
                    <div key={i} className="mt-2 border-t pt-2">
                      <p>
                        <strong>
                          {exp.position ? String(exp.position) : ""}{" "}
                          {exp.company ? `at ${String(exp.company)}` : ""}
                        </strong>
                      </p>
                      {exp.startYear ? (
                        <p>
                          {String(exp.startYear)} -{" "}
                          {exp.isCurrent
                            ? "Present"
                            : exp.endYear
                              ? String(exp.endYear)
                              : ""}
                        </p>
                      ) : null}
                    </div>
                  ),
                )
              : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
              <CardTitle className="text-base sm:text-lg">
                Step 9: Resume & Video
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(9)}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-4 text-xs sm:px-6 sm:pb-6 sm:text-sm">
            {formData.resumeUrl ? (
              <p>
                <strong>Resume:</strong> {String(formData.resumeUrl)}
              </p>
            ) : null}
            {formData.videoUrl ? (
              <p>
                <strong>Video:</strong> {String(formData.videoUrl)}
              </p>
            ) : null}
            {formData.notes ? (
              <p>
                <strong>Additional Notes:</strong> {String(formData.notes)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
