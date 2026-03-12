import { CommandError } from "@/helpers/error.ts";
import {
  type Config,
  handlerVariadic,
  isFlag,
  isInlineOption,
  kebabToCamelCase,
} from "@/helpers/utils.ts";

export interface ParsedOption {
  option: Record<string, boolean | string | string[]>;
  consumed: number;
}

export function parseOption(
  token: string,
  tokens: string[],
  options: Config["options"],
): ParsedOption {
  const flagName = kebabToCamelCase(token);

  const matchedOption = options.find(({ longFlag, shortFlag }) => {
    if (longFlag) {
      if (
        kebabToCamelCase(longFlag) === flagName ||
        flagName.includes(`${kebabToCamelCase(longFlag)}=`)
      ) {
        return true;
      }
    }

    if (shortFlag) {
      if (
        kebabToCamelCase(shortFlag) === flagName ||
        flagName.includes(`${kebabToCamelCase(shortFlag)}=`)
      ) {
        return true;
      }
    }

    return false;
  });

  if (!matchedOption) {
    throw new CommandError(`Unknown option: ${token}`);
  }

  let optionValue: null | boolean | string | string[] = null;
  let consumed = 0;
  const index = tokens.indexOf(token);

  switch (matchedOption.kind) {
    case "value": {
      if (isFlag(token)) {
        optionValue = tokens[index + 1];
        consumed = 2;
      }
      break;
    }

    case "inline": {
      if (isInlineOption(flagName)) {
        optionValue = flagName.split("=")[1];
        consumed = 1;
      }
      break;
    }

    case "variadic": {
      if (isFlag(token)) {
        optionValue = handlerVariadic(tokens.slice(index + 1));
        consumed = optionValue.length + 1;
      }
      break;
    }
    case "flag": {
      if (isFlag(token)) {
        optionValue = true;
        consumed = 1;
      }
      break;
    }
  }

  if (optionValue === null) {
    throw new CommandError(`Unexpected option: ${token}`);
  }

  return {
    option: { [kebabToCamelCase(matchedOption.longFlag)]: optionValue },
    consumed: consumed,
  };
}
