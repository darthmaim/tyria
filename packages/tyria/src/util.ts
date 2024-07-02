export function clamp(value: number, min: number | undefined, max: number | undefined) {
  return (min !== undefined && value < min) ? min :
         (max !== undefined && value > max) ? max : value;
}
