import { ImageGetOptions } from "./image-manager";
import { RenderReason } from "./render-queue";
import { Bounds, Point } from "./types";

export interface Layer {
  render(context: LayerRenderContext);
  preload?(context: LayerPreloadContext);
  preloadImages?(images: ImageBitmap[]);
}

export interface LayerRenderContext {
  context: CanvasRenderingContext2D,
  reason: RenderReason,
  state: {
    /** center of the map in map coordinates */
    center: Point,

    /** zoom factor */
    zoom: number,

    /** width of the map in px */
    width: number,

    /** height of the map in px */
    height: number,

    /** The visible area in the viewport in map coordinates */
    area: Bounds,

    /** The device pixel ratio used to render */
    dpr: number,

    /** debug overlays enabled */
    debug: boolean,
  },
  project: (coordinate: Point) => Point,
  unproject: (point: Point) => Point,
  getImage: (src: string, options?: ImageGetOptions) => ImageBitmap | undefined,
}

export type LayerPreloadContext = Omit<LayerRenderContext, 'context' | 'reason'>;
