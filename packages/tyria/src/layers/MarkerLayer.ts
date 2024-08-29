import { Layer, LayerHitTestContext, LayerRenderContext, MapState } from "../layer";
import { Bounds, Point } from "../types";
import { add, divide, subtract } from "../util";

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

    const markersInViewport = this.#getMarkersInViewport(renderContext.state);

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

  #getMarkersInViewport(state: MapState) {
    // TODO: instead of iterating over every marker, maybe optimize this and store markers in a BVH or similar?
    return this.#markers.filter(
      (marker) => isInside(marker.position, state.area)
    );
  }

  hitTest(hit: Point, context: LayerHitTestContext): undefined | { markerId: string } {
    // get markers in viewport and reverse the order,
    // because they are rendered bottom-to-top, we want to hit-test top-to-bottom
    const markersInViewport = this.#getMarkersInViewport(context.state).reverse();

    for(const marker of markersInViewport) {
      const position = context.map.mapCoordinateToCanvasPixel(marker.position);
      const size: Point = this.#options.iconSize ?? [32, 32]
      const halfSize = divide(size, 2);

      if(isInside(hit, [subtract(position, halfSize), add(position, halfSize)])) {
        return { markerId: marker.id }
      }
    }

    return undefined;
  }
}

function isInside(point: Point, bounds: Bounds) {
  return (
    point[0] > bounds[0][0] &&
    point[0] < bounds[1][0] &&
    point[1] > bounds[0][1] &&
    point[1] < bounds[1][1]
  );
}
