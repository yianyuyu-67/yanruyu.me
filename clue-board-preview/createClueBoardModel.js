import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CLUE_BOARD_DIMENSIONS = Object.freeze({ width: 12, height: 8.8, structuralDepth: 0.72, overallDepth: 1.1 });

const palette = Object.freeze({
  wood: 0xa76536,
  woodDark: 0x704426,
  woodLight: 0xc88950,
  cork: 0xe8ad6f,
  corkLight: 0xf1c68d,
  paper: 0xf6f0df,
  paperCool: 0xe6eaeb,
  ink: 0x41474a,
  photo: 0x626668,
  red: 0xd83a32,
  metal: 0xc8c9c4,
  tape: 0xe9d8ac,
});

function physical(color, roughness, metalness = 0, extras = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness, ...extras });
}

export const CLUE_BOARD_MATERIALS = Object.freeze({
  wood: physical(palette.wood, 0.58, 0, { clearcoat: 0.08, clearcoatRoughness: 0.68 }),
  woodDark: physical(palette.woodDark, 0.64),
  woodLight: physical(palette.woodLight, 0.54),
  cork: physical(palette.cork, 0.9),
  corkLight: physical(palette.corkLight, 0.86),
  paper: physical(palette.paper, 0.88),
  paperCool: physical(palette.paperCool, 0.84),
  photo: physical(palette.photo, 0.72),
  ink: physical(palette.ink, 0.76),
  red: physical(palette.red, 0.48),
  metal: physical(palette.metal, 0.32, 0.58),
  tape: physical(palette.tape, 0.82, 0, { transparent: true, opacity: 0.78 }),
  clayFrame: physical(0x9c8069, 0.82),
  clayBoard: physical(0xc9a47e, 0.9),
  clayPaper: physical(0xd8d5cd, 0.9),
  clayDetail: physical(0x9f8e84, 0.8),
});

function finish(object, partId = object.name) {
  object.castShadow = true;
  object.receiveShadow = true;
  object.userData.partId = partId;
  object.userData.explodeWithParent = true;
  return object;
}

function rounded(name, size, position, material, radius = 0.08, segments = 4) {
  const safeRadius = Math.min(radius, Math.min(...size) * 0.45);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, segments, safeRadius), material);
  mesh.name = name;
  mesh.position.set(...position);
  return finish(mesh);
}

function makeCanvasTexture(kind, label, accent = '#d83a32') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  context.fillStyle = kind === 'photo' ? '#d8d9d6' : kind === 'map' ? '#edf0ed' : '#f7f2e6';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (kind === 'photo') {
    context.fillStyle = '#757c7c';
    context.fillRect(22, 24, 468, 250);
    context.fillStyle = '#aeb3b0';
    context.fillRect(42, 52, 110, 170);
    context.fillRect(176, 92, 128, 130);
    context.fillRect(330, 66, 130, 156);
    context.fillStyle = '#54595a';
    context.beginPath(); context.arc(256, 148, 44, 0, Math.PI * 2); context.fill();
  } else if (kind === 'map') {
    context.lineWidth = 7;
    context.strokeStyle = '#858d8d';
    const paths = [
      [[28,82],[116,42],[212,88],[292,56],[478,108]],
      [[42,210],[128,162],[218,196],[302,144],[468,200]],
      [[82,336],[160,252],[268,286],[380,238],[486,310]],
    ];
    paths.forEach(points => { context.beginPath(); points.forEach(([x,y],i) => i ? context.lineTo(x,y) : context.moveTo(x,y)); context.stroke(); });
    context.fillStyle = '#cbd6d1';
    [[95,125],[256,170],[398,256]].forEach(([x,y]) => { context.beginPath(); context.arc(x,y,13,0,Math.PI*2); context.fill(); });
  } else {
    context.fillStyle = '#7c8381';
    for (let i = 0; i < 7; i += 1) context.fillRect(50, 54 + i * 34, 412 - (i % 3) * 70, 7);
  }

  context.fillStyle = accent;
  context.font = '700 34px Arial';
  context.textAlign = 'center';
  context.fillText(label, 256, 338);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function texturedCard(name, group, config, material, textureKind, texturePath, stage) {
  const { size, position, rotation = [0, 0, 0], label = name, radius = 0.045 } = config;
  const cardMaterial = stage >= 3
    ? material.clone()
    : CLUE_BOARD_MATERIALS.clayPaper;
  if (stage >= 3) cardMaterial.map = makeCanvasTexture(textureKind, label, config.accent);
  const mesh = rounded(name, [size[0], size[1], size[2] || 0.055], position, cardMaterial, radius, 3);
  mesh.rotation.set(...rotation);
  mesh.userData = {
    ...mesh.userData,
    replaceableTexture: true,
    texturePath,
    contentType: textureKind,
    transformEditable: true,
  };
  group.add(mesh);
  return mesh;
}

function addTape(parent, name, position, rotation, materials, size = [0.34, 0.62, 0.025]) {
  const tape = rounded(name, size, position, materials.tape, 0.025, 2);
  tape.rotation.set(...rotation);
  tape.userData.decorativeAttachment = true;
  parent.add(tape);
}

function addPin(group, id, position, color, materials) {
  const pin = new THREE.Group();
  pin.name = id;
  pin.position.set(...position);
  pin.userData = { pinId: id, transformEditable: true, stringAnchor: [position[0], position[1], position[2] + 0.17] };
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 10), materials.metal);
  shaft.name = `${id}Shaft`;
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.04;
  pin.add(finish(shaft, id));
  const headMaterial = color === 'red' ? materials.red : materials.metal;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 12), headMaterial);
  head.name = `${id}Head`;
  head.scale.z = 0.64;
  head.position.z = 0.15;
  pin.add(finish(head, id));
  group.add(pin);
  return pin;
}

function addString(group, id, start, end, materials, sag = -0.12) {
  const p0 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const midpoint = p0.clone().lerp(p2, 0.5);
  midpoint.y += sag;
  midpoint.z = Math.max(start[2], end[2]) + 0.035;
  const curve = new THREE.QuadraticBezierCurve3(p0, midpoint, p2);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.027, 7, false), materials.red);
  mesh.name = id;
  mesh.userData = { startAnchor: start, endAnchor: end, radius: 0.027, transformEditable: true };
  group.add(finish(mesh, id));
  return mesh;
}

function addFrameAndBoard(root, materials) {
  const body = new THREE.Group();
  body.name = 'boardBody';
  root.add(body);
  body.add(rounded('corkBoard', [11.1, 7.9, 0.3], [0, 4.4, 0], materials.cork, 0.12, 5));
  body.add(rounded('frameTop', [12, 0.5, 0.58], [0, 8.55, 0.02], materials.wood, 0.15, 5));
  body.add(rounded('frameBottom', [12, 0.5, 0.58], [0, 0.25, 0.02], materials.woodDark, 0.15, 5));
  body.add(rounded('frameLeft', [0.5, 8.15, 0.58], [-5.75, 4.4, 0.02], materials.wood, 0.15, 5));
  body.add(rounded('frameRight', [0.5, 8.15, 0.58], [5.75, 4.4, 0.02], materials.woodDark, 0.15, 5));
  const rear = rounded('rearBackPanelApprox', [11.35, 8.1, 0.16], [0, 4.4, -0.23], materials.woodDark, 0.09, 4);
  rear.userData.approximate = true;
  body.add(rear);
  const mounting = new THREE.Group();
  mounting.name = 'rearMountingApprox';
  mounting.userData.approximate = true;
  body.add(mounting);
  [-2.8, 2.8].forEach((x, index) => mounting.add(rounded(`rearCleat${index + 1}`, [1.15, 0.28, 0.18], [x, 7.65, -0.39], materials.metal, 0.06, 3)));
}

function addContent(root, materials, stage) {
  const boardMap = new THREE.Group(); boardMap.name = 'boardMap'; root.add(boardMap);
  const boardPhotos = new THREE.Group(); boardPhotos.name = 'boardPhotos'; root.add(boardPhotos);
  const boardNotes = new THREE.Group(); boardNotes.name = 'boardNotes'; root.add(boardNotes);
  const boardPins = new THREE.Group(); boardPins.name = 'boardPins'; root.add(boardPins);
  const boardStrings = new THREE.Group(); boardStrings.name = 'boardStrings'; root.add(boardStrings);
  const boardDocuments = new THREE.Group(); boardDocuments.name = 'boardDocuments'; root.add(boardDocuments);

  texturedCard('mapMain', boardMap, { size:[4.9,2.85,.06], position:[-2.55,1.8,.23], rotation:[0,0,-.02], label:'MAP' }, materials.paperCool, 'map', 'assets/clue-board/map-main.png', stage);
  texturedCard('photoVenue', boardPhotos, { size:[2.25,1.55,.06], position:[-3.62,6.55,.24], rotation:[0,0,.01], label:'VENUE' }, materials.photo, 'photo', 'assets/clue-board/photo-venue.jpg', stage);
  texturedCard('photoCrowd', boardPhotos, { size:[2.42,2.05,.06], position:[.34,4.82,.27], rotation:[0,0,-.015], label:'CROWD' }, materials.photo, 'photo', 'assets/clue-board/photo-crowd.jpg', stage);
  texturedCard('photoPath', boardPhotos, { size:[1.75,1.42,.06], position:[2.75,5.15,.25], rotation:[0,0,.01], label:'PATH' }, materials.photo, 'photo', 'assets/clue-board/photo-path.jpg', stage);
  texturedCard('photoBuilding', boardPhotos, { size:[2.05,1.42,.06], position:[4.25,2.25,.25], rotation:[0,0,-.01], label:'BUILDING' }, materials.photo, 'photo', 'assets/clue-board/photo-building.jpg', stage);
  texturedCard('photoCampus', boardPhotos, { size:[1.95,1.55,.06], position:[4.1,5.92,.25], rotation:[0,0,.015], label:'CAMPUS' }, materials.photo, 'photo', 'assets/clue-board/photo-campus.jpg', stage);

  texturedCard('noteQuestion', boardNotes, { size:[.78,.78,.055], position:[-2.62,5.25,.27], rotation:[0,0,-.025], label:'?' }, materials.paper, 'note', 'assets/clue-board/note-question.png', stage);
  texturedCard('noteTime', boardNotes, { size:[1.12,.48,.055], position:[-.55,6.92,.27], rotation:[0,0,-.02], label:'11:15' }, materials.paper, 'note', 'assets/clue-board/note-time.png', stage);
  texturedCard('noteDate', boardNotes, { size:[1.05,.55,.055], position:[.78,6.86,.27], rotation:[0,0,.035], label:'09/27' }, materials.paper, 'note', 'assets/clue-board/note-date.png', stage);
  texturedCard('noteWho', boardNotes, { size:[1.05,.58,.055], position:[2.85,3.82,.27], rotation:[0,0,-.04], label:'WHO?' }, materials.paper, 'note', 'assets/clue-board/note-who.png', stage);
  texturedCard('noteHow', boardNotes, { size:[.9,.46,.055], position:[-.25,3.7,.27], rotation:[0,0,-.02], label:'HOW?!' }, materials.paper, 'note', 'assets/clue-board/note-how.png', stage);
  texturedCard('noteTonight', boardNotes, { size:[2.1,.72,.055], position:[-3.85,3.95,.25], rotation:[0,0,.01], label:'TONIGHT' }, materials.paper, 'note', 'assets/clue-board/note-tonight.png', stage);
  texturedCard('noteTitle', boardNotes, { size:[3.2,.62,.075], position:[0,8.23,.39], rotation:[0,0,-.01], label:'WESTERN PISSER', radius:.07 }, materials.paper, 'note', 'assets/clue-board/title.png', stage);

  texturedCard('documentWitness', boardDocuments, { size:[.85,1.55,.06], position:[-1.7,5.0,.24], rotation:[0,0,.08], label:'FILE' }, materials.paper, 'document', 'assets/clue-board/document-witness.png', stage);
  texturedCard('documentUnknown', boardDocuments, { size:[1.0,1.15,.06], position:[2.75,6.42,.24], rotation:[0,0,-.025], label:'???' }, materials.paper, 'document', 'assets/clue-board/document-unknown.png', stage);
  texturedCard('documentFigure', boardDocuments, { size:[1.45,2.05,.06], position:[1.75,1.72,.25], rotation:[0,0,.03], label:'FIGURE' }, materials.ink, 'photo', 'assets/clue-board/document-figure.png', stage);

  if (stage < 2) return;
  addTape(boardPhotos, 'tapeVenueTop', [-3.62,7.41,.37], [0,0,.03], materials);
  addTape(boardPhotos, 'tapeCampusTop', [4.1,6.79,.37], [0,0,-.05], materials);
  addTape(boardDocuments, 'tapeWitnessTop', [-1.68,5.88,.37], [0,0,.12], materials, [.25,.55,.025]);
  addTape(boardMap, 'tapeMapTop', [-.7,3.17,.37], [0,0,-.04], materials, [.32,.56,.025]);

  const pinDefs = [
    ['pinVenue',[-3.9,6.55,.37],'silver'], ['pinSuspect',[-3.55,5.6,.38],'red'],
    ['pinWitness',[-1.72,5.45,.38],'silver'], ['pinCrowd',[.34,6.02,.39],'red'],
    ['pinPath',[2.75,5.98,.38],'red'], ['pinCampus',[4.08,6.72,.38],'red'],
    ['pinBuilding',[4.28,2.92,.38],'silver'], ['pinMapLeft',[-4.65,.78,.38],'silver'],
    ['pinMapRight',[-.72,.95,.38],'silver'], ['pinMapTop',[-.75,2.9,.38],'silver'],
    ['pinFigure',[1.78,2.72,.38],'silver'], ['pinMonument',[3.86,1.28,.38],'silver'],
  ];
  const anchors = {};
  pinDefs.forEach(([id, position, color]) => {
    const pin = addPin(boardPins, id, position, color, materials);
    anchors[id] = pin.userData.stringAnchor;
  });
  [
    ['stringSuspectCrowd','pinSuspect','pinCrowd',-.1],
    ['stringCrowdCampus','pinCrowd','pinCampus',.12],
    ['stringCrowdFigure','pinCrowd','pinFigure',-.05],
    ['stringWitnessBuilding','pinWitness','pinBuilding',-.22],
    ['stringMapLeftBuilding','pinMapLeft','pinBuilding',-.16],
    ['stringMapRightMonument','pinMapRight','pinMonument',-.1],
    ['stringMapTopCampus','pinMapTop','pinCampus',.08],
    ['stringFigureMonument','pinFigure','pinMonument',-.08],
    ['stringPathMonument','pinPath','pinMonument',-.14],
  ].forEach(([id, a, b, sag]) => addString(boardStrings, id, anchors[a], anchors[b], materials, sag));
}

export function createClueBoardModel(options = {}) {
  const pass = options.pass || 'lighting';
  const stage = { blockout:0, structure:1, form:2, material:3, lighting:4 }[pass] ?? 4;
  const root = new THREE.Group();
  root.name = 'clueBoard';
  root.userData = {
    id: 'clueBoard',
    dimensions: CLUE_BOARD_DIMENSIONS,
    coordinateFrame: { origin: 'board-bottom-center', front: '+Z', up: '+Y' },
    sourceReference: 'C:/Users/ZYB/Desktop/reference/68e3ec8006793.image.webp',
    approximationNotes: ['rear mounting hardware', 'rear finish', 'hidden fasteners', 'exact printed content'],
    replaceableTextureRoot: 'assets/clue-board/',
    sculptRuntime: {
      clickable: true,
      explodable: true,
      movableGroups: ['boardMap','boardPhotos','boardNotes','boardPins','boardStrings','boardDocuments'],
    },
  };
  const materials = stage >= 3 ? CLUE_BOARD_MATERIALS : {
    ...CLUE_BOARD_MATERIALS,
    wood:CLUE_BOARD_MATERIALS.clayFrame,
    woodDark:CLUE_BOARD_MATERIALS.clayFrame,
    woodLight:CLUE_BOARD_MATERIALS.clayFrame,
    cork:CLUE_BOARD_MATERIALS.clayBoard,
    corkLight:CLUE_BOARD_MATERIALS.clayBoard,
    paper:CLUE_BOARD_MATERIALS.clayPaper,
    paperCool:CLUE_BOARD_MATERIALS.clayPaper,
    photo:CLUE_BOARD_MATERIALS.clayDetail,
    ink:CLUE_BOARD_MATERIALS.clayDetail,
    red:CLUE_BOARD_MATERIALS.clayDetail,
    metal:CLUE_BOARD_MATERIALS.clayDetail,
    tape:CLUE_BOARD_MATERIALS.clayPaper,
  };
  addFrameAndBoard(root, materials);
  if (stage >= 1) addContent(root, materials, stage);
  root.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return root;
}
