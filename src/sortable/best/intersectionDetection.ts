import { useState, useCallback } from "react";
import { shallowEqual } from "fast-equals";
import {
  Collision,
  UniqueIdentifier,
  DragMoveEvent,
  Data,
} from "@dnd-kit/core";
import { SortableData } from "@dnd-kit/sortable";
import { Coordinates } from "@dnd-kit/utilities";
import { assertNonNullable } from "@/utils/assertNonNullable";

import { LEVEL_INDENTATION, BETWEEN_FOLDERS_GAP } from "./constants";
import {
  ItemData,
  TypedActive,
  TypedDroppableContainer,
  CollisionDetectionArg,
  typedActive,
  typedDroppableContainers,
  typedDroppableContainer,
} from "./dndkit";

interface IntersectionTarget {
  overData: Data<ItemData>;
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

interface OverGroupBoundaries {
  top: number;
  height: number;
}

interface OverPart {
  isOverTop: boolean;
  isOverMiddle: boolean;
  isOverBottom: boolean;
}

export interface Intersection extends OverPart {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
  target: IntersectionTarget;
  overGroupBoundaries: OverGroupBoundaries | null;
}

interface CalculateTargetOptions {
  droppableContainers: TypedDroppableContainer[];
  active: TypedActive;
  previousItem: TypedDroppableContainer | null;
  overItem: TypedDroppableContainer;
  nextItem: TypedDroppableContainer | null;
  isOverTop: boolean;
  isOverMiddle: boolean;
  isOverBottom: boolean;
  activeDragDelta: Coordinates;
  indentationWidth: number;
}

function getDroppableContainerData(
  droppableContainer: TypedDroppableContainer
): ItemData {
  const droppableContainerData = droppableContainer.data.current;

  assertNonNullable(
    droppableContainerData,
    "Droppable container must contain data"
  );

  return droppableContainerData;
}

function getMinDepth({
  active,
  overItem,
  nextItem,
  isOverBottom,
}: CalculateTargetOptions) {
  const overData = getDroppableContainerData(overItem);

  if (isOverBottom) {
    if (
      nextItem?.data.current &&
      overData.depth > nextItem.data.current.depth
    ) {
      return nextItem.data.current.depth;
    }

    if (active.id !== overItem.id) {
      return overData.depth + 1;
    }
  }

  return overData.depth;
}

function getMaxDepth({
  active,
  overItem,
  previousItem,
  isOverTop,
  isOverBottom,
}: CalculateTargetOptions) {
  const overData = getDroppableContainerData(overItem);

  if (
    isOverTop &&
    previousItem?.data.current &&
    overData.depth < previousItem.data.current.depth
  ) {
    return previousItem.data.current.depth;
  }

  if (isOverBottom && overData.isFolder && active.id !== overItem.id) {
    return overData.depth + 1;
  }

  return overData.depth;
}

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getProjectedDepth(options: CalculateTargetOptions) {
  const { active, activeDragDelta, indentationWidth } = options;
  const minDepth = getMinDepth(options);
  const maxDepth = getMaxDepth(options);
  const dragDepth = Math.round(activeDragDelta.x / indentationWidth);

  assertNonNullable(active.data.current, "Active must have data");

  return clamp(minDepth, active.data.current.depth + dragDepth, maxDepth);
}

function calculateTarget(options: CalculateTargetOptions): IntersectionTarget {
  const { droppableContainers, active, previousItem, overItem, isOverTop } =
    options;
  const overData = overItem.data.current;

  assertNonNullable(overData, "overItem must contain current data");

  const overItemIndex = droppableContainers.findIndex(
    (dc) => dc.id === active.id
  );
  const isOverCollapsedFolder = overData.isFolder && overData.isCollapsed;
  const depth = isOverCollapsedFolder
    ? overData.depth + 1
    : getProjectedDepth(options);
  const parentId = (() => {
    const previousData = previousItem?.data.current;

    if (isOverCollapsedFolder) {
      return overItem.id;
    }

    if (depth === 0 || !previousData) {
      return null;
    }

    if (depth === previousData.depth) {
      return previousData.parentId;
    }

    if (depth > previousData.depth) {
      return previousItem.id;
    }

    // Find the closest element with the same depth
    for (let i = overItemIndex - 1; i >= 0; i--) {
      const droppableContainerData = getDroppableContainerData(
        droppableContainers[i]
      );

      if (droppableContainerData.depth === depth) {
        return droppableContainerData.parentId;
      }
    }

    return null;
  })();

  return {
    parentId,
    depth,
    index: isOverTop ? overItemIndex : overItemIndex + 1,
    overData,
  };
}

interface DetectIntersectionOptions {
  active: TypedActive;
  collision: Collision | null;
  droppableContainers: TypedDroppableContainer[];
  pointerCoordinates: Coordinates;
  indentationWidth: number;
  activeDragDelta: Coordinates;
}

function getDroppableContainerById(
  droppableContainers: TypedDroppableContainer[],
  id: UniqueIdentifier | null
) {
  if (!id) {
    return null;
  }

  return droppableContainers.find((dc) => dc.id === id) ?? null;
}

function getOverBoundaries(
  { collision, droppableContainers }: DetectIntersectionOptions,
  target: IntersectionTarget,
  { isOverTop }: OverPart
): OverGroupBoundaries | null {
  if (!collision?.data) {
    return null;
  }

  const collisionData = getDroppableContainerData(
    collision?.data?.droppableContainer
  );
  const startItemId =
    collisionData.isFolder && !isOverTop && !collisionData.isCollapsed
      ? collision.id
      : target.parentId;
  const startIndex = droppableContainers.findIndex(
    (item) => item.id === startItemId
  );
  const startFolder = droppableContainers[startIndex];

  if (!startFolder) {
    return null;
  }

  const top = startFolder.rect.current?.top ?? 0;
  const bottom = (() => {
    if (
      startFolder.data.current?.isFolder &&
      startFolder.data.current?.isCollapsed
    ) {
      return startFolder.rect.current?.bottom ?? 0;
    }

    for (
      let i = startIndex + 1, ii = droppableContainers.length;
      i <= ii;
      i++
    ) {
      const droppableContainerData = getDroppableContainerData(
        droppableContainers[i]
      );

      if (droppableContainerData.depth < target.depth) {
        return droppableContainers[i].rect.current?.top ?? 0;
      }
    }

    return 0;
  })();

  return {
    top,
    height: bottom - top,
  };
}

function detectIntersection(
  options: DetectIntersectionOptions
): Intersection | null {
  const {
    active,
    collision,
    droppableContainers,
    pointerCoordinates,
    indentationWidth,
    activeDragDelta,
  } = options;

  if (!active || !collision?.data) {
    return null;
  }

  const collissionY = pointerCoordinates.y;
  const sortableData = collision.data.droppableContainer.data
    .current as SortableData;
  const sortableItems = sortableData.sortable.items;
  const overItem = typedDroppableContainer(collision.data.droppableContainer);
  const overItemIndex = sortableItems.indexOf(overItem.id);
  const previousId = sortableItems[overItemIndex - 1] ?? null;
  const previousItem = getDroppableContainerById(
    droppableContainers,
    previousId
  );
  const nextId = sortableItems[overItemIndex + 1] ?? null;
  const nextItem = getDroppableContainerById(droppableContainers, nextId);
  const overData = getDroppableContainerData(overItem);
  const overRect = overItem.rect.current;

  assertNonNullable(overRect, "Over must have rect");

  const isOverCollapsedFolder = overData.isFolder && overData.isCollapsed;
  const isOverItself = active.id === collision.id;
  const isOverTop = (() => {
    if (!isOverItself && overData.isFolder && overData.isCollapsed) {
      return collissionY <= overRect.top + BETWEEN_FOLDERS_GAP / 2;
    }

    return collissionY <= overRect.top + overRect.height / 2;
  })();
  const isOverBottom = (() => {
    if (!isOverItself && overData.isFolder && overData.isCollapsed) {
      return collissionY >= overRect.bottom - BETWEEN_FOLDERS_GAP / 2;
    }

    return collissionY > overRect.bottom - overRect.height / 2;
  })();
  const isOverMiddle = isOverCollapsedFolder && !isOverTop && !isOverBottom;

  if (!overItem) {
    return null;
  }

  const target = calculateTarget({
    droppableContainers,
    active,
    previousItem,
    overItem,
    nextItem,
    isOverBottom,
    isOverMiddle,
    isOverTop,
    activeDragDelta,
    indentationWidth,
  });

  const isOver = {
    isOverTop,
    isOverMiddle,
    isOverBottom,
  };

  return {
    activeId: active.id,
    overId: overItem.id,
    ...isOver,
    target,
    overGroupBoundaries: getOverBoundaries(options, target, isOver),
  };
}

export function useIntersectionDetection() {
  const [intersection, setIntersection] = useState<Intersection | null>(null);

  const recalculateIntersecion = useCallback(
    (
      dragMoveEvent: DragMoveEvent,
      collissionDetectionArg: CollisionDetectionArg | null
    ) => {
      if (
        !collissionDetectionArg ||
        !collissionDetectionArg.pointerCoordinates
      ) {
        return;
      }

      const newIntersection = detectIntersection({
        active: typedActive(dragMoveEvent.active),
        collision: dragMoveEvent.collisions?.[0] ?? null,
        droppableContainers: typedDroppableContainers(
          collissionDetectionArg.droppableContainers
        ),
        pointerCoordinates: collissionDetectionArg.pointerCoordinates,
        indentationWidth: LEVEL_INDENTATION,
        activeDragDelta: dragMoveEvent.delta,
      });

      if (!shallowEqual(intersection, newIntersection)) {
        setIntersection(newIntersection);
      }

      return newIntersection;
    },
    [intersection]
  );
  const resetIntersection = useCallback(() => setIntersection(null), []);

  return { intersection, recalculateIntersecion, resetIntersection };
}
