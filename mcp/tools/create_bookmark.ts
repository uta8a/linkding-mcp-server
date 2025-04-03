import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  url: z.string().describe("linkding bookmark url"),
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

    // Prepare data for bookmark creation
    const bookmarkData: Record<string, unknown> = { url };
    if (title !== undefined) bookmarkData.title = title;
    if (description !== undefined) bookmarkData.description = description;
    if (notes !== undefined) bookmarkData.notes = notes;
    if (is_archived !== undefined) bookmarkData.is_archived = is_archived;
    if (unread !== undefined) bookmarkData.unread = unread;
    if (shared !== undefined) bookmarkData.shared = shared;
    if (tag_names !== undefined) bookmarkData.tag_names = tag_names;

    const response = await fetch(`${LINKDING_URL}/api/bookmarks/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookmarkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error creating bookmark: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Bookmark created: ${JSON.stringify(data, null, 2)}`,
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
  description: "Create a new bookmark in linkding",
  schema: mcpSchema,
  cb: handler,
};
