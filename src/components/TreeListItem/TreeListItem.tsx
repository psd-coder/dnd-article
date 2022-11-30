import { forwardRef, ReactNode, HTMLAttributes, CSSProperties } from "react";
import clsx from "clsx";

import styles from "./TreeListItem.module.css";

export type TreeListItemHtmlProps = HTMLAttributes<HTMLLIElement>;

export interface TreeListItemProps extends TreeListItemHtmlProps {
  startAdornment: ReactNode;
  name: string;
  depth: number;
  indentationWidth: number;
  withDepthIndicator: boolean;
  asIndicator: boolean;
}

export const TreeListItem = forwardRef<HTMLLIElement, TreeListItemProps>(
  function TreeListItem(
    {
      className,
      depth,
      startAdornment,
      name,
      indentationWidth,
      withDepthIndicator,
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
      >
        {asIndicator && (
          <div
            className={styles.indicator}
            style={
              {
                "--indicator-depth-width": `calc(var(--item-padding) + ${
                  indentationWidth * depth
                }px)`,
              } as CSSProperties
            }
          />
        )}
        {!asIndicator && (
          <button className={clsx(styles.item, className)}>
            {Array.from({ length: depth }, (_, i) => (
              <span
                key={i}
                className={clsx(styles.depthSpacer, {
                  [styles.withDepthIndicator]: withDepthIndicator,
                })}
                style={{ width: indentationWidth }}
              />
            ))}
            <span className={styles.startAdornment}>{startAdornment}</span>
            <span className={styles.label}>{name}</span>
          </button>
        )}
      </li>
    );
  }
);
