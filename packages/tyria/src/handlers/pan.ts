import { Point } from "../types";
import { add, subtract } from "../util";
import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class PanHandler extends Handler {
  isPointerDown = false;
  #isDragging = false;
  #lastPoint: Point = [0, 0];

  pointerdown(event: WrappedEvent<PointerEvent>): HandlerResponse {
    if(event.nativeEvent.button === 0) {
      this.isPointerDown = true;
      this.#lastPoint = [event.nativeEvent.clientX, event.nativeEvent.clientY];
    }
  }

  windowPointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const wasDragging = this.#isDragging;

    this.#isDragging = false;
    this.isPointerDown = false;

    if(wasDragging) {
      this.map.canvas.style.cursor = 'grab';

      return {
        view: { alignToPixels: true },
        applyInertia: true
      }
    }
  }

  windowPointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {
    // we only care about the move while we are panning
    if(!this.isPointerDown) {
      return;
    }

    // if the pointer is moving while it is down we are dragging
    // this avoids registering "clicks" as drags
    // TODO: add threshold to move before dragging?
    if(!this.#isDragging) {
      this.#isDragging = true;
      this.map.canvas.style.cursor = 'grabbing';
    }

    const point: Point = [event.nativeEvent.clientX, event.nativeEvent.clientY];

    // get the delta the pointer was moved by and unproject to coordinate space
    const delta = this.map.unproject(subtract(this.#lastPoint, point));

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
