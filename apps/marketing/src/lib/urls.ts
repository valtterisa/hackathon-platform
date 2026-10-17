/** Product app origin (dashboard, auth, events). */
export function appUrl(path = "/"): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
