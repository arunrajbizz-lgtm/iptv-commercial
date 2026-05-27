import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for mobile player gestures:
 * - Swipe left/right to scrub (seek)
 * - Double tap sides to skip 10s
 * - Vertical swipes for volume/brightness (optional)
 */
export default function usePlayerGestures(videoRef, onAction) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
    
    // Handle Double Tap
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleDoubleTap(e.targetTouches[0].clientX);
    }
    setLastTap(now);
  };

  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe Left -> Seek Forward? Or Backward?
        // Usually Swipe Right (distanceX < 0) is Forward
        onAction("RW");
      } else {
        onAction("FF");
      }
    }
  };

  const handleDoubleTap = (clientX) => {
    const width = window.innerWidth;
    if (clientX < width / 3) {
      onAction("RW_10"); // Custom action for 10s skip
    } else if (clientX > (width * 2) / 3) {
      onAction("FF_10");
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}
