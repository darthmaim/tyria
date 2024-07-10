import { Handler, HandlerResponse, WrappedEvent } from "./handler";

export class ScrollZoomHandler extends Handler {
  wheel(event: WrappedEvent<WheelEvent>): HandlerResponse {
    const delta = 0.5 * Math.sign(event.nativeEvent.deltaY);

    this.map.easeTo({
      around: event.coordinate,
      zoom: this.map.view.zoom - delta
    }, {
      duration: 100,
      easing: (x) => Math.sin((x * Math.PI) / 2)
    })

    // return empty object to signal that the event was handled, because we are doing a custom easing here
    return {};
  }
}
