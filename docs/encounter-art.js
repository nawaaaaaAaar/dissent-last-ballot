import * as THREE from 'three';
import {box,cylinder,sign,materials as M} from './world-props.js';

export function encounterArt(scene){
  const group=new THREE.Group();scene.add(group);
  const cloth=new THREE.MeshStandardMaterial({color:'#35665b',roughness:.95,side:THREE.DoubleSide});
  const wood=new THREE.MeshStandardMaterial({color:'#8c6240',roughness:.92});
  const metal=new THREE.MeshStandardMaterial({color:'#65706a',roughness:.62,metalness:.25});
  const models=new Map();let key='';
  function clear(){
    group.traverse(o=>{if(o.material?.map){o.material.map.dispose();o.material.dispose();}});
    group.clear();models.clear();
  }
  function create(o){
    const g=new THREE.Group();group.add(g);
    if(o.kind==='screen'){
      box(g,cloth,0,1,0,o.w,1.3,.035);
      for(const x of [-o.w/2,o.w/2]){
        cylinder(g,metal,x,.85,0,.035,1.7);
        box(g,metal,x,.12,0,.2,.2,.8);
        for(const z of[-.26,.26])cylinder(g,M.dark,x,.12,z,.10,.08,Math.PI/2);
      }
      sign(g,'MOVE · BREAK SIGHT',0,1.05,.025,o.w*.84,.38,'#35665b','#f4dfb8');
    }else{
      const top=box(g,wood,0,.74,0,o.w,.12,o.d);
      for(const x of[-o.w*.4,o.w*.4])for(const z of[-o.d*.35,o.d*.35])box(g,metal,x,.37,z,.07,.7,.07);
      if(o.kind==='bench'){
        for(const x of[-.5,0,.5])box(g,wood,x,.81,0,.02,.025,o.d*.95);
        sign(g,'VAULT',0,.81,0,1,.26,'#b6936c','#2a423b').rotation.x=-Math.PI/2;
      }else{
        box(g,M.cream,.3,.84,0,.45,.035,.32);box(g,M.white,-.4,.85,.1,.34,.08,.25);
        cylinder(g,cloth,.8,.87,-.05,.10,.17);
      }
      top.castShadow=true;
    }
    g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
    models.set(o.id,g);
  }
  function update(game){
    const next=game.mission?game.serial+':'+game.mission.id:'';
    if(next!==key){clear();key=next;
      for(const o of game.props)create(o);
      if(game.mission){
        const p=game.mission.source;
        // A compact authored social focal point, not another generic map icon.
        const rug=box(group,cloth,p.x,.035,p.z+1.2,3,.04,2);
        rug.receiveShadow=true;
        for(const side of[-1,1]){
          const g=new THREE.Group();g.position.set(p.x+side*7,0,p.z+1);group.add(g);
          cylinder(g,M.sand,0,.25,0,.28,.5);cylinder(g,cloth,0,.53,0,.3,.06);
          box(g,M.wood,0,1.7,0,.04,2.6,.04);
          sign(g,game.mission.type==='rescue'?'THE ACCOUNT':'COMMUNITY FORECOURT',0,2.25,0,2.8,.55,'#294e43','#f0deba');
        }
      }
    }
    for(const o of game.props){const g=models.get(o.id);g.position.set(o.x,0,o.z);g.rotation.y=o.yaw;}
    group.visible=!!game.mission;
  }
  return {update};
}
