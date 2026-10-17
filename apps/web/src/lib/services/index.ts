/**
 * Shared domain layer — single source of truth for dashboard + MCP.
 *
 * Adapters:
 * - `@/lib/actions/hackathons` (Next server actions)
 * - `@/lib/mcp/server` (MCP tools)
 */
export * from "./access";
export * from "./event-ops";
export * from "./hackathons";
