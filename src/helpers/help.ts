import {
  CommandArgument,
  CommandArgumentKind,
  CommandConfig,
  CommandOption,
  CommandOptionKind,
} from "@/core/types.ts";

import { Text } from "@dep/table";
import { $config } from "./utils.ts";

function formatArgumentName(
  name: string,
  kind: CommandArgumentKind,
  optional = false,
): string {
  const baseName = name.replace(/^--/, "");
  const suffix = kind === "variadic" ? "..." : "";
  const format = `${baseName}${suffix}`;
  return optional ? `[${format}]` : `<${format}>`;
}

function formatOptionFlag(
  flag: string,
  kind: CommandOptionKind,
  optional = false,
): string {
  const normalizedFlag = flag.startsWith("-")
    ? flag
    : flag.length === 1
    ? `-${flag}`
    : `--${flag}`;

  if (kind === "inline") {
    return optional ? `${normalizedFlag}[=value]` : `${normalizedFlag}=value`;
  }

  return normalizedFlag;
}

export function showHelp<
  Options extends CommandOption[] = [],
  Arguments extends CommandArgument[] = [],
>(chains: Array<CommandConfig<Options, Arguments>>) {
  const fullCommandName = chains.map((c) => c.name);
  const allOptions = chains.flatMap((c) => c.options ?? []);
  const leafCommand = chains[chains.length - 1];
  const description = leafCommand.description;

  function printUsage() {
    const commandsStr = leafCommand.subcommands.length > 0 ? "[command]" : "";
    const optionsStr = allOptions.length > 0 ? "[options]" : "";
    const argsStr = leafCommand.arguments
      .map(({ name, optional, kind }) =>
        formatArgumentName(name, kind, optional)
      )
      .join(" ");

    console.log(
      `\nUsage: ${fullCommandName.join(" ")}${argsStr ? ` ${argsStr}` : ""}${
        optionsStr ? ` ${optionsStr}` : ""
      }${commandsStr ? ` ${commandsStr}` : ""}`,
    );
  }

  function printDescription() {
    if (description) {
      console.log(`\n${description}`);
    }
  }

  function printArguments() {
    const args = chains.flatMap((c) => c.arguments || []);
    if (args.length > 0) {
      console.log("\nArguments:");
      args.forEach(({ name, description, kind, optional }) => {
        console.log(
          `  ${formatArgumentName(name, kind, optional).padEnd(15)} ${
            description ?? ""
          }`,
        );
      });
    }
  }

  function printOptions() {
    if (allOptions.length > 0) {
      console.log("\nOptions:");
      const table = new Text();

      allOptions.forEach((opt) => {
        const normalizedLongFlag = opt.kind === "flag"
          ? formatOptionFlag(opt.longFlag, opt.kind)
          : formatOptionFlag(opt.longFlag, opt.kind, opt.optional);

        const normalizedShortFlag = opt.shortFlag
          ? opt.kind === "flag"
            ? formatOptionFlag(opt.shortFlag, opt.kind)
            : formatOptionFlag(opt.shortFlag, opt.kind, opt.optional)
          : "";

        const normalizedArg = opt.kind === "value" || opt.kind === "variadic"
          ? formatArgumentName(opt.longFlag, opt.kind, opt.optional)
          : "";

        table.add(
          `${normalizedLongFlag}, ${normalizedShortFlag}`,
          normalizedArg,
          opt.description ?? "",
        );
      });

      table.setColumnWidth(1, 20);
      console.log(table.build());
    }
  }

  function printSubcommands() {
    if (leafCommand.subcommands.length > 0) {
      console.log("\nCommands:");
      leafCommand.subcommands.forEach((cmd) => {
        const cmdCtx = cmd[$config]();

        const aliases = cmdCtx.aliases.length > 0
          ? ` (aliases: ${cmdCtx.aliases.join(", ")})`
          : "";
        console.log(
          `  ${cmdCtx.name.padEnd(15)} ${cmdCtx.description}${aliases}`,
        );
      });
    }
  }

  printUsage();
  printDescription();
  printArguments();
  printOptions();
  printSubcommands();
  console.log("");
}
