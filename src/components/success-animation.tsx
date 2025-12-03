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
        "bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
        "animate-in fade-in-0 duration-300",
        !isVisible && "animate-out fade-out-0 duration-300",
        className,
      )}
    >
      <div className="bg-card flex flex-col items-center gap-4 rounded-lg border p-8 shadow-lg">
        <div className="relative">
          <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
          <div className="bg-primary relative flex h-16 w-16 items-center justify-center rounded-full">
            <Check className="text-primary-foreground animate-in zoom-in-0 h-8 w-8 duration-300" />
          </div>
        </div>
        {message && (
          <p className="animate-in fade-in-0 slide-in-from-bottom-2 text-center text-lg font-medium duration-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
