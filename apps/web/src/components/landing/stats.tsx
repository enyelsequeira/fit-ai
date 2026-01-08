import { Dumbbell, Medal, Target } from "lucide-react";

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function Stat({ icon, value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">{icon}</div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}

const stats: StatProps[] = [
  {
    icon: <Dumbbell className="h-6 w-6 text-purple-400" />,
    value: "1,000+",
    label: "Workouts Logged",
  },
  {
    icon: <Medal className="h-6 w-6 text-yellow-400" />,
    value: "500+",
    label: "PRs Achieved",
  },
  {
    icon: <Target className="h-6 w-6 text-blue-400" />,
    value: "50+",
    label: "Exercises",
  },
];

export function Stats() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 p-8 md:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Trusted by fitness enthusiasts
            </h2>
            <p className="text-muted-foreground mt-2">
              Join the community of athletes tracking their progress
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
