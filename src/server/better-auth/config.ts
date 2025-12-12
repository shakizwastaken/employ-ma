import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, admin } from "better-auth/plugins";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", 
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },
  },
  plugins: [
    organization({
      // Optional: Send invitation emails
      // async sendInvitationEmail(data) {
      //   const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;
      //   // Implement your email sending logic here
      //   // await sendEmail({
      //   //   to: data.email,
      //   //   subject: `Invitation to join ${data.organization.name}`,
      //   //   body: `You've been invited to join ${data.organization.name}. Click here to accept: ${inviteLink}`,
      //   // });
      // },
    }),
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
