"use client";

import { Button, Field, Form, Input } from "@hackhost/ui";
import { authClient } from "@hackhost/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({
  mode,
  callbackUrl = "/events",
}: {
  mode: "login" | "signup";
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });
  }

  return (
    <Form action={onSubmit} className="w-full">
      {mode === "signup" ? (
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" required placeholder="Ada Lovelace" />
        </Field>
      ) : null}
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        hint={mode === "signup" ? "At least 8 characters." : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </Field>
      {error ? (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" ? (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={google}
        >
          Continue with Google
        </Button>
      ) : null}
      <p className="text-base text-ink">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="font-medium underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </Form>
  );
}
