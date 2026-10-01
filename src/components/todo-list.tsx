"use client";

import { ChevronDown, MoreHorizontal, Plus, Share2, StickyNote, Trash2, Pencil } from "lucide-react";
import type { Group, Todo, Workspace } from "@/lib/model";
import { TodoRow } from "./todo-row";
import type { View } from "./sidebar";

type ListProperties = { workspace: Workspace; view: View; groupId: string | null; personId: string; search: string; filter: "all" | "active" | "completed"; cards: boolean; pending: boolean; onToggle: (todo: Todo) => void; onEdit: (todo: Todo) => void; onShare: (todo: Todo) => void; onDelete: (todo: Todo) => void; onAdd: (groupId: string | null) => void; onRenameGroup: (group: Group) => void; onDeleteGroup: (group: Group) => void };

export function TodoList(properties: ListProperties) {
  const { workspace, view, groupId, filter, search } = properties;
  const todos = workspace.board.todos.filter(todo =>
    (view !== "completed" || todo.completed) && (view !== "assigned" || todo.assigneeId === properties.personId)
    && (view !== "group" || todo.groupId === groupId) && (filter !== "active" || !todo.completed)
    && (filter !== "completed" || todo.completed) && todo.title.toLowerCase().includes(search.toLowerCase()));
  const sections: { group: Group | null; todos: Todo[] }[] = [...workspace.board.groups.map(group => ({ group, todos: todos.filter(todo => todo.groupId === group.id) })), { group: null, todos: todos.filter(todo => !todo.groupId) }].filter(section => view === "group" ? section.group?.id === groupId : section.todos.length > 0);
  if (!todos.length && view !== "group") return <div className="empty-state"><span>✳</span><h3>YOUR NEXT MOVE.</h3><p>{search ? "No todos match your search." : view === "completed" ? "Your completed todos will land here." : "Your workspace is empty. Add your first todo."}</p><button className="button outline" onClick={() => properties.onAdd(null)}><Plus size={16} /> Add a todo</button></div>;
  return <div className={properties.cards ? "todo-sections card-view" : "todo-sections"}>{sections.map(section => <section className="todo-section" key={section.group?.id ?? "ungrouped"}>
    <div className="group-heading"><ChevronDown size={16} /><span className={`group-dot ${section.group?.color ?? "orange"}`} /><h3>{section.group?.name ?? "UNGROUPED"}</h3><span className="group-total">{section.todos.length}</span>
      {section.group && <details className="group-menu"><summary aria-label={`Manage ${section.group.name}`}><MoreHorizontal size={20} /></summary><div className="dropdown-menu"><button onClick={() => section.group && properties.onRenameGroup(section.group)}><Pencil size={14} /> Rename group</button><button className="danger-text" onClick={() => section.group && properties.onDeleteGroup(section.group)}><Trash2 size={14} /> Delete group</button></div></details>}
    </div>
    <div className="group-rows">{section.todos.map(todo => <TodoRow key={todo.id} todo={todo} members={workspace.members} pending={properties.pending} onToggle={() => properties.onToggle(todo)} onEdit={() => properties.onEdit(todo)} onShare={() => properties.onShare(todo)} onDelete={() => properties.onDelete(todo)} />)}<button className="add-inline" onClick={() => properties.onAdd(section.group?.id ?? null)}><Plus size={15} /> Add a todo</button></div>
  </section>)}</div>;
}

export function NotesList({ workspace, onEdit, search }: { workspace: Workspace; onEdit: (todo: Todo) => void; search: string }) {
  const notes = workspace.board.todos.flatMap(todo => todo.notes.map(note => ({ ...note, todo }))).filter(note => `${note.text} ${note.todo.title}`.toLowerCase().includes(search.toLowerCase()));
  return notes.length ? <div className="notes-grid">{notes.map(note => <button className="note-card" onClick={() => onEdit(note.todo)} key={note.id}><StickyNote size={19} /><p>{note.text}</p><span><Share2 size={12} /> {note.todo.title}</span></button>)}</div> : <div className="empty-state"><StickyNote size={35} /><h3>NO NOTES YET.</h3><p>Open a todo and attach your first note.</p></div>;
}
