/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type React from 'react';
import { useCallback, useState, useEffect, useRef, useLayoutEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SideEffectContext } from './side_effect_context';
import type { Matrix3 } from '../types';
import * as selectors from '../store/selectors';
import {
  userStartedPanning,
  userMovedPointer,
  userStoppedPanning,
  userZoomed,
  userSetRasterSize,
} from '../store/camera/action';
import type { State } from '../../common/store/types';

export function useCamera({ id }: { id: string }): {
  /**
   * A function to pass to a React element's `ref` property. Used to attach
   * native event listeners and to measure the DOM node.
   */
  ref: (node: HTMLDivElement | null) => void;
  onMouseDown: React.MouseEventHandler<HTMLElement>;
  /**
   * A 3x3 transformation matrix used to convert a `vector2` from 'world' coordinates
   * to screen coordinates.
   */
  projectionMatrix: Matrix3;
} {
  const dispatch = useDispatch();
  const sideEffectors = useContext(SideEffectContext);

  const [ref, setRef] = useState<null | HTMLDivElement>(null);

  /**
   * The position of a thing, as a `Vector2`, is multiplied by the projection matrix
   * to determine where it belongs on the screen.
   * The projection matrix changes over time if the camera is currently animating.
   */

  const projectionMatrixAtTime = useSelector(
    useCallback(
      (state: State) => {
        return selectors.projectionMatrix(state.analyzer.analyzerById[id]);
      },
      [id]
    )
  );

  /**
   * Use a ref to refer to the `projectionMatrixAtTime` function. The rAF loop
   * accesses this and sets state during the rAF cycle. If the rAF loop
   * effect read this directly from the selector, the rAF loop would need to
   * be re-inited each time this function changed. The `projectionMatrixAtTime` function
   * changes each frame during an animation, so the rAF loop would be causing
   * itself to reinit on each frame. This would necessarily cause a drop in FPS as there
   * would be a dead zone between when the rAF loop stopped and restarted itself.
   */
  const projectionMatrixAtTimeRef = useRef<typeof projectionMatrixAtTime>();

  /**
   * The projection matrix is stateful, depending on the current time.
   * When the projection matrix changes, the component should be rerendered.
   */
  const [projectionMatrix, setProjectionMatrix] = useState<Matrix3>(
    projectionMatrixAtTime(sideEffectors.timestamp())
  );

  const userIsPanning = useSelector((state: State) =>
    selectors.userIsPanning(state.analyzer.analyzerById[id])
  );
  const isAnimatingAtTime = useSelector((state: State) =>
    selectors.isAnimating(state.analyzer.analyzerById[id])
  );

  const [elementBoundingClientRect, clientRectCallback] = useAutoUpdatingClientRect();

  /**
   * For an event with clientX and clientY, return [clientX, clientY] - the top left corner of the `ref` element
   */
  const relativeCoordinatesFromMouseEvent = useCallback(
    (event: { clientX: number; clientY: number }): null | [number, number] => {
      if (elementBoundingClientRect === null) {
        return null;
      }
      return [
        event.clientX - elementBoundingClientRect.x,
        event.clientY - elementBoundingClientRect.y,
      ];
    },
    [elementBoundingClientRect]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const maybeCoordinates = relativeCoordinatesFromMouseEvent(event);
      if (maybeCoordinates !== null) {
        dispatch(
          userStartedPanning({
            id,
            screenCoordinates: maybeCoordinates,
            time: sideEffectors.timestamp(),
          })
        );
      }
    },
    [dispatch, relativeCoordinatesFromMouseEvent, sideEffectors, id]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const maybeCoordinates = relativeCoordinatesFromMouseEvent(event);
      if (maybeCoordinates) {
        dispatch(
          userMovedPointer({
            id,
            screenCoordinates: maybeCoordinates,
            time: sideEffectors.timestamp(),
          })
        );
      }
    },
    [dispatch, relativeCoordinatesFromMouseEvent, sideEffectors, id]
  );

  const handleMouseUp = useCallback(() => {
    if (userIsPanning) {
      dispatch(userStoppedPanning({ id, time: sideEffectors.timestamp() }));
    }
  }, [dispatch, sideEffectors, userIsPanning, id]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (
        elementBoundingClientRect !== null &&
        event.ctrlKey &&
        event.deltaY !== 0 &&
        event.deltaMode === 0
      ) {
        event.preventDefault();
        dispatch(
          userZoomed({
            id,
            /**
             *
             * we use elementBoundingClientRect to interpret pixel deltas as a fraction of the element's height
             * when pinch-zooming in on a mac, deltaY is a negative number but we want the payload to be positive
             */
            zoomChange: event.deltaY / -elementBoundingClientRect.height,
            time: sideEffectors.timestamp(),
          })
        );
      }
    },
    [elementBoundingClientRect, dispatch, sideEffectors, id]
  );

  const refCallback = useCallback(
    (node: null | HTMLDivElement) => {
      setRef(node);
      clientRectCallback(node);
    },
    [clientRectCallback]
  );

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  /**
   * Register an event handler directly on `elementRef` for the `wheel` event, with no options
   * React sets native event listeners on the `window` and calls provided handlers via event propagation.
   * As of Chrome 73, `'wheel'` events on `window` are automatically treated as 'passive'.
   * If you don't need to call `event.preventDefault` then you should use regular React event handling instead.
   */
  useEffect(() => {
    if (ref !== null) {
      ref.addEventListener('wheel', handleWheel);
      return () => {
        ref.removeEventListener('wheel', handleWheel);
      };
    }
  }, [ref, handleWheel]);

  /**
   * Allow rAF loop to indirectly read projectionMatrixAtTime via a ref. Since it also
   * sets projectionMatrixAtTime, relying directly on it causes considerable jank.
   */
  useLayoutEffect(() => {
    projectionMatrixAtTimeRef.current = projectionMatrixAtTime;
  }, [projectionMatrixAtTime]);

  /**
   * Keep the projection matrix state in sync with the selector.
   * This isn't needed during animation.
   */
  useLayoutEffect(() => {
    // Update the projection matrix that we return, rerendering any component that uses this.
    setProjectionMatrix(projectionMatrixAtTime(sideEffectors.timestamp()));
  }, [projectionMatrixAtTime, sideEffectors]);

  /**
   * When animation is happening, run a rAF loop, when it is done, stop.
   */
  useLayoutEffect(
    () => {
      const startDate = sideEffectors.timestamp();
      if (isAnimatingAtTime(startDate)) {
        let rafRef: null | number = null;
        const handleFrame = () => {
          // Get the current timestamp, now that the frame is ready
          const date = sideEffectors.timestamp();
          if (projectionMatrixAtTimeRef.current !== undefined) {
            // Update the projection matrix, triggering a rerender
            setProjectionMatrix(projectionMatrixAtTimeRef.current(date));
          }
          // If we are still animating, request another frame, continuing the loop
          if (isAnimatingAtTime(date)) {
            rafRef = sideEffectors.requestAnimationFrame(handleFrame);
          } else {
            /**
             * `isAnimatingAtTime` was false, meaning that the animation is complete.
             * Do not request another animation frame.
             */
            rafRef = null;
          }
        };
        // Kick off the loop by requestion an animation frame
        rafRef = sideEffectors.requestAnimationFrame(handleFrame);

        /**
         * This function cancels the animation frame request. The cancel function
         * will occur when the component is unmounted. It will also occur when a dependency
         * changes.
         *
         * The `isAnimatingAtTime` dependency will be changed if the animation state changes. The animation
         * state only changes when the user animates again (e.g. brings a different node into view, or nudges the
         * camera.)
         */
        return () => {
          // Cancel the animation frame.
          if (rafRef !== null) {
            sideEffectors.cancelAnimationFrame(rafRef);
          }
        };
      }
    },
    /**
     * `isAnimatingAtTime` is a function created with `reselect`. The function reference will be changed when
     * the animation state changes. When the function reference has changed, you *might* be animating.
     */
    [isAnimatingAtTime, sideEffectors]
  );

  useEffect(() => {
    if (elementBoundingClientRect !== null) {
      dispatch(
        userSetRasterSize({
          id,
          dimensions: [elementBoundingClientRect.width, elementBoundingClientRect.height],
        })
      );
    }
  }, [dispatch, elementBoundingClientRect, id]);

  return {
    ref: refCallback,
    onMouseDown: handleMouseDown,
    projectionMatrix,
  };
}

/**
 * Returns a nullable DOMRect and a ref callback. Pass the refCallback to the
 * `ref` property of a native element and this hook will return a DOMRect for
 * it by calling `getBoundingClientRect`. This hook will observe the element
 * with a resize observer and call getBoundingClientRect again after resizes.
 *
 * Note that the changes to the position of the element aren't automatically
 * tracked. So if the element's position moves for some reason, be sure to
 * handle that.
 */
function useAutoUpdatingClientRect(): [DOMRect | null, (node: Element | null) => void] {
  // Access `getBoundingClientRect` via the `SideEffectContext` (for testing.)
  const { getBoundingClientRect } = useContext(SideEffectContext);

  // This hooks returns `rect`.
  const [rect, setRect] = useState<DOMRect | null>(null);

  const { ResizeObserver, requestAnimationFrame } = useContext(SideEffectContext);

  // Keep the current DOM node in state so that we can create a ResizeObserver for it via `useEffect`.
  const [currentNode, setCurrentNode] = useState<Element | null>(null);

  // `ref` will be used with a react element. When the element is available, this function will be called.
  const ref = useCallback((node: Element | null) => {
    // track the node in state
    setCurrentNode(node);
  }, []);

  /**
   * Any time the DOM node changes (to something other than `null`) recalculate the DOMRect and set it (which will cause it to be returned from the hook.
   * This effect re-runs when the DOM node has changed.
   */
  useEffect(() => {
    if (currentNode !== null) {
      // When the DOM node is received, immedaiately calculate its DOM Rect and return that
      setRect(getBoundingClientRect(currentNode));
    }
  }, [currentNode, getBoundingClientRect]);

  /**
   * When scroll events occur, recalculate the DOMRect. DOMRect represents the position of an element relative to the viewport, so that may change during scroll (depending on the layout.)
   * This effect re-runs when the DOM node has changed.
   */
  useEffect(() => {
    // the last scrollX and scrollY values that we handled
    let previousX: number = window.scrollX;
    let previousY: number = window.scrollY;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        // synchronously read from the DOM
        const currentX = window.scrollX;
        const currentY = window.scrollY;

        if (currentNode !== null && (previousX !== currentX || previousY !== currentY)) {
          setRect(getBoundingClientRect(currentNode));
        }

        previousX = currentX;
        previousY = currentY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentNode, requestAnimationFrame, getBoundingClientRect]);

  useEffect(() => {
    if (currentNode !== null) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (currentNode !== null && currentNode === entries[0].target) {
          setRect(getBoundingClientRect(currentNode));
        }
      });
      resizeObserver.observe(currentNode);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ResizeObserver, currentNode, getBoundingClientRect]);
  return [rect, ref];
}
