"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormStepNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  className?: string;
}

export function FormStepNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isSubmitting = false,
  nextLabel = "Next",
  previousLabel = "Previous",
  className,
}: FormStepNavigationProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-2 flex items-center justify-between gap-4 border-t pt-6",
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        className="transition-all duration-150 hover:scale-105"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {previousLabel}
      </Button>

      <Button
        type="submit"
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="transition-all duration-150 hover:scale-105"
      >
        {isSubmitting ? "Submitting..." : nextLabel}
        {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}
