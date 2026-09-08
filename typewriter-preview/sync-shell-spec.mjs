import fs from 'node:fs';
const path = 'typewriter-preview/object-sculpt-spec.json';
const spec = JSON.parse(fs.readFileSync(path, 'utf8'));
const revertedIds = new Set(['keyboardFrontHousing', 'keyboardSideLeft', 'keyboardSideRight', 'keyboardLowerApron', 'shellLowerFront', 'keyboardSupportApron']);
spec.componentTree = (spec.componentTree || []).filter(component => !revertedIds.has(component.id));
spec.componentTree.push({
  id: 'keyboardSupportApron',
  name: 'keyboard support apron',
  level: 'meso',
  role: 'low continuous keyboard support',
  importance: 0.78,
  confidence: 0.9,
  primitive: 'box',
  topologyClass: 'assembled-solid',
  topologyRationale: 'A continuous lower-shell extension supports the forward keyboard silhouette without enclosing the keys.',
  parent: 'bodyShell',
  attachment: {
    parentSocket: 'shellLower-front',
    localStart: [0, 0.77, 2.325],
    localEnd: [0, 0.77, 3.575],
    contactType: 'overlap',
    embedDepth: 0.1,
    gapTolerance: 0.02
  },
  dimensions: { width: 6.35, height: 0.44, depth: 1.25, units: 'world', confidence: 0.9 },
  transform: { position: [0, 0.77, 2.95], rotation: [0, 0, 0], scale: [1, 1, 1] },
  actionProfile: {
    animationRole: 'keyboardSupportApron',
    pivot: { mode: 'local-origin', localPosition: [0, 0, 0], axis: [0, 1, 0], confidence: 0.9 },
    transformChannels: { translate: true, rotate: true, scale: true, bend: false, twist: false, detach: false, visibility: true, materialState: true },
    sockets: [],
    collider: { type: 'box', offset: [0, 0, 0], scale: [1, 1, 1], isTrigger: false, notes: 'simplified apron proxy' },
    constraints: [],
    destruction: { breakable: false, fractureGroup: 'bodyShell', seamRefs: [], detachableFragments: [], breakImpulse: 0, debrisMaterial: 'shell' }
  },
  material: 'shell',
  materialLayers: ['shell'],
  geometryDescriptor: {
    topologyIntent: 'low rounded apron with a continuous front edge',
    edgeTreatment: { type: 'bevel', bevelRadius: 0.18, segments: 4 },
    deformationStack: [],
    uvStrategy: 'generated procedural coordinates',
    normalStrategy: 'vertex normals from generated geometry'
  },
  localFeatures: [{ id: 'keyboard-cradle', description: 'Front extension supports the keyboard while leaving all keys visible.', evidenceRefs: ['full-object'] }],
  evidenceRefs: ['full-object'],
  fidelityTier: 'form-refinement',
  colorMaterialRecipe: {
    dominantAlbedo: 'rgba(118,164,139,1)',
    secondaryAlbedo: 'rgba(157,194,166,1)',
    materialClass: 'plastic',
    materialClassConfidence: 0.9,
    evidenceRefs: ['full-object']
  }
});
fs.writeFileSync(path, JSON.stringify(spec, null, 2));
console.log('synced keyboard support apron');
