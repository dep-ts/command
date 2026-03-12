import process from "node:process";

export function getDefaultTokens(): string[] {
  // Check Deno first
  if ("Deno" in globalThis) {
    return globalThis.Deno.args;
  }

  // Check Node.js process
  if (typeof process !== "undefined" && process.argv) {
    return process.argv.slice(2);
  }

  return [];
}
