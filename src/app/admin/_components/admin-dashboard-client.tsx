"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { ApplicationList } from "./application-list";
import { ApplicationDetail } from "./application-detail";
import { FilterBar } from "./filter-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export function AdminDashboardClient() {
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState({
    searchValue: "",
    searchField: "name" as "name" | "email" | "category",
    filterStatus: "",
    filterCategory: "",
    filterMinSkills: false,
    filterMinExperiences: false,
    filterMinSocials: false,
    filterHasPortfolio: false,
    filterHasNote: false,
    filterHasResume: false,
    filterHasVideo: false,
    limit: 50,
    offset: 0,
  });

  const { data, isLoading, refetch } =
    api.admin.listApplications.useQuery(filters);

  const exportMutation = api.admin.exportApplications.useMutation({
    onSuccess: (result) => {
      if (result.format === "csv") {
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `applications-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Applications exported as CSV");
      } else {
        const blob = new Blob([result.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `applications-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Applications exported as JSON");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export applications");
    },
  });

  const handleExport = (format: "csv" | "json") => {
    exportMutation.mutate({
      format,
      filterStatus: filters.filterStatus || undefined,
      filterCategory: filters.filterCategory || undefined,
    });
  };

  if (selectedApplicationId) {
    return (
      <ApplicationDetail
        applicationId={selectedApplicationId}
        onBack={() => setSelectedApplicationId(null)}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review job applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={exportMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            disabled={exportMutation.isPending}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        total={data?.total ?? 0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Applications ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicationList
            applications={data?.applications ?? []}
            isLoading={isLoading}
            onSelectApplication={setSelectedApplicationId}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>

      {data && data.total > filters.limit && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                offset: Math.max(0, prev.offset - prev.limit),
              }))
            }
            disabled={filters.offset === 0}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {Math.floor(filters.offset / filters.limit) + 1} of{" "}
            {Math.ceil(data.total / filters.limit)}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                offset: prev.offset + prev.limit,
              }))
            }
            disabled={filters.offset + filters.limit >= data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
