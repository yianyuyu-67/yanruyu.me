import fs from 'node:fs';

const path = new URL('./object-sculpt-spec.json', import.meta.url);
const s = JSON.parse(fs.readFileSync(path, 'utf8'));
const ev = ['full-object','front','front-three-quarter','rear-three-quarter'];
const img = 'C:/Users/ZYB/Documents/个人网站/chair-preview/reference-main.png';

s.targetName = 'Carved Green Leather Chair';
s.targetId = 'chair';
s.suitability = 'conditional';
s.coordinateFrame = { front:'+Z', up:'+Y', lateral:'+X', origin:'four-foot ground-contact center', scaleReference:'10 cm = 1 scene unit; width 5.2, depth 6.25, height 10.5, seat height 4.8' };
s.scores = { object_isolation:3, silhouette_readability:3, depth_inference:2, primitive_decomposition:3, material_procedurality:3, occlusion_risk:1, interaction_fit:3 };
s.preSpecAssessment.unknownsToResolveBeforeImplementation = [];
s.silhouette = {
  boundingShape:'tall bilateral upholstered chair with an arched openwork crest, broad seat and four tapered legs',
  aspectRatios:['width:height 0.495','depth:height 0.595','seat height:total height 0.457'],
  symmetry:'bilateral at rest; carving and leather bulges retain slight local variation',
  dominantCurves:['arched crest','waisted shield back cushion','rounded seat crown','S-curved front legs'],
  negativeSpaces:['two tall side openings around the back cushion','crest scroll openings','open volume below seat'],
  landmarks:['foot plane y=0','seat top y=4.8','back cushion lower edge y=5.6','crest top y=10.5','front direction +Z']
};
s.viewEvidence = [
  {id:'full-object',view:'composite product sheet',imageRegion:{x:0,y:0,width:1,height:1,units:'normalized'},observations:['multiple views and printed dimensions'],confidence:.96},
  {id:'front',view:'front',imageRegion:{x:.13,y:.07,width:.33,height:.31,units:'normalized'},observations:['bilateral silhouette, crest, six buttons and front-leg curvature'],confidence:.95},
  {id:'front-three-quarter',view:'front-three-quarter',imageRegion:{x:.2,y:.43,width:.58,height:.44,units:'normalized'},observations:['seat depth, cushion crown, nailheads and leg placement'],confidence:.94},
  {id:'rear-three-quarter',view:'rear-three-quarter',imageRegion:{x:.5,y:.06,width:.4,height:.32,units:'normalized'},observations:['rear frame, back panel, open side frame and rear legs'],confidence:.82}
];

const action = (role, material='wood') => ({
  animationRole:role,
  pivot:{mode:'local-origin',localPosition:[0,0,0],axis:[0,1,0],confidence:.9},
  transformChannels:{translate:true,rotate:true,scale:true,bend:false,twist:false,detach:false,visibility:true,materialState:true},
  sockets:[], collider:{type:'box',offset:[0,0,0],scale:[1,1,1],isTrigger:false,notes:'simplified furniture proxy'}, constraints:[],
  destruction:{breakable:false,fractureGroup:role,seamRefs:[],detachableFragments:[],breakImpulse:0,debrisMaterial:material}
});
const recipe = material => ({
  dominantAlbedo:material==='leather'?'rgba(38,70,55,1)':material==='brass'?'rgba(180,137,72,1)':'rgba(82,45,27,1)',
  secondaryAlbedo:material==='leather'?'rgba(66,96,73,1)':material==='brass'?'rgba(220,180,105,1)':'rgba(126,75,43,1)',
  materialClass:material==='brass'?'metal':material==='leather'?'fabric':'wood', materialClassConfidence:.88, evidenceRefs:ev
});
const component = (id,name,level,parent,dimensions,position,material='wood',features=[],primitive='box',topologyClass='assembled-solid') => ({
  id,name,level,role:'chair component',importance:level==='macro'?1:level==='meso'?.82:.7,confidence:.86,
  primitive,topologyClass,topologyRationale:topologyClass==='continuous-sculpt'?'A smoothly varying silhouette requires an extruded or curve-swept volume.':topologyClass==='surface-relief'?'Recognizable raised or recessed detail rides on a parent surface.':'A discrete rigid or upholstered assembly with countable faces and rounded transitions.',
  geometryDescriptor:{topologyIntent:topologyClass==='continuous-sculpt'?'smooth lofted or swept volume':'rounded assembled furniture part',edgeTreatment:{type:'bevel',bevelRadius:level==='micro'?.035:material==='leather'?.16:.09,segments:level==='micro'?3:5},deformationStack:[],uvStrategy:'generated procedural coordinates',normalStrategy:'vertex normals from generated geometry'},
  parent,attachment:parent?{parentSocket:`mount-${parent}`,localStart:position,localEnd:position,contactType:'overlap',embedDepth:.04,gapTolerance:.02}:null,
  dimensions:{width:dimensions[0],height:dimensions[1],depth:dimensions[2],units:'world',confidence:.88},transform:{position,rotation:[0,0,0],scale:[1,1,1]},
  actionProfile:action(id==='chair'?'root':'static-part',material),material,materialLayers:[material],deformations:[],joints:[],seams:[],
  localFeatures:features.map(id=>({id,description:id.replaceAll('-',' '),placement:'component-local visible surface',size:level==='micro'?'micro':'meso',orientation:'follows component contour',materialEffect:'localized highlight and cavity response',geometryEffect:topologyClass==='surface-relief'?'raised or recessed relief':'silhouette or edge treatment',confidence:.85,evidenceRefs:ev})),
  surfaceDetail:{macroRoughness:material==='leather'?.42:.52,microRoughness:material==='leather'?.08:.06,bumpAmplitude:material==='leather'?.012:.018,normalPattern:material==='leather'?'fine leather grain':'subtle longitudinal wood grain',displacementPattern:'none',occlusionPattern:'attachment sockets and carved recesses',edgeWearPattern:'restrained bevel polish',notes:'Stylized miniature response'},
  evidenceRefs:ev,details:features,fidelityTier:'form-refinement',colorMaterialRecipe:recipe(material)
});

const c=[];
c.push(component('chair','chair','macro',null,[5.2,10.5,6.25],[0,0,0],'wood',['dimensioned-chair-silhouette']));
c.push(component('frameAssembly','wood frame assembly','macro','chair',[5.2,10.5,6.1],[0,5.25,0],'wood',['continuous-frame-hierarchy']));
c.push(component('seatFrame','seat frame','macro','frameAssembly',[5.15,.72,5.0],[0,3.92,.15],'wood',['rounded-seat-rails']));
c.push(component('seatCushion','thick leather seat cushion','macro','chair',[4.85,.92,4.65],[0,4.34,.38],'leather',['thick-rounded-seat','soft-crown'],'extrude','continuous-sculpt'));
c.push(component('backFrame','carved back frame','macro','frameAssembly',[5.0,6.55,1.0],[0,7.2,-2.38],'wood',['arched-back-frame','open-side-frame'],'curve-sweep','continuous-sculpt'));
c.push(component('backCushion','tufted back cushion','macro','chair',[3.65,4.55,.72],[0,7.65,-2.18],'leather',['back-cushion-outline','leather-bulges'],'extrude','continuous-sculpt'));
c.push(component('legSystem','four leg system','macro','frameAssembly',[5.0,4.15,5.35],[0,1.95,.15],'wood',['four-foot-ground-contact']));
c.push(component('frontRail','carved front seat rail','meso','seatFrame',[5.0,.58,.42],[0,3.82,2.35],'wood',['front-rail-bevel']));
c.push(component('sideRails','left and right seat rails','meso','seatFrame',[4.8,.56,.38],[0,3.84,.05],'wood',['side-rail-continuity']));
c.push(component('rearRail','rear seat rail','meso','seatFrame',[4.75,.56,.4],[0,3.84,-2.2],'wood',['rear-rail-socket']));
c.push(component('crestOrnament','mirrored carved crest scrolls','meso','backFrame',[4.45,1.15,.58],[0,9.85,-2.35],'wood',['crest-scrolls'],'curve-sweep','continuous-sculpt'));
c.push(component('crestRosette','central crest rosette','micro','crestOrnament',[.75,.72,.3],[0,10.08,-1.98],'wood',['crest-rosette'],'extrude','surface-relief'));
c.push(component('sideOpenwork','open side scroll frames','meso','backFrame',[4.9,4.7,.62],[0,7.65,-2.42],'wood',['side-cutouts'],'curve-sweep','continuous-sculpt'));
c.push(component('leftBackPost','left back post','meso','backFrame',[.42,5.85,.5],[2.18,7.35,-2.42],'wood',['post-curve'],'curve-sweep','continuous-sculpt'));
c.push(component('rightBackPost','right back post','meso','backFrame',[.42,5.85,.5],[-2.18,7.35,-2.42],'wood',['post-curve'],'curve-sweep','continuous-sculpt'));
c.push(component('lowerBackRail','lower back rail','meso','backFrame',[4.1,.44,.5],[0,5.48,-2.37],'wood',['cushion-support']));
c.push(component('frontLegs','curved front legs','meso','legSystem',[4.75,4.05,.7],[0,1.9,2.18],'wood',['front-leg-scurve'],'tapered-sweep','continuous-sculpt'));
c.push(component('leftFrontLeg','left curved front leg','meso','frontLegs',[.58,4.05,.64],[2.2,1.9,2.18],'wood',['pronounced-knee'],'tapered-sweep','continuous-sculpt'));
c.push(component('rightFrontLeg','right curved front leg','meso','frontLegs',[.58,4.05,.64],[-2.2,1.9,2.18],'wood',['pronounced-knee'],'tapered-sweep','continuous-sculpt'));
c.push(component('rearLegs','rear legs and back-post continuation','meso','legSystem',[4.45,4.1,.62],[0,1.92,-2.15],'wood',['rear-post-continuity'],'tapered-sweep','continuous-sculpt'));
c.push(component('leftRearLeg','left rear leg','meso','rearLegs',[.46,4.1,.55],[2.05,1.92,-2.15],'wood',['rear-leg-taper'],'tapered-sweep','continuous-sculpt'));
c.push(component('rightRearLeg','right rear leg','meso','rearLegs',[.46,4.1,.55],[-2.05,1.92,-2.15],'wood',['rear-leg-taper'],'tapered-sweep','continuous-sculpt'));
c.push(component('frontFeet','front foot carving pair','micro','frontLegs',[4.8,.62,.68],[0,.35,2.36],'wood',['front-foot-carving'],'ellipsoid','surface-relief'));
c.push(component('seatPiping','seat cushion piping','meso','seatCushion',[4.92,.18,4.72],[0,4.02,.38],'leather',['seat-piping'],'curve-sweep','fiber-strand'));
c.push(component('nailheadTrim','antique brass nailhead border','micro','seatFrame',[4.92,.17,4.76],[0,4.08,.38],'brass',['nailhead-trim'],'instanced-cluster','surface-relief'));
c.push(component('tuftButtons','six upholstery buttons','micro','backCushion',[2.25,2.55,.16],[0,7.8,-1.78],'leather',['tuft-buttons'],'instanced-cluster','surface-relief'));
c.push(component('tuftSeams','diamond tuft channels','micro','backCushion',[3.0,3.1,.08],[0,7.75,-1.79],'leather',['tuft-channels'],'curve-sweep','surface-relief'));
s.componentTree=c;

const pbr=(id,color,roughness,metalness=0)=>({
  id,name:id,type:'physical',shaderModel:'MeshPhysicalMaterial',baseColor:color,color,
  albedo:{dominant:color,secondary:[color],samplingNotes:'sampled/inferred from admitted chair crops'},
  colorVariation:{palette:[color],pattern:id==='wood'?'subtle longitudinal grain':'broad cushion value variation',amplitude:id==='leather'?.07:.045,heightCorrelation:.15},
  textureResolution:1024,textureProjection:{mode:'procedural-uv',repeat:[1.5,1.5],anisotropy:4,texelDensityIntent:'chair-scale'},
  surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:.05,role:'broad value shaping'},{id:'meso',frequency:8,amplitude:.022,role:'material variation'},{id:'micro',frequency:34,amplitude:.009,role:'highlight breakup'}],
  roughness:{base:roughness,variation:.07,map:'independent-procedural-field',localResponse:id==='leather'?'soft crown highlight':'bevel highlight'},
  metalness:{base:metalness,variation:id==='brass'?.05:.01},
  clearcoat:id==='leather'?{amount:.18,roughness:.48}:{amount:.08,roughness:.55},
  normal:{pattern:id==='wood'?'fine longitudinal grain':'fine leather grain',strength:id==='brass'?.03:.12,scale:22,space:'tangent'},
  bump:{pattern:id==='wood'?'grain':'pores',amplitude:id==='brass'?0:.008,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},
  ambientOcclusion:{cavityStrength:.24,contactShadowBias:.25,notes:'carving recesses, upholstery seams and frame sockets'},
  wear:{edgeWear:id==='wood'?.025:.01,scratches:[],chips:[]},dirt:{amount:.008,cavityBias:.22,color:'#2b211a'},
  localOverrides:[{id:id==='wood'?'wood-bevel-highlight':id==='leather'?'leather-satin-response':'brass-crown-highlight',region:id==='wood'?'rounded frame edges':id==='leather'?'cushion crowns':'nailhead crowns',effect:'localized roughness and value shift',evidenceRefs:ev}],
  referencePbr:{version:'1.0',sourceImage:id==='brass'?img:`chair-preview/material-${id}.png`,extractor:id==='brass'?'procedural-inference':'extract_pbr_evidence.py',method:id==='brass'?'stylized palette inference':'reference crop evidence extraction',verdict:'usable-for-stylized-preview',hardLimit:'single-image estimates contain baked lighting and are not exact inverse rendering',usable:true,confidence:id==='brass'?.72:.86,estimatedFidelity:id==='brass'?.72:.86,targetThreshold:.7,maps:{albedo:{path:id==='brass'?img:`chair-preview/material-evidence/${id}/${id}_albedo.png`},roughness:{path:id==='brass'?img:`chair-preview/material-evidence/${id}/${id}_roughness.png`},height:{path:id==='brass'?img:`chair-preview/material-evidence/${id}/${id}_height.png`},normal:{path:id==='brass'?img:`chair-preview/material-evidence/${id}/${id}_normal.png`},ao:{path:id==='brass'?img:`chair-preview/material-evidence/${id}/${id}_ao.png`}}},
  notes:'Stylized procedural material; hidden surfaces approximate.'
});
s.materials=[pbr('wood','#5A321F',.5,0),pbr('leather','#294C3A',.42,0),pbr('brass','#B88B4B',.34,.68)];
s.repetitionSystems=[
  {id:'tuft-button-grid',name:'six-button diamond tuft grid',componentRefs:['tuftButtons'],count:6,distribution:'two offset columns across three rows',spacing:{x:1.05,y:1.0,z:0},seed:17,instancing:'shared button geometry',evidenceRefs:['front','front-three-quarter']},
  {id:'seat-nailhead-border',name:'seat perimeter nailheads',componentRefs:['nailheadTrim'],count:40,distribution:'front and side perimeter with even spacing',spacing:{x:.32,y:0,z:.32},seed:23,instancing:'shared brass hemisphere geometry',evidenceRefs:['front-three-quarter']},
  {id:'mirrored-leg-pairs',name:'mirrored leg pairs',componentRefs:['leftFrontLeg','rightFrontLeg','leftRearLeg','rightRearLeg'],count:4,distribution:'bilateral front and rear sockets',spacing:{x:4.15,y:0,z:4.3},seed:7,instancing:'mirrored curve definitions',evidenceRefs:ev},
  {id:'crest-scroll-pair',name:'mirrored crest scrolls',componentRefs:['crestOrnament'],count:2,distribution:'bilateral around central rosette',spacing:{x:1.35,y:0,z:0},seed:11,instancing:'mirrored curve paths',evidenceRefs:['front']}
];
s.featureReviewTargets=[
  {id:'chair-proportions',name:'Dimensioned chair proportions and seat height',tier:'critical',passIds:['blockout'],minimumScore:.86,mustPass:true,componentRefs:['chair','seatFrame','backFrame','legSystem'],evidenceRefs:ev},
  {id:'crest-openwork',name:'Carved crest and real open side gaps',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:.82,mustPass:true,componentRefs:['crestOrnament','crestRosette','sideOpenwork'],evidenceRefs:['front','rear-three-quarter']},
  {id:'tufted-upholstery',name:'Six-point tufted green upholstery',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:.82,mustPass:true,componentRefs:['backCushion','tuftButtons','tuftSeams','seatCushion'],evidenceRefs:['front','front-three-quarter']},
  {id:'curved-legs',name:'Four grounded tapered legs with S-curved front pair',tier:'critical',passIds:['form-refinement'],minimumScore:.84,mustPass:true,componentRefs:['frontLegs','rearLegs','frontFeet'],evidenceRefs:ev},
  {id:'material-separation',name:'Wood leather and brass material separation',tier:'important',passIds:['material-pass','lighting-pass'],minimumScore:.72,mustPass:false,componentRefs:['frameAssembly','seatCushion','nailheadTrim'],evidenceRefs:['front-three-quarter']}
];
s.lightingFromPhoto=[
  {id:'key',type:'directional',color:'#FFF1DA',intensity:2.2,position:[7,12,10],size:5,role:'soft warm-white key; exposure 1.08; ACESFilmicToneMapping; contact shadow'},
  {id:'fill',type:'hemisphere',color:'#DDEAF2',intensity:1.7,position:[-6,9,-5],role:'cool fill lifting carved recesses'},
  {id:'rim',type:'directional',color:'#FFFFFF',intensity:.75,position:[-7,10,-8],role:'rear edge separation'}
];
s.lookDevTargets.lightingPass={keyLight:'warm-white directional',fillLight:'cool hemisphere',rimLight:'soft white rear directional',exposure:1.08,toneMapping:'ACESFilmicToneMapping',background:'#F7F5EF',contactShadow:'soft PCF shadow map'};
s.assumptions=['Hidden seat joinery uses overlapping sockets.','Rear cushion backing and carving reverse faces are approximate.','Dimensions use a 10:1 centimeter-to-scene-unit scale.'];
s.risks=['Dense crest carving is stylized procedural geometry rather than manufacturing-accurate relief.','The product sheet contains baked highlights, so material parameters are approximate.'];
s.performanceBudget.targetTriangles=55000;s.performanceBudget.maxDrawCalls=110;s.performanceBudget.fpsTarget=30;
s.proceduralStrategy=['Lock dimensioned blockout and ground contacts first.','Build the wood frame and real negative spaces before upholstery details.','Use curve sweeps for legs and crest, extruded rounded profiles for cushions, and instancing for buttons and nailheads.','Keep all repeated and replaceable details as named child groups.'];
fs.writeFileSync(path,JSON.stringify(s,null,2));
console.log(`wrote ${c.length} chair components`);
