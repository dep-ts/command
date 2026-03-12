import { $config, Config } from "@/helpers/utils.ts";

function findSubcommand(
  subcommands: Config["subcommands"] = [],
  token: string,
) {
  return subcommands.find((sub) => {
    const { name, aliases } = sub[$config]();
    return name === token || aliases.includes(token);
  });
}

export function parseCommands(rootConfig: Config, tokens: string[]) {
  const chains = [rootConfig];
  let current = rootConfig;
  let consumedCount = 0;

  for (const token of tokens) {
    const subcommand = findSubcommand(current.subcommands, token);

    if (!subcommand) break;

    const subConfig = subcommand[$config]();
    chains.push(subConfig);
    current = subConfig;
    consumedCount++;
  }

  return {
    chains,
    remaining: tokens.slice(consumedCount),
  };
}
