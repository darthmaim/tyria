import { Layer, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { Bounds, Coordinate } from './types';

export class Tyria {
  canvas: HTMLCanvasElement;

  zoom = 0;
  center: Coordinate = [0, 0];
  layers: Layer[] = [];

  constructor(private container: HTMLElement, public readonly options: TyriaMapOptions) {
    this.createCanvas(container);
    this.render();
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

        this.center[0] += deltaX;
        this.center[1] += deltaY;
        this.render();

        lastPoint = [e.clientX, e.clientY];
      }
    });

    container.appendChild(this.canvas);
  }

  private render() {
    const ctx = this.canvas.getContext('2d');

    if(!ctx) {
      throw new Error('Could not get canvas context');
    }

    const scale = window.devicePixelRatio || 1;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const translateX = this.center[0] + (width / 2);
    const translateY = this.center[1] + (height / 2);

    const transform = new DOMMatrix([scale, 0, 0, scale, translateX, translateY]);
    const inverseTransform = DOMMatrix.fromMatrix(transform).inverse();

    const project = ([x, y]: Coordinate): Coordinate => {
      const transformed = transform.transformPoint({ x, y });
      return [transformed.x, transformed.y];
    };

    const unproject = ([x, y]: Coordinate): Coordinate => {
      const transformed = inverseTransform.transformPoint({ x, y });
      return [transformed.x, transformed.y];
    };

    const visibleBounds: Bounds = [
      unproject([0, 0]),
      unproject([width, height])
    ];

    // render layers
    const renderContext: LayerRenderContext = {
      context: ctx,
      state: {
        center: this.center,
        zoom: this.zoom,
        width,
        height,
        visibleBounds,
      },
      project,
      unproject,
    }

    // fill with background
    ctx.fillStyle = this.options.backgroundColor ?? 'lime';
    ctx.fillRect(0, 0, width, height);

    // render layers
    for(const layer of this.layers) {
      ctx.setTransform(transform);
      layer.render(renderContext);
    }

    ctx.resetTransform();
  }

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.render();
  }
}
