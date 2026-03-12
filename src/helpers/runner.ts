import { Config } from "./utils.ts";
import { parser } from "./parse/main.ts";
import {
  CommandArgument,
  CommandArgumentKind,
  CommandConfig,
  CommandInput,
  CommandOption,
} from "@/core/types.ts";

export async function runner<
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = [],
>(config: CommandConfig<Options, Arguments>, tokens: string[]) {
  const { chains, handled, ...parsed } = parser(config as Config, tokens);
  if (handled) return;

  for (const { handlers } of chains) {
    for (const handler of handlers) {
      await handler(
        parsed as CommandInput<
          CommandOption[],
          CommandArgument<string, CommandArgumentKind, boolean>[]
        >,
        config as CommandConfig<
          CommandOption[],
          CommandArgument<string, CommandArgumentKind, boolean>[]
        >,
      );
    }
  }
}
