import { RefObject } from "react";
import { Intersection } from "../intersectionDetection";
import { compensateContainerVerticalOffset } from "../utils";

import styles from "./OverGroupHighlighting.module.css";

interface OverGroupHighlightingProps {
  containerRef: RefObject<HTMLElement | null>;
  intersection: Intersection | null;
}

export function OverGroupHighlighting({
  containerRef,
  intersection,
}: OverGroupHighlightingProps) {
  if (!intersection?.overGroupBoundaries) {
    return null;
  }

  return (
    <div
      className={styles.highlighting}
      style={{
        height: intersection.overGroupBoundaries.height,
        top: compensateContainerVerticalOffset(
          containerRef,
          intersection.overGroupBoundaries.top,
          true
        ),
      }}
    />
  );
}
