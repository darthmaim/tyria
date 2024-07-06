interface CacheEntry {
  image?: ImageBitmap;
  lastUsed: number;
}

interface QueueEntry {
  src: string,
  priority: number,
}

export class ImageManager {
  private cache: Map<string, CacheEntry> = new Map();
  private queue: QueueEntry[] = [];

  tick() {
    performance.mark('image-manager-tick-start');

    // check if there is still a tick queued
    if(this._tickFrame !== undefined) {
      cancelAnimationFrame(this._tickFrame);
    }

    // sort queue by priority
    this.queue.sort((a, b) => b.priority - a.priority);

    // one request queue a microtask that takes about .15ms
    // since we want to stay hit 120fps (~8ms/frame) time, we only want to queue at most ~25 requests (which is about 25 * .15ms = ~4ms, so we have another 4ms to render)
    const promises: Promise<any>[] = [];
    let maxRequest = 10;

    while(this.queue.length > 0 && maxRequest > 0) {
      const { src } = this.queue.shift()!;
      promises.push(this.fetch(src));
      maxRequest--;
    }

    if(this.queue.length > 0) {
      this.queueTick();
    }

    performance.mark('image-manager-tick-end');
    performance.measure('image-manager-tick', 'image-manager-tick-start', 'image-manager-tick-end');

    return Promise.all(promises);
  }

  private _tickFrame: number | undefined;
  private queueTick() {
    if(this._tickFrame !== undefined) {
      return;
    }

    this._tickFrame = requestAnimationFrame(() => {
      this._tickFrame = undefined;
      this.tick()
    });
  }

  get(src: string, { priority = 1, cacheOnly = false }: { priority?: number, cacheOnly?: boolean } = {}): ImageBitmap | undefined {
    const cached = this.cache.get(src);

    if(cached) {
      cached.lastUsed = performance.now()
      return cached.image;
    }

    if(cacheOnly) {
      return;
    }

    const alreadyQueued = this.queue.some((queued) => queued.src === src);

    if(!alreadyQueued) {
      this.queue.push({ src, priority });
    }
  }

  private fetch(src: string): Promise<any> {
    // add to cache so this src wont be queued again while decoding
    this.cache.set(src, { lastUsed: 0 });

    // return new Promise((resolve) => {
    //   const image = new Image();
    //   image.src = src;
    //   image.decoding = 'async';

    //   image.decode().then(() => {
    //     this.cache.set(src, { image, lastUsed: 0 });
    //     resolve();
    //   }).catch((e) => {
    //     // this fails sometimes, but we still use the image
    //     this.cache.set(src, { image, lastUsed: 0 });
    //     resolve();
    //   });

    //   image.onerror = () => {
    //     this.cache.set(src, { lastUsed: 0 });
    //     resolve();
    //   }
    // });

    return fetch(src, { headers: { 'accept': 'image/*' }, credentials: 'omit' })
      .then((r) => r.clone().blob())
      .then((blob) => createImageBitmap(blob))
      .then((image) => this.cache.set(src, { image, lastUsed: 0 }))
  }
}
