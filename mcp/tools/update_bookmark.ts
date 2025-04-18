import { z } from "npm:zod@3.24.2";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk@1.8.0";

// Define input schema
const mcpSchema = {
  id: z.number().describe("ID of the bookmark to update"),
  url: z.string().optional().describe("linkding bookmark url"),
  title: z.string().optional().describe("linkding bookmark title"),
  description: z.string().optional().describe("linkding bookmark description"),
  notes: z.string().optional().describe("linkding bookmark notes"),
  is_archived: z.boolean().optional().describe("Archive status"),
  unread: z.boolean().optional().describe("Unread status"),
  shared: z.boolean().optional().describe("Shared status"),
  tag_names: z.array(z.string()).optional().describe("Array of tag names"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({
  id,
  url,
  title,
  description,
  notes,
  is_archived,
  unread,
  shared,
  tag_names,
}: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // Prepare data for update
    const updateData: Record<string, unknown> = {};
    if (url !== undefined) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (is_archived !== undefined) updateData.is_archived = is_archived;
    if (unread !== undefined) updateData.unread = unread;
    if (shared !== undefined) updateData.shared = shared;
    if (tag_names !== undefined) updateData.tag_names = tag_names;

    const response = await fetch(`${LINKDING_URL}/api/bookmarks/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error updating bookmark: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Updated bookmark (ID: ${id}): ${
            JSON.stringify(data, null, 2)
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

export const update_bookmark = {
  name: "update_bookmark",
  description: "Update a bookmark with the specified ID",
  schema: mcpSchema,
  cb: handler,
};
