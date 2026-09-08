import fs from 'node:fs';

const specPath = new URL('./object-sculpt-spec.json', import.meta.url);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
spec.targetId = 'clueBoard';
spec.sourceImage = 'C:/Users/ZYB/Documents/个人网站/clue-board-preview/reference.png';
spec.preSpecAssessment.unknownsToResolveBeforeImplementation = [];
spec.assumptions = [
  'Nominal dimensions are scalable because the image supplies no measurement.',
  'Rear panel, rear cleats, hidden fasteners, and rear finish are approximate.',
  'Printed content is represented by replaceable placeholders rather than exact transcription.'
];
spec.coordinateFrame = { upAxis:'+Y', forwardAxis:'+Z', handedness:'right-handed', origin:'board bottom center', units:'scene units' };
spec.silhouette = { width:12, height:8.8, depth:0.72, symmetry:'rectangular frame with asymmetric front content', dominantProfiles:['rounded rectangular frame','shallow layered relief'] };

const rootTemplate = spec.componentTree[0];
function component(id,name,level,parent,primitive,topologyClass,material,dimensions,position,localFeatures=[],role='static-part') {
  const c = structuredClone(rootTemplate);
  c.id=id;c.name=name;c.level=level;c.parent=parent;c.primitive=primitive;c.topologyClass=topologyClass;
  c.topologyRationale = topologyClass==='fiber-strand' ? 'Thin cord follows a 3D path and therefore uses TubeGeometry.' : topologyClass==='material-only' ? 'Shallow replaceable print carrier attached to a paper solid.' : 'Discrete shallow rigid solid observed in the reference.';
  c.material=material;c.materialLayers=[material];c.dimensions={width:dimensions[0],height:dimensions[1],depth:dimensions[2],units:'scene units',confidence:parent?0.9:0.98};
  c.transform={position,rotation:[0,0,0],scale:[1,1,1]};
  c.actionProfile.animationRole=parent?role:'root';
  c.actionProfile.pivot={mode:parent?'local-center':'bottom-center',localPosition:[0,0,0],axis:[0,1,0],confidence:0.92};
  c.actionProfile.collider={type:'box',offset:[0,0,0],scale:[1,1,1],isTrigger:false,notes:'shallow proxy'};
  c.actionProfile.destruction.fractureGroup=parent||id;
  c.attachment = parent ? {parentSocket:parent,localStart:[0,0,-dimensions[2]/2],localEnd:[0,0,dimensions[2]/2],contactType:'overlap',embedDepth:0.02,overlap:0.02,gapTolerance:0.012,notes:'front-layer attachment'} : null;
  c.localFeatures=localFeatures.map(featureId=>({id:featureId,type:'observed-detail',placement:'component-local',size:'object-relative',orientation:'surface-aligned',materialEffect:'bounded local response',geometryEffect:'implemented in procedural factory',confidence:0.9,evidenceRefs:['reference.png']}));
  const recipeByMaterial = {
    wood:['rgba(167, 101, 54, 1)','rgba(112, 68, 38, 1)','wood'], woodDark:['rgba(112, 68, 38, 1)','rgba(92, 55, 32, 1)','wood'],
    cork:['rgba(232, 173, 111, 1)','rgba(241, 198, 141, 1)','wood'], paper:['rgba(246, 240, 223, 1)','rgba(230, 234, 235, 1)','fabric'],
    paperCool:['rgba(230, 234, 235, 1)','rgba(246, 240, 223, 1)','fabric'], photo:['rgba(98, 102, 104, 1)','rgba(174, 177, 175, 1)','plastic'],
    pinMetal:['rgba(200, 201, 196, 1)','rgba(216, 216, 210, 1)','metal'], redCord:['rgba(216, 58, 50, 1)','rgba(183, 43, 38, 1)','fabric'],
    tape:['rgba(233, 216, 172, 0.78)','rgba(245, 230, 191, 0.78)','plastic'],
  };
  const [dominantAlbedo,secondaryAlbedo,materialClass]=recipeByMaterial[material]||recipeByMaterial.paper;
  c.colorMaterialRecipe={dominantAlbedo,secondaryAlbedo,materialClass,materialClassConfidence:.86,samplingMethod:'reference-observed region with stylized calibration',roughnessIntent:'material-specific matte response',metalnessIntent:material==='pinMetal'?.58:0,edgeResponse:'real bevel or curved tube geometry'};
  c.evidenceRefs=['full-object'];c.fidelityTier=level==='macro'?'blockout':level==='meso'?'structural':'detail';
  return c;
}

spec.componentTree = [
  component('clueBoard','Clue Board','macro',null,'box','assembled-solid','wood',[12,8.8,.72],[0,0,0],['frame-bevel']),
  component('boardBody','Frame and backing assembly','macro','clueBoard','box','assembled-solid','wood',[12,8.8,.58],[0,4.4,0],['frame-bevel','rear-panel']),
  component('corkBoard','Cork backing field','macro','boardBody','box','assembled-solid','cork',[11.1,7.9,.3],[0,4.4,0],['cork-mottle']),
  component('woodFrame','Four-rail wooden frame','meso','boardBody','box','assembled-solid','wood',[12,8.8,.58],[0,4.4,.02],['frame-bevel','wood-grain']),
  component('rearMounting','Approximate rear panel and cleats','meso','boardBody','box','assembled-solid','woodDark',[11.35,8.1,.18],[0,4.4,-.27],['rear-panel']),
  component('boardMap','Replaceable map group','macro','clueBoard','box','assembled-solid','paperCool',[4.9,2.85,.06],[-2.55,1.8,.23],['paper-relief','paper-rotation','replaceable-prints'],'movable-content'),
  component('boardPhotos','Replaceable photo group','meso','clueBoard','box','assembled-solid','photo',[8,5.6,.08],[.4,4.6,.25],['paper-relief','paper-rotation','replaceable-prints'],'movable-content'),
  component('boardNotes','Replaceable note group','meso','clueBoard','box','assembled-solid','paper',[8,5.5,.08],[0,5.3,.27],['paper-relief','paper-rotation','replaceable-prints','title-plaque'],'movable-content'),
  component('boardDocuments','Replaceable document group','meso','clueBoard','box','assembled-solid','paper',[4.5,4.2,.08],[0,3.6,.26],['paper-relief','paper-rotation','replaceable-prints'],'movable-content'),
  component('boardPins','Pin anchor group','meso','clueBoard','sphere','surface-relief','pinMetal',[9,6.4,.32],[0,4.1,.4],['pin-cluster'],'movable-content'),
  component('boardStrings','Red string curve network','meso','clueBoard','tube','fiber-strand','redCord',[9,6.1,.08],[0,4,.58],['red-string-network','string-depth'],'movable-content'),
  component('tapeTabs','Semi-opaque tape tabs','micro','clueBoard','box','surface-relief','tape',[5,4,.03],[0,4.8,.37],['tape-tabs']),
  component('mapMain','Main map carrier','meso','boardMap','box','assembled-solid','paperCool',[4.9,2.85,.06],[0,0,0],['replaceable-prints'],'movable-content'),
  component('photoCards','Six photo carriers','micro','boardPhotos','box','assembled-solid','photo',[2.2,1.5,.06],[0,0,0],['paper-rotation','replaceable-prints'],'movable-content'),
  component('noteCards','Seven note carriers','micro','boardNotes','box','assembled-solid','paper',[1.2,.7,.055],[0,0,0],['paper-rotation','replaceable-prints'],'movable-content'),
  component('documentCards','Three document carriers','micro','boardDocuments','box','assembled-solid','paper',[1.2,1.7,.06],[0,0,0],['paper-rotation','replaceable-prints'],'movable-content'),
  component('pinHeads','Twelve pin heads','micro','boardPins','sphere','surface-relief','pinMetal',[.23,.23,.16],[0,0,.15],['pin-cluster']),
  component('stringTubes','Nine anchored curve tubes','micro','boardStrings','tube','fiber-strand','redCord',[9,6.1,.055],[0,0,0],['red-string-network','string-depth']),
  component('titlePlaque','Top title note','meso','boardNotes','box','assembled-solid','paper',[3.2,.62,.075],[0,2.93,.12],['title-plaque','replaceable-prints'],'movable-content'),
  component('frameBevel','Frame bevel system','micro','woodFrame','box','surface-relief','wood',[12,8.8,.58],[0,0,0],['frame-bevel']),
  component('corkMottle','Cork color and roughness breakup','micro','corkBoard','box','material-only','cork',[11.1,7.9,.01],[0,0,.16],['cork-mottle']),
  component('paperRelief','Layered paper depth system','micro','clueBoard','box','surface-relief','paper',[9.5,6.8,.12],[0,4.1,.28],['paper-relief','paper-rotation']),
];

const baseMaterial = spec.materials[0];
function material(id,name,color,roughness,metalness,overrideIds,normalPattern='fine surface variation') {
  const m=structuredClone(baseMaterial);m.id=id;m.name=name;m.type='physical';m.shaderModel='MeshPhysicalMaterial';m.baseColor=color;m.color=color;
  m.albedo={dominant:color,secondary:[color],samplingNotes:'Reference-observed palette; source lighting treated as evidence, not exact inverse rendering.'};
  m.colorVariation={palette:[color],pattern:id==='wood'?'low-contrast longitudinal grain':id==='cork'?'irregular cork mottle':'bounded print/value variation',amplitude:id==='cork'?.08:.035,heightCorrelation:.12};
  m.roughness={base:roughness,variation:.06,map:'independent-procedural-field',localResponse:'bevel and grazing-light response'};
  m.metalness={base:metalness,variation:metalness?.04:0};
  m.normal={pattern:normalPattern,strength:id==='cork'?.18:.08,scale:22,space:'tangent'};
  m.bump={pattern:normalPattern,amplitude:id==='cork'?.012:.004,scale:1};
  m.ambientOcclusion={cavityStrength:.18,contactShadowBias:.22,notes:'paper overlap and frame recess contact'};
  m.wear={edgeWear:id==='wood'?.02:0,scratches:[],chips:[]};m.dirt={amount:.005,cavityBias:.1,color:'#5d4937'};
  m.localOverrides=overrideIds.map(id=>({id,region:'reference-defined component region',effect:'bounded color/roughness/relief response',evidenceRefs:['reference.png']}));
  m.referencePbr={version:'1.0',sourceImage:'reference.png',extractor:'extract_pbr_evidence.py',method:'whole-board source evidence used for stylized material calibration',verdict:'usable-for-stylized-preview',hardLimit:'single-image estimates include baked lighting and are not exact inverse rendering',usable:true,confidence:.86,estimatedFidelity:.86,targetThreshold:.7,maps:{albedo:{path:'material-evidence/board_albedo.png'},roughness:{path:'material-evidence/board_roughness.png'},height:{path:'material-evidence/board_height.png'},normal:{path:'material-evidence/board_normal.png'},ao:{path:'material-evidence/board_ao.png'}}};
  m.notes='Procedural runtime material with source-derived palette; exact printed content remains replaceable.';
  return m;
}
spec.materials=[
  material('wood','Warm wood frame','#A76536',.58,0,['woodFrame.grainBands','wood-frame-bevel'],'longitudinal wood grain'),
  material('woodDark','Rear and lower wood','#704426',.64,0,['rearMounting.approximate'],'subtle wood grain'),
  material('cork','Soft cork backing','#E8AD6F',.9,0,['corkMaterial.mottle'],'irregular cork pores'),
  material('paper','Warm paper','#F6F0DF',.88,0,['contentMaterials.replaceableTexturePaths','paper-edge'],'paper fiber'),
  material('paperCool','Map paper','#E6EAEB',.84,0,['contentMaterials.replaceableTexturePaths'],'paper fiber'),
  material('photo','Grayscale photo print','#626668',.72,0,['contentMaterials.replaceableTexturePaths'],'print grain'),
  material('pinMetal','Silver pin metal','#C8C9C4',.32,.58,['pin-crown-highlight'],'fine metal polish'),
  material('redCord','Red string','#D83A32',.48,0,['cord-highlight'],'fiber tangent variation'),
  material('tape','Warm translucent tape','#E9D8AC',.82,0,['tapeTabs.overlapSystem'],'tape fiber'),
];

spec.qualityContract.minimumSpecDepth.mesoComponents=9;
const detailRefMap={
  'frame-bevel':'frame-bevel','wood-grain':'woodFrame.grainBands','cork-mottle':'corkMaterial.mottle',
  'paper-relief':'paper-relief','paper-rotation':'paper-rotation','replaceable-prints':'contentMaterials.replaceableTexturePaths',
  'pin-cluster':'pin-cluster','red-string-network':'red-string-network','string-depth':'string-depth',
  'tape-tabs':'tapeTabs.overlapSystem','title-plaque':'title-plaque','rear-panel':'rear-panel',
};
for(const detail of spec.preSpecAssessment.detailInventory.details){detail.mapsTo.ref=detailRefMap[detail.id];detail.evidenceRef='full-object';}

spec.repetitionSystems=[
  {id:'photo-card-set',name:'six independently transformed photos',componentRefs:['photoCards'],count:6,distribution:'asymmetric across upper and right board',spacing:{x:1.3,y:1.2,z:.02},seed:17,instancing:'shared shallow-card helper with distinct texture paths',evidenceRefs:['reference.png']},
  {id:'note-card-set',name:'seven independently transformed notes',componentRefs:['noteCards','titlePlaque'],count:7,distribution:'irregular around evidence clusters',spacing:{x:1,y:.8,z:.02},seed:23,instancing:'shared shallow-card helper',evidenceRefs:['reference.png']},
  {id:'pin-anchor-set',name:'twelve metal and red pins',componentRefs:['pinHeads','boardPins'],count:12,distribution:'placed at paper/string evidence anchors',spacing:{x:1.1,y:.9,z:0},seed:31,instancing:'shared shaft and sphere-head geometry',evidenceRefs:['reference.png']},
  {id:'red-string-network',name:'nine curved string segments',componentRefs:['stringTubes','boardStrings'],count:9,distribution:'graph edges between named pin anchors',spacing:{x:0,y:0,z:.035},seed:41,instancing:'shared TubeGeometry parameters with unique Bezier control points',evidenceRefs:['reference.png']},
];

spec.featureReviewTargets=[
  {id:'board-proportions',name:'Rounded 12 by 8.8 frame and recessed cork',tier:'critical',passIds:['blockout'],minimumScore:.86,mustPass:true,componentRefs:['clueBoard','woodFrame','corkBoard'],evidenceRefs:['reference.png']},
  {id:'layered-content',name:'Independent layered map photos notes and documents',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:.82,mustPass:true,componentRefs:['boardMap','boardPhotos','boardNotes','boardDocuments'],evidenceRefs:['reference.png']},
  {id:'pin-string-network',name:'Connected red TubeGeometry strings ending at pin anchors',tier:'critical',passIds:['form-refinement'],minimumScore:.86,mustPass:true,componentRefs:['boardPins','boardStrings'],evidenceRefs:['reference.png']},
  {id:'replaceable-textures',name:'Stable replaceable texture carriers and local transforms',tier:'critical',passIds:['interaction-pass'],minimumScore:.9,mustPass:true,componentRefs:['mapMain','photoCards','noteCards','documentCards'],evidenceRefs:['reference.png']},
  {id:'material-separation',name:'Wood cork paper metal tape and cord material separation',tier:'important',passIds:['material-pass','lighting-pass'],minimumScore:.75,mustPass:false,componentRefs:['woodFrame','corkBoard','pinHeads','stringTubes'],evidenceRefs:['reference.png']},
];
spec.lightingFromPhoto=[
  {id:'key',type:'directional',color:'#FFEAD5',intensity:2.15,position:[8,12,12],size:5,role:'soft warm-white key; ACES exposure 1.08; soft contact shadows'},
  {id:'fill',type:'hemisphere',color:'#FFF8ED',intensity:1.75,position:[-6,9,5],role:'bright neutral fill preserving paper and cork readability'},
  {id:'rim',type:'directional',color:'#DFEAFF',intensity:.72,position:[-8,8,5],role:'cool lateral separation for frame depth'},
];
for (const pass of spec.buildPasses) pass.componentRefs=spec.componentTree.map(c=>c.id);
spec.performanceBudget={targetTriangles:60000,maxDrawCalls:120,targetFPSDesktop:60,targetFPSMobile:45,lodPolicy:'No LOD required for independent hero preview; simplify radial segments on integration if needed.'};
spec.actionReadiness.rootMotionNode='clueBoard';
fs.writeFileSync(specPath,`${JSON.stringify(spec,null,2)}\n`);
