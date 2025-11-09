import { CommandError } from '@/helpers/error.ts';
import { type Config } from '@/helpers/utils.ts';
import { checkNameFormat } from './name.ts';

export const validateArguments = (args: Config['arguments']) => {
  const argNames = new Set<string>();
  for (const arg of args) {
    if (!arg.name) throw new CommandError('Argument name is required');

    checkNameFormat(arg.name, 'Argument');

    if (argNames.has(arg.name))
      throw new CommandError(`Duplicate argument name "${arg.name}"`);

    argNames.add(arg.name);

    if (arg.choices && arg.default) {
      const defaultValues = Array.isArray(arg.default)
        ? arg.default
        : [arg.default];

      if (!arg.choices.some((choice) => defaultValues.includes(choice)))
        throw new CommandError(
          `Default value "${arg.default}" for argument "${
            arg.name
          }" must be one of: ${arg.choices.join(', ')}`
        );
    }

    if (!arg.optional && arg.default)
      throw new CommandError(
        `Argument "${arg.name}" cannot have a default value if it's required`
      );

    if (arg.kind !== 'variadic' && arg.default && Array.isArray(arg.default))
      throw new CommandError(
        `Default value for argument "${arg.name}" cannot be an array if variant is value`
      );
  }
};
