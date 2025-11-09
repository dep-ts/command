import { parseRuntime } from '@/helpers/parse/index.ts';
import { runner } from '@/helpers/runner.ts';

import type {
  CommandArgument,
  CommandArgumentKind,
  CommandConfig,
  CommandHandler,
  CommandInput,
  CommandOption,
  CommandHideKind,
  CommandOptionKind,
} from './types.ts';

import { showHelp } from '@/helpers/help.ts';
import { $config, Config } from '@/helpers/utils.ts';
import { getDefaultTokens } from '@/helpers/token.ts';

/**
 * Builder-style API for configuring a {@link Command}.
 *
 * The generic arguments `Options` and `Arguments` are the *current* list of
 * options / arguments that have been added to the command.  They are used
 * only for type-safety – the runtime representation lives in
 * {@link Command.#config}.
 *
 * @template Options  Tuple of all options added so far.
 * @template Arguments Tuple of all arguments added so far.
 * @private
 */
class CommandBuilder<
  Options extends CommandOption<string, CommandOptionKind>[] = [],
  Arguments extends CommandArgument<string, CommandArgumentKind>[] = []
> {
  /** @private */
  constructor(private cmd: Command<Options, Arguments>) {}

  /**
   * Add an alias for the command.
   *
   * @param alias The alias string.
   * @returns `this` for chaining.
   */
  alias(alias: string): this {
    this.cmd.alias(alias);
    return this;
  }

  /**
   * Declare a positional argument.
   *
   * @param name   The argument name (shown in help as `<name>` or `[name…]`).
   * @param config Rest of the argument definition (kind defaults to `'value'`).
   * @returns A new builder with the updated `Arguments` tuple.
   *
   * @template N Argument name.
   * @template K Argument kind.
   */
  argument<N extends string, K extends CommandArgumentKind>(
    name: N,
    config?: Omit<CommandArgument<N, K>, 'name'>
  ): CommandBuilder<Options, [...Arguments, CommandArgument<N, K>]> {
    this.cmd.argument(name, config);
    return this as unknown as CommandBuilder<
      Options,
      [...Arguments, CommandArgument<N, K>]
    >;
  }

  /**
   * Declare an option (flag, value, inline, variadic…).
   *
   * @param longFlag The long flag (e.g. `--output`).
   * @param config   Rest of the option definition (kind defaults to `'value'`).
   * @returns A new builder with the updated `Options` tuple.
   *
   * @template L Long flag literal.
   * @template K Option kind.
   */
  option<L extends string, K extends CommandOptionKind>(
    longFlag: L,
    config?: Omit<CommandOption<L, K>, 'longFlag'>
  ): CommandBuilder<[...Options, CommandOption<L, K>], Arguments> {
    this.cmd.option(longFlag, config);
    return this as unknown as CommandBuilder<
      [...Options, CommandOption<L, K>],
      Arguments
    >;
  }

  /**
   * Register a handler that will be executed when the command runs.
   *
   * @param fn The handler function.
   * @returns `this` for chaining.
   */
  handler(fn: CommandHandler<Options, Arguments>): this {
    this.cmd.handler(fn);
    return this;
  }

  /**
   * Create a sub-command.
   *
   * @param name        Sub-command name.
   * @param description Optional description shown in help.
   * @returns A builder for the new sub-command.
   */
  command(name: string, description = ''): CommandBuilder<Options, Arguments> {
    const subCmd = new Command<Options, Arguments>()
      .name(name)
      .description(description);
    this.cmd.command(name, description);
    return new CommandBuilder(subCmd);
  }
}

/**
 * Core CLI command class.
 *
 * ```ts
 * new Command()
 *   .name('my-cli')
 *   .description('Does something awesome')
 *   .option('--dry-run', { kind: 'flag', shortFlag: '-n' })
 *   .argument('files', { kind: 'variadic' })
 *   .handler(async ({ options, args }) => {
 *     console.log(options.dryRun, args.files);
 *   });
 * ```
 *
 * @template Options   Tuple of all defined options.
 * @template Arguments Tuple of all defined positional arguments.
 */
export class Command<
  Options extends CommandOption<string, CommandOptionKind>[] = [],
  Arguments extends CommandArgument<string, CommandArgumentKind>[] = []
> {
  /**@private */
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

  constructor() {
    // Auto-add --help / --version unless hidden
    if (!this.#config.hidden.help) {
      this.option('--help', {
        kind: 'flag',
        description: `Show help`,
        shortFlag: '-h',
      });
    }

    if (!this.#config.hidden.version) {
      this.option('--version', {
        kind: 'flag',
        description: `Show version`,
        shortFlag: '-v',
      });
    }
  }

  /**
   * Set the command name (required).
   *
   * @param name The name.
   * @returns `this` for chaining.
   */
  name(name: string): this {
    this.#config.name = name;
    return this;
  }

  /**
   * Set a short description shown in help.
   *
   * @param description The description.
   * @returns `this` for chaining.
   */
  description(description: string): this {
    this.#config.description = description;
    return this;
  }

  /**
   * Override the version string (default `"1.0.0"`).
   *
   * @param version The version.
   * @returns `this` for chaining.
   */
  version(version: string): this {
    this.#config.version = version;
    return this;
  }

  /**
   * Hide built-in flags (`help` or `version`).
   *
   * @param kind Which flag to hide.
   * @returns `this` for chaining.
   */
  hide(kind: CommandHideKind): this {
    this.#config.hidden[kind] = true;
    return this;
  }

  /**
   * Add an alias for the command.
   *
   * @param alias The alias.
   * @returns `this` for chaining.
   */
  alias(alias: string): this {
    this.#config.aliases.push(alias);
    return this;
  }

  /**
   * Define an option.
   *
   * @param longFlag The long flag (e.g. `--output`).
   * @param config   Rest of the option definition.
   * @returns A new `Command` with the option added to the generic tuple.
   *
   * @template L Long flag literal.
   * @template K Option kind.
   */
  option<L extends string, K extends CommandOptionKind>(
    longFlag: L,
    config: Omit<CommandOption<L, K>, 'longFlag'> = {
      kind: 'value',
    } as Omit<CommandOption<L, K>, 'longFlag'>
  ): Command<[...Options, CommandOption<L, K>], Arguments> {
    this.#config.options.push({ ...config, longFlag });
    return this as unknown as Command<
      [...Options, CommandOption<L, K>],
      Arguments
    >;
  }

  /**
   * Define a positional argument.
   *
   * @param name   The argument name.
   * @param config Rest of the argument definition.
   * @returns A new `Command` with the argument added to the generic tuple.
   *
   * @template N Argument name.
   * @template K Argument kind.
   */
  argument<N extends string, K extends CommandArgumentKind>(
    name: N,
    config: Omit<CommandArgument<N, K>, 'name'> = { kind: 'value' } as Omit<
      CommandArgument<N, K>,
      'name'
    >
  ): Command<Options, [...Arguments, CommandArgument<N, K>]> {
    this.#config.arguments.push({ ...config, name });
    return this as unknown as Command<
      Options,
      [...Arguments, CommandArgument<N, K>]
    >;
  }

  /**
   * Register a handler that runs when the command is executed.
   *
   * @param fn The handler.
   * @returns `this` for chaining.
   */
  handler(fn: CommandHandler<Options, Arguments>): this {
    this.#config.handlers.push(fn);
    return this;
  }

  /**
   * Create a sub-command.
   *
   * @param name        Sub-command name.
   * @param description Optional description.
   * @returns A builder for the sub-command.
   */
  command(name: string, description = ''): CommandBuilder<Options, Arguments> {
    const cmd = new Command<Options, Arguments>()
      .name(name)
      .description(description);
    this.#config.subcommands.push(cmd);
    return new CommandBuilder(cmd);
  }

  /**
   * **(Internal)** Get the raw configuration object.
   *
   * @returns The config.
   * @private
   */
  [$config](): CommandConfig<Options, Arguments> {
    return this.#config;
  }

  /**
   * Parse tokens into typed input.
   *
   * @param tokens - Array of command-line tokens.
   *                 Defaults to `Deno.args.slice(2)` in Deno,
   *                 or `process.argv.slice(2)` in Node.js/Bun.
   *
   * @example
   * ```ts
   * const input = cmd.parse(); // uses real CLI args
   * const input = cmd.parse(['file.ts', '--watch']); // custom
   * ```
   */
  parse(
    tokens: string[] = getDefaultTokens()
  ): CommandInput<Options, Arguments> {
    return parseRuntime(tokens ?? [], this.#config as Config) as CommandInput<
      Options,
      Arguments
    >;
  }

  /**
   * Print the help screen for this command.
   */
  help() {
    showHelp(this.#config as Config);
  }

  /**
   * Execute the command (parse → run handlers → recurse into sub-commands).
   *
   * @param tokens Optional token array (defaults to Deno.args | `process.argv.slice(2)`).
   */
  async run(tokens?: string[]): Promise<void> {
    await runner(this as unknown as Parameters<typeof runner>[0], tokens);
  }
}
