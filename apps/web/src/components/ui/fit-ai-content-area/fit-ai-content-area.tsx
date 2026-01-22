import styles from "./fit-ai-content-area.module.css";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
export const FitAiContentArea = ({ children }: Props) => {
  return (
    <div className={styles.contentArea}>
      <div className={styles.templatesContainer}>{children}</div>
    </div>
  );
};
