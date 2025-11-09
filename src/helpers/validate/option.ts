import { CommandError } from '@/helpers/error.ts';
import { type Config } from '@/helpers/utils.ts';

const validateOptionFormat = (
  name: string | undefined,
  variant: 'Long flag' | 'Short flag'
) => {
  if (name && !/^[a-zA-Z-][a-zA-Z0-9_-]*$/.test(name)) {
    throw new CommandError(
      `Invalid ${variant} "${name}". ${variant}s must start with a letter or hyphen and contain only letters, numbers, hyphens, or underscores.`
    );
  }
};

export const validateOptions = (options: Config['options']) => {
  const optionNames = new Set<string>();

  for (const opt of options) {
    if (!opt.longFlag) throw new CommandError('Option longFlag is required');
    validateOptionFormat(opt.longFlag, 'Long flag');
    validateOptionFormat(opt.shortFlag, 'Short flag');

    if (optionNames.has(opt.longFlag))
      throw new CommandError(`Duplicate option longFlag "${opt.longFlag}"`);

    optionNames.add(opt.longFlag);

    if (opt.shortFlag && optionNames.has(opt.shortFlag))
      throw new CommandError(
        `Duplicate shortFlag "${opt.shortFlag}" in options`
      );

    if (opt.shortFlag) optionNames.add(opt.shortFlag);

    if (
      opt.kind === 'value' ||
      opt.kind === 'variadic' ||
      opt.kind === 'inline'
    ) {
      if (opt.choices && opt.default) {
        const defaultValues = Array.isArray(opt.default)
          ? opt.default
          : [opt.default];

        if (!opt.choices.some((choice) => defaultValues.includes(choice))) {
          throw new CommandError(
            `Default value "${opt.default}" for option "${
              opt.longFlag
            }" must be one of: ${opt.choices.join(', ')}`
          );
        }
      }

      if (!opt.optional && opt.default)
        throw new CommandError(
          `Option "${opt.longFlag}" cannot have a default value if it's required`
        );
    }
  }
};
