# Todo or Not Todo

A dark retro punk todo app built with Next.js, Better Auth, and Postgres. Sign-in is required. New accounts start with an empty workspace. Todos, shared links, and collaboration use a real database.

## Run locally

Use Node.js 22 or newer.

```sh
npm install
cp .env.example .env.local
```

Fill in `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Generate the secret with `openssl rand -base64 32`. The database can be local Postgres or a free Neon database.

```sh
npm run db:migrate
npm run dev
```

Open http://localhost:3000. Sign up with an email and password to create a personal workspace. Create another workspace and copy its invitation link to collaborate with another account.

## Authentication

Better Auth is free and open source. It hashes passwords and stores sessions in Postgres. No passwords or session tokens are stored in browser local storage.

The deployed side project uses Neon Managed Better Auth. Set `NEON_AUTH_BASE_URL`, a generated `NEON_AUTH_COOKIE_SECRET`, and `NEXT_PUBLIC_MANAGED_AUTH=true`. Neon provides shared Google OAuth keys and email-code delivery for development and side-project testing. Register your exact app origin in Neon Auth settings. For a public production app, configure your own OAuth keys and SMTP provider.

Without managed auth variables, the app uses self-hosted Better Auth. Email/password sign-in needs the three variables above. Optional providers become available when their credentials are configured.

| Feature | Environment variables | Setup |
| --- | --- | --- |
| Google sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Add `/api/auth/callback/google` to your site's origin as an authorized redirect URI. |
| GitHub sign-in | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Create an OAuth app with your site's `/api/auth/callback/github` URL. |
| Emailed sign-in codes | `RESEND_API_KEY`, `EMAIL_FROM` | Use a Resend API key and a verified sender address. Codes expire after five minutes. |

For example, a Google callback on production is `https://todo-or-not-todo-nine.vercel.app/api/auth/callback/google`. Register local callbacks separately if you want OAuth during development. Account sign-in is real, including during local development.

## Deploy on Vercel

1. Import `theonly1me/todo-or-not-todo`. Select Next.js and the `main` production branch.
2. Connect a free Neon database through Vercel Marketplace.
3. Add generated `BETTER_AUTH_SECRET` and `NEON_AUTH_COOKIE_SECRET` values. Set `BETTER_AUTH_URL` to the production origin and `NEXT_PUBLIC_MANAGED_AUTH=true`.
4. Register the production origin in Neon Auth settings. Shared Google and email providers are available for this side project.
5. Run the migrations once against the production database before using accounts.
6. Deploy. Future pushes to `main` deploy automatically through the Git integration.

To run migrations with production credentials without overwriting the local development environment:

```sh
npx vercel env pull .env.production.local --environment=production
npx tsx --env-file=.env.production.local scripts/migrate.ts
```

Use a separate database and auth base URL for Vercel preview deployments. Do not set the production base URL on a preview domain.

## Features

- Add, rename, update, delete, and complete todos.
- Attach multiple editable notes to a todo.
- Create and rename groups. Deleting a group keeps its todos and moves them to Unsorted thoughts.
- Assign todos to workspace members and move todos between groups.
- Share a read-only todo link. The page reads the latest saved todo and notes; deleting the todo makes the link return 404.
- Create workspaces and invite signed-in members through unguessable invitation links. Anyone with an invitation can join and edit that workspace.
- Start a race with at least two members who have unfinished assigned todos. The race snapshots each participant's todo list. Finishing all selected todos records a server timestamp and ranks finishers by time. End the race before deleting or reassigning a racing todo.
- Shared workspaces poll for changes every five seconds while the tab is visible. Mutations lock the workspace row so concurrent changes to different todos are preserved.

Signed-out users see the authentication page. No sample tasks or browser-only editable boards are provided. Creating and editing todos or workspaces requires an authenticated session.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Dependencies have specific roles. The Neon auth adapter enables its managed email and OAuth service, Better Auth handles local authentication, `pg` handles Postgres, Zod validates stored data and mutations, and Lucide supplies interface icons.

For the HTTP integration checks, build and start the app on port 3001 against a disposable local database, then run `npm run test:integration`. This checks real accounts, concurrent writes, member access, live share links, and race completion.
