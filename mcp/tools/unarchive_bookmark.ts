import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  id: z.number().describe("ID of the bookmark to unarchive"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ id }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    const response = await fetch(
      `${LINKDING_URL}/api/bookmarks/${id}/unarchive/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${LINKDING_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error unarchiving bookmark: ${error}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Unarchived bookmark (ID: ${id}).`,
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

export const unarchive_bookmark = {
  name: "unarchive_bookmark",
  description: "Unarchive a bookmark with the specified ID",
  schema: mcpSchema,
  cb: handler,
};
