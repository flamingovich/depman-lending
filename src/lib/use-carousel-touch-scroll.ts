import { useEffect, type RefObject } from "react";

const LOCK_THRESHOLD_PX = 8;

export function useCarouselTouchScroll(
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let axis: "x" | "y" | null = null;

    const resetAxis = () => {
      axis = null;
      el.style.removeProperty("touch-action");
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      axis = null;
      el.style.touchAction = "manipulation";
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || axis) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (
        Math.abs(deltaX) < LOCK_THRESHOLD_PX &&
        Math.abs(deltaY) < LOCK_THRESHOLD_PX
      ) {
        return;
      }

      axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      el.style.touchAction = axis === "x" ? "pan-x" : "pan-y pinch-zoom";
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", resetAxis, { passive: true });
    el.addEventListener("touchcancel", resetAxis, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", resetAxis);
      el.removeEventListener("touchcancel", resetAxis);
      el.style.removeProperty("touch-action");
    };
  }, [ref]);
}
