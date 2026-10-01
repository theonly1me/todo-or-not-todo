import Link from "next/link";
import { Logo } from "@/components/primitives";

export default function NotFound() {
  return <main className="public-page"><Logo /><div className="public-card"><div className="eyebrow">A SMALL DETOUR</div><h1>This one&apos;s<br />gone wandering.</h1><p className="modal-description">This link doesn&apos;t exist, or the todo has been deleted.</p><Link href="/" className="button blue">Back to your next move ↗</Link></div></main>;
}
