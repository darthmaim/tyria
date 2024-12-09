import { Tyria } from "../Tyria";
import { Point, ViewOptions } from "../types";
import { SupportedEvents } from "./manager";

export interface HandledEvent {
  view?: ViewOptions
  applyInertia?: boolean;
}

export type HandlerResponse = HandledEvent | undefined | void;

export type NativeEventNameFromSupportedEvent<E extends SupportedEvents> = E extends `window${infer event}` ? Lowercase<event> : E;

// type to make sure the Handler class implements all the supported events
export type EventHandler = {
  [t in SupportedEvents]: (e: WrappedEvent<HTMLElementEventMap[NativeEventNameFromSupportedEvent<t>]>) => HandlerResponse
}

export interface WrappedEvent<E extends Event> {
  nativeEvent: E;

  /** position in map coordinates */
  coordinate: E extends MouseEvent ? Point : never;
}

export abstract class Handler implements EventHandler {
  constructor(protected readonly map: Tyria) {}

  // empty base implementation for all events, to be overridden by child classes
  wheel(event: WrappedEvent<WheelEvent>): HandlerResponse {}
  pointerdown(event: WrappedEvent<PointerEvent>): HandlerResponse {}
  pointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {}
  pointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {}
  dblclick(event: WrappedEvent<MouseEvent>): HandlerResponse {}

  windowPointerup(event: WrappedEvent<PointerEvent>): HandlerResponse {}
  windowPointermove(event: WrappedEvent<PointerEvent>): HandlerResponse {}
}
