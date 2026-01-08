import type { VariantProps } from "class-variance-authority";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { ComponentProps } from "react";

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    isActive?: boolean;
  };

function PaginationButton({ className, isActive, ...props }: PaginationButtonProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      className={cn(isActive && "border-primary", className)}
      {...props}
    />
  );
}

interface PaginationLinkProps extends ComponentProps<"a"> {
  isActive?: boolean;
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? "outline" : "ghost", size: "icon" }),
        isActive && "border-primary",
        className,
      )}
      {...props}
    />
  );
}

type PaginationPreviousProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    disabled?: boolean;
  };

function PaginationPrevious({ className, disabled, ...props }: PaginationPreviousProps) {
  return (
    <Button
      aria-label="Go to previous page"
      size="default"
      variant="ghost"
      disabled={disabled}
      className={cn("gap-1 pl-2", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
      <span className="hidden sm:block">Previous</span>
    </Button>
  );
}

type PaginationNextProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    disabled?: boolean;
  };

function PaginationNext({ className, disabled, ...props }: PaginationNextProps) {
  return (
    <Button
      aria-label="Go to next page"
      size="default"
      variant="ghost"
      disabled={disabled}
      className={cn("gap-1 pr-2", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon className="size-4" />
    </Button>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-8 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
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
