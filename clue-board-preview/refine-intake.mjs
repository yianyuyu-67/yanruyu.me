import fs from 'node:fs';

const assessmentPath = new URL('./assessment.json', import.meta.url);
const diPath = new URL('./di.json', import.meta.url);
const assessment = JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));
const root = assessment.preSpecAssessment;
root.sourceImage = 'C:/Users/ZYB/Documents/个人网站/clue-board-preview/reference.png';
root.objectClass = {
  primaryType: 'wall-mounted investigation clue board',
  primaryDomain: 'object',
  formLanguage: ['hard-surface','layered-paper-relief','fiber-strand-network'],
  structureKind: ['compound-object','layered-shell','repeated-modules','branching-hierarchy'],
  motionPotential: ['static-prop','whole-object-transform','rearrangeable-content'],
  materialFamilies: ['wood','cork','paper','photographic-print','metal','cord','tape'],
  notes: 'Observed front-facing rectangular board with shallow layered content and a red string network.'
};
root.complexity = {
  tier: 'complex',
  scores: { silhouetteComplexity:1, componentCount:3, hierarchyDepth:2, repetitionDensity:3, materialLayerCount:3, localDetailDensity:3, occlusionRisk:2, actionReadinessNeed:2 },
  estimatedCounts: { macroComponents:3, mesoComponents:22, microFeatureGroups:7, materialLayers:7, repetitionSystems:4 },
  reasoning: [
    'The outer silhouette is simple but the front face contains many independently layered papers, pins, and strings.',
    'Fidelity depends on depth ordering, repeated fasteners, replaceable content carriers, and a connected curve network.'
  ]
};
root.specDepthDecision = {
  requiredDepth:'complex', minimumComponentLevels:['macro','meso','micro'], needsRepetitionSystems:true,
  needsMaterialLocalOverrides:true, needsMultipleReviewViews:true, needsActionReadyHierarchy:true,
  rationale:'Independent content transforms and string-to-pin anchors require a deep, addressable scene graph.'
};
root.unknownsToResolveBeforeImplementation = [
  'Rear mounting hardware and rear finish are hidden and will be approximate.',
  'Exact physical dimensions are absent; nominal dimensions are scalable.',
  'Exact readable text and photo subjects are represented by replaceable placeholders.',
  'Hidden fastener lengths and the cork backing construction are approximate.'
];

const details = [
  ['frame-bevel','bevel','Rounded wood frame edges catch a soft rim highlight','frame-edge','macro','geometry','component.localFeatures','woodFrame.edgeBevel',0.97],
  ['wood-grain','linework','Low-contrast longitudinal grain follows each wood frame rail','frame-rails','meso','albedo+roughness','material.localOverrides','woodMaterial.grainBands',0.88],
  ['cork-mottle','stain','Irregular pale and darker cork flecks break the flat orange field','board-field','micro','albedo+roughness','material.localOverrides','corkMaterial.mottle',0.9],
  ['paper-relief','bevel','Paper, notes, and photos stand slightly proud at varied depths','front-content','meso','geometry','component.localFeatures','contentCards.shallowRelief',0.98],
  ['paper-rotation','contour','Independent slight rotations and folded corners create an irregular paper silhouette','front-content','meso','geometry','component.localFeatures','contentCards.transformVariation',0.96],
  ['replaceable-prints','decal','Map/photo/note/document graphics occupy separate texture carriers','content-faces','micro','albedo','material.localOverrides','contentMaterials.replaceableTexturePaths',0.99],
  ['pin-cluster','fastener','Silver and red round pin heads repeat across content anchors','front-content','micro','geometry+metalness','component.localFeatures','boardPins.pinSystem',0.99],
  ['red-string-network','linework','Nine red cords form a connected curved network between pin heads','front-content','meso','geometry+albedo','component.localFeatures','boardStrings.curveNetwork',0.99],
  ['string-depth','ridge','Strings sit in front of papers and clear their faces','front-content','micro','geometry','component.localFeatures','boardStrings.frontClearance',0.95],
  ['tape-tabs','decal','Semi-opaque warm tape tabs overlap selected top edges','paper-attachments','micro','geometry+opacity','component.localFeatures','tapeTabs.overlapSystem',0.9],
  ['title-plaque','bevel','Wide white title plaque overlaps the frame near top center','top-center','meso','geometry+albedo','component.localFeatures','boardNotes.titlePlaque',0.98],
  ['rear-panel','seam','A shallow rear panel and cleats provide plausible hidden mounting depth','rear','meso','geometry','component.localFeatures','rearMounting.approximate',0.42],
];
root.detailInventory = {
  scanMethod:'grid-3x3', targetMinDetails:10,
  details:details.map(([id,kind,description,region,scale,affects,type,ref,confidence])=>({id,kind,description,region:{id:region},scale,affects,mapsTo:{type,ref},evidenceRef:'reference.png',confidence}))
};

assessment.qualityContract = {
  qualityBar:'complex',
  definitionOfDone:[
    'The model reads as the supplied investigation board from front and three-quarter views: thick wood frame, recessed cork, layered replaceable papers, mixed pins, and a connected red string network.',
    'All required content groups are independently addressable and every content card retains editable position, rotation, scale, and texture path.',
    'Side, top, and rear views prove real shallow thickness; hidden rear structures remain explicitly marked approximate.'
  ],
  minimumSpecDepth:{macroComponents:3,mesoComponents:18,microFeatureGroups:7,materialLayers:7,repetitionSystems:4,reviewViewpoints:5},
  featureGroups:[
    {id:'frame-and-cork',name:'Thick rounded wood frame and recessed cork',required:true,qualityCriteria:['Overall 12:8.8 proportion and frame thickness remain consistent','Frame and cork are real solids with readable depth'],evidenceRefs:['reference.png'],failureModes:['thin plane silhouette','frame rails float or split']},
    {id:'content-layering',name:'Independent layered evidence carriers',required:true,qualityCriteria:['Map, photos, notes and documents are separate shallow solids','Individual transforms and replacement paths remain accessible'],evidenceRefs:['reference.png'],failureModes:['content fused into board','flat coplanar z-fighting']},
    {id:'pins-and-strings',name:'Anchored pin and red-string network',required:true,qualityCriteria:['Pins remain separate from cork and papers','Every tube curve begins and ends at declared pin anchors'],evidenceRefs:['reference.png'],failureModes:['floating string ends','strings merged into the backing','strings intersect paper faces']},
    {id:'replaceable-content',name:'Replaceable printed materials',required:true,qualityCriteria:['Map, photo, note and document textures expose stable paths','Placeholder graphics remain legible without asserting exact content'],evidenceRefs:['reference.png'],failureModes:['baked reference lighting','single irreversible board texture']},
    {id:'material-separation',name:'Wood, cork, paper, metal, tape and cord response',required:true,qualityCriteria:['Wood/cork/paper use separate roughness ranges','Pins show restrained metal highlights and tape remains semi-opaque'],evidenceRefs:['reference.png'],failureModes:['uniform plastic response','overly glossy paper or cork']}
  ],
  visualDeltaChecks:['12:8.8 silhouette ratio','frame/cork inset and depth','paper count and distribution','pin and string endpoint alignment','front-to-back layering in orbit views'],
  antiShallowSpecRules:[
    'Do not merge the required movable groups.',
    'Do not represent strings as painted lines.',
    'Do not place content cards at one shared depth.',
    'Do not claim the approximate rear hardware is reference-exact.'
  ]
};
assessment.sourceImage = root.sourceImage;
fs.writeFileSync(assessmentPath, `${JSON.stringify(assessment,null,2)}\n`);

const di = JSON.parse(fs.readFileSync(diPath,'utf8'));
di.sourceImage = root.sourceImage;
di.detailInventory = root.detailInventory;
di.authoringInstruction = 'Subject-specific detail inventory completed; every entry maps to a planned component feature or material override.';
fs.writeFileSync(diPath, `${JSON.stringify(di,null,2)}\n`);
