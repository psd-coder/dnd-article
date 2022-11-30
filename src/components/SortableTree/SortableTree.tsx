// It is based on the SortableTree demo from dnd-kit
// https://github.com/clauderic/dnd-kit/blob/da7c60dcbb76d89cf1fcb421e69a4abcea2eeebe/stories/3%20-%20Examples/Tree/SortableTree.tsx
import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
  MeasuringStrategy,
  defaultDropAnimation,
  DropAnimation,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Portal } from "@/components/Portal";
import { List } from "@/components/List";
import { Tree, TreeId } from "@/data";
import { isFolder } from "@/data/utils";

import { SortableTreeItem } from "./SortableTreeItem";
import { FlattenedItem } from "./types";
import {
  buildTree,
  getRenderedFlattenedItems,
  flattenTree,
  getProjection,
  updateTreeItem,
} from "./utils";
import { isFlattenedFolder } from "./types";

const MEASURING = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};
const OVERLAY_DROP_ANIMATION: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

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
  onChange: (tree: Tree) => void;
}

export const SortableTree: React.FC<SortableTreeProps> = ({
  tree,
  onChange,
}) => {
  const sensors = useSensors(...SENSOR_CONFIGS);
  const [activeId, setActiveId] = useState<TreeId | null>(null);
  const [overId, setOverId] = useState<TreeId | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const flattenedItems = flattenTree(tree);
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
    overId,
    dragOffset: offsetLeft,
  });

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
    setOverId(String(active.id));
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over ? String(over.id) : null);
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
    setOverId(null);
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
      sensors={sensors}
      measuring={MEASURING}
      collisionDetection={closestCenter}
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
        <List>
          {renderedItems.map((item) => (
            <SortableTreeItem
              key={item.id}
              item={{
                ...item,
                depth:
                  item.id === activeId && projected
                    ? projected.depth
                    : item.depth,
              }}
              onClick={
                isFlattenedFolder(item)
                  ? () => handleCollapse(item.id)
                  : undefined
              }
            />
          ))}
        </List>
        <Portal>
          <DragOverlay dropAnimation={OVERLAY_DROP_ANIMATION}>
            {activeItem ? (
              <SortableTreeItem
                id={activeItem.id}
                item={activeItem}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </Portal>
      </SortableContext>
    </DndContext>
  );
};
