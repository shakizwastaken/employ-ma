import { type Metadata } from "next";
import { HydrateClient } from "@/trpc/server";
import { FavoritesPageClient } from "./_components/favorites-page-client";

export const metadata: Metadata = {
  title: "Staff Favorites",
  description: "View favorited applications",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return (
    <HydrateClient>
      <FavoritesPageClient />
    </HydrateClient>
  );
}

