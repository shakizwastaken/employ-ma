"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface FilterBarProps {
  filters: {
    searchValue: string;
    searchField: "name" | "email" | "category";
    filterStatus: string;
    filterCategory: string;
    limit: number;
    offset: number;
  };
  onFiltersChange: (filters: FilterBarProps["filters"]) => void;
  total: number;
}

export function FilterBar({ filters, onFiltersChange, total }: FilterBarProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search applications..."
              value={filters.searchValue}
              onChange={(e) =>
                onFiltersChange({ ...filters, searchValue: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="searchField">Search In</Label>
            <Select
              value={filters.searchField}
              onValueChange={(value: "name" | "email" | "category") =>
                onFiltersChange({ ...filters, searchField: value })
              }
            >
              <SelectTrigger id="searchField">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.filterStatus || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  filterStatus: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Filter by category..."
              value={filters.filterCategory}
              onChange={(e) =>
                onFiltersChange({ ...filters, filterCategory: e.target.value })
              }
            />
          </div>
        </div>
        {total > 0 && (
          <div className="text-muted-foreground mt-4 text-sm">
            Showing {filters.offset + 1}-
            {Math.min(filters.offset + filters.limit, total)} of {total}{" "}
            applications
          </div>
        )}
      </CardContent>
    </Card>
  );
}
