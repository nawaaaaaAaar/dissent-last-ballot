import * as THREE from 'three';
import {box,cylinder,mergeStatic,materials as M,bench,lamp,tent,sign} from './world-props.js';
export async function cityArt(scene,WORLD,PLACES){
  const atlas=await new THREE.TextureLoader().loadAsync('./assets/delhi-facade-atlas.webp');
  atlas.colorSpace=THREE.SRGBColorSpace;atlas.anisotropy=4;
  const facade=new THREE.MeshStandardMaterial({map:atlas,roughness:.92});
  const roof=new THREE.MeshStandardMaterial({color:'#9b8d78',roughness:.94});
  const hero=new THREE.Vector2();
  // Cut away only nearby foreground upper floors; ground footprints remain legible.
  for(const material of [facade,roof,M.cream,M.white,M.sand,M.red]){
    material.onBeforeCompile=s=>{
      s.uniforms.hero={value:hero};
      s.vertexShader='varying vec3 cityPosition;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\ncityPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
      s.fragmentShader='uniform vec2 hero;\nvarying vec3 cityPosition;\n'+s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(cityPosition.y>0.8 && cityPosition.z>hero.y-2.0 && distance(cityPosition.xz,hero)<12.0) discard;');
    };
  }
  const g=new THREE.Group(),pos=[],uv=[];
  WORLD.buildings.forEach((b,k)=>{
    const tile=parseInt(b.id,10)%4,tx=tile%2*.5,ty=tile<2?.5:0;
    for(const contour of[b.poly,...b.holes])for(let j=0;j<contour.length;j++){
      const a=contour[j],c=contour[(j+1)%contour.length],len=Math.hypot(c.x-a.x,c.z-a.z);if(len<.02)continue;
      const bays=Math.max(1,Math.ceil(len/3));
      for(let n=0;n<bays;n++)for(let floor=0;floor<Math.max(1,Math.ceil(b.height/3));floor++){
        const t=n/bays,u=(n+1)/bays,y=floor*3,h=Math.min(b.height,y+3);
        const corners=[[a.x+(c.x-a.x)*t,y,a.z+(c.z-a.z)*t],[a.x+(c.x-a.x)*u,y,a.z+(c.z-a.z)*u],[a.x+(c.x-a.x)*u,h,a.z+(c.z-a.z)*u],[a.x+(c.x-a.x)*t,h,a.z+(c.z-a.z)*t]];
        for(const i of [0,1,2,0,2,3]){pos.push(...corners[i]);uv.push(tx+(i===1||i===2?.499:.001),ty+(i>=2?.499:.001));}
      }
    }
    const shape=new THREE.Shape(b.poly.map(p=>new THREE.Vector2(p.x,-p.z)));shape.holes=b.holes.map(h=>new THREE.Path(h.map(p=>new THREE.Vector2(p.x,-p.z))));
    const cap=new THREE.Mesh(new THREE.ShapeGeometry(shape),roof);cap.rotation.x=-Math.PI/2;cap.position.y=b.height;g.add(cap);
    const x=b.poly.reduce((s,p)=>s+p.x,0)/b.poly.length,z=b.poly.reduce((s,p)=>s+p.z,0)/b.poly.length;
    if(k%3===0){box(g,M.dark,x,b.height+.35,z,1.2,.7,1.2);cylinder(g,M.sand,x+1,b.height+.1,z, .5,.2);}
  });
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
  const walls=new THREE.Mesh(geo,facade);walls.material.side=THREE.DoubleSide;walls.castShadow=walls.receiveShadow=true;scene.add(walls,mergeStatic(g));
  const grass=await new THREE.TextureLoader().loadAsync('./assets/grass-diff.webp'),grassNormal=await new THREE.TextureLoader().loadAsync('./assets/grass-normal.webp');
  for(const t of [grass,grassNormal]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;}grass.colorSpace=THREE.SRGBColorSpace;
  const parkMat=new THREE.MeshStandardMaterial({map:grass,normalMap:grassNormal,normalScale:new THREE.Vector2(.22,.22),color:'#9ba882',roughness:1});
  for(const p of WORLD.parks||[]){if(!p.poly?.length)continue;const shape=new THREE.Shape(p.poly.map(v=>new THREE.Vector2(v.x,-v.z)));const geometry=new THREE.ShapeGeometry(shape),uv=geometry.attributes.uv,pos=geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/5,pos.getY(i)/5);const m=new THREE.Mesh(geometry,parkMat);m.rotation.x=-Math.PI/2;m.position.y=.012;m.receiveShadow=true;scene.add(m);}
  const detail=new THREE.Group();
  for(const p of PLACES){
    for(let j=0;j<5;j++){const x=p.x-12+j*5,z=p.z+9;bench(detail,x,z);lamp(detail,x,z+2);cylinder(detail,M.sand,x, .35,z-2,.5,.7);cylinder(detail,M.leaf,x,1.0,z-2,.7,.7);}
    tent(detail,p.x-9,p.z+7);sign(detail,'COMMUNITY SUPPORT',p.x-9,2.9,p.z+8,4,.5,'#294c45','#f0dbb4');
    for(let j=0;j<3;j++){box(detail,M.wood,p.x+8, .65,p.z+j*2,2,1.3,1);box(detail,M.red,p.x+8,1.4,p.z+j*2,2.2,.12,1.2);}
    // Original street props, not scans or claims about actual parked vehicles.
    for(let j=0;j<2;j++){
      const x=p.x+11+j*3,z=p.z-10;
      box(detail,M.leaf,x,.65,z,1.25,.8,2);box(detail,M.yellow,x,1.2,z,1.3,.4,2);
      box(detail,M.dark,x,1.85,z+.2,1.4,.15,1.6);
      for(const s of[-1,1])box(detail,M.dark,x+s*.63,1.45,z+.65,.05,.75,.06);
      for(const s of[-1,1])cylinder(detail,M.dark,x+s*.63,.3,z+.6,.29,.16,Math.PI/2);
      cylinder(detail,M.dark,x,.3,z-.8,.29,.16,Math.PI/2);
      box(detail,M.white,x,.9,z-1.02,.23,.15,.05);
    }
    sign(detail,'FICTIONAL VOLUNTEER DESK',p.x+8,2.1,p.z+1,3,.5,'#24463f','#edd3a4');
  }
  const named=new Set();
  for(const s of WORLD.segments){
    if(!s.name||named.has(s.name)||s.walkOnly||Math.hypot(s.a.x-s.b.x,s.a.z-s.b.z)<12)continue;
    named.add(s.name);if(named.size>30)break;
    sign(detail,s.name.toUpperCase(),s.a.x+4,2.3,s.a.z,3.4,.48,'#245045','#eee1be');cylinder(detail,M.dark,s.a.x+4,1.1,s.a.z,.04,2.2);
  }
  scene.add(mergeStatic(detail));
  return {hero};
}
