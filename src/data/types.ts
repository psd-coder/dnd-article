export type TreeId = string;
export enum TreeItemType {
  Folder = "folder",
  File = "file",
}

export interface TreeFolder {
  id: TreeId;
  type: TreeItemType.Folder;
  name: string;
  collapsed: boolean;
  children: TreeItem[];
}

export interface TreeFile {
  id: TreeId;
  type: TreeItemType.File;
  name: string;
}

export type TreeItem = TreeFolder | TreeFile;
export type Tree = TreeItem[];
