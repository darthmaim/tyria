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

  private worker: Worker;

  constructor(private map: Tyria) {
    this.worker = new Worker(new URL('./image-fetch-worker.mjs', import.meta.url));

    this.worker.onmessage = (e) => {
      const entries = e.data as { src: string, image: ImageBitmap }[];

      for(const { src, image } of entries) {
        this.cache.set(src, { image, lastUsed: 0 });
      }

      map.queueRender('low-priority');
    }
  }

  requestQueuedImages() {
    if(this.queue.length === 0) {
      return;
    }

    this.worker.postMessage(this.queue);
    this.queue = [];
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
