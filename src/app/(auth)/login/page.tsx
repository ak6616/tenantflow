"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { login, ApiError } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, tenantSlug);
      router.push(redirect);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mb-2 text-2xl font-bold text-primary">TenantFlow</div>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-(--radius-md) bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Company Slug</label>
            <Input
              type="text"
              placeholder="your-company"
              className="mt-1"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@company.com"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
        <div className="mt-4 rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 px-4 py-3 text-sm">
          <p className="mb-1 font-medium text-muted-foreground">Test credentials</p>
          <p className="text-muted-foreground">Slug: <span className="font-mono">demo-company</span></p>
          <p className="text-muted-foreground">Email: <span className="font-mono">test@tenantflow.app</span></p>
          <p className="text-muted-foreground">Password: <span className="font-mono">Test123!</span></p>
        </div>
      </CardContent>
    </Card>
  );
}
