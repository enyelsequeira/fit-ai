import type { AppRouter } from "@fit-ai/api/routers/index";
import type { RouterClient } from "@orpc/server";

import { env } from "@fit-ai/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      notifications.show({
        message: `Error: ${error.message}`,
      });
    },
  }),
});

const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const getORPCClient = () => {
  return createORPCClient(link) as RouterClient<AppRouter>;
};

export const client: RouterClient<AppRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
