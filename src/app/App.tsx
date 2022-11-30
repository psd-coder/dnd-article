import { Panels } from "@/components/Panels";
import { Panel } from "@/components/Panel";
import { SortableTree } from "@/components/SortableTree";
import { initialTree } from "@/data";
import { useState } from "react";

import "./globals.css";

export const App = () => {
  const [tree, setTree] = useState(initialTree);
  const [tree2, setTree2] = useState(initialTree);

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
