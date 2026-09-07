"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });
      if (res.error) {
        setError(res.error.message || "Failed to create account");
      } else {
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/80 shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="h-10 w-10 mx-auto mb-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20">
            A
          </div>
          <CardTitle className="text-xl font-bold text-zinc-100 flex items-center justify-center gap-1.5">
            Create an Account <Sparkles className="h-4 w-4 text-emerald-400" />
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Start building with your personalized AI platform
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Name</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-xs mt-2"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-zinc-800/80 pt-4">
          <p className="text-xs text-zinc-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-emerald-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
