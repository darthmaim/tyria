import { Tyria } from "../Tyria";
import { Handler } from "./handler";
import { PanHandler } from "./pan";
import { ScrollZoomHandler } from "./scroll_zoom";

export type SupportedEvents = 'wheel' | 'pointerdown' | 'pointerup' | 'pointermove';

export class HandlerManager {
  private handlers: Map<string, Handler> = new Map();

  constructor(private map: Tyria) {
    // init default handlers
    this.addHandler('scrollZoom', new ScrollZoomHandler(map));
    this.addHandler('pan', new PanHandler(map));

    // register events
    map.canvas.addEventListener('wheel', this.createEventHandler('wheel'));
    map.canvas.addEventListener('pointerdown', this.createEventHandler('pointerdown'));
    map.canvas.addEventListener('pointerup', this.createEventHandler('pointerup'));
    map.canvas.addEventListener('pointermove', this.createEventHandler('pointermove'));
  }

  private createEventHandler<T extends SupportedEvents, EventType extends HTMLElementEventMap[T]>(type: T) {
    return (event: EventType) => {
      // console.log('[handler]', type, event);

      for(const [name, handler] of this.handlers) {
        // @ts-expect-error
        const response = handler[type](event);

        if(response !== undefined) {
          if(response.view) {
            this.map.jumpTo(response.view)
          }

          return;
        }
      }
    }
  }

  addHandler(name: string, handler: Handler) {
    this.handlers.set(name, handler);
  }
}
