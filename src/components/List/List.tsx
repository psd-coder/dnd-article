import { ReactElement } from "react";
import clsx from "clsx";

import { ListItemProps } from "@/components/ListItem";

import styles from "./List.module.css";

export interface ListProps {
  className?: string;
  children: ReactElement<ListItemProps>[];
}

export const List: React.FC<ListProps> = ({ className, children }) => {
  return <div className={clsx(styles.container, className)}>{children}</div>;
};
