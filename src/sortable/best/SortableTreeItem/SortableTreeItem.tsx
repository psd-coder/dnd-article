import { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";

import { TreeListItem, TreeListItemHtmlProps } from "@/components/TreeListItem";
import { FolderIcon } from "@/components/FolderIcon";
import { FileIcon } from "@/components/FileIcon";

import { FlatItem, isFlatFile, isFlatFolder } from "../../types";
import { Intersection } from "../intersectionDetection";

import styles from "./SortableTreeItem.module.css";

const renderAdornment = (item: FlatItem, isActive: boolean): ReactNode => {
  if (isFlatFolder(item)) {
    return <FolderIcon collapsed={isActive || item.collapsed} />;
  }

  if (isFlatFile(item)) {
    return <FileIcon filename={item.name} />;
  }

  return null;
};

interface SortableTreeItemProps extends TreeListItemHtmlProps {
  item: FlatItem;
  overlayIntersection: Intersection | null;
  isOverlay?: boolean;
  indentationWidth: number;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  className,
  item,
  overlayIntersection,
  isOverlay = false,
  ...props
}) => {
  const { isDragging, isSorting, active, listeners, setNodeRef } = useSortable({
    id: item.id,
    data: {
      depth: item.depth,
      isFile: isFlatFile(item),
      isFolder: isFlatFolder(item),
      isCollapsed: isFlatFolder(item) && item.collapsed,
      parentId: item.parentId,
      childrenCount: isFlatFolder(item) ? item.children.length : 0,
    },
  });

  return (
    <TreeListItem
      ref={setNodeRef}
      className={clsx(className, {
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
        [styles.isOverTop]: overlayIntersection?.isOverTop,
        [styles.isOverMiddle]: overlayIntersection?.isOverMiddle,
        [styles.isOverBottom]: overlayIntersection?.isOverBottom,
      })}
      classNameLabel={clsx({ [styles.isDragging]: isDragging })}
      classNameSpacer={clsx({ [styles.overlaySpacer]: isOverlay })}
      asIndicator={false}
      startAdornment={renderAdornment(
        item,
        isOverlay || item.id === active?.id
      )}
      name={item.name}
      depth={item.depth}
      {...listeners}
      {...props}
    />
  );
};
