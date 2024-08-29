import { TyriaEventTarget } from './events';
import { HandlerManager } from './handlers/manager';
import { ImageManager } from './image-manager';
import { Layer, LayerHitTestContext, LayerPreloadContext, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { RenderQueue, RenderQueuePriority, RenderReason } from './render-queue';
import { Bounds, Point, View, ViewOptions } from './types';
import { add, clamp, easeInOutCubic, multiply, subtract } from './util';

export class Tyria extends TyriaEventTarget {
  canvas: HTMLCanvasElement;

  view: Readonly<View> = {
    center: [0, 0],
    zoom: 1
  }
  layers: { id: number, layer: Layer }[] = [];
  debug = false
  debugLastViewOptions?: ViewOptions;

  renderQueue = new RenderQueue(this.#render.bind(this));

  handlers: HandlerManager;
  imageManager: ImageManager;

  constructor(private container: HTMLElement, public readonly options: TyriaMapOptions) {
    super();

    // create the canvas
    this.createCanvas();

    // setup managers
    this.handlers = new HandlerManager(this);
    this.imageManager = new ImageManager(this);

    // queue the first render
    this.queueRender();
  }

  private createCanvas() {
    // create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.touchAction = 'none';
    this.canvas.style.userSelect = 'none';

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
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    this.queueRender();
  }

  /** projects geographical coordinates to pixels at a given zoom */
  project([x, y]: Point, zoom?: number): Point {
    const zoomScale = 2 ** (zoom ?? this.view.zoom);
    const nativeZoomScale = 2 ** (this.options.nativeZoom ?? this.options.maxZoom ?? 0)
    return [x / nativeZoomScale * zoomScale, y / nativeZoomScale * zoomScale];
  }

  /** projects pixels to geographical coordinates at a given zoom */
  unproject([x, y]: Point, zoom?: number): Point {
    const zoomScale = 2 ** (zoom ?? this.view.zoom);
    const nativeZoomScale = 2 ** (this.options.nativeZoom ?? this.options.maxZoom ?? 0)
    return [x * nativeZoomScale / zoomScale, y * nativeZoomScale / zoomScale];
  }

  queueRender(priority?: RenderQueuePriority, reason?: RenderReason) {
    this.renderQueue.queue(priority, reason);
  }

  #render(reason: RenderReason) {
    // we are doing it, cancel any pending renders
    this.renderQueue.cancel();

    // get context from canvas to draw to
    const ctx = this.canvas.getContext('2d', { alpha: false });

    if(!ctx) {
      throw new Error('Could not get canvas context');
    }

    // run any current animation
    this.easeTick();

    // preload images
    this.#preloadImages();

    performance.mark('render-start', { detail: { view: this.view }});

    // calculate the global transform of the map
    // this scales the canvas to the correct dpr, so all subsequent drawing does not have to care about dpr
    // and also translates the viewport to the center (so 0,0 is at the top left of the map)
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    const translate = this.project(this.view.center);
    const translateX = -translate[0] + (width / 2);
    const translateY = -translate[1] + (height / 2);

    const transform = new DOMMatrix([dpr, 0, 0, dpr, translateX * dpr, translateY * dpr]);

    // prepare context that is passed to layers
    const renderContext: Omit<LayerRenderContext, 'getImage'> = {
      map: this,
      context: ctx,
      state: {
        center: this.view.center,
        zoom: this.view.zoom,
        width,
        height,
        area: this.#getViewportArea(this.view),
        dpr,
        debug: this.debug,
      },
      reason,
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
    }

    // fill the whole canvas with background
    ctx.fillStyle = this.options.backgroundColor ?? '#444444';
    ctx.fillRect(0, 0, width * dpr, height * dpr);

    // apply transform
    ctx.setTransform(transform);

    // render layers
    for(const { id, layer } of this.layers) {
      const getImage = this.#createGetImageForLayer(id);

      // store the current state, so that we can reset it after the layer was rendered
      ctx.save();

      // actually render the layer
      layer.render({ ...renderContext, getImage });

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
      ctx.strokeRect(0, 0, bounds[0], bounds[1]);

      // render cover/contains bounds
      const coverOrContains = this.debugLastViewOptions?.cover ?? this.debugLastViewOptions?.contain;
      if(coverOrContains) {
        ctx.strokeStyle = '#ff9800';
        ctx.fillStyle = '#ff980022';
        ctx.lineWidth = 2;

        const boundsTopLeft = this.project(coverOrContains[0]);
        const boundsBottomRight = this.project(coverOrContains[1]);
        ctx.strokeRect(boundsTopLeft[0], boundsTopLeft[1], boundsBottomRight[0] - boundsTopLeft[0], boundsBottomRight[1] - boundsTopLeft[1]);
        ctx.fillRect(boundsTopLeft[0], boundsTopLeft[1], boundsBottomRight[0] - boundsTopLeft[0], boundsBottomRight[1] - boundsTopLeft[1]);
      }

      ctx.resetTransform();

      // render map center
      ctx.setTransform(dpr, 0, 0, dpr, dpr * width / 2, dpr * height / 2);
      ctx.fillStyle = 'lime';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#fff';
      ctx.fillText(`px ${translate[0]}, ${translate[1]}`, 8, 0);
      ctx.fillText(`map ${this.view.center[0]}, ${this.view.center[1]}`, 8, 16);
      ctx.fillText(`zoom ${this.view.zoom}`, 8, 32);

      ctx.restore();
    }

    this.imageManager.requestQueuedImages();

    performance.mark('render-end');
    performance.measure('render', 'render-start', 'render-end');
  }

  #nextLayerId = 0;

  /** Add an additional layer to the map */
  addLayer(layer: Layer) {
    const id = this.#nextLayerId++;
    this.layers.push({ id, layer });
    this.queueRender();
  }

  /** Resolves the provided view to center + zoom */
  resolveView(view: ViewOptions): View {
    const current = this.view;

    // controls the rounding direction when zoomSnap is enabled
    // because if we want to make sure a specific area is visible in the viewport we only want to zoom out
    let zoomRounding: 'round' | 'floor' | 'ceil' = 'round';

    // get initial center and zoom
    let center = view.center ?? current.center;
    let zoom = view.zoom ?? current.zoom;

    // get dpr to correctly calculate viewport size
    const dpr = window.devicePixelRatio ?? 1;

    // make sure the area is completely visible in the viewport
    // TODO: handle passing contain + center?
    if(view.contain) {
      // get size and aspect ration of the area
      const size = subtract(view.contain[1], view.contain[0]);
      const aspectRatio = size[0] / size[1];

      // get size and aspect ratio of the viewport
      const viewportSizePx = [this.canvas.width / dpr, this.canvas.height / dpr];
      const viewportAspectRatio = viewportSizePx[0] / viewportSizePx[1];

      // if the area aspect ratio is larger than the viewport aspect ratio the x-axis is the one we have to fit inside the viewport, otherwise its the y-axis
      const dominantAxis = aspectRatio > viewportAspectRatio ? 0 : 1;

      // calculate zoom so that size[dominantAxis] is equals viewportSize[dominantAxis]
      const zoomScale = 2 ** (this.options.nativeZoom ?? this.options.maxZoom ?? 0) * viewportSizePx[dominantAxis] / size[dominantAxis];
      const requiredZoom = Math.log2(zoomScale);

      // if a zoom level is passed which is zoomed out enough to fit the area, we don't need to do anything
      // otherwise we set the zoom to the required zoom to contain the area, ignoring the passed zoom
      if(view.zoom === undefined || view.zoom > requiredZoom) {
        zoom = requiredZoom;
      }

      // set center to the middle of the area
      center = add(view.contain[0], multiply(size, 0.5));

      // make sure we are zooming out when zoom snapping
      zoomRounding = 'floor';
    }

    // make sure the viewport is completely within the specified area
    // TODO: handle passing cover + center?
    if(view.cover) {
      // get size and aspect ration of the area
      const size = subtract(view.cover[1], view.cover[0]);
      const aspectRatio = size[0] / size[1];

      // get size and aspect ratio of the viewport
      const viewportSizePx = [this.canvas.width / dpr, this.canvas.height / dpr];
      const viewportAspectRatio = viewportSizePx[0] / viewportSizePx[1];

      // if the aspect ratio is larger than the viewport aspect ratio the y axis is the one we have to match to the viewport, otherwise its the x axis
      const dominantAxis = aspectRatio > viewportAspectRatio ? 1 : 0;

      // calculate zoom so that size[dominantAxis] is equals viewportSize[dominantAxis]
      const zoomScale = 2 ** (this.options.nativeZoom ?? this.options.maxZoom ?? 0) * viewportSizePx[dominantAxis] / size[dominantAxis];
      zoom = Math.log2(zoomScale);

      // set center to the middle of the area
      center = add(view.cover[0], multiply(size, 0.5));

      // make sure we are zooming out when zoom snapping
      zoomRounding = 'ceil';
    }

    // snap zoom
    if(this.options.zoomSnap) {
      zoom = Math[zoomRounding](zoom / this.options.zoomSnap) * this.options.zoomSnap;
    }

    // clamp zoom between min and max zoom levels
    zoom = clamp(zoom, this.options.minZoom, this.options.maxZoom);

    // if `around` is set we want to keep that point stationary while zooming
    if(view.around && zoom !== current.zoom) {
      // calculate the change in scale between the current zoom level and the target
      const scale = 1 - 2 ** (current.zoom - zoom);

      // calculate offset, apply scale and add to current center
      const offset = subtract(view.around, current.center);
      const scaledOffset = multiply(offset, scale);
      center = add(current.center, scaledOffset);
    }

    // make sure the center aligns with device pixels
    if(view.alignToPixels ?? true) {
      const dpr = window.devicePixelRatio ?? 1;
      const centerPx = this.project(center, zoom);
      centerPx[0] = Math.round(centerPx[0] / dpr) * dpr;
      centerPx[1] = Math.round(centerPx[1] / dpr) * dpr;
      center = this.unproject(centerPx, zoom);
    }

    return { center, zoom };
  }

  /** Gets the area visible in the viewport */
  #getViewportArea(view: View): Bounds {
    const dpr = window.devicePixelRatio ?? 1;
    const viewportHalfSizePx: Point = [this.canvas.width / dpr / 2, this.canvas.height / dpr / 2];
    const centerPx = this.project(view.center);

    const topLeft = this.unproject(subtract(centerPx, viewportHalfSizePx));
    const bottomRight = this.unproject(add(centerPx, viewportHalfSizePx));

    return [topLeft, bottomRight];
  }

  /** Instantly jumps to the provided view */
  jumpTo(view: ViewOptions) {
    this.debugLastViewOptions = view;

    // resolve the requested view
    this.view = this.resolveView(view);

    // cancel any in progress easing
    if(this.currentEase) {
      this.currentEase = undefined;
    }

    // render the changes
    this.queueRender();
  }

  /** Transition to the provided view */
  easeTo(view: ViewOptions, options?: { duration?: number, easing?: (progress: number) => number }) {
    this.debugLastViewOptions = view;

    // get options
    const {
      duration = 1000,
      easing = easeInOutCubic,
    } = options ?? {};

    // get start and target of the transition
    const start = this.view;
    const target = this.resolveView(view);

    // preload target view
    this.preload(target);

    const startArea = this.#getViewportArea(start);
    const targetArea = this.#getViewportArea(target);
    const combinedArea: Bounds = [
      [Math.min(startArea[0][0], targetArea[0][0]), Math.min(startArea[0][1], targetArea[0][1])] as Point,
      [Math.max(startArea[1][0], targetArea[1][0]), Math.max(startArea[1][1], targetArea[1][1])] as Point
    ];
    this.preload(this.resolveView({ contain: combinedArea }));

    // if we are not moving, don't move
    if(target.zoom === start.zoom && target.center[0] === start.center[0] && target.center[1] === start.center[1]) {
      return;
    }

    // calculate delta
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

      if(progress === 1) {
        performance.mark('easeTo-end');
        performance.measure('easeTo', 'easeTo-start', 'easeTo-end');
      }
    }

    performance.mark('easeTo-start');

    if(duration === 0) {
      // if the duration of the transition is 0 we just call the end frame
      frame(1);
    } else {
      // store current ease and queue frame
      this.currentEase = { frame, duration, start: performance.now() }
    }

    this.queueRender('next-frame', 'ease');
  }

  /** The currently running easing */
  currentEase: { frame: (progress: number) => void, start: number, duration: number } | undefined;

  /** Tick function called repeatedly while an easing is running */
  easeTick() {
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
      this.queueRender('next-frame', 'ease');
    } else {
      this.currentEase = undefined;
    }
  }

  /** Set the zoom level */
  setZoom(zoom: number) {
    this.jumpTo({ zoom });
  }

  /** Convert a pixel in the canvas (for example offsetX/offsetY from an event) to the corresponding map coordinates at that point */
  canvasPixelToMapCoordinate([x, y]: Point) {
    const dpr = window.devicePixelRatio || 1;

    const halfWidth = this.canvas.width / dpr / 2;
    const halfHeight = this.canvas.height / dpr / 2;

    const offset: Point = this.unproject([-x + halfWidth, -y + halfHeight]);

    return subtract(this.view.center, offset);
  }

  /** Convert a map coordinate to canvas px */
  mapCoordinateToCanvasPixel(coordinate: Point) {
    const dpr = window.devicePixelRatio || 1;

    const viewportHalfSizePx: Point = [
      this.canvas.width / dpr / 2,
      this.canvas.height / dpr / 2
    ];

    const pointPx = this.project(coordinate);
    const centerPx = this.project(this.view.center);
    const topLeftPx = subtract(centerPx, viewportHalfSizePx);

    return subtract(pointPx, topLeftPx);
  }

  /** Enable or disable the debug overlay of the map */
  setDebug(debug: boolean) {
    this.debug = debug;
    this.queueRender();
  }

  /** Preload an area */
  preload(view: ViewOptions) {
    const target = this.resolveView(view);

    const dpr = window.devicePixelRatio || 1;
    const preloadContext: Omit<LayerPreloadContext, 'getImage'> = {
      map: this,
      project: (point: Point) => this.project(point, target.zoom),
      unproject: (point: Point) => this.project(point, target.zoom),
      state: {
        center: target.center,
        zoom: target.zoom,
        width: this.canvas.width / dpr,
        height: this.canvas.height / dpr,
        area: this.#getViewportArea(target),
        dpr: dpr,
        debug: this.debug,
      }
    };

    for(const { id: layerId, layer } of this.layers) {
      const getImage = this.#createGetImageForLayer(layerId);
      layer.preload?.({ ...preloadContext, getImage });
    }

    this.imageManager.requestQueuedImages();
  }


  #preloadImageRegistrations: Map<string, number[]> = new Map();
  #preloadImages() {
    // load recently loaded images to canvas
    const recentlyLoadedImages = this.imageManager.getPreloaded();
    if(recentlyLoadedImages.length > 0) {
      performance.mark('preload-images-start');

      for(const { id: layerId, layer } of this.layers) {
        if(layer.preloadImages) {
          const imagesToPreloadForThisLayer = recentlyLoadedImages.filter(({ src }) => this.#preloadImageRegistrations.get(src)?.includes(layerId)).map(({ image }) => image);

          if(imagesToPreloadForThisLayer.length > 0) {
            layer.preloadImages(imagesToPreloadForThisLayer);
          }
        }
      }

      for(const { src } of recentlyLoadedImages) {
        this.#preloadImageRegistrations.delete(src);
      }

      performance.mark('preload-images-end');
      performance.measure('preload-images', 'preload-images-start', 'preload-images-end');
    }
  }

  #createGetImageForLayer(layerId: number): LayerRenderContext['getImage'] {
    return (src, options) => {
      const image = this.imageManager.get(src, options);

      if(!image && options?.preload) {
        if(this.#preloadImageRegistrations.has(src)) {
          this.#preloadImageRegistrations.get(src)!.push(layerId);
        } else {
          this.#preloadImageRegistrations.set(src, [layerId]);
        }
      }

      return image;
    }
  }

  hitTest(point: Point): undefined | { layer: Layer, markerId: string } {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    const hitTestContext: LayerHitTestContext = {
      map: this,
      state: {
        center: this.view.center,
        zoom: this.view.zoom,
        width,
        height,
        area: this.#getViewportArea(this.view),
        dpr,
        debug: this.debug,
      },
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
    }

    for(const { layer } of this.layers) {
      const result = layer.hitTest?.(point, hitTestContext);

      if(result !== undefined) {
        return { layer, ...result };
      }
    }
  }
}
