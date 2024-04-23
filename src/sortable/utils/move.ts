import { FlatItem, isFlatFolder } from "../types";

export function getNewParentId(
  movedItems: FlatItem[],
  index: number,
  depth: number
) {
  const previousItem = movedItems[index - 1];

  if (!previousItem) {
    return null;
  }

  if (depth === previousItem.depth) {
    return previousItem.parentId;
  }

  if (depth > previousItem.depth) {
    return previousItem.id;
  }

  // Find the closest element with the same depth
  for (let i = index - 1; i >= 0; i--) {
    if (movedItems[i].depth === depth) {
      return movedItems[i].parentId;
    }
  }

  return null;
}

export function moveItems(
  flatItems: FlatItem[],
  from: number,
  to: number,
  projectedDepth: number
): FlatItem[] {
  const clonedItems: FlatItem[] = structuredClone(flatItems);
  const activeItem = clonedItems[from];
  const depthDiff = projectedDepth - activeItem.depth;
  let countToMove = 1;

  if (isFlatFolder(activeItem)) {
    let i = from + 1;

    while (clonedItems[i] && activeItem.depth < clonedItems[i].depth) {
      countToMove++;
      i++;
    }
  }

  const itemsToMove = clonedItems
    .splice(from, countToMove)
    .map((item) => ({ ...item, depth: item.depth + depthDiff }));

  // Update items list
  const shiftedTo = to - 1 > from ? to - countToMove : to;

  clonedItems.splice(shiftedTo, 0, ...itemsToMove);
  itemsToMove[0].parentId = getNewParentId(
    clonedItems,
    shiftedTo,
    projectedDepth
  );

  return clonedItems;
}
