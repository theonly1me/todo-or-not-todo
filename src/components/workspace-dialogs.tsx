"use client";

import { createWorkspace } from "@/app/actions";
import type { Configuration, Group, Mutation, Person, Todo, Workspace } from "@/lib/model";
import { AuthModal } from "./auth-modal";
import { ConfirmModal, NameModal, ShareModal } from "./action-modals";
import { TodoEditor } from "./todo-editor";
import { useRouter } from "next/navigation";

export type AppModal =
  | { type: "auth" } | { type: "todo"; todo?: Todo; groupId: string | null }
  | { type: "group"; group?: Group } | { type: "delete-group"; group: Group }
  | { type: "delete-todo"; todo: Todo } | { type: "workspace" } | { type: "race" }
  | { type: "share"; url: string; invite?: boolean } | null;

type DialogProperties = { modal: AppModal; workspace: Workspace; person: Person; configuration: Configuration; pending: boolean; mutate: (mutation: Mutation) => Promise<boolean>; onClose: () => void; notify: (message: string) => void };

export function WorkspaceDialogs(properties: DialogProperties) {
  const { modal, workspace, person, configuration, pending, mutate, onClose, notify } = properties;
  const router = useRouter();
  if (!modal) return null;
  if (modal.type === "auth") return <AuthModal configuration={configuration} person={person} onClose={onClose} />;
  if (modal.type === "todo") return <TodoEditor workspace={workspace} todo={modal.todo} groupId={modal.groupId} personId={person.id} pending={pending} onSave={mutate} onClose={onClose} />;
  if (modal.type === "share") return <ShareModal url={modal.url} invite={modal.invite} onClose={onClose} />;
  if (modal.type === "delete-todo") return <ConfirmModal title="Let this one go?" description={`“${modal.todo.title}” and its notes will be deleted. This cannot be undone.`} pending={pending} onConfirm={() => mutate({ type: "delete-todo", id: modal.todo.id })} onClose={onClose} />;
  if (modal.type === "delete-group") return <ConfirmModal title="Delete this group?" description={`“${modal.group.name}” will be deleted. Its todos will move to Ungrouped.`} pending={pending} onConfirm={() => mutate({ type: "delete-group", id: modal.group.id })} onClose={onClose} />;
  if (modal.type === "group") return <NameModal title={modal.group ? "Rename group" : "Create group"} label="Group name" initial={modal.group?.name} submitLabel={modal.group ? "Save name" : "Create group"} pending={pending} onClose={onClose} onSubmit={name => mutate(modal.group ? { type: "rename-group", id: modal.group.id, name } : { type: "add-group", group: { id: crypto.randomUUID(), name, color: (["blue", "pink", "green", "orange"] as const)[workspace.board.groups.length % 4] ?? "blue" } })} />;
  if (modal.type === "race") return <NameModal title="START A RACE." label="Race name" initial="Sprint" submitLabel="Start race" description="Finish your assigned todos first to take the crown. Assign unfinished todos to at least two people before starting. The todo list is locked in when the race begins." pending={pending} onClose={onClose} onSubmit={name => mutate({ type: "start-race", name })} />;
  return <NameModal title="BUILD YOUR CREW." label="Workspace name" submitLabel="Create workspace" pending={pending} onClose={onClose} onSubmit={async name => {
    const result = await createWorkspace(name);
    if (result.error) { notify(result.error); return false; }
    if (result.data) { router.push(`/?workspace=${result.data.id}`); router.refresh(); }
    return true;
  }} />;
}
