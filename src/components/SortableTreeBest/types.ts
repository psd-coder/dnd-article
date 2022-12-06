import { TreeFile, TreeFolder, TreeId, isFolder, isFile } from "@/data";

interface FlattenedProps {
  parentId: TreeId | null;
  depth: number;
  index: number;
}

export interface FlattenedFolder extends FlattenedProps, TreeFolder {}
export interface FlattenedFile extends FlattenedProps, TreeFile {}
export type FlattenedItem = FlattenedFolder | FlattenedFile;

export function isFlattenedFolder(
  item: FlattenedItem
): item is FlattenedFolder {
  return isFolder(item);
}

export function isFlattenedFile(item: FlattenedItem): item is FlattenedFile {
  return isFile(item);
}
