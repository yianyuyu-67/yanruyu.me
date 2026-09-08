import fs from 'node:fs';
const path = 'typewriter-preview/object-sculpt-spec.json';
const spec = JSON.parse(fs.readFileSync(path, 'utf8'));
const rows = [
  [1.50, 3.12],
  [1.82, 2.66],
  [2.14, 2.28],
];
for (const c of spec.componentTree || []) {
  if (/^keyCap\d+$/.test(c.id)) {
    const i = Number(c.id.slice(6)) - 1;
    const row = Math.floor(i / 10), col = i % 10;
    c.transform.position = [-2.48 + col * 0.55, rows[row][0], rows[row][1]];
    c.details = ['individual square key', 'uniform spacing'];
  }
  if (/^keyRow\d+$/.test(c.id)) {
    const row = Number(c.id.slice(6)) - 1;
    c.transform.position = [0, rows[row][0], rows[row][1]];
    c.details = ['uniform key row', 'distinct height', 'front projection'];
  }
  if (c.id === 'spaceBar') {
    c.transform.position = [0, 1.24, 3.42];
    c.details = ['long blank key', 'front projection', 'offset from letter rows'];
  }
}
spec.repetitionSystems?.forEach(r => { if (r.id === 'keycap-grid') { r.distribution = 'three evenly spaced rows with ten independent square keys plus separate space bar'; r.spacing = { x: 0.55, y: 0.32, z: 0.42 }; } });
fs.writeFileSync(path, JSON.stringify(spec, null, 2));
console.log('synced keyboard positions');
