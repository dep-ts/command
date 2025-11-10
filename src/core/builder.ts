import { Command } from './command.ts';
import type {
  CommandArgument,
  CommandArgumentKind,
  CommandConfig,
  CommandHandler,
  CommandOption,
  CommandOptionKind,
} from './types.ts';

import { $config } from '@/helpers/utils.ts';

/**
 * Internal interface for typing the return values of builder methods.
 * @private
 * @template Options - An array of CommandOption definitions.
 * @template Arguments - An array of CommandArgument definitions.
 */
export interface With<
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = []
> {
  /** The builder instance with updated types. */
  builder: CommandBuilder<Options, Arguments>;
  /** The command instance with updated types. */
  command: Command<Options, Arguments>;
}

/**
 * Builder class for constructing CLI commands with typed options, arguments, and subcommands.
 * @private
 * @template Options - An array of CommandOption definitions for the command.
 * @template Arguments - An array of CommandArgument definitions for the command.
 * @template Kind - Specifies the mode: 'builder' for building or 'command' for execution.
 */
export class CommandBuilder<
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = [],
  Kind extends 'builder' | 'command' = 'builder'
> {
  /**
   * Internal configuration object for the command.
   * @private
   */
  #config: CommandConfig<Options, Arguments> = {
    name: '',
    description: '',
    version: '1.0.0',
    hidden: {
      help: false,
      version: false,
    },
    aliases: [],
    handlers: [],
    options: [] as unknown as Options,
    arguments: [] as unknown as Arguments,
    subcommands: [],
  };

  /**
   * Accessor for the internal command configuration.
   * @returns The current CommandConfig for this builder.
   */
  [$config](): CommandConfig<Options, Arguments> {
    return this.#config;
  }

  /**
   * Adds an alias for the command.
   * @param alias - The alias string to add.
   * @returns The builder instance for chaining.
   */
  alias(alias: string): this {
    this.#config.aliases.push(alias);
    return this;
  }

  /**
   * Adds a positional argument to the command.
   * @template N - The name of the argument.
   * @template K - The kind of the argument (from CommandArgumentKind).
   * @template O - Indicates if the argument is optional.
   * @param name - The name of the argument.
   * @param config - Optional configuration: a description string or partial CommandArgument object.
   * @returns The updated builder or command instance with the new argument typed.
   */
  argument<N extends string, K extends CommandArgumentKind, O extends boolean>(
    name: N,
    config?: string | Partial<Omit<CommandArgument<N, K, O>, 'name'>>
  ): With<Options, [...Arguments, CommandArgument<N, K, O>]>[Kind] {
    const argument: CommandArgument<N, 'value', false> = {
      name,
      kind: 'value',
      optional: false,
    };

    if (typeof config === 'string') {
      Object.assign(argument, { description: config });
    } else if (config) {
      Object.assign(argument, config);
    }

    this.#config.arguments.push(argument);

    return this as unknown as With<
      Options,
      [...Arguments, CommandArgument<N, K, O>]
    >[Kind];
  }

  /**
   * Adds an option (flag) to the command.
   * @template L - The long flag name (e.g., '--output').
   * @template K - The kind of the option (from CommandOptionKind).
   * @template O - Indicates if the option is optional.
   * @param longFlag - The long flag for the option.
   * @param config - Optional configuration: for 'flag' kind, partial with kind, shortFlag, description; otherwise, partial omitting shortFlag.
   * @returns The updated builder or command instance with the new option typed.
   */
  option<L extends string, K extends CommandOptionKind, O extends boolean>(
    longFlag: L,
    config?: K extends 'flag'
      ? Partial<
          Pick<CommandOption<L, K, O>, 'kind' | 'shortFlag' | 'description'>
        >
      : Partial<Omit<CommandOption<L, K, O>, 'shortFlag'>>
  ): With<[...Options, CommandOption<L, K, O>], Arguments>[Kind] {
    const option: CommandOption<L, 'value', false> = {
      longFlag,
      kind: 'value',
      optional: false,
    };

    if (typeof config === 'string') {
      Object.assign(option, { description: config });
    } else if (config) {
      Object.assign(option, config);
    }

    this.#config.options.push(option);

    return this as unknown as With<
      [...Options, CommandOption<L, K, O>],
      Arguments
    >[Kind];
  }

  /**
   * Adds a handler function to execute when the command is run.
   * @param fn - The CommandHandler function.
   * @returns The builder instance for chaining.
   */
  handler(fn: CommandHandler<Options, Arguments>): this {
    this.#config.handlers.push(fn);
    return this;
  }

  /**
   * Creates and adds a subcommand to this command.
   * @param name - The name of the subcommand.
   * @param description - Optional description for the subcommand.
   * @returns A new CommandBuilder for the subcommand, allowing further configuration.
   */
  command(name: string, description = ''): CommandBuilder<Options, Arguments> {
    const cmd = new CommandBuilder<Options, Arguments>();
    cmd[$config]().name = name;
    cmd[$config]().description = description;
    this.#config.subcommands.push(cmd);
    return cmd;
  }
}
