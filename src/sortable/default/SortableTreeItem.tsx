import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { TreeListItem, TreeListItemHtmlProps } from "@/components/TreeListItem";
import { FolderIcon } from "@/components/FolderIcon";
import { FileIcon } from "@/components/FileIcon";

import { FlatItem, isFlatFile, isFlatFolder } from "../types";
import styles from "./SortableTreeItem.module.css";

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

const renderAdornment = (item: FlatItem): ReactNode => {
  if (isFlatFolder(item)) {
    return <FolderIcon collapsed={item.collapsed} />;
  }

  if (isFlatFile(item)) {
    return <FileIcon filename={item.name} />;
  }

  return null;
};

interface SortableTreeItemProps extends TreeListItemHtmlProps {
  item: FlatItem;
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
  };

  return (
    <TreeListItem
      ref={setNodeRef}
      style={style}
      className={clsx({
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
      })}
      classNameLabel={clsx({ [styles.isDragging]: isDragging })}
      asIndicator={isDragging && withDropIndicator}
      startAdornment={renderAdornment(item)}
      name={item.name}
      depth={isOverlay ? 0 : item.depth}
      {...listeners}
      {...props}
    />
  );
};
