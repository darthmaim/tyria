import { Layer } from "./layer";
import { Tyria } from "./Tyria"

interface TyriaEvent<Type extends TyriaEventType> {
  map: Tyria,
  type: Type,
}

interface MarkerEvent<Type extends TyriaEventType> extends TyriaEvent<Type> {
  layer: Layer,
  markerId: string,
}

export type TyriaEvents = {
  'test': TyriaEvent<'test'>,
  'marker.over': MarkerEvent<'marker.over'>,
  'marker.leave': MarkerEvent<'marker.leave'>,
  'marker.click': MarkerEvent<'marker.click'>,
}

export type TyriaEventType = keyof TyriaEvents;

export type TyriaEventListener<E extends TyriaEventType> = (event: TyriaEvents[E]) => void;

export class TyriaEventTarget {
  #eventListeners: { [type in TyriaEventType]: Set<TyriaEventListener<type>> } = {
    'test': new Set(),
    'marker.over': new Set(),
    'marker.leave': new Set(),
    'marker.click': new Set(),
  }

  addEventListener<E extends TyriaEventType>(type: E, listener: TyriaEventListener<E>) {
    if(this.#eventListeners[type] === undefined) {
      throw new Error('Unknown event type');
    }

    this.#eventListeners[type].add(listener);
  }

  removeEventListener<E extends TyriaEventType>(type: E, listener: TyriaEventListener<E>) {
    if(this.#eventListeners[type] === undefined) {
      throw new Error('Unknown event type');
    }

    this.#eventListeners[type]?.delete(listener);
  }

  dispatchEvent<E extends TyriaEventType>(event: TyriaEvents[E]) {
    if(this.#eventListeners[event.type] === undefined) {
      throw new Error('Unknown event type');
    }

    for(const listener of this.#eventListeners[event.type as E]) {
      listener(event);
    }
  }
}
