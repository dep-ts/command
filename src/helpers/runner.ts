import { Command } from '@/core/command.ts';
import { CommandOption } from '@/core/types.ts';
import { showHelp } from './help.ts';
import { $config } from './utils.ts';

const input: {
  args: Record<string, string | string[]>;
  options: Record<string, string | string[] | boolean>;
  unparsed: string[];
} = { args: {}, options: {}, unparsed: [] };

const commandNames: string[] = [];

export const runner = async (
  command: Command<
    [CommandOption<'help', 'flag'>, CommandOption<'version', 'flag'>],
    []
  >,
  tokens?: string[]
) => {
  const parsed = command.parse(tokens);
  const { name, handlers, version, subcommands, hidden } = command[$config]();

  commandNames.push(name);

  Object.assign(input.options, parsed.options);
  Object.assign(input.args, parsed.args);
  Object.assign(input.unparsed, parsed.unparsed);

  // Handle --help flags
  if (parsed.options.help && !hidden.help) {
    showHelp(command[$config]() as never, commandNames);
    return;
  }

  // Handle --version flags
  if (parsed.options.version && !hidden.version) {
    console.log(version);
    return;
  }

  // Run global handlers if defined
  for (const handler of handlers) {
    await handler(input as typeof parsed, command);
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
      await subcommand.run(parsed.unparsed.slice(1));
      return;
    }
  }
};
