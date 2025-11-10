import { parseCommandOption } from './option.ts';

import { parseCommandArgument } from './argument.ts';
import { type Config } from '@/helpers/utils.ts';
import { CommandError } from '@/helpers/error.ts';

import { isOption, kebabToCamelCase, isSubcommand } from '@/helpers/utils.ts';
import { validateConfig } from '@/helpers/validate/index.ts';
import { CommandArgument, CommandConfig, CommandOption } from '@/core/types.ts';

export const validateChoices = (
  variant: 'argument' | 'option',
  opt: {
    value: string | string[];
    name: string;
    choices: string[];
  }
) => {
  const { value, name, choices } = opt;

  const valuesToCheck = Array.isArray(value) ? value : value ? [value] : [];

  for (const value of valuesToCheck) {
    if (!choices.includes(value)) {
      throw new CommandError(
        `Value "${value}" for ${variant} "${name}" must be one of: ${choices.join(
          ', '
        )}`
      );
    }
  }
};

export interface ParseInput {
  args: Record<string, string | string[]>;
  options: Record<string, string | string[] | boolean>;
  unparsed: string[];
}

export const parseRuntime = <
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = []
>(
  config: CommandConfig<Options, Arguments>,
  tokens: string[] = []
): ParseInput => {
  const $config = config as Config;
  validateConfig($config);

  const input: ParseInput = {
    args: {},
    options: {},
    unparsed: [],
  };

  let argIndex = 0;
  let tokenIndex = 0;

  while (tokenIndex < tokens.length) {
    const token = tokens[tokenIndex];

    // '--' separator → stop parsing
    if (token === '--') {
      input.unparsed = tokens.slice(tokenIndex + 1);
      break;
    }

    // Options (flags, inline, values or variadic.)
    if (isOption(token)) {
      const { option, consumed } = parseCommandOption(
        token,
        tokens.slice(tokenIndex),
        $config
      );
      Object.assign(input.options, option);

      //Exit early if --help | -h
      if (!config.hidden.version && ['--version', '-v'].includes(token)) {
        return input;
      }

      //Exit early if  --version | -v
      if (!config.hidden.help && ['--help', '-h'].includes(token)) {
        return input;
      }

      tokenIndex += consumed;
      continue;
    }

    // Subcommands (stop here and pass remainder)
    if (isSubcommand(token, $config.subcommands)) {
      input.unparsed = tokens.slice(tokenIndex);
      break;
    }

    // Positional arguments
    const { argument, consumed } = parseCommandArgument(
      tokens.slice(tokenIndex),
      $config,
      argIndex
    );
    Object.assign(input.args, argument);
    tokenIndex += consumed;
    argIndex++;
  }

  // Validate choices, required options and apply defaults
  for (const option of config.options) {
    if (
      option.kind === 'inline' ||
      option.kind === 'variadic' ||
      option.kind === 'value'
    ) {
      const key = kebabToCamelCase(option.longFlag);
      const optionValue = input.options[key];

      if (!input.options[key] && !option.optional) {
        throw new CommandError(
          `Required option "${option.longFlag}" is missing`
        );
      }

      if (option.default) {
        if (
          !input.options[key] ||
          (Array.isArray(input.options[key]) && input.options[key].length === 0)
        ) {
          input.options[key] = option.default;
        }
      }

      if (option.choices && typeof optionValue !== 'boolean') {
        validateChoices('option', {
          choices: option.choices,
          value: optionValue,
          name: option.longFlag,
        });
      }
    }
  }

  // Validate choices,required arguments and apply defaults
  for (const {
    name,
    optional,
    default: defaultValue,
    choices,
  } of config.arguments) {
    const key = kebabToCamelCase(name);
    const argValue = input.args[key];
    if (!argValue && !optional) {
      throw new CommandError(`Required argument "${name}" is missing`);
    }

    if (defaultValue) {
      if (!argValue || (Array.isArray(argValue) && argValue.length === 0)) {
        input.args[key] = defaultValue;
      }
    }

    if (choices) {
      validateChoices('argument', { choices, value: argValue, name });
    }
  }

  return input;
};
