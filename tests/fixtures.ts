import type { Board, Todo } from "../src/lib/model";

function fixtureTodo(options: Pick<Todo, "id" | "assigneeId" | "groupId">): Todo {
  return { ...options, title: options.id, completed: false, completedAt: null, priority: "normal", dueDate: "", notes: [{ id: `${options.id}-note`, text: "Test note" }] };
}

export function fixtureBoard(): Board {
  return {
    groups: [{ id: "creative", name: "First", color: "blue" }, { id: "life", name: "Second", color: "green" }, { id: "ideas", name: "Third", color: "pink" }],
    todos: [fixtureTodo({ id: "poster", assigneeId: "jules", groupId: "creative" }), fixtureTodo({ id: "playlist", assigneeId: "alex", groupId: "creative" }), fixtureTodo({ id: "inbox", assigneeId: "alex", groupId: "life" })],
    race: null,
  };
}
