"use client";

import { Button, Input, Label } from "@hackhost/ui";
import { authClient } from "@hackhost/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({
  mode,
  callbackUrl = "/events",
  loginHref = "/login",
  signupHref = "/signup",
}: {
  mode: "login" | "signup";
  callbackUrl?: string;
  loginHref?: string;
  signupHref?: string;
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
    <form action={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      {mode === "signup" ? (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Ada Lovelace" />
        </div>
      ) : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" ? (
        <Button type="button" variant="outline" className="w-full" onClick={google}>
          Continue with Google
        </Button>
      ) : null}
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href={signupHref} className="text-[var(--primary)] underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={loginHref} className="text-[var(--primary)] underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
