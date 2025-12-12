"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationFormData } from "@/server/api/validators/application";

const availabilityOptions = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "freelance", label: "Freelance" },
];

export function Step6Availability() {
  const { control, watch } = useFormContext<ApplicationFormData>();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Availability & Compensation</h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Tell us when you&apos;re available and your compensation expectations
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="availability"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="availability">
                Availability <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="hoursPerWeek"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="hoursPerWeek">
                Hours Per Week
              </FieldLabel>
              <Input
                {...field}
                id="hoursPerWeek"
                type="number"
                min={1}
                max={80}
                placeholder="e.g., 20"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(
                    value ? Number.parseInt(value, 10) : undefined,
                  );
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="expectedSalary"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="expectedSalary">
                Expected Monthly Rate (USD)
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="expectedSalary"
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g., 5000.00"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const num = parseFloat(value);
                  field.onChange(
                    isNaN(num) ? undefined : Math.round(num * 100) / 100,
                  );
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
