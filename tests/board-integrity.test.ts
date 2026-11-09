import assert from "node:assert/strict";
import { test } from "node:test";
import { withoutStaleGroupReferences } from "../src/lib/board-integrity";
import { fixtureBoard } from "./fixtures";

test("keeps every todo when each group it points to still exists", () => {
  const board = fixtureBoard();
  const cleaned = withoutStaleGroupReferences({ board, mutation: { type: "rename-group", id: "creative", name: "Studio" } });
  assert.deepEqual(cleaned.todos, board.todos);
});

test("keeps ungrouped todos", () => {
  const board = fixtureBoard();
  const ungrouped = { ...board, todos: board.todos.map(todo => ({ ...todo, groupId: null })) };
  const cleaned = withoutStaleGroupReferences({ board: ungrouped, mutation: { type: "end-race" } });
  assert.equal(cleaned.todos.length, board.todos.length);
});

test("keeps todos of a group being deleted so the deletion can move them to ungrouped", () => {
  const board = fixtureBoard();
  const cleaned = withoutStaleGroupReferences({ board, mutation: { type: "delete-group", id: "creative" } });
  assert.deepEqual(cleaned.todos, board.todos);
});

test("clears references to groups that no longer exist", () => {
  const board = fixtureBoard();
  const orphaned = { ...board, todos: board.todos.map(todo => ({ ...todo, groupId: "missing" })) };
  const cleaned = withoutStaleGroupReferences({ board: orphaned, mutation: { type: "end-race" } });
  assert.equal(cleaned.todos.length, board.todos.length);
  assert.equal(cleaned.todos.every(todo => todo.groupId === null), true);
});
