import { CommandError } from '@/helpers/error.ts';

import {
  kebabToCamelCase,
  handlerVariadic,
  type Config,
} from '@/helpers/utils.ts';

export interface ParsedArgument {
  argument: Record<string, string | string[]>;
  consumed: number;
}

export const parseCommandArgument = (
  tokens: string[],
  config: Config,
  argIndex: number
): ParsedArgument => {
  const argDef = config.arguments[argIndex];
  const token = tokens[0];

  if (!argDef) {
    throw new CommandError(`Unexpected argument: ${token}`);
  }

  const { name, kind } = argDef;
  let argumentValue: string | string[];

  switch (kind) {
    case 'value':
      argumentValue = token;
      break;
    case 'variadic': {
      argumentValue = handlerVariadic(tokens, config.subcommands);
      break;
    }
  }

  return {
    argument: { [kebabToCamelCase(name)]: argumentValue },
    consumed: Array.isArray(argumentValue) ? argumentValue.length : 1,
  };
};
