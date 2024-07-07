# 🗺️ Tyria

**Tyria** is a fast, interactive, canvas-based map renderer for the web focused on custom raster tiles.

## Installation

Tyria is not yet released on any package manager. Watch this repository to be notified of the first release.


## Usage

Create a new map instance and pass it the element in which it should render. This should be a `div` with the correct width and height already set and `position: relative`.

```ts
const map = new Tyria(document.getElementById('map'), options);
```

### Options

You can pass these options to the `Tyria` constructor:

```ts
export interface TyriaMapOptions {
  /** Background color of the map */
  backgroundColor?: string;

  /** The minimum zoom layer */
  minZoom?: number;

  /** The maximum zoom layer */
  maxZoom?: number;

  /**
   * The native zoom layer (layer at which 1px = 1map unit)
   * @defaultValue `maxZoom`
   */
  nativeZoom?: number;

  /** Snap zoom levels to a multiple of this value. */
  zoomSnap?: number;
}
```

### Tiles

Create a new `TileLayer` and add it to the map.

```ts
map.addLayer(new TileLayer({
  source: (x, y, z) => `https://tiles.gw2.io/1/1/${z}/${x}/${y}.jpg`,
  bounds: [[0, 0], [81920, 114688]],
}));
```

### Controlling the map

| Method | Description |
|---|---|
| `jumpTo(view)` | Sets the map to the specified [`view`](#view). |
| `easeTo(view, easeOptions)` | Transitions the map to the specified [`view`](#view). Additionally allows to set the `duration` and `easing` function to use. |


#### View

```ts
export type ViewOptions = {
  /** Sets the center of the map */
  center?: Point;

  /** Sets the zoom level of the map */
  zoom?: number;

  /** Keeps a point of the map at a static position when changing zoom */
  around?: Point;

  /** Makes sure the viewport contains the whole area. */
  contain?: Bounds;

  /** Makes sure the viewport is completely within this area. */
  cover?: Bounds;
}
```

### Example

See this example live on https://darthmaim.github.io/tyria/. 

```ts
// create a new map instance in the element with the id `map`
const map = new Tyria(document.getElementById('map'), {
  backgroundColor: '#051626',
  maxZoom: 7,
  minZoom: 1,
  zoomSnap: .5,
});

// add tiles from Guild Wars 2
map.addLayer(new TileLayer({
  source: (x, y, z) => `https://tiles.gw2.io/1/1/${z}/${x}/${y}.jpg`,
  bounds: [[0, 0], [81920, 114688]],
}));

// set the initial view
map.jumpTo({ center: [49432, 31440], zoom: 2.5 });

// add an animation to zoom level 3 over 2 seconds with a cubic-ease-out easing
map.easeTo({ zoom: 3 }, {
  duration: 2000,
  easing: (x) => 1 - Math.pow(1 - x, 3)
});
```


## License
**Tyria** is licensed under the [MIT License](LICENSE).
