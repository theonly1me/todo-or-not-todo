import assert from "node:assert/strict";
import { test } from "node:test";
import { applyMutation } from "../src/lib/model";
import { fixtureBoard } from "./fixtures";

test("deleting a group keeps its todos and linked notes", () => {
  const board = fixtureBoard();
  const updated = applyMutation({ board, mutation: { type: "delete-group", id: "creative" }, now: "2026-10-01T10:00:00Z", id: "race" });
  assert.equal(updated.todos.length, board.todos.length);
  assert.equal(updated.groups.some(group => group.id === "creative"), false);
  assert.equal(updated.todos.find(todo => todo.id === "poster")?.groupId, null);
  assert.deepEqual(updated.todos.find(todo => todo.id === "poster")?.notes, board.todos.find(todo => todo.id === "poster")?.notes);
  assert.equal(board.groups.length, 3);
});

test("a racer only finishes when every todo selected at the start is complete", () => {
  const board = fixtureBoard();
  const started = applyMutation({ board, mutation: { type: "start-race", name: "First to finish" }, now: "2026-10-01T10:00:00Z", id: "race" });
  const first = applyMutation({ board: started, mutation: { type: "update-todo", id: "playlist", changes: { completed: true } }, now: "2026-10-01T10:01:00Z", id: "change" });
  assert.equal(first.race?.entries.find(entry => entry.personId === "alex")?.finishedAt, null);
  const finished = applyMutation({ board: first, mutation: { type: "update-todo", id: "inbox", changes: { completed: true } }, now: "2026-10-01T10:02:00Z", id: "change" });
  assert.equal(finished.race?.entries.find(entry => entry.personId === "alex")?.finishedAt, "2026-10-01T10:02:00Z");
  const renamed = applyMutation({ board: finished, mutation: { type: "rename-group", id: "life", name: "Errands" }, now: "2026-10-01T10:03:00Z", id: "change" });
  assert.equal(renamed.race?.entries.find(entry => entry.personId === "alex")?.finishedAt, "2026-10-01T10:02:00Z");
  const reopened = applyMutation({ board: renamed, mutation: { type: "update-todo", id: "inbox", changes: { completed: false } }, now: "2026-10-01T10:04:00Z", id: "change" });
  assert.equal(reopened.race?.entries.find(entry => entry.personId === "alex")?.finishedAt, null);
});

test("deleting a racing todo cannot count as finishing it", () => {
  const started = applyMutation({ board: fixtureBoard(), mutation: { type: "start-race", name: "Sprint" }, now: "2026-10-01T10:00:00Z", id: "race" });
  const removed = applyMutation({ board: started, mutation: { type: "delete-todo", id: "playlist" }, now: "2026-10-01T10:01:00Z", id: "change" });
  const remaining = applyMutation({ board: removed, mutation: { type: "update-todo", id: "inbox", changes: { completed: true } }, now: "2026-10-01T10:02:00Z", id: "change" });
  assert.equal(remaining.race?.entries.find(entry => entry.personId === "alex")?.finishedAt, null);
});
