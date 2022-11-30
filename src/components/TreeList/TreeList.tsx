import { ReactElement } from "react";
import clsx from "clsx";

import { TreeListItemProps } from "@/components/TreeListItem";

import styles from "./TreeList.module.css";

export interface ListProps {
  className?: string;
  children: ReactElement<TreeListItemProps>[];
}

export const List: React.FC<ListProps> = ({ className, children }) => {
  return <ul className={clsx(styles.container, className)}>{children}</ul>;
};
