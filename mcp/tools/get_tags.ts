import { z } from "npm:zod";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  limit: z.number().optional().describe(
    "Maximum number of results (default 100)",
  ),
  offset: z.number().optional().describe("Starting index for results"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({ limit, offset }: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    // Build final URL
    const url = `${LINKDING_URL}/api/tags/${
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
      throw new Error(`Error fetching tags: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: `Retrieved tag list: ${JSON.stringify(data, null, 2)}`,
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

export const get_tags = {
  name: "get_tags",
  description: "Get list of tags from linkding",
  schema: mcpSchema,
  cb: handler,
};
