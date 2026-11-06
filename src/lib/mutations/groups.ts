import type { Board, MutationOf } from "../model";

export function addGroup(options: { board: Board; mutation: MutationOf<"add-group"> }): Board {
  const { board, mutation } = options;
  return { ...board, groups: [...board.groups, mutation.group] };
}

export function renameGroup(options: { board: Board; mutation: MutationOf<"rename-group"> }): Board {
  const { board, mutation } = options;
  return { ...board, groups: board.groups.map(group => group.id === mutation.id ? { ...group, name: mutation.name } : group) };
}

export function deleteGroup(options: { board: Board; mutation: MutationOf<"delete-group"> }): Board {
  const { board, mutation } = options;
  return {
    ...board,
    groups: board.groups.filter(group => group.id !== mutation.id),
    todos: board.todos.map(todo => todo.groupId === mutation.id ? { ...todo, groupId: null } : todo),
  };
}
