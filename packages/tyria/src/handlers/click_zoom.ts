import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class ClickZoomHandler extends Handler {
  dblclick(event: WrappedEvent<MouseEvent>): HandlerResponse {
    this.map.easeTo({
      zoom: this.map.view.zoom + (event.nativeEvent.shiftKey ? -1 : 1),
      around: event.coordinate
    }, { duration: 500 });

    // TODO: allow returning easeTo
    return {};
  }
}
