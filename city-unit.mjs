import assert from 'node:assert/strict';
import fs from 'node:fs';
import {installMap,PLACES,roadRoute,snap,WORLD} from './docs/city-data.js?v=0.14.1';
import {City} from './docs/city-rules.js';
installMap(JSON.parse(fs.readFileSync('docs/delhi-map.json')));
const checks=[];
function check(name,fn){fn();checks.push(name);}
check('OSM map and georeferenced landmark relationships',()=>{
  assert.equal(WORLD.roads.length,1269);assert.equal(WORLD.buildings.length,786);
  assert(PLACES[1].z<PLACES[0].z&&PLACES[0].z<PLACES[2].z);assert(PLACES[2].x>PLACES[0].x);
  for(const p of PLACES){const route=roadRoute(snap(PLACES[1]),snap(p));assert(route.length>1);assert.equal(route.at(-1).x,snap(p).x);}
});
check('exit and retry never teleport an unrescued witness',()=>{
  const g=new City();g.start();g.accept('witness');const old={x:g.friend.x,z:g.friend.z};
  g.interact();assert(g.van.occupied);g.interact();assert.equal(g.friend.x,old.x);assert.equal(g.friend.z,old.z);
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
console.log(JSON.stringify({passed:checks.length,checks},null,2));
fs.mkdirSync('qa/v14',{recursive:true});fs.writeFileSync('qa/v14/unit-results.json',JSON.stringify({passed:checks.length,checks},null,2));
