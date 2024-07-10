import { Layer, LayerRenderContext } from "../layer";
import { Point } from "../types";

interface MarkerLayerOptions {
  icon: string;
  iconSize: Point
  maxZoom?: number;
  minZoom?: number;
}

interface Marker {
  id: string,
  position: Point,
  // icon?: string,
  // iconSize?: Point;
}

export class MarkerLayer implements Layer {
  #markers: Marker[] = [];
  #options: MarkerLayerOptions;

  constructor(options: MarkerLayerOptions) {
    this.#options = options;
  }

  add(...marker: Marker[]) {
    this.#markers.push(...marker);
  }

  render(renderContext: LayerRenderContext) {
    performance.mark('marker-layer-render-start');

    const isVisible =
      (!this.#options.maxZoom || this.#options.maxZoom >= renderContext.state.zoom) &&
      (!this.#options.minZoom || this.#options.minZoom <= renderContext.state.zoom);

    if(isVisible) {
      this.#renderMarkers(renderContext);
    }

    performance.mark('marker-layer-render-end');
    performance.measure('marker-layer-render', 'marker-layer-render-start', 'marker-layer-render-end')
  }

  #renderMarkers(renderContext: LayerRenderContext) {
    const image = renderContext.getImage(this.#options.icon);

    const viewport = renderContext.state.area;

    const markersInViewport = this.#markers.filter(
      (marker) =>
        marker.position[0] > viewport[0][0] &&
        marker.position[0] < viewport[1][0] &&
        marker.position[1] > viewport[0][1] &&
        marker.position[1] < viewport[1][1]
    );

    for(const marker of markersInViewport) {
      const position = renderContext.project(marker.position);

      if(!image) {
        continue;
      }

      renderContext.context.globalAlpha = 1;

      const size: Point = this.#options.iconSize ?? [image.width, image.height]
      renderContext.context.drawImage(image, position[0] - size[0] / 2, position[1] - size[1] / 2, size[0], size[1]);
    }
  }
}
