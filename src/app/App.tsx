import { Panels } from "@/components/Panels";
import { Panel } from "@/components/Panel";
import { SortableTree } from "@/components/SortableTree";
import { buildInitialTree } from "@/data";
import { useState } from "react";

import "./globals.css";

export const App = () => {
  const [tree, setTree] = useState(buildInitialTree());
  const [tree2, setTree2] = useState(buildInitialTree());

  return (
    <Panels>
      <Panel>
        <SortableTree tree={tree} onChange={setTree} />
      </Panel>
      <Panel>
        <SortableTree tree={tree2} onChange={setTree2} withDropIndicator />
      </Panel>
    </Panels>
  );
};
