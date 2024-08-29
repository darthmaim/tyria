import { Layer } from "../layer";
import { Point } from "../types";
import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class InteractionHandler extends Handler {
  #hovering: false | { layer: Layer, markerId: string };

  pointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const at: Point = [event.nativeEvent.offsetX, event.nativeEvent.offsetY];
    const target = this.map.hitTest(at);

    (window as any).hitTest = {
      x: at[0], y: at[1], target
    };

    if(target && !this.#hovering) {
      this.#hovering = target;
      this.map.canvas.style.cursor = 'pointer';

      this.map.dispatchEvent({ type: 'marker.over', map: this.map, ...target });
    }

    if(!target && this.#hovering) {
      const wasHovering = this.#hovering;

      this.#hovering = false;
      this.map.canvas.style.cursor = 'grab';

      this.map.dispatchEvent({ type: 'marker.leave', map: this.map, ...wasHovering });
    }
  }
}
