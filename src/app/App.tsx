import { Panels } from "@/components/Panels";
import { Panel } from "@/components/Panel";

import {
  DefaultRealtime,
  DefaultIndicator,
  BestFollowCursor,
} from "@/sortable";

import "./globals.css";

const implementations = [DefaultRealtime, DefaultIndicator, BestFollowCursor];

export const App = () => {
  return (
    <Panels>
      {implementations.map((Implementation, i) => (
        <Panel key={i}>
          <Implementation />
        </Panel>
      ))}
    </Panels>
  );
};
