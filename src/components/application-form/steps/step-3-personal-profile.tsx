"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
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
import { api } from "@/trpc/react";
import type { ApplicationFormData } from "@/server/api/validators/application";
import {
  getDefaultTimezoneForCountry,
  getCountryCodeFromName,
} from "@/lib/form-utils";

export function Step3PersonalProfile() {
  const {
    control,
    setValue,
    watch,
  } = useFormContext<ApplicationFormData>();

  const { data: countries } = api.application.getCountries.useQuery();

  const countryOfResidence = watch("countryOfResidence");
  const timeZone = watch("timeZone");
  const countryOfOrigin = watch("countryOfOrigin");

  // Find Morocco country ID for defaults
  const moroccoCountry = useMemo(
    () => countries?.find((c) => c.name === "Morocco"),
    [countries],
  );

  // Set defaults on mount
  useEffect(() => {
    if (moroccoCountry && !countryOfResidence) {
      setValue("countryOfResidence", moroccoCountry.id);
      setValue("timeZone", "Africa/Casablanca");
    }
    if (moroccoCountry && !countryOfOrigin) {
      setValue("countryOfOrigin", moroccoCountry.id);
    }
  }, [moroccoCountry, countryOfResidence, countryOfOrigin, setValue]);

  // Auto-set timezone when country changes
  useEffect(() => {
    if (countryOfResidence && countries) {
      const selectedCountry = countries.find(
        (c) => c.id === countryOfResidence,
      );
      if (selectedCountry?.code) {
        const defaultTz = getDefaultTimezoneForCountry(selectedCountry.code);
        setValue("timeZone", defaultTz);
      }
    }
  }, [countryOfResidence, countries, setValue]);

  // Get timezones for selected country
  const selectedCountry = useMemo(
    () => countries?.find((c) => c.id === countryOfResidence),
    [countries, countryOfResidence],
  );

  const countryCode = selectedCountry?.code ?? null;

  const { data: timezones } = api.application.getTimezonesForCountry.useQuery(
    { countryCode: countryCode ?? "US" },
    { enabled: !!countryCode },
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Personal Profile</h2>
        <p className="text-muted-foreground">
          Tell us where you're located and some personal details
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="countryOfResidence"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="countryOfResidence">
                Country of Residence <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="countryOfResidence">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
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

        <Controller
          name="timeZone"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="timeZone">
                Time Zone <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="timeZone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones?.map((tz) => (
                    <SelectItem key={tz.timezone} value={tz.timezone}>
                      {tz.timezone} ({tz.utcOffsetStr})
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

        <Controller
          name="countryOfOrigin"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="countryOfOrigin">Country of Origin</FieldLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger id="countryOfOrigin">
                  <SelectValue placeholder="Select country (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
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

        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input {...field} id="city" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="birthYear"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="birthYear">Birth Year</FieldLabel>
              <Input
                {...field}
                id="birthYear"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value ? Number.parseInt(value, 10) : undefined);
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
