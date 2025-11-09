# @deb/command 🛠️

> A lightweight, type-safe CLI command builder for Deno, Node.js, and browsers.

## [![JSR version](https://jsr.io/badges/@deb/command)](https://jsr.io/@deb/command)

## Features ✨

- 🧩 **Type-safe options & arguments** – Full TypeScript inference for flags, values, and variadics
- 🌳 **Nested subcommands** – Build complex CLI hierarchies with ease
- 🚦 **Smart parsing** – Supports `--flag`, `-f`, `--option=value`, variadic args, and more
- 📋 **Auto-generated help & version** – Built-in `--help` and `--version` with beautiful formatting
- ✅ **Validation & defaults** – Enforce required fields, choices, and default values at parse time
- 🔒 **Zero dependencies** – Pure TypeScript, works everywhere

---

## Installation 📦

- **Deno**:

  ```bash
  deno add jsr:@deb/command
  ```

- **Node.js (18+) or Browsers**:
  ```bash
  pnpm i jsr:@dep/table
  ```
  Then import as an ES module:
  ```typescript
  import { Command } from '@deb/command';
  ```

---

## Usage 🎯

### CLI 💻

```ts
// cli.ts
import { Command, CommandError } from '@deb/command';

const cli = new Command()
  .name('my-cli')
  .description('Does something awesome')
  .version('2.0.0')
  .option('--dry-run', {
    kind: 'flag',
    shortFlag: '-n',
    description: 'Don’t execute, just simulate',
  })
  .option('--output', {
    kind: 'value',
    shortFlag: '-o',
    description: 'Output file path',
  })
  .option('--tags', { kind: 'variadic', description: 'List of tags' })
  .argument('files', { kind: 'variadic', description: 'Files to process' })
  .handler(async ({ options, args }) => {
    console.log('Dry run:', options.dryRun);
    console.log('Output:', options.output);
    console.log('Tags:', options.tags);
    console.log('Files:', args.files);
  });

try {
  await clit.run(); // (defaults tokens Deno.args | `process.argv.slice(2)`)
} catch (err) {
  if (err instanceof CommandError) {
    console.error(`\nError: ${err.message}\n`);
    cmd.help();
    Deno.exit(1); //or process.exit(1);
  }
  throw err;
}
```

Run it:

```bash
deno run -A cli.ts src/*.ts --dry-run -o dist/ --tags build prod
# → Dry run: true
# → Output: dist/
# → Tags: [ 'build', 'prod' ]
# → Files: [ 'src/index.ts', 'src/utils.ts' ]
```

Use `--help`:

```bash
deno run -A cli.ts --help
```

```
Usage: my-cli [files...] [options]

Does something awesome

Arguments:
  files...         Files to process

Options:
  --dry-run, -n    Don’t execute, just simulate
  --output, -o     Output file path
  --tags           List of tags
  --help, -h       Show help
  --version, -v    Show version
```

---

### Subcommands 🌿

```ts
import { Command, CommandError } from '@deb/command';

const cli = new Command()
  .name('git')
  .description('Git-like CLI')
  .command('commit', 'Record changes')
  .option('--message', { kind: 'value', shortFlag: '-m' })
  .option('--all', { kind: 'flag', shortFlag: '-a' })
  .handler(({ options }) => {
    console.log('Committing with message:', options.message);
  })
  .command('push', 'Push changes')
  .handler(() => {
    console.log('Pushing...');
  });

try {
  await clit.run(); // (defaults tokens Deno.args | `process.argv.slice(2)`)
} catch (err) {
  if (err instanceof CommandError) {
    console.error(`\nError: ${err.message}\n`);
    cmd.help();
    Deno.exit(1); //or process.exit(1);
  }
  throw err;
}
```

```bash
deno run -A git.ts commit -m "fix bug" --all
# → Committing with message: fix bug
```

---

### API 🧩

```ts
const cmd = new Command()
  .name('build')
  .option('--watch', { kind: 'flag' })
  .argument('entry', { kind: 'value' });

// Parse custom tokens
const input = cmd.parse(['app.ts', '--watch']); // (defaults tokens Deno.args | `process.argv.slice(2)`)
console.log(input.options.watch); // true
console.log(input.args.entry); // "app.ts"
```

---

## Advanced Options

```ts
.option('--mode', {
  kind: 'value',
  choices: ['development', 'production'],
  default: 'development'
})
.option('--config', {
  kind: 'inline', // --config=path
  optional: true
})
```

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
