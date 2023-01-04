import { RefObject } from "react";
import { FlatItem, isFlatFolder } from "../types";
import { moveItems } from "../utils/move";
import { Intersection } from "./intersectionDetection";

export function compensateContainerVerticalOffset(
  containerRef: RefObject<HTMLElement | null>,
  offset: number,
  includePadding = false
) {
  if (!containerRef.current) {
    return offset;
  }
  const computedStyles = window.getComputedStyle(containerRef.current);
  const marginTop = parseInt(computedStyles.marginTop, 10);
  const paddingTop = parseInt(computedStyles.paddingTop, 10);
  const containerYOffset = containerRef.current.getBoundingClientRect().top;
  const scrollPositionY = containerRef.current.scrollTop;

  return (
    offset -
    containerYOffset +
    scrollPositionY +
    marginTop +
    (includePadding ? paddingTop : 0)
  );
}

export function moveItemInFlatList(
  flatItems: FlatItem[],
  intersection: Intersection
) {
  const target = intersection.target;
  const fromIndex = flatItems.findIndex(
    ({ id }) => id === intersection.activeId
  );
  const overIndex = flatItems.findIndex(({ id }) => id === intersection.overId);
  let toIndex =
    intersection.isOverTop || fromIndex === overIndex
      ? overIndex
      : overIndex + 1;
  const toItem = flatItems[overIndex];
  const isTargetCollapsedFolder = isFlatFolder(toItem) && toItem.collapsed;

  if (isTargetCollapsedFolder && intersection.isOverBottom) {
    toIndex = toIndex + 1;
  }

  return moveItems(flatItems, fromIndex, toIndex, target.depth);
}
