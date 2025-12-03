"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  message?: string;
  className?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({
  message,
  className,
  onComplete,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        "animate-in fade-in-0 duration-300",
        !isVisible && "animate-out fade-out-0 duration-300",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 bg-primary rounded-full">
            <Check className="h-8 w-8 text-primary-foreground animate-in zoom-in-0 duration-300" />
          </div>
        </div>
        {message && (
          <p className="text-lg font-medium text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

