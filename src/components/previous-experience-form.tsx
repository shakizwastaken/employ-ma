"use client";

import * as React from "react";
import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { Skill } from "@/components/skills-input";

export interface PreviousExperience {
  id: string;
  company: string;
  role: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  description?: string;
  achievements?: string;
  isCurrent: boolean;
  order: number;
  linkedSkillIds?: string[];
}

interface PreviousExperienceFormProps {
  experiences: PreviousExperience[];
  onChange: (experiences: PreviousExperience[]) => void;
  availableSkills: Skill[];
  disabled?: boolean;
  maxExperiences?: number;
}

const MAX_EXPERIENCES = 15;

export function PreviousExperienceForm({
  experiences,
  onChange,
  availableSkills,
  disabled = false,
  maxExperiences = MAX_EXPERIENCES,
}: PreviousExperienceFormProps) {
  const handleAddExperience = () => {
    if (experiences.length >= maxExperiences) return;

    const newExperience: PreviousExperience = {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      startDate: "",
      isCurrent: false,
      order: experiences.length,
    };
    onChange([...experiences, newExperience]);
  };

  const handleRemoveExperience = (id: string) => {
    onChange(
      experiences
        .filter((e) => e.id !== id)
        .map((e, index) => ({ ...e, order: index })),
    );
  };

  const handleExperienceChange = (
    id: string,
    field: keyof PreviousExperience,
    value: string | boolean | string[] | number,
  ) => {
    onChange(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newExperiences = [...experiences];
    const temp = newExperiences[index - 1];
    if (temp) {
      newExperiences[index - 1] = newExperiences[index]!;
      newExperiences[index] = temp;
    }
    onChange(newExperiences.map((e, i) => ({ ...e, order: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === experiences.length - 1) return;
    const newExperiences = [...experiences];
    const temp = newExperiences[index + 1];
    if (temp) {
      newExperiences[index + 1] = newExperiences[index]!;
      newExperiences[index] = temp;
    }
    onChange(newExperiences.map((e, i) => ({ ...e, order: i })));
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return (
    <FieldGroup className="space-y-4">
      {experiences.map((experience, index) => (
        <div
          key={experience.id}
          className={cn(
            "animate-in fade-in-0 slide-in-from-left-2 space-y-4 rounded-lg border p-4",
            "transition-all duration-200",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Experience #{index + 1}
                </span>
                {experiences.length > 1 && (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={disabled || index === 0}
                      className="h-6 w-6"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={disabled || index === experiences.length - 1}
                      className="h-6 w-6"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Company *</FieldLabel>
                  <Input
                    value={experience.company}
                    onChange={(e) =>
                      handleExperienceChange(
                        experience.id,
                        "company",
                        e.target.value,
                      )
                    }
                    placeholder="Company name"
                    disabled={disabled}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                </Field>

                <Field>
                  <FieldLabel>Role *</FieldLabel>
                  <Input
                    value={experience.role}
                    onChange={(e) =>
                      handleExperienceChange(
                        experience.id,
                        "role",
                        e.target.value,
                      )
                    }
                    placeholder="Job title"
                    disabled={disabled}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                </Field>

                <Field>
                  <FieldLabel>Start Date *</FieldLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(experience.startDate)}
                    onChange={(e) =>
                      handleExperienceChange(
                        experience.id,
                        "startDate",
                        e.target.value,
                      )
                    }
                    max={new Date().toISOString().split("T")[0]}
                    disabled={disabled}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                </Field>

                <Field>
                  <FieldLabel>
                    {experience.isCurrent ? "End Date (N/A)" : "End Date"}
                  </FieldLabel>
                  <Input
                    type="date"
                    value={formatDateForInput(experience.endDate)}
                    onChange={(e) =>
                      handleExperienceChange(
                        experience.id,
                        "endDate",
                        e.target.value,
                      )
                    }
                    max={new Date().toISOString().split("T")[0]}
                    disabled={disabled || experience.isCurrent}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                </Field>
              </div>

              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`current-${experience.id}`}
                    checked={experience.isCurrent}
                    onCheckedChange={(checked) =>
                      handleExperienceChange(
                        experience.id,
                        "isCurrent",
                        checked === true,
                      )
                    }
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`current-${experience.id}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    This is my current position
                  </label>
                </div>
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  value={experience.description || ""}
                  onChange={(e) =>
                    handleExperienceChange(
                      experience.id,
                      "description",
                      e.target.value,
                    )
                  }
                  placeholder="Describe your role and responsibilities"
                  disabled={disabled}
                  className="min-h-[100px] transition-all duration-150 focus:scale-[1.01]"
                />
              </Field>

              <Field>
                <FieldLabel>Achievements</FieldLabel>
                <Textarea
                  value={experience.achievements || ""}
                  onChange={(e) =>
                    handleExperienceChange(
                      experience.id,
                      "achievements",
                      e.target.value,
                    )
                  }
                  placeholder="List key achievements or accomplishments"
                  disabled={disabled}
                  className="min-h-[100px] transition-all duration-150 focus:scale-[1.01]"
                />
              </Field>

              {availableSkills.length > 0 && (
                <Field>
                  <FieldLabel>Linked Skills (Optional)</FieldLabel>
                  <Select
                    value=""
                    onValueChange={(skillId) => {
                      const currentSkillIds = experience.linkedSkillIds || [];
                      if (!currentSkillIds.includes(skillId)) {
                        handleExperienceChange(
                          experience.id,
                          "linkedSkillIds",
                          [...currentSkillIds, skillId],
                        );
                      }
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger className="transition-all duration-150 focus:scale-[1.02]">
                      <SelectValue placeholder="Select a skill to link" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills
                        .filter(
                          (skill) =>
                            !experience.linkedSkillIds?.includes(skill.id),
                        )
                        .map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.skill} ({skill.educationMethod})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {experience.linkedSkillIds &&
                    experience.linkedSkillIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {experience.linkedSkillIds.map((skillId) => {
                          const skill = availableSkills.find(
                            (s) => s.id === skillId,
                          );
                          if (!skill) return null;
                          return (
                            <div
                              key={skillId}
                              className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                            >
                              <span>{skill.skill}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleExperienceChange(
                                    experience.id,
                                    "linkedSkillIds",
                                    experience.linkedSkillIds?.filter(
                                      (id) => id !== skillId,
                                    ) || [],
                                  );
                                }}
                                disabled={disabled}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </Field>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveExperience(experience.id)}
              disabled={disabled}
              className="hover:bg-destructive hover:text-destructive-foreground mt-8 transition-all duration-150 hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {experiences.length < maxExperiences && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddExperience}
          disabled={disabled}
          className="w-full transition-all duration-150 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience ({experiences.length}/{maxExperiences})
        </Button>
      )}

      {experiences.length >= maxExperiences && (
        <p className="text-muted-foreground text-center text-sm">
          Maximum {maxExperiences} experiences reached
        </p>
      )}
    </FieldGroup>
  );
}
