"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationFormData } from "@/server/api/validators/application";

export function Step9ResumeVideo() {
  const { control, setValue, watch } = useFormContext<ApplicationFormData>();

  const [uploading, setUploading] = useState(false);
  const resumeUrl = watch("resumeUrl");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = (await response.json()) as { url: string };
      setValue("resumeUrl", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      // For now, set a placeholder URL
      // In production, handle error properly
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Resume & Video</h2>
        <p className="text-muted-foreground">
          Share your resume and optionally a video introduction
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="resumeUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="resume">Resume</FieldLabel>
              <div className="space-y-2">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <FieldDescription>Uploading file...</FieldDescription>
                ) : null}
                {resumeUrl ? (
                  <div className="bg-muted rounded-md p-2 text-sm">
                    Resume uploaded: {resumeUrl}
                  </div>
                ) : null}
                <FieldDescription>
                  Accepted formats: PDF, DOC, DOCX (max 10MB)
                </FieldDescription>
              </div>
              <Input
                {...field}
                type="url"
                placeholder="Or paste resume URL here"
                className="mt-2"
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="videoUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="videoUrl">Video URL</FieldLabel>
              <Input
                {...field}
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Link to a video introduction (YouTube, Vimeo, etc.)
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="notes">
                Additional Notes (Optional)
              </FieldLabel>
              <Textarea
                {...field}
                id="notes"
                placeholder="Any additional information you'd like to share..."
                rows={4}
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
}
