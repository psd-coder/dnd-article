import { expect, test, describe } from "vitest";

import { buildFolder, buildFile, TreeItem, TreeId } from "@/data";
import { flattenTree, buildTree } from "./utils";

const files = Array.from({ length: 8 }, (_, i) =>
  buildFile(`File ${i + 1}`, `file-${i + 1}`)
);
const folders = [
  buildFolder("Folder 1", [], false, "folder-1"),
  buildFolder("Folder 2", [], true, "folder-2"),
  buildFolder("Folder 3", [], true, "folder-3"),
];

folders[2].children.push(files[4], files[5]);
folders[1].children.push(files[0], files[1]);
folders[0].children.push(folders[1], files[2], files[3]);

const tree = [folders[0], folders[2], files[6], files[7]];
const getFlatItem = (
  item: TreeItem,
  parentId: TreeId | null,
  depth: number
) => ({ ...item, parentId, depth });

const flattenList = [
  getFlatItem(folders[0], null, 0),
  getFlatItem(folders[1], folders[0].id, 1),
  getFlatItem(files[0], folders[1].id, 2),
  getFlatItem(files[1], folders[1].id, 2),
  getFlatItem(files[2], folders[0].id, 1),
  getFlatItem(files[3], folders[0].id, 1),
  getFlatItem(folders[2], null, 0),
  getFlatItem(files[4], folders[2].id, 1),
  getFlatItem(files[5], folders[2].id, 1),
  getFlatItem(files[6], null, 0),
  getFlatItem(files[7], null, 0),
];

describe("Utils", () => {
  test("Flatten tree", () => {
    expect(flattenTree(tree)).toStrictEqual(flattenList);
  });

  test("Build correct tree from flat list", () => {
    expect(buildTree(flattenList)).toStrictEqual(tree);
  });
});
