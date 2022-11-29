import { Tree, TreeId } from "../../data/types";
import { isFile, isFolder } from "../../data/utils";
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

export function filterCollapsedItems(state: FlattenedItem[]) {
  const collapsedFolders = state.reduce((acc, item) => {
    if (isFlattenedFolder(item)) {
      if (item.collapsed) {
        acc.push(item.id);
      }

      if (item.parentId && acc.includes(item.parentId)) {
        acc.push(item.id);
      }
    }

    return acc;
  }, [] as TreeId[]);

  return state.filter((item) =>
    item.parentId ? !collapsedFolders.includes(item.parentId) : true
  );
}
