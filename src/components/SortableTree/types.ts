import { TreeFile, TreeFolder, TreeId } from "@/data/types";

interface FlattenedProps {
  parentId: TreeId | null;
  depth: number;
  index: number;
}

export interface FlattenedFolder extends FlattenedProps, TreeFolder {}
export interface FlattenedFile extends FlattenedProps, TreeFile {}
export type FlattenedItem = FlattenedFolder | FlattenedFile;
