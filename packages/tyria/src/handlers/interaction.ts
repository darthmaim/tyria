import { Point } from "../types";
import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class InteractionHandler extends Handler {
  #isHovering = false

  pointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {
    const at: Point = [event.nativeEvent.offsetX, event.nativeEvent.offsetY];
    const target = this.map.hitTest(at);

    (window as any).hitTest = {
      x: at[0], y: at[1], target
    };

    if(target && !this.#isHovering) {
      this.#isHovering = true;
      this.map.canvas.style.cursor = 'pointer';
    }

    if(!target && this.#isHovering) {
      this.#isHovering = false;
      this.map.canvas.style.cursor = 'grab';
    }
  }
}
