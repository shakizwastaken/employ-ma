"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ApplicationList } from "@/app/admin/_components/application-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";

export function FavoritesPageClient() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
  });

  const { data, isLoading } = api.admin.listFavorites.useQuery(filters);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 fill-current text-primary" />
              Staff Favorites
            </h1>
            <p className="text-muted-foreground mt-1">
              Your favorited job applications
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Favorited Applications ({data?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading favorites...
            </div>
          ) : data?.applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No favorited applications yet. Start favoriting applications to
              see them here.
            </div>
          ) : (
            <ApplicationList
              applications={data?.applications ?? []}
              isLoading={isLoading}
            />
          )}
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

