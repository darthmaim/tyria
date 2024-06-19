import { Layer, LayerRenderContext } from "./layer";
import { Bounds, Coordinate } from "./types";

export interface TileLayerOptions {
  source: (x: number, y: number, zoom: number) => string;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: Bounds;
}

export class TileLayer implements Layer {
  private tileCache: Record<`${number},${number},${number}`, { state: 'loading' | 'error' } | { state: 'done', image: ImageBitmap } | undefined> = {}

  constructor(private options: TileLayerOptions) {}

  render({ context, state, project, registerPromise }: LayerRenderContext) {
    const tileSize = this.options.tileSize ?? 256;

    const center = project(state.center);
    const boundsTopLeft = project(this.options.bounds?.[0] ?? [0, 0]);
    const boundsBottomRight = project(this.options.bounds?.[1] ?? [0, 0]);

    const topLeftX = Math.max(-center[0] - state.width / 2, boundsTopLeft[0]);
    const topLeftY = Math.max(-center[1] - state.height / 2, boundsTopLeft[1]);

    const bottomRightX = Math.min(-center[0] + state.width / 2, -boundsBottomRight[0] - 1);
    const bottomRightY = Math.min(-center[1] + state.width / 2, -boundsBottomRight[1] - 1);

    const tileTopLeft = [Math.floor(topLeftX / tileSize), Math.floor(topLeftY / tileSize)];
    const tileBottomRight = [Math.floor(bottomRightX / tileSize), Math.floor(bottomRightY / tileSize)];

    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {

        const tileCacheKey = `${x},${y},${state.zoom}` as const;
        const tile = this.tileCache[tileCacheKey];

        if(tile === undefined) {
          // load tile
          const fetchPromise = fetch(this.options.source(x, y, state.zoom), { headers: { 'accept': 'image/*' } }).then((response) => {
            if(response.ok) {
              return response.clone()
                .blob()
                .then((blob) => createImageBitmap(blob, { resizeHeight: tileSize, resizeWidth: tileSize }))
                .then((image) => this.tileCache[tileCacheKey] = { state: 'done', image });
            } else {
              this.tileCache[tileCacheKey] = { state: 'error' };
            }
          }).catch(() => this.tileCache[tileCacheKey] = { state: 'error' });

          registerPromise(fetchPromise);

          this.tileCache[tileCacheKey] = { state: 'loading' };
        }

        if(tile?.state === 'done') {
          // draw tile
          context.drawImage(tile.image, x * tileSize, y * tileSize, tileSize, tileSize);
        } else if(tile?.state === 'error') {
          // tile loading errored...
          context.beginPath();
          context.rect(x * tileSize, y * tileSize, tileSize, tileSize);
          context.moveTo(x * tileSize, y * tileSize);
          context.lineTo(x * tileSize + tileSize - 1, y * tileSize + tileSize - 1);
          context.strokeStyle = 'red';
          context.lineWidth = 1;
          context.stroke();
        } else {
          // render fallback
          const fallback = this.getFallbackTile(x, y, state.zoom);

          if(fallback) {
            context.drawImage(fallback.image, fallback.x * tileSize, fallback.y * tileSize, fallback.scale * tileSize, fallback.scale * tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
          }
        }

        this.renderDebugGrid(context, x, y, state.zoom, tileSize, tileSize);
      }
    }
  }

  private getFallbackTile(x, y, zoom, scale = 1): { x: number, y: number, scale, image: ImageBitmap } | undefined {
    if(zoom === 0) {
      return;
    }

    const fallbackX = x / 2;
    const fallbackY = y / 2;

    const cacheKey = `${Math.floor(fallbackX)},${Math.floor(fallbackY)},${zoom - 1}` as const;
    const cached = this.tileCache[cacheKey];

    if(cached?.state === 'done') {
      return { image: cached.image, scale: scale * 0.5, x: fallbackX % 1, y: fallbackY % 1 };
    }

    return this.getFallbackTile(fallbackX, fallbackY, zoom - 1, scale * 0.5)
  }

  renderDebugGrid(context: CanvasRenderingContext2D, x: number, y: number, zoom: number, width: number, height: number) {
    const lineWidth = 4 / (window.devicePixelRatio || 1);

    context.lineWidth = lineWidth;
    context.textAlign = 'center';
    context.font = 'bold 16px sans-serif'
    context.strokeStyle = (x + y) % 2 === 0 ? '#f4433633' : '#2196f333';
    context.fillStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';

    context.strokeRect(x * width + (lineWidth / 2), y * height + (lineWidth / 2), width - lineWidth, height - lineWidth);
    context.fillText(`${x}, ${y}, ${zoom}`, (x * width + width / 2), (y * height + height / 2));
  }
}
