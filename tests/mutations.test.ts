import assert from "node:assert/strict";
import { test } from "node:test";
import { applyMutation } from "../src/lib/mutations";
import { fixtureBoard } from "./fixtures";

const now = "2026-10-01T10:00:00Z";

test("updating a todo changes only the fields that were sent", () => {
  const board = fixtureBoard();
  const updated = applyMutation({ board, mutation: { type: "update-todo", id: "poster", changes: { title: "Print the poster", priority: "high" } }, now, id: "change" });
  const poster = updated.todos.find(todo => todo.id === "poster");
  assert.equal(poster?.title, "Print the poster");
  assert.equal(poster?.priority, "high");
  assert.equal(poster?.groupId, "creative");
  assert.equal(updated.todos.find(todo => todo.id === "inbox")?.title, "inbox");
});

test("completing and reopening a todo sets and clears its completion time", () => {
  const completed = applyMutation({ board: fixtureBoard(), mutation: { type: "update-todo", id: "inbox", changes: { completed: true } }, now, id: "change" });
  assert.equal(completed.todos.find(todo => todo.id === "inbox")?.completedAt, now);
  const reopened = applyMutation({ board: completed, mutation: { type: "update-todo", id: "inbox", changes: { completed: false } }, now: "2026-10-01T10:05:00Z", id: "change" });
  assert.equal(reopened.todos.find(todo => todo.id === "inbox")?.completedAt, null);
});

test("adding a todo and a group appends them without touching the rest", () => {
  const board = fixtureBoard();
  const withGroup = applyMutation({ board, mutation: { type: "add-group", group: { id: "chores", name: "Chores", color: "orange" } }, now, id: "change" });
  const [inbox] = board.todos.filter(todo => todo.id === "inbox");
  assert.ok(inbox);
  const withTodo = applyMutation({ board: withGroup, mutation: { type: "add-todo", todo: { ...inbox, id: "laundry", title: "Laundry", groupId: "chores", notes: [] } }, now, id: "change" });
  assert.deepEqual(withTodo.groups.map(group => group.id), ["creative", "life", "ideas", "chores"]);
  assert.equal(withTodo.todos.at(-1)?.groupId, "chores");
  assert.equal(board.todos.length, 3);
});

test("renaming a group keeps its todos in it", () => {
  const renamed = applyMutation({ board: fixtureBoard(), mutation: { type: "rename-group", id: "creative", name: "Studio" }, now, id: "change" });
  assert.equal(renamed.groups.find(group => group.id === "creative")?.name, "Studio");
  assert.equal(renamed.todos.filter(todo => todo.groupId === "creative").length, 2);
});
