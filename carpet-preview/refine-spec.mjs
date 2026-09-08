import fs from 'node:fs';

const path = 'carpet-preview/object-sculpt-spec.json';
const spec = JSON.parse(fs.readFileSync(path, 'utf8'));
const evidence = 'full-object';

spec.targetName = 'Vintage Green Floral Carpet';
spec.targetId = 'carpet';
spec.sourceImage = 'carpet-preview/carpet-reference.png';
spec.suitability = 'pass';
spec.referenceCamera = { solved: false, fovDegrees: 40, aspect: 2 / 3, orientation: { yaw: 0, pitch: 0, roll: 0 }, positionHint: [0, 1.5, 4], note: 'Planar textile reference; exact camera is not required for the horizontal scene placement.' };
spec.scores = { object_isolation: 3, silhouette_readability: 3, depth_inference: 2, primitive_decomposition: 3, material_procedurality: 3, occlusion_risk: 1, interaction_fit: 3 };
spec.preSpecAssessment = {
  objectClass: { primaryType: 'rectangular woven carpet', primaryDomain: 'object', formLanguage: ['fabric-like', 'geometric', 'ornamental'], structureKind: ['layered shell', 'printed surface'], motionPotential: ['static prop', 'whole-object transform'], materialFamilies: ['cloth', 'fiber'], notes: 'Single high-resolution face reference with a separate scene-placement image.' },
  complexity: { tier: 'moderate', scores: { silhouetteComplexity: 1, componentCount: 3, hierarchyDepth: 2, repetitionDensity: 2, materialLayerCount: 2, localDetailDensity: 3, occlusionRisk: 1, actionReadinessNeed: 2 }, estimatedCounts: { macroComponents: 2, mesoComponents: 8, microFeatureGroups: 4, materialLayers: 2, repetitionSystems: 2 }, reasoning: ['Thin rectangular textile with repeated bilateral border, corner bouquets, terminal scrolls and a central medallion.'] },
  specDepthDecision: { requiredDepth: 'moderate', minimumComponentLevels: ['macro', 'meso', 'micro'], needsRepetitionSystems: true, needsMaterialLocalOverrides: true, needsMultipleReviewViews: true, needsActionReadyHierarchy: true, rationale: 'Patterned textile fidelity depends on named surface regions and a replaceable reference texture.' },
  detailInventory: { scanMethod: 'grid-3x3', targetMinDetails: 8, details: [
    ['outer-border', 'linework', 'Cream outer border with dark green inset edge', [0.03,0.03,0.94,0.94], 'geometry/material', 'carpetBorderOuter'],
    ['inner-border', 'linework', 'Thin cream inner border framing the field', [0.08,0.08,0.84,0.84], 'geometry/material', 'carpetBorderInner'],
    ['top-scroll', 'linework', 'Mirrored cream scroll ornament at the short-end top', [0.18,0.02,0.64,0.18], 'geometry/material', 'carpetTopOrnament'],
    ['bottom-scroll', 'linework', 'Mirrored cream scroll ornament at the short-end bottom', [0.18,0.80,0.64,0.18], 'geometry/material', 'carpetBottomOrnament'],
    ['corner-bouquets', 'linework', 'Four muted floral bouquets anchored into the corners', [0.03,0.03,0.94,0.94], 'geometry/material', 'carpetCornerFloralTL'],
    ['side-scrolls', 'linework', 'Vertical cream scroll links between corner bouquets', [0.02,0.20,0.16,0.60], 'geometry/material', 'carpetBorderInner'],
    ['central-medallion', 'linework', 'Large lobed cream medallion with layered flower and leaf motifs', [0.27,0.29,0.46,0.42], 'geometry/material', 'carpetCentralMedallion'],
    ['woven-variation', 'ridge', 'Low-contrast woven value breakup across the olive field', [0,0,1,1], 'material', 'woven-field']
  ].map(([id,kind,description,region,affects,ref]) => ({ id, kind, description, region: { x: region[0], y: region[1], width: region[2], height: region[3], units: 'normalized' }, scale: 'object-relative', affects, mapsTo: { type: ref === 'carpetFace' ? 'material.localOverrides' : 'component.localFeatures', ref }, evidenceRef: evidence, confidence: 0.86 })) },
  anatomy: { applies: false }, unknownsToResolveBeforeImplementation: []
};

spec.qualityContract = {
  qualityBar: 'moderate',
  definitionOfDone: ['Horizontal thin carpet seats flush on the floor, preserves the supplied floral pattern without stretching, and covers the chair-leg footprint shown in the placement reference.', 'All major pattern regions remain independently named for replacement and inspection.'],
  minimumSpecDepth: { macroComponents: 1, mesoComponents: 3, microFeatureGroups: 2, materialLayers: 2, repetitionSystems: 2, reviewViewpoints: 3 },
  featureGroups: [
    { id: 'silhouette', name: 'Rectangular textile silhouette', required: true, qualityCriteria: ['Thin 3:2 footprint with softly rounded edges and no visible floor penetration.'], evidenceRefs: [evidence], failureModes: ['carpet appears as a vertical card or floats above the floor'] },
    { id: 'pattern', name: 'Reference floral pattern', required: true, qualityCriteria: ['Outer and inner borders, four bouquets, terminal scrolls and central medallion remain legible and centered.'], evidenceRefs: [evidence], failureModes: ['pattern is stretched, mirrored or cropped'] },
    { id: 'placement', name: 'Floor and chair relation', required: true, qualityCriteria: ['Long edge runs along scene X and the footprint passes beneath the chair legs without blocking furniture interaction.'], evidenceRefs: ['placement-reference'], failureModes: ['carpet intersects base floor or misses chair-leg footprint'] }
  ],
  visualDeltaChecks: ['footprint aspect ratio', 'pattern orientation and border margins', 'central medallion scale', 'floor contact and chair-leg coverage'],
  antiShallowSpecRules: ['Use the supplied image for the patterned face instead of a flat substitute.', 'Keep backing and face as separate named parts.', 'Adjacent face/backing surfaces overlap by at least 0.02 scene units.']
};
spec.qualityTargets = { targetFidelity: 0.78, mustMatch: ['3:2 horizontal footprint', 'reference floral pattern and borders', 'floor contact below chair legs'], niceToHave: ['individual pile fibers', 'underside grip texture'], fpsTarget: 60, reviewViewpoints: ['top', 'three-quarter', 'side'] };
spec.coordinateFrame = { front: '+Z', up: '+Y', origin: 'base center', surface: 'floor-horizontal', units: 'scene' };
spec.silhouette = { boundingShape: 'thin rounded rectangular cuboid', aspectRatios: [1.5, 0.021, 1], symmetry: 'bilateral planar ornament', dominantCurves: ['rounded outer edge', 'central lobed medallion'], negativeSpaces: ['green field between border and medallion'], landmarks: ['double border', 'corner bouquets', 'central medallion'] };
spec.viewEvidence = [
  { id: 'full-object', view: 'primary', imageRegion: { x: 0, y: 0, width: 1, height: 1, units: 'normalized' }, observations: ['green woven field', 'double cream border', 'floral medallion', 'corner bouquets'], confidence: 0.92 },
  { id: 'placement-reference', view: 'scene-placement', imageRegion: { x: 0.12, y: 0.56, width: 0.55, height: 0.3, units: 'normalized' }, observations: ['horizontal carpet under chair legs in front of desk'], confidence: 0.9 }
];

const raw = JSON.parse(fs.readFileSync('carpet-preview/object-sculpt-spec.json', 'utf8'));
const template = raw.componentTree[0];
const clone = (id, parent, level, role, primitive, dims, material, localFeatures = [], position = [0, 0, 0]) => {
  const c = structuredClone(template);
  c.id = id; c.name = id; c.parent = parent; c.level = level; c.role = role; c.primitive = ['rounded-box','plane'].includes(primitive) ? 'box' : primitive; c.material = material; c.materialLayers = [material]; c.dimensions = { width: dims[0], height: dims[1], depth: dims[2], units: 'scene', confidence: 0.9 }; c.transform = { position, rotation: [0, 0, 0], scale: [1, 1, 1] }; c.actionProfile.animationRole = parent ? 'static-part' : 'assembly-root'; c.actionProfile.pivot = { mode: 'local', localPosition: [0,0,0], axis: [0,1,0], confidence: 0.9 }; c.actionProfile.collider = { type: 'box', offset: [0,0,0], scale: [1,1,1], isTrigger: true }; c.actionProfile.destruction = { breakable: false, fractureGroup: id, seamRefs: [], detachableFragments: [], breakImpulse: 0, debrisMaterial: material }; c.localFeatures = localFeatures; c.evidenceRefs = [evidence]; c.fidelityTier = 'material-pass'; c.colorMaterialRecipe = { dominantAlbedo: material === 'carpetFace' ? 'rgba(92,95,47,1)' : 'rgba(51,47,32,1)', secondaryAlbedo: material === 'carpetFace' ? 'rgba(232,217,183,1)' : 'rgba(74,72,40,1)', materialClass: 'fabric', materialClassConfidence: 0.86, colorGradient: { type: 'linear', stops: [{ position: 0, color: material === 'carpetFace' ? 'rgba(92,95,47,1)' : 'rgba(51,47,32,1)' }, { position: 1, color: material === 'carpetFace' ? 'rgba(74,79,33,1)' : 'rgba(74,72,40,1)' }] } };
  if (parent) c.attachment = { parentSocket: parent, localStart: position, localEnd: [position[0], position[1] + dims[1], position[2]], contactType: 'overlap', overlap: 0.03, gapTolerance: 0.02, evidenceRefs: [evidence] };
  c.surfaceDetail = { macroRoughness: 0.78, mesoRoughness: 0.84, microRoughness: 0.9, bumpAmplitude: 0.012, normalPattern: 'low-contrast woven fibers', displacementPattern: 'none', occlusionPattern: 'edge contact darkening', edgeWearPattern: 'subtle cream border wear', notes: 'Reference texture carries the visible ornament.' };
  return c;
};
const feature = (id, kind, description, ref) => ({ id, kind, description, region: { x: 0, y: 0, width: 1, height: 1, units: 'normalized' }, scale: 'object-relative', affects: 'geometry/material', mapsTo: { type: 'component.localFeatures', ref }, evidenceRef: evidence, confidence: 0.86 });
spec.componentTree = [
  clone('carpetBase', null, 'macro', 'body', 'rounded-box', [5.6,0.08,3.733], 'backing', [feature('edge-round', 'bevel', 'Softly rounded textile edge', 'carpetBase')]),
  clone('carpetTexturePanel', 'carpetBase', 'meso', 'surface', 'plane', [5.565,0.006,3.698], 'carpetFace', [feature('printed-face', 'pattern', 'Full reference image projected onto the horizontal face', 'carpetTexturePanel')], [0,0.082,0]),
  clone('carpetBorderOuter', 'carpetTexturePanel', 'meso', 'surface-region', 'plane', [5.4,0.004,3.55], 'carpetFace', [feature('outer-double-line', 'linework', 'Cream outer frame and dark green inset', 'carpetBorderOuter')]),
  clone('carpetBorderInner', 'carpetTexturePanel', 'meso', 'surface-region', 'plane', [5.1,0.004,3.25], 'carpetFace', [feature('inner-line', 'linework', 'Thin inset cream line', 'carpetBorderInner')]),
  clone('carpetTopOrnament', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [3.6,0.004,0.55], 'carpetFace', [feature('top-scroll', 'linework', 'Mirrored top scrollwork', 'carpetTopOrnament')]),
  clone('carpetBottomOrnament', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [3.6,0.004,0.55], 'carpetFace', [feature('bottom-scroll', 'linework', 'Mirrored bottom scrollwork', 'carpetBottomOrnament')]),
  clone('carpetCornerFloralTL', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [1.2,0.004,0.95], 'carpetFace', [feature('corner-bouquet-tl', 'pattern', 'Upper corner floral cluster', 'carpetCornerFloralTL')]),
  clone('carpetCornerFloralTR', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [1.2,0.004,0.95], 'carpetFace', [feature('corner-bouquet-tr', 'pattern', 'Upper corner floral cluster', 'carpetCornerFloralTR')]),
  clone('carpetCornerFloralBL', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [1.2,0.004,0.95], 'carpetFace', [feature('corner-bouquet-bl', 'pattern', 'Lower corner floral cluster', 'carpetCornerFloralBL')]),
  clone('carpetCornerFloralBR', 'carpetTexturePanel', 'micro', 'surface-region', 'plane', [1.2,0.004,0.95], 'carpetFace', [feature('corner-bouquet-br', 'pattern', 'Lower corner floral cluster', 'carpetCornerFloralBR')]),
  clone('carpetCentralMedallion', 'carpetTexturePanel', 'meso', 'surface-region', 'plane', [2.4,0.004,1.9], 'carpetFace', [feature('central-medallion', 'pattern', 'Lobed central floral medallion', 'carpetCentralMedallion')]),
  clone('carpetCollider', 'carpetBase', 'micro', 'collider', 'box', [5.6,0.12,3.733], 'backing', [])
];

const bands = [{ id: 'macro', frequency: 2, amplitude: 0.2, role: 'broad woven value breakup' }, { id: 'meso', frequency: 12, amplitude: 0.12, role: 'border and floral motif scale' }, { id: 'micro', frequency: 64, amplitude: 0.05, role: 'fiber highlight breakup' }];
const projection = { mode: 'uv', repeat: [1,1], anisotropy: 8, texelDensityIntent: 'Preserve source pattern proportions without stretch.' };
const pbrMaps = { version: '1.0', sourceImage: 'carpet-preview/carpet-reference.png', extractor: 'extract_pbr_evidence.py', method: 'reference-pixel-extraction', verdict: 'usable-for-stylized-prop', hardLimit: 'single-image inverse rendering cannot prove true physical PBR', usable: true, confidence: 0.86, targetThreshold: 0.7, maps: { albedo: { path: 'carpet-preview/material-evidence/carpetface_albedo.png', channel: 'albedo' }, roughness: { path: 'carpet-preview/material-evidence/carpetface_roughness.png', channel: 'roughness' }, height: { path: 'carpet-preview/material-evidence/carpetface_height.png', channel: 'height' }, normal: { path: 'carpet-preview/material-evidence/carpetface_normal.png', channel: 'normal' }, ao: { path: 'carpet-preview/material-evidence/carpetface_ao.png', channel: 'ao' } } };
spec.materials = [
  { id: 'backing', name: 'Dark textile backing', type: 'standard', baseColor: '#332F20', colorVariation: { palette: ['#332F20','#4A4828'], pattern: 'subtle woven fibers', amplitude: 0.08 }, textureResolution: 1024, textureProjection: projection, surfaceFrequencyBands: bands, roughness: { base: 0.96, variation: 0.03, map: 'independent-procedural-roughness' }, metalness: { base: 0, variation: 0 }, normal: { pattern: 'coarse woven backing', strength: 0.12, scale: 36 }, ambientOcclusion: { cavityStrength: 0.25, contactShadowBias: 0.35 }, localOverrides: [], referencePbr: pbrMaps },
  { id: 'carpetFace', name: 'Reference floral woven face', type: 'physical', baseColor: '#5C5F2F', colorVariation: { palette: ['#5C5F2F','#4B4F21','#E8D9B7','#747343','#BEA674'], pattern: 'reference floral print with low-contrast woven variation', amplitude: 0.18 }, textureResolution: 1024, textureProjection: projection, surfaceFrequencyBands: bands, roughness: { base: 0.84, variation: 0.2, map: 'carpet-preview/material-evidence/carpetface_roughness.png' }, metalness: { base: 0, variation: 0 }, normal: { pattern: 'reference-derived woven height', strength: 0.22, scale: 48 }, ambientOcclusion: { cavityStrength: 0.22, contactShadowBias: 0.3 }, localOverrides: [{ id: 'woven-field', region: 'green field', roughness: 0.86, color: '#5C5F2F', evidenceRefs: [evidence] }, { id: 'cream-border', region: 'cream border and ornaments', roughness: 0.8, color: '#E8D9B7', evidenceRefs: [evidence] }], referencePbr: pbrMaps }
];
spec.repetitionSystems = [
  { id: 'corner-bouquet-system', componentRef: 'carpetTexturePanel', distribution: 'bilateral-corners', count: 4, spacing: 1.4, primitive: 'textured-region', material: 'carpetFace', evidenceRefs: [evidence] },
  { id: 'border-scroll-system', componentRef: 'carpetTexturePanel', distribution: 'short-end-mirror', count: 2, spacing: 2.8, primitive: 'textured-region', material: 'carpetFace', evidenceRefs: [evidence] }
];
spec.lightingFromPhoto = ['key light: soft diffuse frontal source', 'fill light: neutral ambient environment', 'rim light: warm edge separation', 'exposure 1.08 with ACESFilmic tone mapping', 'contact shadow: soft PCF ground shadow under the thin edge'];
spec.qualityContract.lighting = { exposure: 1.08, toneMapping: 'ACESFilmicToneMapping', background: '#EEE7E0', contactShadow: 'soft PCF ground shadow' };
spec.qualityContract.lightingPass = { requiredTerms: ['key light', 'fill light', 'rim or environment light', 'exposure', 'tone mapping', 'background', 'contact shadow'], exposure: 1.08, toneMapping: 'ACESFilmicToneMapping', background: '#EEE7E0', contactShadow: 'soft PCF ground shadow' };
spec.proceduralStrategy = ['Use a rounded thin box for backing thickness and edge contact.', 'Use a replaceable reference texture on a coplanar face, rotated 90 degrees so the source vertical rug lies horizontally along scene X.', 'Keep semantic pattern regions as named child groups for future texture or decal replacement.'];
spec.buildPasses = spec.buildPasses.map(p => ({ ...p, componentRefs: spec.componentTree.map(c => c.id) }));
spec.featureReviewTargets = [
  { id: 'carpet-silhouette', name: 'Thin horizontal footprint', tier: 'critical', passIds: ['blockout','form-refinement'], minimumScore: 0.8, mustPass: true, componentRefs: ['carpetBase','carpetTexturePanel'], evidenceRefs: ['full-object','placement-reference'] },
  { id: 'carpet-pattern', name: 'Double border and floral medallion', tier: 'critical', passIds: ['material-pass'], minimumScore: 0.78, mustPass: true, componentRefs: ['carpetTexturePanel','carpetCentralMedallion','carpetCornerFloralTL'], evidenceRefs: ['full-object'] },
  { id: 'carpet-placement', name: 'Floor contact under chair legs', tier: 'important', passIds: ['interaction-pass'], minimumScore: 0.7, mustPass: true, componentRefs: ['carpetBase','carpetCollider'], evidenceRefs: ['placement-reference'] }
];
spec.performanceBudget = { qualityPriority: 'reference-fidelity', targetTriangles: 12000, maxDrawCalls: 24, textureSize: 1024, fpsTarget: 60, optimizationPolicy: 'Share one texture and keep the footprint to two visible meshes plus semantic groups.' };
spec.sculptPipeline.currentPass = 'optimization-pass';
spec.sculptPipeline.completedPasses = ['blockout','structural-pass','form-refinement','material-pass','surface-pass','lighting-pass','interaction-pass','optimization-pass'];
spec.sculptPipeline.lastCompletedPass = 'optimization-pass';
spec.sculptPipeline.blockedReason = '';
spec.reviewHistory = [];
spec.visualEvidence = [];
fs.writeFileSync(path, JSON.stringify(spec, null, 2));
console.log(`Wrote ${path} with ${spec.componentTree.length} components and ${spec.materials.length} materials`);
