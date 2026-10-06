import assert from 'node:assert/strict';
import fs from 'node:fs';
import {City} from './docs/city-rules.js';
const mapImport=fs.readFileSync('docs/city-rules.js','utf8').match(/from '(\.\/city-data\.js[^']*)'/)[1];
const {installMap,PLACES,roadRoute,snap,WORLD}=await import('./docs/'+mapImport.slice(2));
installMap(JSON.parse(fs.readFileSync('docs/delhi-map.json')));
const checks=[];
function check(name,fn){fn();checks.push(name);}
check('OSM map and georeferenced landmark relationships',()=>{
  assert.equal(WORLD.roads.length,1852);assert.equal(WORLD.sourceFootprints,785);assert(WORLD.buildings.length>300);assert.equal(WORLD.parks.length,124);
  assert(PLACES[1].z<PLACES[0].z&&PLACES[0].z<PLACES[2].z);assert(PLACES[2].x>PLACES[0].x);
  for(const p of PLACES){const route=roadRoute(snap(PLACES[1]),snap(p));assert(route.length>1);assert.equal(route.at(-1).x,snap(p).x);}
});
check('exit and retry never teleport an unrescued witness',()=>{
  const g=new City();g.start();g.accept('witness');const old={x:g.friend.x,z:g.friend.z};
  Object.assign(g.player,{x:g.van.x,z:g.van.z});g.interact();assert(g.van.occupied);g.interact();assert.equal(g.friend.x,old.x);assert.equal(g.friend.z,old.z);
  g.retry();assert.equal(g.friend.x,old.x);assert.equal(g.friend.z,old.z);
});
check('mission replacement requires abandon and charter requires three distinct jobs',()=>{
  const g=new City();g.start();assert(!g.accept('charter'));assert(g.accept('witness'));assert(!g.accept('signal'));g.abandon();assert(g.accept('signal'));
});
check('winning grants once, supports replay and medal best',()=>{
  const g=new City();g.start();g.accept('signal');g.player.x=g.mission.destination.x;g.player.z=g.mission.destination.z;g.record=true;
  assert(g.readyWin());g.win();assert.equal(g.network.total,1);assert.equal(g.network.credits,3);g.win();assert.equal(g.network.total,1);
  const first=g.network.bests.signal;g.continue();assert.equal(g.mode,'playing');assert(!g.mission);g.accept('signal');assert.equal(g.mission.variant,2);assert.equal(g.network.bests.signal,first);
});
check('hot delivery and missing companion cannot complete rescue',()=>{
  const g=new City();g.start();g.accept('witness');Object.assign(g.player,g.mission.destination);g.record=true;
  assert(!g.readyWin());g.friend.rescued=true;Object.assign(g.friend,g.mission.destination);g.heat=2;assert(!g.readyWin());g.heat=0;assert(g.readyWin());
});
check('support upgrade costs, duplicate rejection, stamina and reinforcement',()=>{
  const g=new City();g.start();assert(!g.upgrade('tempo'));g.network.credits=12;assert(g.upgrade('tempo'));assert(!g.upgrade('tempo'));assert.equal(g.network.credits,8);
  assert(g.upgrade('reinforce'));g.carHit(10);assert.equal(g.van.health,93);assert(g.upgrade('stamina'));assert(!g.upgrade('unknown'));
});
check('save roundtrip, malformed input and version validation',()=>{
  const g=new City();g.network.credits=7;g.network.total=2;g.network.upgrades=['tempo'];const code=g.save(),h=new City();
  assert(h.load(code));assert.deepEqual(h.network,g.network);const before=JSON.stringify(h.network);assert(!h.load('broken'));assert.equal(JSON.stringify(h.network),before);
  assert(!h.load(btoa(JSON.stringify({version:1,network:{credits:-1,completed:[],upgrades:[],total:0,cycle:1,bests:{}}}))));
});
check('three jobs unlock charter and completed charter advances cycle',()=>{
  const g=new City();g.start();g.network.completed=['witness','signal','hold'];assert(g.accept('charter'));g.win();assert.equal(g.network.cycle,2);assert.deepEqual(g.network.completed,[]);
});
check('rally requires time in zone on foot, outside pauses, not resets',()=>{
  const g=new City();g.start();g.accept('hold');g.enemies.forEach(e=>e.hp=0);Object.assign(g.player,g.mission.source);
  g.update(.05);assert.equal(g.hold,.05);g.player.x+=20;g.update(.05);assert.equal(g.hold,.05);g.van.occupied=true;g.update(.05);assert.equal(g.hold,.05);
});
check('building footprint and world boundaries block movement',()=>{
  const g=new City();assert(!g.valid(500,0));assert(!g.valid(0,-300));assert(g.valid(snap(PLACES[0]).x,snap(PLACES[0]).z));
});
check('boarding retry restores pursuit and variant, not an empty world',()=>{
  const g=new City();g.start();g.accept('signal');g.record=true;Object.assign(g.player,{x:g.van.x,z:g.van.z});g.interact();assert(g.car.active);const variant=g.mission.variant;g.carHit(100);assert.equal(g.mode,'caught');g.retry();assert(g.car.active);assert.equal(g.mission.variant,variant);assert.equal(g.van.health,100);assert.equal(g.heat,2);
});
check('rally marker changes and standing at the first point cannot finish',()=>{
  const g=new City();g.start();g.accept('hold');g.enemies.forEach(e=>e.hp=0);Object.assign(g.player,g.mission.source);g.hold=7.99;g.update(.05);assert.equal(g.wave,1);const hold=g.hold;g.update(.05);assert.equal(g.hold,hold);assert.notEqual(g.target().x,g.mission.source.x);
});
check('cleared return roadblock stays cleared after reboarding and retry',()=>{
  const g=new City();g.start();g.accept('signal');g.mission.variant=2;g.record=true;Object.assign(g.player,{x:g.van.x,z:g.van.z});g.interact();assert(g.roadblock);assert(g.blockActivated);
  g.interact();g.roadblock=false;g.interact();assert(!g.roadblock);assert(g.van.occupied);
  g.carHit(100);g.retry();assert(!g.roadblock);assert(g.blockActivated);g.interact();g.interact();assert(!g.roadblock);
});
check('three-strike combo spends stamina and cannot overspend',()=>{
  const g=new City();g.start();g.enemies.forEach(e=>e.hp=0);
  for(let i=1;i<=3;i++){g.player.attackCd=0;assert(g.attack());assert.equal(g.player.combo,i);}
  assert.equal(g.player.stamina,74);g.player.stamina=2;g.player.attackCd=0;assert(!g.attack());assert.equal(g.player.stamina,2);
});
check('perfect dodge cancels a committed close attack',()=>{
  const g=new City();g.start();g.accept('witness');const e=g.enemies[0];Object.assign(e,{x:g.player.x+1,z:g.player.z,windup:.2});
  assert(g.dash());assert.equal(e.windup,0);assert(e.stun>1);assert.equal(g.score,20);
});
check('courier requires held copying and damage interrupts progress',()=>{
  const g=new City();g.start();g.accept('signal');g.enemies.forEach(e=>e.hp=0);Object.assign(g.player,g.mission.source);
  g.update(.05);assert.equal(g.copy,0);g.input.interact=true;g.update(.05);assert(g.copy>0);
  const before=g.copy;g.player.hurt=.5;g.update(.05);assert.equal(g.copy,before);
  g.player.hurt=0;for(let i=0;i<40;i++)g.update(.05);assert(g.record);
});
check('arrival checkpoint preserves encounter rather than CP departure',()=>{
  const g=new City();g.start();g.accept('witness');Object.assign(g.player,g.mission.source);g.update(.05);
  const p={x:g.checkpoint.x,z:g.checkpoint.z};g.player.x+=20;g.retry();assert.equal(g.player.x,p.x);assert.equal(g.player.z,p.z);
});
check('final rally requires both readers, not timer or lone arrival',()=>{
  const g=new City();g.start();g.accept('hold');g.wave=2;g.hold=16;g.enemies.forEach(e=>e.hp=0);Object.assign(g.player,g.mission.destination);
  assert(!g.readyWin());g.readers=[{...g.mission.destination},{...g.mission.destination}];assert(g.readyWin());g.readers[0].x+=20;assert(!g.readyWin());
});
check('vehicle route excludes pedestrian-only node links',()=>{
  const route=roadRoute(snap(PLACES[0],true),snap(PLACES[1],true),{vehicle:true});assert(route.length>2);
  for(const n of route.slice(0,-1))assert(n.drive);
});
check('frontal shield blocks early strikes, finisher opens it',()=>{
  const g=new City();g.start();g.accept('witness');g.enemies.forEach(e=>e.hp=0);
  const e=g.enemies[0];Object.assign(e,{hp:4,role:'guard',x:g.player.x,z:g.player.z+1,yaw:Math.PI,guardBreak:0});g.input.aimX=0;g.input.aimZ=1;
  g.attack();g.contact();assert.equal(e.hp,4);g.player.attackCd=0;g.attack();g.contact();assert.equal(e.hp,4);g.player.attackCd=0;g.attack();g.contact();assert.equal(e.hp,2);assert(e.guardBreak>1);
});
check('volunteer service is consumed once per operation',()=>{
  const g=new City();g.start();g.accept('signal');g.enemies.forEach(e=>e.hp=0);const s=g.supports[0];Object.assign(g.player,{x:s.x,z:s.z,health:2,stamina:0});g.van.x+=100;g.van.health=40;
  g.interact();assert(s.used);assert.equal(g.player.health,4);assert.equal(g.van.health,75);assert.equal(g.score,40);g.interact();assert.equal(g.score,40);
});
check('abandoning failure starts a playable new operation, not zero-condition limbo',()=>{
  const g=new City();g.start();g.accept('signal');g.mode='caught';g.player.health=0;g.van.health=0;g.abandon();assert.equal(g.player.health,6);assert.equal(g.van.health,100);assert(g.accept('hold'));assert.equal(g.result,null);
});
check('underground station is excluded while original surface footprints remain',()=>{
  const d=JSON.parse(fs.readFileSync('docs/delhi-map.json'));assert(!d.buildings.some(b=>b.id==='1158884368'));assert.equal(d.buildings.length,785);assert(d.renderBuildings.length>300);
});
check('trimmed street display has a clear vehicle spawn',()=>{
  const g=new City();g.start();assert(g.valid(g.van.x,g.van.z,1.2));
  for(const b of WORLD.buildings)assert(!b.poly.some((p,i)=>Math.hypot(p.x-g.van.x,p.z-g.van.z)<1));
});
function patrolScene(){
  const g=new City();g.start();g.accept('signal');g.enemies.forEach(e=>e.hp=0);
  const p=snap(PLACES[1]);Object.assign(g.player,p);Object.assign(g.van,{...p,yaw:0,speed:0,occupied:true,health:100});
  Object.assign(g.car,{x:p.x,z:p.z-8,active:true,cooldown:0,windup:0,ram:0,contactCooldown:0,recoil:0});
  return g;
}
check('patrol following does not inflict passive overlap damage',()=>{
  const g=patrolScene();g.car.z=g.player.z-2;g.car.cooldown=10;
  for(let i=0;i<40;i++)g.update(.05);assert.equal(g.van.health,100);
});
check('vehicle charge has a warning and a single hit with recovery',()=>{
  const g=patrolScene();g.update(.05);assert(g.car.windup>.7);assert.equal(g.car.ram,0);assert.equal(g.van.health,100);
  for(let i=0;i<30;i++)g.update(.05);assert.equal(g.van.health,88);assert(g.car.contactCooldown>3);
  for(let i=0;i<10;i++)g.update(.05);assert.equal(g.van.health,88);assert(Math.hypot(g.car.x-g.player.x,g.car.z-g.player.z)>2.5);
});
check('steering across the warned charge can avoid its locked target',()=>{
  const g=patrolScene();g.update(.05);const locked={...g.car.ramTarget};g.input.x=1;
  for(let i=0;i<20;i++)g.update(.05);g.input.x=0;g.input.brake=true;for(let i=0;i<20;i++)g.update(.05);assert.deepEqual(g.car.ramTarget,locked);assert.equal(g.car.contactCooldown,0);assert.equal(g.van.health,100);
});
check('attacks reserve one dodge and release recovers stamina',()=>{
  const g=new City();g.start();g.player.stamina=26;assert(g.attack());assert.equal(g.player.stamina,18);g.player.attackCd=0;assert(!g.attack());assert(g.dash());g.player.attack=0;g.input.attack=false;g.enemies.forEach(e=>e.hp=0);for(let i=0;i<20;i++)g.update(.05);assert(g.player.stamina>24);
});
check('first-cycle balanced encounters remain one committed attack after an earned job',()=>{
  const g=new City();g.start();g.network.total=1;g.accept('hold');g.enemies.forEach((e,i)=>Object.assign(e,{hp:i<3?3:0,role:'rush',x:g.player.x+2,z:g.player.z,cooldown:0,stun:0,windup:0,lunge:0}));
  g.update(.05);assert.equal(g.enemies.filter(e=>e.windup>0||e.lunge>0).length,1);
});
check('lost pursuit stands down and quiet reboarding does not restart it',()=>{
  const g=patrolScene();g.record=true;g.blockActivated=true;g.car.x=g.player.x+40;g.car.z=g.player.z+40;g.heat=.4;g.hidden=9;
  g.update(.05);assert.equal(g.car.active,false);g.van.occupied=false;g.interact();assert(g.van.occupied);assert.equal(g.car.active,false);assert(g.heat<.7);
});
check('strike contact waits for authored time and resolves once',()=>{
  const g=new City();g.start();g.accept('witness');g.props=[];g.gate.hp=0;g.enemies.forEach(e=>e.hp=0);
  const e=g.enemies[0];Object.assign(e,{hp:3,role:'rush',x:g.player.x,z:g.player.z+1,cooldown:10});g.input.aimX=0;g.input.aimZ=1;
  g.attack();assert.equal(e.hp,3);g.update(.05);g.update(.05);assert.equal(e.hp,3);g.update(.05);assert.equal(e.hp,3);g.update(.05);assert.equal(e.hp,2);
  for(let i=0;i<5;i++)g.update(.05);assert.equal(e.hp,2);
});
check('a target that leaves the locked swing range is missed',()=>{
  const g=new City();g.start();g.props=[];g.gate.hp=0;g.enemies.forEach(e=>e.hp=0);const e=g.enemies[0];
  Object.assign(e,{hp:3,x:g.player.x,z:g.player.z+1,role:'rush',cooldown:10});g.input.aimZ=1;g.attack();e.z+=10;
  for(let i=0;i<5;i++)g.update(.05);assert.equal(e.hp,3);assert(g.player.contactSerial>0);assert.equal(g.player.contactHit,false);
});
check('authored props block movement and tall screens block sight',()=>{
  const g=new City();g.start();g.accept('witness');const o=g.props.find(o=>o.kind==='screen');assert(!g.valid(o.x,o.z));assert(!g.line({x:o.x-3,z:o.z},{x:o.x+3,z:o.z}));
  const b=g.props.find(o=>o.id==='cordon-right');assert(!g.valid(b.x,b.z));assert(g.line({x:b.x,z:b.z-2},{x:b.x,z:b.z+2}));
});
check('vault moves through only the selected low furniture with a valid landing',()=>{
  const g=new City();g.start();g.accept('witness');g.enemies.forEach(e=>e.hp=0);const b=g.props.find(o=>o.id==='cordon-right');Object.assign(g.player,{x:b.x,z:b.z-1.15});
  assert(g.vault(b));g.update(.05);assert(g.player.height>0);assert.equal(g.player.traversal.kind,'Vault');
  for(let i=0;i<15;i++)g.update(.05);assert.equal(g.player.traversal,null);assert.equal(g.player.height,0);assert(g.player.z>b.z);assert(g.valid(g.player.x,g.player.z));
});
check('screen changes its physical and sight position, checkpoint retains it',()=>{
  const g=new City();g.start();g.accept('witness');g.enemies.forEach(e=>e.hp=0);const o=g.props.find(o=>o.kind==='screen');const start={x:o.x,z:o.z};
  Object.assign(g.player,{x:o.x-1.2,z:o.z,yaw:Math.PI/2});assert.equal(g.nearby().id,'screen');g.interact();assert(g.noise);for(let i=0;i<20;i++)g.update(.05);
  assert(Math.hypot(o.x-start.x,o.z-start.z)>3);g.saveCheckpoint();g.mode='caught';g.retry();assert.equal(g.props.find(p=>p.id===o.id).z,o.z);
});
check('guard holds its authored home instead of pursuing to an unrelated street',()=>{
  const g=new City();g.start();g.accept('witness');const e=g.enemies[0];Object.assign(g.player,{x:e.home.x+15,z:e.home.z});const before={x:e.x,z:e.z};g.update(.05);assert.equal(e.state,'hold');assert.equal(e.x,before.x);assert.equal(e.z,before.z);
});
check('companion braces near a committed attack then resumes following',()=>{
  const g=new City();g.start();g.accept('witness');g.props=[];g.gate.hp=0;g.enemies.forEach(e=>e.hp=0);g.friend.rescued=true;
  Object.assign(g.friend,{x:g.player.x+3,z:g.player.z});const e=g.enemies[0];Object.assign(e,{hp:3,x:g.friend.x+1,z:g.friend.z,windup:.6,cooldown:10});g.companion(g.friend,g.player,.05,6.5);assert.equal(g.friend.state,'shelter');
  e.hp=0;for(let i=0;i<25;i++)g.companion(g.friend,g.player,.05,6.5);assert(['follow','wait'].includes(g.friend.state));
});
check('new encounter does not place its table through the parked van',()=>{
  const g=new City();g.start();const p=g.place('gate');Object.assign(g.van,{x:p.x+2,z:p.z+2,occupied:true});Object.assign(g.player,g.van);
  g.network.completed=['witness','hold','signal'];assert(g.accept('charter'));const o=g.props.find(o=>o.id==='dispatch-table');
  assert(Math.hypot(o.x-g.van.x,o.z-g.van.z)>=2);assert(g.valid(g.van.x,g.van.z,1.1));
});
check('each gathering stage has authored guard homes near its functional space',()=>{
  const g=new City();g.start();g.accept('hold');for(const wave of[1,2]){g.wave=wave;g.spawn(g.mission.zones[wave],3);const e=g.enemies[0],q=g.encounter.stages[wave][0];assert(Math.hypot(e.home.x-q.x,e.home.z-q.z)<5.1);}
});
check('nearby aim assist targets the blocking cordon, not an occluded guard',()=>{
  const g=new City();g.start();g.accept('witness');g.enemies.forEach(e=>e.hp=0);Object.assign(g.player,{x:g.gate.x,z:g.gate.z-1});
  Object.assign(g.enemies[0],{hp:4,x:g.gate.x-.5,z:g.gate.z+1,role:'guard'});assert.equal(g.assistedTarget(),g.gate);
  g.gate.hp=0;assert.equal(g.assistedTarget(),g.enemies[0]);
});
console.log(JSON.stringify({passed:checks.length,checks},null,2));
fs.mkdirSync('qa/v16',{recursive:true});fs.writeFileSync('qa/v16/unit-results.json',JSON.stringify({passed:checks.length,checks},null,2));
