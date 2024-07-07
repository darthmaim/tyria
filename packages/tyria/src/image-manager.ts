import { Tyria } from "./Tyria";

interface CacheEntry {
  image?: ImageBitmap;
  lastUsed: number;
}

interface QueueEntry {
  src: string,
  priority: number;
}

export class ImageManager {
  private cache: Map<string, CacheEntry> = new Map();

  private queue: QueueEntry[] = [];
  private queued: Set<string> = new Set();
  private lastCleanup = 0;

  private worker: Worker;

  constructor(private map: Tyria) {
    this.worker = new Worker(new URL('./image-fetch-worker.mjs', import.meta.url));

    this.worker.onmessage = (e) => {
      const entries = e.data as { src: string, image: ImageBitmap }[];

      for(const { src, image } of entries) {
        this.cache.set(src, { image, lastUsed: performance.now() });
        this.queued.delete(src);
      }

      map.queueRender('low-priority');
    }
  }

  requestQueuedImages() {
    // if we have something to queue, post them to the worker to fetch them
    if(this.queue.length > 0) {
      this.worker.postMessage(this.queue);
      this.queue = [];
    }

    const now = performance.now();

    // cleanup the cache every second
    if(this.lastCleanup + 1000 < now) {
      // iterate over all cache entries
      for(const [key, { lastUsed }] of this.cache.entries()) {
        // evict images that were not used within the last 10s
        if(lastUsed < now - 10000) {
          this.cache.delete(key);
        }
      }

      this.lastCleanup = now;
    }
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

    const alreadyQueued = this.queued.has(src);

    if(!alreadyQueued) {
      this.queued.add(src);
      this.queue.push({ src, priority });
    }
  }
}
