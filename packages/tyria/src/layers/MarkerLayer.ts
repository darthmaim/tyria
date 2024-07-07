import { Layer, LayerRenderContext } from "../layer";
import { Point } from "../types";

interface Marker {
  id: string,
  position: Point,
  icon?: string,
  iconSize?: Point;
}

export class MarkerLayer implements Layer {
  #markers: Marker[] = [];

  add(...marker: Marker[]) {
    this.#markers.push(...marker);
  }

  render(renderContext: LayerRenderContext) {
    for(const marker of this.#markers) {
      const position = renderContext.project(marker.position);

      const image = marker.icon ? renderContext.getImage(marker.icon) : undefined;

      if(image) {
        const size: Point = [image.width, image.height]
        renderContext.context.drawImage(image, position[0] - size[0] / 2, position[1] - size[1] / 2, size[0], size[1]);
      } else {
        renderContext.context.fillStyle = '#ff0000';
        renderContext.context.fillRect(position[0] - 4, position[1] - 4, 8, 8);
      }
    }
  }
}
