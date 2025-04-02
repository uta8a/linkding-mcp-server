import { program } from "npm:commander";
import { run } from "./mcp/server.ts";

program
  .name("my-cli")
  .description("My CLI for various tasks")
  .version("0.1.0");
program.parse();

try {
  await run();
} catch (e) {
  console.error(e);
  Deno.exit(1);
}
