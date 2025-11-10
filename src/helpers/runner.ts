import { showHelp } from './help.ts';
import { $config } from './utils.ts';
import { parseRuntime } from './parse/index.ts';
import {
  CommandArgument,
  CommandConfig,
  CommandInput,
  CommandOption,
} from '@/core/types.ts';

const input: CommandInput<CommandOption[], CommandArgument[]> = {
  args: {},
  options: {},
  unparsed: [],
};

const commandNames: string[] = [];

export const runner = async <
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = []
>(
  config: CommandConfig<Options, Arguments>,
  tokens?: string[]
) => {
  const parsed = parseRuntime(config, tokens);
  const { name, handlers, version, subcommands, hidden } = config;

  commandNames.push(name);

  Object.assign(input.options, parsed.options);
  Object.assign(input.args, parsed.args);
  Object.assign(input.unparsed, parsed.unparsed);

  // Handle --help flags
  if (parsed.options.help && !hidden.help) {
    showHelp(config, commandNames);
    return;
  }

  // Handle --version flags
  if (parsed.options.version && !hidden.version) {
    console.log(version);
    return;
  }

  // Run global handlers if defined
  for (const handler of handlers) {
    await handler(input, config);
  }

  // Handle subcommands
  if (parsed.unparsed.length > 0) {
    const subName = parsed.unparsed[0];
    const subcommand = subcommands.find(
      (cmd) =>
        cmd[$config]().name === subName ||
        cmd[$config]().aliases.includes(subName)
    );

    if (subcommand) {
      await runner(subcommand[$config](), parsed.unparsed.slice(1));
      return;
    }
  }
};
