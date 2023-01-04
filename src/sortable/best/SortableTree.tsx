// It is based on the SortableTree demo from dnd-kit
// https://github.com/clauderic/dnd-kit/blob/da7c60dcbb76d89cf1fcb421e69a4abcea2eeebe/stories/3%20-%20Examples/Tree/SortableTree.tsx
import { useState, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  pointerWithin,
  useSensors,
  Modifier,
} from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
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
  getRenderedFlatItems,
  flattenTree,
  updateTreeItem,
  buildTree,
} from "../utils/tree";
import { FlatItem, isFlatFolder } from "../types";
import { CollisionDetectionArg, treeId, TypedOver, typedOver } from "./dndkit";
import {
  DND_MEASURING,
  DND_SENSOR_CONFIGS,
  LEVEL_INDENTATION,
  FOLDER_AUTO_OPEN_DELAY,
} from "./constants";
import styles from "./SortableTree.module.css";
import { moveItemInFlatList } from "./utils";
import { OverGroupHighlighting } from "./OverGroupHighlighting/OverGroupHighlighting";

interface SortableTreeProps {
  tree: Tree;
  onChange: (tree: Tree) => void;
}

const OVERLAY_MODIFIERS: Modifier[] = [
  ({ draggingNodeRect, transform, activatorEvent }) => {
    if (draggingNodeRect && activatorEvent) {
      const activatorCoordinates = getEventCoordinates(activatorEvent);

      if (!activatorCoordinates) {
        return transform;
      }

      const offsetY =
        activatorCoordinates.y -
        (draggingNodeRect.top + draggingNodeRect.height / 2);

      return {
        ...transform,
        y: transform.y + offsetY,
      };
    }

    return transform;
  },
];

export const SortableTree: React.FC<SortableTreeProps> = ({
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
  const { intersection, recalculateIntersecion, resetIntersection } =
    useIntersectionDetection();
  const { runActionWithDelay, cancelLastDelayedAction } = useDelayedAction();

  const flatItems = useMemo(() => flattenTree(tree), [tree]);
  const renderedItems = useMemo(
    () => getRenderedFlatItems(flatItems, activeId),
    [flatItems, activeId]
  );
  const activeItem = activeId
    ? renderedItems.find(({ id }) => id === activeId)
    : null;

  function resetState() {
    setActiveId(null);
    setOver(null);
    resetIntersection();
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(treeId(active.id));
  }

  function handleDragOver(dragOverEvent: DragOverEvent) {
    setOver(typedOver(dragOverEvent.over));
  }

  function handleDragMove(dragMoveEvent: DragMoveEvent) {
    const newIntersection = recalculateIntersecion(
      dragMoveEvent,
      latestCollisionDetectionArgRef.current
    );

    const isCollapsedFolder =
      over && over.data.current?.isFolder && over.data.current?.isCollapsed;

    if (!isCollapsedFolder) {
      return;
    }

    if (!newIntersection?.isOverMiddle) {
      cancelLastDelayedAction();
    } else {
      runActionWithDelay(
        () => handleCollapse(treeId(over!.id), false),
        FOLDER_AUTO_OPEN_DELAY
      );
    }
  }

  function handleDragEnd() {
    cancelLastDelayedAction();
    resetState();

    if (intersection) {
      onChange(buildTree(moveItemInFlatList(flatItems, intersection)));
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function handleCollapse(id: TreeId, force?: boolean) {
    onChange(
      updateTreeItem(tree, id, (item) => {
        if (isFolder(item)) {
          return {
            ...item,
            collapsed: typeof force === "boolean" ? force : !item.collapsed,
          };
        }

        return item;
      })
    );
  }

  function handleClick(item: FlatItem) {
    if (isFlatFolder(item)) {
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
          <OverGroupHighlighting
            containerRef={listRef}
            intersection={intersection}
          />
          <SortingIndicator
            containerRef={listRef}
            over={over}
            intersection={intersection}
          />
          {renderedItems.map((item) => (
            <SortableTreeItem
              key={item.id}
              item={item}
              overlayIntersection={over?.id === item.id ? intersection : null}
              indentationWidth={LEVEL_INDENTATION}
              onClick={() => handleClick(item)}
            />
          ))}
        </List>
        <Portal>
          <DragOverlay dropAnimation={null} modifiers={OVERLAY_MODIFIERS}>
            {activeItem ? (
              <SortableTreeItem
                className={styles.overlay}
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
