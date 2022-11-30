import clsx from "clsx";
import { ReactComponent as IconArrowDown } from "@/components/Icon/ArrowDown.svg";

import styles from "./FolderIcon.module.css";

export interface FolderIconProps {
  collapsed: boolean;
}

export const FolderIcon: React.FC<FolderIconProps> = ({ collapsed }) => (
  <IconArrowDown
    className={clsx(styles.folderIcon, { [styles.collapsed]: collapsed })}
  />
);
