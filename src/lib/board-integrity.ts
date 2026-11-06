import type { Board, Mutation } from "./model";

function liveGroupIds(options: { board: Board; mutation: Mutation }): Set<string> {
  const { board, mutation } = options;
  const removedGroupId = mutation.type === "delete-group" ? mutation.id : null;
  return new Set(board.groups.map(group => group.id).filter(groupId => groupId !== removedGroupId));
}

export function withoutStaleGroupReferences(options: { board: Board; mutation: Mutation }): Board {
  const groupIds = liveGroupIds(options);
  return { ...options.board, todos: options.board.todos.filter(todo => todo.groupId === null || groupIds.has(todo.groupId)) };
}
