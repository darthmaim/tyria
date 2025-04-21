export type RenderQueuePriority = 'next-frame' | 'low-priority';

export type RenderReason = 'render' | 'ease';

export class RenderQueue {
  #render: (reason: RenderReason) => void;
  #renderQueued: false | RenderQueuePriority = false;
  #renderQueueFrame?: number;
  #renderQueueTimeout?: number;
  #reason: RenderReason;

  constructor(render: () => void) {
    this.#render = render;
  }

  queue(priority: RenderQueuePriority = 'next-frame', reason: RenderReason = 'render') {
    // don't queue if it is already queued with same or higher priority
    if(this.#renderQueued === priority || this.#renderQueued === 'next-frame') {
      return;
    }

    this.#reason = reason;

    if(priority === 'next-frame') {
      // cancel low priority request if we get a high priority one
      if(this.#renderQueued === 'low-priority') {
        clearTimeout(this.#renderQueueTimeout);
      }

      // request render in next animation frame
      this.#renderQueueFrame = requestAnimationFrame(() => {
        this.#renderQueueFrame = undefined;
        this.#render(this.#reason);
      });
    } else {
      // render in 80ms (5 frames at ~60fps), so we can collect some more queueRenders until then (for example from image loading promises resolving)
      this.#renderQueueTimeout = window.setTimeout(() => {
        this.#renderQueueTimeout = undefined;
        this.#render(this.#reason);
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
