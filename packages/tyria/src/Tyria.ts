import { Layer, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { Bounds, Coordinate } from './types';

export class Tyria {
  canvas: HTMLCanvasElement;

  zoom = 1;
  center: Coordinate = [0, 0];
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

    this.canvas.style.width = CSS.px(width).toString();
    this.canvas.style.height = CSS.px(height).toString();
    this.canvas.width = container.offsetWidth * dpr;
    this.canvas.height = container.offsetHeight * dpr;

    let isDragging = false;
    let lastPoint: Coordinate = [0, 0];
    this.canvas.addEventListener('pointerdown', (e) => { isDragging = true; lastPoint = [e.clientX, e.clientY] });
    this.canvas.addEventListener('pointerup', () => isDragging = false)
    this.canvas.addEventListener('pointermove', (e) => {
      if(isDragging) {
        const deltaX = e.clientX - lastPoint[0];
        const deltaY = e.clientY - lastPoint[1];

        const dpr = window.devicePixelRatio || 1;
        const delta = this.unproject([deltaX * dpr, deltaY * dpr]);

        this.center[0] += delta[0];
        this.center[1] += delta[1];
        this.queueRender();

        lastPoint = [e.clientX, e.clientY];
      }
    });
    this.canvas.addEventListener('wheel', (e) => {
      if(e.deltaY > 0) {
        this.zoomOut();
      } else if(e.deltaY < 0) {
        this.zoomIn();
      }
    });

    window.addEventListener('resize', () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;

      this.canvas.style.width = CSS.px(width).toString();
      this.canvas.style.height = CSS.px(height).toString();
      this.canvas.width = container.offsetWidth * dpr;
      this.canvas.height = container.offsetHeight * dpr;

      this.render()
    });

    container.appendChild(this.canvas);
  }

  /** projects geographical coordinates to pixels */
  project([x, y]: Coordinate): Coordinate {
    // 0,0 -> 0,0
    // 81920, 114688 -> 640, -896
    const zoomFactor = 2 ** this.zoom;
    return [-x / 128 * zoomFactor, -y / 128 * zoomFactor];
  }

  /** projects pixels to geographical coordinates */
  unproject([x, y]: Coordinate): Coordinate {
    // 0,0 -> 0,0
    // 640, -896 -> 81920, 114688
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

    const width = this.canvas.width;
    const height = this.canvas.height;
    const translate = this.project(this.center);
    const translateX = Math.floor(translate[0] + (width / 2));
    const translateY = Math.floor(translate[1] + (height / 2));

    const transform = new DOMMatrix([1, 0, 0, 1, translateX, translateY]);

    // render layers
    const renderContext: LayerRenderContext = {
      context: ctx,
      state: {
        center: this.center,
        zoom: this.zoom,
        width,
        height,
        debug: this.debug,
      },
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
      registerPromise: (promise) => promise.then(() => this.queueRender('low-priority')),
    }

    // fill with background
    ctx.fillStyle = this.options.backgroundColor ?? 'lime';
    ctx.fillRect(0, 0, width, height);

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
      ctx.fillStyle = 'lime';
      ctx.fillRect(width / 2 - 4, height / 2 - 4, 8, 8);
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${this.project(this.center)[0]}, ${this.project(this.center)[1]} px`, width / 2 + 8, height / 2);
      ctx.fillText(`${this.center[0]}, ${this.center[1]} coord`, width / 2 + 8, height / 2 + 16);
      ctx.fillText(`zoom ${this.zoom}`, width / 2 + 8, height / 2 + 32);
    }
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.queueRender();
  }

  setZoom(zoom: number) {
    this.zoom = zoom;

    // ensure lower bound
    if(this.options.minZoom) {
      this.zoom = Math.max(this.options.minZoom, this.zoom);
    }

    // ensure upper bound
    if(this.options.maxZoom) {
      this.zoom = Math.min(this.options.maxZoom, this.zoom);
    }

    // make sure the center is on full pixels
    const centerCoordinates = this.project(this.center);
    centerCoordinates[0] = Math.round(centerCoordinates[0]);
    centerCoordinates[1] = Math.round(centerCoordinates[1]);
    this.center = this.unproject(centerCoordinates);

    // queue render
    this.queueRender();
  }

  zoomIn(delta = 1) {
    this.setZoom(this.zoom + delta);
  }

  zoomOut(delta = 1) {
    this.setZoom(this.zoom - delta);
  }

  setDebug(debug: boolean) {
    this.debug = debug;
    this.queueRender();
  }
}
