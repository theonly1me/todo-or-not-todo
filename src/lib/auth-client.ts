"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient as createManagedAuthClient } from "@neondatabase/auth/next";
import { authResult } from "./auth-result";

const localClient = createAuthClient({ plugins: [emailOTPClient()] });
const managedClient = createManagedAuthClient();
const managed = process.env.NEXT_PUBLIC_MANAGED_AUTH === "true";

export const authClient = {
  signUp: { email: (options: { name: string; email: string; password: string }) => authResult(() => managed ? managedClient.signUp.email(options) : localClient.signUp.email(options)) },
  signIn: {
    email: (options: { email: string; password: string }) => authResult(() => managed ? managedClient.signIn.email(options) : localClient.signIn.email(options)),
    emailOtp: (options: { email: string; otp: string; name?: string }) => authResult(() => managed ? managedClient.signIn.emailOtp(options) : localClient.signIn.emailOtp(options)),
    social: (options: { provider: "google" | "github"; callbackURL: string }) => authResult(() => managed ? managedClient.signIn.social(options) : localClient.signIn.social(options)),
  },
  emailOtp: { sendVerificationOtp: (options: { email: string; type: "sign-in" }) => authResult(() => managed ? managedClient.emailOtp.sendVerificationOtp(options) : localClient.emailOtp.sendVerificationOtp(options)) },
  signOut: () => authResult(() => managed ? managedClient.signOut() : localClient.signOut()),
};
