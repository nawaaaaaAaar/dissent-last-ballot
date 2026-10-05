import assert from 'node:assert/strict';
import {Breakout,WORLD} from './docs/breakout-rules.js';
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=1/60)g.update(1/60);};
const fresh=()=>{const g=new Breakout();g.start();return g;};
let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name);}
check('Four arcade strikes open the barrier; cooldown prevents repeated instant hits',()=>{
  const g=fresh();g.player.z=19;g.enemies.forEach(e=>e.hp=0);
  g.attack();g.attack();assert.equal(g.gate.hp,3);
  for(let i=0;i<3;i++){run(g,.5);g.attack();}
  assert.equal(g.gate.hp,0);assert(g.valid(0,17));assert.equal(g.score,150);
});
check('Aimed melee interrupts windup and needs three hits to disable one guard',()=>{
  const g=fresh(),e=g.enemies[0];g.enemies.slice(1).forEach(e=>e.hp=0);
  e.x=0;e.z=41;e.windup=.5;g.attack();assert.equal(e.hp,2);assert.equal(e.windup,0);assert(e.stun>0);
  for(let i=0;i<2;i++){run(g,.5);e.x=0;e.z=41;g.attack();}
  assert.equal(e.hp,0);assert.equal(g.score,80);
});
check('Dodge consumes stamina, has cooldown and grants its short invulnerability',()=>{
  const g=fresh();assert(g.dash());assert.equal(g.player.stamina,85);assert(!g.dash());
  g.hurt();assert.equal(g.player.health,6);run(g,.5);g.hurt();assert.equal(g.player.health,5);
});
check('Rescue is guarded and boarding requires the recording and reunited companion',()=>{
  const g=fresh();Object.assign(g.player,{x:2,z:7});Object.assign(g.enemies[0],{x:3,z:7});
  g.interact();assert(!g.friend.rescued);g.enemies.forEach(e=>e.hp=0);g.interact();assert(g.friend.rescued);
  Object.assign(g.player,WORLD.van);g.interact();assert(!g.van.occupied);g.record=true;g.interact();assert(!g.van.occupied);
  Object.assign(g.friend,WORLD.van);g.interact();assert(g.van.occupied&&g.friend.aboard&&g.car.active&&g.roadblock);
});
check('Building occlusion enables search and heat decay, not instant finish-marker wins',()=>{
  const g=fresh();g.enemies.forEach(e=>e.hp=0);g.heat=3;
  assert(!g.line({x:0,z:16},{x:34,z:16}));run(g,12);assert(g.heat<.7);assert.equal(g.phase,'clear');
  Object.assign(g.van,WORLD.safe,{occupied:true});g.friend.aboard=true;g.record=true;g.van.speed=5;assert(!g.readyWin());
  g.van.speed=0;assert(g.readyWin());g.heat=2;assert(!g.readyWin());
});
check('Vehicle acceleration and braking work; destruction restores the boarding checkpoint',()=>{
  const g=fresh();g.friend.rescued=true;g.record=true;Object.assign(g.player,WORLD.van);Object.assign(g.friend,WORLD.van);g.interact();
  g.enemies.forEach(e=>e.hp=0);g.car.active=false;g.input.x=1;g.input.z=0;run(g,1);assert(g.van.speed>10);
  g.input.brake=true;run(g,1);assert(g.van.speed<1);g.input.brake=false;run(g,.4);assert(g.van.speed>3);
  g.van.hurt=0;g.carHit(100);assert.equal(g.mode,'caught');g.retry();assert.equal(g.mode,'playing');assert(g.record&&g.friend.aboard&&g.van.occupied);assert.equal(g.van.health,100);
});
check('Navigation detours around live barricades and static buildings',()=>{
  const g=fresh();const route=g.route({x:0,z:20},{x:0,z:12});assert(route.length);assert(route.every(p=>g.valid(p.x,p.z,.4)));assert(route.some(p=>Math.abs(p.x)>5));
});
check('Cleared roadblock stays cleared after reboarding and checkpoint recovery',()=>{
  const g=fresh();g.friend.rescued=true;g.record=true;Object.assign(g.player,WORLD.van);Object.assign(g.friend,WORLD.van);g.interact();
  g.interact();Object.assign(g.player,{x:-34,z:-15});g.attack();assert(!g.roadblock);
  Object.assign(g.van,{x:-34,z:-12});Object.assign(g.player,{x:-34,z:-13});Object.assign(g.friend,{x:-33,z:-13});g.interact();assert(g.van.occupied);assert(!g.roadblock);assert.equal(g.checkpoint.x,-34);
  g.retry();assert(g.van.occupied&&!g.roadblock);assert.equal(g.van.x,-34);
});
console.log(JSON.stringify({suite:'Breakout isolated rules',checks,passed:true}));
