import { arrayMove } from "@dnd-kit/sortable";
import {
  Tree,
  TreeId,
  TreeItem,
  isFile,
  isFolder,
  buildFolder,
  buildFile,
} from "@/data";

import { FlattenedItem, isFlattenedFolder } from "./types";

export function updateTreeItem(
  tree: Tree,
  id: TreeId,
  setter: (item: TreeItem) => TreeItem
) {
  return tree.map((item) => {
    let mappedItem = item;

    if (item.id === id) {
      mappedItem = setter(item);
    }

    if (isFolder(mappedItem)) {
      mappedItem.children = updateTreeItem(mappedItem.children, id, setter);
    }

    return mappedItem;
  });
}

// ############################################################
// ############################################################
// Dragging projection utils
// ############################################################
// ############################################################
function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem?: FlattenedItem }) {
  if (!previousItem) {
    return 0;
  }

  if (isFlattenedFolder(previousItem)) {
    return previousItem.depth + 1;
  }

  return previousItem.depth;
}

function getMinDepth({ nextItem }: { nextItem?: FlattenedItem }) {
  if (!nextItem) {
    return 0;
  }

  return nextItem.depth;
}

const DEPTH_INDENTATION = 12;
function getProjectedDepth({
  activeItem,
  dragOffset,
  previousItem,
  nextItem,
}: {
  activeItem: FlattenedItem;
  dragOffset: number;
  previousItem?: FlattenedItem;
  nextItem?: FlattenedItem;
}) {
  const minDepth = getMinDepth({ nextItem });
  const maxDepth = getMaxDepth({ previousItem });
  const dragDepth = getDragDepth(dragOffset, DEPTH_INDENTATION);
  const projectedDepth = activeItem.depth + dragDepth;

  let finalDepth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    finalDepth = maxDepth;
  } else if (projectedDepth < minDepth) {
    finalDepth = minDepth;
  }

  return finalDepth;
}

export function getProjection({
  items,
  activeId,
  overId,
  dragOffset,
}: {
  items: FlattenedItem[];
  activeId: TreeId | null;
  overId: TreeId | null;
  dragOffset: number;
}) {
  if (!activeId || !overId) {
    return null;
  }

  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const sortedItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = sortedItems[overItemIndex - 1];
  const nextItem = sortedItems[overItemIndex + 1];
  const depth = getProjectedDepth({
    activeItem,
    nextItem,
    previousItem,
    dragOffset,
  });
  const parentId = (() => {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    // Find the closest element with the same depth
    for (let i = overItemIndex - 1; i >= 0; i--) {
      if (sortedItems[i].depth === depth) {
        return sortedItems[i].parentId;
      }
    }

    return null;
  })();

  return { depth, parentId };
}

// ############################################################
// ############################################################
// Convertion from Tree -> FlattenedItem[]
// ############################################################
// ############################################################
export function flattenTree(
  tree: Tree,
  parentId: TreeId | null = null,
  depth = 0
): FlattenedItem[] {
  return tree.reduce<FlattenedItem[]>((acc, item, index) => {
    acc.push({ ...item, parentId, depth, index });

    if (isFolder(item)) {
      acc.push(...flattenTree(item.children, item.id, depth + 1));
    }

    return acc;
  }, []);
}

export function getRenderedFlattenedItems(
  flattenedItems: FlattenedItem[],
  activeId: TreeId | null
) {
  const excludeIds = flattenedItems.reduce<TreeId[]>(
    (acc, item) =>
      isFlattenedFolder(item) && item.collapsed && item.children.length
        ? [...acc, item.id]
        : acc,
    activeId ? [activeId] : []
  );

  return flattenedItems.filter((item) => {
    if (item.parentId && excludeIds.includes(item.parentId)) {
      if (isFlattenedFolder(item) && item.children.length) {
        excludeIds.push(item.id);
      }

      return false;
    }

    return true;
  });
}

// ############################################################
// ############################################################
// Convertion from FlattenedItem[] -> Tree
// ############################################################
// ############################################################
function buildTreeItem(flattenedItem: FlattenedItem): TreeItem {
  if (isFlattenedFolder(flattenedItem)) {
    return buildFolder(
      flattenedItem.name,
      [],
      flattenedItem.collapsed,
      flattenedItem.id
    );
  }

  return buildFile(flattenedItem.name, flattenedItem.id);
}

export function buildTree(flattenedItems: FlattenedItem[]): Tree {
  const result: Tree = [];
  const indexedItems: Record<TreeId, TreeItem> = {};

  for (const item of flattenedItems) {
    if (indexedItems[item.id]) {
      // If it is already handle just skip to next
      continue;
    }

    const treeItem = buildTreeItem(item);

    indexedItems[item.id] = treeItem;

    // If item doesn't have parent then just attach it to the root level
    if (!item.parentId) {
      result.push(treeItem);
    } else {
      // If parent isn't handled yet then we must do it immediately
      if (!indexedItems[item.parentId]) {
        const flattenedFolderItem = flattenedItems.find(
          ({ id }) => id === item.parentId
        );

        if (!flattenedFolderItem) {
          throw new Error("item with parentId must exists");
        }

        indexedItems[flattenedFolderItem.id] =
          buildTreeItem(flattenedFolderItem);
      }

      const parent = indexedItems[item.parentId];

      if (!isFolder(parent)) {
        throw new Error("parent must be folder!");
      }

      parent.children.push(treeItem);
    }
  }

  return result;
}
