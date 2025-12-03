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
import { OtpVerification } from "@/components/otp-verification";
import { authClient } from "@/server/better-auth/client";

type Step = "base" | "role" | "path-questions" | "verify";

interface Language {
  language: string;
  level: string;
}

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("base");
  const [error, setError] = useState<string | null>(null);

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

  // Queries
  const { data: roles } = api.applicant.getRoles.useQuery();
  const { data: questionsData } = api.applicant.getQuestions.useQuery(
    { roleId: selectedRoleId },
    { enabled: !!selectedRoleId && step === "path-questions" },
  );

  // Mutations
  const submitApplication = api.applicant.submitApplication.useMutation({
    onSuccess: () => {
      setStep("path-questions");
    },
    onError: (error) => {
      setError(error.message || "Failed to submit application");
    },
  });

  const submitPathAnswers = api.applicant.submitPathAnswers.useMutation({
    onSuccess: () => {
      setStep("verify");
    },
    onError: (error) => {
      setError(error.message || "Failed to submit answers");
    },
  });

  const verifyEmail = api.applicant.verifyEmail.useMutation({
    onSuccess: () => {
      router.push("/applicant/dashboard");
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

  if (step === "base") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Step 1 of 3: Please fill in your basic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBaseSubmit}>
            <FieldGroup>
              {error && (
                <Field>
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {error}
                  </div>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="fullName">Full Name *</FieldLabel>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={submitApplication.isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitApplication.isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={submitApplication.isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">City *</FieldLabel>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={submitApplication.isPending}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Role(s) of Interest *</FieldLabel>
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                  disabled={submitApplication.isPending}
                >
                  <SelectTrigger>
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

              <Field>
                <FieldLabel htmlFor="currentJobStatus">
                  Current Job Status *
                </FieldLabel>
                <Select
                  value={currentJobStatus}
                  onValueChange={setCurrentJobStatus}
                  disabled={submitApplication.isPending}
                >
                  <SelectTrigger>
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

              <Field>
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
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="highestEducationLevel">
                  Highest Education Level *
                </FieldLabel>
                <Select
                  value={highestEducationLevel}
                  onValueChange={setHighestEducationLevel}
                  disabled={submitApplication.isPending}
                >
                  <SelectTrigger>
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

              <Field>
                <FieldLabel htmlFor="skills">Skills</FieldLabel>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="List your skills (comma-separated or free text)"
                  disabled={submitApplication.isPending}
                />
              </Field>

              <Field>
                <FieldLabel>Availability *</FieldLabel>
                <RadioGroup
                  value={availability}
                  onValueChange={(value) =>
                    setAvailability(value as "full-time" | "part-time")
                  }
                  disabled={submitApplication.isPending}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-time" id="full-time" />
                    <label htmlFor="full-time" className="cursor-pointer">
                      Full-time (80+ hours per week)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="part-time" id="part-time" />
                    <label htmlFor="part-time" className="cursor-pointer">
                      Part-time (40+ hours per week)
                    </label>
                  </div>
                </RadioGroup>
              </Field>

              <Field>
                <FieldLabel>Languages & Levels</FieldLabel>
                {languages.map((lang, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Language"
                      value={lang.language}
                      onChange={(e) =>
                        handleLanguageChange(index, "language", e.target.value)
                      }
                      disabled={submitApplication.isPending}
                      className="flex-1"
                    />
                    <Select
                      value={lang.level}
                      onValueChange={(value) =>
                        handleLanguageChange(index, "level", value)
                      }
                      disabled={submitApplication.isPending}
                    >
                      <SelectTrigger className="w-40">
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
                >
                  Add Language
                </Button>
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending
                    ? "Submitting..."
                    : "Continue to Role Questions"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "path-questions" && questionsData?.questions) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Path-Specific Questions</CardTitle>
          <CardDescription>
            Step 2 of 3: Answer questions for {questionsData.role.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePathQuestionsSubmit}>
            <FieldGroup>
              {error && (
                <Field>
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {error}
                  </div>
                </Field>
              )}

              {questionsData.questions.map((question) => (
                <Field key={question.id}>
                  <FieldLabel htmlFor={question.id}>
                    {question.questionText}
                    {question.isRequired && " *"}
                  </FieldLabel>
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
                    />
                  )}
                </Field>
              ))}

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitPathAnswers.isPending}
                >
                  {submitPathAnswers.isPending
                    ? "Submitting..."
                    : "Continue to Verification"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <div className="w-full max-w-md mx-auto">
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
      </div>
    );
  }

  return null;
}

