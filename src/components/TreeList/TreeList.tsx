import { ReactElement, forwardRef } from "react";
import clsx from "clsx";

import { TreeListItemProps } from "@/components/TreeListItem";

import styles from "./TreeList.module.css";

export interface ListProps {
  className?: string;
  children: ReactElement<TreeListItemProps>[];
}

export const List = forwardRef<HTMLElement, ListProps>(function List(
  { className, children },
  ref
) {
  return (
    <ul className={clsx(styles.container, className)} ref={ref}>
      {children}
    </ul>
  );
});
