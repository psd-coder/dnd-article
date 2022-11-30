import { ReactNode } from "react";

import styles from "./Panel.module.css";

export interface PanelProps {
  children: ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ children }) => (
  <div className={styles.panel}>{children}</div>
);
