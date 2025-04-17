import { z } from "npm:zod@3.24.2";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk@1.8.0";

// Define input schema
const mcpSchema = {
  id: z.number().describe("ID of the bookmark to add a tag to"),
  tag_name: z.string().describe("Name of the tag to add"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ id, tag_name }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // Fetch the current bookmark data
    const bookmarkResponse = await fetch(
      `${LINKDING_URL}/api/bookmarks/${id}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${LINKDING_API_KEY}`,
        },
      },
    );

    if (!bookmarkResponse.ok) {
      const error = await bookmarkResponse.json();
      throw new Error(`Error fetching bookmark: ${JSON.stringify(error)}`);
    }

    const bookmarkData = await bookmarkResponse.json();

    // Add the new tag to the existing tags
    const updatedTags = new Set(bookmarkData.tag_names || []);
    updatedTags.add(tag_name);

    // Update the bookmark with the new tags
    const updateResponse = await fetch(`${LINKDING_URL}/api/bookmarks/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag_names: Array.from(updatedTags) }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Error updating bookmark: ${JSON.stringify(error)}`);
    }

    const updatedBookmark = await updateResponse.json();
    return {
      content: [
        {
          type: "text",
          text: `Added tag '${tag_name}' to bookmark (ID: ${id}): ${
            JSON.stringify(updatedBookmark, null, 2)
          }`,
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

export const add_tag_to_bookmark = {
  name: "add_tag_to_bookmark",
  description: "Add a tag to a bookmark with the specified ID",
  schema: mcpSchema,
  cb: handler,
};
