import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {human as legacyHuman,loadHuman,poseHuman as legacyPose} from './visuals.js?v=0.6.1';

let male,female;
export async function loadPeople(asset){
  const loader=new GLTFLoader();
  const results=await Promise.all([loader.loadAsync(asset('male-animated.glb')),loader.loadAsync(asset('female-animated.glb')),loadHuman(asset('courier-clothed.glb'))]);
  [male,female]=results;
}
export function human(color,police=false,options={}){
  if(police)return legacyHuman(color,true,options);
  const source=options.female?female:male;
  const model=clone(source.scene),group=new THREE.Group();
  group.add(model);model.rotation.y=Math.PI;
  model.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
    const fix=m=>{m=m.clone();m.color.set('#ffffff');m.roughness=.83;m.metalness=0;
      if(m.name.includes('opacity')){m.transparent=false;m.alphaTest=.4;m.depthWrite=true;m.side=THREE.DoubleSide;}
      return m;};
    o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material);
  });
  const mixer=new THREE.AnimationMixer(model),actions={};
  for(const clip of source.animations)actions[clip.name]=mixer.clipAction(clip).play().setEffectiveWeight(clip.name==='Idle'?1:0);
  const p={group,model,mixer,actions,rocket:true,rigged:true,lastTime:null,blend:{Idle:1,Walk:0,Run:0}};
  poseHuman(p,0,0);return p;
}
export function poseHuman(p,t,running=0,gesture=0){
  if(!p.rocket)return legacyPose(p,t,running,gesture);
  const drive=typeof running==='number'?running:running?1:0;
  const divisor=p.poseTimeDivisor||(drive>.85?10.5:drive>.1?7.5:.75);
  const dt=p.lastTime===null?.016:Math.min(.1,Math.max(.005,Math.abs(t-p.lastTime)/divisor));p.lastTime=t;
  const speed=p.worldSpeed??(drive>.85?4.6:drive>.1?1.8:0);
  const target=drive>.1?(speed>2.5?'Run':'Walk'):'Idle';
  for(const name of ['Idle','Walk','Run']){
    p.blend[name]+=(Number(name===target)-p.blend[name])*Math.min(1,dt*8);
    if(p.actions[name]){p.actions[name].enabled=p.blend[name]>.001||name===target;p.actions[name].setEffectiveWeight(p.blend[name]);}
  }
  p.actions.Walk?.setEffectiveTimeScale(Math.max(.25,speed/1.012));
  p.actions.Run?.setEffectiveTimeScale(Math.max(.4,speed/2.88));
  p.mixer.update(dt);
}
