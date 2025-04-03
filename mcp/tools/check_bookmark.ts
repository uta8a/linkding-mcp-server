import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  url: z.string().describe("チェックするURL"),
};

const schema = z.object(mcpSchema);
export type Schema = z.infer<typeof schema>;

export const handler = async ({
  url,
}: Schema): CallToolResult => {
  try {
    const LINKDING_URL = Deno.env.get("LINKDING_URL");
    const LINKDING_API_KEY = Deno.env.get("LINKDING_API_KEY");

    // URLをエンコードする
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

    // レスポンスの整形
    let resultMessage = `URLのチェック結果: ${url}\n`;

    if (data.bookmark) {
      resultMessage += "このURLは既にブックマークされています。\n";
      resultMessage += `ブックマークID: ${data.bookmark.id}\n`;
      resultMessage += `タイトル: ${data.bookmark.title}\n`;
    } else {
      resultMessage += "このURLはまだブックマークされていません。\n";
    }

    if (data.metadata) {
      resultMessage += "\nメタデータ:\n";
      resultMessage += `タイトル: ${data.metadata.title || "なし"}\n`;
      resultMessage += `説明: ${data.metadata.description || "なし"}\n`;
    }

    if (data.auto_tags && data.auto_tags.length > 0) {
      resultMessage += "\n自動タグ: " + data.auto_tags.join(", ") + "\n";
    }

    return {
      content: [
        {
          type: "text",
          text: resultMessage,
        },
        {
          type: "text",
          text: `詳細結果: ${JSON.stringify(data, null, 2)}`,
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
  description: "指定したURLが既にブックマークされているかを確認する",
  schema: mcpSchema,
  cb: handler,
};
