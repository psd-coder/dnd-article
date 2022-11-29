import { arrayMove } from "@dnd-kit/sortable";
import { Tree, TreeId, TreeItem, TreeItemType, isFile, isFolder } from "@/data";

import { FlattenedFile, FlattenedFolder, FlattenedItem } from "./types";

function flatten(
  tree: Tree,
  parentId: TreeId | null = null,
  depth = 0
): FlattenedItem[] {
  return tree.reduce<FlattenedItem[]>((acc, item, index) => {
    acc.push({ ...item, parentId, depth, index });

    if (isFolder(item)) {
      acc.push(...flatten(item.children, item.id, depth + 1));
    }

    return acc;
  }, []);
}

export function flattenTree(tree: Tree): FlattenedItem[] {
  return flatten(tree);
}

export function isFlattenedFolder(
  item: FlattenedItem
): item is FlattenedFolder {
  return isFolder(item);
}

export function isFlattenedFile(item: FlattenedItem): item is FlattenedFile {
  return isFile(item);
}

export function filterCollapsedItems(
  items: FlattenedItem[],
  activeId: TreeId | null
) {
  const flattenedTree = flattenTree(items);
  const excludeIds = flattenedTree.reduce<TreeId[]>(
    (acc, item) =>
      isFlattenedFolder(item) && item.collapsed && item.children.length
        ? [...acc, item.id]
        : acc,
    activeId ? [activeId] : []
  );

  return items.filter((item) => {
    if (item.parentId && excludeIds.includes(item.parentId)) {
      if (isFlattenedFolder(item) && item.children.length) {
        excludeIds.push(item.id);
      }

      return false;
    }

    return true;
  });
}

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

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

export function getProjection(
  items: FlattenedItem[],
  activeId: TreeId,
  overId: TreeId,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

export function findItem(items: TreeItem[], itemId: TreeId) {
  return items.find(({ id }) => id === itemId);
}

function getTreeItem(item: FlattenedItem): TreeItem {
  if (isFlattenedFolder(item)) {
    return {
      id: item.id,
      type: TreeItemType.Folder,
      name: item.name,
      collapsed: item.collapsed,
      children: [],
    };
  }

  return {
    id: item.id,
    type: TreeItemType.File,
    name: item.name,
  };
}

export function buildTree(flattenedItems: FlattenedItem[]): Tree {
  const result: Tree = [];
  const nodes: Record<TreeId, TreeItem> = {};

  for (const item of flattenedItems) {
    if (nodes[item.id]) {
      // If it is already handle just skip to next
      continue;
    }

    const treeItem = getTreeItem(item);

    if (item.parentId) {
      if (!nodes[item.parentId]) {
        const flattenedFolderItem = flattenedItems.find(
          ({ id }) => id === item.parentId
        );

        if (!flattenedFolderItem) {
          throw new Error("parentId must exists");
        }

        const parentFolder = getTreeItem(flattenedFolderItem);
        nodes[parentFolder.id] = parentFolder;
      }

      const parent = nodes[item.parentId];

      if (!isFolder(parent)) {
        throw new Error("parent must be folder!");
      }

      parent.children.push(treeItem);
    } else {
      result.push(treeItem);
    }
  }

  return result;
}
