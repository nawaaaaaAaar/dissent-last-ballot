import * as THREE from 'three';
import {materials as M,box,cylinder,sign,mergeStatic,bench,tent,lamp,barricade} from './world-props.js';

export const DISTRICTS={
  jantar:{name:'Jantar Mantar',mission:'break',chapter:'More than one resignation',brief:'Join the fictional vote-chori protest demanding Gyanesh Kumar’s exit and an end to SIR. Recover the recorder, compare three consented fictional voter cases at the help points, open the line, find Kabir and bring the demands to the assembly. Replacing one official is not enough.',debrief:'The protest carries a three-part demand: leadership accountability, ending the contested SIR process, and inclusion of every eligible voter. Now follow the affected people beyond Delhi.',region:'Delhi / current-movement reference',area:[[-10.4,10.4,-49,38],[-28,-10.4,-12,22],[12,45,-35,35],[10,15,-18,-11]],coords:{}},
  jamia:{name:'Bihar / voter-help camp',mission:'escort',chapter:'Names are people',brief:'This invented help camp is not a surveyed Bihar location. Review three voter files, regroup Mira and Kabir carrying the consented referrals, navigate the camp, open the exit and arrive together. Elections already held do not end the responsibility to include eligible voters.',debrief:'The team delivered inclusion referrals, including an omitted resident and a first-time voter; a duplicate was not falsely restored. These are fictional referrals, not approved registrations. Continue to the pending-appeal desk.',region:'Bihar / fictional post-SIR help camp',area:[[-26,24,-46,36]],coords:{organiser:[-18,20],aid:[-22,-5],witness:[-5,-5],barrier:[0,-29.6],assembly:[0,-43],protest:[18,-16],companion:[18,16],record:[-24,-7],recorder:[-17,-20],water0:[-23,12],water1:[7,22],water2:[20,-24],note0:[-10,12],note1:[9,-18]}},
  shaheen:{name:'West Bengal / inclusion desk',mission:'hold',chapter:'No case disappears',brief:'At this invented neighbourhood camp, compare three voter files at the inclusion, appeal and first-time desks in any order. Keep all three supported for twenty uncontested game seconds, then deliver the reform charter. Do not treat a pending appeal as resolved.',debrief:'The camp preserved an appeal follow-up and eligible-voter referrals. The movement must repair exclusion risks across affected states, not merely change the chief. Nothing here changes an actual roll or reverses a past election.',region:'West Bengal / fictional post-SIR camp',area:[[-24,24,-46,36]],coords:{organiser:[-18,18],aid:[18,5],witness:[-5,-5],barrier:[0,-29.6],assembly:[0,-36],protest:[-18,-18],companion:[3,-35],record:[-24,-7],recorder:[4,-5],water0:[-22,4],water1:[14,20],water2:[13,-26],note0:[-9,13],note1:[-20,-9]}}
};

const KEY='dissent-campaign-v09';
export const campaign={
  results:{},
  load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');this.results=Object.fromEntries(Object.keys(DISTRICTS).filter(k=>v[k]&&Number.isFinite(v[k].score)).map(k=>[k,{score:Math.max(0,v[k].score),helped:Math.max(0,Math.min(3,v[k].helped||0))}]));}catch{this.results={};}},
  record(id,score,helped){this.results[id]={score:Math.max(score,this.results[id]?.score||0),helped:Math.max(helped,this.results[id]?.helped||0)};try{localStorage.setItem(KEY,JSON.stringify(this.results));}catch{}},
  next(){return Object.keys(DISTRICTS).find(k=>!this.results[k])||'jantar';},
  count(){return Object.keys(this.results).length;}
};

function facade(parent,x,z,w,d,h,mat,shop=''){
  box(parent,mat,x,h/2,z,w,h,d);box(parent,M.white,x,h+.12,z,w+.25,.24,d+.25);
  for(let y=2;y<h-1;y+=2.5)for(let xx=x-w/2+1;xx<x+w/2;xx+=2.3){
    box(parent,M.dark,xx,y,z+d/2+.04,1.25,1.6,.08);box(parent,M.glass,xx,y,z+d/2+.10,1.09,1.42,.035);
    box(parent,M.white,xx,y-.81,z+d/2+.1,1.35,.10,.18);
  }
  if(shop){box(parent,M.metal,x,1.1,z+d/2+.08,w-1,2.2,.08);sign(parent,shop,x,2.6,z+d/2+.20,w-1,.7,'#dfd0b6','#344c45');}
}
function campusGate(parent){
  const shape=new THREE.Shape();shape.moveTo(-5,0);shape.lineTo(-5,7);shape.lineTo(5,7);shape.lineTo(5,0);shape.closePath();
  const hole=new THREE.Path();hole.moveTo(-2.5,0);hole.lineTo(-2.5,3.8);hole.absarc(0,3.8,2.5,Math.PI,0,true);hole.lineTo(2.5,0);hole.closePath();shape.holes.push(hole);
  const o=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false}),M.red);o.position.set(0,0,28);o.castShadow=o.receiveShadow=true;parent.add(o);
  sign(parent,'VOTER HELP CAMP',0,6.7,29.04,7.8,.65,'#d9cbb1','#315449','BIHAR · INVENTED LOCATION');
}
export function buildDistrict(scene,id,ground,colliders,barriers){
  const campus=id==='jamia',g=new THREE.Group();
  ground(M.sand,0,0,180,180,-.08);ground(campus?M.paving:M.road,0,-5,52,94,.01);
  if(campus){
    ground(M.grass,-18,8,12,17,.03);ground(M.grass,16,-15,11,16,.03);
    const brick=M.cream.clone();brick.color.set('#a47962');
    for(const b of [{x:-15,z:-12,w:12,d:12,h:9},{x:14,z:2,w:10,d:14,h:8}]){
      facade(g,b.x,b.z,b.w,b.d,b.h,brick);colliders.push({...b,name:'campus building'});
      sign(g,b.x<0?'ROLL COMPARISON':'REFERRAL DESK',b.x,1.8,b.z+b.d/2+.18,b.w-1,.75,'#d9ccb5','#354a3f');
    }
    campusGate(g);
    for(const x of [-3.75,3.75])colliders.push({x,z:28,w:2.5,d:1,h:7,name:'campus gate pier'});
    for(const x of [-18,18]){box(g,brick,x,1.2,-33,18,2.4,1);colliders.push({x,z:-33,w:18,d:1,name:'campus exit wall'});}
    for(let x of [-27,25])for(let z=-45;z<37;z+=5)box(g,brick,x,1,z,.25,2,4.8);
    sign(g,'EVERY ELIGIBLE VOTER COUNTS',-7,2.5,-22,8,1.1,'#9c4c36','#f3e5cc');
    for(const [x,z] of [[-21,20],[7,20],[21,-24],[-10,10]])bench(g,x,z);
    for(let z of [-22,4,21]){lamp(g,-25,z);lamp(g,23,z+3);}
    tent(g,-22,-5);sign(g,'FIRST-TIME VOTERS',-22,2.6,-2.7,3.5,.65,'#d3c6ab','#744637');
  }else{
    ground(M.paving,-19,-5,10,94,.04);ground(M.paving,19,-5,10,94,.04);
    const shops=['BOOKS & STATIONERY','VOTER HELP CAMP','REPAIR & PRINT','NEIGHBOURHOOD SHOP'];
    for(let side of [-1,1])for(let i=0;i<5;i++){
      const z=29-i*17,w=10,h=7+i%3*2,mat=M.cream.clone();mat.color.set(i%2?'#cfbfa0':'#bca597');
      const block=new THREE.Group();facade(block,0,0,w,13,h,mat,shops[(i+(side>0?1:0))%4]);
      block.rotation.y=side<0?-Math.PI/2:Math.PI/2;block.position.set(side*30,0,z);g.add(block);
      for(let xx of [-2.8,0,2.8])box(block,M.metal,xx,h-.6,6.9,1.2,.04,.8);
    }
    for(let z of [-31,-8,17]){
      const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-25,6,z),new THREE.Vector3(0,5,z+.6),new THREE.Vector3(25,6,z)]),new THREE.LineBasicMaterial({color:'#343f39'}));scene.add(wire);
      for(let x=-20;x<=20;x+=4){const cloth=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshStandardMaterial({color:x%8?'#b39a74':'#896a62',side:THREE.DoubleSide,roughness:1}));cloth.position.set(x,5.3,z+.5);cloth.rotation.z=Math.PI/4;g.add(cloth);}
    }
    tent(g,-18,18);sign(g,'APPEAL FOLLOW-UP',-18,2.6,20.3,3.6,.65,'#d3c6ab','#744637');
    tent(g,18,5);sign(g,'INCLUSION DESK',18,2.6,7.3,3.6,.65,'#d3c6ab','#744637');
    tent(g,-18,-18);sign(g,'FIRST-TIME VOTERS',-18,2.6,-15.7,3.6,.65,'#d3c6ab','#744637');
    // A shared canopy is the visual centre, not a chased courier corridor.
    box(g,M.wood,0,.12,-36,14,.24,8);box(g,M.red,0,3.7,-36,15,.08,10);
    for(let x of [-7,7])for(let z of [-40,-32])cylinder(g,M.metal,x,1.8,z,.055,3.6);
    sign(g,'NO ELIGIBLE VOTER LEFT OUT',0,3.1,-31.9,10,.8,'#e4d4b9','#653d2c');
    for(let i=0;i<12;i++){box(g,i%2?M.red:M.leaf,-5.5+(i%6)*2.1,.04,-35-Math.floor(i/6)*2.5,1.6,.08,1.8);}
    for(let z of [21,13,-10])for(let x of [-5,-2,1,4])box(g,x%2?M.wood:M.red,x,.035,z,1.7,.06,2.5);
    for(const [x,z] of [[-12,7],[12,-12],[-13,-28]])bench(g,x,z);
    for(let z of [-22,4,21]){lamp(g,-23,z);lamp(g,23,z+3);}
  }
  scene.add(mergeStatic(g));
  if(campus)for(let x=-7.9;x<9;x+=3.15){const b=barricade();b.position.set(x,0,-33);scene.add(b);barriers.push(b);}
}
