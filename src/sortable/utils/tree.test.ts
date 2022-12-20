import { expect, test, describe } from "vitest";

import { tree, flatList } from "./_tests";
import { flattenTree, buildTree } from "./tree";

describe("Tree helpers", () => {
  test("Flatten tree", () => {
    expect(flattenTree(tree)).toStrictEqual(flatList);
  });

  test("Build correct tree from flat list", () => {
    expect(buildTree(flatList)).toStrictEqual(tree);
  });
});
