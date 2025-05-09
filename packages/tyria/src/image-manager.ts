import { Tyria } from "./Tyria";

interface CacheEntry {
  image?: ImageBitmap;
  lastUsed: number;
  priority: number;
}

interface QueueEntry {
  src: string,
  priority: number;
}

export interface ImageGetOptions {
  /** Priority of the image, higher priorities are loaded first. */
  priority?: number,

  /** Only get this image from cache, don't fetch from network. */
  cacheOnly?: boolean,

  /** Call the layers preloadImages function once this image is loaded. */
  preload?: boolean;
}

export class ImageManager {
  /** The cache of all loaded images */
  #cache: Map<string, CacheEntry> = new Map();

  /** List of images that have to be fetched and are not yet pushed to the worker. */
  #queue: QueueEntry[] = [];
  /** List of images that have to be fetched and might be already pushed to the worker */
  #queued: Set<string> = new Set();

  /** Timestamp of the last cache cleanup */
  #lastCleanup = 0;

  /** The worker used to fetch images in the background. */
  #worker: Worker;

  /** Images that should be reported as loaded once they are loaded. */
  #preloadQueue: Set<string> = new Set();

  /** Images that are preloaded but are not yet processed by the map */
  #recentlyPreloaded: { src: string, priority: number, image: ImageBitmap }[] = [];

  constructor(map: Tyria) {
    this.#worker = new Worker(new URL('./image-fetch-worker.js', import.meta.url));
    this.#worker.onmessage = (e) => {
      const entries = e.data as { src: string, priority: number, image: ImageBitmap | undefined }[];

      for(const entry of entries) {
        const { src, image } = entry;
        this.#cache.set(src, { image, priority: 0, lastUsed: performance.now() });
        this.#queued.delete(src);

        if(image) {
          this.#recentlyPreloaded.push(entry as any);
        }
      }

      map.queueRender('low-priority');
    }
  }

  #lastRender: number = 0;

  requestQueuedImages() {
    // if we have something to queue, post them to the worker to fetch them
    if(this.#queue.length > 0) {
      this.#worker.postMessage(this.#queue);
      this.#queue = [];
    }

    const now = performance.now();

    // cleanup the cache every second
    if(this.#lastCleanup + 1000 < now) {
      // iterate over all cache entries
      for(const [key, { lastUsed, image }] of this.#cache.entries()) {
        // evict images that were not used within the last 10s, unless they were used within 1s of last render
        if(lastUsed < now - 10000 && lastUsed < this.#lastRender - 1000) {
          this.#cache.delete(key);
          image?.close();
        }
      }

      this.#lastCleanup = now;
    }

    this.#lastRender = now;
  }

  get(src: string, { priority = 1, cacheOnly, preload }: ImageGetOptions = {}): ImageBitmap | undefined {
    const cached = this.#cache.get(src);

    if(cached) {
      cached.lastUsed = performance.now()
      return cached.image;
    }

    if(cacheOnly) {
      return;
    }

    const alreadyQueued = this.#queued.has(src);

    if(!alreadyQueued) {
      this.#queued.add(src);
      this.#queue.push({ src, priority });
    }

    if(preload) {
      this.#preloadQueue.add(src);
    }
  }

  getPreloaded() {
    const recentlyPreloaded = this.#recentlyPreloaded;
    this.#recentlyPreloaded = [];
    return recentlyPreloaded;
  }
}
