import { Link, useRouterState } from "@tanstack/react-router";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { Fragment, useMemo } from "react";

import { Anchor, Box, Flex, Text } from "@mantine/core";

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
  /** Whether to show home icon */
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
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
    <Flex component="nav" aria-label="Breadcrumb" align="center" gap={4} fz="sm" c="dimmed">
      {showHome && (
        <>
          <Anchor
            component={Link}
            to="/"
            c="dimmed"
            underline="never"
            style={{ display: "flex", alignItems: "center", transition: "color 0.2s" }}
          >
            <IconHome size={16} />
            <Box component="span" visually-hidden>
              Home
            </Box>
          </Anchor>
          <IconChevronRight size={16} style={{ opacity: 0.5 }} />
        </>
      )}

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Fragment key={crumb.label + index}>
            {crumb.href && !isLast ? (
              <Anchor
                component={Link}
                to={crumb.href}
                c="dimmed"
                underline="never"
                style={{
                  transition: "color 0.2s",
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {crumb.label}
              </Anchor>
            ) : (
              <Text
                component="span"
                c={isLast ? undefined : "dimmed"}
                fw={isLast ? 500 : undefined}
                style={{
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {crumb.label}
              </Text>
            )}

            {!isLast && <IconChevronRight size={16} style={{ opacity: 0.5, flexShrink: 0 }} />}
          </Fragment>
        );
      })}
    </Flex>
  );
}

function formatSegment(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper component to render a single breadcrumb item
interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
}

export function BreadcrumbLink({ to, children }: BreadcrumbLinkProps) {
  return (
    <Anchor
      component={Link}
      to={to}
      c="dimmed"
      underline="never"
      style={{ transition: "color 0.2s" }}
    >
      {children}
    </Anchor>
  );
}
