import assert from 'node:assert/strict';
import {Line} from './docs/line-rules.js';
const out=[];function test(name,fn){fn();out.push(name);}
const fresh=()=>{const g=new Line();g.start();return g;},tick=(g,t)=>{for(let i=0;i<t*60;i++)g.update(1/60);};
test('Start contains one encounter and no campaign rewards',()=>{const g=fresh();assert.equal(g.phase,'reach');assert.equal(g.state().network,undefined);assert.equal(g.enemies.filter(e=>e.active).length,4);});
test('Pause freezes ordinary rules time',()=>{const g=fresh();g.mode='paused';tick(g,1);assert.equal(g.time,0);});
test('Held rescue requires proximity and changes the story beat',()=>{const g=fresh();g.p.x=-3.8;g.p.z=-8.8;g.enemies.forEach(e=>e.hp=0);g.input.action=true;tick(g,.8);assert(g.friend.rescued);assert.equal(g.phase,'escape');});
test('Boarding cannot abandon the friend',()=>{const g=fresh();g.friend.rescued=true;g.p.x=2.5;g.p.z=-31;g.action();assert(!g.van.occupied);g.friend.x=2.5;g.friend.z=-29;g.action();assert(g.van.occupied&&g.friend.aboard);});
test('Attack resolves once at contact and not from distant range',()=>{const g=fresh();g.enemies.forEach(e=>e.hp=0);Object.assign(g.enemies[0],{x:0,z:14,hp:3});g.strike();tick(g,.6);assert.equal(g.enemies[0].hp,3);assert.equal(g.contactSerial,1);});
test('Short combo ends in a shield-breaking push',()=>{const g=fresh();g.enemies.forEach(e=>e.hp=0);const e=g.enemies[2];Object.assign(e,{x:0,z:15.8,hp:4,yaw:0,stun:5});for(let i=0;i<3;i++){g.strike();tick(g,.66);if(i<2)assert.equal(e.hp,4);}assert.equal(e.hp,3);assert(e.broken>0);});
test('Gate contacts create a physically open middle route',()=>{const g=fresh();g.enemies.forEach(e=>e.hp=0);g.p.x=0;g.p.z=-16.8;g.p.yaw=Math.PI;for(let i=0;i<3;i++){g.strike();tick(g,.72);}assert.equal(g.gateHp,0);assert(!g.blocked(0,-18));});
test('Vault crosses only the authored side rail',()=>{const g=fresh();g.enemies.forEach(e=>e.hp=0);g.p.x=-5.6;g.p.z=-16.9;assert.equal(g.context().id,'vault');g.action();tick(g,1);assert.equal(g.p.traversal,null);assert.equal(g.p.height,0);assert(g.p.z<-18);});
test('Screen movement changes collision',()=>{const g=fresh();g.p.x=-2.7;g.p.z=-1.7;assert(g.blocked(-2.7,-3));g.action();assert.equal(g.cartShift,2.6);assert(!g.blocked(-2.7,-3));});
test('Aid cannot heal repeatedly',()=>{const g=fresh();g.p.x=-6;g.p.z=8;g.p.hp=2;g.action();assert.equal(g.p.hp,4);g.action();assert.equal(g.p.hp,4);});
test('Damage has an invulnerability recovery and two attacker cap',()=>{const g=fresh();for(let i=0;i<4;i++)Object.assign(g.enemies[i],{x:i%2?1:-1,z:17,cool:0,hp:3});tick(g,.1);assert(g.enemies.filter(e=>e.wind>0||e.attack>0).length<=2);});
test('Driving failure restarts only the escape checkpoint',()=>{const g=fresh();g.checkpoint='drive';g.friend.rescued=g.friend.aboard=true;g.mode='failed';g.retry();assert.equal(g.van.hp,100);assert.equal(g.phase,'reach');assert(g.van.occupied);assert.equal(g.van.z,-31);});
test('Vehicle collision costs condition, braking reduces speed',()=>{const g=fresh();g.friend.rescued=true;g.friend.aboard=true;g.van.occupied=true;g.phase='drive';g.van.x=2;g.van.z=-45;g.input.z=-1;tick(g,2);assert(g.van.hp<100);g.input.brake=true;tick(g,1);assert(g.van.speed<.1);});
test('Shelter completes only the driving beat',()=>{const g=fresh();g.p.x=0;g.p.z=-69;tick(g,.1);assert.notEqual(g.mode,'won');g.van.occupied=true;g.van.x=-3;g.van.z=-69;tick(g,.1);assert.equal(g.mode,'won');});
console.log(JSON.stringify({passed:out.length,checks:out,scope:'Staged isolated rules; not ordinary-time play or enjoyment evidence'},null,2));
