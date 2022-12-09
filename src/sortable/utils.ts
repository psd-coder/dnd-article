import {
  Tree,
  TreeId,
  TreeItem,
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
// Convertion from Tree -> FlattenedItem[]
// ############################################################
// ############################################################
export function flattenTree(
  tree: Tree,
  parentId: TreeId | null = null,
  depth = 0
): FlattenedItem[] {
  return tree.reduce<FlattenedItem[]>((acc, item) => {
    acc.push({ ...item, parentId, depth });

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
