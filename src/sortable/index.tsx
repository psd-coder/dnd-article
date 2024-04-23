import { useState } from "react";
import { buildInitialTree } from "@/data";
import { SortableTree as DefaultSortableTree } from "./default/SortableTree";
import { SortableTree as BestSortableTree } from "./best/SortableTree";

export const DefaultRealtime = () => {
  const [tree, setTree] = useState(buildInitialTree());

  return <DefaultSortableTree tree={tree} onChange={setTree} />;
};

export const DefaultIndicator = () => {
  const [tree, setTree] = useState(buildInitialTree());

  return (
    <DefaultSortableTree tree={tree} onChange={setTree} withDropIndicator />
  );
};

export const BestFollowCursor = () => {
  const [tree, setTree] = useState(buildInitialTree());

  return <BestSortableTree tree={tree} onChange={setTree} />;
};
