"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, List, Plus, X } from "lucide-react";
import { shareTodo } from "@/app/actions";
import type { Configuration, Person, Todo, Workspace } from "@/lib/model";
import { AppHeader, BoardIntro, BoardToolbar } from "./board-header";
import { RightRail } from "./right-rail";
import { RaceCard } from "./races";
import { Sidebar, type View } from "./sidebar";
import { NotesList, TodoList } from "./todo-list";
import { WorkspaceDialogs, type AppModal } from "./workspace-dialogs";
import { useBoard } from "./use-board";

export function BoardApp({ initialWorkspace, workspaces, person, configuration }: { initialWorkspace: Workspace; workspaces: { id: string; name: string }[]; person: Person; configuration: Configuration }) {
  const [view, setView] = useState<View>("all");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState(false);
  const [modal, setModal] = useState<AppModal>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const { workspace, pending, mutate } = useBoard({ initialWorkspace, notify });
  function navigate(next: View) { setView(next); setFilter("all"); setSearch(""); }
  const title = view === "group" ? workspace.board.groups.find(group => group.id === groupId)?.name ?? "Your group" : ({ all: "All todos", completed: "COMPLETED", assigned: "YOUR ASSIGNMENTS", notes: "FIELD NOTES", races: "RACE MODE" } as const)[view];
  const visibleCount = workspace.board.todos.filter(todo => (view !== "group" || todo.groupId === groupId) && (view !== "assigned" || todo.assigneeId === person.id) && (view !== "completed" || todo.completed)).length;
  const completedCount = workspace.board.todos.filter(todo => todo.completed && (view !== "group" || todo.groupId === groupId)).length;
  async function share(todo: Todo) {
    try {
      const result = await shareTodo({ workspaceId: workspace.id, todoId: todo.id });
      if (result.error) notify(result.error);
      else if (result.data) setModal({ type: "share", url: `${window.location.origin}${result.data}` });
    } catch { notify("Couldn't create a share link. Please try again."); }
  }
  function invite() {
    setModal({ type: "share", invite: true, url: `${window.location.origin}/invite/${workspace.inviteToken}` });
  }
  return <div className="app-shell">
    <Sidebar workspace={workspace} workspaces={workspaces} person={person} view={view} groupId={groupId} onView={navigate} onGroup={group => { navigate("group"); setGroupId(group.id); }} onNewGroup={() => setModal({ type: "group" })} onWorkspace={() => setModal({ type: "workspace" })} onAuth={() => setModal({ type: "auth" })} />
    <div className="main-shell"><AppHeader workspace={workspace} person={person} onInvite={invite} onAuth={() => setModal({ type: "auth" })} />
      <main className="workspace-main"><div className="workspace-top"><BoardIntro workspace={workspace} title={title} /></div>
        <div className="workspace-columns"><div className="board-content">
          {view !== "races" && <BoardToolbar search={search} setSearch={setSearch} onAdd={() => setModal({ type: "todo", groupId: view === "group" ? groupId : null })} onGroup={() => setModal({ type: "group" })} />}
          {view !== "notes" && view !== "races" && <div className="filter-bar"><div className="filter-tabs"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All todos <span>{visibleCount}</span></button><button className={filter === "active" ? "selected" : ""} onClick={() => setFilter("active")}>To do</button><button className={filter === "completed" ? "selected" : ""} onClick={() => setFilter("completed")}>Completed <span>{completedCount}</span></button></div><div className="view-switch"><button className={!cards ? "selected" : ""} aria-label="List view" onClick={() => setCards(false)}><List size={16} /></button><button className={cards ? "selected" : ""} aria-label="Card view" onClick={() => setCards(true)}><LayoutGrid size={15} /></button></div></div>}
          {view === "notes" ? <NotesList workspace={workspace} search={search} onEdit={todo => setModal({ type: "todo", todo, groupId: todo.groupId })} /> : view === "races" ? <RaceCard workspace={workspace} expanded onStart={() => setModal({ type: "race" })} onOpen={() => notify("Complete the todos assigned to you to move up the leaderboard.")} onEnd={async () => { if (await mutate({ type: "end-race" })) notify("Race ended."); }} /> : <TodoList workspace={workspace} view={view} groupId={groupId} personId={person.id} search={search} filter={filter} cards={cards} pending={pending} onToggle={async todo => { if (await mutate({ type: "update-todo", id: todo.id, changes: { completed: !todo.completed } })) notify(todo.completed ? "Back on the list." : "Task complete."); }} onEdit={todo => setModal({ type: "todo", todo, groupId: todo.groupId })} onShare={share} onDelete={todo => setModal({ type: "delete-todo", todo })} onAdd={selectedGroup => setModal({ type: "todo", groupId: selectedGroup })} onRenameGroup={group => setModal({ type: "group", group })} onDeleteGroup={group => setModal({ type: "delete-group", group })} />}
          <button className="new-group-footer" onClick={() => setModal({ type: "group" })}><Plus size={15} /> Create a group</button>
          <div className="board-footer"><span>NO EXCUSES. JUST PROGRESS.</span><span>{pending ? "Saving..." : "Saved · syncs every 5 seconds"} <span className="footer-spark">✳</span></span></div>
        </div><RightRail workspace={workspace} pending={pending} onMutation={mutate} onRace={() => navigate("races")} onStartRace={() => setModal({ type: "race" })} notify={notify} /></div>
      </main>
    </div>
    {toast && <div className="toast" role="status"><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={16} /></button></div>}
    <WorkspaceDialogs key={modal?.type} modal={modal} workspace={workspace} person={person} configuration={configuration} pending={pending} mutate={mutate} onClose={() => setModal(null)} notify={notify} />
  </div>;
}
