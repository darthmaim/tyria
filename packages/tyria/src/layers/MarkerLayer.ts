import { Layer, LayerHitTestContext, LayerPreloadContext, LayerRenderContext, MapState } from "../layer";
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
  icon?: string,
  iconSize?: Point;
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
    if(!this.#isVisible(renderContext)) {
      return undefined;
    }

    performance.mark('marker-layer-render-start');

    this.#renderMarkers(renderContext);

    performance.mark('marker-layer-render-end');
    performance.measure('marker-layer-render', 'marker-layer-render-start', 'marker-layer-render-end')
  }

  preload(context: LayerPreloadContext) {
    if(!this.#isVisible(context)) {
      return;
    }

    performance.mark('marker-layer-preload-start');

    // preload default image
    context.getImage(this.#options.icon);

    // preload all images in viewport
    for(const marker of this.#getMarkersInViewport(context.state)) {
      if(marker.icon) {
        context.getImage(marker.icon)
      }
    }

    performance.mark('marker-layer-preload-end');
    performance.measure('marker-layer-preload', 'marker-layer-preload-start', 'marker-layer-preload-end')

  }

  #renderMarkers(renderContext: LayerRenderContext) {
    const defaultImage = renderContext.getImage(this.#options.icon);

    const markersInViewport = this.#getMarkersInViewport(renderContext.state);

    for(const marker of markersInViewport) {
      const position = renderContext.project(marker.position);

      const image = marker.icon
        ? renderContext.getImage(marker.icon)
        : defaultImage;

      if(!image) {
        continue;
      }

      renderContext.context.globalAlpha = 1;

      const size: Point = marker.iconSize ?? this.#options.iconSize ?? [image.width, image.height]
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
    if(!this.#isVisible(context)) {
      return undefined;
    }

    // get markers in viewport and reverse the order,
    // because they are rendered bottom-to-top, we want to hit-test top-to-bottom
    const markersInViewport = this.#getMarkersInViewport(context.state).reverse();

    for(const marker of markersInViewport) {
      const position = context.map.mapCoordinateToCanvasPixel(marker.position);
      const size: Point = marker.iconSize ?? this.#options.iconSize ?? [32, 32]
      const halfSize = divide(size, 2);

      if(isInside(hit, [subtract(position, halfSize), add(position, halfSize)])) {
        return { markerId: marker.id }
      }
    }

    return undefined;
  }

  #isVisible(context: LayerRenderContext | LayerHitTestContext) {
    const isVisible =
      (!this.#options.maxZoom || this.#options.maxZoom >= context.state.zoom) &&
      (!this.#options.minZoom || this.#options.minZoom <= context.state.zoom);

    return isVisible;
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
