"use client";

import { ArrowUpRight, Crosshair } from "lucide-react";
import type { Configuration } from "@/lib/model";
import { AuthModal } from "./auth-modal";
import { Logo } from "./primitives";

export function SignInPage({ configuration }: { configuration: Configuration }) {
  return <main className="login-page">
    <header className="login-header"><Logo /><span>YOUR LIFE. YOUR CALL.</span><span className="login-status"><span /> SYSTEM ONLINE</span></header>
    <div className="login-layout"><section className="login-hero"><div className="eyebrow"><Crosshair size={16} /> THE ANTI-PROCRASTINATION CLUB</div><h1>TO DO.<br /><span>OR NOT</span><br />TO DO<span className="hero-period">.</span></h1><p>Less talk. More done.<br />Get your chaos in order. Bring your crew.</p><div className="hero-rule"><span>01 / MAKE YOUR MOVE</span><ArrowUpRight size={28} /></div><div className="hero-sticker">NO<br />EXCUSES<span>JUST START.</span></div></section>
      <div className="login-form-wrap"><div className="login-form-label"><span>ACCESS / 001</span><span>MEMBERS ONLY</span></div><AuthModal embedded configuration={configuration} person={null} onClose={() => undefined} /><div className="login-form-footer"><Crosshair size={14} /><span>ONE TASK. THEN THE NEXT.</span></div></div>
    </div>
    <footer className="login-footer"><span>TODO / NOT TODO © 2026</span><span>WORK SOLO. RUN WITH A CREW. RACE TO THE FINISH.</span><span>BUILT TO GET IT DONE ↗</span></footer>
  </main>;
}
