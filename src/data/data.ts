import { Tree } from "./types";

import {
  buildFile,
  buildFolder,
  buildComponentFiles,
  buildComponentFolder,
} from "./utils";

export const buildInitialTree = (): Tree => [
  buildFolder("components", [
    buildFolder("Library", [
      buildComponentFolder("AddLibraryItem"),
      buildComponentFolder("LibraryItem"),
      ...buildComponentFiles("Library"),
    ]),
    buildComponentFolder("Button"),
    buildComponentFolder("Icon", true),
  ]),
  buildFolder(
    "dependencies",
    [buildFile("utils.ts"), buildFile("i18n.ts")],
    true
  ),
  buildFile("app.tsx"),
  buildFile("globals.css"),
];
