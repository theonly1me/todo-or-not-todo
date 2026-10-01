import { BoardApp } from "@/components/board-app";
import { configuration, currentPerson, ensurePersonalWorkspace, getWorkspace, listWorkspaces } from "@/lib/workspaces";
import { SignInPage } from "@/components/sign-in-page";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ workspace?: string }> }) {
  const person = await currentPerson();
  const setup = configuration();
  if (!person) return <SignInPage configuration={setup} />;
  const personalId = await ensurePersonalWorkspace(person);
  const parameters = await searchParams;
  const workspace = await getWorkspace({ id: parameters.workspace ?? personalId, personId: person.id }) ?? await getWorkspace({ id: personalId, personId: person.id });
  if (!workspace) throw new Error("Couldn't load your workspace.");
  const workspaces = await listWorkspaces(person.id);
  return <BoardApp key={workspace.id} initialWorkspace={workspace} workspaces={workspaces} person={person} configuration={setup} />;
}
