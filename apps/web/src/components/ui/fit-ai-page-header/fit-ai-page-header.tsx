import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { Box, Flex, Select, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./fit-ai-page-header.module.css";
import { FitAiToolTip } from "@/components/ui/fit-ai-tooltip/fit-ai-tool-tip.tsx";

// ============================================================================
// Context
// ============================================================================

type PageHeaderContextValue = {
  /** Reserved for future shared state between sub-components */
};

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

function usePageHeaderContext() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("FitAiPageHeader compound components must be used within FitAiPageHeader");
  }
  return context;
}

// ============================================================================
// Sub-component Types
// ============================================================================

type PageHeaderTitleProps = {
  children: ReactNode;
};

type PageHeaderDescriptionProps = {
  children: ReactNode;
};

type PageHeaderActionsProps = {
  children: ReactNode;
};

type PageHeaderActionProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  onClick: () => void;
  tooltip?: string;
};

type PageHeaderSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type PageHeaderStatsProps = {
  children: ReactNode;
};

type PageHeaderMobileFilterProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  icon?: ReactNode;
};

type PageHeaderSearchRowProps = {
  children: ReactNode;
};

// ============================================================================
// Sub-components
// ============================================================================

function PageHeaderTitle({ children }: PageHeaderTitleProps) {
  usePageHeaderContext();
  return (
    <Title order={2} m={0} className={styles.pageTitle}>
      {children}
    </Title>
  );
}

function PageHeaderDescription({ children }: PageHeaderDescriptionProps) {
  usePageHeaderContext();
  return (
    <Text c="dimmed" size="sm" mt="xs">
      {children}
    </Text>
  );
}

function PageHeaderActions({ children }: PageHeaderActionsProps) {
  usePageHeaderContext();
  return (
    <Flex gap="sm" className={styles.headerActions}>
      {children}
    </Flex>
  );
}

function PageHeaderAction({
  children,
  variant = "primary",
  icon,
  onClick,
  tooltip,
}: PageHeaderActionProps) {
  usePageHeaderContext();

  const button = (
    <FitAiButton
      variant={variant}
      leftSection={icon}
      onClick={onClick}
      className={variant === "primary" ? styles.primaryButton : styles.secondaryButton}
    >
      {children}
    </FitAiButton>
  );

  if (tooltip) {
    return (
      <FitAiToolTip
        toolTipProps={{
          label: tooltip,
        }}
      >
        {button}
      </FitAiToolTip>
    );
  }

  return button;
}

function PageHeaderSearch({ value, onChange, placeholder = "Search..." }: PageHeaderSearchProps) {
  usePageHeaderContext();
  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<IconSearch size={18} />}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      size="md"
      className={styles.searchInput}
    />
  );
}

function PageHeaderStats({ children }: PageHeaderStatsProps) {
  usePageHeaderContext();
  return <>{children}</>;
}

function PageHeaderMobileFilter({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: PageHeaderMobileFilterProps) {
  usePageHeaderContext();
  return (
    <Box hiddenFrom="lg" className={styles.mobileFilter}>
      <Select
        placeholder={placeholder}
        leftSection={icon}
        data={options}
        value={value}
        onChange={onChange}
        size="md"
        comboboxProps={{ withinPortal: true }}
      />
    </Box>
  );
}

function PageHeaderSearchRow({ children }: PageHeaderSearchRowProps) {
  usePageHeaderContext();
  return (
    <Flex
      gap="md"
      align={{ base: "center", lg: "stretch" }}
      direction={{ base: "column", lg: "row" }}
    >
      {children}
    </Flex>
  );
}

// ============================================================================
// Main Component
// ============================================================================

type FitAiPageHeaderProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A compound component for page headers with title, actions, stats, and search.
 *
 * @example
 * ```tsx
 * <FitAiPageHeader>
 *   <FitAiPageHeader.Title>Workouts</FitAiPageHeader.Title>
 *   <FitAiPageHeader.Description>Manage your workout routines</FitAiPageHeader.Description>
 *
 *   <FitAiPageHeader.Actions>
 *     <FitAiPageHeader.Action variant="secondary" icon={<IconFilter />} onClick={handleFilter}>
 *       Filter
 *     </FitAiPageHeader.Action>
 *     <FitAiPageHeader.Action variant="primary" icon={<IconPlus />} onClick={handleCreate}>
 *       New Workout
 *     </FitAiPageHeader.Action>
 *   </FitAiPageHeader.Actions>
 *
 *   <FitAiPageHeader.Stats>
 *     <StatsRow stats={stats} />
 *   </FitAiPageHeader.Stats>
 *
 *   <FitAiPageHeader.SearchRow>
 *     <FitAiPageHeader.MobileFilter
 *       value={period}
 *       onChange={setPeriod}
 *       options={periodOptions}
 *       placeholder="Select period"
 *       icon={<IconCalendar />}
 *     />
 *     <FitAiPageHeader.Search
 *       value={search}
 *       onChange={setSearch}
 *       placeholder="Search workouts..."
 *     />
 *   </FitAiPageHeader.SearchRow>
 * </FitAiPageHeader>
 * ```
 */
function FitAiPageHeaderRoot({ children, className }: FitAiPageHeaderProps) {
  // Separate children into layout slots
  const childArray = Array.isArray(children) ? children : [children];

  let titleSlot: ReactNode = null;
  let descriptionSlot: ReactNode = null;
  let actionsSlot: ReactNode = null;
  let statsSlot: ReactNode = null;
  let searchRowSlot: ReactNode = null;
  const otherChildren: ReactNode[] = [];

  childArray.flat().forEach((child) => {
    if (!child || typeof child !== "object" || !("type" in child)) {
      otherChildren.push(child);
      return;
    }

    const childType = child.type;
    if (childType === PageHeaderTitle) {
      titleSlot = child;
    } else if (childType === PageHeaderDescription) {
      descriptionSlot = child;
    } else if (childType === PageHeaderActions) {
      actionsSlot = child;
    } else if (childType === PageHeaderStats) {
      statsSlot = child;
    } else if (childType === PageHeaderSearchRow) {
      searchRowSlot = child;
    } else {
      otherChildren.push(child);
    }
  });

  const contextValue: PageHeaderContextValue = {};

  return (
    <PageHeaderContext.Provider value={contextValue}>
      <Box className={`${styles.header} ${className ?? ""}`}>
        {/* Title and actions row */}
        <Flex justify="space-between" align="flex-start" gap="lg" wrap="wrap" mb="lg">
          <Flex flex={1} direction="column" miw={200}>
            {titleSlot}
            {descriptionSlot}
          </Flex>
          {actionsSlot}
        </Flex>

        {/* Stats row */}
        {statsSlot}

        {/* Search row */}
        {searchRowSlot}

        {/* Any other children */}
        {otherChildren}
      </Box>
    </PageHeaderContext.Provider>
  );
}

// ============================================================================
// Compound Component Assembly
// ============================================================================

export const FitAiPageHeader = Object.assign(FitAiPageHeaderRoot, {
  Title: PageHeaderTitle,
  Description: PageHeaderDescription,
  Actions: PageHeaderActions,
  Action: PageHeaderAction,
  Search: PageHeaderSearch,
  Stats: PageHeaderStats,
  MobileFilter: PageHeaderMobileFilter,
  SearchRow: PageHeaderSearchRow,
});
