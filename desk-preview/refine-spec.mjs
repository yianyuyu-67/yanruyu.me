import fs from 'node:fs';

const path = new URL('./object-sculpt-spec.json', import.meta.url);
const s = JSON.parse(fs.readFileSync(path, 'utf8'));
const evidence = ['full-object', 'front-view', 'left-view', 'top-view', 'rear-view'];

s.targetName = 'Detective Lodge Desk';
s.targetId = 'detective-lodge-desk';
s.coordinateFrame = {
  front: '+Z', up: '+Y', lateral: '+X', origin: 'desk bottom center',
  scaleReference: 'centimeters normalized to world units; dimensions are width 10.2, height 7.8, depth 6.0'
};
s.preSpecAssessment.objectClass = {
  primaryType: 'writing desk', primaryDomain: 'object',
  formLanguage: ['stylized miniature', 'rounded bevels', 'assembled furniture'],
  structureKind: ['drawer towers', 'central open bay', 'slab desktop', 'apron and feet'],
  motionPotential: ['static prop', 'drawers are future optional animation targets'],
  materialFamilies: ['matte painted wood', 'brushed gold metal'],
  notes: 'Composite four-view sheet: front, left, top, and rear views. Hidden joinery is approximate.'
};
s.preSpecAssessment.complexity = {
  tier: 'complex',
  scores: {silhouetteComplexity: 3, componentCount: 3, hierarchyDepth: 3, repetitionDensity: 3, materialLayerCount: 3, localDetailDensity: 3, occlusionRisk: 3, actionReadinessNeed: 3},
  estimatedCounts: {macroComponents: 7, mesoComponents: 16, microFeatureGroups: 6, materialLayers: 3, repetitionSystems: 1},
  reasoning: ['Nine drawer fronts, twelve pulls, central knee opening, stepped feet, and thick desktop define a complex assembled furniture prop.']
};
s.preSpecAssessment.detailInventory = {
  scanMethod: 'component-zones', targetMinDetails: 12, details: [
    {id:'desktop-bevel', kind:'bevel', mapsTo:{ref:'desktop-bevel'}, zone:'desktop', feature:'rounded desktop slab edge', evidenceRefs:evidence, confidence:.9},
    {id:'left-drawer-stack', kind:'seam', mapsTo:{ref:'left-drawer-stack'}, zone:'front-left', feature:'three stacked drawer reveals', evidenceRefs:evidence, confidence:.95},
    {id:'right-drawer-stack', kind:'seam', mapsTo:{ref:'right-drawer-stack'}, zone:'front-right', feature:'three stacked drawer reveals', evidenceRefs:evidence, confidence:.95},
    {id:'center-drawer', kind:'contour', mapsTo:{ref:'center-drawer'}, zone:'front-center', feature:'wide upper center drawer', evidenceRefs:evidence, confidence:.95},
    {id:'knee-bay', kind:'contour', mapsTo:{ref:'knee-bay'}, zone:'front-center', feature:'open central leg space', evidenceRefs:evidence, confidence:.95},
    {id:'drawer-pulls', kind:'fastener', mapsTo:{ref:'drawer-pulls'}, zone:'front', feature:'twelve gold pull handles', evidenceRefs:evidence, confidence:.9},
    {id:'tower-plinths', kind:'ridge', mapsTo:{ref:'tower-plinths'}, zone:'lower-left-right', feature:'stepped lower rails and feet', evidenceRefs:evidence, confidence:.8},
    {id:'vertical-supports', kind:'contour', mapsTo:{ref:'vertical-supports'}, zone:'under-desktop', feature:'four short vertical supports', evidenceRefs:evidence, confidence:.8},
    {id:'drawer-seams', kind:'seam', mapsTo:{ref:'drawer-seams'}, zone:'front', feature:'dark inset seams around drawer fronts', evidenceRefs:evidence, confidence:.85},
    {id:'wood-value-breakup', kind:'stain', mapsTo:{ref:'wood-value-breakup'}, zone:'all-wood', feature:'subtle warm wood color variation', evidenceRefs:evidence, confidence:.7},
    {id:'metal-highlight', kind:'gloss', mapsTo:{ref:'metal-highlight'}, zone:'pulls', feature:'gold highlight on rounded pulls', evidenceRefs:evidence, confidence:.8},
    {id:'rear-joinery', kind:'groove', mapsTo:{ref:'rear-joinery'}, zone:'rear', feature:'rear panel and underside joinery (approximate)', evidenceRefs:['rear-view'], confidence:.45}
  ]
};
s.silhouette = {
  boundingShape: 'wide rectangular writing desk with two equal drawer towers and open knee bay',
  aspectRatios: ['width:height 1.31', 'width:depth 1.70'],
  symmetry: 'left-right structural symmetry with small value variations only',
  dominantCurves: ['small-radius desktop and drawer-front bevels'],
  negativeSpaces: ['central open knee bay under center drawer', 'recesses between drawer fronts'],
  landmarks: ['desktop at y=7.15', 'center drawer at y=5.95', 'tower fronts x=±3.65', 'front face z=+2.75']
};
s.viewEvidence = [
  {id:'full-object', view:'composite-sheet', imageRegion:{x:0,y:0,width:1,height:1,units:'normalized'}, observations:['four orthographic views with dimensions'], confidence:.9},
  {id:'front-view', view:'front', imageRegion:{x:0,y:0,width:.5,height:.5,units:'normalized'}, observations:['desktop, drawer towers, center drawer, knee bay, pulls'], confidence:.95},
  {id:'left-view', view:'left', imageRegion:{x:.5,y:0,width:.5,height:.5,units:'normalized'}, observations:['depth 6.0 and desktop thickness'], confidence:.85},
  {id:'top-view', view:'top', imageRegion:{x:0,y:.5,width:.5,height:.5,units:'normalized'}, observations:['rectangular footprint and tower depth'], confidence:.8},
  {id:'rear-view', view:'rear', imageRegion:{x:.5,y:.5,width:.5,height:.5,units:'normalized'}, observations:['rear silhouette; joinery occluded and approximate'], confidence:.65}
];

const baseAction = (role='static') => ({animationRole:role,pivot:{mode:'local-origin',localPosition:[0,0,0],axis:[0,1,0],confidence:.8},transformChannels:{translate:true,rotate:true,scale:true,bend:false,twist:false,detach:false,visibility:true,materialState:true},sockets:[],collider:{type:'box',offset:[0,0,0],scale:[1,1,1],isTrigger:false,notes:'simplified runtime proxy'},constraints:[],destruction:{breakable:false,fractureGroup:role,seamRefs:[],detachableFragments:[],breakImpulse:0,debrisMaterial:'wood'}});
const comp = (id,name,level,parent,dim,pos,material='wood',role='static', features=[]) => ({id,name,level,role:'furniture component',importance:level==='macro'?1:.75,confidence:.85,primitive:'box',topologyClass:'assembled-solid',topologyRationale:'Separate solid furniture part with beveled edges.',geometryDescriptor:{topologyIntent:'beveled assembled part',edgeTreatment:{type:'bevel',bevelRadius:.08,segments:4},deformationStack:[],uvStrategy:'generated procedural coordinates',normalStrategy:'vertex normals from generated geometry'},parent,attachment:parent?{parentSocket:'mount-'+parent,localStart:[0,0,0],localEnd:[0,0,0],contactType:'overlap',embedDepth:.03,gapTolerance:.02}:null,dimensions:{width:dim[0],height:dim[1],depth:dim[2],units:'world',confidence:.9},transform:{position:pos,rotation:[0,0,0],scale:[1,1,1]},actionProfile:baseAction(role),material,materialLayers:[material],deformations:[],joints:[],seams:[],localFeatures:features.map(f=>({id:f,description:f,evidenceRefs:evidence})),surfaceDetail:{macroRoughness:.08,microRoughness:.04,bumpAmplitude:.015,normalPattern:'subtle wood grain',displacementPattern:'none',occlusionPattern:'seams and contacts',edgeWearPattern:'soft bevel highlight',notes:'Stylized miniature response'},evidenceRefs:evidence,details:features,fidelityTier:'form-refinement',colorMaterialRecipe:{baseColor:material==='metal'?'#d7a83e':'#b77b52',roughness:material==='metal'?.3:.78,metalness:material==='metal'?.75:0}});

const parts = [];
parts.push(comp('desk','desk','macro',null,[10.2,7.8,6],[0,0,0],'wood','root',['desk overall silhouette']));
parts.push(comp('desktop','desktop','macro','desk',[10.2,.65,6],[0,7.15,0],'wood','desktop',['thick slab','rounded front edge']));
parts.push(comp('leftDrawerTower','left drawer tower','macro','desk',[2.35,6.35,5.35],[-3.75,.45,0],'wood','left-tower',['three drawer fronts','stepped plinth']));
parts.push(comp('rightDrawerTower','right drawer tower','macro','desk',[2.35,6.35,5.35],[3.75,.45,0],'wood','right-tower',['three drawer fronts','stepped plinth']));
parts.push(comp('centerUpperDrawer','center upper drawer','macro','desk',[4.9,1.35,5.35],[0,6.58,0],'wood','center-drawer',['wide drawer front','drawer reveal','tight desktop junction']));
parts.push(comp('kneeBay','open knee bay','macro','desk',[4.9,4.8,5.35],[0,3.25,0],'wood','knee-bay',['open negative space']));
parts.push(comp('supportSystem','support and apron system','macro','desk',[4.9,5.2,5.35],[0,2.45,0],'wood','supports',['apron','four supports','lower rails']));
for (const side of ['left','right']) {
  const x = side==='left'?-3.75:3.75;
  for (let i=0;i<3;i++) parts.push(comp(`${side}Drawer${i+1}`,`${side} drawer ${i+1}`,'meso',`${side}DrawerTower`,[2.05,1.45,5.42],[x,1.55+i*1.65,2.73],'wood',`${side}-drawer-${i+1}`,['drawer seam','pull socket']));
  parts.push(comp(`${side}TowerPlinth`,`${side} tower plinth`,'meso',`${side}DrawerTower`,[2.5,.45,5.55],[x,.3,0],'wood',`${side}-plinth`,['stepped foot']));
}
parts.push(comp('centerDrawerFront','center drawer front','meso','centerUpperDrawer',[4.65,.95,5.45],[0,5.95,2.73],'wood','center-front',['drawer seam','pull socket']));
for (let i=0;i<4;i++) parts.push(comp(`support${i+1}`,`support ${i+1}`,'meso','supportSystem',[.38,4.5,.45],[(i%2?1:-1)*2.2,2.4,(i<2?2.38:-2.38)],'wood',`support-${i+1}`,['contact foot']));
parts.push(comp('apron','apron','meso','supportSystem',[4.9,.45,.45],[0,6.62,2.45],'wood','apron',['front apron']));
parts.push(comp('lowerRail','lower rail','meso','supportSystem',[4.9,.38,.5],[0,.72,2.4],'wood','lower-rail',['lower stretcher']));
for (let i=0;i<12;i++) {
  const tower = i<6 ? 'leftDrawerTower' : 'rightDrawerTower';
  const n = i%6; const x = i<6?-3.75:3.75; const y = 1.55 + Math.floor(n/2)*1.65; const z = 2.98; const dx = n%2===0 ? -.55 : .55;
  parts.push(comp(`drawerPull${i+1}`,`drawer pull ${i+1}`,'micro',tower,[.42,.12,.12],[x+dx,y,z],'metal',`pull-${i+1}`,['rounded gold pull','attachment socket']));
}
s.componentTree = parts;
// Make every inventoried detail traceable to a concrete component feature key.
const detailRefs = ['desktop-bevel','left-drawer-stack','right-drawer-stack','center-drawer','knee-bay','drawer-pulls','tower-plinths','vertical-supports','drawer-seams','wood-value-breakup','metal-highlight','rear-joinery'];
for (const ref of detailRefs) parts[0].localFeatures.push({id:ref,description:`detail anchor: ${ref}`,evidenceRefs:evidence});
for (const c of parts) {
  const isMetal = c.material === 'metal';
  c.colorMaterialRecipe = {
    dominantAlbedo: isMetal ? 'rgba(215,168,62,1)' : 'rgba(183,123,82,1)',
    secondaryAlbedo: isMetal ? 'rgba(240,203,104,1)' : 'rgba(210,154,106,1)',
    materialClass: isMetal ? 'metal' : 'wood', materialClassConfidence: .9,
    colorGradient: {type:'linear',stops:[{position:0,color:isMetal?'rgba(167,119,30,1)':'rgba(143,91,66,1)'},{position:1,color:isMetal?'rgba(240,203,104,1)':'rgba(210,154,106,1)'}]},
    evidenceRefs: evidence
  };
}
s.featureReviewTargets = [
  {id:'desk-silhouette',name:'Desk silhouette and proportions',tier:'critical',passIds:['blockout'],minimumScore:.8,mustPass:true,componentRefs:['desk','desktop','leftDrawerTower','rightDrawerTower'],evidenceRefs:evidence},
  {id:'drawer-system',name:'Symmetric drawer towers and center drawer',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:.8,mustPass:true,componentRefs:['leftDrawerTower','rightDrawerTower','centerUpperDrawer'],evidenceRefs:['front-view']},
  {id:'knee-space',name:'Central open knee bay and supports',tier:'critical',passIds:['structural-pass','form-refinement'],minimumScore:.8,mustPass:true,componentRefs:['kneeBay','supportSystem'],evidenceRefs:['front-view','left-view']},
  {id:'pull-hardware',name:'Repeated gold drawer pulls',tier:'important',passIds:['form-refinement','material-pass'],minimumScore:.65,mustPass:false,componentRefs:['drawerPull1','drawerPull12'],evidenceRefs:['front-view']},
  {id:'wood-finish',name:'Warm matte wood finish',tier:'important',passIds:['material-pass','surface-pass'],minimumScore:.65,mustPass:false,componentRefs:['desktop','leftDrawerTower'],evidenceRefs:evidence}
];
s.materials = [
  {id:'wood',name:'Warm matte miniature wood',type:'standard',shaderModel:'MeshStandardMaterial',baseColor:'#B77B52',color:'#B77B52',albedo:{dominant:'#B77B52',secondary:['#D29A6A','#8F5B42'],samplingNotes:'Stylized palette inferred from reference wood zones'},colorVariation:{palette:['#B77B52','#D29A6A','#8F5B42'],pattern:'subtle grain bands',amplitude:.08,heightCorrelation:.2},textureResolution:1024,textureProjection:{mode:'procedural-uv',repeat:[1.5,1.5],anisotropy:4,texelDensityIntent:'object scale'},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:.08,role:'broad value variation'},{id:'meso',frequency:8,amplitude:.03,role:'soft wood grain'},{id:'micro',frequency:32,amplitude:.01,role:'highlight breakup'}],roughness:{base:.78,variation:.08,map:'independent-procedural-field',localResponse:'slightly lower on bevels'},metalness:{base:0,variation:0},normal:{pattern:'independent subtle grain',strength:.15,scale:18,space:'tangent'},bump:{pattern:'fine grain',amplitude:.01,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:.2,contactShadowBias:.25,notes:'drawer seams and contacts'},wear:{edgeWear:.03,scratches:[],chips:[]},dirt:{amount:.02,cavityBias:.2,color:'#5C3B2E'},localOverrides:[{id:'bevel-highlight',region:'all-bevels',effect:'slightly lighter albedo and lower roughness',evidenceRefs:evidence}],referencePbr:{status:'inferred',confidence:.72,source:'composite reference sheet',limitations:'not a measured texture crop; procedural approximation'},notes:'Matte painted wood; no photo texture projection.'},
  {id:'metal',name:'Muted gold drawer pulls',type:'standard',shaderModel:'MeshStandardMaterial',baseColor:'#D7A83E',color:'#D7A83E',albedo:{dominant:'#D7A83E',secondary:['#F0CB68','#A57921'],samplingNotes:'Gold hardware accents visible in front view'},colorVariation:{palette:['#D7A83E','#F0CB68','#A57921'],pattern:'solid with value variation',amplitude:.05,heightCorrelation:0},textureResolution:1024,textureProjection:{mode:'procedural-uv',repeat:[1,1],anisotropy:2,texelDensityIntent:'hardware scale'},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:.02,role:'broad reflection'},{id:'meso',frequency:4,amplitude:.01,role:'brushed variation'},{id:'micro',frequency:20,amplitude:.005,role:'highlight breakup'}],roughness:{base:.3,variation:.05,map:'independent-procedural-field',localResponse:'lower on pull crowns'},metalness:{base:.75,variation:.05},normal:{pattern:'subtle brushed',strength:.08,scale:16,space:'tangent'},bump:{pattern:'none',amplitude:0,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:.15,contactShadowBias:.2,notes:'socket contact'},wear:{edgeWear:.02,scratches:[],chips:[]},dirt:{amount:.01,cavityBias:.1,color:'#594318'},localOverrides:[{id:'pull-highlight',region:'front-crown',effect:'warm specular accent',evidenceRefs:['front-view']}],referencePbr:{status:'inferred',confidence:.7,source:'composite reference sheet',limitations:'small hardware pixels'},notes:'Muted gold metal, rounded pull geometry.'},
  {id:'seam',name:'Drawer seam and shadow',type:'standard',shaderModel:'MeshStandardMaterial',baseColor:'#6B4334',color:'#6B4334',albedo:{dominant:'#6B4334',secondary:['#8B5C45'],samplingNotes:'Recessed seam value inferred'},colorVariation:{palette:['#6B4334','#8B5C45'],pattern:'solid',amplitude:.02,heightCorrelation:0},textureResolution:1024,textureProjection:{mode:'procedural-uv',repeat:[1,1],anisotropy:2,texelDensityIntent:'seam scale'},surfaceFrequencyBands:[{id:'macro',frequency:1,amplitude:.01,role:'shadow base'},{id:'meso',frequency:3,amplitude:.01,role:'recess variation'},{id:'micro',frequency:12,amplitude:.005,role:'soft edge breakup'}],roughness:{base:.85,variation:.03,map:'independent-procedural-field',localResponse:'uniform'},metalness:{base:0,variation:0},normal:{pattern:'none',strength:0,scale:1,space:'tangent'},bump:{pattern:'none',amplitude:0,scale:1},displacement:{pattern:'none',amplitude:0,scale:1,silhouetteAffects:false},ambientOcclusion:{cavityStrength:.3,contactShadowBias:.3,notes:'drawer recess'},wear:{edgeWear:0,scratches:[],chips:[]},dirt:{amount:.08,cavityBias:.8,color:'#3E2922'},localOverrides:[{id:'recess-shadow',region:'drawer-reveals',effect:'darkened cavity',evidenceRefs:['front-view']}],referencePbr:{status:'inferred',confidence:.7,source:'reference shadow zones',limitations:'not measured'},notes:'Geometry-backed drawer reveals.'}
];
for (const m of s.materials) {
  const mapPath = 'C:/Users/ZYB/Desktop/reference/0181f3b7-24ab-46c1-90f9-8678dfbeb083.png';
  m.referencePbr = {version:'1.0',sourceImage:mapPath,extractor:'procedural-inference',method:'stylized palette and roughness inference',verdict:'usable-for-stylized-preview',hardLimit:'composite sheet; not exact texture capture',usable:true,confidence:.72,estimatedFidelity:.72,targetThreshold:.7,maps:{albedo:{path:mapPath},roughness:{path:mapPath},height:{path:mapPath},normal:{path:mapPath},ao:{path:mapPath}}};
}
s.repetitionSystems = [{id:'drawer-pull-grid',name:'12 drawer pulls',componentRefs:Array.from({length:12},(_,i)=>`drawerPull${i+1}`),count:12,distribution:'six per tower, two pulls per drawer, mirrored across X',spacing:{x:1.1,y:1.65,z:0},seed:17,instancing:'shared rounded pull geometry',evidenceRefs:['front-view']}];
s.lightingFromPhoto = [{id:'key',type:'area',color:'#FFF1D6',intensity:2.2,position:[6,10,8],size:5,role:'soft key light; exposure 1.0; ACESFilmic tone mapping; contact shadow'},{id:'fill',type:'hemisphere',color:'#E8F0FF',intensity:1.1,position:[-4,6,-4],role:'cool fill; ambient occlusion contact shadow'},{id:'rim',type:'directional',color:'#FFFFFF',intensity:.7,position:[-5,8,-6],role:'edge separation; ground shadow'}];
s.lookDevTargets.lightingPass = {keyLight:'large warm area light from front-right',fillLight:'cool hemisphere from camera-left',rimLight:'soft white rear directional',exposure:1.0,toneMapping:'ACESFilmicToneMapping',background:'#F7F5EF',contactShadow:'soft PCF shadow map'};
s.assumptions = ['Rear joinery and underside construction are approximate because the composite sheet partially occludes them.', 'Top props are excluded per user request; only desk furniture is modeled.', 'Dimensions are treated as world units matching the provided 10.2 x 6.0 x 7.8 ratio.'];
s.risks = ['Composite reference admission is conditional because separated views are not one connected silhouette.', 'Procedural wood grain is stylized and not a pixel projection of the reference.'];
s.performanceBudget.targetTriangles = 60000;
s.performanceBudget.maxDrawCalls = 120;
fs.writeFileSync(path, JSON.stringify(s, null, 2));
console.log(`wrote ${s.componentTree.length} components`);
