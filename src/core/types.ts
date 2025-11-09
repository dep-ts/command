import { Command } from './command.ts';

/** Kind of command argument: single value or variadic */
export type CommandArgumentKind = 'value' | 'variadic';

/** Kind of command option: flag (boolean), value, inline, or variadic */
export type CommandOptionKind = 'flag' | 'value' | 'inline' | 'variadic';

/** Kind of command hide: help or version */
export type CommandHideKind = 'help' | 'version';

export type Default = CommandArgumentKind extends 'variadic'
  ? string[]
  : string;

/**
 * Command option definition
 * @template L - Long flag (e.g., `--output`)
 * @template K - Option kind
 */
export type CommandOption<L extends string, K extends CommandOptionKind> = {
  longFlag: L;
  kind: K;
  shortFlag?: string;
  description?: string;
} & (K extends 'flag'
  ? object
  : {
      default?: K extends 'variadic' ? string[] : string;
      choices?: string[];
      optional?: boolean;
    });

/**
 * Command argument definition
 * @template N - Argument name
 * @template K - Argument kind
 */
export interface CommandArgument<
  N extends string,
  K extends CommandArgumentKind
> {
  name: N;
  description?: string;
  default?: K extends 'variadic' ? string[] : string;
  choices?: string[];
  optional?: boolean;
  kind: K;
}

/** Convert kebab-case to camelCase (e.g., `--my-flag` → `myFlag`) */
export type KebabToCamelCase<S extends string> = S extends `--${infer Rest}`
  ? KebabToCamelCase<Rest>
  : S extends `${infer First}-${infer Rest}`
  ? `${First}${Capitalize<KebabToCamelCase<Rest>>}`
  : S;

/**
 * Parsed CLI input with typed args and options
 * @template Options - Array of option definitions
 * @template Arguments - Array of argument definitions
 */
export type CommandInput<
  Options extends CommandOption<string, CommandOptionKind>[],
  Arguments extends CommandArgument<string, CommandArgumentKind>[]
> = {
  /** Parsed arguments, keyed by camelCased name */
  args: {
    [K in Arguments[number]['name'] as KebabToCamelCase<K>]: Extract<
      Arguments[number],
      { name: K }
    > extends { kind: 'variadic' }
      ? string[]
      : string;
  };
  /** Parsed options, keyed by camelCased longFlag */
  options: {
    [K in Options[number]['longFlag'] as KebabToCamelCase<K>]: Extract<
      Options[number],
      { longFlag: K }
    > extends { kind: 'flag' }
      ? boolean
      : Extract<Options[number], { longFlag: K }> extends {
          kind: 'variadic';
        }
      ? string[]
      : string;
  };
  /** Unparsed remaining tokens */
  unparsed: string[];
};

/**
 * Command handler function
 * @template Options - Option definitions
 * @template Arguments - Argument definitions
 */
export type CommandHandler<
  Options extends CommandOption<string, CommandOptionKind>[],
  Arguments extends CommandArgument<string, CommandArgumentKind>[]
> = (
  input: CommandInput<Options, Arguments>,
  command: Command<Options, Arguments>
) => void | Promise<void>;

export interface CommandConfig<
  Options extends CommandOption<string, CommandOptionKind>[],
  Arguments extends CommandArgument<string, CommandArgumentKind>[]
> {
  name: string;
  description: string;
  version: string;
  hidden: Record<CommandHideKind, boolean>;
  aliases: string[];
  options: Options;
  arguments: Arguments;
  handlers: CommandHandler<Options, Arguments>[];
  subcommands: Command<Options, Arguments>[];
}
