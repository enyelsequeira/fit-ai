import type { RouterClient } from "@orpc/server";

import z from "zod";

import { protectedProcedure, publicProcedure } from "../index";
import { aiRouter } from "./ai";
import { analyticsRouter } from "./analytics";
import { authRouter } from "./auth/index";
import { bodyMeasurementRouter } from "./body-measurement";
import { exerciseRouter } from "./exercise/index";
import { goalsRouter } from "./goals/index";
import { historyRouter } from "./history";
import { personalRecordRouter } from "./personal-record/index";
import { progressPhotoRouter } from "./progress-photo/index";
import { recoveryRouter } from "./recovery/index";
import { settingsRouter } from "./settings/index";
import { templateRouter } from "./template/index";
import { todoRouter } from "./todo/index";
import { workoutRouter } from "./workout/index";

export const appRouter = {
  healthCheck: publicProcedure
    .route({
      method: "GET",
      path: "/health",
      summary: "Health check",
      description: "Returns OK if the server is running",
      tags: ["System"],
    })
    .output(z.string())
    .handler(() => {
      return "OK";
    }),
  privateData: protectedProcedure
    .route({
      method: "GET",
      path: "/me",
      summary: "Get current user",
      description: "Returns the current authenticated user information",
      tags: ["Auth"],
    })
    .output(
      z.object({
        message: z.string(),
        user: z
          .object({
            id: z.string(),
            email: z.string(),
            name: z.string().nullable(),
          })
          .optional(),
      }),
    )
    .handler(({ context }) => {
      return {
        message: "This is private",
        user: context.session?.user,
      };
    }),
  todo: todoRouter,
  exercise: exerciseRouter,
  template: templateRouter,
  workout: workoutRouter,
  progressPhoto: progressPhotoRouter,
  bodyMeasurement: bodyMeasurementRouter,
  history: historyRouter,
  personalRecord: personalRecordRouter,
  recovery: recoveryRouter,
  analytics: analyticsRouter,
  auth: authRouter,
  ai: aiRouter,
  settings: settingsRouter,
  goals: goalsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
