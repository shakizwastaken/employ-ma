"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import type { ApplicationFormData } from "@/server/api/validators/application";

const socialPlatforms = [
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

export function Step5SocialProfiles() {
  const { control, watch } = useFormContext<ApplicationFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialProfiles",
  });

  const socialProfiles = watch("socialProfiles");

  // Get used platforms
  const usedPlatforms =
    socialProfiles?.map(
      (sp: { platform: string; url: string }) => sp.platform,
    ) ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Social Profiles</h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          Share your professional social media profiles
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="linkedinUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="linkedinUrl">
                LinkedIn URL <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {fields.map((field, index) => {
          const platform = watch(`socialProfiles.${index}.platform`);
          const availablePlatforms = socialPlatforms.filter(
            (p) => !usedPlatforms.includes(p.value) || p.value === platform,
          );

          return (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <Controller
                    name={`socialProfiles.${index}.platform`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Platform</FieldLabel>
                        <Select
                          value={controllerField.value ?? ""}
                          onValueChange={(value) => {
                            controllerField.onChange(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlatforms.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`socialProfiles.${index}.url`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          URL{" "}
                          {platform && (
                            <span className="text-destructive">*</span>
                          )}
                        </FieldLabel>
                        <Input
                          {...controllerField}
                          type="url"
                          placeholder="https://..."
                          value={controllerField.value ?? ""}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ platform: "github", url: "" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Social Profile
        </Button>
      </FieldGroup>
    </div>
  );
}
