import {
  Active,
  Collision,
  DroppableContainer,
  UniqueIdentifier,
} from "@dnd-kit/core";

const BETWEEN_FOLDERS_GAP = 4;

export interface Intersection {
  collissionId: UniqueIdentifier;
  isOver: boolean;
  isBefore: boolean;
  isAfter: boolean;
  depth: number;
}

export const calculateCollisionIntersection = ({
  active,
  collision,
  droppableContainers,
  pointerCoordinates,
}: {
  active: Active;
  collision: Collision | null;
  droppableContainers: DroppableContainer[] | null;
  pointerCoordinates: { x: number; y: number } | null;
}): Intersection | null => {
  console.log("calculateCollisionIntersection", {
    active,
    collision,
    droppableContainers,
    pointerCoordinates,
  });

  if (
    !active ||
    !collision?.data ||
    active.id === collision.id ||
    !droppableContainers ||
    !pointerCoordinates
  ) {
    return null;
  }

  const overItem = collision.data.droppableContainer;
  const sortableItems =
    collision.data.droppableContainer.data.current.sortable.items;

  const overItemIndex = sortableItems.indexOf(overItem.id);
  const previousItemId =
    overItemIndex > 0 ? sortableItems[overItemIndex - 1] : null;
  const previousItem = previousItemId
    ? droppableContainers.find(({ id }) => id === previousItemId)
    : null;
  const nextItemId =
    overItemIndex < droppableContainers.length
      ? sortableItems[overItemIndex + 1]
      : null;
  const nextItem = nextItemId
    ? droppableContainers.find(({ id }) => id === nextItemId)
    : null;

  const collissionY = pointerCoordinates?.y || 0;
  const isOver = (() => {
    return overItem.data.current.isFolder && overItem.data.current.isCollapsed;
  })();
  const isBefore = (() => {
    if (
      collissionY < overItem.rect.current.top ||
      previousItem?.id === active.id
    ) {
      return false;
    }

    if (overItem.data.current.isFolder && overItem.data.current.isCollapsed) {
      return collissionY <= overItem.rect.current.top + BETWEEN_FOLDERS_GAP;
    }

    return (
      collissionY <=
      overItem.rect.current.top + overItem.rect.current.height / 2
    );
  })();
  const isAfter = (() => {
    if (
      collissionY > overItem.rect.current.bottom ||
      nextItem?.id === active.id
    ) {
      return false;
    }

    if (overItem.data.current.isFolder && overItem.data.current.isCollapsed) {
      return collissionY >= overItem.rect.current.bottom - BETWEEN_FOLDERS_GAP;
    }

    return (
      collissionY >
      overItem.rect.current.bottom - overItem.rect.current.height / 2
    );
  })();

  return {
    collissionId: collision.id,
    isOver,
    isBefore,
    isAfter,
    depth: active.data.current?.depth ?? 0,
  };
};
