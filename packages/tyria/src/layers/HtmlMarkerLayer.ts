import { Tyria } from "../Tyria";
import { Layer, LayerRenderContext } from "../layer";
import { Point } from "../types";
import { subtract } from "../util";

export interface Marker {
  id: string;
  position: Point,
  element(): HTMLElement;
}

export class HtmlMarkerLayer implements Layer {
  #container: HTMLDivElement;
  #map: Tyria;
  #markers: Marker[] = [];

  constructor(map: Tyria) {
    this.#container = document.createElement('div');
    this.#container.setAttribute('style', 'position: absolute; inset: 0; pointer-events: none');
    map.container.appendChild(this.#container);
  }

  add(...marker: Marker[]) {
    this.#markers.push(...marker);
  }

  #renderedMarkers: Map<string, HTMLElement> = new Map();

  render(context: LayerRenderContext) {
    const viewport = context.state.area;

    for(const marker of this.#markers) {
      const isVisible =
        marker.position[0] > viewport[0][0] &&
        marker.position[0] < viewport[1][0] &&
        marker.position[1] > viewport[0][1] &&
        marker.position[1] < viewport[1][1];

      let element = this.#renderedMarkers.get(marker.id);

      if(isVisible && element === undefined) {
        element = marker.element();
        element.setAttribute('style', 'position: absolute; pointer-events: initial; will-change: transform')
        this.#container.appendChild(element);
        this.#renderedMarkers.set(marker.id, element);
      } else if(!isVisible && element !== undefined) {
        this.#container.removeChild(element);
        this.#renderedMarkers.delete(marker.id);
        continue;
      }

      if(!element) {
        continue;
      }

      const position = context.project(subtract(marker.position, context.state.area[0]));
      element.style.transform = `translate(-50%, -50%) translate(${position[0]}px, ${position[1]}px)`;
    }
  }
}
