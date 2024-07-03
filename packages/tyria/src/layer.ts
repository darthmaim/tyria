import { Tyria } from "./Tyria";
import { Bounds, Point } from "./types";

export interface Layer {
  render(context: LayerRenderContext)
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

    /** debug overlays enabled */
    debug: boolean,
  },
  project: (coordinate: Point) => Point,
  unproject: (point: Point) => Point,
  registerPromise: (promise: Promise<any>) => void,
}
