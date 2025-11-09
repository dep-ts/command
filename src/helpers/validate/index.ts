import { validateName, validateAliases } from './name.ts';
import { validateArguments } from './argument.ts';
import { validateOptions } from './option.ts';
import { validateSubcommands } from './sub.ts';

import { type Config } from '@/helpers/utils.ts';

export const validateConfig = (config: Config): void => {
  validateName(config.name);
  validateAliases(config.aliases);
  validateArguments(config.arguments);
  validateOptions(config.options);
  validateSubcommands(config.subcommands);
};
