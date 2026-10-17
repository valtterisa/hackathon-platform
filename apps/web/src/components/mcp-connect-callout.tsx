export function McpConnectCallout() {
  const resource =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="font-display text-xl font-semibold">Create via MCP</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Any MCP client (Cursor, Claude, ChatGPT apps, custom agents) can create
        hackathons, upload cover images, and publish — after OAuth consent.
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
        <li>
          Point the client at{" "}
          <code className="text-xs text-[var(--foreground)]">
            {resource}/api/mcp
          </code>
        </li>
        <li>Sign in and approve the <code className="text-xs">hackhost</code> scope</li>
        <li>
          Call <code className="text-xs">upload_image</code> then{" "}
          <code className="text-xs">create_hackathon</code>
        </li>
      </ol>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        Details in <code className="text-[var(--foreground)]">docs/MCP.md</code>
        .
      </p>
    </aside>
  );
}
