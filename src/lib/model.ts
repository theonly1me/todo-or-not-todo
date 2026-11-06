import { z } from "zod";

export const personSchema = z.object({ id: z.string(), name: z.string().max(100), email: z.string() });
export const groupSchema = z.object({ id: z.string(), name: z.string().trim().min(1).max(80), color: z.enum(["blue", "pink", "green", "orange"]) });
export const todoSchema = z.object({
  id: z.string(), title: z.string().trim().min(1).max(300), groupId: z.string().nullable(),
  completed: z.boolean(), completedAt: z.string().nullable(), assigneeId: z.string().nullable(),
  priority: z.enum(["normal", "high", "low"]), dueDate: z.string().max(10),
  notes: z.array(z.object({ id: z.string(), text: z.string().trim().min(1).max(5000) })).max(30),
});
export const raceSchema = z.object({
  id: z.string(), name: z.string().trim().min(1).max(100), startedAt: z.string(),
  entries: z.array(z.object({ personId: z.string(), todoIds: z.array(z.string()), finishedAt: z.string().nullable() })),
});
export const boardSchema = z.object({
  todos: z.array(todoSchema).max(1000), groups: z.array(groupSchema).max(100), race: raceSchema.nullable(),
});
export const mutationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("add-todo"), todo: todoSchema }),
  z.object({ type: z.literal("update-todo"), id: z.string(), changes: todoSchema.omit({ id: true, completedAt: true }).partial() }),
  z.object({ type: z.literal("delete-todo"), id: z.string() }),
  z.object({ type: z.literal("add-group"), group: groupSchema }),
  z.object({ type: z.literal("rename-group"), id: z.string(), name: z.string().trim().min(1).max(80) }),
  z.object({ type: z.literal("delete-group"), id: z.string() }),
  z.object({ type: z.literal("start-race"), name: z.string().trim().min(1).max(100) }),
  z.object({ type: z.literal("end-race") }),
]);

export type Person = z.infer<typeof personSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Todo = z.infer<typeof todoSchema>;
export type Board = z.infer<typeof boardSchema>;
export type Mutation = z.infer<typeof mutationSchema>;
export type Workspace = { id: string; name: string; inviteToken: string; board: Board; members: Person[] };
export type Configuration = { ready: boolean; google: boolean; github: boolean; email: boolean };
export type MutationOf<Type extends Mutation["type"]> = Extract<Mutation, { type: Type }>;
export type TodoChanges = MutationOf<"update-todo">["changes"];
