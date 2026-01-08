import type { LucideIcon } from "lucide-react";

import { Battery, Dumbbell, Sparkles, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

function FeatureCard({ icon: Icon, title, description, gradient, iconColor }: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden p-6 transition-all hover:border-white/20">
      {/* Hover gradient effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100",
          gradient,
        )}
      />

      <div className="relative">
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-lg",
            "bg-white/5 transition-colors group-hover:bg-white/10",
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

const features: FeatureCardProps[] = [
  {
    icon: Dumbbell,
    title: "Smart Workout Tracking",
    description:
      "Log exercises, sets, and reps with ease. See your previous performance to beat your records and stay motivated.",
    gradient: "bg-gradient-to-br from-orange-500/5 to-transparent",
    iconColor: "text-orange-400",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Workouts",
    description:
      "Get personalized workout recommendations based on your goals, available equipment, and recovery status.",
    gradient: "bg-gradient-to-br from-purple-500/5 to-transparent",
    iconColor: "text-purple-400",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description:
      "Track your strength gains, body measurements, and PRs with beautiful charts and actionable insights.",
    gradient: "bg-gradient-to-br from-blue-500/5 to-transparent",
    iconColor: "text-blue-400",
  },
  {
    icon: Battery,
    title: "Recovery Tracking",
    description:
      "Daily check-ins help optimize your training by tracking sleep, energy levels, and muscle recovery.",
    gradient: "bg-gradient-to-br from-green-500/5 to-transparent",
    iconColor: "text-green-400",
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              level up
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Powerful features designed to help you train smarter, recover faster, and achieve your
            fitness goals.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
