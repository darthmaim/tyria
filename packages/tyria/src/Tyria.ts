import { Layer, LayerRenderContext } from './layer';
import { TyriaMapOptions } from './options';
import { Bounds, Coordinate } from './types';

export class Tyria {
  canvas: HTMLCanvasElement;

  zoom = 1;
  center: Coordinate = [0, 0];
  layers: Layer[] = [];

  constructor(private container: HTMLElement, public readonly options: TyriaMapOptions) {
    this.createCanvas(this.container);
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

        const dpr = window.devicePixelRatio || 1;
        const delta = this.unproject([deltaX * dpr, deltaY * dpr]);

        this.center[0] += delta[0];
        this.center[1] += delta[1];
        this.render();

        lastPoint = [e.clientX, e.clientY];
      }
    });
    this.canvas.addEventListener('wheel', (e) => {
      if(e.deltaY > 0) {
        this.zoom--;
        this.render();
      } else if(e.deltaY < 0) {
        this.zoom++;
        this.render();
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

  private render() {
    const ctx = this.canvas.getContext('2d');

    if(!ctx) {
      throw new Error('Could not get canvas context');
    }

    const width = this.canvas.width;
    const height = this.canvas.height;
    const translate = this.project(this.center);
    const translateX = translate[0] + (width / 2);
    const translateY = translate[1] + (height / 2);

    const transform = new DOMMatrix([1, 0, 0, 1, translateX, translateY]);

    // render layers
    const renderContext: LayerRenderContext = {
      context: ctx,
      state: {
        center: this.center,
        zoom: this.zoom,
        width,
        height,
      },
      project: this.project.bind(this),
      unproject: this.unproject.bind(this),
    }

    // fill with background
    ctx.fillStyle = this.options.backgroundColor ?? 'lime';
    ctx.fillRect(0, 0, width, height);

    // render layers
    for(const layer of this.layers) {
      ctx.setTransform(transform);
      layer.render(renderContext);
    }

    ctx.setTransform(transform);

    // render bounds
    const bounds = this.project([81920, 114688])
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, -bounds[0], -bounds[1]);

    ctx.resetTransform();

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

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.render();
  }

  zoomIn(delta = 1) {
    this.zoom = this.options.maxZoom ? Math.min(this.options.maxZoom, this.zoom + delta) : this.zoom + delta;
    this.render();
  }

  zoomOut(delta = 1) {
    this.zoom = this.options.minZoom ? Math.max(this.options.minZoom, this.zoom - delta) : this.zoom - delta;
    this.render();
  }
}
