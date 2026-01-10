import type { CardProps as MantineCardProps, PaperProps, TextProps, TitleProps } from "@mantine/core";
import type { ReactNode } from "react";

import { Card as MantineCard, Group, Stack, Text, Title } from "@mantine/core";
import { forwardRef } from "react";

interface CardProps extends MantineCardProps {
  size?: "default" | "sm";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ size = "default", padding, ...props }, ref) => {
    return (
      <MantineCard
        ref={ref}
        padding={padding ?? (size === "sm" ? "sm" : "md")}
        withBorder
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

interface CardSectionProps extends PaperProps {
  children?: ReactNode;
}

function CardHeader({ children, ...props }: CardSectionProps) {
  return (
    <MantineCard.Section inheritPadding py="sm" {...props}>
      <Stack gap="xs">{children}</Stack>
    </MantineCard.Section>
  );
}

interface CardTitleProps extends Omit<TitleProps, "order" | "size"> {
  children?: ReactNode;
}

function CardTitle({ children, ...props }: CardTitleProps) {
  return (
    <Title order={4} size="sm" fw={500} {...props}>
      {children}
    </Title>
  );
}

interface CardDescriptionProps extends Omit<TextProps, "size" | "c"> {
  children?: ReactNode;
}

function CardDescription({ children, ...props }: CardDescriptionProps) {
  return (
    <Text size="xs" c="dimmed" {...props}>
      {children}
    </Text>
  );
}

function CardAction({ children, ...props }: React.ComponentProps<typeof Group>) {
  return (
    <Group justify="flex-end" {...props}>
      {children}
    </Group>
  );
}

function CardContent({ children, ...props }: CardSectionProps) {
  return (
    <MantineCard.Section inheritPadding {...props}>
      {children}
    </MantineCard.Section>
  );
}

function CardFooter({ children, ...props }: CardSectionProps) {
  return (
    <MantineCard.Section inheritPadding py="sm" withBorder {...props}>
      <Group>{children}</Group>
    </MantineCard.Section>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
