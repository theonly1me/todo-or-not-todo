"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { database } from "@/lib/database";
import { applyMutation, boardSchema, mutationSchema, type Mutation, type Workspace } from "@/lib/model";
import { getWorkspace, requirePerson } from "@/lib/workspaces";

async function attempt<Result>(operation: () => Promise<Result>): Promise<{ data: Result; error?: never } | { error: string; data?: never }> {
  try { return { data: await operation() }; }
  catch (error) { return { error: error instanceof Error && !error.message.includes("query") ? error.message : "Something went wrong. Please try again." }; }
}

export async function readWorkspace(id: string) {
  return attempt(async () => {
    const person = await requirePerson();
    const workspace = await getWorkspace({ id, personId: person.id });
    if (!workspace) throw new Error("This workspace is no longer available.");
    return workspace;
  });
}

export async function changeWorkspace(options: { id: string; mutation: Mutation }) {
  return attempt(async () => {
    const person = await requirePerson();
    const mutation = mutationSchema.parse(options.mutation);
    const client = await database.connect();
    try {
      await client.query("BEGIN");
      const membership = await client.query("SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND person_id = $2", [options.id, person.id]);
      if (!membership.rowCount) throw new Error("You don't have access to this workspace.");
      const result = await client.query("SELECT board FROM workspaces WHERE id = $1 FOR UPDATE", [options.id]);
      const [row] = result.rows;
      const { board } = z.object({ board: boardSchema }).parse(row);
      const members = await client.query<{ person_id: string }>("SELECT person_id FROM workspace_members WHERE workspace_id = $1", [options.id]);
      if (mutation.type === "add-todo" || mutation.type === "update-todo") {
        const assigneeId = mutation.type === "add-todo" ? mutation.todo.assigneeId : mutation.changes.assigneeId;
        const groupId = mutation.type === "add-todo" ? mutation.todo.groupId : mutation.changes.groupId;
        if (assigneeId && !members.rows.some(member => member.person_id === assigneeId)) throw new Error("Choose a workspace member.");
        if (groupId && !board.groups.some(group => group.id === groupId)) throw new Error("This group no longer exists.");
      }
      if (board.race && (mutation.type === "delete-todo" || (mutation.type === "update-todo" && mutation.changes.assigneeId !== undefined))) {
        if (board.race.entries.some(entry => entry.todoIds.includes(mutation.id))) throw new Error("End the race before deleting or reassigning a racing todo.");
      }
      if (board.race && mutation.type === "update-todo" && mutation.changes.completed !== undefined) {
        const racingEntry = board.race.entries.find(entry => entry.todoIds.includes(mutation.id));
        if (racingEntry && racingEntry.personId !== person.id) throw new Error("Only the person assigned to a racing todo can complete it.");
      }
      if (mutation.type === "start-race" && new Set(board.todos.filter(todo => !todo.completed && todo.assigneeId).map(todo => todo.assigneeId)).size < 2) throw new Error("Assign unfinished todos to at least two people to start a race.");
      const updated = applyMutation({ board, mutation, now: new Date().toISOString(), id: randomUUID() });
      await client.query("UPDATE workspaces SET board = $1 WHERE id = $2", [JSON.stringify(updated), options.id]);
      await client.query("COMMIT");
      return updated;
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  });
}

export async function createWorkspace(name: string) {
  return attempt(async () => {
    const person = await requirePerson();
    const validName = z.string().trim().min(1).max(80).parse(name);
    const id = randomUUID();
    const inviteToken = randomUUID();
    const board = { todos: [], groups: [], race: null };
    const client = await database.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO workspaces (id, name, owner_id, invite_token, board) VALUES ($1, $2, $3, $4, $5)", [id, validName, person.id, inviteToken, JSON.stringify(board)]);
      await client.query("INSERT INTO workspace_members (workspace_id, person_id) VALUES ($1, $2)", [id, person.id]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
    const workspace: Workspace = { id, name: validName, inviteToken, board, members: [person] };
    return workspace;
  });
}

export async function joinWorkspace(token: string) {
  return attempt(async () => {
    const person = await requirePerson();
    const result = await database.query<{ id: string }>("SELECT id FROM workspaces WHERE invite_token = $1", [z.uuid().parse(token)]);
    const [workspace] = result.rows;
    if (!workspace) throw new Error("This invitation has expired or doesn't exist.");
    await database.query("INSERT INTO workspace_members (workspace_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [workspace.id, person.id]);
    return workspace.id;
  });
}

export async function shareTodo(options: { workspaceId: string; todoId: string }) {
  return attempt(async () => {
    const person = await requirePerson();
    const workspace = await getWorkspace({ id: options.workspaceId, personId: person.id });
    const todo = workspace?.board.todos.find(item => item.id === options.todoId);
    if (!todo) throw new Error("This todo is no longer available.");
    const token = randomUUID();
    await database.query("INSERT INTO shared_todos (token, workspace_id, todo_id) VALUES ($1, $2, $3)", [token, options.workspaceId, options.todoId]);
    return `/share/${token}`;
  });
}
