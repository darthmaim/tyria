import { Tyria } from "../Tyria"
import { View, ViewOptions } from "../types";
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
    const eventDuration = end.time - start.time;

    // create target view
    const target: ViewOptions = {}
    let easingDuration = 0;

    // calculate zoom inertia
    const zoomDelta = end.view.zoom - start.view.zoom;
    if(zoomDelta !== 0) {
      const zoomEasing = calculateEasing(zoomDelta, eventDuration, { deceleration: 20 });

      easingDuration = Math.max(easingDuration, zoomEasing.duration);
      target.zoom = this.map.view.zoom + zoomEasing.amount;
    }

    // calculate center inertia
    const centerDeltaPx = this.map.project(subtract(end.view.center, start.view.center));
    const centerDeltaPxLength = Math.sqrt(centerDeltaPx[0] ** 2 + centerDeltaPx[1] ** 2);
    if(centerDeltaPxLength !== 0) {
      const centerEasing = calculateEasing(centerDeltaPxLength, eventDuration, { deceleration: 4000 });

      easingDuration = Math.max(easingDuration, centerEasing.duration);
      target.center = add(this.map.view.center, this.map.unproject(multiply(centerDeltaPx, centerEasing.amount / centerDeltaPxLength)));
    }

    // start easing to the target
    if(easingDuration !== 0) {
      this.map.easeTo(target, {
        duration: easingDuration,
        easing: easeOutCubic
      });
    }
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
