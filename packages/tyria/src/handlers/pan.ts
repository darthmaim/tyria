import { Point } from "../types";
import { add, subtract } from "../util";
import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class PanHandler extends Handler {
  #isDragging = false;
  #lastPoint: Point = [0, 0];

  pointerdown(event: WrappedEvent<PointerEvent>): HandlerResponse {
    if(event.nativeEvent.button === 0) {
      this.#isDragging = true;
      this.#lastPoint = [event.nativeEvent.clientX, event.nativeEvent.clientY];
      this.map.canvas.style.cursor = 'grabbing';
    }
  }

  windowPointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const wasDragging = this.#isDragging;

    this.#isDragging = false;

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
    if(!this.#isDragging) {
      return;
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
