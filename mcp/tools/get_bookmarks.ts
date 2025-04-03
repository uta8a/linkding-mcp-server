import { z } from "npm:zod";
import { CallToolResult } from "npm:@modelcontextprotocol/sdk";

// Define input schema
const mcpSchema = {
  q: z.string().optional().describe("検索フレーズ"),
  limit: z.number().optional().describe("結果の最大数（デフォルト100）"),
  offset: z.number().optional().describe("結果の開始インデックス"),
  archived: z.boolean().optional().describe(
    "trueの場合、アーカイブされたブックマークを取得",
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

    // APIエンドポイントを構築
    let endpoint = `${LINKDING_URL}/api/bookmarks/`;
    if (archived) {
      endpoint = `${LINKDING_URL}/api/bookmarks/archived/`;
    }

    // クエリパラメータを構築
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    // 最終的なURLを構築
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
          text: `ブックマーク一覧を取得しました: ${
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

export const get_bookmarks = {
  name: "get_bookmarks",
  description: "リンクディングのブックマーク一覧を取得",
  schema: mcpSchema,
  cb: handler,
};
