import { type Metadata } from "next";
import { HydrateClient } from "@/trpc/server";
import { HomeClient } from "./_components/home-client";
import openJobsData from "@/lib/open-jobs.json";

export const metadata: Metadata = {
  title: "Find Your Perfect Remote Job",
  description:
    "Join talented professionals working remotely from anywhere in the world. Discover remote job opportunities in software development, UI/UX design, and virtual assistance. Start your application today.",
  openGraph: {
    title: "Find Your Perfect Remote Job | Hiring MA",
    description:
      "Join talented professionals working remotely from anywhere in the world. Discover remote job opportunities and start your application today.",
  },
};

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hiring.ma";

  // Structured data for job postings
  const jobPostingStructuredData = openJobsData.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.name.replace("[URGENT]: ", ""),
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "Hiring MA",
      value: job.id,
    },
    datePosted: new Date().toISOString(),
    employmentType: "FULL_TIME",
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "Remote",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Anywhere",
    },
    skills: job.requirements.filter((req) => req !== "Good English Required"),
    qualifications: job.requirements,
    url: `${baseUrl}/apply`,
  }));

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hiring MA",
    url: baseUrl,
    description:
      "Find your perfect remote job. Join talented professionals working remotely from anywhere in the world.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/apply`,
      },
      "query-input": "required name=email",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      {jobPostingStructuredData.map((job, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(job),
          }}
        />
      ))}
      <HydrateClient>
        <HomeClient />
      </HydrateClient>
    </>
  );
}
