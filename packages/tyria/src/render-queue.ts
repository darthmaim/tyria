export type RenderQueuePriority = 'next-frame' | 'low-priority';

export class RenderQueue {
  #render: () => void;
  #renderQueued: false | RenderQueuePriority = false;
  #renderQueueFrame?: number;
  #renderQueueTimeout?: number;

  constructor(render: () => void) {
    this.#render = render;
  }

  queue(priority: RenderQueuePriority = 'next-frame') {
    // don't queue if it is already queued with same or higher priority
    if(this.#renderQueued === priority || this.#renderQueued === 'next-frame') {
      return;
    }

    if(priority === 'next-frame') {
      // cancel low priority request if we get a high priority one
      if(this.#renderQueued === 'low-priority') {
        clearTimeout(this.#renderQueueTimeout);
      }

      // request render in next animation frame
      this.#renderQueueFrame = requestAnimationFrame(() => {
        this.#renderQueueFrame = undefined;
        this.#render();
      });
    } else {
      // render in 80ms (5 frames at ~60fps), so we can collect some more queueRenders until then (for example from image loading promises resolving)
      this.#renderQueueTimeout = setTimeout(() => {
        this.#renderQueueTimeout = undefined;
        this.#render();
      }, 80);
    }

    // store that render is already queued so we don't queue twice
    this.#renderQueued = priority;
  }

  cancel() {
    this.#renderQueued = false;

    // and cancel pending renders
    if(this.#renderQueueFrame !== undefined) {
      cancelAnimationFrame(this.#renderQueueFrame);
      this.#renderQueueFrame = undefined;
    }
    if(this.#renderQueueTimeout !== undefined) {
      clearTimeout(this.#renderQueueTimeout);
      this.#renderQueueTimeout = undefined;
    }
  }
}
