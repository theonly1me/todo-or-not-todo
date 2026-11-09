import type { Board, Mutation } from "./model";

export function withoutStaleGroupReferences(options: { board: Board; mutation: Mutation }): Board {
  const groupIds = new Set(options.board.groups.map(group => group.id));
  return { ...options.board, todos: options.board.todos.map(todo => todo.groupId === null || groupIds.has(todo.groupId) ? todo : { ...todo, groupId: null }) };
}
