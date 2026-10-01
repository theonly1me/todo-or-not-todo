import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/lib/auth";
import { database, requireDatabase } from "../src/lib/database";

requireDatabase();
const migrations = await getMigrations(auth.options);
await migrations.runMigrations();
await database.query(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    invite_token TEXT UNIQUE NOT NULL,
    board JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workspace_id, person_id)
  );
  CREATE TABLE IF NOT EXISTS shared_todos (
    token TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    todo_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS workspace_members_person ON workspace_members(person_id);
`);
await database.end();
process.stdout.write("Authentication and workspace tables are ready.\n");
