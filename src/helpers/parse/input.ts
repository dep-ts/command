import { parseOption } from "./option.ts";
import { parseArgument } from "./argument.ts";
import { type Config, isOption } from "@/helpers/utils.ts";
import { showHelp } from "@/helpers/help.ts";

export interface ParseInput {
  args: Record<string, string | string[]>;
  options: Record<string, string | string[] | boolean>;
  unparsed: string[];
}

export type CommandSchema = Pick<
  Config,
  "options" | "arguments" | "hidden" | "version"
>;

export function parseInput(
  tokens: string[],
  schema: CommandSchema,
  chains: Config[],
): ParseInput {
  const input: ParseInput = {
    args: {},
    options: {},
    unparsed: [],
  };

  let argIndex = 0;
  let tokenIndex = 0;

  while (tokenIndex < tokens.length) {
    const token = tokens[tokenIndex];

    // Handle '--' separator
    if (token === "--") {
      input.unparsed = tokens.slice(tokenIndex + 1);
      break;
    }

    // Handle Options
    if (isOption(token)) {
      const { option, consumed } = parseOption(
        token,
        tokens.slice(tokenIndex),
        schema.options,
      );

      Object.assign(input.options, option);

      //Exit early if  --version | -v
      if (!schema.hidden.version && ["--version", "-v"].includes(token)) {
        console.log(schema.version);
        break;
      }

      //Exit early if --help | -h
      if (!schema.hidden.help && ["--help", "-h"].includes(token)) {
        showHelp(chains);
        break;
      }

      tokenIndex += consumed;
      continue;
    }

    // Positional arguments
    const { argument, consumed } = parseArgument(
      tokens.slice(tokenIndex),
      schema.arguments,
      argIndex,
    );

    Object.assign(input.args, argument);
    tokenIndex += consumed;
    argIndex++;
  }

  return input;
}
