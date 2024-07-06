import { Point } from "./types";

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

export function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
