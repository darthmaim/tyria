import { Point } from "../types";
import { add, subtract } from "../util";
import { Handler, HandlerResponse } from "./handler";

export class PanHandler extends Handler {
  #isDragging = false;
  #lastPoint: Point = [0, 0];

  pointerdown(event: PointerEvent): HandlerResponse {
    this.#isDragging = true;
    this.#lastPoint = [event.clientX, event.clientY];
    this.map.canvas.style.cursor = 'grabbing';
  }

  pointerup(event: PointerEvent): HandlerResponse {
    const wasDragging = this.#isDragging;

    this.#isDragging = false;

    if(wasDragging) {
      this.map.canvas.style.cursor = 'grab';

      return {
        applyInertia: true
      }
    }
  }

  pointermove(event: PointerEvent): HandlerResponse {
    // we only care about the move while we are panning
    if(!this.#isDragging) {
      return;
    }

    // get the delta the pointer was moved by and unproject to coordinate space
    const delta = this.map.unproject(
      subtract([event.clientX, event.clientY], this.#lastPoint)
    );

    // store last point to calculate next delta
    this.#lastPoint = [event.clientX, event.clientY];

    // update the view
    return {
      view: {
        center: add(this.map.view.center, delta),
      }
    }
  }
}
