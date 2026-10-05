import * as THREE from 'three';

// Fictional, deliberately abstract action rules. No realistic sabotage mechanics.
export class ActionGame {
  constructor(scene, hooks) {
    this.h=hooks;
    this.warning=new THREE.Mesh(new THREE.RingGeometry(.05,2.5,48),new THREE.MeshBasicMaterial({color:0xef634b,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
    this.warning.rotation.x=-Math.PI/2;this.warning.position.y=.2;this.warning.visible=false;scene.add(this.warning);
    this.reset(false);
  }
  reset(active=true,mission='break') {
    this.mission=mission;this.settle=0;this.contested=false;this.exhausted=false;this.support=0;
    this.active=active;this.health=5;this.stamina=100;this.dodge=0;this.cooldown=0;this.hurt=0;this.time=0;this.sweep=0;this.charge=0;
    this.rescued=[];this.barrier=0;this.holding=false;this.hold=0;this.score=0;this.warning.visible=false;this.finish=false;
  }
  get sprintAllowed(){if(this.stamina<=5)this.exhausted=true;if(this.stamina>=30)this.exhausted=false;return !this.exhausted;}
  evade() {
    if(!this.active||this.cooldown>0)return false;
    this.dodge=.48;this.cooldown=2.3;this.h.tone(420,.08);return true;
  }
  target(s) {
    const packet=this.h.packetTarget?.();if(packet)return packet.id;
    if(this.mission==='escort'){if(!this.rescued.includes('organiser'))return 'organiser';if(!s.companion)return 'companion';const review=this.h.missingReview?.();if(review)return review;if(!s.tasks.barrier)return 'barrier';return 'assembly';}
    if(this.mission==='hold')return ['organiser','aid','protest'].find(id=>!this.rescued.includes(id))||'assembly';
    if(!s.inventory.recorder)return 'recorder';
    const review=this.h.missingReview?.();if(review)return review;
    if(!s.tasks.barrier)return 'barrier';
    if(!s.companion)return 'companion';
    return 'assembly';
  }
  objective(s) {
    const packet=this.h.packetTarget?.();if(packet)return `Collect the record packets (${this.h.packetCount()} / 3). Keep moving.`;
    if(this.mission==='escort'){if(!this.rescued.includes('organiser'))return 'Regroup Mira. Hold ACTION.';if(!s.companion)return 'Regroup Kabir. Keep the team close.';if(this.h.missingReview?.())return `Compare the remaining voter files (${this.rescued.length} / 3).`;if(!s.tasks.barrier)return 'Lead both companions to the exit. Hold ACTION.';return 'Deliver the packets together. Wait for your companions.';}
    if(this.mission==='hold'){const names={organiser:'appeal desk',aid:'inclusion desk',protest:'first-time voter desk'},id=this.target(s);if(id!=='assembly')return `Activate the ${names[id]} (${this.rescued.length} / 3).`;return this.settle<20?`${this.contested?'Return to the gold gathering zone':'Hold the gathering · dodge and Rally'} · ${Math.ceil(20-this.settle)} seconds`:'Deliver the packets. The gathering holds.';}
    if(!s.inventory.recorder)return 'Recover the recorder. Keep moving.';
    if(this.h.missingReview?.())return `Compare three consented voter files (${this.rescued.length} / 3). Hold ACTION.`;
    if(!s.tasks.barrier)return 'Reach the line. Hold ACTION to break through.';
    if(!s.companion)return 'Find Kabir beyond the barricade.';
    return 'Reach the assembly together.';
  }
  damage(s) {
    if(this.hurt>0||this.dodge>0||this.finish)return;
    this.health--;this.hurt=1.8;this.score=Math.max(0,this.score-50);this.h.tone(90,.14);
    this.h.damage?.();
    if(this.health<=0&&this.support>0){this.support--;this.health=2;this.hurt=3;this.h.toast('Network support: people you helped give you another chance.',3);return;}
    if(this.health<=0){this.h.fail();return;}
    this.h.toast('Hit. Dodge or move out of the red warning zone.',2);
  }
  interact(s,e) {
    if(!e||this.finish)return;
    if(e.item){if(s.items.includes(e.id))return;this.h.collect(e);this.score+=100;return;}
    if(['aid','organiser','protest'].includes(e.id)) {
      if(this.rescued.includes(e.id))return;
      this.holding=true;
      this.h.toast(this.h.review?'Hold ACTION to compare this consented voter case.':'Stay close and hold ACTION to get them moving.',1.5);return;
    }
    if(e.id==='barrier') {
      if(this.mission==='break'&&!s.inventory.recorder){this.h.toast('Recover the recorder before crossing the line.',2);return;}
      if(this.mission==='escort'&&(!s.companion||!this.rescued.includes('organiser')||!this.h.escortReady())){this.h.toast('Bring Mira and Kabir close before opening the exit.',2);return;}
      this.holding=true;return;
    }
    if(e.id==='companion') {
      if(!s.tasks.barrier&&this.mission!=='escort')return;
      s.companion=true;this.score+=250;this.h.tone(600,.16);this.h.toast('Kabir is with you. Get to the assembly.',3);return;
    }
    if(e.id==='assembly') {
      if(this.h.packetTarget?.()){this.h.toast('Collect all three record packets before the handoff.',2);return;}
      if(this.h.missingReview?.()){this.h.toast('Review all three voter files. One resignation is not the whole demand.',3);return;}
      if(this.mission==='break'&&(!s.inventory.recorder||!s.companion)){this.h.toast('Do not leave the recorder or Kabir behind.',2);return;}
      if(this.mission==='escort'&&(!s.tasks.barrier||!s.companion||!this.rescued.includes('organiser')||!this.h.escortReady())){this.h.toast('Wait for both companions. An escort ends together.',2);return;}
      if(this.mission==='hold'&&this.settle<20){this.h.toast('Activate all three desks; keep moving inside the gold zone for twenty seconds.',3);return;}
      this.finish=true;this.score+=Math.round(this.health*100+Math.max(0,240-this.time)*3);
      this.h.win();return;
    }
  }
  help(s,id){
    if(this.rescued.includes(id))return;
    this.rescued.push(id);this.hold=0;this.holding=false;this.score+=200;this.health=Math.min(5,this.health+1);s.pressure=1;s.checkpoint={x:s.x,z:s.z};this.h.tone(550,.15);
    this.h.toast(this.h.review?'File referred. A referral is not official voter restoration.':this.mission==='hold'?'Station supported. The organisers bring people to the gathering.':'They are safe. +200 · recovered one health.',3);
  }
  update(dt,s,near,police,moving) {
    if(!this.active||this.finish)return;
    this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.dodge=Math.max(0,this.dodge-dt);this.hurt=Math.max(0,this.hurt-dt);
    this.stamina=Math.max(0,Math.min(100,this.stamina+(s.sprint&&moving?-18:13)*dt));
    if(s.pressure)this.sweep+=dt;
    if(this.sweep>9&&this.charge===0){this.charge=1.6;this.warning.position.set(s.x,.2,s.z);this.warning.visible=true;this.h.tone(180,.1);}
    if(this.charge>0) {
      this.charge-=dt;this.warning.material.opacity=.2+Math.sin(this.time*18)*.13;this.warning.rotation.z+=dt;
      if(this.charge<=0){if(s.y<.65&&Math.hypot(s.x-this.warning.position.x,s.z-this.warning.position.z)<2.5)this.damage(s);this.warning.visible=false;this.sweep=0;this.charge=0;}
    }
    // Individual officer wind-ups and contact resolution are handled by the world.
    if(this.holding&&near) {
      if(near.id==='barrier'&&!s.tasks.barrier&&(s.inventory.recorder||this.mission==='escort')) {
        this.barrier=Math.min(1,this.barrier+dt/(s.assist?1.8:2.7));
        if(this.barrier>=1){s.tasks.barrier=true;this.score+=300;s.checkpoint={x:s.x,z:s.z};this.holding=false;this.h.toast(this.mission==='escort'?'The exit opens. Deliver the referrals together.':'The line gives way. Find Kabir!',3);this.h.tone(250,.2);}
      }else if(['aid','organiser','protest'].includes(near.id)&&!this.rescued.includes(near.id)) {
        this.hold+=dt;
        if(this.hold>=1){this.hold=0;this.holding=false;if(this.h.review)this.h.review(near);else this.help(s,near.id);}
      }else this.hold=0;
    }else this.hold=0;
    if(this.mission==='hold'&&this.rescued.length===3){
      this.contested=this.h.stations().some(e=>police.some(a=>Math.hypot(a.p.group.position.x-e.x,a.p.group.position.z-e.z)<2.1));
      if(this.h.inGathering)this.contested=!this.h.inGathering(s);
      if(!this.contested)this.settle=Math.min(20,this.settle+dt);
    }
  }
}
