import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { managedAuth } from "@/lib/managed-auth";

const localHandlers = toNextJsHandler(auth);
const managedHandlers = managedAuth?.handler();

function unavailable() {
  return Response.json({ message: "Authentication needs DATABASE_URL and BETTER_AUTH_SECRET. See the setup guide." }, { status: 503 });
}

type RouteContext = { params: Promise<{ all: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  if (managedHandlers) return managedHandlers.GET(request, { params: context.params.then(parameters => ({ path: parameters.all })) });
  return process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET ? localHandlers.GET(request) : unavailable();
}

export async function POST(request: Request, context: RouteContext) {
  if (managedHandlers) return managedHandlers.POST(request, { params: context.params.then(parameters => ({ path: parameters.all })) });
  return process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET ? localHandlers.POST(request) : unavailable();
}
