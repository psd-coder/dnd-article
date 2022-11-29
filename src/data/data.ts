import { nanoid } from "nanoid";
import { Tree, TreeItemType, TreeItem, TreeFolder, TreeFile } from "./types";

const getFolder = (
  name: string,
  children: TreeItem[],
  collapsed: boolean = false
): TreeFolder => ({
  id: nanoid(),
  type: TreeItemType.Folder,
  name,
  collapsed,
  children,
});

const getFile = (name: string): TreeFile => ({
  id: nanoid(),
  type: TreeItemType.File,
  name,
});

const getComponentFiles = (componentName: string) => [
  getFile(`${componentName}.module.css`),
  getFile(`${componentName}.stories.tsx`),
  getFile(`${componentName}.tsx`),
  getFile("index.ts"),
];

const getComponentFolder = (
  componentName: string,
  collapsed: boolean = false
) => getFolder(componentName, getComponentFiles(componentName), collapsed);

export const initialTree: Tree = [
  getFolder("components", [
    getFolder("Library", [
      getComponentFolder("AddLibraryItem"),
      getComponentFolder("LibraryItem"),
      ...getComponentFiles("Library"),
    ]),
    getComponentFolder("Button"),
    getComponentFolder("Icon", true),
  ]),
  getFolder("dependencies", [getFile("utils.ts"), getFile("i18n.ts")], true),
  getFile("app.tsx"),
  getFile("globals.css"),
];
