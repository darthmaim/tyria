import { Tyria } from "../Tyria";
import { Handler } from "./handler";
import { Inertia } from "./inertia";
import { PanHandler } from "./pan";
import { ScrollZoomHandler } from "./scroll_zoom";

export type SupportedEvents = 'wheel' | 'pointerdown' | 'pointerup' | 'pointermove';

export class HandlerManager {
  private handlers: Map<string, Handler> = new Map();
  private inertia: Inertia;

  constructor(private map: Tyria) {
    this.inertia = new Inertia(map);

    // init default handlers
    this.addHandler('scrollZoom', new ScrollZoomHandler(map));
    this.addHandler('pan', new PanHandler(map));

    // register events
    map.canvas.addEventListener('wheel', this.createEventHandler('wheel'), { passive: true });
    map.canvas.addEventListener('pointerdown', this.createEventHandler('pointerdown'), { passive: true });
    map.canvas.addEventListener('pointerup', this.createEventHandler('pointerup'), { passive: true });
    map.canvas.addEventListener('pointermove', this.createEventHandler('pointermove'), { passive: true });
  }

  private createEventHandler<T extends SupportedEvents, EventType extends HTMLElementEventMap[T]>(type: T) {
    return (event: EventType) => {
      // console.log('[handler]', type, event);

      for(const [name, handler] of this.handlers) {
        // @ts-expect-error
        const response = handler[type](event);

        if(response !== undefined) {
          if(response.view) {
            // resolve the view
            const view = this.map.resolveView(response.view);

            // record to apply inertia later
            this.inertia.record(view);

            // apply view
            this.map.jumpTo(view)
          }

          if(response.applyInertia) {
            this.inertia.applyInertia();
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
