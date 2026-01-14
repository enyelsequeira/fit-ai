/**
 * Notification utility functions
 * Provides standardized notification patterns across the application
 */

import { notifications } from "@mantine/notifications";

type NotificationType = "success" | "error" | "warning" | "info";

const colorMap: Record<NotificationType, string> = {
  success: "green",
  error: "red",
  warning: "yellow",
  info: "blue",
};

/**
 * Show a standardized goal notification
 */
export function showGoalNotification(type: NotificationType, title: string, message: string): void {
  notifications.show({
    title,
    message,
    color: colorMap[type],
  });
}

/**
 * Show a success notification
 */
export function showSuccessNotification(title: string, message: string): void {
  showGoalNotification("success", title, message);
}

/**
 * Show an error notification
 */
export function showErrorNotification(title: string, message: string): void {
  showGoalNotification("error", title, message);
}

/**
 * Show a warning notification
 */
export function showWarningNotification(title: string, message: string): void {
  showGoalNotification("warning", title, message);
}

/**
 * Show an info notification
 */
export function showInfoNotification(title: string, message: string): void {
  showGoalNotification("info", title, message);
}
