"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";

interface Step1UserIdentityProps {
  initialEmail?: string;
}

export function Step1UserIdentity({ initialEmail }: Step1UserIdentityProps) {
  const { control, setValue, watch } = useFormContext<ApplicationFormData>();

  const email = watch("email");
  const emailQuery = api.application.checkEmailUnique.useQuery(
    { email },
    {
      enabled: false, // Don't auto-fetch
      retry: false,
    },
  );

  useEffect(() => {
    if (initialEmail) {
      setValue("email", initialEmail);
    }
  }, [initialEmail, setValue]);

  const handleEmailBlur = () => {
    if (email && email.includes("@")) {
      emailQuery.refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">User Identity</h2>
        <p className="text-muted-foreground">
          Let's start with your basic information
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="firstName"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="lastName"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={
                fieldState.invalid ||
                (emailQuery.data && !emailQuery.data.isUnique)
              }
            >
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                onBlur={(e) => {
                  field.onBlur();
                  handleEmailBlur();
                }}
                aria-invalid={
                  fieldState.invalid ||
                  (emailQuery.data && !emailQuery.data.isUnique)
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {emailQuery.data && !emailQuery.data.isUnique && (
                <FieldError>This email is already registered</FieldError>
              )}
              {emailQuery.data?.isUnique && email && email.includes("@") && (
                <FieldDescription className="text-green-600">
                  Email is available
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phoneNumber">
                Phone Number <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Please include country code (e.g., +1 for USA)
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
