import { Point } from "./types";

export interface Layer {
  render(context: LayerRenderContext)
  preload?(context: LayerPreloadContext);
}

export interface LayerRenderContext {
  context: CanvasRenderingContext2D,
  state: {
    /** center of the map in map coordinates */
    center: Point,

    /** zoom factor */
    zoom: number,

    /** width of the map in px */
    width: number,

    /** height of the map in px */
    height: number,

    /** The device pixel ratio used to render */
    dpr: number,

    /** debug overlays enabled */
    debug: boolean,
  },
  project: (coordinate: Point) => Point,
  unproject: (point: Point) => Point,
  getImage: (src: string, options?: { priority?: number, cacheOnly?: boolean }) => ImageBitmap | undefined,
}

export type LayerPreloadContext = Omit<LayerRenderContext, 'context'>;
