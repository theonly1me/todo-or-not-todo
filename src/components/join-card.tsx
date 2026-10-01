"use client";

import { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { joinWorkspace } from "@/app/actions";
import type { Configuration, Person } from "@/lib/model";
import { AuthModal } from "./auth-modal";
import { useRouter } from "next/navigation";

export function JoinCard({ name, token, person, configuration }: { name: string; token: string; person: Person | null; configuration: Configuration }) {
  const [showAuth, setShowAuth] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function join() {
    if (!person) { setShowAuth(true); return; }
    setPending(true);
    try {
      const result = await joinWorkspace(token);
      if (result.error) { setError(result.error); setPending(false); }
      else if (result.data) { router.push(`/?workspace=${result.data}`); router.refresh(); }
    } catch { setError("Couldn't join this workspace. Please try again."); setPending(false); }
  }
  return <><div className="eyebrow"><Users size={15} /> YOUR PEOPLE ARE HERE</div><h1>Good chaos.<br />Better company.</h1><p className="modal-description">You&apos;ve been invited to <strong>{name}</strong>. Join to add todos, share notes, and race your friends to the finish line.</p><button className="button blue full" disabled={pending} onClick={join}>{pending ? "Joining..." : person ? "Join workspace" : "Sign in to join"}<ArrowRight size={17} /></button>{error && <p className="form-error" role="alert">{error}</p>}{showAuth && <AuthModal configuration={configuration} person={person} onClose={() => setShowAuth(false)} />}</>;
}
