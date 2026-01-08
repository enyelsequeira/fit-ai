import { ClipboardCheck, Dumbbell, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>
        <Dumbbell className="mr-2 h-4 w-4" />
        Start Workout
      </Button>
      <Button variant="outline">
        <ClipboardCheck className="mr-2 h-4 w-4" />
        Log Check-in
      </Button>
      <Button variant="outline">
        <Trophy className="mr-2 h-4 w-4" />
        View PRs
      </Button>
    </div>
  );
}
