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
import { Checkbox } from "@/components/ui/checkbox";

interface FilterBarProps {
  filters: {
    searchValue: string;
    searchField: "name" | "email" | "category";
    filterStatus: string;
    filterCategory: string;
    filterMinSkills: boolean;
    filterMinExperiences: boolean;
    filterMinSocials: boolean;
    filterHasPortfolio: boolean;
    filterHasNote: boolean;
    filterHasResume: boolean;
    filterHasVideo: boolean;
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
        <div className="mt-4 border-t pt-4">
          <Label className="mb-3 block text-sm font-medium">
            Additional Filters
          </Label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterMinSkills"
                checked={filters.filterMinSkills}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterMinSkills: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterMinSkills"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Minimum 1 skill
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterMinExperiences"
                checked={filters.filterMinExperiences}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterMinExperiences: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterMinExperiences"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Minimum 1 experience
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterMinSocials"
                checked={filters.filterMinSocials}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterMinSocials: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterMinSocials"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Minimum 1 social
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterHasPortfolio"
                checked={filters.filterHasPortfolio}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterHasPortfolio: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterHasPortfolio"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Has portfolio
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterHasNote"
                checked={filters.filterHasNote}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterHasNote: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterHasNote"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Has note
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterHasResume"
                checked={filters.filterHasResume}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterHasResume: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterHasResume"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Has resume
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filterHasVideo"
                checked={filters.filterHasVideo}
                onCheckedChange={(checked) =>
                  onFiltersChange({
                    ...filters,
                    filterHasVideo: checked === true,
                  })
                }
              />
              <Label
                htmlFor="filterHasVideo"
                className="cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Has video
              </Label>
            </div>
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
