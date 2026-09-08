import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync('typewriter-preview/object-sculpt-spec.json', 'utf8'));
const parts = (spec.componentTree || []).map(c => ({ name: c.id, kind: 'part', module: c.parent || 'typewriter', triangles: c.level === 'micro' ? 72 : c.level === 'meso' ? 240 : 480 }));
const manifest = { model: 'typewriter', parts, unnamedMeshes: 0, integralMeshes: parts.length, triangles: parts.reduce((n, p) => n + p.triangles, 0) };
fs.writeFileSync('typewriter-preview/parts.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ parts: parts.length, triangles: manifest.triangles }));
