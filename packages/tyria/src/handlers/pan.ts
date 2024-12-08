import { Point } from '../types';
import { add, lengthSquared, subtract } from '../util';
import { Handler, HandlerResponse, WrappedEvent } from './handler';

// minimum number of px before a drag is considered a pan
const minDragDistance = 4;

export class PanHandler extends Handler {
  /** track if the pointer is down */
  #isPointerDown = false;

  /** track if the map is being dragged */
  #isPanning = false;

  /** store the last point to calculate delta */
  #lastPoint: Point = [0, 0];

  /** handle pointerdown event */
  pointerdown(event: WrappedEvent<PointerEvent>): HandlerResponse {
    // only care for left mouse click
    if(event.nativeEvent.button === 0) {
      this.#isPointerDown = true;
      this.#lastPoint = [event.nativeEvent.clientX, event.nativeEvent.clientY];
    }
  }

  /** handle pointerup event (ending the pan) */
  windowPointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const wasPanning = this.#isPanning;

    this.#isPanning = false;
    this.#isPointerDown = false;

    if(wasPanning) {
      this.map.canvas.style.cursor = 'initial';

      // align the view to pixels and apply inertia when the drag stops
      return {
        view: { alignToPixels: true },
        applyInertia: true
      }
    }
  }

  windowPointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {
    // we only care about the move while we are dragging
    if(!this.#isPointerDown) {
      return;
    }

    const point: Point = [event.nativeEvent.clientX, event.nativeEvent.clientY];

    // get the delta the pointer was moved by and unproject to coordinate space
    const deltaPx = subtract(this.#lastPoint, point);
    const delta = this.map.unproject(deltaPx);

    // if the pointer has not moved the min distance, this is not considered a pan yet, but a click
    if(!this.#isPanning) {
      // get the (squared) distance the pointer has moved by
      const draggedDistanceSquared = lengthSquared(deltaPx);

      // check if we moved the minimum distance yet
      // we compare squared operands so we don't need to calculate the (slow) square root
      if(draggedDistanceSquared >= (minDragDistance * minDragDistance)) {
        this.#isPanning = true;
        this.map.canvas.style.cursor = 'grabbing';
      } else {
        // was not dragged the minimum distance
        return;
      }
    }

    // store last point to calculate next delta
    this.#lastPoint = point;

    // update the view
    return {
      view: {
        center: add(this.map.view.center, delta),

        // don't align to pixels during the pan
        alignToPixels: false,
      }
    }
  }
}
