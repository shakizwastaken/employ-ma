"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  status: string | null;
  createdAt: Date;
  isPublic: boolean;
  publicToken: string | null;
}

interface ApplicationListProps {
  applications: Application[];
  isLoading: boolean;
  onSelectApplication: (id: string) => void;
  onRefresh?: () => void;
}

export function ApplicationList({
  applications,
  isLoading,
  onSelectApplication,
  onRefresh: _onRefresh,
}: ApplicationListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading applications...
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No applications found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell
                className="font-medium"
                onClick={() => onSelectApplication(app.id)}
              >
                {app.firstName} {app.lastName}
              </TableCell>
              <TableCell onClick={() => onSelectApplication(app.id)}>
                {app.email}
              </TableCell>
              <TableCell onClick={() => onSelectApplication(app.id)}>
                <Badge variant="secondary">{app.category}</Badge>
              </TableCell>
              <TableCell onClick={() => onSelectApplication(app.id)}>
                <Badge
                  variant={
                    app.status === "active" ? "default" : "secondary"
                  }
                >
                  {app.status ?? "active"}
                </Badge>
              </TableCell>
              <TableCell onClick={() => onSelectApplication(app.id)}>
                <Badge variant={app.isPublic ? "default" : "outline"}>
                  {app.isPublic ? "Public" : "Private"}
                </Badge>
              </TableCell>
              <TableCell onClick={() => onSelectApplication(app.id)}>
                {new Date(app.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectApplication(app.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {app.isPublic && app.publicToken && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/application/${app.publicToken}`;
                        void navigator.clipboard.writeText(url);
                      }}
                      title="Copy shareable link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

