import { CommandError } from '@/helpers/error.ts';
import { $config, type Config } from '@/helpers/utils.ts';
import { validateConfig } from './index.ts';

export const validateSubcommands = (subcommands: Config['subcommands']) => {
  const subcommandNames = new Set<string>();

  for (const subCmd of subcommands) {
    const subConfig = subCmd[$config]();

    if (!subConfig.name) {
      throw new CommandError('Subcommand name is required');
    }

    if (subcommandNames.has(subConfig.name)) {
      throw new CommandError(`Duplicate subcommand name "${subConfig.name}"`);
    }

    subcommandNames.add(subConfig.name);
    validateConfig(subConfig);
  }
};
