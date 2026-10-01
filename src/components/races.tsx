"use client";

import { ArrowUpRight, Flag, Trophy, Zap } from "lucide-react";
import type { Workspace } from "@/lib/model";
import { Avatar } from "./primitives";

export function RaceCard({ workspace, onStart, onOpen, expanded = false, onEnd }: { workspace: Workspace; onStart: () => void; onOpen: () => void; expanded?: boolean; onEnd?: () => void }) {
  const { race } = workspace.board;
  const entries = race?.entries ?? workspace.members.map(person => ({ personId: person.id, todoIds: workspace.board.todos.filter(todo => todo.assigneeId === person.id).map(todo => todo.id), finishedAt: null }));
  const ranked = entries.map(entry => ({ ...entry, person: workspace.members.find(person => person.id === entry.personId), completed: entry.todoIds.filter(todoId => workspace.board.todos.some(todo => todo.id === todoId && todo.completed)).length })).sort((first, second) => {
    if (first.finishedAt && second.finishedAt) return Date.parse(first.finishedAt) - Date.parse(second.finishedAt);
    if (first.finishedAt) return -1;
    if (second.finishedAt) return 1;
    return second.completed / Math.max(second.todoIds.length, 1) - first.completed / Math.max(first.todoIds.length, 1);
  });
  const [leader] = ranked;
  return <section className={`race-card ${expanded ? "expanded" : ""}`}>
    <div className="race-eyebrow"><Flag size={15} /><span>{race ? "RACE IN PROGRESS" : "RACE MODE /"}</span><span className="race-live">{race ? "LIVE" : "LET'S GO"}</span></div>
    <h3>{race?.name ?? <>FIRST DONE.<br /><span>FIRST PLACE.</span></>}</h3>
    <p>{leader?.finishedAt ? `${leader.person?.name.split(" ")[0]} crossed the finish line first!` : race ? "First to finish their todo list takes the crown." : "Bring your crew. Assign your todos. First to clear their list wins."}</p>
    {race && <div className="race-entries">{ranked.map((entry, index) => <div className="race-entry" key={entry.personId}><span className="race-rank">{entry.finishedAt && index === 0 ? <Trophy size={17} /> : `${index + 1}`}</span><Avatar person={entry.person} /><div className="race-person"><span>{entry.person?.name ?? "Member"}<small>{entry.completed}/{entry.todoIds.length}</small></span><div className="race-progress"><span style={{ width: `${100 * entry.completed / Math.max(entry.todoIds.length, 1)}%` }} /></div></div>{entry.finishedAt && <span className="race-finish">FINISHED</span>}</div>)}</div>}
    <button className="button race-button" onClick={race ? onOpen : onStart}>{race ? "View the race" : "Start a race"}{race ? <ArrowUpRight size={18} /> : <Zap size={17} />}</button>
    {expanded && race && <button className="text-button race-end" onClick={onEnd}>End this race</button>}
    <div className="checker-strip" />
  </section>;
}
