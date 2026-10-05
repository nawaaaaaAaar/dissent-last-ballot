import * as THREE from 'three';

// Fictional, deliberately abstract action rules. No realistic sabotage mechanics.
export class ActionGame {
  constructor(scene, hooks) {
    this.h=hooks;
    this.warning=new THREE.Mesh(new THREE.RingGeometry(.05,2.5,48),new THREE.MeshBasicMaterial({color:0xef634b,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
    this.warning.rotation.x=-Math.PI/2;this.warning.position.y=.2;this.warning.visible=false;scene.add(this.warning);
    this.reset(false);
  }
  reset(active=true) {
    this.active=active;this.health=5;this.stamina=100;this.dodge=0;this.cooldown=0;this.hurt=0;this.time=0;this.sweep=0;this.charge=0;
    this.rescued=[];this.barrier=0;this.holding=false;this.hold=0;this.score=0;this.warning.visible=false;this.finish=false;
  }
  get sprintAllowed(){return this.stamina>5;}
  evade() {
    if(!this.active||this.cooldown>0)return false;
    this.dodge=.48;this.cooldown=2.3;this.h.tone(420,.08);return true;
  }
  target(s) {
    if(!s.inventory.recorder)return 'recorder';
    if(!s.tasks.barrier)return 'barrier';
    if(!s.companion)return 'companion';
    return 'assembly';
  }
  objective(s) {
    if(!s.inventory.recorder)return 'Recover the recorder. Keep moving.';
    if(!s.tasks.barrier)return 'Reach the line. Hold ACTION to break through.';
    if(!s.companion)return 'Find Kabir beyond the barricade.';
    return 'Reach the assembly together.';
  }
  damage(s) {
    if(this.hurt>0||this.dodge>0||this.finish)return;
    this.health--;this.hurt=1.8;this.score=Math.max(0,this.score-50);this.h.tone(90,.14);
    if(this.health<=0){this.h.fail();return;}
    this.h.toast('Hit. Dodge or move out of the red warning zone.',2);
  }
  interact(s,e) {
    if(!e||this.finish)return;
    if(e.item){if(s.items.includes(e.id))return;this.h.collect(e);this.score+=100;return;}
    if(['aid','organiser','protest'].includes(e.id)) {
      if(this.rescued.includes(e.id))return;
      this.holding=true;
      this.h.toast('Stay close and hold ACTION to get them moving.',1.5);return;
    }
    if(e.id==='barrier') {
      if(!s.inventory.recorder){this.h.toast('Recover the recorder before crossing the line.',2);return;}
      this.holding=true;return;
    }
    if(e.id==='companion') {
      if(!s.tasks.barrier)return;
      s.companion=true;this.score+=250;this.h.tone(600,.16);this.h.toast('Kabir is with you. Get to the assembly.',3);return;
    }
    if(e.id==='assembly') {
      if(!s.inventory.recorder||!s.companion){this.h.toast('Do not leave the recorder or Kabir behind.',2);return;}
      this.finish=true;this.score+=Math.round(this.health*100+Math.max(0,240-this.time)*3);
      this.h.win();return;
    }
  }
  update(dt,s,near,police,moving) {
    if(!this.active||this.finish)return;
    this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.dodge=Math.max(0,this.dodge-dt);this.hurt=Math.max(0,this.hurt-dt);
    this.stamina=Math.max(0,Math.min(100,this.stamina+(s.sprint&&moving?-18:13)*dt));
    this.sweep+=dt;
    if(this.sweep>9&&this.charge===0){this.charge=1.6;this.warning.position.set(s.x,.2,s.z);this.warning.visible=true;this.h.tone(180,.1);}
    if(this.charge>0) {
      this.charge-=dt;this.warning.material.opacity=.2+Math.sin(this.time*18)*.13;this.warning.rotation.z+=dt;
      if(this.charge<=0){if(s.y<.65&&Math.hypot(s.x-this.warning.position.x,s.z-this.warning.position.z)<2.5)this.damage(s);this.warning.visible=false;this.sweep=0;this.charge=0;}
    }
    if(police.some(a=>Math.hypot(s.x-a.p.group.position.x,s.z-a.p.group.position.z)<1.25))this.damage(s);
    if(this.holding&&near) {
      if(near.id==='barrier'&&!s.tasks.barrier&&s.inventory.recorder) {
        this.barrier=Math.min(1,this.barrier+dt/(s.assist?1.8:2.7));
        if(this.barrier>=1){s.tasks.barrier=true;this.score+=300;s.checkpoint={x:s.x,z:s.z};this.holding=false;this.h.toast('The line gives way. Find Kabir!',3);this.h.tone(250,.2);}
      }else if(['aid','organiser','protest'].includes(near.id)&&!this.rescued.includes(near.id)) {
        this.hold+=dt;
        if(this.hold>=1){this.rescued.push(near.id);this.hold=0;this.holding=false;this.score+=200;this.health=Math.min(5,this.health+1);this.h.tone(550,.15);this.h.toast('They are safe. +200 · recovered one health.',2);}
      }else this.hold=0;
    }else this.hold=0;
  }
}
