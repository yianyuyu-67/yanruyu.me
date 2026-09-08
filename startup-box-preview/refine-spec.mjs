import fs from 'node:fs';
const path = new URL('./generated-spec.json', import.meta.url);
const spec = JSON.parse(fs.readFileSync(path, 'utf8'));
spec.targetId = 'startupBox';
spec.suitability = 'pass';
spec.coordinateFrame = { upAxis: '+Y', frontAxis: '+Z', origin: 'bottom-center', units: 'scene units' };
spec.silhouette = { primary: 'near-cubic cuboid', proportions: { width:8, depth:6.4, height:6.4 }, symmetry: 'bilateral', negativeSpaces: ['recessed front opening'] };
spec.preSpecAssessment.unknownsToResolveBeforeImplementation = [];
spec.assumptions = [
  'Rear panel, underside joinery, interior cavity depth and rear foot visibility are reasonable approximations because the supplied image is a single front-right view.',
  'The red shipping marks are simplified geometric decals rather than exact printed glyphs.'
];
const root = spec.componentTree[0];
root.name = 'startupBox'; root.dimensions = { width:8, height:6.4, depth:6.4, units:'scene' }; root.geometryDescriptor = { topologyIntent:'assembled beveled hard-surface shell', edgeTreatment:{type:'chamfer',bevelRadius:0.14,segments:5}, deformationStack:[], uvStrategy:'generated procedural coordinates', normalStrategy:'smooth vertex normals' }; root.localFeatures = [{id:'bodyShell',kind:'assembled-shell',evidenceRefs:['full-object']},{id:'seams',kind:'seam',evidenceRefs:['full-object']}];
function component(id, name, level, role, parent, dims, material, features = []) {
  return { id, name, level, role, importance:0.8, confidence:0.9, primitive:'rounded-box', topologyClass:'assembled-solid', topologyRationale:'Visible hard-surface board or attached subassembly.', geometryDescriptor:{topologyIntent:'beveled procedural solid',edgeTreatment:{type:'chamfer',bevelRadius:0.06,segments:4},deformationStack:[],uvStrategy:'generated procedural coordinates',normalStrategy:'smooth vertex normals'}, parent, attachment:{parentSocket:`${parent}-socket`,localStart:[0,0,0],localEnd:[0,0,0],contactType:'butt',embedDepth:0.03,gapTolerance:0.02}, dimensions:{...dims,units:'scene',confidence:0.9}, transform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]}, actionProfile:{animationRole:'static-part',pivot:{mode:'local',localPosition:[0,0,0],axis:[0,1,0],confidence:0.9},transformChannels:{translate:true,rotate:true,scale:true,bend:false,twist:false,detach:false,visibility:true,materialState:true},sockets:[],collider:{type:'box',offset:[0,0,0],scale:[1,1,1],isTrigger:false,notes:''},constraints:[],destruction:{breakable:false,fractureGroup:id,seamRefs:[],detachableFragments:[],breakImpulse:0,debrisMaterial:material}},material,materialLayers:[material],deformations:[],joints:[],seams:[],localFeatures:features,surfaceDetail:{macroRoughness:0.1,microRoughness:0.08,bumpAmplitude:0.03,normalPattern:'subtle linear wood grain',displacementPattern:'none',occlusionPattern:'construction seams',edgeWearPattern:'soft edge highlight',notes:''},evidenceRefs:['full-object'],details:features,fidelityTier:'form'};
}
const feature = (id, kind) => ({ id, kind, evidenceRefs:['full-object'], localParams:{ visible:true } });
spec.componentTree = [
  root,
  component('bodyShell','bodyShell','macro','outer shell','root',{width:8,height:6.4,depth:6.4},'wood',[feature('board-seams','seam'),feature('edge-bevels','bevel')]),
  component('frontFrame','frontFrame','meso','recessed front frame','root',{width:6.8,height:5.25,depth:0.44},'woodEdge',[feature('front-recess','hole')]),
  component('frontPanels','frontPanels','meso','inset front boards','root',{width:6.32,height:4.28,depth:0.18},'woodInner',[feature('panel-inset','groove')]),
  component('frontDivider','frontDivider','meso','central divider','root',{width:0.38,height:4.6,depth:0.42},'woodEdge',[feature('center-divider','ridge')]),
  component('topPanel','topPanel','meso','top board','root',{width:7.34,height:0.42,depth:6},'woodLight'),
  component('topBattens','topBattens','micro','two raised top battens','topPanel',{width:0.44,height:0.34,depth:5.7},'woodEdge',[feature('top-battens','ridge')]),
  component('sideShippingMark','sideShippingMark','micro','right side red marks','bodyShell',{width:0.06,height:2.2,depth:1.9},'shippingRed',[feature('side-mark-grid','decal')]),
  component('topLabel','topLabel','micro','top label','topPanel',{width:1.72,height:0.05,depth:0.48},'labelInk',[feature('top-label','decal')]),
  component('feet','feet','meso','four short feet','root',{width:6.8,height:0.55,depth:5.4},'woodEdge',[feature('feet','ridge')]),
  component('frontMark','frontMark','micro','front ink mark','frontPanels',{width:0.24,height:0.72,depth:0.05},'labelInk',[feature('front-mark','decal')]),
];
spec.materials = [
  { id:'wood', name:'Pale pine wood', type:'standard', shaderModel:'MeshStandardMaterial', baseColor:'#D8B47A', color:'#D8B47A', albedo:{dominant:'#D8B47A',secondary:['#E5C995','#B98C59'],samplingNotes:'Observed pale warm wood with low contrast grain.'}, colorVariation:{palette:['#D8B47A','#E5C995','#B98C59'],pattern:'linear grain',amplitude:0.1,heightCorrelation:0.15}, textureResolution:256, roughness:{base:0.84,variation:0.06,map:'procedural-linear-grain',localResponse:'slightly darker seams'}, metalness:{base:0,variation:0}, normal:{pattern:'subtle linear grain',strength:0.16,scale:18,space:'tangent'}, bump:{pattern:'fine grain',amplitude:0.015,scale:18}, displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false}, ambientOcclusion:{cavityStrength:0.22,contactShadowBias:0.3,notes:'Frame seams and recessed panels'}, localOverrides:[{id:'wood-grain',region:'all board faces',roughness:0.84}], referencePbr:{status:'inferred-from-visible-albedo',confidence:0.78}, shaderNotes:['Independent albedo and roughness; no map aliasing'] },
  { id:'woodInner', name:'Inner warm wood', type:'standard', shaderModel:'MeshStandardMaterial', baseColor:'#B98C59', color:'#B98C59', albedo:{dominant:'#B98C59',secondary:['#8E673F'],samplingNotes:'Recessed wood appears darker.'}, colorVariation:{palette:['#B98C59','#8E673F'],pattern:'subtle',amplitude:0.06,heightCorrelation:0.1}, textureResolution:256, roughness:{base:0.89,variation:0.04,map:'solid-with-grain'}, metalness:{base:0,variation:0}, normal:{pattern:'fine grain',strength:0.1,scale:18,space:'tangent'}, bump:{pattern:'none',amplitude:0,scale:1}, displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false}, ambientOcclusion:{cavityStrength:0.3,contactShadowBias:0.35,notes:'Recess contact'}, localOverrides:[], referencePbr:{status:'inferred',confidence:0.72}, shaderNotes:[] },
  { id:'shippingRed', name:'Shipping mark red paint', type:'standard', shaderModel:'MeshStandardMaterial', baseColor:'#A83F35', color:'#A83F35', albedo:{dominant:'#A83F35',secondary:['#7D2F2B'],samplingNotes:'Muted red painted marks.'}, colorVariation:{palette:['#A83F35','#7D2F2B'],pattern:'solid',amplitude:0.02,heightCorrelation:0}, textureResolution:128, roughness:{base:0.9,variation:0.03,map:'solid'}, metalness:{base:0,variation:0}, normal:{pattern:'none',strength:0,scale:1,space:'tangent'}, bump:{pattern:'none',amplitude:0,scale:1}, displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false}, ambientOcclusion:{cavityStrength:0.05,contactShadowBias:0.1,notes:'Flush painted mark'}, localOverrides:[{id:'side-mark-grid',region:'right side',roughness:0.9}], referencePbr:{status:'inferred',confidence:0.74}, shaderNotes:[] },
  { id:'woodEdge', name:'Pale edge wood', type:'standard', shaderModel:'MeshStandardMaterial', baseColor:'#C59A62', color:'#C59A62', albedo:{dominant:'#C59A62',secondary:['#D8B47A'],samplingNotes:'Edge rails catch slightly brighter light.'}, colorVariation:{palette:['#C59A62','#D8B47A'],pattern:'solid',amplitude:0.04,heightCorrelation:0}, textureResolution:256, roughness:{base:0.86,variation:0.04,map:'solid'}, metalness:{base:0,variation:0}, normal:{pattern:'subtle grain',strength:0.08,scale:18,space:'tangent'}, bump:{pattern:'none',amplitude:0,scale:1}, displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false}, ambientOcclusion:{cavityStrength:0.2,contactShadowBias:0.2,notes:'Edge contact'}, localOverrides:[], referencePbr:{status:'inferred',confidence:0.7}, shaderNotes:[] }
];
spec.featureReviewTargets = [
  { id:'front-recess', importance:'critical', criteria:'Front opening reads as a recessed framed cavity with central divider.', evidenceRefs:['full-object'] },
  { id:'top-battens', importance:'critical', criteria:'Two raised battens remain attached and visible from top and three-quarter views.', evidenceRefs:['full-object'] },
  { id:'side-shipping-grid', importance:'important', criteria:'Four muted red pictogram cells remain legible on right side.', evidenceRefs:['full-object'] },
  { id:'feet', importance:'important', criteria:'Four feet contact the ground plane without floating.', evidenceRefs:['full-object'] }
];
spec.repetitionSystems = [
  { id:'feet', componentRef:'feet', count:4, distribution:'four corners', spacing:'symmetric footprint' },
  { id:'shipping-mark-cells', componentRef:'sideShippingMark', count:4, distribution:'2x2 grid', spacing:'uniform' },
  { id:'top-battens', componentRef:'topBattens', count:2, distribution:'parallel lateral pair', spacing:'symmetric about center' }
];
spec.lightingFromPhoto = [{ id:'key',type:'area-like directional',color:'#FFF2DD',intensity:2.4,direction:'upper front-left',shadow:'soft contact' },{ id:'fill',type:'environment',color:'#F7F5EF',intensity:1.2,direction:'broad front',shadow:'low contrast' }];
spec.qualityContract.minimumSpecDepth = { macroComponents:4, mesoComponents:8, microFeatureGroups:4, materialLayers:3, repetitionSystems:2, reviewViewpoints:7 };
spec.qualityContract.featureGroups = spec.featureReviewTargets.map(target => ({ id:target.id, name:target.criteria, required:target.importance==='critical', qualityCriteria:[target.criteria], evidenceRefs:target.evidenceRefs, failureModes:['feature missing or unreadable'] }));
spec.proceduralStrategy = ['Use RoundedBoxGeometry for board members and feet with deterministic dimensions.', 'Keep front panels recessed behind a separate frame and central divider.', 'Use a low-contrast CanvasTexture for wood grain and independent materials for inner wood and red marks.', 'Keep all major parts as named child groups for replacement.'];
spec.componentTree.forEach(component => {
  component.primitive = 'box';
  component.colorMaterialRecipe = { baseColor: component.material === 'wood' ? '#D8B47A' : component.material === 'woodInner' ? '#B98C59' : component.material === 'shippingRed' ? '#A83F35' : '#C59A62', finish: 'matte', roughness: 0.84, metalness: 0 };
  if (component.id === 'frontFrame') { component.topologyClass = 'assembled-solid'; component.geometryDescriptor.topologyIntent = 'frame surrounding a recessed opening'; }
});
spec.componentTree[0].material = 'wood'; spec.componentTree[0].materialLayers = ['wood'];
spec.componentTree.forEach(c => { if (c.material === 'woodLight') c.material = 'wood'; if (c.material === 'labelInk') c.material = 'shippingRed'; });
const baseMaterial = spec.materials[0];
for (const id of ['woodLight','labelInk']) { const clone = JSON.parse(JSON.stringify(baseMaterial)); clone.id = id; clone.name = id === 'woodLight' ? 'Light edge wood' : 'Label ink'; clone.baseColor = id === 'labelInk' ? '#49372D' : '#E5C995'; clone.color = clone.baseColor; clone.albedo.dominant = clone.baseColor; clone.referencePbr = { usable:true, confidence:0.72, maps:{ albedo:'procedural-canvas', roughness:'constant', normal:'none' } }; spec.materials.push(clone); }
for (const mat of spec.materials) {
  mat.textureResolution = 1024;
  mat.textureProjection = { mode:'uv', repeat:[1.2,1.2], texelDensityIntent:'stable object-scale grain' };
  mat.surfaceFrequencyBands = [{id:'macro',frequency:2,amplitude:0.08,role:'broad wood value'},{id:'meso',frequency:12,amplitude:0.04,role:'linear grain'},{id:'micro',frequency:48,amplitude:0.015,role:'highlight breakup'}];
  mat.referencePbr = { usable:true, confidence:Math.max(0.72, mat.referencePbr?.confidence || 0.72), maps:{ albedo:'procedural-canvas', roughness:'independent-solid', normal:'subtle-grain' } };
}
spec.qualityContract.minimumSpecDepth = { macroComponents:2, mesoComponents:5, microFeatureGroups:4, materialLayers:3, repetitionSystems:2, reviewViewpoints:5 };
spec.qualityContract.featureGroups = spec.featureReviewTargets.map(target => ({ id:target.id, name:target.criteria, required:target.importance==='critical', qualityCriteria:[target.criteria], evidenceRefs:target.evidenceRefs, failureModes:['feature missing or unreadable'] }));
spec.featureReviewTargets = [
  { id:'front-recess', name:'recessed framed front opening', tier:'critical', criteria:'Front opening reads as a recessed framed cavity with central divider.', evidenceRefs:['full-object'] },
  { id:'top-battens', name:'paired raised top battens', tier:'critical', criteria:'Two raised battens remain attached and visible from top and three-quarter views.', evidenceRefs:['full-object'] },
  { id:'side-shipping-grid', name:'red side shipping mark grid', tier:'important', criteria:'Four muted red pictogram cells remain legible on right side.', evidenceRefs:['full-object'] },
  { id:'feet', name:'four grounded feet', tier:'important', criteria:'Four feet contact the ground plane without floating.', evidenceRefs:['full-object'] }
];
spec.preSpecAssessment.detailInventory.details.find(detail => detail.id === 'wood-grain').mapsTo.ref = 'wood';
spec.lookDevTargets = { silhouette:'near-cubic crate with recessed front', colorPalette:['#D8B47A','#B98C59','#A83F35'], materials:['pale wood','inner wood','painted red marks'], lighting:'soft warm key with neutral fill', exposure:1.08, toneMapping:'ACESFilmicToneMapping', contactShadows:true };
fs.writeFileSync(path, JSON.stringify(spec, null, 2) + '\n');
fs.copyFileSync(path, new URL('./object-sculpt-spec.json', import.meta.url));
