import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { nanoid } from "nanoid";

export interface PortalProps {
  className?: string;
  container?: HTMLElement;
  id?: string;
  children: ReactNode;
}

export const Portal: React.FC<PortalProps> = ({
  className,
  container,
  id,
  children,
}) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const node = document.createElement("div");
    const finalContainer = container || document.body;
    node.id = `portal-${id || nanoid()}`;

    if (className) {
      node.className = className;
    }

    finalContainer.appendChild(node);

    setTarget(node);

    return () => {
      finalContainer.removeChild(node);
    };
  }, [container, id, className]);

  if (!target) {
    return null;
  }

  return createPortal(children, target);
};
