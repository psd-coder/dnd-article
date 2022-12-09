import { TreeFile, TreeFolder, TreeId, isFolder, isFile } from "@/data";

interface FlatProps {
  parentId: TreeId | null;
  depth: number;
}

export interface FlatFolder extends FlatProps, TreeFolder {}
export interface FlatFile extends FlatProps, TreeFile {}
export type FlatItem = FlatFolder | FlatFile;

export function isFlatFolder(item: FlatItem): item is FlatFolder {
  return isFolder(item);
}

export function isFlatFile(item: FlatItem): item is FlatFile {
  return isFile(item);
}
