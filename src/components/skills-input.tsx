"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type EducationMethod =
  | "self-taught"
  | "high-school"
  | "associate"
  | "bachelor"
  | "master"
  | "phd"
  | "bootcamp"
  | "online-course"
  | "certification"
  | "work-experience";

export interface Skill {
  id: string;
  skill: string;
  educationMethod: EducationMethod;
  institution?: string;
  year?: number;
}

interface SkillsInputProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  disabled?: boolean;
}

const EDUCATION_METHODS: { value: EducationMethod; label: string }[] = [
  { value: "self-taught", label: "Self-taught" },
  { value: "high-school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "online-course", label: "Online Course" },
  { value: "certification", label: "Certification" },
  { value: "work-experience", label: "Work Experience" },
];

const REQUIRES_INSTITUTION: EducationMethod[] = [
  "high-school",
  "associate",
  "bachelor",
  "master",
  "phd",
  "bootcamp",
  "online-course",
  "certification",
];

export function SkillsInput({
  skills,
  onChange,
  disabled = false,
}: SkillsInputProps) {
  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      skill: "",
      educationMethod: "self-taught",
    };
    onChange([...skills, newSkill]);
  };

  const handleRemoveSkill = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  const handleSkillChange = (
    id: string,
    field: keyof Skill,
    value: string | number | undefined,
  ) => {
    onChange(skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <FieldGroup className="space-y-4">
      {skills.map((skill, index) => (
        <div
          key={skill.id}
          className={cn(
            "animate-in fade-in-0 slide-in-from-left-2 space-y-4 rounded-lg border p-4",
            "transition-all duration-200",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-4">
              <Field>
                <FieldLabel>Skill Name *</FieldLabel>
                <Input
                  value={skill.skill}
                  onChange={(e) =>
                    handleSkillChange(skill.id, "skill", e.target.value)
                  }
                  placeholder="e.g., JavaScript, Python, Design"
                  disabled={disabled}
                  className="transition-all duration-150 focus:scale-[1.02]"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Education Method *</FieldLabel>
                  <Select
                    value={skill.educationMethod}
                    onValueChange={(value) =>
                      handleSkillChange(
                        skill.id,
                        "educationMethod",
                        value as EducationMethod,
                      )
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="transition-all duration-150 focus:scale-[1.02]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {REQUIRES_INSTITUTION.includes(skill.educationMethod) && (
                  <Field>
                    <FieldLabel>Institution</FieldLabel>
                    <Input
                      value={skill.institution || ""}
                      onChange={(e) =>
                        handleSkillChange(
                          skill.id,
                          "institution",
                          e.target.value,
                        )
                      }
                      placeholder="School, bootcamp, or course name"
                      disabled={disabled}
                      className="transition-all duration-150 focus:scale-[1.02]"
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel>Year (Optional)</FieldLabel>
                  <Input
                    type="number"
                    value={skill.year || ""}
                    onChange={(e) =>
                      handleSkillChange(
                        skill.id,
                        "year",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="Year completed"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={disabled}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                </Field>
              </div>
            </div>

            {skills.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveSkill(skill.id)}
                disabled={disabled}
                className="hover:bg-destructive hover:text-destructive-foreground mt-8 transition-all duration-150 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddSkill}
        disabled={disabled}
        className="w-full transition-all duration-150 hover:scale-105"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Skill
      </Button>
    </FieldGroup>
  );
}
