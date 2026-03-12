# @dep/command 🛠️

> A type-safe CLI command builder for Deno and Node.js, enabling easy creation
> of commands with arguments, options, subcommands, and handlers.

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
  import { Command } from "@dep/command";
  ```

---

## Usage 🎯

Use the `Command` class to build and run CLI applications with arguments,
options, and subcommands.

```ts
//cli.ts
import { Command, CommandError } from "@dep/command";

const http = new Command()
  .name("http")
  .version("1.0.0")
  .description("A lightweight HTTP client CLI")
  .argument("url", "The target URL for the request")
  .option("--header", {
    shortFlag: "-H",
    description: 'Custom header (e.g., "Content-Type: application/json")',
    optional: true,
  });

http.command("get", "Perform a GET request").handler(({ args, options }) => {
  console.log(`GET ${args.url}`);
  console.log(`Header: ${options.header}`);
});

http
  .command("post", "Perform a POST request")
  .option("--body", {
    shortFlag: "-B",
    description: "The JSON body string to send",
  })
  .handler(({ args, options }) => {
    console.log(`POST ${args.url}`);
    console.log(`Body: ${options.body}`);
  });

try {
  // uses Deno.args or process.argv.slice(2)
  await http.run();
} catch (err) {
  if (err instanceof CommandError) {
    console.error(`\nError: ${err.message}\n`);
    http.help();
    Deno.exit(1); // or process.exit(1)
  }
  throw err;
}
```

### Running the CLI 💻

```bash
deno run cli.ts --help
```

```text
Usage: http <url> [options] [command]

A lightweight HTTP client CLI

Arguments:
  <url>           The target URL for the request

Options:
--header, -H  [header]             Custom header (e.g., "Content-Type: application/json")
--help, -h                         Show help
--version, -v                      Show version

Commands:
  get             Perform a GET request
  post            Perform a POST request
```

```bash
deno run cli.ts get 'https://estarlincito.com' --header "Authorization: Kyumiu"
```

```text
GET https://estarlincito.com
Header: Authorization: Kyumiu
```

```bash
deno run cli.ts post 'https://estarlincito.com' --body "user: estarlincito"
```

```text
POST https://estarlincito.com
Body: user: estarlincito
```

## License 📄

MIT License – see [LICENSE](LICENSE) for details.

**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
