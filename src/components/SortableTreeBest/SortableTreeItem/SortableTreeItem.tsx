import { ReactNode } from "react";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";

import { TreeListItem, TreeListItemHtmlProps } from "@/components/TreeListItem";
import { FolderIcon } from "@/components/FolderIcon";
import { FileIcon } from "@/components/FileIcon";

import { FlattenedItem, isFlattenedFile, isFlattenedFolder } from "../types";
import { Intersection } from "../intersectionDetection";

import styles from "./SortableTreeItem.module.css";

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

const renderAdornment = (item: FlattenedItem): ReactNode => {
  if (isFlattenedFolder(item)) {
    return <FolderIcon collapsed={item.collapsed} />;
  }

  if (isFlattenedFile(item)) {
    return <FileIcon filename={item.name} />;
  }

  return null;
};

interface SortableTreeItemProps extends TreeListItemHtmlProps {
  item: FlattenedItem;
  overlayIntersection: Intersection | null;
  isOverlay?: boolean;
  withDropIndicator: boolean;
  indentationWidth: number;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  className,
  item,
  overlayIntersection,
  isOverlay = false,
  withDropIndicator,
  ...props
}) => {
  const { isDragging, isSorting, listeners, setNodeRef } = useSortable({
    id: item.id,
    data: {
      depth: item.depth,
      isFile: isFlattenedFile(item),
      isFolder: isFlattenedFolder(item),
      isCollapsed: isFlattenedFolder(item) && item.collapsed,
      parentId: item.parentId,
    },
    animateLayoutChanges,
  });

  return (
    <TreeListItem
      ref={setNodeRef}
      className={clsx(className, {
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
        [styles.isOver]: overlayIntersection?.isOver,
        [styles.isOverBefore]: overlayIntersection?.isBefore,
        [styles.isOverAfter]: overlayIntersection?.isAfter,
      })}
      classNameLabel={clsx({ [styles.isDragging]: isDragging })}
      classNameSpacer={clsx({ [styles.overlaySpacer]: isOverlay })}
      asIndicator={false}
      startAdornment={renderAdornment(item)}
      name={item.id}
      depth={item.depth}
      {...listeners}
      {...props}
    />
  );
};
