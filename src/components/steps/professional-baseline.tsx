"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationFormData } from "@/server/api/validators/application";
import { getCategorySuggestions } from "@/lib/category-suggestions";

const PORTFOLIO_REQUIRED_CATEGORIES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "UI/UX Designer",
  "Graphic Designer",
];

const VIDEO_EDITOR_CATEGORY = "Video Editor";

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

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  error?: { message?: string };
}

function CategoryInput({
  value,
  onChange,
  invalid,
  error,
}: CategoryInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get all categories
  const allCategories = useMemo(() => getCategorySuggestions(), []);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCategories;
    }
    return getCategorySuggestions(searchQuery);
  }, [searchQuery, allCategories]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset search query to field value when closing
        setSearchQuery(value || "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Sync search query with field value when not open
  useEffect(() => {
    if (!isOpen && value) {
      setSearchQuery(value);
    }
  }, [value, isOpen]);

  const handleSelect = (category: string) => {
    onChange(category);
    setSearchQuery(category);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    setIsOpen(true);

    // If user clears input, clear the field value
    if (!inputValue.trim()) {
      onChange("");
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      // Focus first suggestion
      const firstButton =
        containerRef.current?.querySelector('[role="option"]');
      if (firstButton) {
        (firstButton as HTMLElement).focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery(value || "");
      inputRef.current?.blur();
    } else if (e.key === "Enter" && filteredCategories.length > 0) {
      e.preventDefault();
      handleSelect(filteredCategories[0]!);
    }
  };

  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextButton = containerRef.current?.querySelector(
        `[role="option"]:nth-child(${index + 2})`,
      );
      if (nextButton) {
        (nextButton as HTMLElement).focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        const prevButton = containerRef.current?.querySelector(
          `[role="option"]:nth-child(${index})`,
        );
        if (prevButton) {
          (prevButton as HTMLElement).focus();
        }
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(filteredCategories[index]!);
    }
  };

  // Display value: show search query when open, field value when closed
  const displayValue = isOpen ? searchQuery : value || "";

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor="category">
        Specialization <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Input
            ref={inputRef}
            id="category"
            placeholder="Select or search specialization..."
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="category-options"
            aria-invalid={invalid}
            className={cn(invalid && "border-destructive")}
          />
          {value && !isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange("");
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              aria-label="Clear specialization"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            id="category-options"
            role="listbox"
            className="border-border bg-popover text-popover-foreground absolute top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-lg"
          >
            {filteredCategories.length > 0 ? (
              <div className="p-1">
                {filteredCategories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={value === category}
                    tabIndex={0}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none",
                      value === category &&
                        "bg-accent text-accent-foreground font-medium",
                    )}
                    onClick={() => handleSelect(category)}
                    onKeyDown={(e) => handleSuggestionKeyDown(e, index)}
                    onMouseDown={(e) => {
                      // Prevent input blur
                      e.preventDefault();
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  No matching categories found
                </p>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Start typing to search...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {invalid && <FieldError errors={[error]} />}
    </Field>
  );
}

export function Step2ProfessionalBaseline() {
  const { control, watch, setValue } = useFormContext<ApplicationFormData>();
  const category = watch("category");
  const portfolioLinks = watch("portfolioLinks") ?? [];
  const [linkInput, setLinkInput] = useState("");

  const requiresPortfolio = category
    ? PORTFOLIO_REQUIRED_CATEGORIES.includes(category)
    : false;
  const isVideoEditor = category === VIDEO_EDITOR_CATEGORY;
  const showPortfolioLinks = requiresPortfolio || isVideoEditor;

  const handleAddPortfolioLink = () => {
    if (linkInput.trim() && !portfolioLinks.includes(linkInput.trim())) {
      setValue("portfolioLinks", [...portfolioLinks, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemovePortfolioLink = (linkToRemove: string) => {
    setValue(
      "portfolioLinks",
      portfolioLinks.filter((link: string) => link !== linkToRemove),
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Professional Baseline</h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
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
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <CategoryInput
              value={field.value ?? ""}
              onChange={field.onChange}
              invalid={fieldState.invalid}
              error={fieldState.error}
            />
          )}
        />

        {showPortfolioLinks && (
          <Controller
            name="portfolioLinks"
            control={control}
            render={({ fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Portfolio / Previous Project Links
                  {requiresPortfolio && (
                    <span className="text-destructive"> *</span>
                  )}
                  {isVideoEditor && (
                    <span className="text-muted-foreground text-xs font-normal">
                      {" "}
                      (Required if no portfolio file is uploaded)
                    </span>
                  )}
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {portfolioLinks.map((link: string) => (
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
                        onClick={() => handleRemovePortfolioLink(link)}
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
                        handleAddPortfolioLink();
                      }
                    }}
                    placeholder="Add portfolio or project URL"
                    type="url"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPortfolioLink}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
      </FieldGroup>
    </div>
  );
}
