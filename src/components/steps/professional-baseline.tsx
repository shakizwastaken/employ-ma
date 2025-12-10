"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";

const educationLevels = [
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" },
  { value: "postdoctoral", label: "Postdoctoral" },
  { value: "none", label: "None" },
  { value: "other", label: "Other" },
];

const jobStatuses = [
  { value: "employed", label: "Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
];

export function Step2ProfessionalBaseline() {
  const { control } = useFormContext<ApplicationFormData>();

  const { data: categories } = api.application.getCategories.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Professional Baseline</h2>
        <p className="text-muted-foreground">
          Tell us about your professional background
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="highestFormalEducationLevel"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="highestFormalEducationLevel">
                Highest Formal Education Level{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="highestFormalEducationLevel">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="currentJobStatus"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="currentJobStatus">
                Current Job Status <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="currentJobStatus">
                  <SelectValue placeholder="Select job status" />
                </SelectTrigger>
                <SelectContent>
                  {jobStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="categoryId">
                Category <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
