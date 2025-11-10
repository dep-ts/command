# @dep/command 🛠️

> A type-safe CLI command builder for Deno and Node.js, enabling easy creation of commands with arguments, options, subcommands, and handlers.

## [![JSR version](https://jsr.io/badges/@dep/command)](https://jsr.io/@dep/command)

## Features ✨

- 🔒 Type-safe definitions for arguments and options
- 📚 Support for nested subcommands and aliases
- ⚙️ Automatic handling of --help and --version flags
- ✅ Built-in validation for configurations and inputs
- 🔄 Variadic arguments and options for flexible parsing
- 📦 Seamless integration with Deno and Node.js environments

---

## Installation 📦

- **Deno**:
  ```bash
  deno add jsr:@dep/command
  ```
- **Node.js (18+)**:

  ```bash
  npx jsr add @dep/command
  ```

  Then import as an ES module:

  ```typescript
  import { Command } from '@dep/command';
  ```

---

## Usage 🎯

### CLI 💻 <!-- if available -->

This package is a library for building CLI tools. Once you've defined your command, you can run it from the command line using Deno or Node.js. For example, save the script below as `mycli.ts` and execute it with `deno run mycli.ts [args]` or `node mycli.js [args]`.

Example command execution:

```bash
deno run mycli.ts input.txt --output output.txt
```

### API 🧩

Use the `Command` class to build and configure your CLI. Here's a basic example:

```typescript
import { Command } from '@dep/command';

const cmd = new Command()
  .name('mycli')
  .description('A simple CLI tool example')
  .version('1.0.0')
  .argument('input', { description: 'Input file path' })
  .option('--output', {
    kind: 'value',
    description: 'Output file path',
    shortFlag: '-o',
  })
  .handler(({ args, options }) => {
    console.log('Input file:', args.input);
    console.log('Output file:', options.output);
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

For more advanced usage, including subcommands:

```typescript
import { Command } from '@dep/command';

const cmd = new Command()
  .name('mycli')
  .description('CLI with subcommands')
  .command('sub', 'Subcommand description')
  .argument('arg', 'Subcommand argument')
  .handler(({ args }) => {
    console.log('Subcommand arg:', args.arg);
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

Run with `mycli sub value` to execute the subcommand.

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
