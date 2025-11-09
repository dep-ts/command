import { CommandError } from '@/helpers/error.ts';
import { type Config } from '@/helpers/utils.ts';

export const checkNameFormat = (
  name: string,
  variant: 'Command' | 'Alias' | 'Argument' = 'Command'
) => {
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    throw new CommandError(
      `${variant} name "${name}" must start with a letter and contain only letters, numbers, underscores, or hyphens`
    );
  }
};

export const validateName = (name: Config['name']) => {
  if (!name) throw new CommandError('Command name is required');
  checkNameFormat(name);
};

export const validateAliases = (aliases: Config['aliases']) => {
  const seenAliases = new Set();

  for (const alias of aliases) {
    checkNameFormat(alias, 'Alias');

    if (seenAliases.has(alias))
      throw new CommandError(`Duplicate alias "${alias}"`);

    seenAliases.add(alias);
  }
};
