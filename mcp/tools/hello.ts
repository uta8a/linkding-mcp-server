import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  input: z.string().describe("Input String"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = ({ input }: Schema): CallToolResult => {
  return {
    content: [
      {
        type: "text",
        text: `Hello, ${input}!`,
      },
    ],
    isError: false,
  };
};

export const hello = {
  name: "hello",
  description: "Say hello to someone",
  schema: mcpSchema,
  cb: handler,
};
