"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CodeXml, ArrowRight, Mail, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { Configuration, Person } from "@/lib/model";
import { Modal } from "./primitives";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup" | "email" | "code";

export function AuthModal({ configuration, person, onClose, embedded = false }: { configuration: Configuration; person: Person | null; onClose: () => void; embedded?: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    try {
      if (!configuration.ready) { setError("Connect your database and authentication secret first. Setup instructions are in README.md."); return; }
      if (mode === "email") {
        const result = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
        if (result.error) setError(result.error.message ?? "Couldn't send your code.");
        else setMode("code");
        return;
      }
      const result = mode === "signup" ? await authClient.signUp.email({ name, email, password })
        : mode === "code" ? await authClient.signIn.emailOtp({ email, otp: code, name: name || email.split("@")[0] })
          : await authClient.signIn.email({ email, password });
      if (result.error) setError(result.error.message ?? "Couldn't sign in. Please try again.");
      else window.location.reload();
    } catch { setError("Couldn't reach the sign-in service. Please try again."); }
    finally { setPending(false); }
  }
  async function social(provider: "google" | "github") {
    setPending(true); setError("");
    try {
      const result = await authClient.signIn.social({ provider, callbackURL: window.location.href });
      if (result.error) setError(result.error.message ?? "Couldn't connect to this provider.");
    } catch { setError("Couldn't start sign-in. Please try again."); }
    finally { setPending(false); }
  }
  if (person) return <Modal title="YOUR ACCOUNT." onClose={onClose}><p className="modal-description">Signed in as <strong>{person.name}</strong><br />{person.email}</p><button className="button dark full" onClick={async () => { setPending(true); const result = await authClient.signOut(); if (result.error) { setError(result.error.message ?? "Couldn't sign out."); setPending(false); } else { router.push("/"); router.refresh(); onClose(); } }} disabled={pending}><LogOut size={17} /> Sign out</button>{error && <p role="alert" className="form-error">{error}</p>}</Modal>;
  const Surface = embedded ? AuthSurface : Modal;
  return <Surface title={mode === "signup" ? "JOIN THE CLUB." : mode === "code" ? "CHECK YOUR INBOX." : "WELCOME BACK."} onClose={onClose}>
    <p className="modal-description">{mode === "code" ? `Enter the 6-digit code sent to ${email}.` : "Sign in. Take control. Get it done."}</p>
    {(configuration.google || configuration.github) && (mode === "signin" || mode === "signup") && <><div className="oauth-buttons">{configuration.google && <button className="button outline" disabled={pending || !configuration.ready} onClick={() => social("google")}><span className="google-icon">G</span> Google</button>}{configuration.github && <button className="button outline" disabled={pending || !configuration.ready} onClick={() => social("github")}><CodeXml size={18} /> GitHub</button>}</div><div className="or-divider"><span>or with your email</span></div></>}
    <form onSubmit={submit} className="form-stack">
      {mode === "signup" && <label>Your name<input autoComplete="name" value={name} onChange={event => setName(event.target.value)} required maxLength={100} placeholder="What should we call you?" /></label>}
      {mode !== "code" && <label>Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@somewhere.cool" /></label>}
      {(configuration.google || configuration.github) && (mode === "signin" || mode === "signup") && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} required minLength={8} placeholder="At least 8 characters" /></label>}
      {mode === "code" && <label>Sign-in code<input className="code-input" value={code} onChange={event => setCode(event.target.value)} required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="000000" /></label>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="button blue full" disabled={pending}>{pending ? "One moment..." : mode === "signup" ? "Create account" : mode === "email" ? "Send me a code" : "Sign in"}<ArrowRight size={18} /></button>
    </form>
    {mode === "signin" && configuration.email && <button className="text-button full" onClick={() => { setMode("email"); setError(""); }}><Mail size={16} /> Sign in with an email code</button>}
    <p className="auth-switch">{mode === "signin" ? "No account yet?" : "Already have an account?"} <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>{mode === "signin" ? "Create an account" : "Sign in"}</button></p>
    {!configuration.ready && <p className="setup-notice">Real sign-in becomes available once the database and auth secret are configured.</p>}
  </Surface>;
}

function AuthSurface({ title, children }: { title: string; children: ReactNode; onClose: () => void }) {
  return <section className="auth-surface"><div className="modal-heading"><h2>{title}</h2></div>{children}</section>;
}
