import { RefObject, CSSProperties } from "react";

import { LEVEL_INDENTATION } from "../constants";
import { TypedOver } from "../dndkit";
import { Intersection } from "../intersectionDetection";

import styles from "./SortingIndicator.module.css";

const INDICATOR_HEIGHT = 3;

function getIndicatorStyle(
  containerRef: RefObject<HTMLElement | null>,
  over: TypedOver | null,
  intersection: Intersection | null
): CSSProperties {
  if (!over || !containerRef?.current || !intersection) {
    return {
      display: "none",
    };
  }

  const marginYOffset = parseInt(
    window.getComputedStyle(containerRef.current).marginTop,
    10
  );
  const containerYOffset = containerRef.current.getBoundingClientRect().top;
  const scrollPositionY = containerRef.current.scrollTop;
  const yOffset = (() => {
    if (intersection.isOverTop) {
      return over.rect.top - INDICATOR_HEIGHT / 2;
    }

    if (intersection.isOverBottom) {
      return over.rect.bottom - INDICATOR_HEIGHT / 2;
    }

    return 0;
  })();

  return {
    height: INDICATOR_HEIGHT,
    left: (intersection.target?.depth ?? 0) * LEVEL_INDENTATION,
    transform: `translateY(${Math.ceil(
      yOffset - containerYOffset + scrollPositionY + marginYOffset
    )}px)`,
  };
}

interface SortingIndicatorProps {
  listRef: RefObject<HTMLElement>;
  over: TypedOver | null;
  intersection: Intersection | null;
}

export const SortingIndicator: React.FC<SortingIndicatorProps> = ({
  listRef,
  over,
  intersection,
}) => (
  <div
    className={styles.indicator}
    style={getIndicatorStyle(listRef, over, intersection)}
  />
);
