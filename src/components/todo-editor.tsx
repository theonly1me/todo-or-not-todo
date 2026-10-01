"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { type Mutation, type Todo, type Workspace } from "@/lib/model";
import { Modal } from "./primitives";

type EditorProperties = { workspace: Workspace; todo?: Todo; groupId: string | null; personId: string; pending: boolean; onSave: (mutation: Mutation) => Promise<boolean>; onClose: () => void };

export function TodoEditor(properties: EditorProperties) {
  const { todo, workspace, pending, onClose, onSave } = properties;
  const [title, setTitle] = useState(todo?.title ?? "");
  const [groupId, setGroupId] = useState(todo?.groupId ?? properties.groupId ?? "");
  const [assigneeId, setAssigneeId] = useState(todo?.assigneeId ?? properties.personId);
  const [priority, setPriority] = useState<Todo["priority"]>(todo?.priority ?? "normal");
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? "");
  const [notes, setNotes] = useState(todo?.notes ?? []);
  const [note, setNote] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updatedNotes = note.trim() ? [...notes, { id: crypto.randomUUID(), text: note.trim() }] : notes;
    const changes = { title: title.trim(), groupId: groupId || null, assigneeId: assigneeId || null, priority, dueDate, notes: updatedNotes };
    const mutation: Mutation = todo ? { type: "update-todo", id: todo.id, changes } : { type: "add-todo", todo: { id: crypto.randomUUID(), ...changes, completed: false, completedAt: null } };
    if (await onSave(mutation)) onClose();
  }
  return <Modal title={todo ? "Make it your own." : "What's the next little thing?"} onClose={onClose} wide>
    <form className="form-stack" onSubmit={submit}>
      <label>Todo<input autoFocus required maxLength={300} value={title} onChange={event => setTitle(event.target.value)} placeholder="Give your next move a name..." /></label>
      <div className="form-row"><label>Group<select value={groupId} onChange={event => setGroupId(event.target.value)}><option value="">No group</option>{workspace.board.groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label>Assigned to<select value={assigneeId} onChange={event => setAssigneeId(event.target.value)}><option value="">Unassigned</option>{workspace.members.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label></div>
      <div className="form-row"><label>Priority<select value={priority} onChange={event => setPriority(z.enum(["normal", "high", "low"]).parse(event.target.value))}><option value="normal">Normal</option><option value="high">High priority</option><option value="low">Low priority</option></select></label><label>Due date<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label></div>
      <label>Linked notes</label>
      <div className="editor-notes">{notes.map(item => <div className="editor-note" key={item.id}><textarea aria-label="Edit linked note" value={item.text} maxLength={5000} required onChange={event => setNotes(notes.map(existing => existing.id === item.id ? { ...existing, text: event.target.value } : existing))} /><button type="button" className="icon-button" aria-label="Remove note" onClick={() => setNotes(notes.filter(existing => existing.id !== item.id))}><Trash2 size={16} /></button></div>)}</div>
      <textarea aria-label="New linked note" placeholder="An idea, a link, a brain dump. Put it here." value={note} onChange={event => setNote(event.target.value)} maxLength={5000} rows={3} />
      <button type="button" className="text-button" disabled={!note.trim() || notes.length >= 29} onClick={() => { setNotes([...notes, { id: crypto.randomUUID(), text: note.trim() }]); setNote(""); }}><Plus size={15} /> Attach note</button>
      <div className="modal-actions"><button type="button" className="button outline" onClick={onClose}>Cancel</button><button disabled={pending} className="button blue">{pending ? "Saving..." : todo ? "Save changes" : "Add todo"}<ArrowRight size={17} /></button></div>
    </form>
  </Modal>;
}
