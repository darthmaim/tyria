import { ImageGetOptions } from "./image-manager";
import { RenderReason } from "./render-queue";
import { Bounds, Padding, Point } from "./types";
import { Tyria } from "./Tyria";

export interface Layer {
  render(context: LayerRenderContext);
  preload?(context: LayerPreloadContext);
  preloadImages?(images: ImageBitmap[]);
  hitTest?(position: Point, context: LayerHitTestContext): undefined | { markerId: string }
}

export interface MapState {
  /** center of the map in map coordinates */
  center: Point,

  /** zoom factor */
  zoom: number,

  /** width of the map in px */
  width: number,

  /** height of the map in px */
  height: number,

  /** padding of the map area */
  padding: Padding,

  /** The visible area in the viewport in map coordinates */
  area: Bounds,

  /** The device pixel ratio used to render */
  dpr: number,

  /** debug overlays enabled */
  debug: boolean,
}

export interface LayerRenderContext {
  context: CanvasRenderingContext2D,
  reason: RenderReason,
  state: MapState,
  project: (coordinate: Point) => Point,
  unproject: (point: Point) => Point,
  getImage: (src: string, options?: ImageGetOptions) => ImageBitmap | undefined,
  map: Tyria,
}

export type LayerPreloadContext = Omit<LayerRenderContext, 'context' | 'reason'>;

export type LayerHitTestContext = Omit<LayerPreloadContext, 'getImage'>;
