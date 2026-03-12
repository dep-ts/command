import { CommandError } from "@/helpers/error.ts";
import { kebabToCamelCase } from "@/helpers/utils.ts";
import { validateChoices } from "@/helpers/validate/choices.ts";
import { CommandSchema, type ParseInput } from "@/helpers/parse/input.ts";

export function validateInput(schema: CommandSchema, input: ParseInput) {
  // Validate choices, required options and apply defaults
  for (const option of schema.options) {
    if (
      option.kind === "inline" ||
      option.kind === "variadic" ||
      option.kind === "value"
    ) {
      const key = kebabToCamelCase(option.longFlag);
      const optionValue = input.options[key];

      if (!input.options[key] && !option.optional) {
        throw new CommandError(
          `Required option "${option.longFlag}" is missing`,
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

      if (option.choices && typeof optionValue !== "boolean") {
        validateChoices("option", {
          choices: option.choices,
          value: optionValue,
          name: option.longFlag,
        });
      }
    }
  }

  // Validate choices,required arguments and apply defaults
  for (
    const {
      name,
      optional,
      default: defaultValue,
      choices,
    } of schema.arguments
  ) {
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
      validateChoices("argument", { choices, value: argValue, name });
    }
  }
}
