import type { Board, MutationOf } from "../model";

export function startRace(options: { board: Board; mutation: MutationOf<"start-race">; now: string; id: string }): Board {
  const { board, mutation, now, id } = options;
  const openTodos = board.todos.filter(todo => !todo.completed && todo.assigneeId);
  const racers = [...new Set(openTodos.flatMap(todo => todo.assigneeId ? [todo.assigneeId] : []))];
  const entries = racers.map(personId => ({ personId, todoIds: openTodos.filter(todo => todo.assigneeId === personId).map(todo => todo.id), finishedAt: null }));
  return { ...board, race: { id, name: mutation.name, startedAt: now, entries } };
}

export function endRace(options: { board: Board }): Board {
  return { ...options.board, race: null };
}

export function settleRace(options: { board: Board; now: string }): Board {
  const { board, now } = options;
  if (!board.race) return board;
  const isCompleted = (todoId: string) => board.todos.some(todo => todo.id === todoId && todo.completed);
  const entries = board.race.entries.map(entry => ({ ...entry, finishedAt: entry.todoIds.every(isCompleted) ? entry.finishedAt ?? now : null }));
  return { ...board, race: { ...board.race, entries } };
}
