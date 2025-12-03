"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { InfoTooltip } from "@/components/ui/tooltip";
import { FormStepIndicator } from "@/components/form-step-indicator";
import { SuccessAnimation } from "@/components/success-animation";
import { FormStepNavigation } from "@/components/form-step-navigation";
import { RoleSelectionCards } from "@/components/role-selection-cards";
import {
  SkillsInput,
  type Skill,
  type EducationMethod,
} from "@/components/skills-input";
import {
  PreviousExperienceForm,
  type PreviousExperience,
} from "@/components/previous-experience-form";
import { authClient } from "@/server/better-auth/client";
import { cn } from "@/lib/utils";

type StepType =
  | "personal"
  | "professional"
  | "role"
  | "skills"
  | "experiences"
  | "path-questions";

interface Language {
  language: string;
  level: string;
}

export function ApplicationForm() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [currentJobStatus, setCurrentJobStatus] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [highestEducationLevel, setHighestEducationLevel] = useState("");
  const [availability, setAvailability] = useState<"full-time" | "part-time">(
    "full-time",
  );
  const [languages, setLanguages] = useState<Language[]>([
    { language: "", level: "" },
  ]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<PreviousExperience[]>([]);
  const [pathAnswers, setPathAnswers] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Development mode - use NEXT_PUBLIC env variable (accessible in client)
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  // Queries
  const { data: roles } = api.applicant.getRoles.useQuery();
  const { data: questionsData } = api.applicant.getQuestions.useQuery(
    { roleId: selectedRoleId },
    { enabled: !!selectedRoleId },
  );

  // Group path questions into steps of 4
  const pathQuestionSteps = useMemo(() => {
    if (!questionsData?.questions) return [];
    const questions = questionsData.questions;
    const steps: (typeof questions)[] = [];
    for (let i = 0; i < questions.length; i += 4) {
      steps.push(questions.slice(i, i + 4));
    }
    return steps;
  }, [questionsData?.questions]);

  // Build step list dynamically
  const steps = useMemo(() => {
    const baseSteps: { id: StepType; label: string }[] = [
      { id: "personal", label: "Personal Info" },
      { id: "professional", label: "Professional" },
      { id: "role", label: "Role Selection" },
      { id: "skills", label: "Skills" },
      { id: "experiences", label: "Experiences" },
    ];

    // Add path question steps
    for (let i = 0; i < pathQuestionSteps.length; i++) {
      baseSteps.push({
        id: "path-questions",
        label: `Role Questions ${i + 1}/${pathQuestionSteps.length}`,
      });
    }

    return baseSteps;
  }, [pathQuestionSteps.length]);

  const currentStep = steps[currentStepIndex];

  // Development mode: Pre-fill form values step by step
  useEffect(() => {
    if (!isDev) return;

    const stepId = currentStep?.id;
    if (!stepId) return;

    switch (stepId) {
      case "personal":
        if (!fullName) setFullName("John Doe");
        if (!email) setEmail("john.doe@example.com");
        if (!phone) setPhone("+1 (555) 123-4567");
        if (!city) setCity("San Francisco");
        break;
      case "professional":
        if (!currentJobStatus) setCurrentJobStatus("employed");
        if (!yearsOfExperience) setYearsOfExperience("5");
        if (!highestEducationLevel) setHighestEducationLevel("bachelor");
        if (!availability) setAvailability("full-time");
        break;
      case "role":
        if (!selectedRoleId && roles && roles.length > 0) {
          setSelectedRoleId(roles[0]!.id);
        }
        break;
      case "skills":
        if (skills.length === 0) {
          setSkills([
            {
              id: "dev-skill-1",
              skill: "JavaScript",
              educationMethod: "bachelor",
              institution: "University",
              year: 2020,
            },
            {
              id: "dev-skill-2",
              skill: "React",
              educationMethod: "self-taught",
              institution: undefined,
              year: 2021,
            },
          ]);
        }
        break;
      case "experiences":
        if (experiences.length === 0) {
          const now = new Date();
          const startDate = new Date(now.getFullYear() - 2, 0, 1);
          setExperiences([
            {
              id: "dev-exp-1",
              company: "Tech Corp",
              role: "Software Engineer",
              startDate: startDate.toISOString().split("T")[0]!,
              endDate: undefined,
              description:
                "Developed and maintained web applications using React and Node.js",
              achievements:
                "Led a team of 3 developers, improved performance by 40%",
              isCurrent: true,
              order: 0,
              linkedSkillIds: [],
            },
          ]);
        }
        break;
      case "path-questions":
        if (questionsData?.questions) {
          const newAnswers = { ...pathAnswers };
          let hasChanges = false;
          questionsData.questions.forEach((q) => {
            if (!newAnswers[q.id]) {
              hasChanges = true;
              if (q.questionType === "textarea" || q.questionType === "text") {
                newAnswers[q.id] =
                  "This is a sample answer for development testing.";
              } else if (
                q.questionType === "select" ||
                q.questionType === "radio"
              ) {
                const options = q.options ? JSON.parse(q.options) : [];
                if (options.length > 0) {
                  newAnswers[q.id] = options[0];
                } else {
                  newAnswers[q.id] = "Option 1";
                }
              } else {
                newAnswers[q.id] = "Sample answer";
              }
            }
          });
          if (hasChanges) {
            setPathAnswers(newAnswers);
          }
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep?.id, isDev]);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Mutations
  const submitApplication = api.applicant.submitApplication.useMutation({
    onSuccess: (data) => {
      if (data.applicationId) {
        setApplicationId(data.applicationId);
      }
      setCompletedSteps(new Set([...completedSteps, currentStepIndex]));
      setShowSuccess(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          goToNextStep();
          setIsTransitioning(false);
          setShowSuccess(false);
        }, 300);
      }, 1500);
    },
    onError: (error) => {
      setError(error.message || "Failed to submit application");
    },
  });

  const submitPathAnswers = api.applicant.submitPathAnswers.useMutation({
    onSuccess: () => {
      setCompletedSteps(new Set([...completedSteps, currentStepIndex]));
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/app");
      }, 1500);
    },
    onError: (error) => {
      setError(error.message || "Failed to submit answers");
    },
  });

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep?.id) {
      case "personal":
        return !!(fullName && email && phone && city);
      case "professional":
        return !!(
          currentJobStatus &&
          yearsOfExperience &&
          highestEducationLevel &&
          availability
        );
      case "role":
        return !!selectedRoleId;
      case "skills":
        return skills.length > 0 && skills.every((s) => s.skill);
      case "experiences":
        return true; // Optional
      case "path-questions":
        const currentPathStep = getCurrentPathQuestionStep();
        if (!currentPathStep) return false;
        return currentPathStep.every((q) =>
          q.isRequired ? !!pathAnswers[q.id] : true,
        );
      default:
        return true;
    }
  };

  const getCurrentPathQuestionStep = () => {
    if (currentStep?.id !== "path-questions") return null;
    // Find which path question step we're on
    let pathStepIndex = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      if (steps[i]?.id === "path-questions") pathStepIndex++;
    }
    return pathQuestionSteps[pathStepIndex] ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateCurrentStep()) {
      setError("Please fill in all required fields");
      return;
    }

    // Submit data when moving from experiences to path questions
    if (currentStep?.id === "experiences" && selectedRoleId) {
      const languageEntries = languages.filter(
        (lang) => lang.language && lang.level,
      );

      submitApplication.mutate({
        fullName,
        email,
        phone,
        city,
        currentJobStatus,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        highestEducationLevel,
        availability,
        roleId: selectedRoleId,
        languages: languageEntries.length > 0 ? languageEntries : undefined,
        skills: skills.map((s) => ({
          skill: s.skill,
          educationMethod: s.educationMethod,
          institution: s.institution,
          year: s.year,
        })),
        experiences: experiences.map((e) => ({
          company: e.company,
          role: e.role,
          startDate: e.startDate,
          endDate: e.endDate,
          description: e.description,
          achievements: e.achievements,
          isCurrent: e.isCurrent,
          order: e.order,
          linkedSkillIds: e.linkedSkillIds,
        })),
      });
    } else if (currentStep?.id === "path-questions") {
      const currentPathStep = getCurrentPathQuestionStep();
      if (!currentPathStep) return;

      // Check if this is the last path question step
      const pathStepIndex = steps
        .slice(0, currentStepIndex)
        .filter((s) => s.id === "path-questions").length;

      if (pathStepIndex === pathQuestionSteps.length - 1) {
        // Last path question step - submit all answers
        const allAnswers = questionsData!.questions
          .filter((q) => pathAnswers[q.id])
          .map((q) => ({
            templateId: q.id,
            questionId: q.id,
            answer: pathAnswers[q.id]!,
          }));

        if (allAnswers.length > 0 && applicationId) {
          submitPathAnswers.mutate({
            applicationId,
            answers: allAnswers,
          });
        } else {
          goToNextStep();
        }
      } else {
        goToNextStep();
      }
    } else {
      goToNextStep();
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case "personal":
        return (
          <FieldGroup className="space-y-4">
            {error && (
              <Field>
                <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                  {error}
                </div>
              </Field>
            )}
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <FieldLabel htmlFor="fullName">Full Name *</FieldLabel>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="transition-all duration-150 focus:scale-[1.02]"
              />
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-75 duration-300">
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-150 focus:scale-[1.02]"
              />
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-100 duration-300">
              <FieldLabel htmlFor="phone">Phone *</FieldLabel>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="transition-all duration-150 focus:scale-[1.02]"
              />
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-150 duration-300">
              <FieldLabel htmlFor="city">City *</FieldLabel>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="transition-all duration-150 focus:scale-[1.02]"
              />
            </Field>
          </FieldGroup>
        );

      case "professional":
        return (
          <FieldGroup className="space-y-4">
            {error && (
              <Field>
                <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                  {error}
                </div>
              </Field>
            )}
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <FieldLabel htmlFor="currentJobStatus">
                Current Job Status *
              </FieldLabel>
              <Select
                value={currentJobStatus}
                onValueChange={setCurrentJobStatus}
              >
                <SelectTrigger className="transition-all duration-150 focus:scale-[1.02]">
                  <SelectValue placeholder="Select job status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-75 duration-300">
              <FieldLabel htmlFor="yearsOfExperience">
                Years of Experience *
              </FieldLabel>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                required
                className="transition-all duration-150 focus:scale-[1.02]"
              />
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-100 duration-300">
              <FieldLabel htmlFor="highestEducationLevel">
                Highest Education Level *
              </FieldLabel>
              <Select
                value={highestEducationLevel}
                onValueChange={setHighestEducationLevel}
              >
                <SelectTrigger className="transition-all duration-150 focus:scale-[1.02]">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="associate">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="animate-in fade-in-0 slide-in-from-bottom-2 delay-150 duration-300">
              <FieldLabel>Availability *</FieldLabel>
              <RadioGroup
                value={availability}
                onValueChange={(value) =>
                  setAvailability(value as "full-time" | "part-time")
                }
                className="space-y-2"
              >
                <div className="hover:bg-accent/50 flex items-center space-x-2 rounded-md border p-3 transition-all duration-150">
                  <RadioGroupItem value="full-time" id="full-time" />
                  <label htmlFor="full-time" className="flex-1 cursor-pointer">
                    Full-time (80+ hours per week)
                  </label>
                </div>
                <div className="hover:bg-accent/50 flex items-center space-x-2 rounded-md border p-3 transition-all duration-150">
                  <RadioGroupItem value="part-time" id="part-time" />
                  <label htmlFor="part-time" className="flex-1 cursor-pointer">
                    Part-time (40+ hours per week)
                  </label>
                </div>
              </RadioGroup>
            </Field>
          </FieldGroup>
        );

      case "role":
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            {roles && roles.length > 0 ? (
              <RoleSelectionCards
                roles={roles}
                selectedRoleId={selectedRoleId}
                onSelect={setSelectedRoleId}
              />
            ) : (
              <p className="text-muted-foreground">No roles available</p>
            )}
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            <SkillsInput skills={skills} onChange={setSkills} />
          </div>
        );

      case "experiences":
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            <PreviousExperienceForm
              experiences={experiences}
              onChange={setExperiences}
              availableSkills={skills}
              maxExperiences={15}
            />
          </div>
        );

      case "path-questions":
        const currentPathStep = getCurrentPathQuestionStep();
        if (!currentPathStep || currentPathStep.length === 0) {
          return (
            <p className="text-muted-foreground">No questions available</p>
          );
        }

        return (
          <FieldGroup className="space-y-4">
            {error && (
              <Field>
                <div className="bg-destructive/10 text-destructive animate-in fade-in-0 rounded-md p-3 text-sm">
                  {error}
                </div>
              </Field>
            )}
            {currentPathStep.map((question, index) => (
              <Field
                key={question.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor={question.id} className="flex-1">
                    {question.questionText}
                    {question.isRequired && " *"}
                  </FieldLabel>
                  {question.explanation && (
                    <InfoTooltip content={question.explanation} />
                  )}
                </div>
                {question.questionType === "textarea" ? (
                  <Textarea
                    id={question.id}
                    value={pathAnswers[question.id] || ""}
                    onChange={(e) =>
                      setPathAnswers({
                        ...pathAnswers,
                        [question.id]: e.target.value,
                      })
                    }
                    required={question.isRequired}
                    className="min-h-[120px] transition-all duration-150 focus:scale-[1.01]"
                  />
                ) : (
                  <Input
                    id={question.id}
                    value={pathAnswers[question.id] || ""}
                    onChange={(e) =>
                      setPathAnswers({
                        ...pathAnswers,
                        [question.id]: e.target.value,
                      })
                    }
                    required={question.isRequired}
                    className="transition-all duration-150 focus:scale-[1.02]"
                  />
                )}
              </Field>
            ))}
          </FieldGroup>
        );

      default:
        return null;
    }
  };

  if (!currentStep) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Indicator */}
      <FormStepIndicator
        steps={steps.map((s) => ({ id: s.id, label: s.label }))}
        currentStep={currentStepIndex + 1}
        className="mb-6"
      />

      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation
          message={
            currentStep.id === "personal"
              ? "✓ Personal information saved!"
              : currentStep.id === "professional"
                ? "✓ Professional details saved!"
                : currentStep.id === "role"
                  ? "✓ Role selected!"
                  : currentStep.id === "skills"
                    ? "✓ Skills added!"
                    : currentStep.id === "experiences"
                      ? "✓ Experiences saved!"
                      : currentStep.id === "path-questions"
                        ? "✓ Questions answered!"
                        : "🎉 Application submitted!"
          }
          onComplete={() => setShowSuccess(false)}
        />
      )}

      {/* Main Form Card */}
      <Card
        className={cn(
          "w-full transition-all duration-300",
          isTransitioning && "scale-95 opacity-0",
          !isTransitioning && "scale-100 opacity-100",
        )}
      >
        <CardHeader>
          <CardTitle>{currentStep.label}</CardTitle>
          <CardDescription>
            {currentStep.id === "path-questions"
              ? `Answer questions for ${questionsData?.role.name || "your selected role"}`
              : `Please provide the following information`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
              {renderStepContent()}
            </div>

            <FormStepNavigation
              onPrevious={goToPreviousStep}
              canGoPrevious={currentStepIndex > 0}
              canGoNext={validateCurrentStep()}
              isSubmitting={
                submitApplication.isPending || submitPathAnswers.isPending
              }
              nextLabel={
                currentStep.id === "experiences"
                  ? "Continue to Questions →"
                  : currentStep.id === "path-questions" &&
                      getCurrentPathQuestionStep() &&
                      steps
                        .slice(0, currentStepIndex)
                        .filter((s) => s.id === "path-questions").length ===
                        pathQuestionSteps.length - 1
                    ? "Submit Application →"
                    : "Next →"
              }
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
