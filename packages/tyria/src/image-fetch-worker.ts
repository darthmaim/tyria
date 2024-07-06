interface ImageRequest {
  src: string;
  priority: number;
}

interface ImageResponse {
  src: string;
  image: ImageBitmap;
}

// limit the concurrency so that later requests with higher priority can still processed before earlier low priority ones
const MAX_CONCURRENCY = 20;

// keep track of how many requests are currently running
let runningRequests = 0;

// queue of images that still need to be requested
const queue: ImageRequest[] = []

// image requests that are finished. these are sent back in a batch in requestAnimationFrame
let ready: ImageResponse[] = [];

// handle incoming requests
globalThis.onmessage = (e) => {
  const images: ImageRequest[] = e.data;
  queue.push(...images);
  processQueue();
}

// process queue
function processQueue() {
  // sort queue by priority
  queue.sort((a, b) => b.priority - a.priority);

  while(queue.length > 0 && runningRequests < MAX_CONCURRENCY) {
    const { src } = queue.shift()!;
    runningRequests++;

    fetch(src, { headers: { 'accept': 'image/*' }, credentials: 'omit' })
      .then((r) => r.clone().blob())
      .then((blob) => createImageBitmap(blob))
      .then((image) => handleReady({ src, image }));
  }
}

function handleReady(image: ImageResponse) {
  runningRequests--;
  ready.push(image);

  if(respondFrame === undefined) {
    respondFrame = requestAnimationFrame(respond);
  }
}

let respondFrame: number | undefined;
function respond() {
  this.respondFrame = undefined;

  postMessage(ready);
  ready = [];

  if(queue.length > 0) {
    processQueue();
  }
}
