import { Padding, Point } from "./types";

export function clamp(value: number, min: number | undefined, max: number | undefined) {
  return (min !== undefined && value < min) ? min :
         (max !== undefined && value > max) ? max : value;
}

export function toPoint(value: Point | number): Point {
  return typeof value === 'number' ? [value, value] : value;
}

export function add(a: Point, b: Point | number): Point {
  b = toPoint(b);

  return [
    a[0] + b[0],
    a[1] + b[1]
  ]
}

export function subtract(a: Point, b: Point | number): Point {
  b = toPoint(b);

  return [
    a[0] - b[0],
    a[1] - b[1]
  ]
}

export function multiply(a: Point, b: Point | number): Point {
  b = toPoint(b);

  return [
    a[0] * b[0],
    a[1] * b[1]
  ]
}

export function divide(a: Point, b: Point | number): Point {
  b = toPoint(b);

  return [
    a[0] / b[0],
    a[1] / b[1]
  ]
}

export function lengthSquared(delta: Point): number {
  const squared = multiply(delta, delta);
  return squared[0] + squared[1];
}

export function length(delta: Point): number {
  return Math.sqrt(lengthSquared(delta));
}

export function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

const emptyPadding: Padding = { top: 0, bottom: 0, left: 0, right: 0 };
export function getPadding(padding: undefined | number | Partial<Padding>): Padding {
  if(padding === undefined) {
    return emptyPadding;
  }

  if(typeof padding === 'number') {
    return { top: padding, bottom: padding, left: padding, right: padding };
  }

  return {
    ...emptyPadding,
    ...padding
  };
}
