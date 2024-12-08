import { Padding } from "./types";

export interface TyriaMapOptions {
  /** Background color of the map */
  backgroundColor?: string;

  /** The minimum zoom layer */
  minZoom?: number;

  /** The maximum zoom layer */
  maxZoom?: number;

  /**
   * The native zoom layer (layer at which 1px = 1map unit)
   * @defaultValue `maxZoom`
   */
  nativeZoom?: number;

  /** Snap zoom levels to a multiple of this value. */
  zoomSnap?: number;

  /** Padding to consider when setting the view to `{ contain }` in px */
  padding?: number | Partial<Padding>
}
