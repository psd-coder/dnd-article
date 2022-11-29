import { forwardRef, ReactNode, ButtonHTMLAttributes } from "react";

import styles from "./ListItem.module.css";

export type ListItemHtmlProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface ListItemProps extends ListItemHtmlProps {
  startAdornment: ReactNode;
  name: string;
  depth: number;
}

const DepthSpacer: React.FC = () => <span className={styles.depthSpacer} />;

export const ListItem = forwardRef<HTMLButtonElement, ListItemProps>(
  function ListItem({ depth, startAdornment, name, ...restProps }, ref) {
    return (
      <button {...restProps} className={styles.item} ref={ref}>
        {Array.from({ length: depth }, (_, i) => (
          <DepthSpacer key={i} />
        ))}
        <span className={styles.startAdornment}>{startAdornment}</span>
        <span className={styles.label}>{name}</span>
      </button>
    );
  }
);
