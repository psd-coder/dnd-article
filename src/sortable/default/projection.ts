import { arrayMove } from "@dnd-kit/sortable";
import { TreeId } from "@/data";
import { isFlatFolder, FlatItem } from "../types";

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem?: FlatItem }) {
  if (!previousItem) {
    return 0;
  }

  if (isFlatFolder(previousItem)) {
    return previousItem.depth + 1;
  }

  return previousItem.depth;
}

function getMinDepth({ nextItem }: { nextItem?: FlatItem }) {
  if (!nextItem) {
    return 0;
  }

  return nextItem.depth;
}

function calculateProjectedDepth({
  activeItem,
  dragOffset,
  previousItem,
  nextItem,
  indentationWidth,
}: {
  activeItem: FlatItem;
  dragOffset: number;
  previousItem?: FlatItem;
  nextItem?: FlatItem;
  indentationWidth: number;
}) {
  const minDepth = getMinDepth({ nextItem });
  const maxDepth = getMaxDepth({ previousItem });
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  let finalDepth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    finalDepth = maxDepth;
  } else if (projectedDepth < minDepth) {
    finalDepth = minDepth;
  }

  return finalDepth;
}

export function getProjectedDepth({
  items,
  activeId,
  overId,
  dragOffset,
  indentationWidth,
}: {
  items: FlatItem[];
  activeId: TreeId | null;
  overId: TreeId | null;
  dragOffset: number;
  indentationWidth: number;
}): number | null {
  if (!activeId || !overId) {
    return null;
  }

  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const sortedItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = sortedItems[overItemIndex - 1];
  const nextItem = sortedItems[overItemIndex + 1];

  return calculateProjectedDepth({
    activeItem,
    nextItem,
    previousItem,
    dragOffset,
    indentationWidth,
  });
}
