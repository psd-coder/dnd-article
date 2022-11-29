import { Panel } from "@/components/Panel";
import { SortableTree } from "@/components/SortableTree";
import { initialTree } from "@/data";
import { useState } from "react";

import "./globals.css";

export const App = () => {
  const [tree, setTree] = useState(initialTree);

  return (
    <Panel>
      <SortableTree tree={tree} onChange={setTree} />
    </Panel>
  );
};
