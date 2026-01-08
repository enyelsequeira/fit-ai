import { Link, createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutList } from "@/components/workout/workout-list";

export const Route = createFileRoute("/workouts/")({
  component: WorkoutsIndexRoute,
});

function WorkoutsIndexRoute() {
  const [activeTab, setActiveTab] = useState<string>("all");

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Workouts</h1>
          <p className="text-sm text-muted-foreground">Track and manage your workout sessions</p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button>
                <Plus className="size-4 mr-1" />
                New Workout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link to="/workouts/new" className="flex items-center w-full">
                  <Dumbbell className="size-4 mr-2" />
                  Empty Workout
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  to="/workouts/new"
                  search={{ from: "template" }}
                  className="flex items-center w-full"
                >
                  <Sparkles className="size-4 mr-2" />
                  From Template
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WorkoutList status="all" />
        </TabsContent>

        <TabsContent value="in-progress">
          <WorkoutList status="in-progress" />
        </TabsContent>

        <TabsContent value="completed">
          <WorkoutList status="completed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
