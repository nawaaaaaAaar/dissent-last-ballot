import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

let source;
export async function loadHuman(url='./assets/courier-base.glb'){
  source=(await new GLTFLoader().loadAsync(url)).scene;
}
export function human(shirt='#b85a30',police=false,options={}){
  if(!source)return null;
  const group=new THREE.Group(),torso=new THREE.Group(),model=clone(source);
  group.add(torso);torso.add(model);model.rotation.y=Math.PI;model.scale.setScalar(1.1);
  const bones={},rest=new Map();
  model.traverse(n=>{if(n.isBone){bones[n.name]=n;rest.set(n,n.quaternion.clone());}});
  const cloth=new THREE.Color(shirt),skin=new THREE.Color(options.skin||'#986748'),trousers=new THREE.Color(police?'#887557':'#283544');
  model.traverse(n=>{
    if(!n.isMesh)return;
    n.castShadow=true;n.receiveShadow=true;
    n.geometry=n.geometry.clone();
    if(/Shirt|Collar|Placket|Trousers|Button/.test(n.name)){
      const textile=/Trousers/.test(n.name)?trousers:/Button/.test(n.name)?new THREE.Color('#343331'):cloth;
      n.material=new THREE.MeshStandardMaterial({color:textile,roughness:.93,metalness:0});
      return;
    }
    const pos=n.geometry.attributes.position,norm=n.geometry.attributes.normal,idx=n.geometry.attributes.skinIndex,weights=n.geometry.attributes.skinWeight;
    const colors=[],covered=[];
    for(let i=0;i<pos.count;i++){
      let dominant=0;for(let j=1;j<4;j++)if(weights.getComponent(i,j)>weights.getComponent(i,dominant))dominant=j;
      const name=n.skeleton.bones[idx.getComponent(i,dominant)]?.name||'';
      let c=skin;
      const body=/pelvis|spine|clavicle|upperarm|lowerarm/.test(name),leg=/thigh|calf|foot|ball/.test(name);
      covered.push(/pelvis|spine|clavicle|upperarm|lowerarm|thigh|calf/.test(name));
      if(body)c=cloth;if(leg)c=trousers;
      if(pos.getY(i)<.115)c=new THREE.Color('#171b20');
      if(n.name==='Eyes')c=new THREE.Color('#cec8bb');
      if(n.name==='Eyebrows')c=new THREE.Color('#241914');
      const v=c.clone().multiplyScalar(1+.035*Math.sin(i*17.9));
      colors.push(v.r,v.g,v.b);
      if(n.name==='SuperHero_Male'&&(body||leg)){
        const amount=body?.019:.014;
        pos.setXYZ(i,pos.getX(i)+norm.getX(i)*amount,pos.getY(i)+norm.getY(i)*amount,pos.getZ(i)+norm.getZ(i)*amount);
      }
    }
    n.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    // A clothed model must not render the underlying torso/limb surface through
    // the cloth shell. Keep exposed head, neck, hands and shoes at the cuffs.
    if(source.getObjectByName('Shirt')&&n.name==='SuperHero_Male'){
      const idx=n.geometry.index,visible=[];
      for(let i=0;i<(idx?idx.count:pos.count);i+=3){
        const a=idx?idx.getX(i):i,b=idx?idx.getX(i+1):i+1,c=idx?idx.getX(i+2):i+2;
        if(!(covered[a]&&covered[b]&&covered[c]))visible.push(a,b,c);
      }
      n.geometry.setIndex(visible);
    }
    n.geometry.computeVertexNormals();
    n.material=new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.84,metalness:0});
  });
  model.updateMatrixWorld(true);
  function accessory(geo,material,position,scale,bone=bones.Head){
    const mesh=new THREE.Mesh(geo,material);mesh.position.copy(bone.worldToLocal(new THREE.Vector3(...position).multiplyScalar(1.1).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI)));
    mesh.scale.set(...scale);mesh.castShadow=true;bone.add(mesh);return mesh;
  }
  // Original hair, eye accents, cap and backpack. No real person's likeness.
  const dark=new THREE.MeshStandardMaterial({color:'#211b17',roughness:.91});
  const hair=accessory(new THREE.SphereGeometry(1,18,12),dark,[0,1.77,0],[.115,.08,.115]);
  if(options.detail!==false)for(let s of [-1,1])accessory(new THREE.SphereGeometry(1,12,8),dark,[s*.031,1.7,.086],[.011,.012,.005]);
  if(police){
    hair.visible=false;
    accessory(new THREE.CylinderGeometry(.115,.12,.065,20),new THREE.MeshStandardMaterial({color:'#675f44',roughness:.8}),[0,1.82,0],[1,1,1]);
  }
  const bag=new THREE.Mesh(new RoundedBoxGeometry(.36,.49,.18,3,.04),new THREE.MeshStandardMaterial({color:'#1e3339',roughness:.9}));
  if(!police&&options.bag!==false){
    const spine=bones.spine_03;bag.position.copy(spine.worldToLocal(new THREE.Vector3(0,1.4,.20)));spine.add(bag);bag.castShadow=true;
    const pocket=new THREE.Mesh(new RoundedBoxGeometry(.28,.20,.035,2,.014),new THREE.MeshStandardMaterial({color:'#314951',roughness:.94}));
    pocket.position.set(0,-.1,.1);bag.add(pocket);
    for(let s of [-1,1]){
      const strap=new THREE.Mesh(new THREE.BoxGeometry(.028,.43,.025),dark);strap.position.set(s*.10,.03,-.10);bag.add(strap);
    }
  }
  const p={group,torso,bag,bones,rest,model,rigged:true,arms:[bones.upperarm_l,bones.upperarm_r],forearms:[bones.lowerarm_l,bones.lowerarm_r]};
  poseHuman(p,0,false);return p;
}
export function poseHuman(p,t,running=true,gesture=0){
  for(const [bone,q]of p.rest)bone.quaternion.copy(q);
  p.model.updateMatrixWorld(true);
  const mq=p.model.getWorldQuaternion(new THREE.Quaternion());
  const axes={x:new THREE.Vector3(1,0,0).applyQuaternion(mq),z:new THREE.Vector3(0,0,1).applyQuaternion(mq)};
  function rotate(name,axis,angle){
    const bone=p.bones[name];if(!bone)return;
    const a=axes[axis].clone();
    a.applyQuaternion(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert());
    bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(a,angle));
  }
  const drive=typeof running==='number'?running:running?1:0;
  const a=drive?.62*drive:.015;
  for(const [s,side]of [[1,'l'],[-1,'r']]){
    const phase=t+(s<0?Math.PI:0);
    rotate('thigh_'+side,'x',Math.sin(phase)*a);
    rotate('calf_'+side,'x',Math.max(0,-Math.sin(phase))*.85*drive);
    rotate('upperarm_'+side,'z',-s*1.34);
    rotate('upperarm_'+side,'x',-Math.sin(phase)*a*.8);
    rotate('lowerarm_'+side,'x',-.12-.6*drive);
  }
  if(gesture){
    rotate('upperarm_r','z',-.8*gesture);rotate('upperarm_r','x',-1.1*gesture);
    rotate('lowerarm_r','x',-.4*gesture);
  }
  p.torso.position.y=running?Math.abs(Math.sin(t))*.035:0;
}
