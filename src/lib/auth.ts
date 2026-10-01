import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { database } from "./database";

export const auth = betterAuth({
  appName: "Todoozie",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } } : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? { github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET } } : {}),
  },
  plugins: [emailOTP({
    expiresIn: 300,
    allowedAttempts: 5,
    storeOTP: "hashed",
    async sendVerificationOTP({ email, otp }) {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Email sign-in is not configured.");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: "Your Todoozie sign-in code", text: `Your sign-in code is ${otp}. It expires in 5 minutes. If you didn't request this code, ignore this email.` }),
      });
      if (!response.ok) throw new Error("We couldn't send your code. Please try again.");
    },
  })],
});
