"use client";

import { ArrowUpRight, CheckCheck, ChevronRight, Flag, ListTodo, Plus, Search, Users } from "lucide-react";
import { Avatar, Star } from "./primitives";
import type { Person, Workspace } from "@/lib/model";

export function AppHeader({ workspace, person, onInvite, onAuth }: { workspace: Workspace; person: Person; onInvite: () => void; onAuth: () => void }) {
  return <header className="app-header"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13} /><strong>{workspace.name}</strong></div><div className="header-actions"><div className="avatar-stack">{workspace.members.slice(0, 3).map(member => <Avatar key={member.id} person={member} />)}</div><button className="button invite-button" onClick={onInvite}><Users size={14} /> Invite friends</button><span className="header-separator" /><button className="icon-button account-avatar" aria-label={"Your account"} onClick={onAuth}><Avatar person={person} /></button></div></header>;
}

export function BoardIntro({ workspace, title }: { workspace: Workspace; title: string }) {
  const completed = workspace.board.todos.filter(todo => todo.completed).length;
  const active = workspace.board.todos.length - completed;
  const percentage = workspace.board.todos.length ? Math.round(100 * completed / workspace.board.todos.length) : 0;
  return <><div className="board-intro"><div><div className="eyebrow"><span className="tiny-star">↗</span> YOUR WORKSPACE. YOUR RULES.</div><h1>{title === "All todos" ? <>LESS TALK.<br /><span>MORE DONE.</span></> : title}</h1><p>{title === "All todos" ? "Get your chaos in order. One task at a time." : "Pick your next move. Make it happen."}</p></div><div className="do-your-thing"><Star /><span>NO<br /><strong>EXCUSES</strong><ArrowUpRight size={26} /></span></div></div>
    <div className="stats"><div className="stat"><span className="stat-icon blue"><ListTodo size={21} /></span><div><strong>{active.toString().padStart(2, "0")}</strong><span>Active todos</span></div><span className="stat-doodle">↗</span></div><div className="stat"><span className="stat-icon green"><CheckCheck size={22} /></span><div><strong>{completed.toString().padStart(2, "0")}</strong><span>Completed</span></div><span className="stat-doodle green-text">✳</span></div><div className="stat progress-stat"><span className="stat-icon pink"><Flag size={21} /></span><div><strong>{percentage}<small>%</small></strong><span>Clear rate</span></div><div className="stat-progress"><span style={{ height: `${Math.max(percentage, 8)}%` }} /></div></div></div>
  </>;
}

export function BoardToolbar({ search, setSearch, onAdd, onGroup }: { search: string; setSearch: (value: string) => void; onAdd: () => void; onGroup: () => void }) {
  return <div className="board-toolbar"><div className="list-heading"><span className="mini-spark">✳</span><h2>TASKS /</h2></div><div className="toolbar-actions"><label className="search-field"><Search size={15} /><input aria-label="Search todos" placeholder="Find a todo..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>/</kbd></label><button className="button outline group-button" onClick={onGroup}><Plus size={15} /> Group</button><button className="button dark" onClick={onAdd}><Plus size={17} /> New todo</button></div></div>;
}
