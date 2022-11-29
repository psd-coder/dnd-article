import { useReducer, Reducer, useMemo } from "react";
import { Tree, TreeId } from "@/data";
import { flattenTree, isFlattenedFolder, filterCollapsedItems } from "./utils";
import { FlattenedItem } from "./types";

type ToggleFolderAction = { type: "toggleFolder"; payload: { id: TreeId } };

type Action = ToggleFolderAction;

const reducer: Reducer<FlattenedItem[], Action> = (state, action) => {
  switch (action.type) {
    case "toggleFolder":
      return state.map((item) => {
        if (item.id === action.payload.id && isFlattenedFolder(item)) {
          return { ...item, collapsed: !item.collapsed };
        }

        return item;
      });
    default:
      throw new Error();
  }
};

export const useTreeState = (initialTree: Tree) => {
  const [state, dispatch] = useReducer(reducer, flattenTree(initialTree));
  const itemsToRender = useMemo(() => filterCollapsedItems(state), [state]);

  console.log({ state, itemsToRender });

  return {
    allItems: state,
    itemsToRender,
    actions: {
      toggleFolder: (id: TreeId) =>
        dispatch({ type: "toggleFolder", payload: { id } }),
    },
  };
};
