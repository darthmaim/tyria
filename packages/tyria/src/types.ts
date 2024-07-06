export type Point = [x: number, y: number];
export type Bounds = [topLeft: Point, bottomRight: Point];

export type View = {
  /** The center point of the map */
  center: Point;

  /** The zoom level of the map */
  zoom: number;
}

export type ViewOptions = {
  /** Sets the center of the map */
  center?: Point;

  /** Sets the zoom level of the map */
  zoom?: number;

  /** Keeps a point of the map at a static position when changing zoom */
  around?: Point;

  /** Makes sure the viewport contains the whole area. */
  contain?: Bounds;

  /** Makes sure the viewport is completely within this area. */
  cover?: Bounds;

  /**
   * Modifies the center to align with device pixels so tiles stay sharp.
   * @default true
   */
  alignToPixels?: boolean;
}
