"use client";

import { Button, Input, Label, Textarea } from "@hackhost/ui";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";

export function AiHackathonCreator() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [city, setCity] = useState("");
  const [vibe, setVibe] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/hackathon/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            city: city || undefined,
            vibe: vibe || undefined,
            generateCover: true,
            publish: false,
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          urls?: { marketing?: string };
          slug?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "AI create failed");
          return;
        }
        router.push(
          data.urls?.marketing ?? `/e/${data.slug}/manage/page`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI create failed");
      }
    });
  }

  function onIdea(e: ChangeEvent<HTMLTextAreaElement>) {
    setIdea(e.target.value);
  }
  function onCity(e: ChangeEvent<HTMLInputElement>) {
    setCity(e.target.value);
  }
  function onVibe(e: ChangeEvent<HTMLInputElement>) {
    setVibe(e.target.value);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div>
        <h2 className="font-display text-xl font-semibold">
          Create with ChatGPT
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          One idea → full draft: copy, tracks, prizes, schedule, and a cover
          image.
        </p>
      </div>
      <div>
        <Label htmlFor="ai-idea">Idea</Label>
        <Textarea
          id="ai-idea"
          required
          value={idea}
          onChange={onIdea}
          placeholder="48h climate-tech build weekend in Helsinki for students and founders"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ai-city">City</Label>
          <Input
            id="ai-city"
            value={city}
            onChange={onCity}
            placeholder="Helsinki"
          />
        </div>
        <div>
          <Label htmlFor="ai-vibe">Vibe</Label>
          <Input
            id="ai-vibe"
            value={vibe}
            onChange={onVibe}
            placeholder="nordic, high-energy, beginner-friendly"
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending || !idea.trim()}>
        {pending ? "Generating…" : "Generate draft hackathon"}
      </Button>
    </form>
  );
}
