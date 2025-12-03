import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient(), emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
