import { Link, useRouterState } from "@tanstack/react-router";
import {
  Dumbbell,
  Heart,
  LayoutDashboard,
  Library,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import MobileNav from "./mobile-nav";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import UserMenu from "./user-menu";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/exercises", label: "Exercises", icon: Library },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/recovery", label: "Recovery", icon: Heart },
] as const;

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-6 flex items-center space-x-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="hidden flex-1 md:flex md:items-center md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  currentPath: string;
}

function NavLink({ to, label, icon: Icon, currentPath }: NavLinkProps) {
  const isActive = currentPath === to || currentPath.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
        "hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export default function Header() {
  const { data: session, isPending } = authClient.useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (isPending) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Dumbbell className="h-6 w-6" />
          <span className="font-bold">Fit AI</span>
        </Link>

        {session ? (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden flex-1 items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} {...link} currentPath={currentPath} />
              ))}
            </nav>

            {/* Quick Actions & User Menu */}
            <div className="ml-auto flex items-center gap-2">
              {/* Quick Add Workout Button */}
              <Link to="/workouts/new" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon-sm" title="Start new workout">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Start new workout</span>
                </Button>
              </Link>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Navigation */}
              <MobileNav />
            </div>
          </>
        ) : (
          /* Unauthenticated State */
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
