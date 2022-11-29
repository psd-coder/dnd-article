import { TreeFile, TreeFolder, TreeItem } from "./types";

export function isFolder(item: TreeItem): item is TreeFolder {
  return "children" in item;
}

export function isFile(item: TreeItem): item is TreeFile {
  return !isFolder(item);
}
