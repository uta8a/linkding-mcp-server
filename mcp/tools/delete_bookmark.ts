import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  id: z.number().describe("削除するブックマークのID"),
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
          text: `ブックマーク (ID: ${id}) を削除しました。`,
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
  description: "指定したIDのブックマークを削除",
  schema: mcpSchema,
  cb: handler,
};
