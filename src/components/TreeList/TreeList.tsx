import { forwardRef, ReactNode } from "react";
import clsx from "clsx";

import styles from "./TreeList.module.css";

export interface ListProps {
  className?: string;
  children: ReactNode[];
}

export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  { className, children },
  ref
) {
  return (
    <ul className={clsx(styles.container, className)} ref={ref}>
      {children}
    </ul>
  );
});
