import { showHelp } from '@/helpers/help.ts';
import { parseRuntime } from '@/helpers/parse/index.ts';
import { runner } from '@/helpers/runner.ts';
import { getDefaultTokens } from '@/helpers/token.ts';
import { CommandBuilder } from './builder.ts';

import type {
  CommandArgument,
  CommandInput,
  CommandOption,
  CommandHideKind,
} from './types.ts';

import { $config } from '@/helpers/utils.ts';

/**
 * The main Command class for defining and executing CLI commands.
 * Extends CommandBuilder to provide additional methods for configuration and execution.
 * @template Options - An array of CommandOption definitions for the command.
 * @template Arguments - An array of CommandArgument definitions for the command.
 * @example
 * ```typescript
 * import { Command } from '@dep/command';
 *
 * const cmd = new Command()
 *   .name('mycli')
 *   .description('A simple CLI tool example')
 *   .version('1.0.0')
 *   .argument('input', { description: 'Input file path' })
 *   .option('--output', { kind: 'value', description: 'Output file path', shortFlag: '-o' })
 *   .handler(({ args, options }) => {
 *     console.log('Input file:', args.input);
 *     console.log('Output file:', options.output);
 *   });
 *
 * cmd.run();
 * ```
 */
export class Command<
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = []
> extends CommandBuilder<Options, Arguments, 'command'> {
  /**
   * Sets the name of the command.
   * @param name - The name to assign to the command.
   * @returns The Command instance for chaining.
   */
  name(name: string): this {
    this[$config]().name = name;
    return this;
  }

  /**
   * Sets the description of the command.
   * @param description - The description to assign to the command.
   * @returns The Command instance for chaining.
   */
  description(description: string): this {
    this[$config]().description = description;
    return this;
  }

  /**
   * Sets the version of the command.
   * @param version - The version string to assign.
   * @returns The Command instance for chaining.
   */
  version(version: string): this {
    this[$config]().version = version;
    return this;
  }

  hide(kind: CommandHideKind): this {
    this[$config]().hidden[kind] = true;
    return this;
  }

  /**
   * Parses the provided tokens (or default CLI arguments) into a typed CommandInput.
   * Automatically adds --help/-h and --version/-v options unless hidden.
   * @param tokens - Optional array of tokens to parse; defaults to process/Deno args.
   * @returns The parsed CommandInput with typed args, options, and unparsed tokens.
   */
  parse(
    tokens: string[] = getDefaultTokens()
  ): CommandInput<Options, Arguments> {
    // Auto-add --help / --version unless hidden
    if (!this[$config]().hidden.help) {
      this.option('--help', {
        kind: 'flag',
        description: `Show help`,
        shortFlag: '-h',
      });
    }

    if (!this[$config]().hidden.version) {
      this.option('--version', {
        kind: 'flag',
        description: `Show version`,
        shortFlag: '-v',
      });
    }
    return parseRuntime(this[$config](), tokens ?? []) as CommandInput<
      Options,
      Arguments
    >;
  }

  /**
   * Displays the help information for the command if not hidden.
   */
  help() {
    if (!this[$config]().hidden.help) {
      showHelp(this[$config]());
    }
  }

  /**
   * Runs the command with the provided tokens (or default CLI arguments).
   * Parses input, handles flags like --help/--version, executes handlers, and processes subcommands.
   * @param tokens - Optional array of tokens to run with; defaults to process/Deno args.
   * @returns A Promise that resolves when the command execution completes.
   */
  async run(tokens?: string[]): Promise<void> {
    await runner(this[$config](), tokens);
  }
}
