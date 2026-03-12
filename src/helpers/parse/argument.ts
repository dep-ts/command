import { CommandError } from "@/helpers/error.ts";

import {
  type Config,
  handlerVariadic,
  kebabToCamelCase,
} from "@/helpers/utils.ts";

export interface ParsedArgument {
  argument: Record<string, string | string[]>;
  consumed: number;
}

export function parseArgument(
  tokens: string[],
  args: Config["arguments"],
  argIndex: number,
): ParsedArgument {
  const argDef = args[argIndex];
  const token = tokens[0];

  if (!argDef) {
    throw new CommandError(`Unexpected argument: ${token}`);
  }

  const { name, kind } = argDef;
  let argumentValue: string | string[];

  switch (kind) {
    case "value":
      argumentValue = token;
      break;
    case "variadic": {
      argumentValue = handlerVariadic(tokens);
      break;
    }
  }

  return {
    argument: { [kebabToCamelCase(name)]: argumentValue },
    consumed: Array.isArray(argumentValue) ? argumentValue.length : 1,
  };
}
