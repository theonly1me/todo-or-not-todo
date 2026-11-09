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

test("moves todos of a deleted group to ungrouped instead of dropping them", () => {
  const board = fixtureBoard();
  const cleaned = withoutStaleGroupReferences({ board, mutation: { type: "delete-group", id: "creative" } });
  assert.equal(cleaned.todos.length, board.todos.length);
  assert.ok(cleaned.todos.every(todo => todo.groupId !== "creative"));
});
