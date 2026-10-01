import { notFound } from "next/navigation";
import { z } from "zod";
import { JoinCard } from "@/components/join-card";
import { Logo } from "@/components/primitives";
import { database } from "@/lib/database";
import { configuration, currentPerson } from "@/lib/workspaces";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your workspace invitation | Todoozie", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!z.uuid().safeParse(token).success || !configuration().ready) notFound();
  const result = await database.query<{ name: string }>("SELECT name FROM workspaces WHERE invite_token = $1", [token]);
  const [workspace] = result.rows;
  if (!workspace) notFound();
  const person = await currentPerson();
  return <main className="public-page"><Logo /><div className="public-card"><JoinCard name={workspace.name} token={token} person={person} configuration={configuration()} /></div></main>;
}
