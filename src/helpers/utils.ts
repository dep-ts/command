import { CommandArgument, CommandConfig, CommandOption } from "@/core/types.ts";
import { CommandSchema } from "./parse/input.ts";

export type Config = CommandConfig<CommandOption[], CommandArgument[]>;

export const $config = Symbol("config");

export function isFlag(token: string) {
  return token.startsWith("-");
}

export function isInlineOption(token: string) {
  return token.includes("=");
}

// // Helper to keep the main loop clean
export function isGlobalFlag(token: string, hidden: Config["hidden"]): boolean {
  const isHelp = !hidden.help && ["--help", "-h"].includes(token);
  const isVersion = !hidden.version && ["--version", "-v"].includes(token);
  return isHelp || isVersion;
}

export function isOption(token: string) {
  return isFlag(token) || isInlineOption(token);
}

export function isSubcommand(
  token: string,
  subcommands: Config["subcommands"],
) {
  return subcommands.some((cmd) => {
    const config = cmd[$config]();

    return config.name === token || config.aliases.includes(token);
  });
}

export function kebabToCamelCase(token: string) {
  return token
    .trim()
    .replace(/^-+/, "")
    .replace(/-./g, (match) => match.charAt(1).toUpperCase())
    .replaceAll("-", "");
}

export function handlerVariadic(tokens: string[]) {
  const collectedValues: string[] = [];

  for (const token of tokens) {
    if (isOption(token)) break;
    collectedValues.push(token);
  }

  return collectedValues;
}

export function flattenChain(chains: Config[]): CommandSchema {
  return {
    options: chains.flatMap((c) => c.options || []),
    arguments: chains.flatMap((c) => c.arguments || []),
    hidden: Object.assign({}, ...chains.map((c) => c.hidden)),
    version: chains[0].version,
  };
}
