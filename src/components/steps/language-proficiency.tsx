"use client";

import React from "react";
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

const proficiencyLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native", label: "Native" },
];

export function Step4LanguageProficiency() {
  const { control, watch } = useFormContext<ApplicationFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });

  // Ensure English is always present
  const languages = watch("languages");
  const hasEnglish = languages?.some(
    (lang: { name: string; proficiency: string }) =>
      lang.name.toLowerCase() === "english",
  );

  // Add English on mount if not present - using useEffect to avoid render issues
  React.useEffect(() => {
    if (!hasEnglish && fields.length === 0) {
      append({ name: "English", proficiency: "intermediate" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = (index: number) => {
    const lang = fields[index];
    if (lang && typeof lang === "object" && "name" in lang) {
      // Don't allow removing English
      if (lang.name?.toLowerCase() === "english") {
        return;
      }
    }
    remove(index);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Language Proficiency</h2>
        <p className="text-muted-foreground">
          Tell us about the languages you speak
        </p>
      </div>

      <FieldGroup>
        {fields.map((field, index) => {
          const langName = watch(`languages.${index}.name`);
          const isEnglish = langName?.toLowerCase() === "english";

          return (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <Controller
                    name={`languages.${index}.name`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Language Name{" "}
                          {isEnglish && (
                            <span className="text-muted-foreground text-xs">
                              (Required)
                            </span>
                          )}
                        </FieldLabel>
                        <Input
                          {...controllerField}
                          disabled={isEnglish}
                          placeholder={isEnglish ? "English" : "e.g., Spanish"}
                          value={controllerField.value ?? ""}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`languages.${index}.proficiency`}
                    control={control}
                    render={({ field: controllerField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Proficiency Level{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                          value={controllerField.value ?? ""}
                          onValueChange={(value) => {
                            controllerField.onChange(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select proficiency" />
                          </SelectTrigger>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
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
                </div>

                {!isEnglish && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: "", proficiency: "beginner" })}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </FieldGroup>
    </div>
  );
}
