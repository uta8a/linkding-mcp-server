# (Unofficial) linkding-mcp-server

MCP server for [linkding](https://linkding.link/), a self-hostable bookmark manager

# setup

```bash
deno task compile
```

A compiled binary will be generated at `./dist/main`.

When configuring the MCP server, use the following:

```json
"mcpServers": {
  "linkding-mcp-tools": {
    "command": "/path/to/linkding-mcp-server/dist/main",
    "env": {
      "LINKDING_URL": "https://your-linkding.example.com",
      "LINKDING_API_KEY": "xxx"
    }
  }
}
```

`LINKDING_API_KEY` is the API key found in the REST API section at `/settings/integrations`.
