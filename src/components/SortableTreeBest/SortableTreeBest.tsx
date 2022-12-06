// It is based on the SortableTree demo from dnd-kit
// https://github.com/clauderic/dnd-kit/blob/da7c60dcbb76d89cf1fcb421e69a4abcea2eeebe/stories/3%20-%20Examples/Tree/SortableTree.tsx
import { useState, useMemo, useRef, CSSProperties, RefObject } from "react";
import { shallowEqual } from "fast-equals";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
  MeasuringStrategy,
  pointerWithin,
  MouseSensor,
  TouchSensor,
  Modifier,
  useSensors,
  Over,
  DroppableContainer,
  MeasuringConfiguration,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  calculateCollisionIntersection,
  Intersection,
} from "./collissionIntersection";
import { Portal } from "@/components/Portal";
import { List } from "@/components/TreeList";
import { Tree, TreeId } from "@/data";
import { isFolder } from "@/data/utils";

import { SortableTreeItem } from "./SortableTreeItem";
import styles from "./SortableTreeBest.module.css";
import { FlattenedItem } from "./types";
import {
  buildTree,
  getRenderedFlattenedItems,
  flattenTree,
  getProjection,
  updateTreeItem,
} from "./utils";
import { isFlattenedFolder } from "./types";

const FOLDER_UNCOLLAPSE_TIMEOUT = 800;
const LEVEL_INDENTATION = 12;
const MEASURING: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

// const getOverlayModifiers = (
//   withDropIndicator: boolean
// ): undefined | Modifier[] => {
//   if (!withDropIndicator) {
//     return undefined;
//   }

//   return [
//     ({ draggingNodeRect, transform, active }) => ({
//       ...transform,
//       // x: transform.x + (active?.data.current.depth ?? 0) * LEVEL_INDENTATION,
//       // y: transform.y + (draggingNodeRect?.height ?? 0) / 2,
//     }),
//   ];
// };

const SENSOR_CONFIGS = [
  {
    sensor: MouseSensor,
    options: {
      activationConstraint: {
        distance: 7,
      },
    },
  },
  {
    sensor: TouchSensor,
    options: {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    },
  },
];

interface SortableTreeProps {
  tree: Tree;
  withDropIndicator?: boolean;
  onChange: (tree: Tree) => void;
}

function getIndicatorStyles(
  containerRef: RefObject<HTMLElement | null>,
  over: Over | null,
  intersection: Intersection | null
): CSSProperties {
  if (!containerRef.current || !over || !intersection) {
    return {
      display: "none",
    };
  }

  const INDICATOR_HEIGHT = 3;
  const marginYOffset = parseInt(
    window.getComputedStyle(containerRef.current).marginTop,
    10
  );
  const containerYOffset = containerRef.current.getBoundingClientRect().y;
  const scrollPositionY = containerRef.current.scrollTop;
  const yOffset = (() => {
    if (intersection.isBefore) {
      return over.rect.top - INDICATOR_HEIGHT / 2;
    }

    if (intersection.isAfter) {
      return over.rect.bottom - INDICATOR_HEIGHT / 2;
    }

    return 0;
  })();

  return {
    left: intersection.depth * LEVEL_INDENTATION,
    transform: `translateY(${Math.ceil(
      yOffset - containerYOffset + scrollPositionY + marginYOffset
    )}px)`,
  };
}

export const SortableTreeBest: React.FC<SortableTreeProps> = ({
  tree,
  withDropIndicator = false,
  onChange,
}) => {
  const listRef = useRef<HTMLElement | null>(null);
  const overCollapsedFolderRef = useRef<number | null>(null);
  const sensors = useSensors(...SENSOR_CONFIGS);
  const [intersection, setIntersection] = useState<Intersection | null>(null);
  const [activeId, setActiveId] = useState<TreeId | null>(null);
  const [over, setOver] = useState<Over | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const flattenedItems = flattenTree(tree);

  const latestCollisionDetectionArgsRef = useRef<
    Parameters<CollisionDetection>[0] | null
  >(null);
  const renderedItems = useMemo(
    () => getRenderedFlattenedItems(flattenedItems, activeId),
    [flattenedItems, activeId]
  );
  const activeItem = activeId
    ? renderedItems.find(({ id }) => id === activeId)
    : null;
  const projected = getProjection({
    items: renderedItems,
    activeId,
    overId: over?.id ? String(over?.id) : null,
    dragOffset: offsetLeft,
    indentationWidth: LEVEL_INDENTATION,
  });

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragMove(dragMoveEvent: DragMoveEvent) {
    setOver(dragMoveEvent.over);
    setOffsetLeft(dragMoveEvent.delta.x);

    const collissionIntersection = calculateCollisionIntersection({
      active: dragMoveEvent.active,
      collision: dragMoveEvent.collisions?.[0] ?? null,
      droppableContainers:
        latestCollisionDetectionArgsRef.current?.droppableContainers ?? null,
      pointerCoordinates:
        latestCollisionDetectionArgsRef.current?.pointerCoordinates ?? null,
    });

    if (!shallowEqual(intersection, collissionIntersection)) {
      setIntersection(collissionIntersection);
    }
  }

  function handleDragOver(dragOverEvent: DragOverEvent) {
    setOver(dragOverEvent.over);

    if (overCollapsedFolderRef.current) {
      clearTimeout(overCollapsedFolderRef.current);
      overCollapsedFolderRef.current = null;
    }

    if (dragOverEvent.over?.data.current) {
      const overId = dragOverEvent.over.id;
      const { isFolder, isCollapsed } = dragOverEvent.over.data.current;

      if (isFolder && isCollapsed) {
        overCollapsedFolderRef.current = setTimeout(
          () => handleCollapse(String(overId)),
          FOLDER_UNCOLLAPSE_TIMEOUT
        );
      }
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const clonedItems: FlattenedItem[] = structuredClone(flattenedItems);
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);

      clonedItems[activeIndex] = { ...clonedItems[activeIndex], ...projected };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newTree = buildTree(sortedItems);

      onChange(newTree);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOver(null);
    setActiveId(null);
    setOffsetLeft(0);
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

  return (
    <DndContext
      id="best"
      sensors={sensors}
      measuring={MEASURING}
      collisionDetection={(args) => {
        latestCollisionDetectionArgsRef.current = args;

        console.log(
          "collissionDetection:pointerCoordinates",
          args.pointerCoordinates
        );

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
          {over && (
            <div
              className={styles.indicator}
              style={getIndicatorStyles(listRef, over, intersection)}
            />
          )}
          {renderedItems.map((item) => (
            <SortableTreeItem
              withDropIndicator={withDropIndicator}
              key={item.id}
              item={item}
              overlayIntersection={over?.id === item.id ? intersection : null}
              onClick={
                isFlattenedFolder(item)
                  ? () => handleCollapse(item.id)
                  : undefined
              }
              indentationWidth={LEVEL_INDENTATION}
            />
          ))}
        </List>
        <Portal>
          <DragOverlay
            dropAnimation={null}
            // modifiers={getOverlayModifiers(withDropIndicator)}
          >
            {activeItem ? (
              <SortableTreeItem
                overlayIntersection={null}
                withDropIndicator={withDropIndicator}
                id={activeItem.id}
                item={activeItem}
                isOverlay
                indentationWidth={LEVEL_INDENTATION}
              />
            ) : null}
          </DragOverlay>
        </Portal>
      </SortableContext>
    </DndContext>
  );
};
