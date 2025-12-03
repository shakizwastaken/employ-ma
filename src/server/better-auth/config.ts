import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/google",
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
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: Implement actual email sending service
        // For now, log to console (replace with actual email service)
        console.log(`[Email OTP] ${type} OTP for ${email}: ${otp}`);

        // Example implementation:
        // if (type === "sign-in") {
        //   await sendEmail({
        //     to: email,
        //     subject: "Your sign-in code",
        //     body: `Your OTP code is: ${otp}`,
        //   });
        // } else if (type === "email-verification") {
        //   await sendEmail({
        //     to: email,
        //     subject: "Verify your email",
        //     body: `Your verification code is: ${otp}`,
        //   });
        // } else {
        //   await sendEmail({
        //     to: email,
        //     subject: "Reset your password",
        //     body: `Your password reset code is: ${otp}`,
        //   });
        // }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
