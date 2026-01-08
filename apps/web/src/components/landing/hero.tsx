import { Link } from "@tanstack/react-router";
import { Activity, Dumbbell, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-20 h-72 w-72 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-4 bottom-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-700" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        {/* Floating icons */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
            <Dumbbell className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Sparkles className="h-7 w-7 text-blue-400" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Train Smarter with{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          Fitness Tracking
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
          Track workouts, monitor progress, and get personalized recommendations powered by AI. Your
          intelligent fitness companion that adapts to your goals.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/login" search={{ tab: "signup" }}>
            <Button size="lg" className="gap-2 px-8">
              <Activity className="h-4 w-4" />
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Hero illustration placeholder */}
        <div className="mt-16">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1 shadow-2xl">
            <div className="bg-background/80 rounded-md p-8 backdrop-blur">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 h-24 animate-pulse rounded-md" />
                <div className="bg-muted/50 h-24 animate-pulse rounded-md delay-100" />
                <div className="bg-muted/50 h-24 animate-pulse rounded-md delay-200" />
              </div>
              <div className="bg-muted/30 mt-4 h-32 animate-pulse rounded-md delay-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
