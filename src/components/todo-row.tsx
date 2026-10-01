"use client";

import { CalendarDays, Check, Flag, GripVertical, MoreHorizontal, Share2, StickyNote, Trash2 } from "lucide-react";
import type { Group, Person, Todo } from "@/lib/model";
import { Avatar } from "./primitives";

type TodoProperties = { todo: Todo; members: Person[]; group?: Group; pending: boolean; onToggle: () => void; onEdit: () => void; onShare: () => void; onDelete: () => void };

export function TodoRow(properties: TodoProperties) {
  const { todo } = properties;
  const person = properties.members.find(member => member.id === todo.assigneeId);
  return <div className={`todo-row ${todo.completed ? "completed" : ""}`}>
    <GripVertical className="todo-grip" size={15} aria-hidden="true" />
    <button className="todo-check" role="checkbox" aria-checked={todo.completed} aria-label={`${todo.completed ? "Reopen" : "Complete"} ${todo.title}`} onClick={properties.onToggle} disabled={properties.pending}>{todo.completed && <Check size={16} strokeWidth={3} />}</button>
    <button className="todo-title" onClick={properties.onEdit}><span>{todo.title}</span>{todo.notes.length > 0 && <span className="notes-indicator"><StickyNote size={12} /> {todo.notes.length}</span>}</button>
    <div className="todo-metadata">{todo.priority === "high" && <span className="priority-tag"><Flag size={11} /> High</span>}{todo.dueDate && <span className="due-date"><CalendarDays size={12} />{new Date(`${todo.dueDate}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}{person && <Avatar person={person} />}</div>
    <details className="todo-menu"><summary aria-label={`Actions for ${todo.title}`}><MoreHorizontal size={20} /></summary><div className="dropdown-menu"><button onClick={properties.onEdit}><StickyNote size={15} /> Edit & notes</button><button onClick={properties.onShare}><Share2 size={15} /> Share todo</button><button className="danger-text" onClick={properties.onDelete}><Trash2 size={15} /> Delete todo</button></div></details>
  </div>;
}
