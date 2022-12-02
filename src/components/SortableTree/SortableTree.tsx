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
  closestCenter,
  MouseSensor,
  TouchSensor,
  Modifier,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Portal } from "@/components/Portal";
import { List } from "@/components/TreeList";
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

const LEVEL_INDENTATION = 12;
const MEASURING = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const getOverlayModifiers = (
  withDropIndicator: boolean
): undefined | Modifier[] => {
  if (!withDropIndicator) {
    return undefined;
  }

  return [
    ({ draggingNodeRect, transform }) => ({
      ...transform,
      y: transform.y + (draggingNodeRect?.height ?? 0) / 2,
    }),
  ];
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
  withDropIndicator?: boolean;
  onChange: (tree: Tree) => void;
}

export const SortableTree: React.FC<SortableTreeProps> = ({
  tree,
  withDropIndicator = false,
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
    indentationWidth: LEVEL_INDENTATION,
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
              withDropIndicator={withDropIndicator}
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
              indentationWidth={LEVEL_INDENTATION}
            />
          ))}
        </List>
        <Portal>
          <DragOverlay
            dropAnimation={null}
            modifiers={getOverlayModifiers(withDropIndicator)}
          >
            {activeItem ? (
              <SortableTreeItem
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
