import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCheck, Circle, StickyNote } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/primitives";
import { database } from "@/lib/database";
import { boardSchema } from "@/lib/model";

export const dynamic = "force-dynamic";
export const metadata = { title: "A little something shared with you | Todoozie", robots: { index: false, follow: false } };

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!z.uuid().safeParse(token).success || !process.env.DATABASE_URL) notFound();
  const result = await database.query("SELECT w.board, s.todo_id FROM shared_todos s JOIN workspaces w ON w.id = s.workspace_id WHERE s.token = $1", [token]);
  const [raw] = result.rows;
  if (!raw) notFound();
  const row = z.object({ board: boardSchema, todo_id: z.string() }).parse(raw);
  const todo = row.board.todos.find(item => item.id === row.todo_id);
  if (!todo) notFound();
  return <main className="public-page"><Logo /><article className="public-card"><div className="eyebrow">A LITTLE SOMETHING SHARED WITH YOU</div><h1>{todo.title}</h1><div className="public-completion">{todo.completed ? <CheckCheck size={17} /> : <Circle size={14} />} {todo.completed ? "Completed. A little victory." : "A work in progress."}</div>{todo.dueDate && <p className="modal-description">Due {todo.dueDate}</p>}{todo.notes.length > 0 && <section className="public-notes"><h2><StickyNote size={15} /> LINKED NOTES</h2>{todo.notes.map(note => <p className="public-note" key={note.id}>{note.text}</p>)}</section>}<footer>This is a read-only todo. <Link href="/">Make a little progress of your own ↗</Link></footer></article></main>;
}
