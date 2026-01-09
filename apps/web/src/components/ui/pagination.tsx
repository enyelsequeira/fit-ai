import type { PaginationProps as MantinePaginationProps } from "@mantine/core";

import { ActionIcon, Group, Pagination as MantinePagination, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconDots } from "@tabler/icons-react";
import { forwardRef } from "react";

import { Button } from "./button";

interface PaginationProps extends MantinePaginationProps {}

function Pagination({ ...props }: PaginationProps) {
  return <MantinePagination {...props} />;
}

function PaginationContent({ children }: { children: React.ReactNode }) {
  return <Group gap="xs">{children}</Group>;
}

function PaginationItem({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface PaginationButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

function PaginationButton({ isActive, onClick, children }: PaginationButtonProps) {
  return (
    <Button variant={isActive ? "outline" : "ghost"} size="icon" onClick={onClick}>
      {children}
    </Button>
  );
}

interface PaginationLinkProps {
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

function PaginationLink({ isActive, onClick, children }: PaginationLinkProps) {
  return (
    <Button variant={isActive ? "outline" : "ghost"} size="icon" onClick={onClick}>
      {children}
    </Button>
  );
}

interface PaginationPreviousProps {
  disabled?: boolean;
  onClick?: () => void;
}

function PaginationPrevious({ disabled, onClick }: PaginationPreviousProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      leftSection={<IconChevronLeft size={16} />}
    >
      <Text size="sm" visibleFrom="sm">
        Previous
      </Text>
    </Button>
  );
}

interface PaginationNextProps {
  disabled?: boolean;
  onClick?: () => void;
}

function PaginationNext({ disabled, onClick }: PaginationNextProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      rightSection={<IconChevronRight size={16} />}
    >
      <Text size="sm" visibleFrom="sm">
        Next
      </Text>
    </Button>
  );
}

function PaginationEllipsis() {
  return (
    <ActionIcon variant="transparent" size="sm" disabled>
      <IconDots size={16} />
    </ActionIcon>
  );
}

export {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
