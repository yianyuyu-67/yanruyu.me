import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C={cabinet:0xa8aa84,cabinetSide:0x92966f,shelf:0x9da477,drawer:0xb08c5c,back:0x747b61,bookDark:0x2f3b35,bookGreen:0x405744,bookBrown:0x5b3b2f,bookBlue:0x3d5260,bookCoral:0x98533f,paper:0xeee4d3,box:0xb89468,metal:0x8f8065,seam:0x6f684a};
function mat(color,rough=.82,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function rb(name,size,pos,material,r=.08,s=4){const g=new RoundedBoxGeometry(size[0],size[1],size[2],s,Math.min(r,Math.min(...size)*.42));const m=new THREE.Mesh(g,material);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m;}
function addTextCard(group,name,size,pos,color){const m=rb(name,size,pos,mat(color,.9),.025,2);group.add(m);return m;}

export function createArchiveCabinetModel(){
 const root=new THREE.Group();root.name='archiveCabinet';root.userData.sculptRuntime={coordinateFrame:{front:'+Z',up:'+Y',origin:'bottom-center'},dimensions:{width:9,depth:4,height:12.3},explodable:true,clickable:true};
 const cabinet=mat(C.cabinet), side=mat(C.cabinetSide), shelf=mat(C.shelf), drawer=mat(C.drawer), back=mat(C.back), seam=mat(C.seam,.88), metal=mat(C.metal,.34,.55), paper=mat(C.paper,.9), box=mat(C.box,.9), bookM=[mat(C.bookDark,.86),mat(C.bookGreen,.86),mat(C.bookBrown,.86),mat(C.bookBlue,.86),mat(C.bookCoral,.86)];
 const body=new THREE.Group();body.name='cabinetBody';root.add(body);
 body.add(rb('cabinetSideLeft',[.42,11.5,3.75],[-4.29,6.0,0],side,.11,5)); body.add(rb('cabinetSideRight',[.42,11.5,3.75],[4.29,6.0,0],side,.11,5)); body.add(rb('cabinetBottom',[8.2,.42,3.75],[0,.52,0],cabinet,.08,4));
 const top=rb('cabinetTop',[9.15,.48,4.08],[0,12.05,0],cabinet,.12,6);root.add(top);
 const rear=rb('cabinetBack',[8.28,11.35,.24],[0,6.2,-1.87],back,.05,3);root.add(rear);
 const shelfSys=new THREE.Group();shelfSys.name='shelfSystem';root.add(shelfSys); for(const [n,y] of [['shelfBottom',3.62],['shelfMiddle',6.34],['shelfTop',9.04]]) shelfSys.add(rb(n,[8.2,.28,3.68],[0,y,0],shelf,.055,4));
 const content=new THREE.Group();content.name='contentSystem';root.add(content);
 const cert=new THREE.Group();cert.name='certificateRow';content.add(cert); for(let i=0;i<3;i++){const x=-2.55+i*2.0; cert.add(rb(`certificateFrame${i+1}`,[1.55,1.65,.18],[x,10.005,1.55],metal,.035,3)); cert.add(addTextCard(cert,`certificate${i+1}`,[1.25,1.32,.05],[x,10.005,1.66],i===1?0xf7efdc:0xe9dec4));}
 const upper=new THREE.Group();upper.name='bookRowUpper';content.add(upper); for(let i=0;i<5;i++){const w=.5+(i%3)*.12; upper.add(rb(`upperBook${i+1}`,[w,1.9,2.7],[-3.35+i*.7,7.43,.42],bookM[i%bookM.length],.035,3));}
 const middle=new THREE.Group();middle.name='fileRowMiddle';content.add(middle); for(let i=0;i<2;i++){const x=.8+i*2.15; middle.add(rb(`wovenArchiveBox${i+1}`,[1.75,1.75,3.05],[x,7.355,.25],box,.12,4)); middle.add(rb(`wovenLabel${i+1}`,[.7,.32,.04],[x,7.35,1.80],paper,.02,2));}
 const lower=new THREE.Group();lower.name='bookRowLower';content.add(lower); for(let i=0;i<8;i++){const w=.46+(i%4)*.1; lower.add(rb(`lowerBook${i+1}`,[w,1.9,2.72],[-3.35+i*.88,4.71,.42],bookM[(i+2)%bookM.length],.035,3));}
 const newspaper=new THREE.Group();newspaper.name='newspaper';lower.add(newspaper); const sheet=rb('newspaperSheet',[2.5,.06,1.15],[0,5.62,1.70],paper,.025,2);sheet.rotation.x=-.18;newspaper.add(sheet); newspaper.add(rb('newspaperFold',[1.2,.06,.18],[.35,5.54,1.76],paper,.02,2));
 newspaper.visible=false;
 const drawers=new THREE.Group();drawers.name='drawerUnit';root.add(drawers); const drawerRows=new THREE.Group();drawerRows.name='drawerRows';drawers.add(drawerRows); const handles=new THREE.Group();handles.name='drawerHandles';drawers.add(handles);
 for(let row=0;row<2;row++) for(let col=0;col<4;col++){const x=-3.0+col*2.0,y=1.35+row*1.40;const d=rb(`drawer${row*4+col+1}`,[1.9,1.2,3.15],[x,y,.35],drawer,.065,4);drawerRows.add(d); drawerRows.add(rb(`drawer${row*4+col+1}Reveal`,[1.82,.07,.035],[x,y-.61,1.96],seam,.015,2)); const h=rb(`drawerHandle${row*4+col+1}`,[.68,.16,.12],[x,y,2.08],metal,.04,3);handles.add(h);}
 const feet=new THREE.Group();feet.name='cabinetFeet';root.add(feet); feet.add(rb('footLeft',[1.2,.42,3.85],[-3.45,.2,0],cabinet,.07,4));feet.add(rb('footRight',[1.2,.42,3.85],[3.45,.2,0],cabinet,.07,4)); feet.add(rb('footRail',[6.0,.25,.35],[0,.28,1.65],side,.04,3));
 root.traverse(o=>{if(o.isMesh){o.userData.partId=o.name;o.userData.explodeWithParent=true;}}); return root;
}
export const ARCHIVE_CABINET_PALETTE=C;
