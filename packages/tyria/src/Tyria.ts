import { Layer, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { Point, View, ViewOptions } from './types';
import { add, clamp, multiply, subtract } from './util';

export class Tyria {
  canvas: HTMLCanvasElement;

  view: View = {
    center: [0, 0],
    zoom: 1
  }
  layers: Layer[] = [];
  debug = false;

  constructor(private container: HTMLElement, public readonly options: TyriaMapOptions) {
    // create the canvas
    this.createCanvas();

    // setup event handlers
    this.setupEvents();

    // queue the first render
    this.queueRender();
  }

  private createCanvas() {
    // create canvas
    this.canvas = document.createElement('canvas');

    // calculate its size
    this.calculateCanvasSize();

    // append the canvas to the container
    this.container.appendChild(this.canvas);

    // recalculate size on window resize
    // TODO: replace with resize observer  to handle resizes for other reasons
    window.addEventListener('resize', () => this.calculateCanvasSize());
  }

  /** calculate the size of the canvas based on the container size */
  private calculateCanvasSize() {
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = this.container.offsetWidth * dpr;
    this.canvas.height = this.container.offsetHeight * dpr;

    this.queueRender();
  }

  private setupEvents() {
    // handle pan
    let isDragging = false;
    let lastPoint: Point = [0, 0];
    this.canvas.addEventListener('pointerdown', (e) => { isDragging = true; lastPoint = [e.clientX, e.clientY] });
    this.canvas.addEventListener('pointerup', () => isDragging = false)
    this.canvas.addEventListener('pointermove', (e) => {
      if(isDragging) {
        const deltaX = e.clientX - lastPoint[0];
        const deltaY = e.clientY - lastPoint[1];

        const delta = this.unproject([deltaX, deltaY]);
        this.jumpTo({ center: add(this.view.center, delta) });

        lastPoint = [e.clientX, e.clientY];
      }
    });

    // zoom on wheel event
    this.canvas.addEventListener('wheel', (e) => {
      const delta = 0.5 * Math.sign(e.deltaY);

      this.easeTo({
        around: this.canvasPixelToMap([e.offsetX, e.offsetY]),
        zoom: this.view.zoom - delta
      }, {
        duration: 100,
        easing: (x) => Math.sin((x * Math.PI) / 2)
      })
    });

    // log coordinates on click
    this.canvas.addEventListener('click', (e) => {
      // get coordinates at cursor
      const clickAt = this.canvasPixelToMap([e.offsetX, e.offsetY]);
      console.log(clickAt);
    });
  }

  /** projects geographical coordinates to pixels */
  project([x, y]: Point): Point {
    // TODO: 128 (2^7) is currently hardcoded to match the maxZoom of the gw2 map, which also is the level at which coordinate = px
    // this has to be configurable, and the assumption that there is a zoom level at which coordinates = px is probably also wrong for other maps
    const zoomFactor = 2 ** this.view.zoom;
    return [-x / 128 * zoomFactor, -y / 128 * zoomFactor];
  }

  /** projects pixels to geographical coordinates */
  unproject([x, y]: Point): Point {
    // TODO: 128 (2^7) is currently hardcoded to match the maxZoom of the gw2 map, which also is the level at which coordinate = px
    // this has to be configurable, and the assumption that there is a zoom level at which coordinates = px is probably also wrong for other maps
    const zoomFactor = 2 ** this.view.zoom;
    return [-x * 128 / zoomFactor, -y * 128 / zoomFactor];
  }

  private _renderQueued: false | 'next-frame' | 'low-priority' = false;
  private _renderQueueFrame: number;
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
      this._renderQueueFrame = requestAnimationFrame(() => this.render());
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

    // and cancel pending renders
    cancelAnimationFrame(this._renderQueueFrame);
    clearTimeout(this._renderQueueTimeout);

    // get context from canvas to draw to
    const ctx = this.canvas.getContext('2d');

    if(!ctx) {
      throw new Error('Could not get canvas context');
    }

    // calculate the global transform of the map
    // this scales the canvas to the correct dpr, so all subsequent drawing does not have to care about dpr
    // and also translates the viewport to the center (so 0,0 is at the top left of the map)
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    const translate = this.project(this.view.center);
    const translateX = translate[0] + (width / 2);
    const translateY = translate[1] + (height / 2);

    const transform = new DOMMatrix([dpr, 0, 0, dpr, translateX * dpr, translateY * dpr]);

    // prepare context that is passed to layers
    const renderContext: LayerRenderContext = {
      context: ctx,
      state: {
        center: this.view.center,
        zoom: this.view.zoom,
        width,
        height,
        dpr,
        debug: this.debug,
      },
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
      registerPromise: (promise) => promise.then(() => this.queueRender('low-priority')),
    }

    // fill the whole canvas with background
    ctx.fillStyle = this.options.backgroundColor ?? 'lime';
    ctx.fillRect(0, 0, width * dpr, height * dpr);

    // apply transform
    ctx.setTransform(transform);

    // render layers
    for(const layer of this.layers) {
      // store the current state, so that we can reset it after the layer was rendered
      ctx.save();

      // actually render the layer
      layer.render(renderContext);

      // restore the context state so that nothing bleeds into the next draw calls
      ctx.restore();
    }

    // reset the transform after we are done rendering the layers
    ctx.resetTransform();

    // render debug information
    if(this.debug) {
      ctx.save();

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
      ctx.fillText(`${this.project(this.view.center)[0]}, ${this.project(this.view.center)[1]} px`, 8, 0);
      ctx.fillText(`${this.view.center[0]}, ${this.view.center[1]} coord`, 8, 16);
      ctx.fillText(`zoom ${this.view.zoom}`, 8, 32);

      ctx.restore();
    }
  }

  /** Add an additional layer to the map */
  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.queueRender();
  }

  /** Resolves the provided view to center + zoom */
  resolveView(view: ViewOptions): View {
    const current = this.view;

    // make sure the zoom stays between minZoom and maxZoom
    const snapZoom = (z: number) => this.options.zoomSnap ? Math.round(z / this.options.zoomSnap) * this.options.zoomSnap : z;
    const zoom = clamp(view.zoom ? snapZoom(view.zoom) : current.zoom, this.options.minZoom, this.options.maxZoom);

    // set center
    let center = view.center ?? current.center;

    // if `around` is set we want to keep that point stationary while zooming
    if(view.around && zoom !== current.zoom) {
      // calculate the change in scale between the current zoom level and the target
      const scale = 1 - 2 ** (this.view.zoom - zoom);

      // calculate offset, apply scale and add to current center
      const offset = subtract(view.around, this.view.center);
      const scaledOffset = multiply(offset, scale);
      center = add(this.view.center, scaledOffset);
    }

    return { center, zoom };
  }

  /** Instantly jumps to the provided view */
  jumpTo(view: ViewOptions) {
    // resolve the requested view
    this.view = this.resolveView(view);

    // cancel any in progress easing
    this.currentEase = undefined;

    // render the changes
    this.queueRender();
  }

  /** Transition to the  */
  easeTo(view: ViewOptions, options?: { duration?: number, easing?: (progress: number) => number }) {
    // get options
    const {
      duration = 1000,
      easing = (x) => x,
    } = options ?? {};

    const start = this.view;
    const target = this.resolveView(view);

    const deltaZoom = target.zoom - start.zoom;
    const deltaCenter = subtract(target.center, start.center);

    // functions to calculate the zoom
    const s = (x: number) => ((1 / (2 ** deltaZoom)) - 1) * x + 1;
    const z = (x: number) => Math.log2(1 / s(x));

    // frame function gets passed a progress (0,1] and
    // calculates the new center/zoom at that progress between start and target
    const frame = (progress: number) => {
      // progress is linear, but we want a smooth animation, so apply easing
      const easedProgress = easing(progress);

      // calculate zoom
      const zoom = z(easedProgress) + start.zoom;

      // when animating both the zoom and the center it appears to get faster when zooming in (and slower when zooming out)
      // to compensate this we need need to calculate a speedup factor based on the deltaZoom
      // TODO: find correct equation (needs to be always 1 at 100%, before that it needs to be >1 when zooming in (faster at start (because we are zoomed out further and translation appears slower)) and <1 when zooming out)
      const speedup = 1;

      // calculate center
      const center = add(start.center, multiply(deltaCenter, easedProgress * speedup));

      // set view to the calculated center and zoom
      this.view = { center, zoom };

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

  /** The currently running easing */
  currentEase: { frame: (progress: number) => void, start: number, duration: number } | undefined;

  /** Tick function called repeatedly while an easing is running */
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

  /** Set the zoom level */
  setZoom(zoom: number) {
    this.jumpTo({ zoom });
  }

  /** Convert a pixel in the canvas (for example offsetX/offsetY from an event) to the corresponding map coordinates at that point */
  private canvasPixelToMap([x, y]: Point) {
    const dpr = window.devicePixelRatio || 1;

    const halfWidth = this.canvas.width / dpr / 2;
    const halfHeight = this.canvas.height / dpr / 2;

    const offset: Point = this.unproject([x - halfWidth, y - halfHeight]);

    return subtract(this.view.center, offset);
  }

  /** Enable or disable the debug overlay of the map */
  setDebug(debug: boolean) {
    this.debug = debug;
    this.queueRender();
  }
}
