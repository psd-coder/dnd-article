import { FC, ReactElement } from "react";

import { PanelProps } from "@/components/Panel";

import styles from "./Panels.module.css";

export interface PanelsProps {
  children: ReactElement<PanelProps>[];
}

export const Panels: FC<PanelsProps> = ({ children }) => (
  <div className={styles.container}>{children}</div>
);
