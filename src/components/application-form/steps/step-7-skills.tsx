"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";

const skillLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

function SkillRow({
  field,
  index,
  control,
  watch,
  setValue,
  remove,
  tagSuggestions,
}: {
  field: { id: string };
  index: number;
  control: ReturnType<typeof useFormContext<ApplicationFormData>>["control"];
  watch: ReturnType<typeof useFormContext<ApplicationFormData>>["watch"];
  setValue: ReturnType<typeof useFormContext<ApplicationFormData>>["setValue"];
  remove: (index: number) => void;
  tagSuggestions?: string[];
}) {
  const tags = watch(`skills.${index}.tags`) ?? [];
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue(`skills.${index}.tags`, [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      `skills.${index}.tags`,
      tags.filter((tag: string) => tag !== tagToRemove),
    );
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <Controller
            name={`skills.${index}.name`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Skill Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...controllerField}
                  placeholder="e.g., JavaScript"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Tags</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag"
                list={`tag-suggestions-${index}`}
              />
              <datalist id={`tag-suggestions-${index}`}>
                {tagSuggestions
                  ?.filter((tag: string) => !tags.includes(tag))
                  .map((tag: string) => (
                    <option key={tag} value={tag} />
                  ))}
              </datalist>
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </Field>

          <Controller
            name={`skills.${index}.level`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Skill Level <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={controllerField.value ?? ""}
                  onValueChange={(value) => {
                    controllerField.onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
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

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name={`skills.${index}.totalExperience`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Total Experience (Years)</FieldLabel>
                  <Input
                    {...controllerField}
                    type="number"
                    min={0}
                    value={controllerField.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      controllerField.onChange(
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
              name={`skills.${index}.startYear`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Start Year</FieldLabel>
                  <Input
                    {...controllerField}
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    value={controllerField.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      controllerField.onChange(
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
          </div>

          <Controller
            name={`skills.${index}.institution`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Institution</FieldLabel>
                <Input
                  {...controllerField}
                  placeholder="e.g., University name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name={`skills.${index}.selfTaught`}
            control={control}
            render={({ field: controllerField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`selfTaught-${index}`}
                  checked={controllerField.value ?? false}
                  onCheckedChange={(checked) => {
                    controllerField.onChange(!!checked);
                  }}
                />
                <label
                  htmlFor={`selfTaught-${index}`}
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Self-taught
                </label>
              </div>
            )}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Step7Skills() {
  const { control, watch, setValue } = useFormContext<ApplicationFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const { data: tagSuggestions } = api.application.getTagSuggestions.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Skills</h2>
        <p className="text-muted-foreground">
          List your skills and experience levels
        </p>
      </div>

      <FieldGroup>
        {fields.map((field, index) => (
          <SkillRow
            key={field.id}
            field={field}
            index={index}
            control={control}
            watch={watch}
            setValue={setValue}
            remove={remove}
            tagSuggestions={tagSuggestions}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              tags: [],
              level: "beginner",
            })
          }
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </FieldGroup>
    </div>
  );
}
