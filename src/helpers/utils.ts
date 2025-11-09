import {
  CommandArgument,
  CommandArgumentKind,
  CommandConfig,
  CommandOption,
} from '@/core/types.ts';

export type Config = CommandConfig<
  (
    | CommandOption<string, 'value'>
    | CommandOption<string, 'inline'>
    | CommandOption<string, 'variadic'>
    | CommandOption<string, 'flag'>
  )[],
  CommandArgument<string, CommandArgumentKind>[]
>;

export const $config = Symbol('config');

export const isFlag = (token: string) => token.startsWith('-');

export const isInlineOption = (token: string) => token.includes('=');

export const isOption = (token: string) =>
  isFlag(token) || isInlineOption(token);

export const isSubcommand = (
  token: string,
  subcommands: Config['subcommands']
) =>
  subcommands.some((cmd) => {
    const config = cmd[$config]();

    return config.name === token || config.aliases.includes(token);
  });

export const kebabToCamelCase = (token: string) =>
  token
    .trim()
    .replace(/^-+/, '')
    .replace(/-./g, (match) => match.charAt(1).toUpperCase())
    .replaceAll('-', '');

export const handlerVariadic = (
  tokens: string[],
  subcommand: Config['subcommands']
) => {
  const collectedValues: string[] = [];

  for (const token of tokens) {
    if (isSubcommand(token, subcommand) || isOption(token)) break;
    collectedValues.push(token);
  }

  return collectedValues;
};
