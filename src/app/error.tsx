"use client";

import { Logo } from "@/components/primitives";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="public-page"><Logo /><div className="public-card"><div className="eyebrow">A LITTLE HICCUP</div><h1>Let&apos;s try<br />that again.</h1><p className="modal-description">We couldn&apos;t load your workspace. Check your database connection and make sure the migrations have been run.</p><button onClick={reset} className="button blue">Try again ↗</button></div></main>;
}
