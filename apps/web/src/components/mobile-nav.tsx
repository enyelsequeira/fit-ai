import { Link, useRouterState } from "@tanstack/react-router";
import {
  Dumbbell,
  Heart,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: Library },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/recovery", label: "Recovery", icon: Heart },
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    setOpen(false);
    authClient.signOut();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            <span>Fit AI</span>
          </SheetTitle>
        </SheetHeader>

        <SheetBody>
          <nav className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to || currentPath.startsWith(`${link.to}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetBody>

        {session && (
          <SheetFooter className="border-t pt-4">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                {session.user.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name} />
                )}
                <AvatarFallback>
                  {getInitials(session.user.name || session.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{session.user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
