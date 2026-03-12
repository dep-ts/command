import { Command } from "./command.ts";
import { assertDeepEqual } from "@dep/assert";

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

const url = "https://estarlincito.com";

Deno.test("http", () =>
  assertDeepEqual(http.parse([url]).args, {
    url,
  }));

Deno.test("get", () =>
  assertDeepEqual(http.parse(["get", url]).args, {
    url,
  }));

Deno.test("post", () => {
  assertDeepEqual(
    http.parse([
      "post",
      url,
      "--header",
      "Authorization: Kyumiu",
      "--body",
      "user: estarlincito",
    ]).options,
    {
      header: "Authorization: Kyumiu",
      body: "user: estarlincito",
    },
  );
});
