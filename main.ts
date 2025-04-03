import { program } from "npm:commander@13.1.0";
import { run } from "./mcp/server.ts";

if (import.meta.main) {
  program
    .name("linkding-mcp-server")
    .description("Linkding MCP server")
    .version("0.1.0");
  program.parse();
  try {
    await run();
  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}
