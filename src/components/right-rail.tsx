"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Lightbulb, Paperclip, Plus, Sparkles } from "lucide-react";
import type { Mutation, Workspace } from "@/lib/model";
import { RaceCard } from "./races";
import { Star } from "./primitives";

export function RightRail({ workspace, pending, onMutation, onRace, onStartRace, notify }: { workspace: Workspace; pending: boolean; onMutation: (mutation: Mutation) => Promise<boolean>; onRace: () => void; onStartRace: () => void; notify: (message: string) => void }) {
  const [note, setNote] = useState("");
  const [selectedTodo, setSelectedTodo] = useState("");
  async function attach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const todo = workspace.board.todos.find(item => item.id === selectedTodo);
    if (!todo) { notify("Choose a todo to attach your note to."); return; }
    if (await onMutation({ type: "update-todo", id: todo.id, changes: { notes: [...todo.notes, { id: crypto.randomUUID(), text: note.trim() }] } })) { setNote(""); notify("Note linked."); }
  }
  return <aside className="right-rail">
    <div className="rail-heading"><h2>SIDE QUESTS /</h2><Sparkles size={17} /></div>
    <section className="quick-note"><span className="note-tape" /><div className="quick-note-heading"><Lightbulb size={18} /><h3>FIELD NOTES</h3><ArrowUpRight size={17} /></div>
      <form onSubmit={attach}><textarea aria-label="Quick note" placeholder={"Ideas. Plans. Loose ends.\nAttach a note to a todo."} value={note} onChange={event => setNote(event.target.value)} maxLength={5000} required /><div className="quick-note-footer"><Paperclip size={14} /><select required aria-label="Link note to todo" value={selectedTodo} onChange={event => setSelectedTodo(event.target.value)}><option value="">Link to a todo</option>{workspace.board.todos.map(todo => <option key={todo.id} value={todo.id}>{todo.title}</option>)}</select><button aria-label="Save linked note" disabled={pending || !note.trim()}><Plus size={19} /></button></div></form>
    </section>
    <RaceCard workspace={workspace} onStart={onStartRace} onOpen={onRace} />
    <div className="manifesto"><Star /><div><strong>DONE &gt;<br />PERFECT.</strong><span>MAKE YOUR MOVE.</span></div><ArrowRight size={20} /></div>
  </aside>;
}
