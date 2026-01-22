import type { ReactNode } from "react";

import { createContext, useContext } from "react";
import { Box, Modal, Stack, Text } from "@mantine/core";

import { FitAiButton } from "@/components/ui/fit-ai-button/fit-ai-button";

import styles from "./fit-ai-delete-modal.module.css";

/* =============================================================================
   Context
   ============================================================================= */

type DeleteModalContextValue = {
  onClose: () => void;
  variant: "danger" | "warning";
};

const DeleteModalContext = createContext<DeleteModalContextValue | null>(null);

function useDeleteModalContext() {
  const context = useContext(DeleteModalContext);
  if (!context) {
    throw new Error("FitAiDeleteModal compound components must be used within FitAiDeleteModal");
  }
  return context;
}

/* =============================================================================
   Root Component
   ============================================================================= */

type FitAiDeleteModalProps = {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Color variant for the modal */
  variant?: "danger" | "warning";
  /** Modal content using compound components */
  children: ReactNode;
};

function FitAiDeleteModalRoot({
  opened,
  onClose,
  variant = "danger",
  children,
}: FitAiDeleteModalProps) {
  return (
    <DeleteModalContext.Provider value={{ onClose, variant }}>
      <Modal
        opened={opened}
        onClose={onClose}
        title={null}
        centered
        size="sm"
        withCloseButton={false}
      >
        <Stack gap="md" align="center" ta="center">
          {children}
        </Stack>
      </Modal>
    </DeleteModalContext.Provider>
  );
}

/* =============================================================================
   Icon Sub-component
   ============================================================================= */

type IconProps = {
  /** Icon variant (overrides parent if provided) */
  variant?: "danger" | "warning";
  /** Icon element to display */
  children: ReactNode;
};

function Icon({ variant: variantProp, children }: IconProps) {
  const { variant: contextVariant } = useDeleteModalContext();
  const variant = variantProp ?? contextVariant;

  return (
    <Box className={styles.iconWrapper} mod={{ variant }}>
      {children}
    </Box>
  );
}

/* =============================================================================
   Title Sub-component
   ============================================================================= */

type TitleProps = {
  /** Title text content */
  children: ReactNode;
};

function Title({ children }: TitleProps) {
  return (
    <Text size="lg" fw={600} className={styles.title}>
      {children}
    </Text>
  );
}

/* =============================================================================
   Message Sub-component
   ============================================================================= */

type MessageProps = {
  /** Message content (can include JSX like <strong>) */
  children: ReactNode;
};

function Message({ children }: MessageProps) {
  return (
    <Text size="sm" c="dimmed" className={styles.message}>
      {children}
    </Text>
  );
}

/* =============================================================================
   Actions Sub-component
   ============================================================================= */

type ActionsProps = {
  /** Action buttons (CancelButton and ConfirmButton) */
  children: ReactNode;
};

function Actions({ children }: ActionsProps) {
  return <div className={styles.actions}>{children}</div>;
}

/* =============================================================================
   CancelButton Sub-component
   ============================================================================= */

type CancelButtonProps = {
  /** Button label */
  children: ReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom click handler (defaults to onClose from context) */
  onClick?: () => void;
};

function CancelButton({ children, disabled, onClick }: CancelButtonProps) {
  const { onClose } = useDeleteModalContext();

  return (
    <FitAiButton variant="secondary" onClick={onClick ?? onClose} disabled={disabled}>
      {children}
    </FitAiButton>
  );
}

/* =============================================================================
   ConfirmButton Sub-component
   ============================================================================= */

type ConfirmButtonProps = {
  /** Button label */
  children: ReactNode;
  /** Click handler for confirmation */
  onClick: () => void;
  /** Whether the button shows loading state */
  loading?: boolean;
  /** Optional left section icon */
  leftSection?: ReactNode;
};

function ConfirmButton({ children, onClick, loading, leftSection }: ConfirmButtonProps) {
  return (
    <FitAiButton variant="danger" onClick={onClick} loading={loading} leftSection={leftSection}>
      {children}
    </FitAiButton>
  );
}

/* =============================================================================
   Compound Component Export
   ============================================================================= */

export const FitAiDeleteModal = Object.assign(FitAiDeleteModalRoot, {
  Icon,
  Title,
  Message,
  Actions,
  CancelButton,
  ConfirmButton,
});
