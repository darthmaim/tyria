import { Tyria } from "../Tyria"
import { Point, View } from "../types";
import { add, clamp, easeOutCubic, multiply, subtract } from "../util";

interface InertiaRecord {
  time: number;
  view: View;
}

export class Inertia {
  private buffer: InertiaRecord[] = [];

  // expire all records older than 160ms (10 frames at 60fps)
  private bufferExpiration = 160;

  constructor(private readonly map: Tyria) {}

  clear() {
    this.buffer = [];
  }

  removeExpired() {
    const now = performance.now();

    // remove all records from the buffer that have expired
    while(this.buffer.length > 0 && now - this.buffer[0].time > this.bufferExpiration) {
      this.buffer.shift();
    }
  }

  record(view: View) {
    // remove expired records
    this.removeExpired();

    // push new record
    this.buffer.push({ time: performance.now(), view });
  }

  applyInertia() {
    // remove expired records
    this.removeExpired();

    // we need at least 2 records to apply inertia
    if(this.buffer.length <= 1) {
      return;
    }

    // get first and last record
    const start = this.buffer[0];
    const end = this.buffer[this.buffer.length - 1];

    // calculate the duration passed between the records
    const duration = end.time - start.time;

    // calculate deltas between those 2 records
    const zoomDelta = end.view.zoom - start.view.zoom;
    const centerDeltaPx = this.map.project(subtract(end.view.center, start.view.center));
    const centerDeltaPxLength = Math.sqrt(centerDeltaPx[0] ** 2 + centerDeltaPx[1] ** 2);

    // apply easing
    const zoomEasing = calculateEasing(zoomDelta, duration, { deceleration: 20 });
    const centerEasing = calculateEasing(centerDeltaPxLength, duration, { deceleration: 4000 });

    // build target point based on the easing
    const target = {
      center: add(this.map.view.center, this.map.unproject(multiply(centerDeltaPx, centerEasing.amount / centerDeltaPxLength))),
      zoom: this.map.view.zoom + zoomEasing.amount
    };

    // start easing to the target
    this.map.easeTo(target, {
      duration: Math.max(zoomEasing.duration, centerEasing.duration),
      easing: easeOutCubic
    });
  }
}

function calculateEasing(amount: number, inertiaDuration: number, { deceleration }: { deceleration: number }) {
  const maxSpeed = 1400;
  const linearity = 0.3;

  const speed = clamp(
    amount * linearity / (inertiaDuration / 1000),
    -maxSpeed, maxSpeed
  );

  const duration = Math.abs(speed) / (deceleration * linearity);

  return {
    duration: duration * 1000,
    amount: speed * (duration / 2)
  };
}
