import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthApiError } from "@neondatabase/auth";
import { authResult } from "../src/lib/auth-result";

test("Neon account errors reach the form without becoming connection failures", async () => {
  const result = await authResult(async () => {
    throw new AuthApiError("User already exists. Use another email.", 422, "user_already_exists");
  });
  assert.equal(result.error.message, "User already exists. Use another email.");
});

test("unexpected transport errors remain failures", async () => {
  const failure = new TypeError("Failed to fetch");
  await assert.rejects(authResult(async () => { throw failure; }), failure);
});
