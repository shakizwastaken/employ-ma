"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { OtpVerification } from "@/components/otp-verification";
import { authClient } from "@/server/better-auth/client";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Step = "base" | "path-questions" | "verify";

interface Language {
  language: string;
  level: string;
}

const STEPS = [
  { id: "base", label: "Basic Info" },
  { id: "path-questions", label: "Role Questions" },
  { id: "verify", label: "Verification" },
];

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("base");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Base form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [currentJobStatus, setCurrentJobStatus] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [highestEducationLevel, setHighestEducationLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState<"full-time" | "part-time">(
    "full-time",
  );
  const [languages, setLanguages] = useState<Language[]>([
    { language: "", level: "" },
  ]);

  // Role selection
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Path answers
  const [pathAnswers, setPathAnswers] = useState<
    Record<string, string>
  >({});

  // Calculate progress
  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Queries
  const { data: roles } = api.applicant.getRoles.useQuery();
  const { data: questionsData } = api.applicant.getQuestions.useQuery(
    { roleId: selectedRoleId },
    { enabled: !!selectedRoleId && step === "path-questions" },
  );

  // Mutations
  const submitApplication = api.applicant.submitApplication.useMutation({
    onSuccess: () => {
      setCompletedSteps(new Set([...completedSteps, "base"]));
      setShowSuccess(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep("path-questions");
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
      setCompletedSteps(new Set([...completedSteps, "path-questions"]));
      setShowSuccess(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep("verify");
          setIsTransitioning(false);
          setShowSuccess(false);
        }, 300);
      }, 1500);
    },
    onError: (error) => {
      setError(error.message || "Failed to submit answers");
    },
  });

  const verifyEmail = api.applicant.verifyEmail.useMutation({
    onSuccess: () => {
      setCompletedSteps(new Set([...completedSteps, "verify"]));
      setTimeout(() => {
        router.push("/applicant/dashboard");
      }, 1000);
    },
    onError: (error) => {
      setError(error.message || "Failed to verify email");
    },
  });

  const handleBaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRoleId) {
      setError("Please select a role");
      return;
    }

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
      skills: skills || undefined,
      availability,
      roleId: selectedRoleId,
      languages: languageEntries.length > 0 ? languageEntries : undefined,
    });
  };

  const handlePathQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionsData?.questions) {
      setError("No questions found");
      return;
    }

    const answers = questionsData.questions
      .filter((q) => pathAnswers[q.id])
      .map((q) => ({
        templateId: q.id,
        questionId: q.id,
        answer: pathAnswers[q.id]!,
      }));

    if (answers.length === 0) {
      setError("Please answer at least one question");
      return;
    }

    submitPathAnswers.mutate({
      applicantEmail: email,
      answers,
    });
  };

  const handleAddLanguage = () => {
    setLanguages([...languages, { language: "", level: "" }]);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (
    index: number,
    field: "language" | "level",
    value: string,
  ) => {
    const updated = [...languages];
    updated[index] = { ...updated[index]!, [field]: value };
    setLanguages(updated);
  };

  const handleResendOtp = async () => {
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
    } catch (err) {
      setError("Failed to resend code");
    }
  };

  // Calculate completion for base form
  const baseFields = {
    fullName,
    email,
    phone,
    city,
    currentJobStatus,
    yearsOfExperience,
    highestEducationLevel,
    selectedRoleId,
    availability,
  };
  const completedBaseFields = Object.values(baseFields).filter(
    (v) => v !== "" && v !== undefined,
  ).length;
  const totalBaseFields = Object.keys(baseFields).length;
  const baseCompletion = (completedBaseFields / totalBaseFields) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Indicator */}
      <FormStepIndicator
        steps={STEPS}
        currentStep={currentStepIndex + 1}
        className="mb-6"
      />

      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation
          message={
            step === "base"
              ? "✓ Basic information saved!"
              : step === "path-questions"
                ? "✓ Role questions completed!"
                : "🎉 Application submitted!"
          }
          onComplete={() => setShowSuccess(false)}
        />
      )}

      {/* Main Form Card */}
      <Card
        className={cn(
          "w-full transition-all duration-300",
          isTransitioning && "opacity-0 scale-95",
          !isTransitioning && "opacity-100 scale-100"
        )}
      >
        {step === "base" && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>
                Step 1 of 3: Please fill in your basic information
                {baseCompletion > 0 && (
                  <span className="ml-2 text-primary">
                    ({Math.round(baseCompletion)}% complete)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBaseSubmit}>
                <FieldGroup className="space-y-8">
                  {error && (
                    <Field>
                      <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm animate-in fade-in-0 slide-in-from-top-2">
                        {error}
                      </div>
                    </Field>
                  )}

                  {/* Personal Information Section */}
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        Personal Information
                      </h3>
                      <Separator className="flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field className="animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-75">
                        <FieldLabel htmlFor="fullName">Full Name *</FieldLabel>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          disabled={submitApplication.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      </Field>

                      <Field className="animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-100">
                        <FieldLabel htmlFor="email">Email *</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={submitApplication.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      </Field>

                      <Field className="animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-150">
                        <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={submitApplication.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      </Field>

                      <Field className="animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-200">
                        <FieldLabel htmlFor="city">City *</FieldLabel>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          disabled={submitApplication.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Professional Details Section */}
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-300">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        Professional Details
                      </h3>
                      <Separator className="flex-1" />
                    </div>

                    <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
                      <FieldLabel htmlFor="role">Role(s) of Interest *</FieldLabel>
                      <Select
                        value={selectedRoleId}
                        onValueChange={setSelectedRoleId}
                        disabled={submitApplication.isPending}
                      >
                        <SelectTrigger className="transition-all duration-150 focus:scale-[1.02]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field className="animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-100">
                        <FieldLabel htmlFor="currentJobStatus">
                          Current Job Status *
                        </FieldLabel>
                        <Select
                          value={currentJobStatus}
                          onValueChange={setCurrentJobStatus}
                          disabled={submitApplication.isPending}
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

                      <Field className="animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-150">
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
                          disabled={submitApplication.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      </Field>

                      <Field className="animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-200 md:col-span-2">
                        <FieldLabel htmlFor="highestEducationLevel">
                          Highest Education Level *
                        </FieldLabel>
                        <Select
                          value={highestEducationLevel}
                          onValueChange={setHighestEducationLevel}
                          disabled={submitApplication.isPending}
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
                    </div>
                  </div>

                  {/* Skills & Availability Section */}
                  <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-500">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        Skills & Availability
                      </h3>
                      <Separator className="flex-1" />
                    </div>

                    <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-75">
                      <FieldLabel htmlFor="skills">Skills</FieldLabel>
                      <Textarea
                        id="skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="List your skills (comma-separated or free text)"
                        disabled={submitApplication.isPending}
                        className="transition-all duration-150 focus:scale-[1.01] min-h-[100px]"
                      />
                    </Field>

                    <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100">
                      <FieldLabel>Availability *</FieldLabel>
                      <RadioGroup
                        value={availability}
                        onValueChange={(value) =>
                          setAvailability(value as "full-time" | "part-time")
                        }
                        disabled={submitApplication.isPending}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-3 rounded-md border transition-all duration-150 hover:bg-accent/50">
                          <RadioGroupItem value="full-time" id="full-time" />
                          <label htmlFor="full-time" className="cursor-pointer flex-1">
                            Full-time (80+ hours per week)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-md border transition-all duration-150 hover:bg-accent/50">
                          <RadioGroupItem value="part-time" id="part-time" />
                          <label htmlFor="part-time" className="cursor-pointer flex-1">
                            Part-time (40+ hours per week)
                          </label>
                        </div>
                      </RadioGroup>
                    </Field>

                    <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-150">
                      <FieldLabel>Languages & Levels</FieldLabel>
                      {languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex gap-2 mb-2 animate-in fade-in-0 slide-in-from-left-2 duration-300"
                        >
                          <Input
                            placeholder="Language"
                            value={lang.language}
                            onChange={(e) =>
                              handleLanguageChange(index, "language", e.target.value)
                            }
                            disabled={submitApplication.isPending}
                            className="flex-1 transition-all duration-150 focus:scale-[1.02]"
                          />
                          <Select
                            value={lang.level}
                            onValueChange={(value) =>
                              handleLanguageChange(index, "level", value)
                            }
                            disabled={submitApplication.isPending}
                          >
                            <SelectTrigger className="w-40 transition-all duration-150 focus:scale-[1.02]">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">Native</SelectItem>
                              <SelectItem value="fluent">Fluent</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                            </SelectContent>
                          </Select>
                          {languages.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleRemoveLanguage(index)}
                              disabled={submitApplication.isPending}
                              className="transition-all duration-150 hover:scale-105"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddLanguage}
                        disabled={submitApplication.isPending}
                        className="transition-all duration-150 hover:scale-105"
                      >
                        Add Language
                      </Button>
                    </Field>
                  </div>

                  <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-700">
                    <Button
                      type="submit"
                      className="w-full transition-all duration-150 hover:scale-105"
                      disabled={submitApplication.isPending}
                    >
                      {submitApplication.isPending
                        ? "Submitting..."
                        : "Continue to Role Questions →"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </div>
        )}

        {step === "path-questions" && questionsData?.questions && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>Path-Specific Questions</CardTitle>
              <CardDescription>
                Step 2 of 3: Answer questions for {questionsData.role.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePathQuestionsSubmit}>
                <FieldGroup className="space-y-6">
                  {error && (
                    <Field>
                      <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm animate-in fade-in-0 slide-in-from-top-2">
                        {error}
                      </div>
                    </Field>
                  )}

                  {questionsData.questions.map((question, index) => (
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
                          disabled={submitPathAnswers.isPending}
                          className="transition-all duration-150 focus:scale-[1.01] min-h-[120px]"
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
                          disabled={submitPathAnswers.isPending}
                          className="transition-all duration-150 focus:scale-[1.02]"
                        />
                      )}
                    </Field>
                  ))}

                  <Field className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-500">
                    <Button
                      type="submit"
                      className="w-full transition-all duration-150 hover:scale-105"
                      disabled={submitPathAnswers.isPending}
                    >
                      {submitPathAnswers.isPending
                        ? "Submitting..."
                        : "Continue to Verification →"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </div>
        )}

        {step === "verify" && (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Step 3 of 3: Verify your email to complete your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OtpVerification
                email={email}
                onVerify={async (otp) => {
                  await verifyEmail.mutateAsync({ email, otp });
                }}
                onResend={handleResendOtp}
                type="email-verification"
                isLoading={verifyEmail.isPending}
                error={error}
              />
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
}
