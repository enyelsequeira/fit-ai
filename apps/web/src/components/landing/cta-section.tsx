import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 p-8 text-center md:p-16">
          {/* Background decorations */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to transform your{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                fitness journey
              </span>
              ?
            </h2>

            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              Start tracking your workouts, monitor your progress, and let AI help you reach your
              goals faster than ever.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login" search={{ tab: "signup" }}>
                <Button size="lg" className="gap-2 px-8">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-muted-foreground text-sm">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
