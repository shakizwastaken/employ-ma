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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";

function ExperienceRow({
  field,
  index,
  control,
  watch,
  setValue,
  remove,
  categories,
}: {
  field: { id: string };
  index: number;
  control: ReturnType<typeof useFormContext<ApplicationFormData>>["control"];
  watch: ReturnType<typeof useFormContext<ApplicationFormData>>["watch"];
  setValue: ReturnType<typeof useFormContext<ApplicationFormData>>["setValue"];
  remove: (index: number) => void;
  categories?: Array<{ id: string; name: string }>;
}) {
  const isCurrent = watch(`experiences.${index}.isCurrent`) ?? false;
  const links = watch(`experiences.${index}.links`) ?? [];
  const achievements = watch(`experiences.${index}.achievements`) ?? [];
  const categoryIds = watch(`experiences.${index}.categoryIds`) ?? [];

  const [linkInput, setLinkInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");

  const handleAddLink = () => {
    if (linkInput.trim() && !links.includes(linkInput.trim())) {
      setValue(`experiences.${index}.links`, [...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setValue(
      `experiences.${index}.links`,
      links.filter((link: string) => link !== linkToRemove),
    );
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setValue(`experiences.${index}.achievements`, [
        ...achievements,
        achievementInput.trim(),
      ]);
      setAchievementInput("");
    }
  };

  const handleRemoveAchievement = (achievementToRemove: string) => {
    setValue(
      `experiences.${index}.achievements`,
      achievements.filter((a: string) => a !== achievementToRemove),
    );
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name={`experiences.${index}.company`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Company</FieldLabel>
                  <Input
                    {...controllerField}
                    placeholder="Company name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={`experiences.${index}.position`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Position</FieldLabel>
                  <Input
                    {...controllerField}
                    placeholder="Job title"
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
            name={`experiences.${index}.description`}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  {...controllerField}
                  placeholder="Describe your role and responsibilities"
                  rows={4}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <Controller
              name={`experiences.${index}.startYear`}
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

            <Controller
              name={`experiences.${index}.endYear`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>End Year</FieldLabel>
                  <Input
                    {...controllerField}
                    type="number"
                    min={1900}
                    max={new Date().getFullYear()}
                    disabled={isCurrent}
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
              name={`experiences.${index}.isCurrent`}
              control={control}
              render={({ field: controllerField }) => (
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id={`isCurrent-${index}`}
                    checked={controllerField.value ?? false}
                    onCheckedChange={(checked) => {
                      controllerField.onChange(!!checked);
                      if (checked) {
                        setValue(`experiences.${index}.endYear`, undefined);
                      }
                    }}
                  />
                  <label
                    htmlFor={`isCurrent-${index}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Current Position
                  </label>
                </div>
              )}
            />
          </div>

          <Field>
            <FieldLabel>Links</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {links.map((link: string) => (
                <span
                  key={link}
                  className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
                placeholder="Add URL"
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                Add
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel>Achievements</FieldLabel>
            <div className="space-y-2">
              {achievements.map((achievement: string, aIndex: number) => (
                <div
                  key={aIndex}
                  className="bg-muted flex items-center gap-2 rounded-md px-2 py-1"
                >
                  <span className="flex-1 text-sm">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(achievement)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
                placeholder="Add achievement"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAchievement}
              >
                Add
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel>Categories</FieldLabel>
            <Select
              value=""
              onValueChange={(value) => {
                if (!categoryIds.includes(value)) {
                  setValue(`experiences.${index}.categoryIds`, [
                    ...categoryIds,
                    value,
                  ]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  ?.filter((cat) => !categoryIds.includes(cat.id))
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryIds.map((catId: string) => {
                const category = categories?.find((c) => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                  >
                    {category?.name}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          `experiences.${index}.categoryIds`,
                          categoryIds.filter((id: string) => id !== catId),
                        )
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </Field>
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

export function Step8WorkExperience() {
  const { control, watch, setValue } = useFormContext<ApplicationFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  const { data: categories } = api.application.getCategories.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Work Experience</h2>
        <p className="text-muted-foreground">
          Share your professional work history
        </p>
      </div>

      <FieldGroup>
        {fields.map((field, index) => (
          <ExperienceRow
            key={field.id}
            field={field}
            index={index}
            control={control}
            watch={watch}
            setValue={setValue}
            remove={remove}
            categories={categories}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              isCurrent: false,
              links: [],
              achievements: [],
              categoryIds: [],
            })
          }
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      </FieldGroup>
    </div>
  );
}
