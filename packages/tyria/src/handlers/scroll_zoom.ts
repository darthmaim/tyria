import { Point } from '../types';
import { easeOutCubic } from '../util';
import { Handler, HandlerResponse, WrappedEvent } from './handler';

// mouse wheels on macOS scroll with a resolution of this magic number
const wheelZoomDelta = 4.000244140625;

// these magic numbers control the rate of zoom. Trackpad events fire at a greater
// frequency than mouse scroll wheel, so reduce the zoom rate per wheel tick
const defaultZoomRate = 1 / 100;
const wheelZoomRate = 1 / 200;

// transition duration in ms
const transitionDuration = 200;

export class ScrollZoomHandler extends Handler {
  /** timestamp of last wheel event */
  #lastWheelEvent = 0;

  /** type of scroll currently happening */
  #scrollType: 'wheel' | 'trackpad' | undefined;

  /** hold info about delayed handling of wheel events */
  #delayed: { timeout: number, delta: number } | undefined;

  /** target zoom level for rapid zoom events */
  #targetZoom = 0;

  wheel({ coordinate, nativeEvent: event }: WrappedEvent<WheelEvent>): HandlerResponse {
    // get delta in px, if the event specifies the delta in "scrolled lines", multiple by "line height" 40
    let delta = event.deltaMode === event.DOM_DELTA_LINE
      ? event.deltaY * 40
      : event.deltaY;

    // get time since last wheel event
    const now = performance.now();
    const timeDelta = now - this.#lastWheelEvent;
    this.#lastWheelEvent = now;

    // figure out if this is a real mouse wheel or a trackpad
    if(delta !== 0 && (delta % wheelZoomDelta) === 0) {
      // uses the magic number of macOS
      this.#scrollType = 'wheel';
    } else if(delta !== 0 && Math.abs(delta) < 4) {
      // small deltas are usually trackpads, because wheels scroll by larger amounts
      this.#scrollType = 'trackpad';
    } else if(timeDelta > 400) {
      // we don't know what this is, and the last event was some time ago.
      // We can figure out what type this is by waiting a bit and checking how fast the next event comes in
      this.#scrollType = undefined;

      // delay handling of the event by 40ms, in case there is no follow up event to measure the speed
      const timeout = setTimeout(() => {
        // the events are coming in slow, so this is probably a wheel
        this.#scrollType = 'wheel';
        this.#handleScroll(coordinate, delta, timeDelta);
      }, 40);

      // store the value so the delayed handling (either by the timeout or by a follow up event) can include it
      this.#delayed = { timeout, delta };
    } else if(!this.#scrollType) {
      // this is an event where we don't yet know the type, but we had a previous event less than 400ms ago
      // we can look at the speed to estimate if this is a wheel or trackpad
      // small speeds are likely trackpads, while wheels scroll further in the same time
      const speed = Math.abs(timeDelta * delta);
      this.#scrollType = speed < 200 ? 'trackpad' : 'wheel'

      // cancel the handling of delayed events
      if(this.#delayed) {
        clearTimeout(this.#delayed.timeout);

        // include the previously delayed delta in this event
        delta += this.#delayed.delta;

        this.#delayed = undefined;
      }
    }

    // slow down zoom when holding shift
    if(event.shiftKey) {
      delta /= 4;
    }

    // if we now the type we handle the scroll
    // otherwise we are waiting for the timeout
    if(this.#scrollType) {
      this.#handleScroll(coordinate, delta, timeDelta);
    }

    // return empty object to signal that the event was handled, because we are doing a custom easing here
    return {};
  }

  #handleScroll(coordinate: Point, delta: number, timeDelta: number) {
    // get the rate at which we should zoom
    const zoomRate = this.#scrollType === 'wheel' && Math.abs(delta) > wheelZoomDelta
      ? wheelZoomRate
      : defaultZoomRate;

    // calculate how much we want to change the zoom
    let zoomDelta = delta * zoomRate;

    // if the last zoom was less then 200ms ago, we are still transitioning
    // so we base the zoom on our ongoing zoom
    const baseZoom = timeDelta < transitionDuration
      ? this.#targetZoom
      : this.map.view.zoom;

    // store target zoom (without adjusting for zoomSnap)
    this.#targetZoom = baseZoom - zoomDelta;

    // if the map has zoomSnap, we want to make sure to at least zoom by that amount
    // so something is always happening
    if(this.map.options.zoomSnap && Math.abs(zoomDelta) < this.map.options.zoomSnap) {
      zoomDelta = Math.sign(zoomDelta) * this.map.options.zoomSnap;
    }

    // ease the zoom level
    this.map.easeTo({
      around: coordinate,
      zoom: baseZoom - zoomDelta,
    }, {
      duration: transitionDuration,
      easing: easeOutCubic
    });
  }
}
