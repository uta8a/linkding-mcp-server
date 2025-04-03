import { z } from "npm:zod";
import type { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  url: z.string().describe("URL to check"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({
  url,
}: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // Encode the URL
    const encodedUrl = encodeURIComponent(url);

    const response = await fetch(
      `${LINKDING_URL}/api/bookmarks/check/?url=${encodedUrl}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${LINKDING_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error checking bookmark: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    // Format the response
    let resultMessage = `URL check result: ${url}\n`;

    if (data.bookmark) {
      resultMessage += "This URL is already bookmarked.\n";
      resultMessage += `Bookmark ID: ${data.bookmark.id}\n`;
      resultMessage += `Title: ${data.bookmark.title}\n`;
    } else {
      resultMessage += "This URL is not bookmarked yet.\n";
    }

    if (data.metadata) {
      resultMessage += "\nMetadata:\n";
      resultMessage += `Title: ${data.metadata.title || "None"}\n`;
      resultMessage += `Description: ${data.metadata.description || "None"}\n`;
    }

    if (data.auto_tags && data.auto_tags.length > 0) {
      resultMessage += "\nAuto tags: " + data.auto_tags.join(", ") + "\n";
    }

    return {
      content: [
        {
          type: "text",
          text: resultMessage,
        },
        {
          type: "text",
          text: `Detailed result: ${JSON.stringify(data, null, 2)}`,
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

export const check_bookmark = {
  name: "check_bookmark",
  description: "Check if a specific URL is already bookmarked",
  schema: mcpSchema,
  cb: handler,
};
