// Deliberately authored fictional street encounters on the existing Delhi map.
// These placements are gameplay, not a record of real protest infrastructure.
const prop=(id,kind,x,z,w,d,yaw=0)=>({id,kind,x,z,w,d,yaw,height:kind==='screen'?1.65:.76,shift:0});
export const STRIKES=[
  {clip:'Jab',duration:.42,contact:.17,cost:8},
  {clip:'Cross',duration:.46,contact:.20,cost:8},
  {clip:'Push',duration:.64,contact:.28,cost:10},
];
export function layout(m){
  if(!m)return {name:'',props:[]};
  const {x,z}=m.source;
  if(m.type==='rescue')return {
    name:'The witness cordon',hint:'Break the front line, vault the side benches, or move the banner screen to split sight.',
    props:[
      prop('cordon-left','bench',x-5,z-4,2.8,.72),
      prop('cordon-right','bench',x+5,z-4,2.8,.72),
      prop('witness-screen','screen',x-5,z-7,3.6,.7,Math.PI/2),
      prop('witness-desk','desk',x+3,z+2,2.1,.85),
    ],
    guards:[{x:x,z:z-1,role:'guard'},{x:x+6,z:z-5,role:'rush'},{x:x-5,z:z+3,role:'flank'}],
  };
  if(m.type==='rally')return {
    name:'The community forecourt',hint:'Use the screens to break sight. Vault the tables; keep the reading group away from committed attacks.',
    props:[
      prop('aid-screen','screen',x+4,z-2,3.7,.7,Math.PI/2),
      prop('aid-table','desk',x+8,z+2,2.8,.9),
      prop('reading-bench','bench',x-5,z+3,3.2,.7),
      prop('assembly-screen','screen',x-8,z+4,3.7,.7),
    ],
    guards:[{x:x+2,z:z-4,role:'guard'},{x:x-6,z:z,role:'rush'},{x:x+6,z:z+3,role:'flank'}],
    zones:[{x,z},{x:x+8,z:z-1},{x:x-4,z:z+6}],
  };
  return {name:'The dispatch desk',hint:'The desk breaks direct approaches. Copy during a recovery opening or use its screen.',
    props:[prop('dispatch-table','desk',x+2,z+2,2.8,.9),prop('dispatch-screen','screen',x-4,z+1,3.5,.7,Math.PI/2)],
    guards:[{x:x,z:z-5,role:'guard'},{x:x-6,z:z-2,role:'rush'},{x:x+4,z:z-4,role:'flank'}]};
}
export function local(p,o){
  const dx=p.x-o.x,dz=p.z-o.z,c=Math.cos(o.yaw),s=Math.sin(o.yaw);
  return {x:dx*c-dz*s,z:dx*s+dz*c};
}
export function contains(p,o,r=0){
  const q=local(p,o);return Math.abs(q.x)<o.w/2+r&&Math.abs(q.z)<o.d/2+r;
}
export function crossing(a,b,o,r=0){
  const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.25));
  for(let i=0;i<=n;i++)if(contains({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n},o,r))return true;
  return false;
}
