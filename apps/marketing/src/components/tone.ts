export type Tone = "white" | "grey" | "mint" | "orange" | "black";

export const toneClass: Record<Tone, string> = {
  white: "bg-white text-ink",
  grey: "bg-grey text-ink",
  mint: "bg-accent text-ink",
  orange: "bg-orange text-ink",
  black: "bg-ink text-white",
};
