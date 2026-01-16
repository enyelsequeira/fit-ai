import type { MouseEventHandler } from "react";
import {
  Card,
  type CardProps,
  type CardSectionProps,
  Stack,
  type TextProps,
  Title,
  type TitleProps,
  Text,
  Group,
} from "@mantine/core";
import type { ReactNode } from "react";

interface FitAiCardProps extends CardProps {
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const FitAiCard = ({ onClick, ...props }: FitAiCardProps) => {
  return <Card py={"md"} px={"sm"} withBorder onClick={onClick} {...props} />;
};

function FitAiCardHeader({ children, ...props }: CardSectionProps & { children?: ReactNode }) {
  return (
    <Card.Section inheritPadding py="sm" {...props}>
      <Stack gap="xs">{children}</Stack>
    </Card.Section>
  );
}

function FitAiCardTitle({ children, ...props }: TitleProps & { children?: ReactNode }) {
  return (
    <Title order={4} size="sm" fw={500} {...props}>
      {children}
    </Title>
  );
}

function FitAiCardDescription({ children, ...props }: TextProps & { children?: ReactNode }) {
  return (
    <Text size="xs" c="dimmed" {...props}>
      {children}
    </Text>
  );
}

function FitAiCardContent({ children, ...props }: CardSectionProps & { children?: ReactNode }) {
  return (
    <Card.Section inheritPadding {...props}>
      {children}
    </Card.Section>
  );
}

function FitAiCardFooter({ children, ...props }: CardSectionProps & { children?: ReactNode }) {
  return (
    <Card.Section inheritPadding py="sm" withBorder {...props}>
      <Group>{children}</Group>
    </Card.Section>
  );
}

export {
  Card,
  FitAiCard,
  FitAiCardHeader,
  FitAiCardFooter,
  FitAiCardTitle,
  FitAiCardDescription,
  FitAiCardContent,
};
