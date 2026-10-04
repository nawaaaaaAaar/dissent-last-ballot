import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/BufferGeometryUtils.js';
const boxGeo=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,12),plane=new THREE.PlaneGeometry(1,1);
export const materials={
  metal:new THREE.MeshStandardMaterial({color:'#3d4643',roughness:.62,metalness:.62}),
  yellow:new THREE.MeshStandardMaterial({color:'#ddb223',roughness:.6,metalness:.35}),
  dark:new THREE.MeshStandardMaterial({color:'#252b2c',roughness:.88}),
  wood:new THREE.MeshStandardMaterial({color:'#7c614b',roughness:.9}),
  glass:new THREE.MeshStandardMaterial({color:'#788d94',roughness:.15,metalness:.52}),
  chrome:new THREE.MeshStandardMaterial({color:'#abb4b2',roughness:.32,metalness:.82}),
  cream:new THREE.MeshStandardMaterial({color:'#ddd7c4',roughness:.88}),
  red:new THREE.MeshStandardMaterial({color:'#a45136',roughness:.92}),
  leaf:new THREE.MeshStandardMaterial({color:'#60794a',roughness:1}),
  sand:new THREE.MeshStandardMaterial({color:'#a8a38e',roughness:1}),
  white:new THREE.MeshStandardMaterial({color:'#e7dfc9',roughness:.86}),
};
export function box(parent,mat,x,y,z,w,h,d){
  const o=new THREE.Mesh(boxGeo,mat);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
export function cylinder(parent,mat,x,y,z,r,h,rz=0){
  const o=new THREE.Mesh(cyl,mat);o.position.set(x,y,z);o.scale.set(r,h,r);o.rotation.z=rz;o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
export function label(text,bg='#e9dfc2',ink='#56352e',subtitle=''){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle=bg;c.fillRect(0,0,1024,256);c.strokeStyle=ink;c.lineWidth=5;c.strokeRect(12,12,1000,232);
  c.fillStyle=ink;c.textAlign='center';c.font='bold 62px sans-serif';c.fillText(text,512,subtitle?120:153,950);
  if(subtitle){c.font='26px sans-serif';c.fillText(subtitle,512,185,940);}
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  return new THREE.MeshStandardMaterial({map:t,roughness:.87,side:THREE.DoubleSide});
}
export function sign(parent,text,x,y,z,w=3,h=.75,bg,ink,subtitle){
  const m=new THREE.Mesh(plane,label(text,bg,ink,subtitle));m.position.set(x,y,z);m.scale.set(w,h,1);parent.add(m);return m;
}
export function mergeStatic(group){
  group.updateMatrixWorld(true);const bins=new Map();
  group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;let g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index)g=g.toNonIndexed();
    if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(g);});
  const result=new THREE.Group();
  for(const [m,geos]of bins){const mesh=new THREE.Mesh(mergeGeometries(geos,false),m);mesh.castShadow=mesh.receiveShadow=true;result.add(mesh);geos.forEach(g=>g.dispose());}
  return result;
}
export function barricade(){
  const g=new THREE.Group();
  for(let x of [-1.45,1.45])box(g,materials.yellow,x,1.13,0,.075,2.12,.08);
  for(let y of [.18,2.18])box(g,materials.yellow,0,y,0,2.95,.075,.08);
  for(let x=-1.35;x<1.4;x+=.2)box(g,materials.yellow,x,1.18,0,.018,1.94,.02);
  for(let y=.35;y<2.1;y+=.2)box(g,materials.yellow,0,y,0,2.86,.019,.02);
  box(g,materials.yellow,0,1.1,0,2.9,.52,.085);
  for(let x of [-1.1,1.1]){box(g,materials.yellow,x,.15,.32,.07,.08,.92);for(let z of [-.04,.66])cylinder(g,materials.dark,x,.12,z,.105,.08,Math.PI/2);}
  sign(g,'DELHI POLICE',0,1.13,.048,2.8,.51,'#ddba23','#a12621','दिल्ली पुलिस');
  const back=sign(g,'DELHI POLICE',0,1.13,-.048,2.8,.51,'#ddba23','#a12621','दिल्ली पुलिस');back.rotation.y=Math.PI;
  return mergeStatic(g);
}
export function bus(){
  const g=new THREE.Group(),body=new THREE.Mesh(new RoundedBoxGeometry(2.6,1.35,8.4,4,.13),materials.dark);
  body.position.y=1.10;g.add(body);body.castShadow=body.receiveShadow=true;
  const roof=new THREE.Mesh(new RoundedBoxGeometry(2.64,.20,8.5,3,.09),materials.dark);roof.position.y=2.59;g.add(roof);
  for(let s of [-1,1]){
    for(let z=-3.2;z<3.5;z+=1.06){
      box(g,materials.glass,s*1.31,2.03,z,.03,.98,.93);
      box(g,materials.chrome,s*1.33,2.04,z+.49,.035,1.04,.034);
    }
    for(let y=1.6;y<2.5;y+=.20)box(g,materials.metal,s*1.35,y,0,.025,.025,7.8);
    box(g,materials.yellow,s*1.31,.89,0,.03,.095,8.05);
    const p=sign(g,'DELHI POLICE',s*1.335,1.19,-.9,2.2,.4,'#c8c8b9','#a62d25','DRAMATISED TRANSPORT');p.rotation.y=s*Math.PI/2;
    for(let z of [-2.65,2.62]){
      cylinder(g,materials.dark,s*1.24,.46,z,.46,.24,Math.PI/2);
      cylinder(g,materials.chrome,s*1.39,.46,z,.23,.035,Math.PI/2);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.017,6,24),materials.chrome);rim.position.set(s*1.41,.46,z);rim.rotation.y=Math.PI/2;g.add(rim);
      for(let a=0;a<6.28;a+=.79){const bolt=new THREE.Mesh(new THREE.SphereGeometry(.024,6,4),materials.metal);bolt.position.set(s*1.42,.46+Math.sin(a)*.13,z+Math.cos(a)*.13);g.add(bolt);}
    }
    box(g,materials.metal,s*1.45,2.1,-3.9,.16,.36,.13);
    box(g,materials.chrome,s*1.32,2.1,-3.9,.4,.04,.04);
    box(g,materials.white,s*.9,1,-4.23,.30,.17,.04);
    const w=box(g,materials.metal,s*.58,1.8,-4.26,.026,.55,.025);w.rotation.z=s*.4;
    box(g,materials.red,s*.96,1.05,4.23,.25,.32,.04);
  }
  box(g,materials.glass,0,2.02,-4.22,2.25,.97,.025);box(g,materials.chrome,0,2.02,-4.25,.045,1,.028);
  box(g,materials.chrome,0,.74,-4.28,2.5,.15,.1);
  for(let y=1.02;y<1.25;y+=.027)box(g,materials.chrome,0,y,-4.27,1.12,.01,.02);
  return g;
}
export function observatory(){
  const g=new THREE.Group(),m=materials.red;
  const triangle=new THREE.Shape();triangle.moveTo(-13,0);triangle.lineTo(13,0);triangle.lineTo(5,15);triangle.closePath();
  const ramp=new THREE.Mesh(new THREE.ExtrudeGeometry(triangle,{depth:2.4,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.08,bevelThickness:.08}),m);
  ramp.rotation.y=Math.PI/2;ramp.position.set(-1.2,0,0);ramp.castShadow=ramp.receiveShadow=true;g.add(ramp);
  // Graduated side quadrants: source-referenced form, scaled for the game garden.
  for(let s of [-1,1]){
    const quadrant=new THREE.Shape();quadrant.moveTo(0,0);quadrant.absarc(0,0,9,0,Math.PI/2,false);quadrant.lineTo(0,0);
    const q=new THREE.Mesh(new THREE.ExtrudeGeometry(quadrant,{depth:1.4,bevelEnabled:false}),m);q.rotation.y=s*Math.PI/2;q.position.set(s*5,0,-5);q.castShadow=q.receiveShadow=true;g.add(q);
    for(let z=-11;z<8;z+=1)box(g,materials.white,s*1.36,.10+(z+11)*.70,z,.09,.09,.055);
  }
  for(let i=0;i<26;i++)box(g,m,0,.15+i*.28,12-i*.50,2.55,.30,.52);
  box(g,m,0,.18,0,24,.38,30);
  return g;
}
export function ramaYantra(){
  const g=new THREE.Group();
  for(let a=0;a<6.28;a+=.262){
    const panel=box(g,materials.red,Math.cos(a)*5,2.4,Math.sin(a)*5,.30,4.8,1.05);panel.rotation.y=-a;
    const top=box(g,materials.red,Math.cos(a)*5,4.9,Math.sin(a)*5,.32,.22,1.27);top.rotation.y=-a;
  }
  cylinder(g,materials.red,0,2.8,0,.38,5.6);return g;
}
export function bench(parent,x,z,angle=0){
  const g=new THREE.Group();g.position.set(x,.17,z);g.rotation.y=angle;
  for(let x of [-.74,.74]){box(g,materials.metal,x,.26,0,.05,.53,.55);box(g,materials.metal,x,.66,.21,.05,.88,.055);}
  for(let z of [-.2,0,.2])box(g,materials.wood,0,.56,z,1.8,.065,.15);
  for(let y of [.8,1,1.2])box(g,materials.wood,0,y,.23,1.8,.14,.06);
  parent.add(g);return g;
}
export function lamp(parent,x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  cylinder(g,materials.metal,0,3,0,.065,6);box(g,materials.metal,.38,5.96,0,.8,.06,.05);
  box(g,materials.dark,.70,5.9,0,.35,.10,.25);box(g,materials.white,.70,5.83,0,.3,.02,.22);
  parent.add(g);
}
export function tent(parent,x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  for(let x of [-2,2])for(let z of [-1.8,1.8])cylinder(g,materials.metal,x,1.5,z,.04,3);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(3.1,.65,4,1,true),new THREE.MeshStandardMaterial({color:'#c7b589',side:THREE.DoubleSide,roughness:1}));
  roof.position.y=3.25;roof.rotation.y=Math.PI/4;g.add(roof);
  box(g,materials.white,0,2.92,1.81,4.1,.23,.05);
  box(g,materials.wood,0,.9,0,2.8,.10,1);
  for(let x of [-1.1,1.1])box(g,materials.metal,x,.47,0,.05,.94,.75);
  parent.add(g);return g;
}
