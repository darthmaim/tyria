import { Layer, LayerPreloadContext, LayerRenderContext } from "./layer";
import { Bounds, Point } from "./types";
import { add, divide, multiply, subtract } from "./util";

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

export interface TileLayerOptions {
  source: (x: number, y: number, zoom: number) => string;
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: Bounds;
}

export class TileLayer implements Layer {
  private frameBuffer: HTMLCanvasElement | OffscreenCanvas;

  constructor(private options: TileLayerOptions) {
    // don't use OffscreenCanvas in firefox because it is really fucking slow (canvas.drawImage(OffscreenCanvas) takes 50ms if FF, createElement('canvas') "just" 5ms)
    // but the same in chrome is fast (OffscreenCanvas 0.2ms, createElement('canvas') 0.8ms)
    this.frameBuffer = isFirefox
      ? document.createElement('canvas')
      : new OffscreenCanvas(0, 0);
  }

  getTiles({ state, project }) {
    // get the zoom level of tiles to use (prefer higher resolution)
    const zoom = Math.ceil(state.zoom);

    // the size of the tiles we are loading
    const tileSize = this.options.tileSize ?? 256;

    // get the rendered size of a tile
    // if we are at a integer zoom level, just use tileSize
    // otherwise, we need to scale the size of the tile correctly
    const renderedTileSize = state.zoom % 1 === 0 ? tileSize : 0.5 * (2 ** (state.zoom % 1)) * tileSize;

    if(renderedTileSize < tileSize / 2) {
      throw new Error('Wrong tile size')
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
    const tileTopLeft: Point = [Math.floor(topLeftX / renderedTileSize), Math.floor(topLeftY / renderedTileSize)];
    const tileBottomRight: Point = [Math.floor(bottomRightX / renderedTileSize), Math.floor(bottomRightY / renderedTileSize)];

    return {
      tileSize,
      tileTopLeft,
      tileBottomRight,
      zoom,
      renderedTileSize,
    }
  }

  render({ context, state, project, getImage }: LayerRenderContext) {
    // get tiles in viewport
    const {
      tileSize,
      tileTopLeft,
      tileBottomRight,
      zoom,
      renderedTileSize
    } = this.getTiles({ state, project });

    // create buffer canvas to render
    const buffer = this.frameBuffer;

    // calculate required buffer size
    // TODO: make the buffer a little larger than required by the viewport so we preload tiles while panning
    const bufferWidth = (tileBottomRight[0] - tileTopLeft[0] + 1) * tileSize;
    const bufferHeight = (tileBottomRight[1] - tileTopLeft[1] + 1) * tileSize;

    // grow the buffer if it is not large enough
    // if it exceeds the required size by 2.2, shrink it to save some memory
    // 2.2 was chosen because it is often twice the size when switching to the next higher zoom level, and we don't want to resize then already
    if(buffer.width < bufferWidth || buffer.height < bufferHeight || buffer.width > bufferWidth * 2.2 || buffer.height > bufferHeight * 2.2) {
      buffer.width = bufferWidth;
      buffer.height = bufferHeight;
    }

    // get buffer context to draw to
    const bufferCtx = buffer.getContext('2d')!;

    // TODO:
    // if the zoom level did not change we can reuse the previous buffer
    // by shifting the current content of the buffer to the new offset
    // then we only need to render tiles that were not part of the buffer in the previous frame.
    // even if the zoom level changes we could scale the previous buffer, or just keep a buffer per zoom level

    const size = subtract(tileBottomRight, tileTopLeft);

    // iterate through all tiles in the viewport
    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {
        const distanceFromCenter = multiply(subtract(divide(subtract([x, y], tileTopLeft), size), 0.5), 2);
        const distance = (Math.abs(distanceFromCenter[0]) + Math.abs(distanceFromCenter[1])) / 2;

        // try to get the tile from the cache
        const src = this.options.source(x, y, zoom);
        const tile = getImage(src, { priority: 2 - distance });

        if(tile) {
          // draw tile
          bufferCtx.drawImage(tile, (x - tileTopLeft[0]) * tileSize, (y - tileTopLeft[1]) * tileSize, tileSize, tileSize);
          bufferCtx.strokeStyle = 'orange';
        } else {
          // render fallback
          const fallback = this.getFallbackTile(getImage, x, y, zoom);

          if(fallback) {
            bufferCtx.drawImage(
              fallback.image,
              fallback.x * tileSize, fallback.y * tileSize, fallback.scale * tileSize, fallback.scale * tileSize,
              (x - tileTopLeft[0]) * tileSize, (y - tileTopLeft[1]) * tileSize, tileSize, tileSize
            );

            bufferCtx.fillStyle = '#0000ff33';
          } else {
            bufferCtx.fillStyle = '#220000';
          }

          if(state.debug) {
            bufferCtx.fillRect((x - tileTopLeft[0]) * tileSize, (y - tileTopLeft[1]) * tileSize, tileSize, tileSize);
          }
        }
      }
    }

    // draw the buffer to the actual canvas
    context.drawImage(
      buffer,
      0, 0, bufferWidth, bufferHeight,
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
    }
  }

  private getFallbackTile(getImage: LayerRenderContext['getImage'], x, y, zoom, scale = 1): { x: number, y: number, scale, image: ImageBitmap | HTMLImageElement } | undefined {
    if(zoom === 0) {
      return;
    }

    const fallbackX = x / 2;
    const fallbackY = y / 2;

    const src = this.options.source(Math.floor(fallbackX), Math.floor(fallbackY), zoom - 1);
    const image = getImage(src, { cacheOnly: true });

    if(image) {
      return { image, scale: scale * 0.5, x: fallbackX % 1, y: fallbackY % 1 };
    }

    return this.getFallbackTile(getImage, fallbackX, fallbackY, zoom - 1, scale * 0.5)
  }

  renderDebugGrid(context: CanvasRenderingContext2D, x: number, y: number, zoom: number, width: number, height: number) {
    const lineWidth = 4;

    context.lineWidth = lineWidth;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.font = 'bold 16px monospace'
    context.strokeStyle = (x + y) % 2 === 0 ? '#f4433633' : '#2196f333';
    context.fillStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';

    context.strokeRect(x * width + (lineWidth / 2), y * height + (lineWidth / 2), width - lineWidth, height - lineWidth);
    context.fillText(`${x}, ${y}, ${zoom}`, (x * width + width / 2), (y * height + height / 2));
  }

  preload(context: LayerPreloadContext) {
    const {
      tileTopLeft,
      tileBottomRight,
      zoom
    } = this.getTiles(context);

    const size = subtract(tileBottomRight, add(tileTopLeft, 1))

    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {
        // distance from the center (-1...1)
        const distanceFromCenter = multiply(subtract(divide(subtract([x, y], tileTopLeft), size), 0.5), 2);
        const distance = (Math.abs(distanceFromCenter[0]) + Math.abs(distanceFromCenter[1])) / 2;

        const src = this.options.source(x, y, zoom);
        context.getImage(src, { priority: 3 - distance });
      }
    }
  }
}
