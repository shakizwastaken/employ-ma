"use client";

import { useState } from "react";
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

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  type?: "email-verification" | "sign-in";
  isLoading?: boolean;
  error?: string | null;
}

export function OtpVerification({
  email,
  onVerify,
  onResend,
  type = "email-verification",
  isLoading = false,
  error: externalError,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const displayError = externalError || error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "email-verification"
            ? "Verify Your Email"
            : "Enter Verification Code"}
        </CardTitle>
        <CardDescription>
          {type === "email-verification"
            ? `We've sent a verification code to ${email}. Please enter it below.`
            : `Enter the code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {displayError && (
              <Field>
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {displayError}
                </div>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  setError(null);
                }}
                maxLength={6}
                required
                disabled={isLoading || isVerifying}
                className="text-center text-2xl tracking-widest"
              />
              <FieldDescription>
                Enter the 6-digit code sent to your email
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isVerifying || otp.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </Field>
              {onResend && (
                <Field>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </Button>
                </Field>
              )}
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

