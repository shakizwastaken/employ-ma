import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hiring.ma"),
  title: {
    default: "Find Your Perfect Remote Job | Hiring MA",
    template: "%s | Hiring MA",
  },
  description:
    "Join talented professionals working remotely from anywhere in the world. Discover remote job opportunities in software development, UI/UX design, and virtual assistance. Start your application today.",
  keywords: [
    "remote jobs",
    "remote work",
    "work from home",
    "remote software developer",
    "remote UI/UX designer",
    "virtual assistant",
    "remote opportunities",
    "global remote jobs",
    "remote Python developer",
    "remote Node.js developer",
  ],
  authors: [{ name: "Hiring MA" }],
  creator: "Hiring MA",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Hiring MA",
    title: "Find Your Perfect Remote Job | Hiring MA",
    description:
      "Join talented professionals working remotely from anywhere in the world. Discover remote job opportunities and start your application today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect Remote Job",
    description:
      "Join talented professionals working remotely from anywhere in the world.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        {/* Meta Pixel Code */}
        {Boolean(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1189205430006739');
              fbq('track', 'PageView');
            `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src="https://www.facebook.com/tr?id=1189205430006739&ev=PageView&noscript=1"
                alt=""
              />
            </noscript>
            <Script
              src="https://analytics.rendy.io/api/script.js"
              data-session-replay="true"
              data-track-errors="true"
              data-site-id="2"
              defer
            />
          </>
        )}
        {/* End Meta Pixel Code */}
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
