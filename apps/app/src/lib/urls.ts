/** Marketing site origin (landing, legal). */
export function marketingUrl(path = "/"): string {
  const base = (
    process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
