"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { applicationFormSchema } from "@/server/api/validators/application";
import type { ApplicationFormData } from "@/server/api/validators/application";
import { extractFieldPaths, getFirstErrorStep } from "@/lib/error-utils";
import { Step1UserIdentity } from "./steps/user-identity";
import { Step2ProfessionalBaseline } from "./steps/professional-baseline";
import { Step3PersonalProfile } from "./steps/personal-profile";
import { Step4LanguageProficiency } from "./steps/language-proficiency";
import { Step5SocialProfiles } from "./steps/social-profiles";
import { Step6Availability } from "./steps/availability";
import { Step7Skills } from "./steps/skills";
import { Step8WorkExperience } from "./steps/work-experience";
import { Step9ResumeVideo } from "./steps/resume-video";
import { Step10Review } from "./steps/review";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ApplicationFormProps {
  initialEmail?: string;
}

const TOTAL_STEPS = 10;

export function ApplicationForm({ initialEmail }: ApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormData>({
    // @ts-expect-error - Known type issue with zodResolver and complex schemas
    resolver: zodResolver(applicationFormSchema),
    mode: "onChange",
    defaultValues: {
      languages: [{ name: "English", proficiency: "intermediate" }],
      socialProfiles: [],
      skills: [],
      experiences: [],
    },
  });

  const submitMutation = api.application.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!", {
        description: "Thank you for your application. We'll be in touch soon.",
      });
      router.push("/?success=true");
    },
    onError: (error) => {
      console.error("Submission error:", error);

      // Try to extract Zod errors and navigate to the first error step
      const zodError = error.data?.zodError;
      if (zodError) {
        const fieldPaths = extractFieldPaths(zodError);
        const errorStep = getFirstErrorStep(fieldPaths);

        if (errorStep) {
          setCurrentStep(errorStep);
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.error("Please fix the errors below", {
            description: "Some fields need attention before submission.",
          });
        } else {
          toast.error("Validation error", {
            description:
              error.message || "Please check your form and try again.",
          });
        }
      } else {
        // Handle other types of errors (network, server, etc.)
        toast.error("Failed to submit application", {
          description: error.message || "Please try again later.",
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("application-form-data");
    if (saved) {
      try {
        const data = JSON.parse(saved) as Partial<ApplicationFormData>;
        Object.keys(data).forEach((key) => {
          const value = data[key as keyof ApplicationFormData];
          if (value !== undefined && value !== null) {
            form.setValue(key as keyof ApplicationFormData, value);
          }
        });
      } catch (e) {
        console.error("Failed to load saved form data", e);
        toast.error("Failed to load saved form data", {
          description: "Your previous form data could not be restored.",
        });
      }
    }
  }, [form]);

  // Save form data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      try {
        localStorage.setItem("application-form-data", JSON.stringify(value));
      } catch (e) {
        // Handle quota exceeded or other localStorage errors
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          toast.warning("Storage limit reached", {
            description:
              "Unable to save form progress. Please complete the form soon.",
          });
        } else {
          console.error("Failed to save form data", e);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "phoneNumber"];
        break;
      case 2:
        fieldsToValidate = [
          "highestFormalEducationLevel",
          "currentJobStatus",
          "category",
        ];
        break;
      case 3:
        fieldsToValidate = ["countryOfResidence", "timeZone"];
        break;
      case 4:
        fieldsToValidate = ["languages"];
        break;
      case 5:
        fieldsToValidate = ["linkedinUrl"];
        break;
      case 6:
        fieldsToValidate = ["availability", "expectedSalary"];
        break;
      case 7:
        fieldsToValidate = ["skills"];
        break;
      case 8:
        fieldsToValidate = ["experiences"];
        break;
      case 9:
        // Step 9 is optional, no validation needed
        return true;
      case 10:
        // Final step, validate entire form
        return form.trigger();
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Get form errors to show specific message
      const errors = form.formState.errors;
      const errorFields = Object.keys(errors);

      if (errorFields.length > 0) {
        toast.error("Please fix the errors before continuing", {
          description: "Some required fields are missing or invalid.",
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      // Extract errors and navigate to first error step
      const errors = form.formState.errors;
      const errorPaths: (string | number)[][] = [];

      // Convert react-hook-form errors to field paths
      const processErrors = (
        obj: Record<string, unknown>,
        prefix: (string | number)[] = [],
      ) => {
        for (const [key, value] of Object.entries(obj)) {
          const path = [...prefix, key];
          if (value && typeof value === "object") {
            if ("message" in value || "type" in value) {
              // This is an error object (react-hook-form format)
              errorPaths.push(path);
            } else if (Array.isArray(value)) {
              // Handle array errors (e.g., experiences, languages)
              value.forEach((item, index) => {
                if (item && typeof item === "object" && !Array.isArray(item)) {
                  processErrors(item as Record<string, unknown>, [
                    ...path,
                    index,
                  ]);
                } else if (item) {
                  // Direct error in array
                  errorPaths.push([...path, index]);
                }
              });
            } else if (!Array.isArray(value)) {
              // Nested object - recurse
              processErrors(value as Record<string, unknown>, path);
            }
          }
        }
      };

      processErrors(errors as Record<string, unknown>);

      const errorStep = getFirstErrorStep(errorPaths);
      if (errorStep) {
        setCurrentStep(errorStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.error("Please fix the errors below", {
          description: "Some fields need attention before submission.",
        });
      } else {
        toast.error("Please fix all errors before submitting", {
          description: "Check the form for missing or invalid fields.",
        });
      }
      return;
    }

    setIsSubmitting(true);
    const data = form.getValues();
    submitMutation.mutate(data);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1UserIdentity initialEmail={initialEmail} />;
      case 2:
        return <Step2ProfessionalBaseline />;
      case 3:
        return <Step3PersonalProfile />;
      case 4:
        return <Step4LanguageProficiency />;
      case 5:
        return <Step5SocialProfiles />;
      case 6:
        return <Step6Availability />;
      case 7:
        return <Step7Skills />;
      case 8:
        return <Step8WorkExperience />;
      case 9:
        return <Step9ResumeVideo />;
      case 10:
        return (
          <Step10Review
            onEditStep={handleEditStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {Array.from(
                { length: TOTAL_STEPS },
                (_: unknown, i: number) => i + 1,
              ).map((step: number) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step < currentStep
                          ? "bg-primary/50 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  {step < TOTAL_STEPS && (
                    <div
                      className={`h-1 w-12 ${
                        step < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </FormProvider>
  );
}
