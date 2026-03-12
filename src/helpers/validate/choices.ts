import { CommandError } from "@/helpers/error.ts";

export function validateChoices(
  variant: "argument" | "option",
  opt: {
    value: string | string[];
    name: string;
    choices: string[];
  },
) {
  const { value, name, choices } = opt;

  const valuesToCheck = Array.isArray(value) ? value : value ? [value] : [];

  for (const value of valuesToCheck) {
    if (!choices.includes(value)) {
      throw new CommandError(
        `Value "${value}" for ${variant} "${name}" must be one of: ${
          choices.join(
            ", ",
          )
        }`,
      );
    }
  }
}
