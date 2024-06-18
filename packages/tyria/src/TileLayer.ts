import { Layer, LayerRenderContext } from "./layer";
import { Bounds, Coordinate } from "./types";

export interface TileLayerOptions {
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: Bounds;
}

export class TileLayer implements Layer {
  constructor(private options: TileLayerOptions = {}) {}

  render({ context, state, project, unproject }: LayerRenderContext) {
    const tileSize = this.options.tileSize ?? 256;

    const lineWidth = 4 / (window.devicePixelRatio || 1);

    context.strokeStyle = 'red';
    context.lineWidth = lineWidth;
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.font = 'bold 16px sans-serif'

    const center = project(state.center);
    const tileTopLeft = [Math.floor((-center[0] - (state.width / 2)) / tileSize), Math.floor((-center[1] - (state.height / 2)) / tileSize)];
    const tileBottomRight = [Math.floor((-center[0] + (state.width / 2)) / tileSize), Math.floor((-center[1] + (state.height / 2)) / tileSize)];

    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {

        const img = document.querySelector(`img[data-x="${x}"][data-y="${y}"][data-z="${state.zoom}"]`) as HTMLImageElement;

        if(img) {
          context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
        }

        context.strokeStyle = (x + y) % 2 === 0 ? '#f4433633' : '#2196f333';
        context.fillStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';

        context.strokeRect(x * tileSize + (lineWidth / 2), y * tileSize + (lineWidth / 2), tileSize - lineWidth, tileSize - lineWidth);
        context.fillText(`${x}, ${y}, ${state.zoom}`, (x + 0.5) * tileSize, (y + 0.5) * tileSize + 16);
      }
    }

  }
}
