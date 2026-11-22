/* Builds data/world.js (country shapes + names, capitals, continents, flags).
   Run from a folder that has these npm packages installed:
     npm i world-atlas@2 topojson-client@3 i18n-iso-countries@7 countries-list@3
     node /path/to/tools/build-world.cjs /path/to/data/world.js
   Sources: Natural Earth via world-atlas (public domain / ISC),
            countries-list (MIT), i18n-iso-countries (MIT). */
const fs = require('fs');
const topo = require('topojson-client');
const iso = require('i18n-iso-countries');
const { countries, getEmojiFlag } = require('countries-list');
const world = require('world-atlas/countries-50m.json');
const small = require('world-atlas/countries-110m.json');
// Use the lighter 1:110m shapes where a country has one, else 1:50m (small countries).
const light = new Map(topo.feature(small, small.objects.countries).features.filter(f => f.id).map(f => [f.id, f]));

const out = process.argv[2];
const fc = topo.feature(world, world.objects.countries);

// Friendlier names for kids where the data uses long official ones.
const NAMES = {
  US: 'United States', GB: 'United Kingdom', RU: 'Russia', KR: 'South Korea', KP: 'North Korea',
  CD: 'DR Congo', CG: 'Congo', IR: 'Iran', SY: 'Syria', LA: 'Laos', VN: 'Vietnam', TZ: 'Tanzania',
  BO: 'Bolivia', VE: 'Venezuela', MD: 'Moldova', BN: 'Brunei', CZ: 'Czechia', PS: 'Palestine',
  MK: 'North Macedonia', CI: 'Ivory Coast', TW: 'Taiwan', VA: 'Vatican City', FM: 'Micronesia',
};

const round = n => Math.round(n * 10) / 10;
function simplify(ring) {
  const r = [];
  for (const [x, y] of ring) {
    const p = [round(x), round(y)];
    const last = r[r.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) r.push(p);
  }
  return r.length >= 4 ? r : null;
}

const list = [];
for (let f of fc.features) {
  const a2 = f.id ? iso.numericToAlpha2(f.id) : null;
  const info = a2 && countries[a2];
  if (!info || a2 === 'AQ') continue; // skip Antarctica and shapes with no country code
  if (light.has(f.id)) f = light.get(f.id);
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const shapes = polys.map(p => p.map(simplify).filter(Boolean)).filter(p => p.length);
  if (!shapes.length) continue;
  list.push({
    id: a2,
    name: NAMES[a2] || info.name,
    cont: info.continent,
    capital: info.capital || '',
    flag: getEmojiFlag(a2),
    shape: shapes,
  });
}
list.sort((a, b) => a.name.localeCompare(b.name));

const js = `/* World map data, made by tools/build-world.cjs. Do not edit by hand.
   Shapes: Natural Earth 1:110m (1:50m for small countries) (public domain), rounded to 0.1 degrees.
   Names, capitals, continents: countries-list (MIT). */
export const CONTINENTS = { AF: 'Africa', AS: 'Asia', EU: 'Europe', NA: 'North America', OC: 'Oceania', SA: 'South America' };
export const COUNTRIES = ${JSON.stringify(list)};
`;
fs.writeFileSync(out, js);
console.log(list.length, 'countries,', (js.length / 1024).toFixed(0), 'KB');
