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

  private frameBuffer: HTMLCanvasElement;

  constructor(private options: TileLayerOptions) {
    this.frameBuffer = document.createElement('canvas');
    this.frameBuffer.setAttribute('style', 'width: 256px; position: fixed; top: 16px; right: 16px; border: 4px solid #fff; box-shadow: 0 0 4px rgba(0 0 0 / .4)')
    document.body.append(this.frameBuffer);
  }

  render({ context, state, project, registerPromise }: LayerRenderContext) {
    // get the zoom level of tiles to use (prefer higher resolution)
    const zoom = Math.ceil(state.zoom);

    // the size of the tiles we are loading
    const tileSize = this.options.tileSize ?? 256;

    // get the rendered size of a tile
    // if we are at a integer zoom level, just use tileSize
    // otherwise, we need to scale the size of the tile correctly
    const renderedTileSize = state.zoom % 1 === 0 ? tileSize : 0.5 * (2 ** (state.zoom % 1)) * tileSize;

    if(renderedTileSize < tileSize / 2) {
      // something is messed up, skip render to not use unnecessary performance
      return;
    }

    const center = project(state.center);

    // get the bounds (px) in which we render
    const boundsTopLeft = project(this.options.bounds?.[0] ?? [0, 0]);
    const boundsBottomRight = project(this.options.bounds?.[1] ?? [0, 0]);

    // get the top left position (px)
    const topLeftX = Math.max(-center[0] - state.width / 2, boundsTopLeft[0]);
    const topLeftY = Math.max(-center[1] - state.height / 2, boundsTopLeft[1]);

    // get the top right position (px)
    const bottomRightX = Math.min(-center[0] + state.width / 2, -boundsBottomRight[0]) - 1;
    const bottomRightY = Math.min(-center[1] + state.height / 2, -boundsBottomRight[1]) - 1;

    // convert px position to tiles
    const tileTopLeft = [Math.floor(topLeftX / renderedTileSize), Math.floor(topLeftY / renderedTileSize)];
    const tileBottomRight = [Math.floor(bottomRightX / renderedTileSize), Math.floor(bottomRightY / renderedTileSize)];


    // create buffer canvas to render
    // const buffer = new OffscreenCanvas((tileBottomRight[0] - tileTopLeft[0]) * tileSize, (tileBottomRight[1] - tileTopLeft[1]) * tileSize);
    const buffer = this.frameBuffer;
    buffer.width = (tileBottomRight[0] - tileTopLeft[0] + 1) * tileSize;
    buffer.height = (tileBottomRight[1] - tileTopLeft[1] + 1) * tileSize;
    buffer.style.aspectRatio = `${buffer.width} / ${buffer.height}`;
    const bufferCtx = buffer.getContext('2d')!;


    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {

        const tileCacheKey = `${x},${y},${zoom}` as const;
        const tile = this.tileCache[tileCacheKey];

        if(tile === undefined) {
          // load tile
          const fetchPromise = fetch(this.options.source(x, y, zoom), { headers: { 'accept': 'image/*' } }).then((response) => {
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
          bufferCtx.drawImage(tile.image, (x - tileTopLeft[0]) * tileSize, (y - tileTopLeft[1]) * tileSize, tileSize, tileSize);
          bufferCtx.strokeStyle = 'orange';
        } else if(tile?.state === 'error') {
          // tile loading errored...
          context.beginPath();
          context.rect(x * renderedTileSize, y * renderedTileSize, renderedTileSize, renderedTileSize);
          context.moveTo(x * renderedTileSize, y * renderedTileSize);
          context.lineTo(x * renderedTileSize + renderedTileSize - 1, y * renderedTileSize + renderedTileSize - 1);
          context.strokeStyle = 'red';
          context.lineWidth = 1;
          context.stroke();
        } else {
          // render fallback
          const fallback = this.getFallbackTile(x, y, zoom);

          if(fallback) {
            bufferCtx.drawImage(
              fallback.image,
              fallback.x * tileSize, fallback.y * tileSize, fallback.scale * tileSize, fallback.scale * tileSize,
              (x - tileTopLeft[0]) * tileSize, (y - tileTopLeft[1]) * tileSize, tileSize, tileSize
            );
          }
        }
      }
    }

    // draw the buffer to the actual canvas
    context.drawImage(
      buffer,
      tileTopLeft[0] * renderedTileSize,
      tileTopLeft[1] * renderedTileSize,
      (tileBottomRight[0] - tileTopLeft[0] + 1) * renderedTileSize,
      (tileBottomRight[1] - tileTopLeft[1] + 1) * renderedTileSize);

    if(state.debug) {
      context.save();
      for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
        for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {
          this.renderDebugGrid(context, x, y, zoom, renderedTileSize, renderedTileSize);
        }
      }
      context.restore();

      // visible box
      context.strokeStyle = '#ffc107';
      context.lineWidth = 2;
      context.setLineDash([8, 8]);
      context.strokeRect(topLeftX, topLeftY, bottomRightX - topLeftX + 1, bottomRightY - topLeftY + 1);
      context.setLineDash([]);

      // tile size
      context.font = 'bold 12px monospace';
      context.fillStyle = '#fff';
      context.fillText(`TileSize: ${tileSize} @ ${renderedTileSize}`, topLeftX + 8, topLeftY + 8);
      context.fillText(`ViewBox: x ${topLeftX}`, topLeftX + 8, topLeftY + 8 + 16);
      context.fillText(`         y ${topLeftY}`, topLeftX + 8, topLeftY + 8 + 32);
      context.fillText(`         w ${bottomRightX - topLeftX + 1}`, topLeftX + 8, topLeftY + 8 + 48);
      context.fillText(`         h ${bottomRightY - topLeftY + 1}`, topLeftX + 8, topLeftY + 8 + 64);

      // center
      context.fillStyle = 'pink';
      context.fillRect(-center[0] - 4, -center[1] - 4, 8, 8);
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
    const lineWidth = 4;

    context.lineWidth = lineWidth;
    context.textAlign = 'center';
    context.font = 'bold 16px monospace'
    context.strokeStyle = (x + y) % 2 === 0 ? '#f4433633' : '#2196f333';
    context.fillStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';

    context.strokeRect(x * width + (lineWidth / 2), y * height + (lineWidth / 2), width - lineWidth, height - lineWidth);
    context.fillText(`${x}, ${y}, ${zoom}`, (x * width + width / 2), (y * height + height / 2));
  }
}
