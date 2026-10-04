import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

const $ = id => document.getElementById(id);
const mobile = matchMedia('(pointer:coarse)').matches || innerWidth < 700;
const LENGTH = 900, SPEED = 8.5, LANE = 2.35, SEGMENT = 120;
const state = {
  mode:'loading', distance:0, lane:0, x:0, y:0, vy:0, slide:0, condition:100,
  evidence:0, solidarity:0, hitCooldown:0, elapsed:0, checkpoint:null,
  barrier:false, footage:false, dialogue:null, cutscene:0, subtitleTime:0,
  low:mobile, mute:true, reduced:matchMedia('(prefers-reduced-motion:reduce)').matches,
  assist:false, collisions:0, packets:new Set(), hit:new Set(), fps:0,
};
let renderer, scene, camera, clock, sun, player, parts, street=[], obstacles=[], pickups=[];
let characterTime=0, lastFrame=0, frames=0, measureStart=performance.now(), manualStepping=false;
let sound, musicStep=0, beatTime=0, dust, staticMaterials=[], camShake=0;
let delhiSign, busSign, protestSigns=[], routeSigns=[], delhiLandmarks;
const root = $('viewport');
const rng = seed => { let n=seed; return () => {n = (n*1664525+1013904223)>>>0; return n/4294967296;}; };
const rand=rng(8104);
const mat=(color,roughness=.86,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const M={
  road:mat('#555a57'), sidewalk:mat('#9e9b8d'), cream:mat('#c7b793'),
  plaster:mat('#c5ac7f'), brick:mat('#8f6552'), stone:mat('#a39178'),
  teal:mat('#37636a'), navy:mat('#273b44'), metal:mat('#4b5350',.65,{metalness:.45}),
  dark:mat('#282d2b'), wood:mat('#766148'), ochre:mat('#c1914e'), terracotta:mat('#ad7051'),
  white:mat('#e5dfc7'), skin:mat('#987052',.72), hair:mat('#262622'),
  orange:mat('#bf7048'), green:mat('#647462'), blue:mat('#475568'),
  glass:mat('#758887',.23,{metalness:.55}), leaf:mat('#556a52'),
  light:mat('#edc68d',.55,{emissive:'#edb975',emissiveIntensity:.5}),
  stripe:mat('#cab169'), yellow:mat('#e3a765'),
  paper:mat('#f5e7c7',.6,{emissive:'#b68a4a',emissiveIntensity:.18}),
  policeYellow:mat('#e8be19',.58,{metalness:.22}),
  busBody:mat('#394146',.48,{metalness:.3}), chrome:mat('#a4aca9',.35,{metalness:.8}),
  park:mat('#65755a'), monument:mat('#b2573a'), civic:mat('#d8d3bd'),
};
const G = {
  box:new THREE.BoxGeometry(1,1,1), cylinder:new THREE.CylinderGeometry(1,1,1,10),
  sphere:new THREE.SphereGeometry(1,10,7), plane:new THREE.PlaneGeometry(1,1),
  capsule:new THREE.CapsuleGeometry(.1,.5,4,8),
};
function mesh(g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1,parent=null){
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);
  o.castShadow=true;o.receiveShadow=true;if(parent)parent.add(o);return o;
}
function box(m,x,y,z,w,h,d,parent){return mesh(G.box,m,x,y,z,w,h,d,parent);}
function sphere(m,x,y,z,w,h,d,parent){return mesh(G.sphere,m,x,y,z,w,h,d,parent);}

// Batch the architecture by material, rather than hundreds of separate draw calls.
function batchBuilder(){
  const bins=new Map(), holder=new THREE.Group();
  function add(o){
    o.updateMatrixWorld(true);
    o.traverse(n=>{
      if(!n.isMesh)return;
      let g=n.geometry.clone().applyMatrix4(n.matrixWorld);
      if(g.index)g=g.toNonIndexed();
      const m=n.material;
      if(!bins.has(m))bins.set(m,[]);
      bins.get(m).push(g);
    });
    return o;
  }
  function finish(){
    for(const [m,geos] of bins){
      const merged=mergeGeometries(geos,false);
      const o=new THREE.Mesh(merged,m);o.castShadow=true;o.receiveShadow=true;
      holder.add(o);geos.forEach(g=>g.dispose());
    }
    return holder;
  }
  return {add,finish};
}
function canvasTexture(draw,w=512,h=512){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  t.anisotropy=4;return t;
}
function createMaterials(){
  const asphalt=canvasTexture((c,w,h)=>{
    c.fillStyle='#6b6e66';c.fillRect(0,0,w,h);
    for(let i=0;i<27000;i++){
      const v=55+Math.floor(rand()*70);c.fillStyle=`rgba(${v},${v+3},${v},.2)`;
      c.fillRect(rand()*w,rand()*h,rand()*2+.2,rand()*2+.2);
    }
    c.strokeStyle='rgba(35,40,35,.32)';c.lineWidth=2;
    for(let i=0;i<12;i++){c.beginPath();let x=rand()*w,y=rand()*h;c.moveTo(x,y);
      for(let j=0;j<10;j++){x+=(rand()-.5)*50;y+=rand()*25;c.lineTo(x,y);}c.stroke();}
  });
  asphalt.wrapS=asphalt.wrapT=THREE.RepeatWrapping;asphalt.repeat.set(4,32);
  M.road.map=asphalt;M.road.color.set('#b7b8aa');
  const shutter=canvasTexture((c,w,h)=>{
    c.fillStyle='#c0c0b0';c.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=14){c.fillStyle='#777f76';c.fillRect(0,y,w,2);c.fillStyle='#e0dfc8';c.fillRect(0,y+3,w,2);}
    for(let i=0;i<2000;i++){c.fillStyle='rgba(50,60,50,.12)';c.fillRect(rand()*w,rand()*h,2,rand()*16);}
  });
  M.teal.map=shutter;M.navy.map=shutter;
  const names=['PATEL CHOWK','SANSAD MARG','JANTAR MANTAR ROAD','PARLIAMENT STREET','PUBLIC RECORD','INDEPENDENT ARCHIVE','WITNESS / RECORD','OUR VOICES REMAIN'];
  for(let i=0;i<names.length;i++){
    const tex=canvasTexture((c,w,h)=>{
      c.fillStyle=i%2?'#d4c6a1':'#2c4848';c.fillRect(0,0,w,h);
      c.strokeStyle=i%2?'#625746':'#c2b395';c.lineWidth=5;c.strokeRect(10,10,w-20,h-20);
      c.fillStyle=i%2?'#39453b':'#eee1bf';c.font='bold 32px sans-serif';c.textAlign='center';
      c.fillText(names[i],w/2,68);c.font='16px sans-serif';c.fillText('NEW DELHI · DRAMATISED GAME ROUTE',w/2,98);
    },512,128);
    staticMaterials.push(new THREE.MeshStandardMaterial({map:tex,roughness:.8}));
  }
  delhiSign=labelMaterial('DELHI POLICE','#e3bd19','#b92524','दिल्ली पुलिस · NEW DELHI');
  busSign=labelMaterial('DELHI POLICE','#deddd0','#b92524','TRANSPORT · DRAMATISED VEHICLE');
  const slogans=['VOTE CHORI BAND KARO','SAVE DEMOCRACY','LET JOURNALISTS REPORT','ACCOUNTABILITY NOW','OUR VOICES REMAIN'];
  protestSigns=slogans.map((s,i)=>labelMaterial(s,i%2?'#d6c6a2':'#e8e5d7','#892c27','PROTEST SCENE · FICTIONAL PARTICIPANTS'));
  routeSigns=[
    labelMaterial('PATEL CHOWK','#174d42','#f2ead8','SANSAD MARG · JANTAR MANTAR'),
    labelMaterial('SANSAD MARG','#174d42','#f2ead8','PARLIAMENT STREET · NEW DELHI'),
    labelMaterial('JANTAR MANTAR ROAD','#174d42','#f2ead8','OBSERVATORY PRECINCT · NEW DELHI'),
  ];
}
function labelMaterial(text,bg,ink,subtitle=''){
  const tex=canvasTexture((c,w,h)=>{
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(9,9,w-18,h-18);
    c.fillStyle=ink;c.textAlign='center';c.font='bold 40px sans-serif';
    c.fillText(text,w/2,subtitle?76:89,w-35);
    if(subtitle){c.font='18px sans-serif';c.fillText(subtitle,w/2,117,w-30);}
  },640,160);
  return new THREE.MeshStandardMaterial({map:tex,roughness:.72});
}

// Original articulated human, built from smooth geometry. No downloaded likeness.
function createCharacter(shirt=M.orange,scale=1){
  const group=new THREE.Group(), torso=new THREE.Group();
  torso.position.y=.97;group.add(torso);
  sphere(shirt,0,.34,0,.28,.43,.18,torso);
  box(shirt,0,.11,.015,.4,.22,.28,torso);
  mesh(G.cylinder,M.skin,0,.79,0,.075,.13,.075,torso);
  sphere(M.skin,0,.99,0,.135,.19,.13,torso);
  sphere(M.hair,0,1.075,.025,.145,.12,.14,torso);
  box(M.hair,0,1.01,.095,.24,.15,.06,torso);
  sphere(M.skin,0,.99,-.125,.036,.035,.04,torso);
  sphere(M.skin,-.14,.98,0,.035,.055,.035,torso);
  sphere(M.skin,.14,.98,0,.035,.055,.035,torso);
  // Shoulder straps and soft-sided canvas bag.
  box(M.dark,-.18,.36,.13,.04,.57,.035,torso);
  box(M.dark,.18,.36,.13,.04,.57,.035,torso);
  const bag=sphere(M.navy,0,.31,.22,.235,.31,.12,torso);
  box(M.teal,0,.26,.32,.3,.2,.025,torso);
  box(M.paper,.05,.3,.34,.07,.09,.01,torso);
  const arms=[],forearms=[],legs=[],knees=[];
  for(let s of [-1,1]){
    const arm=new THREE.Group();arm.position.set(s*.31,.64,0);torso.add(arm);arms.push(arm);
    sphere(shirt,0,-.13,0,.115,.2,.105,arm);
    const elbow=new THREE.Group();elbow.position.set(0,-.3,0);arm.add(elbow);forearms.push(elbow);
    sphere(M.skin,0,-.135,0,.072,.17,.072,elbow);
    sphere(M.skin,0,-.29,0,.071,.08,.056,elbow);
    const leg=new THREE.Group();leg.position.set(s*.13,.98,0);group.add(leg);legs.push(leg);
    sphere(M.blue,0,-.215,0,.13,.255,.13,leg);
    const knee=new THREE.Group();knee.position.y=-.44;leg.add(knee);knees.push(knee);
    sphere(M.blue,0,-.18,0,.10,.22,.10,knee);
    sphere(M.dark,0,-.4,-.045,.115,.085,.18,knee);
    box(M.white,0,-.452,-.05,.19,.035,.27,knee);
  }
  group.scale.setScalar(scale);
  return {group,torso,arms,forearms,legs,knees,bag};
}
function characterPose(p,t,running=true){
  const a=running?.82:.03;
  p.legs[0].rotation.x=Math.sin(t)*a;p.legs[1].rotation.x=Math.sin(t+Math.PI)*a;
  p.knees[0].rotation.x=Math.max(0,-Math.sin(t))*.95;
  p.knees[1].rotation.x=Math.max(0,-Math.sin(t+Math.PI))*.95;
  p.arms[0].rotation.x=Math.sin(t+Math.PI)*a*.85;p.arms[1].rotation.x=Math.sin(t)*a*.85;
  p.forearms.forEach(f=>f.rotation.x=-.45);
  p.torso.position.y=.97+(running?Math.abs(Math.sin(t))*.045:0);
  p.torso.rotation.x=running?-.10:0;
}
function bus(){
  const g=new THREE.Group();
  // Dark body and guarded windows referenced to protest reporting photographs.
  // Original geometry, illustrative branding, no exact vehicle-model claim.
  box(M.busBody,0,1.50,0,2.45,1.95,8.0,g);
  box(M.chrome,0,2.52,0,2.48,.10,8.05,g);
  for(let s of [-1,1]){
    box(M.ochre,s*1.239,.93,0,.025,.10,7.9,g);
    box(M.chrome,s*1.24,1.1,0,.025,.04,7.9,g);
    for(let z=-3;z<=3;z+=1){
      box(M.glass,s*1.24,1.89,z,.025,.95,.87,g);
      box(M.chrome,s*1.27,1.91,z+.45,.03,1.04,.028,g);
    }
    for(let y=1.45;y<2.45;y+=.22)box(M.chrome,s*1.285,y,0,.04,.025,7.8,g);
    const placard=mesh(G.plane,busSign,s*1.255,.77,-1.4,2.3,.50,1,g);
    placard.rotation.y=s*Math.PI/2;
  }
  box(M.glass,0,1.95,-4.02,2.2,.94,.025,g);
  box(M.chrome,0,1.96,-4.04,.04,.98,.03,g);
  box(M.chrome,0,1.48,-4.04,2.18,.035,.025,g);
  box(M.chrome,0,2.48,-4.04,2.18,.035,.025,g);
  for(let s of [-1,1])for(let z of [-2.55,2.55]){
    const wheel=mesh(G.cylinder,M.dark,s*1.22,.48,z,.46,.20,.46,g);wheel.rotation.z=Math.PI/2;
    const hub=mesh(G.cylinder,M.chrome,s*1.34,.48,z,.23,.03,.23,g);hub.rotation.z=Math.PI/2;
  }
  for(let s of [-1,1])box(M.light,s*.83,.95,-4.06,.30,.18,.04,g);
  box(M.chrome,0,.63,-4.08,2.42,.15,.12,g);
  box(M.dark,0,1.15,-4.05,1.15,.25,.03,g);
  return g;
}
function delhiBarricade(){
  const g=new THREE.Group();
  // Public-facing visual design, not a construction or sabotage guide.
  for(let x of [-1.4,1.4])box(M.policeYellow,x,1.2,0,.09,2.15,.10,g);
  for(let y of [.21,2.26])box(M.policeYellow,0,y,0,2.9,.09,.10,g);
  box(M.policeYellow,0,1.2,0,2.82,.58,.10,g);
  for(let x=-1.26;x<=1.3;x+=.18)box(M.policeYellow,x,1.2,0,.015,2.02,.018,g);
  for(let y=.36;y<2.17;y+=.18)box(M.policeYellow,0,y,0,2.75,.015,.018,g);
  for(let x of [-1.1,1.1]){
    box(M.policeYellow,x,.22,.38,.08,.08,.87,g);
    for(let z of [0,.7]){
      const wheel=mesh(G.cylinder,M.dark,x,.13,z,.12,.065,.12,g);wheel.rotation.z=Math.PI/2;
    }
  }
  const front=mesh(G.plane,delhiSign,0,1.22,-.061,2.77,.6,1,g);
  front.rotation.y=Math.PI;
  mesh(G.plane,delhiSign,0,1.22,.061,2.77,.6,1,g);
  const batch=batchBuilder();batch.add(g);return batch.finish();
}
function protester(shirt,index){
  const p=createCharacter(shirt,.94);characterPose(p,index*.7,false);
  p.arms[0].rotation.x=-2.2;p.forearms[0].rotation.x=-.25;
  box(M.wood,-.24,2.20,-.2,.035,.9,.035,p.group);
  const front=mesh(G.plane,protestSigns[index%protestSigns.length],-.24,2.66,-.22,1.12,.42,1,p.group);
  front.rotation.y=Math.PI;
  mesh(G.plane,protestSigns[index%protestSigns.length],-.24,2.66,-.20,1.12,.42,1,p.group);
  return p.group;
}
function landmarkModel(){
  const b=batchBuilder();
  const B=(m,x,y,z,w,h,d)=>b.add(box(m,x,y,z,w,h,d));
  // Simplified Samrat-Yantra silhouette, behind a fence and outside gameplay.
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(11,0);shape.lineTo(11,9);shape.closePath();
  const ramp=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1.3,bevelEnabled:false}),M.monument);
  ramp.position.set(-1,0,0);ramp.rotation.y=Math.PI/2;b.add(ramp);
  for(let i=0;i<22;i++)B(M.cream,.14,i*.39+.15,-i*.49-.2,.5,.08,.45);
  for(let s of [-1,1]){
    const curve=new THREE.Mesh(new THREE.TorusGeometry(5,.45,6,40,Math.PI),M.monument);
    curve.rotation.y=Math.PI/2;curve.rotation.z=Math.PI;curve.position.set(s*4.5,5,-10);b.add(curve);
    for(let j=0;j<5;j++)B(M.monument,s*4.5,1.3,-6-j*1.3,.65,2.6,.65);
  }
  B(M.monument,0,.25,-7,13,.5,15);
  return b.finish();
}
function buildDelhiLandmarks(){
  delhiLandmarks=new THREE.Group();scene.add(delhiLandmarks);
  const observatory=landmarkModel();observatory.position.set(-14,.12,-735);delhiLandmarks.add(observatory);
  const b=batchBuilder();
  const colours=[M.green,M.orange,M.blue,M.ochre,M.navy,M.white];
  // Fictional participants, no portraits or imported protest photographs.
  for(let i=0;i<24;i++){
    const side=i%2===0?-1:1,g=protester(colours[i%colours.length],i);
    g.position.set(side*(5.6+(i%3)*.43),.12,-660-Math.floor(i/2)*2.7);
    g.rotation.y=side<0?.3:-.3;b.add(g);
  }
  for(let i=0;i<7;i++){
    const g=delhiBarricade();g.position.set(-5.8,.12,-628-i*4.1);g.rotation.y=Math.PI/2;b.add(g);
  }
  for(let i=0;i<3;i++){
    const g=delhiBarricade();g.position.set(-5.8,.12,-28-i*4);g.rotation.y=Math.PI/2;b.add(g);
  }
  const transport=bus();transport.position.set(5.8,0,-650);b.add(transport);
  for(let i=0;i<3;i++){
    const g=new THREE.Group(),sign=mesh(G.plane,routeSigns[i],0,3.2,0,3.5,.88,1,g);
    box(M.metal,-1.4,1.65,.07,.08,3.3,.08,g);box(M.metal,1.4,1.65,.07,.08,3.3,.08,g);
    g.position.set(-6.1,0,-[70,360,625][i]);g.rotation.y=-.35;b.add(g);
  }
  const subway=new THREE.Group();
  box(M.civic,0,.55,0,2.1,1.1,3.6,subway);
  for(let s of [-1,1])box(M.chrome,s*1,1.18,0,.04,.06,3.7,subway);
  mesh(G.plane,routeSigns[0],0,2.35,1.9,2.6,.7,1,subway);
  subway.position.set(6.1,0,-36);b.add(subway);
  delhiLandmarks.add(b.finish());
}
function makeStreet(){
  const b=batchBuilder();
  const B=(m,x,y,z,w,h,d)=>b.add(box(m,x,y,z,w,h,d));
  B(M.road,0,-.12,-60,10,.25,120);
  for(let s of [-1,1]){
    B(M.sidewalk,s*6,-.02,-60,2,.22,120);
    B(M.stone,s*5,.08,-60,.16,.3,120);
    for(let z=2;z<120;z+=5){
      B(z%2?M.white:M.dark,s*4.96,.18,-z,.14,.11,2.5);
    }
  }
  for(let z=6;z<120;z+=8)B(M.stripe,0,.015,-z,.1,.015,3);
  B(M.park,-18,-.04,-60,24,.12,120);
  for(let z=9;z<120;z+=19){
    for(let s of [-1,1]){
      if(s<0){
        B(M.civic,-7,.48,-z,.30,.96,18.9);
        for(let k=-9;k<9;k+=.8)B(M.metal,-7,1.35,-z+k,.045,1.25,.035);
        B(M.metal,-7,1.95,-z,.04,.04,18.9);
        continue;
      }
      const height=6+(Math.floor(rand()*2)*2.25), facade=M.civic;
      const width=14+rand()*3, x=s*(7+width/2);
      B(facade,x,height/2,-z,width,height,18.7);
      B(M.stone,x,height+.1,-z,width+.2,.28,19);
      B(M.cream,s*7,height*.5,-z,.2,.2,18.8);
      B(M.cream,s*7,height*.8,-z,.22,.18,18.8);
      for(let j of [-5,0,5]){
        const Z=-z+j;
        B(M.dark,s*6.96,1.3,Z,.10,2.5,3.75);
        B(M.glass,s*6.88,1.2,Z,.09,2.2,3.5);
        B(M.stone,s*6.8,2.5,Z,.17,.2,3.8);
        const sign=mesh(G.box,staticMaterials[4],s*6.74,2.96,Z,.10,.45,3.2);
        b.add(sign);
        const awning=box(M.civic,s*6.2,2.9,Z,1.8,.16,4.5);b.add(awning);
        for(let k of [-1.85,1.85]){
          const column=mesh(G.cylinder,M.civic,s*5.55,1.4,Z+k,.13,2.8,.13);
          b.add(column);B(M.stone,s*5.55,.16,Z+k,.4,.3,.4);
        }
        for(let y=4.4;y<height-.5;y+=2.25){
          B(M.cream,s*6.9,y,Z,.15,1.7,1.65);
          B(M.glass,s*6.79,y,Z,.11,1.37,1.36);
          B(M.wood,s*6.72,y,Z,.08,1.5,.06);
          B(M.wood,s*6.72,y,Z,.08,.08,1.5);
          if(j===0){
            B(M.stone,s*6.5,y-.82,Z,.6,.12,2);
            B(M.metal,s*6.22,y-.46,Z,.04,.04,2.2);
            for(let k=-1;k<=1;k+=.25)B(M.metal,s*6.22,y-.63,Z+k,.04,.4,.025);
          }
        }
      }
      // Small air conditioner and cables distinguish the building silhouette.
      B(M.white,s*6.7,3.9,-z+3,.45,.6,.9);
      for(let j=0;j<5;j++)B(M.dark,s*6.44,3.7+j*.075,-z+3,.02,.015,.68);
      const npc=createCharacter(rand()>.5?M.green:M.ochre,.93);
      characterPose(npc,rand()*6,false);npc.group.position.set(s*(5.65+rand()*.6),.12,-z+7);
      npc.group.rotation.y=s<0?-.5:.8;b.add(npc.group);
    }
  }
  // Lamps, trees, wires, bollards, protest posters and everyday clutter.
  for(let z=7;z<120;z+=25){
    for(let s of [-1,1]){
      B(M.metal,s*5.1,2.5,-z,.09,5,.09);
      B(M.metal,s*4.8,4.96,-z,.7,.08,.08);
      B(M.light,s*4.55,4.88,-z,.38,.10,.23);
      B(M.wood,s*6.1,.48,-z+4,.7,.8,.75);
      B(M.wood,s*6.15,1,-z+4,.78,.12,.85);
      B(M.dark,s*5.8,.25,-z+9,.09,.5,.09);
      B(M.ochre,s*5.8,.45,-z+9,.1,.12,.1);
      B(M.wood,s*6.3,1.8,-z+12,.25,3.6,.25);
      b.add(sphere(M.leaf,s*6.3,4.2,-z+12,1.45,1.5,1.6));
      b.add(sphere(M.leaf,s*6.5,5.2,-z+12,1.25,1.2,1.3));
      const poster=box(staticMaterials[7],s*6.8,1.6,-z+6,.04,1,1.8);b.add(poster);
    }
  }
  // Catenary-like overhead cables are lightweight segmented cylinders.
  for(let z=15;z<120;z+=32){
    for(let x=-7;x<7;x+=.7){
      const cable=box(M.dark,x,7.5-.9*(1-(x/7)**2),-z,.72,.018,.018);b.add(cable);
    }
  }
  const g=b.finish();
  for(let i=0;i<3;i++){const chunk=g.clone();scene.add(chunk);street.push(chunk);}
}
function barrierModel(){
  const g=new THREE.Group();
  box(M.metal,0,.58,0,1.8,1,.1,g);
  box(M.ochre,0,1.1,0,1.95,.13,.16,g);
  for(let x=-.8;x<=.8;x+=.32){
    const bar=box(M.yellow,x,.65,-.07,.10,.68,.025,g);bar.rotation.z=.5;
  }
  for(let s of [-1,1])box(M.metal,s*.78,.12,.15,.12,.23,.7,g);
  return g;
}
function cartModel(){
  const g=new THREE.Group();box(M.wood,0,.76,0,1.6,.28,1.5,g);
  for(let s of [-1,1])for(let z of [-.5,.5]){
    const wheel=mesh(G.cylinder,M.dark,s*.7,.35,z,.3,.10,.3,g);wheel.rotation.z=Math.PI/2;
  }
  for(let i=0;i<6;i++)box(i%2?M.ochre:M.terracotta,(i%3-1)*.45,1.05+Math.floor(i/3)*.22,0,.40,.2,.85,g);
  return g;
}
function overheadModel(){
  const g=new THREE.Group();
  for(let s of [-1,1])box(M.metal,s*.94,1.6,0,.08,3.2,.08,g);
  box(M.wood,0,2,0,2,.85,.18,g);box(M.yellow,0,1.64,-.11,2,.09,.05,g);
  return g;
}
function buildMission(){
  const random=rng(1948);
  for(let d=40,i=0;d<875;d+=18,i++){
    if(Math.abs(d-240)<28||Math.abs(d-575)<30)continue;
    const lane=Math.floor(random()*3)-1,type=i%5===2?'slide':i%4===0?'jump':'avoid';
    const model=type==='slide'?overheadModel():type==='jump'?barrierModel():i%3===1?delhiBarricade():cartModel();
    model.position.set(lane*LANE,0,-d);scene.add(model);
    obstacles.push({id:i,d,lane,type,model,done:false});
    if(i%6===3){
      const lane2=lane===1?-1:1;
      const o=barrierModel();scene.add(o);
      obstacles.push({id:i+100,d:d+4,lane:lane2,type:'jump',model:o,done:false});
    }
  }
  for(let d=26,i=0;d<880;d+=44,i++){
    if(Math.abs(d-240)<24||Math.abs(d-575)<30)continue;
    const lane=i%3-1,g=new THREE.Group();
    const sheet=box(M.paper,0,0,0,.4,.52,.04,g);sheet.rotation.z=-.18;
    for(let j=0;j<3;j++)box(M.navy,0,.12-j*.1,-.025,.25,.027,.012,g);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.4,.018,5,24),M.yellow);
    ring.rotation.x=Math.PI/2;ring.position.y=-.5;g.add(ring);
    scene.add(g);pickups.push({id:i,d,lane,model:g,collected:false});
  }
  const gate=new THREE.Group();
  for(let lane=-1;lane<=1;lane++){const p=barrierModel();p.position.x=lane*LANE;gate.add(p);}
  gate.userData.kind='gate';gate.position.z=-240;scene.add(gate);scene.userData.gate=gate;
  const journalist=createCharacter(M.green);characterPose(journalist,0,false);
  journalist.group.position.set(-3.2,0,-575);scene.add(journalist.group);scene.userData.journalist=journalist.group;
  const arch=new THREE.Group();
  for(let s of [-1,1])box(M.stone,s*4.15,2,0,.55,4,.6,arch);
  box(staticMaterials[5],0,4.2,0,8.7,.9,.6,arch);
  box(M.light,0,3.65,0,8.4,.08,.1,arch);arch.position.z=-905;scene.add(arch);scene.userData.archive=arch;
}
function dustParticles(){
  const geo=new THREE.BufferGeometry(),data=new Float32Array(150*3);
  for(let i=0;i<150;i++){data[i*3]=(rand()-.5)*16;data[i*3+1]=rand()*9;data[i*3+2]=-rand()*95;}
  geo.setAttribute('position',new THREE.BufferAttribute(data,3));
  dust=new THREE.Points(geo,new THREE.PointsMaterial({color:'#d5b58b',size:.035,transparent:true,opacity:.38,depthWrite:false}));
  scene.add(dust);
}
function applyQuality(value=$('quality').value){
  state.low=value==='low'||(value==='auto'&&mobile);
  if(!renderer)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,state.low?1.2:1.7));
  renderer.shadowMap.enabled=!state.low;
  sun.castShadow=!state.low;
  resize();
}
function resize(){
  if(!renderer)return;
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h);
  camera.aspect=w/h;camera.fov=w/h<.9?68:58;camera.updateProjectionMatrix();
}
function showSubtitle(text,time=4){
  $('subtitle').textContent=text;state.subtitleTime=time;$('subtitle').style.opacity=1;
}
function setMode(mode){
  state.mode=mode;
  $('start-screen').hidden=mode!=='menu';
  $('hud').hidden=['menu','loading','error'].includes(mode);
  $('pause-screen').hidden=mode!=='paused';
  $('result-screen').hidden=!['won','lost'].includes(mode);
  $('interaction').hidden=mode!=='dialogue';
  $('touch-controls').hidden=mode!=='running';
  $('pause-btn').hidden=!['running','dialogue','cutscene','paused'].includes(mode);
  $('pause-btn').textContent=mode==='paused'?'Resume':'Pause';
  document.body.classList.toggle('playing',mode!=='menu'&&mode!=='loading');
}
function checkpoint(){
  state.checkpoint={distance:state.distance,evidence:state.evidence,solidarity:state.solidarity,
    barrier:state.barrier,footage:state.footage,packets:[...state.packets],hit:[...state.hit]};
}
function reset(fromCheckpoint=false){
  const c=fromCheckpoint?state.checkpoint:null;
  Object.assign(state,{distance:c?.distance||0,lane:0,x:0,y:0,vy:0,slide:0,condition:100,
    evidence:c?.evidence||0,solidarity:c?.solidarity||0,hitCooldown:2,elapsed:0,
    barrier:c?.barrier||false,footage:c?.footage||false,dialogue:null,cutscene:0,collisions:0,
    packets:new Set(c?.packets||[]),hit:new Set(c?.hit||[])});
  if(!c)state.checkpoint=null;
  for(const o of obstacles)o.done=o.d<state.distance;
  for(const p of pickups)p.collected=state.packets.has(p.id);
  scene.userData.gate.children.forEach(n=>n.rotation.x=state.barrier?Math.PI/2:0);
  player.visible=true;updateWorld();updateHUD();setMode('running');beginAudio();
  showSubtitle(c?'Checkpoint restored. Your account is still with you.':'Swipe or use the buttons. Follow the paper packets.',5);
}
function startDialog(kind){
  state.dialogue=kind;setMode('dialogue');
  if(kind==='barrier'){
    $('interaction-kicker').textContent='THE CONFRONTATION';
    $('interaction-title').textContent='The route gives way.';
    $('interaction-copy').textContent='A fictional clash scatters the crowd. The contested barrier falls. Keep your companions together and take the opening.';
    $('interact-btn').textContent='Stay with the group';
  }else{
    $('interaction-kicker').textContent='THE WITNESS';
    $('interaction-title').textContent='“Keep my account intact.”';
    $('interaction-copy').textContent='The journalist asks you to carry her footage and testimony. She decides how it will be shared. Get it to the independent archive.';
    $('interact-btn').textContent='Preserve the footage';
  }
  $('interact-btn').focus({preventScroll:true});
}
function interact(){
  if(state.mode!=='dialogue')return;
  if(state.dialogue==='barrier'){
    state.barrier=true;state.solidarity+=2;state.cutscene=1.8;setMode('cutscene');
    sfx(120,.2,'triangle');showSubtitle('The crowd holds together. A route opens.',3);
  }else{
    state.footage=true;state.evidence+=1;state.solidarity+=3;
    checkpoint();setMode('running');showSubtitle('Footage preserved. Reach the archive.',4);sfx(660,.18);
  }
  updateHUD();
}
function finish(won){
  setMode(won?'won':'lost');player.visible=true;
  $('result-kicker').textContent=won?'MISSION COMPLETE':'ROUTE INTERRUPTED';
  $('result-title').textContent=won?'The account survives.':'Take another route.';
  $('result-copy').textContent=won?'The footage reaches the independent archive. A public investigation begins. This fictional ending is a demand for accountability, not a claim about a real case.':state.condition<=0?'Too many collisions interrupted the run. Try a different lane, jump over low barriers, or slide beneath hanging boards.':"You reached the archive without enough evidence. Collect at least 3 paper packets on the route.";
  $('result-stats').textContent=`Evidence ${state.evidence} · Solidarity ${state.solidarity} · Condition ${Math.max(0,state.condition)}`;
  $('retry-btn').textContent=won?'Run again':state.checkpoint?'Retry from checkpoint':'Try again';
  $('restart-result').hidden=won||!state.checkpoint;
  sfx(won?523:160,.35,'triangle');$('retry-btn').focus({preventScroll:true});
}
function action(a){
  if(state.mode==='dialogue'){if(a==='interact')interact();return;}
  if(state.mode!=='running')return;
  if(a==='left')state.lane=Math.max(-1,state.lane-1);
  if(a==='right')state.lane=Math.min(1,state.lane+1);
  if(a==='jump'&&state.y<=.01&&state.slide<=0){state.vy=7.1;sfx(330,.10);}
  if(a==='slide'&&state.y<=.1){state.slide=.95;sfx(170,.12,'triangle');}
}
function pause(){
  if(state.mode==='paused'){setMode(state.beforePause||'running');return;}
  if(['running','dialogue','cutscene'].includes(state.mode)){
    state.beforePause=state.mode;setMode('paused');$('resume-btn').focus({preventScroll:true});
  }
}
function updateHUD(){
  $('distance').textContent=`${Math.floor(state.distance)} / ${LENGTH} m`;
  $('route-progress').style.width=`${state.distance/LENGTH*100}%`;
  $('condition').textContent=Math.max(0,state.condition);
  $('health-bar').style.width=`${Math.max(0,state.condition)}%`;
  $('evidence').innerHTML=`${state.evidence} <small>/ 3</small>`;
  $('solidarity').textContent=state.solidarity;
  $('chapter').textContent=state.distance<240?'PATEL CHOWK':state.distance<575?'SANSAD MARG':'JANTAR MANTAR ROAD';
}
function collide(){
  if(state.hitCooldown>0)return;
  state.condition-=state.assist?8:20;state.collisions++;state.hitCooldown=1.1;camShake=state.reduced?0:.2;
  $('flash').style.opacity='.18';sfx(95,.16,'sawtooth');
  showSubtitle('Collision. Change lane, jump low barriers, slide under boards.',2.6);
  if(state.condition<=0)finish(false);
}
function updateWorld(){
  const base=Math.floor(state.distance/SEGMENT)-1;
  street.forEach((g,i)=>g.position.z=state.distance-(base+i)*SEGMENT);
  for(const o of obstacles){
    const dz=o.d-state.distance;o.model.visible=dz>-8&&dz<110&&!o.done;
    o.model.position.z=-dz;
  }
  for(const p of pickups){
    const dz=p.d-state.distance;p.model.visible=dz>-5&&dz<110&&!p.collected;
    p.model.position.set(p.lane*LANE,1+Math.sin(characterTime*.4+p.id)*.12,-dz);
    p.model.rotation.y=characterTime*.15;
  }
  scene.userData.gate.position.z=state.distance-240;
  scene.userData.gate.visible=state.distance<280;
  scene.userData.journalist.position.z=state.distance-575;
  scene.userData.journalist.visible=Math.abs(state.distance-575)<100;
  scene.userData.archive.position.z=state.distance-905;
  scene.userData.archive.visible=state.distance>800;
  if(delhiLandmarks)delhiLandmarks.position.z=state.distance;
}
function update(dt){
  if(state.mode==='loading'||state.mode==='error')return;
  if(state.mode==='menu'){
    characterTime+=dt;characterPose(parts,characterTime,false);
    player.position.set(0,0,0);player.rotation.y=.3;
    return;
  }
  if(state.mode==='paused'||state.mode==='won'||state.mode==='lost')return;
  if(state.subtitleTime>0){state.subtitleTime-=dt;if(state.subtitleTime<=0)$('subtitle').style.opacity=0;}
  if(state.mode==='dialogue'){characterPose(parts,0,false);return;}
  if(state.mode==='cutscene'){
    state.cutscene-=dt;
    scene.userData.gate.children.forEach((n,i)=>n.rotation.x=Math.min(Math.PI/2,n.rotation.x+dt*(1.7+i*.25)));
    if(state.cutscene<=0){state.distance=244;checkpoint();setMode('running');}
    updateWorld();updateHUD();return;
  }
  state.elapsed+=dt;state.distance=Math.min(LENGTH,state.distance+SPEED*dt);
  state.x+=(state.lane*LANE-state.x)*Math.min(1,dt*13);
  state.vy-=18*dt;state.y=Math.max(0,state.y+state.vy*dt);
  if(state.y===0)state.vy=0;
  state.slide=Math.max(0,state.slide-dt);state.hitCooldown=Math.max(0,state.hitCooldown-dt);
  characterTime+=dt*10.5;characterPose(parts,characterTime,true);
  player.position.set(state.x,state.y,0);
  player.scale.set(1,state.slide>0?.62:1,1);
  player.rotation.y=-(state.lane*LANE-state.x)*.10;
  player.visible=state.reduced||state.hitCooldown<=0||Math.floor(state.hitCooldown*12)%2===0;
  parts.torso.rotation.x=state.slide>0?-.6:state.y>.1?-.22:-.1;
  for(const o of obstacles){
    const dz=o.d-state.distance;
    if(!o.done&&dz<.65&&dz>-.65&&Math.abs(state.x-o.lane*LANE)<.85){
      const safe=o.type==='jump'?state.y>.75:o.type==='slide'?state.slide>0:false;
      o.done=true;
      if(!safe){state.hit.add(o.id);collide();}
    }
    if(dz<-1.3)o.done=true;
  }
  for(const p of pickups){
    if(!p.collected&&Math.abs(p.d-state.distance)<1.1&&Math.abs(state.x-p.lane*LANE)<.9){
      p.collected=true;state.packets.add(p.id);state.evidence++;state.solidarity++;
      sfx(640,.12);showSubtitle('Evidence packet secured.',1.3);
    }
  }
  if(state.mode==='running'&&state.distance>=238&&!state.barrier)startDialog('barrier');
  if(state.mode==='running'&&state.distance>=572&&!state.footage)startDialog('journalist');
  if(state.mode==='running'&&state.distance>=LENGTH)finish(state.evidence>=3&&state.footage);
  updateWorld();updateHUD();
  $('flash').style.opacity=state.hitCooldown>.9?'.12':'0';
  camShake=Math.max(0,camShake-dt);
}
function render(){
  if(!renderer||!scene)return;
  const menu=state.mode==='menu',target=new THREE.Vector3();
  const follow=camera.aspect<.9?.78:.28;
  const desired=new THREE.Vector3(menu?2.8:state.x*follow,menu?4.7:4.0,menu?11:8.0);
  camera.position.lerp(desired,menu?.035:.12);
  if(camShake>0&&!state.reduced){camera.position.x+=(rand()-.5)*camShake*.15;}
  target.set(menu?0:state.x*(camera.aspect<.9?.65:.2),menu?1.2:1.4,menu?-18:-14);
  camera.lookAt(target);
  renderer.render(scene,camera);
}
function frame(now){
  requestAnimationFrame(frame);
  if(manualStepping)return;
  const dt=Math.min((now-lastFrame)/1000||0,.06);lastFrame=now;
  update(dt);
  render();
  frames++;
  if(now-measureStart>1000){
    state.fps=Math.round(frames*1000/(now-measureStart));
    const info=renderer?.info.render;
    $('performance').textContent=`${state.fps} fps · ${state.low?'MOBILE':'HIGH'} · ${info?.calls||0} draws`;
    frames=0;measureStart=now;
  }
  if(sound&&state.mode==='running'&&!state.mute){
    beatTime+=dt;
    if(beatTime>.37){beatTime=0;musicBeat();}
  }
}

// Original synthesised score and effects. No autoplay, recordings, or licensed music.
function beginAudio(){
  if(state.mute)return;
  try{if(!sound)sound=new (window.AudioContext||window.webkitAudioContext)();sound.resume();}
  catch(e){$('sound-btn').textContent='Sound unavailable';}
}
function sfx(freq,duration=.12,type='sine',gain=.055){
  if(!sound||state.mute)return;
  const t=sound.currentTime,o=sound.createOscillator(),g=sound.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.75,t+duration);
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);
  o.connect(g).connect(sound.destination);o.start(t);o.stop(t+duration);
}
function musicBeat(){
  const bass=[110,110,146.83,130.81,110,110,164.81,146.83];
  sfx(bass[musicStep%8],.28,'triangle',.035);
  if(musicStep%2===0)sfx(55,.07,'sine',.06);
  if(musicStep%4===3)sfx(bass[musicStep%8]*4,.5,'sine',.025);
  musicStep++;
}
function inputBindings(){
  $('start-btn').onclick=()=>{state.assist=$('assist').checked;state.reduced=$('reduced-motion').checked;reset(false);};
  $('pause-btn').onclick=pause;$('resume-btn').onclick=pause;
  $('restart-pause').onclick=()=>reset(false);
  $('retry-btn').onclick=()=>reset(state.mode==='lost'&&!!state.checkpoint);
  $('restart-result').onclick=()=>reset(false);
  $('menu-btn').onclick=()=>{state.distance=0;state.y=0;state.slide=0;player.scale.setScalar(1);player.visible=true;updateWorld();setMode('menu');$('subtitle').style.opacity=0;};
  $('interact-btn').onclick=interact;
  $('reload-btn').onclick=()=>location.reload();
  $('quality').onchange=()=>applyQuality();
  $('reduced-motion').checked=state.reduced;
  $('reduced-motion').onchange=()=>state.reduced=$('reduced-motion').checked;
  $('assist').onchange=()=>state.assist=$('assist').checked;
  $('sound-btn').onclick=()=>{
    state.mute=!state.mute;beginAudio();
    $('sound-btn').textContent=state.mute?'Sound off':'Sound on';
    $('sound-btn').setAttribute('aria-label',state.mute?'Enable sound':'Mute sound');
    if(!state.mute)sfx(440,.08);
  };
  document.addEventListener('keydown',e=>{
    if(e.target.matches('select,input,summary'))return;
    const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',ArrowDown:'slide',KeyS:'slide',KeyE:'interact'};
    if(keys[e.code]){if(!e.repeat){action(keys[e.code]);}if(state.mode!=='menu')e.preventDefault();}
    if(['Escape','KeyP'].includes(e.code)){pause();e.preventDefault();}
  });
  for(const b of document.querySelectorAll('[data-action]')){
    b.addEventListener('pointerdown',e=>{e.preventDefault();action(b.dataset.action);});
  }
  let origin=null;
  root.addEventListener('pointerdown',e=>{if(state.mode==='running'){origin={x:e.clientX,y:e.clientY,id:e.pointerId};root.setPointerCapture(e.pointerId);}});
  root.addEventListener('pointerup',e=>{
    if(!origin||e.pointerId!==origin.id)return;
    const dx=e.clientX-origin.x,dy=e.clientY-origin.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))>22)action(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy<0?'jump':'slide');
    origin=null;
  });
  root.addEventListener('pointercancel',()=>origin=null);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&['running','dialogue','cutscene'].includes(state.mode))pause();});
  window.addEventListener('resize',resize);
}
async function init(){
  inputBindings();
  try{
    scene=new THREE.Scene();scene.background=new THREE.Color('#a6a393');
    scene.fog=new THREE.FogExp2('#a6a393',.018);
    renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:'high-performance'});
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.15;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    root.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',e=>{
      e.preventDefault();pause();$('error-message').textContent='The graphics context was interrupted. Reload to restart the mission, or choose Mobile / low graphics on the title screen.';$('error-screen').hidden=false;
    });
    camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,150);camera.position.set(2.8,4.7,11);
    scene.add(new THREE.HemisphereLight('#e2ded0','#6f7467',2.25));
    sun=new THREE.DirectionalLight('#ffd4a0',3.0);sun.position.set(-18,28,-35);sun.target.position.set(0,0,-25);
    sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;
    sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=.1;sun.shadow.camera.far=80;
    sun.shadow.bias=-.0008;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
    scene.add(new THREE.AmbientLight('#cbb898',.2));
    $('loading-note').textContent='Dressing the street and preparing the mission';
    createMaterials();
    // Image-element loading supports opaque-origin preview iframes.
    const image=new Image();image.crossOrigin='anonymous';
    image.onload=()=>{const tex=new THREE.Texture(image);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3,2);tex.needsUpdate=true;M.plaster.map=tex;M.plaster.needsUpdate=true;};
    image.onerror=()=>{$('loading-note').textContent='Texture unavailable; using the built-in material.';};
    image.src='./assets/plaster.webp';
    makeStreet();buildMission();buildDelhiLandmarks();dustParticles();
    parts=createCharacter();player=parts.group;scene.add(player);
    applyQuality();updateWorld();setMode('menu');
    $('start-btn').disabled=false;$('start-btn').textContent='Begin the witness route';
    $('loading-note').textContent='Ready · Keyboard, swipes, and touch buttons';
    window.advanceTime=ms=>{
      manualStepping=true;
      const n=Math.max(1,Math.ceil(ms/(1000/60)));
      for(let i=0;i<n;i++)update(ms/n/1000);
      render();
      $('performance').textContent=`QA step · ${state.low?'MOBILE':'HIGH'} · ${renderer.info.render.calls} draws`;
    };
    window.resumeRealTime=()=>{manualStepping=false;lastFrame=performance.now();measureStart=lastFrame;frames=0;};
    window.render_game_to_text=()=>JSON.stringify({
      mode:state.mode,coordinates:'Player at z=0; forward is -z; lanes -1 left, 0 centre, 1 right',
      distance:+state.distance.toFixed(2),goal:LENGTH,lane:state.lane,x:+state.x.toFixed(2),jump:+state.y.toFixed(2),
      sliding:state.slide>0,condition:state.condition,evidence:state.evidence,solidarity:state.solidarity,
      barrier:state.barrier,footage:state.footage,checkpoint:state.checkpoint?.distance||null,dialogue:state.dialogue,
      obstacles:obstacles.filter(o=>!o.done&&o.d-state.distance>-2&&o.d-state.distance<50).map(o=>({type:o.type,lane:o.lane,ahead:+(o.d-state.distance).toFixed(1)})),
      packets:pickups.filter(p=>!p.collected&&p.d-state.distance>0&&p.d-state.distance<50).map(p=>({lane:p.lane,ahead:+(p.d-state.distance).toFixed(1)})),
      quality:state.low?'low':'high',muted:state.mute,reducedMotion:state.reduced,assist:state.assist,fps:state.fps,
      setting:'New Delhi, compressed dramatic route',location:state.distance<240?'Patel Chowk':state.distance<575?'Sansad Marg':'Jantar Mantar Road',
      rendering:{draws:renderer.info.render.calls,triangles:renderer.info.render.triangles},
    });
    requestAnimationFrame(frame);
  }catch(error){
    console.error(error);state.mode='error';$('start-screen').hidden=true;$('error-screen').hidden=false;
    $('error-message').textContent=`The 3D scene could not load. Try a recent browser with WebGL 2 enabled. ${error.message}`;
  }
}
init();
