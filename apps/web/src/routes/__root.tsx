import type { QueryClient } from "@tanstack/react-query";
import type { orpc } from "@/utils/orpc";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { theme } from "@/lib/theme";

// CSS imports with ?url for SSR - these get added to head via links
import mantineCoreStyles from "@mantine/core/styles.css?url";
import mantineNotificationsStyles from "@mantine/notifications/styles.css?url";
import mantineDatesStyles from "@mantine/dates/styles.css?url";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Fit AI",
      },
    ],

    links: [
      { rel: "stylesheet", href: mantineCoreStyles },
      { rel: "stylesheet", href: mantineNotificationsStyles },
      { rel: "stylesheet", href: mantineDatesStyles },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", margin: 0 }}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications position="top-right" />
          <main style={{ flex: 1 }}>{children}</main>
          <TanStackRouterDevtools position="bottom-left" />
          <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
