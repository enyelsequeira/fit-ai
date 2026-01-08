import { BarChart3, ClipboardList, Sparkles, Target } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* Step number badge */}
      <div className="bg-background relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-purple-500/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          {icon}
        </div>
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
          {number}
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

const steps: Omit<StepProps, "number">[] = [
  {
    title: "Set Your Goals",
    description: "Define your fitness objectives, preferences, and available equipment.",
    icon: <Target className="h-6 w-6 text-purple-400" />,
  },
  {
    title: "Log Workouts",
    description: "Track your exercises, sets, reps, and weights with our intuitive interface.",
    icon: <ClipboardList className="h-6 w-6 text-blue-400" />,
  },
  {
    title: "Track Progress",
    description: "Monitor your gains with detailed analytics and personal record tracking.",
    icon: <BarChart3 className="h-6 w-6 text-green-400" />,
  },
  {
    title: "Get AI Recommendations",
    description: "Receive personalized workout suggestions based on your performance.",
    icon: <Sparkles className="h-6 w-6 text-orange-400" />,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Get started in minutes and transform your fitness journey with intelligent tracking.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line - visible on larger screens */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Step key={step.title} number={index + 1} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
