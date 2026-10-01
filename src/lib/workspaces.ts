import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "./auth";
import { managedAuth } from "./managed-auth";
import { database, requireDatabase } from "./database";
import { boardSchema, personSchema, type Person, type Workspace } from "./model";

const workspaceRowSchema = z.object({ id: z.string(), name: z.string(), invite_token: z.string(), board: boardSchema });

export function configuration() {
  return {
    ready: Boolean(process.env.DATABASE_URL && (managedAuth || process.env.BETTER_AUTH_SECRET)),
    google: Boolean(managedAuth || (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)),
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    email: Boolean(managedAuth || (process.env.RESEND_API_KEY && process.env.EMAIL_FROM)),
  };
}

export async function currentPerson(): Promise<Person | null> {
  if (!configuration().ready) return null;
  if (managedAuth) {
    const { data: session } = await managedAuth.getSession();
    if (!session?.user) return null;
    const person = personSchema.parse(session.user);
    await database.query('INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email', [person.id, person.name, person.email]);
    return person;
  }
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? personSchema.parse(session.user) : null;
}

export async function requirePerson(): Promise<Person> {
  requireDatabase();
  const person = await currentPerson();
  if (!person) throw new Error("Sign in to save and share your todos.");
  return person;
}

export async function getWorkspace(options: { id: string; personId: string }): Promise<Workspace | null> {
  const result = await database.query("SELECT w.* FROM workspaces w JOIN workspace_members m ON m.workspace_id = w.id WHERE w.id = $1 AND m.person_id = $2", [options.id, options.personId]);
  const [row] = result.rows;
  if (!row) return null;
  const workspace = workspaceRowSchema.parse(row);
  const members = await database.query('SELECT u.id, u.name, u.email FROM "user" u JOIN workspace_members m ON m.person_id = u.id WHERE m.workspace_id = $1 ORDER BY m.joined_at', [options.id]);
  return { id: workspace.id, name: workspace.name, inviteToken: workspace.invite_token, board: workspace.board, members: z.array(personSchema).parse(members.rows) };
}

export async function listWorkspaces(personId: string): Promise<{ id: string; name: string }[]> {
  const result = await database.query("SELECT w.id, w.name FROM workspaces w JOIN workspace_members m ON m.workspace_id = w.id WHERE m.person_id = $1 ORDER BY w.created_at", [personId]);
  return z.array(z.object({ id: z.string(), name: z.string() })).parse(result.rows);
}

export async function ensurePersonalWorkspace(person: Person): Promise<string> {
  const id = `personal-${person.id}`;
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO workspaces (id, name, owner_id, invite_token, board) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING", [id, "My workspace", person.id, randomUUID(), JSON.stringify({ todos: [], groups: [], race: null })]);
    await client.query("INSERT INTO workspace_members (workspace_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, person.id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
  return id;
}
