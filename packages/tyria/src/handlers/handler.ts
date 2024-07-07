import { Tyria } from "../Tyria";
import { ViewOptions } from "../types";
import { SupportedEvents } from "./manager";

export interface HandledEvent {
  view?: ViewOptions
  applyInertia?: boolean;
}

export type HandlerResponse = HandledEvent | undefined | void;

// type to make sure the Handler class implements all the supported events
export type EventHandler = {
  [t in SupportedEvents]: (e: HTMLElementEventMap[t]) => HandlerResponse
}

export abstract class Handler implements EventHandler {
  constructor(protected readonly map: Tyria) {}

  // empty base implementation for all events, to be overridden by child classes
  wheel(event: WheelEvent): HandlerResponse {}
  pointerdown(event: PointerEvent): HandlerResponse {}
  pointerup(event: PointerEvent): HandlerResponse {}
  pointermove(event: PointerEvent): HandlerResponse {}
}
