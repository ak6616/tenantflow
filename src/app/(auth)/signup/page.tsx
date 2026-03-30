"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signup, ApiError } from "@/lib/api";

type Step = 1 | 2;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      await signup({ companyName, email, password, name });
      setStep(2);
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
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 1 ? <Check size={14} /> : 1}
          </div>
          <span className={`text-sm ${step >= 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            Create Account
          </span>
        </div>
        <div className={`h-px w-8 ${step > 1 ? "bg-primary" : "bg-border"}`} />
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            2
          </div>
          <span className={`text-sm ${step >= 2 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            Done
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Create Your Account"}
            {step === 2 && "You're All Set!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Start your TenantFlow journey"}
            {step === 2 && "Your CRM is ready to go"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-(--radius-md) bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  placeholder="John Doe"
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  placeholder="Acme Corp"
                  className="mt-1"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Work Email</label>
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
                  minLength={8}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check size={32} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Welcome to TenantFlow!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your CRM workspace is ready. Start managing your leads and pipeline.
                </p>
              </div>
              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
