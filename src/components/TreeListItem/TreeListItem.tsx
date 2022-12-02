import { forwardRef, ReactNode, HTMLAttributes, CSSProperties } from "react";
import clsx from "clsx";

import styles from "./TreeListItem.module.css";

export type TreeListItemHtmlProps = HTMLAttributes<HTMLLIElement>;

export interface TreeListItemProps extends TreeListItemHtmlProps {
  className?: string;
  classNameLabel?: string;
  startAdornment: ReactNode;
  name: string;
  depth: number;
  indentationWidth: number;
  asIndicator: boolean;
}

export const TreeListItem = forwardRef<HTMLLIElement, TreeListItemProps>(
  function TreeListItem(
    {
      className,
      classNameLabel,
      depth,
      startAdornment,
      name,
      indentationWidth,
      asIndicator,
      ...restProps
    },
    ref
  ) {
    return (
      <li
        ref={ref}
        {...restProps}
        className={clsx(styles.wrapper, { [styles.asIndicator]: asIndicator })}
        style={
          {
            ...restProps.style,
            "--item-depth-width": `${indentationWidth}px`,
            "--item-indicator-depth-width": `calc(var(--item-padding) + ${
              indentationWidth * depth
            }px)`,
          } as CSSProperties
        }
      >
        {asIndicator && <div className={styles.indicator} />}
        {!asIndicator && (
          <button className={clsx(styles.item, className)}>
            {Array.from({ length: depth }, (_, i) => (
              <span
                key={i}
                className={styles.depthSpacer}
                style={{ width: indentationWidth }}
              />
            ))}
            <span className={styles.startAdornment}>{startAdornment}</span>
            <span className={clsx(styles.label, classNameLabel)}>{name}</span>
          </button>
        )}
      </li>
    );
  }
);
