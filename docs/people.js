import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {human as legacyHuman,loadHuman,poseHuman as legacyPose} from './visuals.js?v=0.6.1';
import {installMotion,clearMotion,poseMotion,blendReturn} from './contact-motion.js?v=0.17.2';
export {poseMotion};

let male,female,maleDelhi,femaleDelhi,officer;
const wardrobe=new Map(),knitColors=[[113,137,124],[132,113,99],[100,118,141]];
function knitTexture(source,variant){
  const key=source.uuid+':'+variant;if(wardrobe.has(key))return wardrobe.get(key);
  try{
    const c=document.createElement('canvas');c.width=source.image.width;c.height=source.image.height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source.image,0,0);
    const pixels=ctx.getImageData(0,0,c.width,c.height),rgb=knitColors[variant];
    for(let i=0;i<pixels.data.length;i+=4){
      const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
      if(r>105&&g>100&&b>85&&(hi-lo)/Math.max(1,hi)<.25){
        const light=(r+g+b)/3/180;
        for(let j=0;j<3;j++)pixels.data[i+j]=Math.min(255,rgb[j]*light);
      }
    }
    ctx.putImageData(pixels,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.flipY=source.flipY;t.wrapS=source.wrapS;t.wrapT=source.wrapT;t.anisotropy=source.anisotropy;wardrobe.set(key,t);return t;
  }catch{return source;}
}
export async function loadPeople(asset){
  const loader=new GLTFLoader();
  const results=await Promise.all([loader.loadAsync(asset('male-animated.glb')),loader.loadAsync(asset('female-animated.glb')),loader.loadAsync(asset('male-delhi-animated.glb')),loader.loadAsync(asset('female-delhi-animated.glb'))]);
  [male,female,maleDelhi,femaleDelhi]=results;
  officer=await loader.loadAsync(asset('police-review.glb'));
}
export function human(color,police=false,options={}){
  const source=police?officer:options.localWardrobe?(options.female?femaleDelhi:maleDelhi):(options.female?female:male);
  const model=clone(source.scene),group=new THREE.Group();
  group.add(model);model.rotation.y=Math.PI;
  model.traverse(o=>{
    if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;
    const fix=m=>{m=m.clone();m.color.set('#ffffff');m.roughness=.83;m.metalness=0;
      if(!police&&m.name==='m003_body'&&m.map&&color.toLowerCase()!=='#a86137')m.map=knitTexture(m.map,parseInt(color.slice(-3),16)%3);
      if(options.localWardrobe&&m.name.includes('body'))m.color.set(color);
      if(m.name==='Short dark hair')m.color.set('#261b15');
      if(source===female&&m.name==='f004_opacity')m.color.set('#3a2b23');
      if(m.name.includes('opacity')){m.transparent=false;m.alphaTest=.4;m.depthWrite=true;m.side=THREE.DoubleSide;}
      return m;};
    o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material);
  });
  const mixer=new THREE.AnimationMixer(model),actions={};
  for(const clip of source.animations)actions[clip.name]=mixer.clipAction(clip).play().setEffectiveWeight(clip.name==='Idle'?1:0);
  const p={group,model,mixer,actions,rocket:true,rigged:true,wardrobe:options.localWardrobe?'kurta / long tunic':'contemporary casual',lastTime:null,blend:{Idle:1,Walk:0,Run:0}};
  installMotion(p);poseHuman(p,0,0);return p;
}
export function poseHuman(p,t,running=0,gesture=0){
  if(!p.rocket)return legacyPose(p,t,running,gesture);
  clearMotion(p);
  const drive=typeof running==='number'?running:running?1:0;
  const divisor=p.poseTimeDivisor||(drive>.85?10.5:drive>.1?7.5:.75);
  const dt=p.lastTime===null?.016:Math.min(.1,Math.max(0,Math.abs(t-p.lastTime)/divisor));p.lastTime=t;
  const speed=p.worldSpeed??(drive>.85?4.6:drive>.1?1.8:0);
  const target=drive>.1?(speed>2.5?'Run':'Walk'):'Idle';
  for(const name of ['Idle','Walk','Run']){
    p.blend[name]+=(Number(name===target)-p.blend[name])*Math.min(1,dt*8);
    if(p.actions[name]){p.actions[name].enabled=p.blend[name]>.001||name===target;p.actions[name].setEffectiveWeight(p.blend[name]);}
  }
  p.actions.Walk?.setEffectiveTimeScale(Math.max(.25,speed/1.012));
  p.actions.Run?.setEffectiveTimeScale(Math.max(.4,speed/2.88));
  p.mixer.update(dt);
  blendReturn(p,dt);
}
export function resetHuman(p){
  if(!p?.rocket)return;
  clearMotion(p);p.returnPose=null;p.motionLast=false;
  p.lastTime=null;p.lastPosition=null;p.worldSpeed=0;p.blend={Idle:1,Walk:0,Run:0};
  for(const [name,a]of Object.entries(p.actions)){a.reset().play();a.enabled=name==='Idle';a.setEffectiveWeight(name==='Idle'?1:0);a.setEffectiveTimeScale(1);}
  p.mixer.update(0);
}
