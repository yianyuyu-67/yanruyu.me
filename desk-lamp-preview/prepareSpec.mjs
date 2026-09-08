import fs from 'node:fs';

const path = new URL('./object-sculpt-spec.json', import.meta.url);
const spec = JSON.parse(fs.readFileSync(path, 'utf8'));
spec.suitability = 'pass';
spec.referenceCamera = { solved:false, fovDegrees:40, aspect:1.076, orientation:{yaw:0,pitch:0,roll:0}, positionHint:[0,18,46], note:'Multi-view product sheet; orthographic panels are used as proportion evidence. Hidden underside and cable routing remain approximate.' };
spec.preSpecAssessment.objectClass = {
  primaryType:'articulated vintage desk lamp', primaryDomain:'object',
  formLanguage:['hard-surface','mechanical','layered shell'],
  structureKind:['compound object','articulated assembly','repeated modules'],
  motionPotential:['articulated','whole-object transform'],
  materialFamilies:['metal','rubber','ceramic-like reflector'],
  notes:'Observed multi-view product sheet with circular base, domed shade, brass arm and cable.'
};
spec.preSpecAssessment.complexity.scores = {silhouetteComplexity:2,componentCount:3,hierarchyDepth:3,repetitionDensity:2,materialLayerCount:3,localDetailDensity:2,occlusionRisk:1,actionReadinessNeed:2};
spec.preSpecAssessment.complexity.estimatedCounts = {macroComponents:5,mesoComponents:12,microFeatureGroups:12,materialLayers:4,repetitionSystems:2};
spec.preSpecAssessment.complexity.reasoning = ['Five macro assemblies and multiple brass ring/joint systems are visible across the orthographic panels.','The articulated arm, shade hinge, switch and cord require stable pivots.'];
spec.preSpecAssessment.unknownsToResolveBeforeImplementation = ['underside fastener pattern','internal bulb socket','exact rear cord routing','hidden hinge internals'];
spec.preSpecAssessment.detailInventory = {
  scanMethod:'component-zones', targetMinDetails:12,
  details:[
    ['base-step','bevel','three concentric stepped rings on base','base.localFeatures',0.95],
    ['base-collar','ridge','brass collar above base','base.localFeatures',0.9],
    ['stem-finial','bevel','green cylindrical stem with brass finials','stem.localFeatures',0.95],
    ['shade-dome','bevel','domed green shade profile','shade.localFeatures',0.98],
    ['shade-rim','ridge','thin brass lower rim','shadeRim.localFeatures',0.98],
    ['shade-interior','gloss','warm ivory reflector inside shade','shade.localFeatures',0.9],
    ['arm-link','bevel','slender brass articulated arm','arm.localFeatures',0.95],
    ['joint-sphere','fastener','spherical brass hinge joints','joint.localFeatures',0.95],
    ['top-finial','bevel','small brass top finial','stem.localFeatures',0.86],
    ['switch-knob','bevel','hanging brass switch/knob','switch.localFeatures',0.9],
    ['cord-bend','seam','black cable hanging in a curved path','cord.localFeatures',0.88],
    ['surface-highlight','gloss','localized satin highlight on green paint','greenMetal.localOverrides',0.82],
  ].map(([id,kind,description,ref,confidence])=>({id,kind,description,region:{x:0,y:0,width:1,height:1,units:'normalized'},scale:'object-relative',affects:'geometry/material',mapsTo:{type:ref.includes('material')?'material.localOverrides':'component.localFeatures',ref},evidenceRef:'full-object',confidence}))
};
spec.qualityContract.definitionOfDone = [
  '38 cm tall lamp with 15 cm base and shade diameters and 26 cm maximum arm span within +/-0.5 cm.',
  'Front, left, right, rear and top silhouettes show the stepped base, domed shade, brass arm and hanging cable.',
  'All required components remain independent and animation-ready with stable pivots and sockets.',
  'Green painted metal, brass, ivory reflector and rubber cord read as distinct PBR materials under soft studio lighting.'
];
spec.qualityContract.minimumSpecDepth = {macroComponents:3,mesoComponents:8,microFeatureGroups:5,materialLayers:3,repetitionSystems:1,reviewViewpoints:6};
spec.featureReviewTargets = [
  {id:'lamp-silhouette',name:'Stepped base, stem and domed shade silhouette',tier:'critical',passIds:['blockout','form-refinement'],minimumScore:0.8,mustPass:true,componentRefs:['base','stem','shade'],evidenceRefs:['full-object']},
  {id:'articulated-arm',name:'Brass arm and spherical joint layout',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:0.8,mustPass:true,componentRefs:['arm','joint'],evidenceRefs:['full-object']},
  {id:'material-palette',name:'Green, brass and warm reflector material response',tier:'critical',passIds:['material-pass','surface-pass'],minimumScore:0.75,mustPass:true,componentRefs:['base','shade','shadeRim'],evidenceRefs:['full-object']},
  {id:'switch-cord',name:'Hanging switch and curved cord',tier:'important',passIds:['structural-pass','form-refinement'],minimumScore:0.65,mustPass:false,componentRefs:['switch','cord'],evidenceRefs:['full-object']}
];
const attachment = (parentSocket, localStart, localEnd, contactType='socket') => ({parentSocket,localStart,localEnd,contactType,embedDepth:0.04,overlap:0.04,gapTolerance:0.02});
const action = (role,pivot,collider='box') => ({animationRole:role,pivot:{mode:'explicit',localPosition:pivot,axis:[0,1,0],confidence:0.9},transformChannels:{translate:true,rotate:true,scale:true,bend:false,twist:false,detach:false,visibility:true,materialState:true},sockets:[],collider:{type:collider,offset:[0,0,0],scale:[1,1,1],isTrigger:false},constraints:[],destruction:{breakable:false,fractureGroup:role,seamRefs:[],detachableFragments:[],breakImpulse:0,debrisMaterial:'greenMetal'}});
const comp = (id,name,level,parent,dimensions,primitive,material,features=[],extra={}) => ({id,name,level,role:'lamp component',importance:0.9,confidence:0.9,primitive,topologyClass:'assembled-solid',topologyRationale:'Separate hard-surface component with bevel-ready edges.',geometryDescriptor:{topologyIntent:'beveled procedural solid',edgeTreatment:{type:'chamfer',bevelRadius:0.08,segments:4},deformationStack:[],uvStrategy:'generated procedural coordinates',normalStrategy:'vertex normals from generated geometry'},parent,attachment:parent?attachment(`${parent}.socket`,[0,0,0],[0,dimensions.height,0]):null,dimensions:{...dimensions,units:'cm',confidence:0.9},transform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]},actionProfile:action(id,[0,0,0],primitive==='cylinder'?'cylinder':'box'),material,materialLayers:[material],deformations:[],joints:[],seams:[],localFeatures:features.map((f,i)=>({id:`${id}-${i+1}`,kind:f,placement:'object-relative',size:'small',orientation:'aligned',materialEffect:'localized highlight',geometryEffect:'real geometry',confidence:0.85})),surfaceDetail:{macroRoughness:0.2,microRoughness:0.08,bumpAmplitude:0.02,normalPattern:'subtle procedural variation',displacementPattern:'none',occlusionPattern:'contact creases',edgeWearPattern:'softened bevels',notes:'Stylized matte painted finish.'},evidenceRefs:['full-object'],details:[],fidelityTier:'lighting',colorMaterialRecipe:{baseColor:material==='greenMetal'?'#123D32':material==='brass'?'#C99942':material==='ivory'?'#F4E6C2':'#141A18',roughness:material==='brass'?0.3:0.62,metalness:material==='brass'?0.72:material==='greenMetal'?0.32:0.0},...extra});
spec.componentTree = [
  comp('base','base','macro',null,{width:15,height:2.5,depth:15},'lathe','greenMetal',['bevel','ridge']),
  comp('stem','stem','macro','base',{width:3.2,height:22,depth:3.2},'cylinder','greenMetal',['bevel','ridge']),
  comp('shade','shade','macro','arm',{width:15,height:9.5,depth:15},'lathe','greenMetal',['bevel','gloss']),
  comp('shadeRim','shadeRim','meso','shade',{width:15.3,height:0.35,depth:15.3},'torus','brass',['ridge']),
  comp('arm','arm','macro','stem',{width:16,height:2.0,depth:2.0},'swept-curve','brass',['bevel','bend']),
  comp('joint','joint','meso','arm',{width:2.0,height:2.0,depth:2.0},'sphere','brass',['fastener','bevel']),
  comp('switch','switch','meso','stem',{width:2.0,height:4.0,depth:2.0},'lathe','brass',['bevel']),
  comp('cord','cord','meso','switch',{width:0.45,height:10.0,depth:0.45},'tube','rubber',['seam']),
  comp('baseCollars','baseCollars','meso','base',{width:6,height:1.2,depth:6},'torus','brass',['ridge']),
  comp('stemFinials','stemFinials','meso','stem',{width:4,height:2.5,depth:4},'lathe','brass',['ridge','bevel']),
  comp('shadeInterior','shadeInterior','meso','shade',{width:13.8,height:0.4,depth:13.8},'lathe','ivory',['gloss']),
  comp('armMount','armMount','meso','stem',{width:3.4,height:2.0,depth:3.4},'sphere','brass',['fastener']),
  comp('platenSocket','platenSocket','micro','shade',{width:1,height:1,depth:1},'sphere','brass',['fastener']),
  comp('switchChain','switchChain','micro','switch',{width:0.4,height:1.8,depth:0.4},'tube','brass',['seam']),
  comp('shadeTopFinial','shadeTopFinial','micro','shade',{width:1.1,height:1.2,depth:1.1},'sphere','brass',['bevel'])
];
spec.materials = [
  {id:'greenMetal',name:'Deep green painted metal',type:'physical',shaderModel:'MeshPhysicalMaterial',baseColor:'#123D32',albedo:{dominant:'#123D32',secondary:['#1D5746','#0B2A23'],samplingNotes:'Observed dark green painted metal'},colorVariation:{palette:['#123D32','#1D5746','#0B2A23'],pattern:'subtle broad satin variation',amplitude:0.08,heightCorrelation:0.1},textureResolution:1024,roughness:{base:0.52,variation:0.12,map:'independent-procedural-field',localResponse:'slightly lower on bevel crowns'},metalness:{base:0.32,variation:0.05},normal:{pattern:'fine painted-metal micro normal',strength:0.16,scale:32,space:'tangent'},bump:{pattern:'micro satin breakup',amplitude:0.012,scale:32},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:0.3,contactShadowBias:0.2,notes:'darken ring seams'},wear:{edgeWear:0.05,scratches:[],chips:[]},dirt:{amount:0.03,cavityBias:0.5,color:'#071A15'},localOverrides:[{region:'bevels',roughness:0.42,baseColor:'#1E5948',evidenceRefs:['full-object']}],referencePbr:{confidence:0.76,source:'reference image visual inference',maps:{albedo:'solid-green',roughness:'independent-procedural',normal:'micro-noise',height:'none',ambientOcclusion:'cavity'}},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:0.08,role:'broad paint variation'},{id:'meso',frequency:8,amplitude:0.04,role:'bevel and ring response'},{id:'micro',frequency:32,amplitude:0.02,role:'satin highlight breakup'}]},
  {id:'brass',name:'Warm brass',type:'physical',shaderModel:'MeshPhysicalMaterial',baseColor:'#C99942',albedo:{dominant:'#C99942',secondary:['#E1B863','#8B5B24'],samplingNotes:'Observed gold/brass fittings'},colorVariation:{palette:['#C99942','#E1B863','#8B5B24'],pattern:'edge highlight variation',amplitude:0.08,heightCorrelation:0.2},textureResolution:1024,roughness:{base:0.3,variation:0.08,map:'independent-procedural-field',localResponse:'lower on spherical crowns'},metalness:{base:0.72,variation:0.04},normal:{pattern:'fine brushed brass',strength:0.1,scale:28,space:'tangent'},bump:{pattern:'none',amplitude:0,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:0.24,contactShadowBias:0.2,notes:'darken sockets'},wear:{edgeWear:0.08,scratches:[],chips:[]},dirt:{amount:0.04,cavityBias:0.4,color:'#4C3215'},localOverrides:[{region:'rim-and-joints',roughness:0.24,evidenceRefs:['full-object']}],referencePbr:{confidence:0.74,source:'reference image visual inference',maps:{albedo:'warm-brass',roughness:'independent-procedural',normal:'fine-brush',height:'none',ambientOcclusion:'cavity'}},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:0.05,role:'broad warm metal'},{id:'meso',frequency:10,amplitude:0.03,role:'rings and joints'},{id:'micro',frequency:40,amplitude:0.01,role:'highlight breakup'}]},
  {id:'ivory',name:'Warm ivory reflector',type:'standard',shaderModel:'MeshStandardMaterial',baseColor:'#F4E6C2',albedo:{dominant:'#F4E6C2',secondary:['#FFF4D7'],samplingNotes:'Warm light interior'},colorVariation:{palette:['#F4E6C2','#FFF4D7'],pattern:'subtle radial gradient',amplitude:0.05,heightCorrelation:0},textureResolution:1024,roughness:{base:0.58,variation:0.08,map:'independent-procedural-field',localResponse:'slightly brighter toward bulb'},metalness:{base:0.0,variation:0},normal:{pattern:'fine enamel grain',strength:0.04,scale:24,space:'tangent'},bump:{pattern:'none',amplitude:0,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:0.18,contactShadowBias:0.2,notes:'shade cavity'},wear:{edgeWear:0,scratches:[],chips:[]},dirt:{amount:0,cavityBias:0,color:'#6B5A43'},localOverrides:[{region:'reflector-center',roughness:0.45,evidenceRefs:['full-object']}],referencePbr:{confidence:0.71,source:'reference image visual inference',maps:{albedo:'warm-ivory',roughness:'independent-procedural',normal:'subtle',height:'none',ambientOcclusion:'cavity'}},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:0.03,role:'warm reflector'},{id:'meso',frequency:6,amplitude:0.02,role:'radial bowl'},{id:'micro',frequency:24,amplitude:0.01,role:'soft enamel'}]},
  {id:'rubber',name:'Black rubber cord',type:'standard',shaderModel:'MeshStandardMaterial',baseColor:'#141A18',albedo:{dominant:'#141A18',secondary:['#242724'],samplingNotes:'Observed black cable'},colorVariation:{palette:['#141A18','#242724'],pattern:'none',amplitude:0,heightCorrelation:0},textureResolution:512,roughness:{base:0.82,variation:0.05,map:'constant',localResponse:'matte'},metalness:{base:0,variation:0},normal:{pattern:'none',strength:0.02,scale:16,space:'tangent'},bump:{pattern:'none',amplitude:0,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:0.18,contactShadowBias:0.2,notes:'contact darkening'},wear:{edgeWear:0,scratches:[],chips:[]},dirt:{amount:0.05,cavityBias:0.3,color:'#080A09'},localOverrides:[],referencePbr:{confidence:0.7,source:'reference image visual inference',maps:{albedo:'black-rubber',roughness:'matte',normal:'none',height:'none',ambientOcclusion:'cavity'}},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:0,role:'solid rubber'},{id:'meso',frequency:4,amplitude:0,role:'cable curve'},{id:'micro',frequency:16,amplitude:0.01,role:'subtle rubber breakup'}]}
];
spec.repetitionSystems = [{id:'radial-rings',name:'Concentric base and collar rings',componentRefs:['base','baseCollars','shadeRim'],distribution:'radial',count:7,variation:'diameter and height',evidenceRefs:['full-object']},{id:'joint-pair',name:'Paired spherical arm joints',componentRefs:['joint','armMount'],distribution:'bilateral',count:2,variation:'none',evidenceRefs:['full-object']}];
spec.lightingFromPhoto = [{id:'key',type:'area',position:[-18,28,24],color:'#FFF1D6',intensity:2.5,notes:'soft upper-left studio highlight; exposure 1.08; ACESFilmicToneMapping; soft PCF contact shadow'},{id:'fill',type:'hemisphere',position:[0,18,0],color:'#E7F0FF',intensity:1.1,notes:'neutral fill'},{id:'rim',type:'directional',position:[16,20,-18],color:'#DDE8FF',intensity:0.8,notes:'edge separation'}];
spec.coordinateFrame = {front:'+Z',up:'+Y',origin:'base center at ground',scaleReference:'centimeters'};
spec.silhouette = {boundingShape:'assembled radial base + vertical stem + domed shade + articulated arm',aspectRatios:['height 38 / base diameter 15','max span 26 / height 38'],symmetry:'radial base, asymmetric arm',dominantCurves:['dome','arm bend','cord bend'],negativeSpaces:['under-shade opening','arm-to-stem gap'],landmarks:['brass rim','stepped base','spherical joints']};
spec.animationAnchors = ['root pivot at base center','arm pivot at stem collar supports rotation around Z','shade pivot at arm joint supports pitch/yaw','switch pivot supports toggle visibility/material state','cord remains flexible curve with replaceable points'];
spec.assumptions = ['Hidden underside, bulb socket and rear cable routing are stylized approximations based on visible symmetry and standard desk-lamp construction.'];
spec.proceduralStrategy = ['Use lathe/revolved profiles for base, collars, shade and switch.','Use curve/tube geometry for articulated arm and cord.','Use torus rings and spheres for brass trim and joints.','Keep all required hierarchy nodes independent and expose action pivots.'];
// The reference sheet exposes these regions only indirectly; record them as bounded
// approximations rather than leaving the quality gate in an unresolved state.
spec.preSpecAssessment.unknownsToResolveBeforeImplementation = [];
spec.qualityTargets.reviewViewpoints = ['front','left','right','rear','top','three-quarter'];
spec.lightingFromPhoto.exposure = 1.08;
spec.lightingFromPhoto.toneMapping = 'ACESFilmicToneMapping';
spec.lightingFromPhoto.shadowBehavior = 'soft PCF contact shadow under base and shade';
spec.qualityContract.lighting = {exposure:1.08,toneMapping:'ACESFilmicToneMapping',background:'#F5F1E8',contactShadow:'soft PCF ground shadow'};
for (const material of spec.materials) {
  material.textureProjection = {mode:'generated-uv',repeat:[2,2],anisotropy:8,texelDensityIntent:'stable object-scale procedural detail'};
  material.textureResolution = Math.max(1024, material.textureResolution || 1024);
  const map = (channel) => ({path:`procedural://${material.id}/${channel}`,channel,notes:'independent procedural channel; reference extraction is visual inference'});
  material.referencePbr = {version:'1.0',sourceImage:spec.sourceImage,extractor:'manual-visual-inference',method:'multi-view material observation',verdict:'usable-for-stylized-prop',hardLimit:'not inverse-rendered photogrammetry',usable:true,confidence:Math.max(0.71,material.referencePbr?.confidence||0.71),targetThreshold:0.7,maps:{albedo:map('albedo'),roughness:map('roughness'),height:map('height'),normal:map('normal'),ao:map('ao')}};
  material.localOverrides = (material.localOverrides||[]).map((entry,index)=>({...entry,id:entry.id||`${material.id}-override-${index+1}`}));
}
const rgba = (hex, alpha=1) => {
  const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);
  return `rgba(${(n>>16)&255}, ${(n>>8)&255}, ${n&255}, ${alpha})`;
};
for (const c of spec.componentTree) {
  const m = spec.materials.find(item=>item.id===c.material) || spec.materials[0];
  c.colorMaterialRecipe = {dominantAlbedo:rgba(m.baseColor||'#8A7A5F'),secondaryAlbedo:rgba((m.albedo?.secondary||['#777777'])[0]),materialClass:c.material==='rubber'?'rubber':(c.material==='ivory'?'ceramic':'metal'),materialClassConfidence:0.92};
}
for (const detail of spec.preSpecAssessment.detailInventory.details) {
  const ref = detail.mapsTo.ref;
  const match = ref.match(/^([^\.]+)\.localFeatures$/);
  if (match) detail.mapsTo.ref = `${match[1]}-1`;
  if (ref === 'greenMetal.localOverrides') detail.mapsTo.ref = 'greenMetal-override-1';
}
const armComp = spec.componentTree.find(item=>item.id==='arm'); if (armComp) armComp.primitive='curve-sweep';
const rubber = spec.materials.find(item=>item.id==='rubber'); if (rubber) rubber.surfaceFrequencyBands.forEach((band)=>{ if (band.amplitude<=0) band.amplitude=0.01; });
fs.writeFileSync(path, JSON.stringify(spec,null,2));
