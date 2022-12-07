import { useState, useCallback } from "react";
import { shallowEqual } from "fast-equals";
import { Collision, UniqueIdentifier, DragMoveEvent } from "@dnd-kit/core";
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
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

export interface Intersection {
  isOver: boolean;
  isBefore: boolean;
  isAfter: boolean;
  target: IntersectionTarget | null;
}

interface CalculateTargetOptions {
  droppableContainers: TypedDroppableContainer[];
  active: TypedActive;
  previousItem: TypedDroppableContainer | null;
  overItem: TypedDroppableContainer;
  nextItem: TypedDroppableContainer | null;
  isBefore: boolean;
  isAfter: boolean;
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
  overItem,
  nextItem,
  isAfter,
  isBefore,
}: CalculateTargetOptions) {
  const overData = getDroppableContainerData(overItem);

  if (overData.isFolder) {
    if (isBefore) {
      return overData.depth;
    } else if (isAfter) {
      return overData.depth + 1;
    }
  }

  if (overData.isFile) {
    if (isAfter && nextItem?.data.current) {
      return nextItem.data.current.depth;
    }

    return overData.depth;
  }

  return 0;
}

function getMaxDepth({
  overItem,
  previousItem,
  isBefore,
  isAfter,
}: CalculateTargetOptions) {
  const overData = getDroppableContainerData(overItem);

  if (overData.isFolder) {
    if (isBefore && previousItem?.data.current?.isFile) {
      return previousItem?.data.current.depth;
    }

    if (isAfter) {
      return overData.depth + 1;
    }
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

function calculateTarget(
  options: CalculateTargetOptions
): IntersectionTarget | null {
  const { droppableContainers, active, previousItem, overItem } = options;

  if (!active || !overItem) {
    return null;
  }

  const depth = getProjectedDepth(options);
  const overItemIndex = droppableContainers.findIndex(
    (dc) => dc.id === active.id
  );
  const parentId = (() => {
    const previousData = previousItem?.data.current;

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
    index: overItemIndex,
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

function detectIntersection({
  active,
  collision,
  droppableContainers,
  pointerCoordinates,
  indentationWidth,
  activeDragDelta,
}: DetectIntersectionOptions): Intersection | null {
  if (!active || !collision?.data || active.id === collision.id) {
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

  const isOver = overData.isFolder && overData.isCollapsed;
  const isBefore = (() => {
    if (collissionY < overRect.top || previousItem?.id === active.id) {
      return false;
    }

    if (overData.isFolder && overData.isCollapsed) {
      return collissionY <= overRect.top + BETWEEN_FOLDERS_GAP / 2;
    }

    return collissionY <= overRect.top + overRect.height / 2;
  })();
  const isAfter = (() => {
    if (collissionY > overRect.bottom || nextItem?.id === active.id) {
      return false;
    }

    if (overData.isFolder && overData.isCollapsed) {
      return collissionY >= overRect.bottom - BETWEEN_FOLDERS_GAP / 2;
    }

    return collissionY > overRect.bottom - overRect.height / 2;
  })();

  const target = overItem
    ? calculateTarget({
        droppableContainers,
        active,
        previousItem,
        overItem,
        nextItem,
        isAfter,
        isBefore,
        activeDragDelta,
        indentationWidth,
      })
    : null;

  return {
    isOver,
    isBefore,
    isAfter,
    target,
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
    },
    [intersection]
  );

  return { intersection, recalculateIntersecion };
}
