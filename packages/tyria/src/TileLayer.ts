import { Layer, LayerRenderContext } from "./layer";
import { Coordinate } from "./types";

export interface TileLayerOptions {
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
}

export class TileLayer implements Layer {
  constructor(private options: TileLayerOptions = {}) {}

  render({ context, state, project, unproject }: LayerRenderContext) {
    const tileSize = this.options.tileSize ?? 256;

    const lineWidth = 4;

    context.strokeStyle = 'red';
    context.lineWidth = lineWidth;
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.font = 'bold 16px sans-serif'

    const tileTopLeft = [Math.floor(state.visibleBounds[0][0] / tileSize), Math.floor(state.visibleBounds[0][1] / tileSize)];
    const tileBottomRight = [Math.floor(state.visibleBounds[1][0] / tileSize), Math.floor(state.visibleBounds[1][1] / tileSize)];

    for(let x = tileTopLeft[0]; x <= tileBottomRight[0]; x++) {
      for(let y = tileTopLeft[1]; y <= tileBottomRight[1]; y++) {
        context.strokeStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';
        context.fillStyle = (x + y) % 2 === 0 ? '#f44336' : '#2196f3';
        context.strokeRect(x * tileSize + (lineWidth / 2), y * tileSize + (lineWidth / 2), tileSize - lineWidth, tileSize - lineWidth);
        context.fillText(`${x}, ${y}, ${state.zoom}`, (x + 0.5) * tileSize, (y + 0.5) * tileSize + 16);
      }
    }

  }
}
