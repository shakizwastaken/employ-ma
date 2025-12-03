"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface RoleSelectionCardsProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelect: (roleId: string) => void;
  disabled?: boolean;
}

export function RoleSelectionCards({
  roles,
  selectedRoleId,
  onSelect,
  disabled = false,
}: RoleSelectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {roles.map((role, index) => {
        const isSelected = selectedRoleId === role.id;
        return (
          <Card
            key={role.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md",
              "animate-in fade-in-0 slide-in-from-bottom-2",
              isSelected && "ring-primary bg-primary/5 border-primary ring-2",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => !disabled && onSelect(role.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{role.name}</CardTitle>
                {isSelected && (
                  <div className="bg-primary text-primary-foreground animate-in zoom-in-0 flex h-6 w-6 items-center justify-center rounded-full">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardHeader>
            {role.description && (
              <CardContent>
                <CardDescription>{role.description}</CardDescription>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
