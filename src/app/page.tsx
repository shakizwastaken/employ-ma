import { HydrateClient } from "@/trpc/server";
import { HomeClient } from "./_components/home-client";

export default function Home() {
  return (
    <HydrateClient>
      <HomeClient />
    </HydrateClient>
  );
}
