import {
  McpServer,
  ToolCallback,
} from "npm:@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import { RawZodShape, Transport } from "npm:@modelcontextprotocol/sdk";
import { create_bookmark } from "./tools/create_bookmark.ts";
import { archive_bookmark } from "./tools/archive_bookmark.ts";
import { create_tag } from "./tools/create_tag.ts";
import { delete_bookmark } from "./tools/delete_bookmark.ts";
import { get_bookmark } from "./tools/get_bookmark.ts";
import { get_bookmarks } from "./tools/get_bookmarks.ts";
import { get_tags } from "./tools/get_tags.ts";
import { unarchive_bookmark } from "./tools/unarchive_bookmark.ts";
import { update_bookmark } from "./tools/update_bookmark.ts";
import { check_bookmark } from "./tools/check_bookmark.ts";

type Tool<Args extends RawZodShape> = {
  name: string;
  description: string;
  schema: Args;
  cb: ToolCallback<Args>;
};

class WrapMcpServer {
  private server: McpServer;
  constructor(server: McpServer) {
    this.server = server;
  }
  public registerTool<T extends RawZodShape>(
    { name, description, schema, cb }: Tool<T>,
  ): void {
    this.server.tool<T>(
      name,
      description,
      schema,
      cb,
    );
  }
  public connect(transport: Transport) {
    return this.server.connect(transport);
  }
}

export const run = async () => {
  const s = new McpServer({
    name: "linkding-mcp-server",
    version: "0.1.0",
  });
  const server = new WrapMcpServer(s);
  server.registerTool(check_bookmark);
  server.registerTool(create_bookmark);
  server.registerTool(archive_bookmark);
  server.registerTool(create_tag);
  server.registerTool(delete_bookmark);
  server.registerTool(get_bookmark);
  server.registerTool(get_bookmarks);
  server.registerTool(get_tags);
  server.registerTool(unarchive_bookmark);
  server.registerTool(update_bookmark);

  await server.connect(new StdioServerTransport());
};
