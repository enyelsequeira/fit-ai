import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { Fragment, useMemo } from "react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Route label mappings
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  workouts: "Workouts",
  exercises: "Exercises",
  progress: "Progress",
  ai: "AI",
  recovery: "Recovery",
  new: "New Workout",
  body: "Body",
  photos: "Photos",
  records: "Personal Records",
  analytics: "Analytics",
  generate: "Generate Workout",
  preferences: "Preferences",
  "check-in": "Check In",
  complete: "Complete",
};

interface BreadcrumbsProps {
  /** Custom items to override auto-generated breadcrumbs */
  items?: BreadcrumbItem[];
  /** Additional class names */
  className?: string;
  /** Whether to show home icon */
  showHome?: boolean;
}

export default function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const breadcrumbs = useMemo(() => {
    if (items) {
      return items;
    }

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [];

    let currentPath = "";
    for (const segment of segments) {
      currentPath += `/${segment}`;

      // Check if segment is a dynamic parameter (starts with $)
      const isDynamicSegment = /^\d+$/.test(segment);

      if (isDynamicSegment) {
        // For dynamic segments, show a generic label or ID
        crumbs.push({
          label: `#${segment}`,
          href: currentPath,
        });
      } else {
        const label = routeLabels[segment] || formatSegment(segment);
        crumbs.push({
          label,
          href: currentPath,
        });
      }
    }

    // Remove href from last item (current page)
    if (crumbs.length > 0 && crumbs[crumbs.length - 1]) {
      crumbs[crumbs.length - 1] = {
        ...crumbs[crumbs.length - 1],
        href: undefined,
      };
    }

    return crumbs;
  }, [pathname, items]);

  // Don't render if we're at the root or only have one breadcrumb
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
    >
      {showHome && (
        <>
          <Link to="/" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </>
      )}

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Fragment key={crumb.label + index}>
            {crumb.href && !isLast ? (
              <Link
                to={crumb.href}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn("truncate max-w-[200px]", isLast && "text-foreground font-medium")}
              >
                {crumb.label}
              </span>
            )}

            {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
          </Fragment>
        );
      })}
    </nav>
  );
}

function formatSegment(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper component to render a single breadcrumb item
interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function BreadcrumbLink({ to, children, className }: BreadcrumbLinkProps) {
  return (
    <Link to={to} className={cn("hover:text-foreground transition-colors", className)}>
      {children}
    </Link>
  );
}
