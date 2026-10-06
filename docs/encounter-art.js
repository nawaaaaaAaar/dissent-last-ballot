import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {box,cylinder,sign,materials as M} from './world-props.js';

export function encounterArt(scene){
  const group=new THREE.Group();scene.add(group);
  const cloth=new THREE.MeshStandardMaterial({color:'#35665b',roughness:.95,side:THREE.DoubleSide});
  const wood=new THREE.MeshStandardMaterial({color:'#8c6240',roughness:.92});
  const metal=new THREE.MeshStandardMaterial({color:'#65706a',roughness:.62,metalness:.25});
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#b0875e';ctx.fillRect(0,0,256,128);
  for(let y=0;y<128;y+=2){ctx.strokeStyle=y%6?'#a17b55':'#775535';ctx.globalAlpha=.25;ctx.beginPath();for(let x=0;x<256;x+=8){const yy=y+Math.sin(x*.06+y)*1.8;x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}
  ctx.globalAlpha=1;const grain=new THREE.CanvasTexture(canvas);grain.colorSpace=THREE.SRGBColorSpace;wood.map=grain;
  const models=new Map();let key='';
  function rounded(g,m,x,y,z,w,h,d){const p=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,.025),m);p.position.set(x,y,z);g.add(p);return p;}
  function clear(){
    group.traverse(o=>{if(o.material?.map&&o.material!==wood){o.material.map.dispose();o.material.dispose();}});
    group.clear();models.clear();
  }
  function create(o){
    const g=new THREE.Group();group.add(g);
    if(o.kind==='screen'){
      const fabric=new THREE.PlaneGeometry(o.w,1.3,12,8),v=fabric.attributes.position;
      for(let i=0;i<v.count;i++)v.setZ(i,.05*Math.sin(v.getX(i)*8)*Math.sin((v.getY(i)+.65)/1.3*Math.PI));
      fabric.computeVertexNormals();const banner=new THREE.Mesh(fabric,cloth);banner.position.y=1;g.add(banner);
      cylinder(g,metal,0,1.68,0,.028,o.w,Math.PI/2);
      for(const x of [-o.w/2,o.w/2]){
        cylinder(g,metal,x,.85,0,.035,1.7);
        box(g,metal,x,.12,0,.2,.2,.8);
        for(const z of[-.26,.26])cylinder(g,M.dark,x,.12,z,.10,.08,Math.PI/2);
      }
      sign(g,'KEEP THE SPACE OPEN',0,1.05,.065,o.w*.84,.32,'#35665b','#f4dfb8');
      for(const x of[-o.w*.45,o.w*.45])box(g,M.cream,x,1.52,.04,.035,.24,.02);
    }else{
      const h=o.height,top=rounded(g,wood,0,h-.06,0,o.w,.12,o.d);
      for(const x of[-o.w*.4,o.w*.4])for(const z of[-o.d*.35,o.d*.35])box(g,metal,x,h/2,z,.06,h-.08,.06);
      box(g,metal,0,.17,0,o.w*.8,.045,.045);
      if(o.kind==='bench'){
        top.visible=false;
        for(let i=0;i<4;i++)rounded(g,wood,0,h-.045,-o.d/2+(i+.5)*o.d/4,o.w,.09,o.d/4-.025);
        for(const x of[-o.w*.38,o.w*.38])box(g,metal,x,h-.06,0,.045,.06,o.d*.9);
      }else{
        rounded(g,M.cream,.3,h+.018,0,.45,.035,.32);rounded(g,M.white,-.4,h+.04,.1,.34,.08,.25);
        cylinder(g,cloth,.8,h+.09,-.05,.10,.17);
        box(g,cloth,-o.w*.25,h+.012,0,o.w*.35,.015,o.d*.9);
        box(g,M.white,-o.w*.25,h-.16,o.d/2+.015,o.w*.35,.35,.025);
        box(g,M.red,-o.w*.25,h-.16,o.d/2+.031,.10,.24,.012);box(g,M.red,-o.w*.25,h-.16,o.d/2+.032,.24,.10,.012);
        rounded(g,M.dark,-.65,.15,-.35,.5,.3,.35);
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
