import {
  McpServer,
  ToolCallback,
} from "npm:@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import { RawZodShape, Transport } from "npm:@modelcontextprotocol/sdk";
import { hello } from "./tools/hello.ts";
import { create_bookmark } from "./tools/create_bookmark.ts";

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
  server.registerTool(hello);
  server.registerTool(create_bookmark);
  await server.connect(new StdioServerTransport());
};
