import { useRef, useCallback } from "react";

export function useDelayedAction() {
  const lastActionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runActionWithDelay = useCallback(
    (action: VoidFunction, delay: number) => {
      // Action already scheduled
      if (lastActionTimerRef.current) {
        return;
      }

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
