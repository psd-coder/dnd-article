import { expect, test, describe } from "vitest";

import { flatList } from "./_tests";
import { getNewParentId, moveItems } from "./move";

describe(getNewParentId.name, () => {
  test("Must return null if depth equals 0 or previous item doesn't exists", () => {
    expect(getNewParentId(flatList, 0, 1)).toBeNull();
    expect(getNewParentId(flatList, 1, 0)).toBeNull();
  });

  test("If previous item has the same depth, return its parentId", () => {
    expect(getNewParentId(flatList, 4, 2)).toBe(flatList[1].id);
  });

  test("If previous item is folder return its id", () => {
    expect(getNewParentId(flatList, 2, 2)).toBe(flatList[1].id);
  });

  test("If item is after open folder on the same depth as folder is it should return correct parent id", () => {
    expect(getNewParentId(flatList, 4, 1)).toBe(flatList[0].id);
  });
});

describe(moveItems.name, () => {
  test("Move single item between root folders", () => {
    expect(moveItems(flatList, 9, 6, 0)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[9],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[10],
    ]);
  });

  test("Move single item between folders as nested item of previous folder", () => {
    expect(moveItems(flatList, 9, 6, 1)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      { ...flatList[9], depth: 1, parentId: flatList[0].id },
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[10],
    ]);
  });

  test("Move single item to the start position in the folder", () => {
    expect(moveItems(flatList, 9, 7, 1)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      { ...flatList[9], depth: 1, parentId: flatList[6].id },
      flatList[7],
      flatList[8],
      flatList[10],
    ]);
  });

  test("Shift item to right which is follows some folder", () => {
    expect(moveItems(flatList, 9, 9, 1)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      { ...flatList[9], depth: 1, parentId: flatList[6].id },
      flatList[10],
    ]);
  });

  test("Move single item to the start of the list", () => {
    expect(moveItems(flatList, 2, 0, 0)).toStrictEqual([
      { ...flatList[2], depth: 0, parentId: null },
      flatList[0],
      flatList[1],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move single item to the middle of the folder", () => {
    expect(moveItems(flatList, 9, 8, 1)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      { ...flatList[9], depth: 1, parentId: flatList[6].id },
      flatList[8],
      flatList[10],
    ]);
  });

  test("Move single item to the end of the list", () => {
    expect(moveItems(flatList, 2, 11, 0)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      flatList[10],
      { ...flatList[2], depth: 0, parentId: null },
    ]);
  });

  test("Move folder between root folders", () => {
    expect(moveItems(flatList, 1, 6, 0)).toStrictEqual([
      flatList[0],
      flatList[4],
      flatList[5],
      { ...flatList[1], depth: 0, parentId: null },
      { ...flatList[2], depth: 1 },
      { ...flatList[3], depth: 1 },
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move folder between folders as nested item of previous folder", () => {
    expect(moveItems(flatList, 1, 6, 1)).toStrictEqual([
      flatList[0],
      flatList[4],
      flatList[5],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move folder to the start position in the folder", () => {
    expect(moveItems(flatList, 6, 1, 1)).toStrictEqual([
      flatList[0],
      { ...flatList[6], depth: 1, parentId: flatList[0].id },
      { ...flatList[7], depth: 2 },
      { ...flatList[8], depth: 2 },
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Shift folder to right which is follows some folder", () => {
    expect(moveItems(flatList, 6, 6, 1)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      { ...flatList[6], depth: 1, parentId: flatList[0].id },
      { ...flatList[7], depth: 2 },
      { ...flatList[8], depth: 2 },
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move folder to the start of the list", () => {
    expect(moveItems(flatList, 1, 0, 0)).toStrictEqual([
      { ...flatList[1], depth: 0, parentId: null },
      { ...flatList[2], depth: 1 },
      { ...flatList[3], depth: 1 },
      flatList[0],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move folder to the middle of other folder", () => {
    expect(moveItems(flatList, 1, 8, 1)).toStrictEqual([
      flatList[0],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      { ...flatList[1], depth: 1, parentId: flatList[6].id },
      { ...flatList[2], depth: 2 },
      { ...flatList[3], depth: 2 },
      flatList[8],
      flatList[9],
      flatList[10],
    ]);
  });

  test("Move folder to the end of the list", () => {
    expect(moveItems(flatList, 1, 10, 0)).toStrictEqual([
      flatList[0],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[9],
      { ...flatList[1], depth: 0, parentId: null },
      { ...flatList[2], depth: 1 },
      { ...flatList[3], depth: 1 },
      flatList[10],
    ]);
  });

  test("Move single item to the next position", () => {
    expect(moveItems(flatList, 9, 10, 0)).toStrictEqual([
      flatList[0],
      flatList[1],
      flatList[2],
      flatList[3],
      flatList[4],
      flatList[5],
      flatList[6],
      flatList[7],
      flatList[8],
      flatList[10],
      flatList[9],
    ]);
  });
});
