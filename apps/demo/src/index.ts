import { Tyria, TileLayer, MarkerLayer } from 'tyria';

const map = new Tyria(document.getElementById('map')!, {
  backgroundColor: '#051626',
  maxZoom: 7,
  minZoom: 1,
  zoomSnap: .5,
  // padding: 80,
  bounds: [[0, 0], [81920, 114688]],
  padding: { top: 16, bottom: 80, left: 16, right: 80 },
});

map.addLayer(new TileLayer({
  source: (x, y, z) => `https://tiles.gw2.io/1/1/${z}/${x}/${y}.jpg`,
  bounds: [[0, 0], [81920, 114688]],
}));

const markers = new MarkerLayer({
  icon: 'https://render.guildwars2.com/file/32633AF8ADEA696A1EF56D3AE32D617B10D3AC57/157353.png',
  iconSize: [32, 32],
  minZoom: 3,
});
map.addLayer(markers)

const waypoints = new Map();

fetch('https://api.guildwars2.com/v2/continents/1/floors/1').then((r) => r.json()).then((data) => {
  // @ts-expect-error test
  const wps = Object.values(data.regions ?? []).flatMap((region) => Object.values(region.maps ?? {}).flatMap((map) => Object.values(map.points_of_interest ?? {}).filter((poi) => poi.type === 'waypoint').map((poi) => ({ ...poi, map }))));
  wps.forEach((wp) => waypoints.set(wp.id, wp));
  markers.add(...wps.map((wp) => ({
    id: wp.id,
    position: wp.coord,
  })))
});

map.jumpTo({ center: [49432, 31440], zoom: 2.5 });
map.easeTo({ zoom: 3 }, { duration: 2000, easing: (x) => 1 - Math.pow(1 - x, 3) });

map.addEventListener('marker.over', (e) => document.getElementById('over')!.innerText = waypoints.get(e.markerId).name);
map.addEventListener('marker.leave', () => document.getElementById('over')!.innerText = '');
map.addEventListener('marker.click', (e) => {
  const wp = waypoints.get(e.markerId);
  console.log(wp);
  map.easeTo({ contain: wp.map.continent_rect })
});

// @ts-expect-error test
document.getElementById('debug')!.addEventListener('change', (e) => map.setDebug(e.target.checked));

document.getElementById('lionsarch')!.addEventListener('click', () => map.easeTo({ contain: [[48130, 30720], [50430, 32250]] }))
document.getElementById('lionsarch2')!.addEventListener('click', () => map.easeTo({ contain: [[48130, 30720], [50430, 32250]], padding: { top: 16, bottom: 80, left: 1000, right: 80 } }))
document.getElementById('ascalon')!.addEventListener('click', () => map.easeTo({ contain: [[56682, 24700], [64500, 35800]], zoom: 3 }))
document.getElementById('horn')!.addEventListener('click', () => map.easeTo({ contain: [[19328, 19048], [27296, 24800]] }))
document.getElementById('cantha')!.addEventListener('click', () => map.easeTo({ contain: [[20576, 97840], [39056, 106256]] }))

// @ts-expect-error debug
window.map = map;
