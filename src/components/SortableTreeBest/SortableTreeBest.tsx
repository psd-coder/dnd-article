// It is based on the SortableTree demo from dnd-kit
// https://github.com/clauderic/dnd-kit/blob/da7c60dcbb76d89cf1fcb421e69a4abcea2eeebe/stories/3%20-%20Examples/Tree/SortableTree.tsx
import { useState, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
  pointerWithin,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Portal } from "@/components/Portal";
import { List } from "@/components/TreeList";
import { Tree, TreeId } from "@/data";
import { isFolder } from "@/data/utils";
import { useDelayedAction } from "@/utils/hooks/useDelayedAction";

import { SortingIndicator } from "./SortingIndicator/SortingIndicator";
import { SortableTreeItem } from "./SortableTreeItem/SortableTreeItem";
import { useIntersectionDetection } from "./intersectionDetection";
import {
  getRenderedFlattenedItems,
  flattenTree,
  updateTreeItem,
} from "./utils";
import { FlattenedItem, isFlattenedFolder } from "./types";
import { CollisionDetectionArg, treeId, TypedOver, typedOver } from "./dndkit";
import {
  DND_MEASURING,
  DND_SENSOR_CONFIGS,
  LEVEL_INDENTATION,
  FOLDER_AUTO_OPEN_DELAY,
} from "./constants";
import styles from "./SortableTreeBest.module.css";

interface SortableTreeBestProps {
  tree: Tree;
  onChange: (tree: Tree) => void;
}

export const SortableTreeBest: React.FC<SortableTreeBestProps> = ({
  tree,
  onChange,
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const sensors = useSensors(...DND_SENSOR_CONFIGS);
  const [activeId, setActiveId] = useState<TreeId | null>(null);
  const [over, setOver] = useState<TypedOver | null>(null);
  const latestCollisionDetectionArgRef = useRef<CollisionDetectionArg | null>(
    null
  );
  const { intersection, recalculateIntersecion } = useIntersectionDetection();
  const { runActionWithDelay, cancelLastDelayedAction } = useDelayedAction();

  const renderedItems = useMemo(
    () => getRenderedFlattenedItems(flattenTree(tree), activeId),
    [tree, activeId]
  );
  const activeItem = activeId
    ? renderedItems.find(({ id }) => id === activeId)
    : null;

  function resetState() {
    setActiveId(null);
    setOver(null);
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(treeId(active.id));
  }
  function handleDragMove(dragMoveEvent: DragMoveEvent) {
    setOver(typedOver(dragMoveEvent.over));
    recalculateIntersecion(
      dragMoveEvent,
      latestCollisionDetectionArgRef.current
    );
  }

  function handleDragOver(dragOverEvent: DragOverEvent) {
    const over = typedOver(dragOverEvent.over);
    const overData = over?.data.current;

    cancelLastDelayedAction();
    setOver(over);

    if (overData && overData.isFolder && overData.isCollapsed) {
      runActionWithDelay(
        () => handleCollapse(treeId(over.id)),
        FOLDER_AUTO_OPEN_DELAY
      );
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    // collissionIntersection

    // if (projected && over) {
    //   const clonedItems: FlattenedItem[] = structuredClone(flattenedItems);
    //   const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
    //   const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);

    //   clonedItems[activeIndex] = { ...clonedItems[activeIndex], ...projected };

    //   const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    //   const newTree = buildTree(sortedItems);

    //   onChange(newTree);
    // }
  }

  function handleDragCancel() {
    resetState();
  }

  function handleCollapse(id: TreeId) {
    onChange(
      updateTreeItem(tree, id, (item) => {
        if (isFolder(item)) {
          return {
            ...item,
            collapsed: !item.collapsed,
          };
        }

        return item;
      })
    );
  }

  function handleClick(item: FlattenedItem) {
    if (isFlattenedFolder(item)) {
      handleCollapse(item.id);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      measuring={DND_MEASURING}
      collisionDetection={(args) => {
        // We need this data for calculating intersections in the best way
        latestCollisionDetectionArgRef.current = args;

        return pointerWithin(args);
      }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={renderedItems}
        strategy={verticalListSortingStrategy}
      >
        <List className={styles.container} ref={listRef}>
          <SortingIndicator
            listRef={listRef}
            over={over}
            intersection={intersection}
          />
          {renderedItems.map((item) => (
            <SortableTreeItem
              key={item.id}
              withDropIndicator={false}
              item={item}
              overlayIntersection={over?.id === item.id ? intersection : null}
              indentationWidth={LEVEL_INDENTATION}
              onClick={() => handleClick(item)}
            />
          ))}
        </List>
        <Portal>
          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <SortableTreeItem
                withDropIndicator={false}
                item={activeItem}
                overlayIntersection={null}
                indentationWidth={LEVEL_INDENTATION}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </Portal>
      </SortableContext>
    </DndContext>
  );
};
