import { Layer } from "../layer";
import { Point } from "../types";
import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class InteractionHandler extends Handler {
  #hovering: undefined | { layer: Layer, markerId: string };

  pointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const at: Point = [event.nativeEvent.offsetX, event.nativeEvent.offsetY];
    const target = this.map.hitTest(at);

    (window as any).hitTest = {
      x: at[0], y: at[1], target
    };

    const changedTarget = this.#hovering?.layer !== target?.layer || this.#hovering?.markerId !== target?.markerId;

    if(changedTarget && this.#hovering) {
      this.map.canvas.style.cursor = 'initial';
      this.map.dispatchEvent({ type: 'marker.leave', map: this.map, ...this.#hovering });
    }

    this.#hovering = target;

    if(target && changedTarget) {
      this.map.canvas.style.cursor = 'pointer';
      this.map.dispatchEvent({ type: 'marker.over', map: this.map, ...target });
    }
  }

  pointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {
    if(this.#hovering) {
      this.map.dispatchEvent({ type: 'marker.click', map: this.map, ...this.#hovering })
    }
  }
}
