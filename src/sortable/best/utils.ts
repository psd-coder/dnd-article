import { FlatItem, isFlatFolder } from "../types";
import { moveItems } from "../utils/move";
import { Intersection } from "./intersectionDetection";

export function moveItemInFlatList(
  flatItems: FlatItem[],
  intersection: Intersection
) {
  const target = intersection.target;
  const fromIndex = flatItems.findIndex(
    ({ id }) => id === intersection.activeId
  );
  const overIndex = flatItems.findIndex(({ id }) => id === intersection.overId);
  const toIndex =
    intersection.isOverTop || fromIndex === overIndex
      ? overIndex
      : overIndex + 1;
  const toItem = flatItems[overIndex];
  const isTargetCollapsedFolder = isFlatFolder(toItem) && toItem.collapsed;

  if (isTargetCollapsedFolder) {
    flatItems[overIndex] = { ...toItem, collapsed: false };
  }

  return moveItems(
    flatItems,
    fromIndex,
    isTargetCollapsedFolder ? target.overData.childrenCount + toIndex : toIndex,
    target.depth
  );
}
