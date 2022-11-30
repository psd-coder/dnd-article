import { nanoid } from "nanoid";
import { TreeFile, TreeFolder, TreeItem, TreeId, TreeItemType } from "./types";

export function isFolder(item: TreeItem): item is TreeFolder {
  return "children" in item;
}

export function isFile(item: TreeItem): item is TreeFile {
  return !isFolder(item);
}

export const buildFolder = (
  name: string,
  children: TreeItem[] = [],
  collapsed: boolean = false,
  id?: TreeId
): TreeFolder => ({
  id: id ?? nanoid(),
  type: TreeItemType.Folder,
  name,
  collapsed,
  children,
});

export const buildFile = (name: string, id?: TreeId): TreeFile => ({
  id: id ?? nanoid(),
  type: TreeItemType.File,
  name,
});

export const buildComponentFiles = (componentName: string) => [
  buildFile(`${componentName}.module.css`),
  buildFile(`${componentName}.stories.tsx`),
  buildFile(`${componentName}.tsx`),
  buildFile("index.ts"),
];

export const buildComponentFolder = (
  componentName: string,
  collapsed: boolean = false
) => buildFolder(componentName, buildComponentFiles(componentName), collapsed);
