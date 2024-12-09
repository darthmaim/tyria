import { Tyria } from "../Tyria";
import { ClickZoomHandler } from "./click_zoom";
import { Handler, NativeEventNameFromSupportedEvent, WrappedEvent } from "./handler";
import { Inertia } from "./inertia";
import { InteractionHandler } from "./interaction";
import { PanHandler } from "./pan";
import { ScrollZoomHandler } from "./scroll_zoom";

export type SupportedEvents = 'wheel' | 'pointerdown' | 'pointerup' | 'pointermove' | 'dblclick' | 'windowPointermove' | 'windowPointerup';

export class HandlerManager {
  #handlers: Map<string, Handler> = new Map();
  #inertia: Inertia;

  constructor(private map: Tyria) {
    this.#inertia = new Inertia(map);

    // init default handlers
    this.addHandler('scrollZoom', new ScrollZoomHandler(map));
    this.addHandler('pan', new PanHandler(map));
    this.addHandler('interaction', new InteractionHandler(map));
    this.addHandler('clickZoom', new ClickZoomHandler(map));

    // register events
    map.canvas.addEventListener('wheel', this.#createEventHandler('wheel'), { passive: true });
    map.canvas.addEventListener('pointerdown', this.#createEventHandler('pointerdown'), { passive: true });
    map.canvas.addEventListener('pointerup', this.#createEventHandler('pointerup'), { passive: true });
    map.canvas.addEventListener('pointermove', this.#createEventHandler('pointermove'), { passive: true });
    map.canvas.addEventListener('dblclick', this.#createEventHandler('dblclick'), { passive: true });

    window.addEventListener('pointerup', this.#createEventHandler('windowPointerup'), { passive: true });
    window.addEventListener('pointermove', this.#createEventHandler('windowPointermove'), { passive: true });
  }

  #createEventHandler<T extends SupportedEvents, EventType extends HTMLElementEventMap[NativeEventNameFromSupportedEvent<T>]>(type: T) {
    return (event: EventType) => {
      const wrappedEvent = this.#wrapEvent(event);

      for(const [name, handler] of this.#handlers) {
        // @ts-expect-error
        const response = handler[type](wrappedEvent);

        if(response !== undefined) {
          if(response.view) {
            // resolve the view
            const view = this.map.resolveView(response.view);

            // record to apply inertia later
            this.#inertia.record(view);

            // apply view
            this.map.jumpTo(view)
          }

          if(response.applyInertia) {
            this.#inertia.applyInertia();
          }

          return;
        }
      }
    }
  }

  addHandler(name: string, handler: Handler) {
    this.#handlers.set(name, handler);
  }

  #wrapEvent<E extends Event>(nativeEvent: E): WrappedEvent<E> {
    const coordinate = nativeEvent instanceof MouseEvent
      ? this.map.canvasPixelToMapCoordinate([nativeEvent.offsetX, nativeEvent.offsetY])
      : undefined;

    return {
      nativeEvent,
      coordinate: coordinate as any,
    }
  }
}
