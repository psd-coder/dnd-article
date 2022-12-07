import {
  Active,
  DroppableContainer,
  DataRef,
  UniqueIdentifier,
  CollisionDetection,
  Over,
} from "@dnd-kit/core";

export interface ItemData {
  depth: number;
  isFile: boolean;
  isFolder: boolean;
  isCollapsed: boolean;
  parentId: UniqueIdentifier | null;
}

type TypedType<T extends { data: unknown }> = Omit<T, "data"> & {
  data: DataRef<ItemData>;
};

export type TypedActive = TypedType<Active>;
export type TypedOver = TypedType<Over>;
export type TypedDroppableContainer = TypedType<DroppableContainer>;

export type CollisionDetectionArg = Parameters<CollisionDetection>[0];

export function typedActive(active: Active) {
  return active as TypedActive;
}

export function treeId(id: UniqueIdentifier) {
  return String(id);
}

export function typedOver(over: Over | null) {
  return over ? (over as TypedOver) : null;
}

export function typedDroppableContainer(
  droppableContainer: DroppableContainer
) {
  return droppableContainer as TypedDroppableContainer;
}

export function typedDroppableContainers(
  droppableContainers: DroppableContainer[]
) {
  return droppableContainers as TypedDroppableContainer[];
}
