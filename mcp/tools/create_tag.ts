import { z } from "npm:zod@3.24.2";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk@1.8.0";

// Define input schema
const mcpSchema = {
  name: z.string().describe("Name of the tag to create"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ name }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    const response = await fetch(`${LINKDING_URL}/api/tags/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error creating tag: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Created tag "${name}": ${JSON.stringify(data, null, 2)}`,
        },
      ],
      isError: false,
    };
  } catch (e) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${e}`,
        },
      ],
      isError: true,
    };
  }
};

export const create_tag = {
  name: "create_tag",
  description: "Create a new tag in linkding",
  schema: mcpSchema,
  cb: handler,
};
