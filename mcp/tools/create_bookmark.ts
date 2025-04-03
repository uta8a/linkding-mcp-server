import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  url: z.string().describe("linkding bookmark url"),
  notes: z.string().describe("linkding bookmark description"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ url, notes }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");
    const response = await fetch(`${LINKDING_URL}/api/bookmarks/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        notes,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error creating bookmark: ${error.detail}`);
    }
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Bookmark created with url: ${data}`,
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

export const create_bookmark = {
  name: "create_bookmark",
  description: "Create a bookmark in linkding",
  schema: mcpSchema,
  cb: handler,
};
