import * as THREE from 'three';

// Original joint-space keyframes, sampled by the SAME normalized phase as
// gameplay contact. No baked root motion: traversal root is collision checked.
export {STRIKES} from './encounters.js?v=0.16.4';
const joint={
  R:'Bip01 R UpperArm',L:'Bip01 L UpperArm',RE:'Bip01 R Forearm',LE:'Bip01 L Forearm',
  S:'Bip01 Spine2',P:'Bip01 Pelvis',RT:'Bip01 R Thigh',LT:'Bip01 L Thigh',
  RC:'Bip01 R Calf',LC:'Bip01 L Calf',H:'Bip01 Head',
};
// Each tuple: normalized time and authored Euler offsets in joint local space.
const frames={
  Jab:[[0,{R:[-.25,0,.2],RE:[-.8,0,0],L:[-.35,0,-.3]}],[.27,{R:[.3,0,.45],RE:[-1.2,0,0],S:[0,0,-.18]}],[.405,{R:[-1.5,0,.2],RE:[-.12,0,0],S:[0,0,.27]}],[.62,{R:[-.7,0,.25],RE:[-.7,0,0]}],[1,{}]],
  Cross:[[0,{L:[-.25,0,-.2],LE:[-.8,0,0]}],[.28,{L:[.3,0,-.6],LE:[-1.2,0,0],S:[0,0,.25]}],[.435,{L:[-1.5,0,-.25],LE:[-.1,0,0],S:[0,0,-.3]}],[.7,{L:[-.65,0,-.2],LE:[-.6,0,0]}],[1,{}]],
  Push:[[0,{R:[-.5,0,.4],L:[-.5,0,-.4],RE:[-1.1,0,0],LE:[-1.1,0,0]}],[.3,{S:[.15,0,0],R:[-.4,0,.5],L:[-.4,0,-.5],RT:[.25,0,0]}],[.4375,{S:[-.17,0,0],R:[-1.4,0,.18],L:[-1.4,0,-.18],RE:[-.1,0,0],LE:[-.1,0,0]}],[.7,{S:[-.1,0,0],R:[-.9,0,.2],L:[-.9,0,-.2]}],[1,{}]],
  Dodge:[[0,{}],[.2,{P:[.12,0,.16],RT:[-.5,0,0],LT:[.5,0,0],RC:[.6,0,0],L:[-.6,0,-.2]}],[.6,{P:[.25,0,.16],RT:[.4,0,0],LT:[-.6,0,0],LC:[.8,0,0],R:[-.6,0,.2]}],[1,{}]],
  Vault:[[0,{}],[.18,{S:[.4,0,0],R:[-1.1,0,.15],L:[-1.1,0,-.15],RT:[-.6,0,0],LT:[-.3,0,0]}],[.5,{S:[.3,0,.15],R:[-1.35,0,.3],L:[-1.0,0,-.2],RT:[-1.1,0,0],RC:[1.2,0,0],LT:[-.8,0,0],LC:[1.2,0,0]}],[.8,{RT:[-.4,0,0],LT:[.4,0,0],LC:[.3,0,0],S:[.2,0,0]}],[1,{}]],
  Brace:[[0,{R:[-.6,0,.4],L:[-.6,0,-.4],RE:[-1,0,0],LE:[-1,0,0]}],[1,{R:[-.6,0,.4],L:[-.6,0,-.4],RE:[-1,0,0],LE:[-1,0,0]}]],
  EnemyStrike:[[0,{R:[-.5,0,.3],RE:[-1,0,0]}],[.30,{R:[.4,0,.5],RE:[-1.3,0,0],S:[0,0,-.2]}],[.55,{R:[-1.35,0,.1],RE:[-.1,0,0],S:[0,0,.2]}],[.75,{R:[-.7,0,.2],RE:[-.4,0,0]}],[1,{}]],
  Hurt:[[0,{}],[.2,{S:[-.32,0,.2],H:[-.16,0,0],R:[-.4,0,.6],L:[-.4,0,-.6]}],[.5,{S:[-.2,0,.1],RT:[.2,0,0]}],[1,{}]],
  Help:[[0,{}],[.25,{S:[.25,0,0],R:[-1.2,0,.1],L:[-.8,0,-.2]}],[.75,{S:[.25,0,0],R:[-1.2,0,.1],L:[-.8,0,-.2]}],[1,{}]],
};
export function installMotion(person){
  person.motionActions={};
  person.actions.Idle.time=0;person.mixer.update(0);person.group.updateMatrixWorld(true);
  const modelRotation=person.model.getWorldQuaternion(new THREE.Quaternion());
  for(const [name,keys] of Object.entries(frames)){
    const tracks=[];
    for(const [short,boneName]of Object.entries(joint)){
      const bone=person.model.getObjectByName(boneName)||person.model.getObjectByName(boneName.replaceAll(' ','_'));if(!bone)continue;
      const values=[],base=bone.quaternion.clone(),worldRotation=bone.getWorldQuaternion(new THREE.Quaternion());
      for(const [,pose]of keys){
        const e=pose[short]||[0,0,0];
        const semantic=new THREE.Quaternion().setFromEuler(new THREE.Euler(...e));
        const worldDelta=modelRotation.clone().multiply(semantic).multiply(modelRotation.clone().invert());
        const localDelta=worldRotation.clone().invert().multiply(worldDelta).multiply(worldRotation);
        const q=base.clone().multiply(localDelta);
        values.push(q.x,q.y,q.z,q.w);
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',keys.map(k=>k[0]),values));
    }
    if(!tracks.length)throw new Error('Contact motion did not bind to the human rig.');
    const a=person.mixer.clipAction(new THREE.AnimationClip(name,1,tracks));a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.paused=true;person.motionActions[name]=a;
  }
}
export function clearMotion(person){
  if(!person.motionActions)return;
  for(const a of Object.values(person.motionActions)){a.enabled=false;a.setEffectiveWeight(0);}
}
export function poseMotion(person,name,phase){
  const a=person.motionActions?.[name];if(!a)return;
  for(const b of Object.values(person.actions))b.setEffectiveWeight(0);
  a.enabled=true;a.paused=true;a.play();a.time=THREE.MathUtils.clamp(phase,0,.9999);a.setEffectiveWeight(1);person.mixer.update(0);
}
