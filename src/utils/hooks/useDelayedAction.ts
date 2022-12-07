import { useRef, useCallback } from "react";

export function useDelayedAction() {
  const lastActionTimerRef = useRef<number | null>(null);

  const runActionWithDelay = useCallback(
    (action: VoidFunction, delay: number) => {
      lastActionTimerRef.current = setTimeout(action, delay);
    },
    []
  );

  const cancelLastDelayedAction = useCallback(() => {
    if (lastActionTimerRef.current) {
      clearTimeout(lastActionTimerRef.current);
      lastActionTimerRef.current = null;
    }
  }, []);

  return {
    runActionWithDelay,
    cancelLastDelayedAction,
  };
}
