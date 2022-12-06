import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TreeListItem, TreeListItemHtmlProps } from "@/components/TreeListItem";
import { FolderIcon } from "@/components/FolderIcon";
import { FileIcon } from "@/components/FileIcon";

import { isFlattenedFile, isFlattenedFolder } from "./types";
import { FlattenedItem } from "./types";
import styles from "./SortableTreeItem.module.css";
import { Intersection } from "./collissionIntersection";

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
  const {
    isDragging,
    isSorting,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
    data: {
      depth: item.depth,
      isFile: isFlattenedFile(item),
      isFolder: isFlattenedFolder(item),
      isCollapsed: isFlattenedFolder(item) && item.collapsed,
    },
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    // transform: CSS.Translate.toString(transform),
    // transition,
  };

  return (
    <TreeListItem
      ref={setNodeRef}
      style={style}
      className={clsx(className, {
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
        [styles.isOver]: overlayIntersection?.isOver,
        [styles.isOverBefore]: overlayIntersection?.isBefore,
        [styles.isOverAfter]: overlayIntersection?.isAfter,
      })}
      classNameLabel={clsx({ [styles.isDragging]: isDragging })}
      classNameSpacer={clsx({ [styles.overlaySpacer]: isOverlay })}
      // asIndicator={isDragging && withDropIndicator}
      asIndicator={false}
      startAdornment={renderAdornment(item)}
      name={item.name}
      depth={item.depth}
      {...listeners}
      {...props}
    />
  );
};
