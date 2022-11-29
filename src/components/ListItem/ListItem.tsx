import { ReactNode } from "react";

import styles from "./ListItem.module.css";

export interface ListItemProps {
  startAdornment: ReactNode;
  name: string;
  depth: number;
  onClick?: VoidFunction;
}

const DepthSpacer: React.FC = () => <span className={styles.depthSpacer} />;

export const ListItem: React.FC<ListItemProps> = ({
  depth,
  startAdornment,
  name,
  onClick,
}) => {
  return (
    <button className={styles.item} onClick={onClick}>
      {Array.from({ length: depth }, (_, i) => (
        <DepthSpacer key={i} />
      ))}
      <span className={styles.startAdornment}>{startAdornment}</span>
      <span className={styles.label}>{name}</span>
    </button>
  );
};
