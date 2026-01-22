import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

const typeConfigs: Record<
  ToastType,
  {
    title: string;
    color: string;
    icon?: React.ReactNode;
    loading?: boolean;
    autoClose?: number | false;
    withCloseButton?: boolean;
  }
> = {
  success: {
    title: "Success",
    color: "green",
    icon: <IconCheck size="1rem" />,
    autoClose: 3000,
    withCloseButton: true,
  },
  error: {
    title: "Error",
    color: "red",
    icon: <IconX size="1rem" />,
    autoClose: false,
    withCloseButton: true,
  },
  info: {
    title: "Info",
    color: "blue",
    icon: <IconInfoCircle size="1rem" />,
    autoClose: 5000,
    withCloseButton: true,
  },
  warning: {
    title: "Warning",
    color: "yellow",
    icon: <IconAlertTriangle size="1rem" />,
    autoClose: false,
    withCloseButton: true,
  },
  loading: {
    title: "Loading",
    color: "blue",
    loading: true,
    autoClose: false,
    withCloseButton: false,
  },
};

export type ShowOptions = {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  autoClose?: number | false;
  withCloseButton?: boolean;
};

export type UpdateOptions = {
  id: string;
  message?: string;
  title?: string;
  type?: ToastType;
  autoClose?: number | false;
  loading?: boolean;
};

export const toast = {
  show: (options: ShowOptions): string => {
    const { id, title, message, type = "info", autoClose, withCloseButton } = options;
    const config = typeConfigs[type];

    return notifications.show({
      id,
      title: title ?? config.title,
      message,
      color: config.color,
      icon: config.icon,
      loading: config.loading,
      autoClose: autoClose ?? config.autoClose,
      withCloseButton: withCloseButton ?? config.withCloseButton,
    });
  },

  success: (message: string, id?: string): string => {
    return notifications.show({
      id,
      ...typeConfigs.success,
      message,
    });
  },

  error: (message: string, id?: string): string => {
    return notifications.show({
      id,
      ...typeConfigs.error,
      message,
    });
  },

  info: (message: string, id?: string): string => {
    return notifications.show({
      id,
      ...typeConfigs.info,
      message,
    });
  },

  warning: (message: string, id?: string): string => {
    return notifications.show({
      id,
      ...typeConfigs.warning,
      message,
    });
  },

  loading: (message: string, id?: string): string => {
    return notifications.show({
      id,
      ...typeConfigs.loading,
      message,
    });
  },

  update: (options: UpdateOptions): void => {
    const { id, message, title, type, autoClose, loading } = options;

    // If type is provided, apply that type's config
    if (type) {
      const config = typeConfigs[type];
      notifications.update({
        id,
        title: title ?? config.title,
        message,
        color: config.color,
        icon: config.icon,
        loading: loading ?? config.loading ?? false,
        autoClose: autoClose ?? config.autoClose,
        withCloseButton: config.withCloseButton,
      });
    } else {
      notifications.update({
        id,
        title,
        message,
        loading,
        autoClose: autoClose ?? 5000,
      });
    }
  },

  dismiss: (id?: string): void => {
    if (id) {
      notifications.hide(id);
    }
  },

  dismissAll: (): void => {
    notifications.clean();
  },
};
