import type { Board, MutationOf, Todo, TodoChanges } from "../model";

export function mergeTodoChanges(options: { todo: Todo; changes: TodoChanges; now: string }): Todo {
  const { todo, changes, now } = options;
  return {
    ...todo, ...changes,
    notes: changes.notes ? [...todo.notes, ...changes.notes] : todo.notes,
    completedAt: changes.completed === undefined ? todo.completedAt : changes.completed ? now : null,
  };
}

export function addTodo(options: { board: Board; mutation: MutationOf<"add-todo"> }): Board {
  const { board, mutation } = options;
  return { ...board, todos: [...board.todos, mutation.todo] };
}

export function updateTodo(options: { board: Board; mutation: MutationOf<"update-todo">; now: string }): Board {
  const { board, mutation, now } = options;
  return { ...board, todos: board.todos.map(todo => todo.id === mutation.id ? mergeTodoChanges({ todo, changes: mutation.changes, now }) : todo) };
}

export function deleteTodo(options: { board: Board; mutation: MutationOf<"delete-todo"> }): Board {
  const { board, mutation } = options;
  return { ...board, todos: board.todos.filter(todo => todo.id !== mutation.id) };
}
