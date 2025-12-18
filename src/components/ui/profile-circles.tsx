import * as React from "react";
import { cn } from "@/lib/utils";

interface ProfileCircleProps {
  name: string;
  email?: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export function ProfileCircle({
  name,
  email,
  image,
  size = "md",
  className,
}: ProfileCircleProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-white border-2 border-background shadow-sm",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
      title={email ? `${name} (${email})` : name}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="rounded-full w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

interface ProfileCirclesProps {
  profiles: Array<{
    id: string;
    name: string;
    email?: string;
    image?: string | null;
  }>;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileCircles({
  profiles,
  maxVisible = 3,
  size = "md",
  className,
}: ProfileCirclesProps) {
  if (profiles.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">—</span>
    );
  }

  const visible = profiles.slice(0, maxVisible);
  const remaining = profiles.length - maxVisible;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visible.map((profile, index) => (
        <ProfileCircle
          key={profile.id}
          name={profile.name}
          email={profile.email}
          image={profile.image}
          size={size}
          className={index > 0 ? "-ml-2" : ""}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-medium text-muted-foreground bg-muted border-2 border-background shadow-sm",
            size === "sm" ? "h-6 w-6 text-xs" : size === "md" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base",
            "-ml-2"
          )}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

