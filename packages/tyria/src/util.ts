export function clamp(value: number, min: number | undefined, max: number | undefined) {
  return (min !== undefined && value < min) ? min :
         (max !== undefined && value > max) ? max : value;
}

export function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;;
}
