import type { ReactNode } from "react";
import { Tooltip, type TooltipProps } from "@mantine/core";
type Props = {
  children: ReactNode;
  toolTipProps: TooltipProps;
};

export const FitAiToolTip = ({ toolTipProps, children }: Props) => {
  return (
    <Tooltip color={"cyan"} {...toolTipProps}>
      {children}
    </Tooltip>
  );
};
