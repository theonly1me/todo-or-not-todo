import { isAuthError } from "@neondatabase/auth";

export async function authResult<Result>(operation: () => Promise<Result>) {
  try {
    return await operation();
  } catch (error) {
    if (isAuthError(error)) return { data: null, error: { message: error.message } };
    throw error;
  }
}
