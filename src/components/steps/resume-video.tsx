"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
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

const VIDEO_EDITOR_CATEGORY = "Video Editor";

export function Step9ResumeVideo() {
  const { control, setValue, watch } = useFormContext<ApplicationFormData>();

  const [uploading, setUploading] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const resumeUrl = watch("resumeUrl");
  const portfolioFileUrl = watch("portfolioFileUrl");
  const category = watch("category");
  const isVideoEditor = category === VIDEO_EDITOR_CATEGORY;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 10MB.",
      });
      e.target.value = ""; // Reset file input
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF, DOC, or DOCX file.",
      });
      e.target.value = ""; // Reset file input
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          errorData.message ?? `Upload failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as { url: string };
      setValue("resumeUrl", data.url);
      toast.success("Resume uploaded successfully", {
        description: "Your resume has been uploaded and saved.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload resume. Please try again.";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePortfolioFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit for videos)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 50MB.",
      });
      e.target.value = ""; // Reset file input
      return;
    }

    // Validate file type (video files)
    const allowedTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    const allowedExtensions = [".mp4", ".mov", ".avi", ".webm", ".mpeg"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      toast.error("Invalid file type", {
        description: "Please upload a video file (MP4, MOV, AVI, WEBM, MPEG).",
      });
      e.target.value = ""; // Reset file input
      return;
    }

    setUploadingPortfolio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "portfolio");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(
          errorData.message ?? `Upload failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as { url: string };
      setValue("portfolioFileUrl", data.url);
      toast.success("Portfolio file uploaded successfully", {
        description: "Your portfolio file has been uploaded and saved.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload portfolio file. Please try again.";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Resume & Video</h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
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

        {isVideoEditor && (
          <Controller
            name="portfolioFileUrl"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="portfolioFile">
                  Portfolio File (Video){" "}
                  {!portfolioFileUrl && (
                    <span className="text-destructive">*</span>
                  )}
                </FieldLabel>
                <div className="space-y-2">
                  <Input
                    id="portfolioFile"
                    type="file"
                    accept="video/*,.mp4,.mov,.avi,.webm,.mpeg"
                    onChange={handlePortfolioFileUpload}
                    disabled={uploadingPortfolio}
                  />
                  {uploadingPortfolio ? (
                    <FieldDescription>Uploading file...</FieldDescription>
                  ) : null}
                  {portfolioFileUrl ? (
                    <div className="bg-muted rounded-md p-2 text-sm">
                      Portfolio file uploaded:{" "}
                      <a
                        href={portfolioFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {portfolioFileUrl}
                      </a>
                    </div>
                  ) : null}
                  <FieldDescription>
                    Accepted formats: MP4, MOV, AVI, WEBM, MPEG (max 50MB)
                  </FieldDescription>
                </div>
                <Input
                  {...field}
                  type="url"
                  placeholder="Or paste portfolio file URL here"
                  className="mt-2"
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

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
