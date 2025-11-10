import {
  CommandOptionKind,
  CommandArgumentKind,
  CommandConfig,
  CommandOption,
  CommandArgument,
} from '@/core/types.ts';

import { Text } from '@dep/table';
import { $config } from './utils.ts';

const formatArgumentName = (
  name: string,
  kind: CommandArgumentKind,
  optional = false
): string => {
  const baseName = name.replace(/^--/, '');
  const suffix = kind === 'variadic' ? '...' : '';
  const format = `${baseName}${suffix}`;
  return optional ? `[${format}]` : `<${format}>`;
};

const formatOptionFlag = (
  flag: string,
  kind: CommandOptionKind,
  optional = false
): string => {
  const normalizedFlag = flag.startsWith('-')
    ? flag
    : flag.length === 1
    ? `-${flag}`
    : `--${flag}`;

  if (kind === 'inline') {
    return optional ? `${normalizedFlag}[=value]` : `${normalizedFlag}=value`;
  }

  return normalizedFlag;
};

export const showHelp = <
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = []
>(
  {
    arguments: args,
    options,
    subcommands,
    description,
  }: CommandConfig<Options, Arguments>,
  commandNames: string[] = []
) => {
  const printUsage = () => {
    const commandsStr = subcommands.length > 0 ? '[command]' : '';
    const optionsStr = options.length > 0 ? '[options]' : '';
    const argsStr = args
      .map(({ name, optional, kind }) =>
        formatArgumentName(name, kind, optional)
      )
      .join(' ');

    console.log(
      `\nUsage: ${commandNames.join(' ')}${argsStr ? ` ${argsStr}` : ''}${
        optionsStr ? ` ${optionsStr}` : ''
      }${commandsStr ? ` ${commandsStr}` : ''}`
    );
  };

  const printDescription = () => {
    if (description) {
      console.log(`\n${description}`);
    }
  };

  const printArguments = () => {
    if (args.length > 0) {
      console.log('\nArguments:');
      args.forEach(({ name, description, kind, optional }) => {
        console.log(
          `  ${formatArgumentName(name, kind, optional).padEnd(15)} ${
            description ?? ''
          }`
        );
      });
    }
  };

  const printOptions = () => {
    if (options.length > 0) {
      console.log('\nOptions:');
      const table = new Text();

      options.forEach((opt) => {
        const normalizedLongFlag =
          opt.kind === 'flag'
            ? formatOptionFlag(opt.longFlag, opt.kind)
            : formatOptionFlag(opt.longFlag, opt.kind, opt.optional);

        const normalizedShortFlag = opt.shortFlag
          ? opt.kind === 'flag'
            ? formatOptionFlag(opt.shortFlag, opt.kind)
            : formatOptionFlag(opt.shortFlag, opt.kind, opt.optional)
          : '';

        const normalizedArg =
          opt.kind === 'value' || opt.kind === 'variadic'
            ? formatArgumentName(opt.longFlag, opt.kind, opt.optional)
            : '';

        table.add(
          `${normalizedLongFlag}, ${normalizedShortFlag}`,
          normalizedArg,
          opt.description ?? ''
        );
      });

      table.setColumnWidth(1, 20);
      console.log(table.build());
    }
  };

  const printSubcommands = () => {
    if (subcommands.length > 0) {
      console.log('\nCommands:');
      subcommands.forEach((cmd) => {
        const cmdCtx = cmd[$config]();

        const aliases =
          cmdCtx.aliases.length > 0
            ? ` (aliases: ${cmdCtx.aliases.join(', ')})`
            : '';
        console.log(
          `  ${cmdCtx.name.padEnd(15)} ${cmdCtx.description}${aliases}`
        );
      });
    }
  };

  printUsage();
  printDescription();
  printArguments();
  printOptions();
  printSubcommands();
  console.log('');
};
// deno --allow-all test.ts url -h
