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

  const handleEmailBlur = () =>
    email?.includes("@") && void emailQuery.refetch();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">User Identity</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Let&apos;s start with your basic information
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
                value={field.value ?? ""}
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
                value={field.value ?? ""}
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
                value={field.value ?? ""}
                onBlur={() => {
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
                placeholder="+212 (00) 000-0000"
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Please include country code (e.g., +212 for Morocco)
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
