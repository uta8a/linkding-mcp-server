import { z } from "npm:zod@3.24.2";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk@1.8.0";

// Define input schema
const mcpSchema = {
  id: z.number().describe("ID of the bookmark to delete"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ id }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    const response = await fetch(`${LINKDING_URL}/api/bookmarks/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error deleting bookmark: ${error}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Deleted bookmark (ID: ${id}).`,
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

export const delete_bookmark = {
  name: "delete_bookmark",
  description: "Delete a bookmark with the specified ID",
  schema: mcpSchema,
  cb: handler,
};
