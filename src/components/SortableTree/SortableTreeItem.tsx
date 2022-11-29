import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ListItem, ListItemHtmlProps } from "@/components/ListItem";
import { FolderIcon } from "@/components/FolderIcon";
import { FileIcon } from "@/components/FileIcon";

import { isFlattenedFile, isFlattenedFolder } from "./utils";
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

interface SortableTreeItemProps extends ListItemHtmlProps {
  item: FlattenedItem;
  isOverlay?: boolean;
}

export const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  item,
  isOverlay = false,
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
    <ListItem
      ref={setNodeRef}
      style={style}
      className={clsx({
        [styles.isDragging]: isDragging,
        [styles.isSorting]: isSorting,
        [styles.isOverlay]: isOverlay,
      })}
      startAdornment={renderAdornment(item)}
      name={item.name}
      depth={isOverlay ? 0 : item.depth}
      {...listeners}
      {...props}
    />
  );
};
