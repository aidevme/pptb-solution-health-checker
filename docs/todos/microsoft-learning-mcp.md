# Microsoft Learn MCP Server — Comprehensive Reference

> **Sources:** [Overview](https://learn.microsoft.com/en-us/training/support/mcp) · [Get Started](https://learn.microsoft.com/en-us/training/support/mcp-get-started) · [Developer Reference](https://learn.microsoft.com/en-us/training/support/mcp-developer-reference) · [Best Practices](https://learn.microsoft.com/en-us/training/support/mcp-best-practices)  
> **Last updated:** 2026-06-23

---

## Table of Contents

1. [What is the Microsoft Learn MCP Server?](#1-what-is-the-microsoft-learn-mcp-server)
2. [Use Cases](#2-use-cases)
3. [How It Works](#3-how-it-works)
4. [Requirements & Availability](#4-requirements--availability)
5. [Limitations](#5-limitations)
6. [Getting Started in VS Code](#6-getting-started-in-vs-code)
7. [Install via Plugin (Claude Code & Copilot CLI)](#7-install-via-plugin-claude-code--copilot-cli)
8. [Developer Reference](#8-developer-reference)
9. [Best Practices](#9-best-practices)
10. [Further Resources](#10-further-resources)

---

## 1. What is the Microsoft Learn MCP Server?

The **Microsoft Learn Model Context Protocol (MCP) Server** enables AI clients — such as GitHub Copilot, Copilot Studio agents, Azure AI Foundry agents, and any MCP-compatible agentic IDE — to retrieve trusted, up-to-date content directly from Microsoft's official documentation at query time.

It is a **remote MCP server** that uses **Streamable HTTP** and exposes three tools that an agent can invoke to search or fetch Learn content without needing the content baked into the model's training data.

MCP is an open protocol, so any MCP-compatible client can connect — not just VS Code or GitHub Copilot.

---

## 2. Use Cases

| Scenario | Description |
|---|---|
| Agentic IDEs | Enhance VS Code, Visual Studio, JetBrains, and similar editors with live Learn content |
| Copilot Studio / Foundry agents | Ground custom agents with authoritative Microsoft documentation |
| Developer flow | Enable engineers and support staff to query Learn content inline, without leaving their tools |
| Learner assistance | Surface accurate, up-to-date answers to technology questions during learning workflows |

---

## 3. How It Works

The Learn MCP Server sits in front of the same **knowledge service** that powers *Ask Learn* and *Copilot for Azure*. That knowledge service uses retrieval-augmented generation (RAG) over Microsoft's full public documentation corpus.

### Endpoint

```
https://learn.microsoft.com/api/mcp
```

> **Note:** This endpoint is designed for programmatic access by MCP clients via Streamable HTTP. Accessing it directly from a browser returns `405 Method Not Allowed`.

### Protocol flow

1. The MCP client (e.g. VS Code + GitHub Copilot) connects to the endpoint.
2. The client calls `tools/list` to discover the current set of available tools and their schemas.
3. The agent selects the appropriate tool based on the user's question and the tool descriptions.
4. The agent calls the tool, passing query parameters determined by the model.
5. The server queries the knowledge service and returns results.
6. The agent incorporates the response into its answer.

### Available tools

| Tool | Purpose |
|---|---|
| `microsoft_docs_search` | Full-text search across Microsoft Learn documentation |
| `microsoft_docs_fetch` | Fetch a complete article by URL |
| `microsoft_code_sample_search` | Search for official code samples and snippets |

> Tool names, schemas, and availability are **dynamic**. Always call `tools/list` at runtime — do not hardcode tool names or parameter schemas.

### Content freshness

- The knowledge service performs **incremental refresh** as content updates.
- A **full refresh** runs once per day.
- The server does not contain training content or user profile data — only publicly available documentation.

---

## 4. Requirements & Availability

| Item | Detail |
|---|---|
| Authentication | None required — the MCP server is publicly accessible |
| Cost | Free — no charge to use |
| Availability | Publicly available |
| Terms of use | By using the server you agree to [Microsoft Learn Terms of Use](https://learn.microsoft.com/en-us/legal/termsofuse) |
| Client prerequisites (VS Code) | [Visual Studio Code](https://code.visualstudio.com/docs/setup/setup-overview) + [GitHub Copilot](https://code.visualstudio.com/docs/copilot/setup) |

---

## 5. Limitations

- Contains only **publicly available** documentation — no training content, user profiles, or private tenants.
- Content freshness depends on the knowledge service refresh cycle (incremental + once-daily full refresh).
- The endpoint is **not a traditional API** — do not call it directly from application code; use an agent framework.
- Tool names, schemas, and request/response formats may change without notice — always discover at runtime.

---

## 6. Getting Started in VS Code

### High-level process

1. Configure your editor
2. Use the MCP server in agent mode
3. (Recommended) Set custom instructions

### Step 1 — Configure the editor

MCP servers can be configured at the **user level** (applies to every VS Code session) or at the **workspace level** (scoped to a single project).

**Recommended JSON config** (add to VS Code `settings.json` or `.vscode/mcp.json`):

```json
{
  "microsoft.docs.mcp": {
    "type": "http",
    "url": "https://learn.microsoft.com/api/mcp"
  }
}
```

For the latest one-click installation buttons and workspace-level setup instructions, see the [official GitHub repository](https://aka.ms/learnmcpdocs/repo).

### Step 2 — Use the MCP server

1. Open the **Chat** panel in VS Code.
2. Switch to **Agent mode**.
3. Ask a question related to Microsoft Learn content, for example:
   ```
   How do I create a Microsoft Foundry instance using the az CLI?
   ```
4. When prompted, **allow** the agent to use the MCP server.
5. Review the grounded response.

### Step 3 — Set instructions (recommended)

If the agent does not use the MCP tools when expected, add explicit instructions to guide it.

1. Open a Chat window with GitHub Copilot in VS Code.
2. Select **Agent mode**.
3. Click the **settings wheel** at the top of the window → **Instructions**.
4. Choose a location for the instructions file.
5. Add the following content:

```markdown
---
applyTo: '**'
---
## Querying Microsoft Documentation

You have access to MCP tools called `microsoft_docs_search`, `microsoft_docs_fetch`,
and `microsoft_code_sample_search`. These tools allow you to search through and fetch
Microsoft's latest official documentation and code samples. That information may be
more detailed or newer than what is in your training data.

When handling questions about native Microsoft technologies — such as C#, F#,
ASP.NET Core, Microsoft.Extensions, NuGet, Entity Framework, or the `dotnet` runtime
— use these tools for research when dealing with specific or narrowly defined questions.
```

---

## 7. Install via Plugin (Claude Code & Copilot CLI)

The `microsoft-docs` plugin bundles the Learn MCP server together with three **agent skills** that help the AI agent invoke the MCP tools more effectively:

| Skill | Purpose |
|---|---|
| `microsoft-docs` | Concepts, tutorials, and factual documentation lookups |
| `microsoft-code-reference` | API lookups, code samples, and troubleshooting |
| `microsoft-skill-creator` | Meta-skill for generating custom skills about Microsoft technologies |

### Claude Code

Run these commands inside Claude Code, then restart:

```shell
/plugin marketplace add microsoftdocs/mcp
/plugin install microsoft-docs@microsoft-docs-marketplace
```

### GitHub Copilot CLI

```shell
/plugin install microsoftdocs/mcp
```

For full skill documentation see the [Learn MCP Server repository](https://aka.ms/learnmcpdocs/repo).

---

## 8. Developer Reference

### Endpoint

```
https://learn.microsoft.com/api/mcp
```

### Standard JSON configuration

```json
{
  "microsoft.docs.mcp": {
    "type": "http",
    "url": "https://learn.microsoft.com/api/mcp"
  }
}
```

### Recommended integration approach

Use an agent framework such as **Semantic Kernel** or **LangChain** to communicate with the MCP server — do **not** call the endpoint directly from application code.

### Tool discovery

Every time a client initialises the server it **must** call `tools/list` to get the current tool list. The list and tool schemas may change over time; they are deliberately undocumented in detail to allow the server to evolve.

```
// Pseudo-code for correct tool discovery
const tools = await mcpClient.listTools();   // always call at startup
const result = await mcpClient.callTool(selectedTool, params);
```

### Error handling

| HTTP status | Meaning | Action |
|---|---|---|
| `400 Bad Request` | Stale tool schema or malformed request | Refresh via `tools/list` and retry |
| `404 Not Found` | Tool name no longer exists | Refresh via `tools/list` and update mapping |
| `405 Method Not Allowed` | Browser/direct HTTP access to the endpoint | Use an MCP client instead |

### Token budget control

Append `maxTokenBudget` to the endpoint URL to cap the token count in search results:

```
https://learn.microsoft.com/api/mcp?maxTokenBudget=2000
```

| Consideration | Guidance |
|---|---|
| Agentic loops (many calls per turn) | Use a **lower** budget (e.g. 1000–2000) |
| Single rich responses | Use a **higher** budget |
| Fetch vs. search | `maxTokenBudget` only affects **search** results; `microsoft_docs_fetch` always returns the full article |

---

## 9. Best Practices

### Dynamic tool discovery — never hardcode

```
✅ DO:   Call tools/list at runtime on every connection
✅ DO:   Let the model route calls based on tool descriptions
✅ DO:   Retry after refreshing tools/list on 400 or 404 errors

❌ DON'T: Hardcode tool names in application code
❌ DON'T: Hardcode parameter schemas or expected response shapes
❌ DON'T: Treat the MCP server like a traditional versioned REST API
```

### Token budget management

- Set `maxTokenBudget` when the agent runs in agentic loops to protect context window and control cost.
- Omit it (or set it high) when you need the richest possible single response.
- Remember: the budget cap applies only to **search tools**, not to the fetch tool.

### Instruction tuning

When the agent does not invoke the MCP tools spontaneously:

1. Add explicit instructions in a system prompt or instructions file (see [Step 3 in Getting Started](#step-3--set-instructions-recommended)).
2. Name the tools explicitly in the instructions so the model knows they exist.
3. Describe when to use them — e.g. "use these tools for specific Microsoft technology questions".

### Stay resilient to server changes

The Learn MCP Server is evolving. To build a durable integration:

- Subscribe to the [Learn MCP Server Release Notes](https://learn.microsoft.com/en-us/training/support/mcp-release-notes) for change announcements.
- Implement the `tools/list` → retry pattern for `400`/`404` responses (see [Error handling](#error-handling)).
- Avoid coupling your integration to specific tool parameter names that are not part of a published contract.

### Provide feedback

If the MCP server returns unexpected results or does not invoke correctly:

- Use the feedback mechanisms in the [Learn MCP Server repository](https://aka.ms/learnmcpdocs/repo).
- Report issues so Microsoft can improve the knowledge service and tooling.

---

## 10. Further Resources

| Resource | URL |
|---|---|
| Learn MCP Server overview | https://learn.microsoft.com/en-us/training/support/mcp |
| Get started (VS Code) | https://learn.microsoft.com/en-us/training/support/mcp-get-started |
| Get started (Azure AI Foundry) | https://learn.microsoft.com/en-us/training/support/mcp-get-started-foundry |
| Developer reference | https://learn.microsoft.com/en-us/training/support/mcp-developer-reference |
| Best practices | https://learn.microsoft.com/en-us/training/support/mcp-best-practices |
| Release notes | https://learn.microsoft.com/en-us/training/support/mcp-release-notes |
| FAQ | https://learn.microsoft.com/en-us/training/support/mcp-faq |
| GitHub repository | https://aka.ms/learnmcpdocs/repo |
| MCP Inspector tool | https://modelcontextprotocol.io/docs/tools/inspector |
| MCP protocol spec | https://modelcontextprotocol.io |
| Microsoft Learn Terms of Use | https://learn.microsoft.com/en-us/legal/termsofuse |
| Knowledge service blog post | https://devblogs.microsoft.com/engineering-at-microsoft/how-we-built-ask-learn-the-rag-based-knowledge-service/ |
