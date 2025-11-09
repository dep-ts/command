// deno-lint-ignore-file ban-ts-comment no-process-global

export const getDefaultTokens = (): string[] => {
  if (typeof Deno !== 'undefined') {
    return Deno.args;
    //@ts-ignore
  } else if (typeof process !== 'undefined') {
    //@ts-ignore
    return process.argv.slice(2) as string[];
  }
  return [];
};
