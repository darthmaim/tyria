import { Layer, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { Bounds, Point } from './types';
import { clamp, easeInOutCubic } from './util';

export class Tyria {
  canvas: HTMLCanvasElement;

  zoom = 1;
  center: Point = [0, 0];
  layers: Layer[] = [];
  debug = false;

  constructor(private container: HTMLElement, public readonly options: TyriaMapOptions) {
    this.createCanvas(this.container);
    this.queueRender();
  }

  private createCanvas(container: HTMLElement) {
    this.canvas = document.createElement('canvas');

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = container.offsetWidth * dpr;
    this.canvas.height = container.offsetHeight * dpr;

    let isDragging = false;
    let lastPoint: Point = [0, 0];
    this.canvas.addEventListener('pointerdown', (e) => { isDragging = true; lastPoint = [e.clientX, e.clientY] });
    this.canvas.addEventListener('pointerup', () => isDragging = false)
    this.canvas.addEventListener('pointermove', (e) => {
      if(isDragging) {
        const deltaX = e.clientX - lastPoint[0];
        const deltaY = e.clientY - lastPoint[1];

        const delta = this.unproject([deltaX, deltaY]);

        this.center[0] += delta[0];
        this.center[1] += delta[1];
        this.queueRender();

        lastPoint = [e.clientX, e.clientY];
      }
    });

    // zoom on wheel event
    this.canvas.addEventListener('wheel', (e) => {
      const delta = 0.5 * Math.sign(e.deltaY);

      // get coordinates at cursor
      this.setZoomAround(
        this.canvasPixelToMap([e.offsetX, e.offsetY]),
        this.zoom - delta
      );
    });

    // log coordinates on click
    this.canvas.addEventListener('click', (e) => {
      // get coordinates at cursor
      const halfWidth = this.canvas.width / 2;
      const halfHeight = this.canvas.height / 2;

      const offset: Point = this.unproject([e.offsetX - halfWidth, e.offsetY - halfHeight]);
      const clickAt: Point = [this.center[0] - offset[0], this.center[1] - offset[1]];

      console.log(clickAt);
    });

    window.addEventListener('resize', () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.canvas.width = container.offsetWidth * dpr;
      this.canvas.height = container.offsetHeight * dpr;

      this.render()
    });

    container.appendChild(this.canvas);
  }

  /** projects geographical coordinates to pixels */
  project([x, y]: Point): Point {
    // TODO: 128 (2^7) is currently hardcoded to match the maxZoom of the gw2 map, which also is the level at which coordinate = px
    // this has to be configurable, and the assumption that there is a zoom level at which coordinates = px is probably also wrong for other maps
    const zoomFactor = 2 ** this.zoom;
    return [-x / 128 * zoomFactor, -y / 128 * zoomFactor];
  }

  /** projects pixels to geographical coordinates */
  unproject([x, y]: Point): Point {
    // TODO: 128 (2^7) is currently hardcoded to match the maxZoom of the gw2 map, which also is the level at which coordinate = px
    // this has to be configurable, and the assumption that there is a zoom level at which coordinates = px is probably also wrong for other maps
    const zoomFactor = 2 ** this.zoom;
    return [-x * 128 / zoomFactor, -y * 128 / zoomFactor];
  }

  private _renderQueued: false | 'next-frame' | 'low-priority' = false;
  private _renderQueueTimeout: number;
  private queueRender(priority: 'next-frame' | 'low-priority' = 'next-frame') {
    // don't queue if it is already queued with same or higher priority
    if(this._renderQueued === priority || this._renderQueued === 'next-frame') {
      return;
    }

    if(priority === 'next-frame') {
      // cancel low priority request if we get a high priority one
      if(this._renderQueued === 'low-priority') {
        clearTimeout(this._renderQueueTimeout);
      }

      // request render in next animation frame
      requestAnimationFrame(() => this.render());
    } else {
      // render in 80ms (5 frames at ~60fps), so we can collect some more queueRenders until then (for example from image loading promises resolving)
      this._renderQueueTimeout = setTimeout(() => this.render(), 80);
    }

    // store that render is already queued so we don't queue twice
    this._renderQueued = priority;
  }

  private render() {
    // we are doing it, remove queue status
    this._renderQueued = false;

    const ctx = this.canvas.getContext('2d');

    if(!ctx) {
      throw new Error('Could not get canvas context');
    }

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    const translate = this.project(this.center);
    const translateX = translate[0] + (width / 2);
    const translateY = translate[1] + (height / 2);

    const transform = new DOMMatrix([dpr, 0, 0, dpr, translateX * dpr, translateY * dpr]);

    // render layers
    const renderContext: LayerRenderContext = {
      context: ctx,
      state: {
        center: this.center,
        zoom: this.zoom,
        width,
        height,
        dpr,
        debug: this.debug,
      },
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
      registerPromise: (promise) => promise.then(() => this.queueRender('low-priority')),
    }

    // fill with background
    ctx.fillStyle = this.options.backgroundColor ?? 'lime';
    ctx.fillRect(0, 0, width * dpr, height * dpr);

    // render layers
    for(const layer of this.layers) {
      ctx.setTransform(transform);
      layer.render(renderContext);
      ctx.resetTransform();
    }


    if(this.debug) {
      // render bounds
      ctx.setTransform(transform);
      const bounds = this.project([81920, 114688])
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, -bounds[0], -bounds[1]);
      ctx.resetTransform();

      // render map center
      ctx.setTransform(dpr, 0, 0, dpr, dpr * width / 2, dpr * height / 2);
      ctx.fillStyle = 'lime';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${this.project(this.center)[0]}, ${this.project(this.center)[1]} px`, 8, 0);
      ctx.fillText(`${this.center[0]}, ${this.center[1]} coord`, 8, 16);
      ctx.fillText(`zoom ${this.zoom}`, 8, 32);
    }

    // make sure there are no transforms set
    ctx.resetTransform();
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.queueRender();
  }

  setView(center?: Point, zoom?: number) {
    // handle center
    // TODO: make sure the the viewport stays within the map bounds
    if(center !== undefined) {
      this.center = center;
    }

    // handle zoom
    if(zoom !== undefined) {
      this.zoom = clamp(zoom, this.options.minZoom, this.options.maxZoom);
    }

    // queue render
    this.queueRender();
  }

  // hold the current easing
  currentEase: { frame: (progress: number) => void, start: number, duration: number } | undefined;

  // tick function
  easeTick = () => {
    // if there is no current animation, return
    if(!this.currentEase) {
      return;
    }

    // get currently running transition
    const { frame, start, duration } = this.currentEase;

    // get the current timestamp to calculate progress
    const now = performance.now();
    const progress = Math.min((now - start) / duration, 1);

    // call the frame function with the current progress
    frame(progress);

    // if the animation is not yet finished, queue another frame,
    // otherwise unset the current one
    if(progress < 1) {
      requestAnimationFrame(this.easeTick)
    } else {
      this.currentEase = undefined;
    }
  }

  easeView(center?: Point, zoom?: number, options?: { duration?: number, easing: (progress: number) => number }) {
    // get options
    const {
      duration = 1000,
      easing = (x) => x,
    } = options ?? {};

    // get the current center/zoom and store as start values
    const startCenter = this.center;
    const startZoom = this.zoom;

    // get the target values (default to current if unset)
    const targetCenter = center ?? startCenter;
    const targetZoom = zoom ?? startZoom;

    // frame function gets passed a progress (0,1] and
    // calculates the new center/zoom at that progress between start and target
    const frame = (progress: number) => {
      // progress is linear, but we want a smooth animation, so apply easing
      const easedProgress = easing(progress);

      // calculate zoom
      const deltaZoom = (targetZoom - startZoom) * easedProgress;
      const newZoom = startZoom + deltaZoom;

      // when animating both the zoom and the center it appears to get faster when zooming in (and slower when zooming out)
      // to compensate this we need need to calculate a speedup factor based on the deltaZoom
      // TODO: find correct equation (needs to be always 1 at 100%, before that it needs to be >1 when zooming in (faster at start (because we are zoomed out further and translation appears slower)) and <1 when zooming out)
      const speedup = 1;

      // calculate center
      const newCenter: Point = [
        startCenter[0] + (targetCenter[0] - startCenter[0]) * easedProgress * speedup,
        startCenter[1] + (targetCenter[1] - startCenter[1]) * easedProgress * speedup
      ];

      // set view to the calculated center and zoom
      this.setView(newCenter, newZoom);

      // we are in an animationFrame already, so we can just immediately render (setView only queued a render next frame)
      this.render();
    }

    if(duration === 0) {
      // if the duration of the transition is 0 we just call the end frame
      frame(1);
    } else {
      // store current ease and queue frame
      this.currentEase = { frame, duration, start: performance.now() }
      requestAnimationFrame(this.easeTick);
    }
  }

  /** Set the zoom level */
  setZoom(zoom: number) {
    this.setView(undefined, zoom);
  }

  zoomIn(delta = 1) {
    this.setView(undefined, this.zoom + delta);
  }

  zoomOut(delta = 1) {
    this.setView(undefined, this.zoom - delta);
  }

  canvasPixelToMap([x, y]: Point) {
    const dpr = window.devicePixelRatio || 1;

    const halfWidth = this.canvas.width / dpr / 2;
    const halfHeight = this.canvas.height / dpr / 2;

    const offset: Point = this.unproject([x - halfWidth, y - halfHeight]);
    const point: Point = [this.center[0] - offset[0], this.center[1] - offset[1]];

    return point;
  }

  /** Set zoom and keep a specific point stationary */
  setZoomAround(mapPoint: Point, zoom: number) {
    // make sure the new zoom value is within the zoom bounds
    // `this.setView()` also checks this, but if we are not actually zooming because we are at the bounds already, we need to return early or else we will just move the center
    zoom = clamp(zoom, this.options.minZoom, this.options.maxZoom);

    // if the zoom does not change return
    if(zoom === this.zoom) {
      return;
    }

    // calculate the change in scale between the current zoom level and the target
    const scale = 1 - 2 ** (this.zoom - zoom);

    // calculate offset, apply scale and add to current center
    const newCenter: Point = [
      (mapPoint[0] - this.center[0]) * scale + this.center[0],
      (mapPoint[1] - this.center[1]) * scale + this.center[1],
    ];

    // set view to new center and zoom
    this.setView(newCenter, zoom);
  }

  setDebug(debug: boolean) {
    this.debug = debug;
    this.queueRender();
  }
}
