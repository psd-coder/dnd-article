import { RefObject, CSSProperties } from "react";

import { LEVEL_INDENTATION } from "../constants";
import { TypedOver } from "../dndkit";
import { Intersection } from "../intersectionDetection";
import { compensateContainerVerticalOffset } from "../utils";

import styles from "./SortingIndicator.module.css";

const INDICATOR_HEIGHT = 2;
const INDICATOR_DOT_SIZE = 3;

function getIndicatorStyle(
  containerRef: RefObject<HTMLElement | null>,
  over: TypedOver | null,
  intersection: Intersection | null
): CSSProperties {
  if (!over || !containerRef.current || !intersection) {
    return {
      display: "none",
    };
  }

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
    transform: `translateY(${Math.ceil(
      compensateContainerVerticalOffset(containerRef, yOffset)
    )}px)`,
  };
}

interface SortingIndicatorProps {
  containerRef: RefObject<HTMLElement>;
  over: TypedOver | null;
  intersection: Intersection | null;
}

export const SortingIndicator: React.FC<SortingIndicatorProps> = ({
  containerRef,
  over,
  intersection,
}) => {
  return (
    <div
      className={styles.container}
      style={
        {
          "--indicator-height": INDICATOR_HEIGHT,
          "--indicator-dot-size": INDICATOR_DOT_SIZE,
          ...getIndicatorStyle(containerRef, over, intersection),
        } as CSSProperties
      }
    >
      {Array.from({ length: intersection?.target?.depth ?? 0 }, (_, i) => (
        <span
          key={i}
          className={styles.dot}
          style={{ width: LEVEL_INDENTATION }}
        />
      ))}
      <div
        className={styles.line}
        style={{
          left:
            (intersection?.target?.depth ?? 0) * LEVEL_INDENTATION +
            (INDICATOR_DOT_SIZE + INDICATOR_HEIGHT),
        }}
      />
    </div>
  );
};
