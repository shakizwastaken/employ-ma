"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import type { ApplicationFormData } from "@/server/api/validators/application";
import { getTagSuggestions } from "@/lib/tag-suggestions";

const skillLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

function SkillRow({
  index,
  control,
  watch,
  setValue,
  remove,
}: {
  field: { id: string };
  index: number;
  control: ReturnType<typeof useFormContext<ApplicationFormData>>["control"];
  watch: ReturnType<typeof useFormContext<ApplicationFormData>>["watch"];
  setValue: ReturnType<typeof useFormContext<ApplicationFormData>>["setValue"];
  remove: (index: number) => void;
}) {
  const tagsWatch = watch(`skills.${index}.tags`);
  const tags = useMemo(() => tagsWatch ?? [], [tagsWatch]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize tag to lowercase
  const normalizeTag = (tag: string) => tag.trim().toLowerCase();

  // Memoize normalized tags to avoid dependency issues
  const normalizedTags = useMemo(() => tags.map(normalizeTag), [tags]);

  // Fetch suggestions based on input
  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = getTagSuggestions(input)
        .map((tag: string) => normalizeTag(tag))
        .filter((tag: string) => !normalizedTags.includes(tag));

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 || input.trim().length > 0);
    },
    [normalizedTags],
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAddTag = (tagToAdd?: string) => {
    const tag = normalizeTag(tagToAdd ?? tagInput);
    if (tag) {
      const normalizedTags = tags.map(normalizeTag);
      if (!normalizedTags.includes(tag)) {
        setValue(`skills.${index}.tags`, [...tags, tag]);
        setTagInput("");
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const normalizedToRemove = normalizeTag(tagToRemove);
    setValue(
      `skills.${index}.tags`,
      tags.filter((tag: string) => normalizeTag(tag) !== normalizedToRemove),
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert input to lowercase as user types
    const lowerValue = value.toLowerCase();
    setTagInput(lowerValue);

    // Debounce the suggestions fetch
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(lowerValue);
    }, 150);
  };

  const handleSelectSuggestion = (tag: string) => {
    handleAddTag(tag);
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
                  value={controllerField.value ?? ""}
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
            <div className="mb-2 flex flex-wrap gap-2">
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
            <div className="relative z-[100]" ref={containerRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id={`tag-input-${index}`}
                    placeholder="Search or add tag..."
                    value={tagInput}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (tagInput.trim() || suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === "Tab" && suggestions.length > 0) {
                        e.preventDefault();
                        handleAddTag(suggestions[0]);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setShowSuggestions(false);
                        e.currentTarget.focus();
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddTag()}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions &&
                (tagInput.trim() || suggestions.length > 0) && (
                  <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 left-0 z-[999] mt-1 max-h-60 overflow-y-auto rounded-md border shadow-lg">
                    {suggestions.length > 0 ? (
                      <div className="p-1">
                        {suggestions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none"
                            onClick={() => handleSelectSuggestion(tag)}
                            onMouseDown={(e) => {
                              // Prevent input blur
                              e.preventDefault();
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    ) : tagInput.trim() ? (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground mb-2 text-sm">
                          No matching tags found
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTag()}
                        >
                          Add &quot;{tagInput}&quot;
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground text-sm">
                          Start typing to search for tags...
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
            name={`skills.${index}.selfTaught`}
            control={control}
            render={({ field: controllerField }) => {
              const isSelfTaught = controllerField.value ?? false;
              return (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`selfTaught-${index}`}
                    checked={isSelfTaught}
                    onCheckedChange={(checked) => {
                      controllerField.onChange(!!checked);
                      // Clear institution when self-taught is checked
                      if (checked) {
                        setValue(`skills.${index}.institution`, "");
                      }
                    }}
                  />
                  <label
                    htmlFor={`selfTaught-${index}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Self-taught
                  </label>
                </div>
              );
            }}
          />

          <Controller
            name={`skills.${index}.institution`}
            control={control}
            render={({ field: controllerField, fieldState }) => {
              const isSelfTaught = watch(`skills.${index}.selfTaught`) ?? false;
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Institution</FieldLabel>
                  <Input
                    {...controllerField}
                    placeholder="e.g., University name"
                    value={controllerField.value ?? ""}
                    disabled={isSelfTaught}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Skills</h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
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
