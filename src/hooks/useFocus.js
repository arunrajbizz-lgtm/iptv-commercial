import { useState, useEffect, useCallback } from 'react';
import { KEYS, isEnterKey } from '../utils/tizenRemote';

/**
 * useFocus Hook
 * Handles spatial navigation (UP, DOWN, LEFT, RIGHT) within a grid or list.
 * 
 * @param {Object} options
 * @param {React.RefObject} options.containerRef - Ref to the scrollable container
 * @param {number} options.columnCount - Number of columns (1 for lists)
 * @param {number} options.itemCount - Total number of focusable items
 * @param {boolean} options.isActive - Whether this focus zone is currently active
 * @param {Function} options.onEnter - Callback when Enter/OK is pressed
 * @param {Function} options.onBack - Callback when Back is pressed
 * @param {Function} options.onLeftEdge - Callback when Left is pressed at the left edge
 * @param {Function} options.onRightEdge - Callback when Right is pressed at the right edge
 * @param {Function} options.onTopEdge - Callback when Up is pressed at the top edge
 * @param {Function} options.onBottomEdge - Callback when Down is pressed at the bottom edge
 * @param {string} options.initialIndex - Starting focus index
 * @param {string} options.onFocusChange - Callback when focus index changes
 */
export function useFocus({
  containerRef,
  columnCount = 1,
  itemCount,
  isActive = true,
  onEnter,
  onBack,
  onLeftEdge,
  onRightEdge,
  onTopEdge,
  onBottomEdge,
  initialIndex = 0,
  onFocusChange
}) {
  const [focusIndex, setFocusIndex] = useState(initialIndex);

  const focusElement = useCallback((index) => {
    if (!containerRef.current) return;
    
    // Find elements with data-focusable or just children if specified
    const elements = containerRef.current.querySelectorAll('[data-focusable="true"]');
    const el = elements[index];
    
    if (el) {
      // We don't necessarily call el.focus() because we often use CSS classes for TV UI
      // but we ensure it's visible.
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      
      if (onFocusChange) {
        onFocusChange(index, el);
      }
    }
  }, [containerRef, onFocusChange]);

  useEffect(() => {
    if (isActive) {
      focusElement(focusIndex);
    }
  }, [isActive, focusIndex, focusElement]);

  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e) {
      let nextIndex = focusIndex;
      const keyCode = e.keyCode;

      if (isEnterKey(keyCode)) {
        if (onEnter) onEnter(focusIndex);
        return;
      }

      if (keyCode === KEYS.BACK) {
        if (onBack) {
          e.preventDefault();
          onBack();
        }
        return;
      }

      switch (keyCode) {
        case KEYS.LEFT:
          if (focusIndex % columnCount > 0) {
            nextIndex = focusIndex - 1;
            e.preventDefault();
          } else if (onLeftEdge) {
            onLeftEdge();
            e.preventDefault();
          }
          break;

        case KEYS.RIGHT:
          if ((focusIndex % columnCount < columnCount - 1) && (focusIndex + 1 < itemCount)) {
            nextIndex = focusIndex + 1;
            e.preventDefault();
          } else if (onRightEdge) {
            onRightEdge();
            e.preventDefault();
          }
          break;

        case KEYS.UP:
          if (focusIndex - columnCount >= 0) {
            nextIndex = focusIndex - columnCount;
            e.preventDefault();
          } else if (onTopEdge) {
            onTopEdge();
            e.preventDefault();
          }
          break;

        case KEYS.DOWN:
          if (focusIndex + columnCount < itemCount) {
            nextIndex = focusIndex + columnCount;
            e.preventDefault();
          } else if (onBottomEdge) {
            onBottomEdge();
            e.preventDefault();
          }
          break;

        default:
          break;
      }

      if (nextIndex !== focusIndex) {
        setFocusIndex(nextIndex);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, focusIndex, itemCount, columnCount, onEnter, onBack, onLeftEdge, onRightEdge, onTopEdge, onBottomEdge]);

  return {
    focusIndex,
    setFocusIndex
  };
}
