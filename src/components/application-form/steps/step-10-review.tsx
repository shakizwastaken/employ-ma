"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";

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
  const { getValues, control } = useFormContext<ApplicationFormData>();
  const { data: countries } = api.application.getCountries.useQuery();
  const { data: categories } = api.application.getCategories.useQuery();

  // Use getValues() for non-reactive read
  const formData = getValues() as ApplicationFormData;

  const getCountryName = (id?: string) => {
    if (!id) return "Not provided";
    return countries?.find((c) => c.id === id)?.name ?? "Unknown";
  };

  const getCategoryName = (id?: string) => {
    if (!id) return "Not provided";
    return categories?.find((c) => c.id === id)?.name ?? "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Review & Submit</h2>
        <p className="text-muted-foreground">
          Review your information and add any final notes
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="notes">
                Additional Notes (Optional)
              </FieldLabel>
              <Textarea
                {...field}
                id="notes"
                placeholder="Any additional information you'd like to share..."
                rows={4}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 1: User Identity</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(1)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 2: Professional Baseline</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(2)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <strong>Education:</strong>{" "}
              {String(formData.highestFormalEducationLevel)}
            </p>
            <p>
              <strong>Job Status:</strong> {String(formData.currentJobStatus)}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {getCategoryName(String(formData.categoryId))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 3: Personal Profile</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(3)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <strong>Residence:</strong>{" "}
              {getCountryName(String(formData.countryOfResidence))}
            </p>
            <p>
              <strong>Origin:</strong>{" "}
              {formData.countryOfOrigin
                ? getCountryName(String(formData.countryOfOrigin))
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
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
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 5: Social Profiles</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(5)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <strong>LinkedIn:</strong> {String(formData.linkedinUrl)}
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 6: Availability & Compensation</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(6)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
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
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
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
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step 9: Resume & Video</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(9)}
              >
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
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
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
