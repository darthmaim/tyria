export type Point = [x: number, y: number];
export type Bounds = [topLeft: Point, bottomRight: Point];

export type View = {
  center: Point;
  zoom: number;
}

export type ViewOptions = {
  center?: Point;
  zoom?: number;
  around?: Point;

  alignToPixels?: boolean;
}
