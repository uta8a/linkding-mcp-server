import { z } from "npm:zod";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  q: z.string().optional().describe("Search phrase"),
  limit: z.number().optional().describe(
    "Maximum number of results (default 100)",
  ),
  offset: z.number().optional().describe("Starting index for results"),
  archived: z.boolean().optional().describe(
    "If true, retrieves archived bookmarks",
  ),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async (
  { q, limit, offset, archived }: Schema,
): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // Build API endpoint
    let endpoint = `${LINKDING_URL}/api/bookmarks/`;
    if (archived) {
      endpoint = `${LINKDING_URL}/api/bookmarks/archived/`;
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    // Build final URL
    const url = `${endpoint}${
      params.toString() ? "?" + params.toString() : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${LINKDING_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error fetching bookmarks: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Retrieved bookmark list: ${JSON.stringify(data, null, 2)}`,
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

export const get_bookmarks = {
  name: "get_bookmarks",
  description: "Get list of bookmarks from linkding",
  schema: mcpSchema,
  cb: handler,
};
