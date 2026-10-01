"use client";

import { CheckCheck, ChevronDown, CircleHelp, Flag, FolderOpen, LayoutGrid, Plus, Sparkles, StickyNote, Users, Zap } from "lucide-react";
import { Avatar, Logo } from "./primitives";
import type { Group, Person, Workspace } from "@/lib/model";
import { useRouter } from "next/navigation";

export type View = "all" | "completed" | "assigned" | "notes" | "races" | "group";

type SidebarProperties = {
  workspace: Workspace; workspaces: { id: string; name: string }[]; person: Person;
  view: View; groupId: string | null; onView: (view: View) => void;
  onGroup: (group: Group) => void; onNewGroup: () => void; onWorkspace: () => void; onAuth: () => void;
};

export function Sidebar(properties: SidebarProperties) {
  const { workspace, person, view, groupId, onView } = properties;
  const router = useRouter();
  const remaining = workspace.board.todos.filter(todo => !todo.completed).length;
  const links = [
    { id: "all", label: "All todos", icon: LayoutGrid, count: remaining },
    { id: "assigned", label: "Assigned to me", icon: Flag, count: workspace.board.todos.filter(todo => !todo.completed && todo.assigneeId === person.id).length },
    { id: "completed", label: "Completed", icon: CheckCheck, count: undefined },
    { id: "notes", label: "Linked notes", icon: StickyNote, count: undefined },
  ] as const;
  return <aside className="sidebar">
    <Logo />
    <div className="workspace-picker"><span className="workspace-symbol">{workspace.name[0]}</span><div><small>WORKSPACE</small><select aria-label="Switch workspace" value={workspace.id} onChange={event => { router.push(`/?workspace=${encodeURIComponent(event.target.value)}`); }}>
      {properties.workspaces.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
    </select></div><ChevronDown size={14} /></div>
    <nav aria-label="Main navigation" className="main-nav">{links.map(link => <button key={link.id} className={`nav-item ${view === link.id ? "active" : ""}`} onClick={() => onView(link.id)}><link.icon size={18} /><span>{link.label}</span>{link.count !== undefined && <span className="nav-count">{link.count}</span>}</button>)}</nav>
    <div className="sidebar-label"><span>GROUPS /</span><button className="icon-button" aria-label="Create group" onClick={properties.onNewGroup}><Plus size={17} /></button></div>
    <nav aria-label="Todo groups" className="group-nav">{workspace.board.groups.map(group => <button key={group.id} className={`nav-item ${view === "group" && groupId === group.id ? "selected-group" : ""}`} onClick={() => properties.onGroup(group)}><span className={`group-dot ${group.color}`} /><span>{group.name}</span><span className="group-count">{workspace.board.todos.filter(todo => todo.groupId === group.id && !todo.completed).length}</span></button>)}</nav>
    <div className="sidebar-divider" />
    <button className={`nav-item ${view === "races" ? "active" : ""}`} onClick={() => onView("races")}><Zap size={19} /><span>Todo races</span><span className="new-label">NEW</span></button>
    <button className="nav-item" onClick={properties.onWorkspace}><Users size={19} /><span>Create workspace</span><Plus size={15} /></button>
    <div className="sidebar-bottom"><div className="sidebar-sticker"><Sparkles size={23} /><strong>LESS TALK.<br />MORE DONE.</strong><span>THIS IS YOUR STARTING LINE.</span></div>
      <button className="help-link" onClick={() => window.open("https://github.com/theonly1me/todo-or-not-todo", "_blank", "noopener,noreferrer")}><CircleHelp size={16} /> The project <FolderOpen size={14} /></button>
      <button className="profile-button" onClick={properties.onAuth}><Avatar person={person} /><span><strong>{person.name}</strong><small>{"Your account"}</small></span><ChevronDown size={15} /></button>
    </div>
  </aside>;
}
