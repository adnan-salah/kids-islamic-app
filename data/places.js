/* =========================================================
   Places for the globe's "Find a place" game: continents, regions,
   oceans and seas.
   - Land places list their countries (ids from world.js). Tapping any
     of them counts.
   - Water places are rough boxes of longitude and latitude
     [west, east, south, north]. A tap on the sea is matched to the
     first box it falls in, so seas are listed before oceans.
   level: 1 = Little Stars and up, 2 = Explorers, 3 = Champions.
   clue: said after a wrong guess.
   ========================================================= */
const CONT = {
  AF: 'Africa', AS: 'Asia', EU: 'Europe', NA: 'North America', SA: 'South America', OC: 'Oceania',
};

export const PLACES = [
  // Continents (countries are filled in from world.js by continent)
  { id: 'AF', kind: 'continent', name: 'Africa', level: 1, emoji: '🦁', clue: 'Africa is the big continent below Europe, with the Sahara desert at the top.' },
  { id: 'AS', kind: 'continent', name: 'Asia', level: 1, emoji: '🐼', clue: 'Asia is the biggest continent. It is north of Australia, with China and India.' },
  { id: 'EU', kind: 'continent', name: 'Europe', level: 1, emoji: '🏰', clue: 'Europe is above Africa, across the Mediterranean Sea.' },
  { id: 'NA', kind: 'continent', name: 'North America', level: 1, emoji: '🦅', clue: 'North America is at the top of the Americas, with Canada and the United States.' },
  { id: 'SA', kind: 'continent', name: 'South America', level: 1, emoji: '🦜', clue: 'South America is below North America. Brazil is the biggest country there.' },
  { id: 'OC', kind: 'continent', name: 'Oceania', level: 1, emoji: '🦘', clue: 'Oceania is where we live! Look for Australia, in the south.' },
  // Regions
  { id: 'mideast', kind: 'region', name: 'the Middle East', level: 2, emoji: '🕋', countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'IQ', 'IR', 'JO', 'SY', 'LB', 'PS', 'IL', 'EG', 'TR', 'CY'], clue: 'The Middle East is where Africa, Asia and Europe meet. Makkah is there, in Saudi Arabia.' },
  { id: 'seasia', kind: 'region', name: 'Southeast Asia', level: 3, emoji: '🌴', countries: ['ID', 'MY', 'TH', 'VN', 'PH', 'SG', 'MM', 'KH', 'LA', 'BN', 'TL'], clue: 'Southeast Asia is just north of Australia. Indonesia and Malaysia are there.' },
  { id: 'scandi', kind: 'region', name: 'Scandinavia', level: 3, emoji: '❄️', countries: ['NO', 'SE', 'DK', 'FI', 'IS'], clue: 'Scandinavia is at the very top of Europe, where it is cold and snowy.' },
  { id: 'nafrica', kind: 'region', name: 'North Africa', level: 3, emoji: '🐪', countries: ['EG', 'LY', 'TN', 'DZ', 'MA', 'SD', 'EH'], clue: 'North Africa is the top of Africa, along the Mediterranean Sea.' },
  { id: 'camerica', kind: 'region', name: 'Central America', level: 3, emoji: '🌋', countries: ['GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA'], clue: 'Central America is the thin strip of land joining North and South America.' },
  // Seas (before oceans, so they match first)
  { id: 'black', kind: 'sea', name: 'the Black Sea', level: 3, emoji: '⚓', boxes: [[27.5, 42, 40.5, 47]], clue: 'The Black Sea is north of Turkey.' },
  { id: 'med', kind: 'sea', name: 'the Mediterranean Sea', level: 2, emoji: '⛵', boxes: [[-6, 36.5, 30, 46]], clue: 'The Mediterranean Sea is between Europe and Africa.' },
  { id: 'red', kind: 'sea', name: 'the Red Sea', level: 2, emoji: '🐠', boxes: [[32, 44, 12, 30]], clue: 'The Red Sea is the long thin sea between Africa and Saudi Arabia.' },
  { id: 'gulf', kind: 'sea', name: 'the Gulf', level: 9, boxes: [[47, 57, 23, 31]] },
  { id: 'arabian', kind: 'sea', name: 'the Arabian Sea', level: 3, emoji: '🌊', boxes: [[50, 77, 5, 25]], clue: 'The Arabian Sea is between Oman and India.' },
  { id: 'gmexico', kind: 'sea', name: 'the Gulf of Mexico', level: 9, boxes: [[-98, -81, 18, 31]] },
  { id: 'carib', kind: 'sea', name: 'the Caribbean Sea', level: 3, emoji: '🏝️', boxes: [[-88, -60, 9, 22]], clue: 'The Caribbean Sea is between North and South America, full of islands.' },
  { id: 'coral', kind: 'sea', name: 'the Coral Sea', level: 2, emoji: '🐢', boxes: [[145, 165, -30, -9]], clue: 'The Coral Sea is off Queensland, where the Great Barrier Reef is.' },
  { id: 'tasman', kind: 'sea', name: 'the Tasman Sea', level: 3, emoji: '🐋', boxes: [[147, 175, -47, -30]], clue: 'The Tasman Sea is between Australia and New Zealand.' },
  // Oceans
  { id: 'arctic', kind: 'ocean', name: 'the Arctic Ocean', level: 2, emoji: '🐻‍❄️', boxes: [[-180, 180, 66, 90]], clue: 'The Arctic Ocean is at the very top of the world, around the North Pole.' },
  { id: 'southern', kind: 'ocean', name: 'the Southern Ocean', level: 2, emoji: '🐧', boxes: [[-180, 180, -90, -60]], clue: 'The Southern Ocean is at the very bottom of the world, around Antarctica.' },
  { id: 'indian', kind: 'ocean', name: 'the Indian Ocean', level: 1, emoji: '🌊', boxes: [[20, 100, -60, 30], [100, 147, -60, -10]], clue: 'The Indian Ocean is between Africa and Australia.' },
  { id: 'atlantic', kind: 'ocean', name: 'the Atlantic Ocean', level: 1, emoji: '🚢', boxes: [[-70, 20, -60, 66], [-90, -70, 9, 66], [-100, -90, 18, 66]], clue: 'The Atlantic Ocean is between the Americas and Europe and Africa.' },
  { id: 'pacific', kind: 'ocean', name: 'the Pacific Ocean', level: 1, emoji: '🐳', boxes: [[100, 180, -60, 66], [-180, -70, -60, 66]], clue: 'The Pacific Ocean is the biggest ocean. It is on the east side of Australia.' },
];

/* Countries that sit in two continents also count for the other one. */
const ALSO = { EU: ['RU', 'TR', 'KZ', 'GE', 'AZ'], AS: ['EG', 'CY'] };

export function landOf(place, countries) {
  if (place.countries) return place.countries;
  if (place.kind === 'continent') return [...countries.filter(c => c.cont === place.id).map(c => c.id), ...(ALSO[place.id] || [])];
  return [];
}

/** Which sea or ocean a tap on the water is in. */
export function waterAt([lon, lat]) {
  return PLACES.find(p => p.boxes?.some(([w, e, s, n]) => lon >= w && lon <= e && lat >= s && lat <= n)) || null;
}

/* A sea also counts as part of its ocean. */
export const OCEAN_OF = { med: 'atlantic', black: 'atlantic', carib: 'atlantic', gmexico: 'atlantic', red: 'indian', arabian: 'indian', gulf: 'indian', coral: 'pacific', tasman: 'pacific' };

/* Where to turn the globe to show a water place: the middle of its first box. */
export const centreOfWater = p => {
  const [w, e, s, n] = p.id === 'pacific' ? [150, 210, -30, 20] : p.id === 'atlantic' ? [-45, -20, -10, 35] : p.id === 'indian' ? [60, 95, -35, -5] : p.boxes[0];
  return [((w + e) / 2 + 540) % 360 - 180, (s + n) / 2];
};

export { CONT };
