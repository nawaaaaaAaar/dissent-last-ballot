import * as THREE from 'three';
import {materials as M,box,cylinder} from './world-props.js';

const LAYOUTS={
  jantar:{packets:[[3,16],[-20,7],[3,-14]],crates:[[3,23],[3,-2],[-4,-21]],boosts:[[0,26],[-12,7],[-20,15],[0,-22],[-6,-37],[1,-42]]},
  jamia:{packets:[[-18,20],[18,16],[0,-23]],crates:[[0,12],[22,-13],[-5,-24]],boosts:[[-10,25],[8,20],[20,-8],[17,-22],[0,-37],[-5,-40]]},
  shaheen:{packets:[[-18,18],[18,5],[-18,-18]],crates:[[0,18],[-3,-8],[8,-22]],boosts:[[-7,26],[7,12],[0,-10],[-7,-29],[7,-35],[0,-42]]}
};

// Arcade rules and original geometry, not a real protest tactic or database.
export class StreetPlay{
  constructor(scene,hooks){
    this.h=hooks;this.group=new THREE.Group();scene.add(this.group);
    this.packets=Array.from({length:3},(_,i)=>{
      const prop=new THREE.Group();box(prop,M.wood,0,.18,0,.60,.36,.45);
      box(prop,M.white,0,.375,0,.43,.025,.30);box(prop,M.leaf,0,.394,.01,.36,.012,.25);
      const marker=new THREE.Mesh(new THREE.TorusGeometry(.72,.035,8,28),new THREE.MeshBasicMaterial({color:'#efd098'}));
      marker.rotation.x=Math.PI/2;marker.position.y=.025;prop.add(marker);this.group.add(prop);
      return{id:'packet-'+i,x:0,z:0,item:true,auto:true,type:'packet',title:'Consented record packet',prop,marker};
    });
    this.boosts=Array.from({length:6},()=>{
      const g=new THREE.Group();cylinder(g,M.glass,0,.24,0,.10,.40);cylinder(g,M.white,0,.46,0,.04,.05);
      const r=new THREE.Mesh(new THREE.TorusGeometry(.40,.022,6,20),new THREE.MeshBasicMaterial({color:'#8fc9b4'}));r.rotation.x=Math.PI/2;r.position.y=.03;g.add(r);this.group.add(g);
      return{g,x:0,z:0,taken:false};
    });
    this.crates=Array.from({length:3},()=>{
      const g=new THREE.Group();box(g,M.wood,0,.33,0,1.5,.66,.7);
      for(let y of [.14,.32,.5])box(g,M.dark,0,y,.36,1.45,.025,.015);
      box(g,M.white,0,.67,0,1.3,.025,.60);this.group.add(g);return g;
    });
    this.pulseRing=new THREE.Mesh(new THREE.RingGeometry(.5,.75,48),new THREE.MeshBasicMaterial({color:'#a4d6bd',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));
    this.pulseRing.rotation.x=-Math.PI/2;this.pulseRing.position.y=.12;this.group.add(this.pulseRing);
    this.gatheringRing=new THREE.Mesh(new THREE.RingGeometry(10.7,11,64),new THREE.MeshBasicMaterial({color:'#ddb981',transparent:true,opacity:.30,side:THREE.DoubleSide,depthWrite:false}));
    this.gatheringRing.rotation.x=-Math.PI/2;this.gatheringRing.position.set(0,.055,-36);this.group.add(this.gatheringRing);
    this.reset(false,'jantar',[],[]);
  }
  reset(active,id,events,colliders){
    this.active=active;this.group.visible=active;this.collected=[];this.energy=60;this.cooldown=0;this.pulseTime=0;this.chain=0;this.chainTime=0;this.popTime=0;this.pulses=0;
    for(let i=events.length-1;i>=0;i--)if(events[i].auto)events.splice(i,1);
    for(let i=colliders.length-1;i>=0;i--)if(colliders[i].street)colliders.splice(i,1);
    const layout=LAYOUTS[id];
    this.packets.forEach((e,i)=>{[e.x,e.z]=layout.packets[i];e.prop.position.set(e.x,0,e.z);e.prop.visible=true;if(active)events.push(e);});
    this.boosts.forEach((e,i)=>{[e.x,e.z]=layout.boosts[i];e.g.position.set(e.x,0,e.z);e.g.visible=true;e.taken=false;});
    this.crates.forEach((g,i)=>{const [x,z]=layout.crates[i];g.position.set(x,0,z);if(active)colliders.push({x,z,w:1.5,d:.7,h:.7,street:true,name:'street hurdle'});});
    this.pulseRing.visible=this.gatheringRing.visible=false;
  }
  target(){return this.packets.find(e=>!this.collected.includes(e.id));}
  inGathering(s){return Math.hypot(s.x,s.z+36)<11;}
  damage(){this.chain=0;this.chainTime=0;}
  pulse(s,police,valid){
    if(!this.active||this.cooldown>0||this.energy<30)return false;
    this.energy-=30;this.cooldown=6;this.pulses++;this.pulseTime=.7;
    this.pulseRing.visible=true;this.pulseRing.position.set(s.x,.12,s.z);this.pulseRing.scale.setScalar(1);
    for(const a of police){
      const p=a.p.group.position,d=Math.hypot(p.x-s.x,p.z-s.z);if(d>8)continue;
      const dx=(p.x-s.x)/(d||1),dz=(p.z-s.z)/(d||1);
      for(let i=0;i<14;i++){const x=p.x+dx*.5,z=p.z+dz*.5;if(valid(x,z)){p.x=x;p.z=z;}else break;}
      a.stun=3;a.windup=0;a.attackCooldown=3;a.telegraph.visible=false;
    }
    this.h.tone(260,.18);this.h.toast('Rally: space opened. Move while it lasts.',2);return true;
  }
  update(dt,s,action){
    if(!this.active)return;
    this.cooldown=Math.max(0,this.cooldown-dt);this.chainTime=Math.max(0,this.chainTime-dt);this.popTime=Math.max(0,this.popTime-dt);
    if(!this.chainTime)this.chain=0;
    if(this.pulseTime>0){this.pulseTime-=dt;const t=1-this.pulseTime/.7;this.pulseRing.scale.setScalar(1+t*10);this.pulseRing.material.opacity=(1-t)*.65;if(this.pulseTime<=0)this.pulseRing.visible=false;}
    this.gatheringRing.visible=action.mission==='hold'&&action.rescued.length===3;
    for(const e of this.packets){
      if(this.collected.includes(e.id))continue;e.marker.rotation.z+=dt*.4;
      if(s.y<1.3&&Math.hypot(s.x-e.x,s.z-e.z)<1.35){
        this.collected.push(e.id);s.items.push(e.id);e.prop.visible=false;
        this.chain=Math.min(3,this.chain+1);this.chainTime=25;this.energy=Math.min(100,this.energy+20);
        action.stamina=Math.min(100,action.stamina+35);const gain=150*this.chain;action.score+=gain;
        this.popTime=1.6;this.h.pop(`+${gain} · PACKET ${this.collected.length}/3 · CHAIN ×${this.chain}`);
        this.h.tone(450+this.chain*100,.12);
      }
    }
    for(const e of this.boosts)if(!e.taken&&Math.hypot(s.x-e.x,s.z-e.z)<.9){
      e.taken=true;e.g.visible=false;this.energy=Math.min(100,this.energy+15);action.stamina=Math.min(100,action.stamina+25);
      this.popTime=1.2;this.h.pop('SUPPLIES · +15 RALLY · +25 STAMINA');this.h.tone(650,.08);
    }
    this.h.hud(this);
  }
}
