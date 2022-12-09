import {
  Tree,
  TreeId,
  TreeItem,
  isFolder,
  buildFolder,
  buildFile,
} from "@/data";

import { FlatItem, isFlatFolder } from "./types";

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
// Convertion from Tree -> FlatItem[]
// ############################################################
// ############################################################
export function flattenTree(
  tree: Tree,
  parentId: TreeId | null = null,
  depth = 0
): FlatItem[] {
  return tree.reduce<FlatItem[]>((acc, item) => {
    acc.push({ ...item, parentId, depth });

    if (isFolder(item)) {
      acc.push(...flattenTree(item.children, item.id, depth + 1));
    }

    return acc;
  }, []);
}

export function getRenderedFlatItems(
  flatItems: FlatItem[],
  activeId: TreeId | null
) {
  const excludeIds = flatItems.reduce<TreeId[]>(
    (acc, item) =>
      isFlatFolder(item) && item.collapsed && item.children.length
        ? [...acc, item.id]
        : acc,
    activeId ? [activeId] : []
  );

  return flatItems.filter((item) => {
    if (item.parentId && excludeIds.includes(item.parentId)) {
      if (isFlatFolder(item) && item.children.length) {
        excludeIds.push(item.id);
      }

      return false;
    }

    return true;
  });
}

// ############################################################
// ############################################################
// Convertion from FlatItem[] -> Tree
// ############################################################
// ############################################################
function buildTreeItem(FlatItem: FlatItem): TreeItem {
  if (isFlatFolder(FlatItem)) {
    return buildFolder(FlatItem.name, [], FlatItem.collapsed, FlatItem.id);
  }

  return buildFile(FlatItem.name, FlatItem.id);
}

export function buildTree(flatItems: FlatItem[]): Tree {
  const result: Tree = [];
  const indexedItems: Record<TreeId, TreeItem> = {};

  for (const item of flatItems) {
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
        const flatFolderItem = flatItems.find(({ id }) => id === item.parentId);

        if (!flatFolderItem) {
          throw new Error("item with parentId must exists");
        }

        indexedItems[flatFolderItem.id] = buildTreeItem(flatFolderItem);
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
