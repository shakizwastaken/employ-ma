"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PublicLinkToggleProps {
  applicationId: string;
  isPublic: boolean;
  onToggle: () => void;
}

export function PublicLinkToggle({
  applicationId,
  isPublic,
  onToggle,
}: PublicLinkToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const toggleMutation = api.admin.togglePublicLink.useMutation({
    onSuccess: (data) => {
      setIsToggling(false);
      if (data.isPublic) {
        toast.success("Application is now public. Shareable link generated.");
      } else {
        toast.success("Application is now private.");
      }
      onToggle();
    },
    onError: (error) => {
      setIsToggling(false);
      toast.error(error.message || "Failed to toggle public link");
    },
  });

  const handleToggle = (checked: boolean) => {
    setIsToggling(true);
    toggleMutation.mutate({
      applicationId,
      isPublic: checked,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isToggling}
      />
      <Label htmlFor="public-toggle" className="cursor-pointer">
        {isPublic ? "Public" : "Private"}
      </Label>
    </div>
  );
}

