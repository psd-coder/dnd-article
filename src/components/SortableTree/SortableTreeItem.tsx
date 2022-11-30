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
  isOverlay?: boolean;
  withDropIndicator: boolean;
  indentationWidth: number;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  item,
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
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeListItem
      ref={setNodeRef}
      style={style}
      className={clsx({
        [styles.isDragging]: isDragging,
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
      })}
      withDepthIndicator={withDropIndicator ? true : !isSorting}
      asIndicator={isDragging && withDropIndicator}
      startAdornment={renderAdornment(item)}
      name={item.name}
      depth={isOverlay ? 0 : item.depth}
      {...listeners}
      {...props}
    />
  );
};