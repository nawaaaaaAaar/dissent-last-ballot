// OSM-derived geometry: database license ODbL 1.0. Original code: repository license.
export const SCALE=.14;
export function project(lat,lon){return {x:(lon-77.221)*111320*Math.cos(28.624*Math.PI/180)*SCALE,z:(28.624-lat)*111320*SCALE};}
export const PLACES=[
  {id:'jantar',name:'Jantar Mantar',lat:28.6271,lon:77.2164,role:'Recent protest area · sourced separately'},
  {id:'cp',name:'Connaught Place',lat:28.63278,lon:77.21972,role:'City landmark · fictional network hub'},
  {id:'gate',name:'India Gate',lat:28.612864,lon:77.229306,role:'City landmark · fictional support route'},
  {id:'tolstoy',name:'Tolstoy Marg',lat:28.6255,lon:77.2196,role:'Recent protest-related reporting'},
  {id:'sansad',name:'Sansad Marg',lat:28.6248,lon:77.2149,role:'Reported barricaded approach'},
].map(p=>({...p,...project(p.lat,p.lon)}));
export const WORLD={bounds:220,buildings:[],colliders:[],roads:[],segments:[],nodes:[],friend:{x:0,z:0},record:{x:0,z:0},van:{x:0,z:0},safe:{x:0,z:0},gate:{x:0,z:0,w:10,d:.5},medkits:[]};
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function segmentDistance(p,a,b){
  const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);
}
export function inside(p,poly){
  let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];
    if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)yes=!yes;
  }return yes;
}
export function installMap(data){
  WORLD.roads=data.roads;
  WORLD.buildings=data.buildings.map(b=>({...b,poly:b.points.map(([x,z])=>({x,z})),x:b.points.reduce((s,p)=>s+p[0],0)/b.points.length,z:b.points.reduce((s,p)=>s+p[1],0)/b.points.length}));
  const ids=new Map(),nodes=[],segments=[];
  const node=(x,z)=>{const key=x.toFixed(2)+','+z.toFixed(2);if(!ids.has(key)){ids.set(key,nodes.length);nodes.push({x,z,links:[]});}return ids.get(key);};
  for(const r of data.roads)for(let i=1;i<r.points.length;i++){
    const [x,z]=r.points[i-1],[xx,zz]=r.points[i];
    const a=node(x,z),b=node(xx,zz),length=Math.hypot(x-xx,z-zz);
    if(length<.01)continue;
    nodes[a].links.push({id:b,length});nodes[b].links.push({id:a,length});
    segments.push({a:nodes[a],b:nodes[b],name:r.name,width:r.kind==='service'?4:r.kind==='pedestrian'?5:7});
  }
  WORLD.nodes=nodes;WORLD.segments=segments;
  // Join divided lanes and tiny OSM gaps for arcade navigation, not real traffic routing.
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(distance(nodes[i],nodes[j])<4){
    const length=distance(nodes[i],nodes[j]);nodes[i].links.push({id:j,length});nodes[j].links.push({id:i,length});
  }
  const cp=snap(PLACES[1]);WORLD.van={x:cp.x+1,z:cp.z};WORLD.safe={...cp};
  WORLD.friend={...snap(PLACES[0])};WORLD.record={...WORLD.friend};
  WORLD.medkits=PLACES.slice(0,3).map(p=>snap(p));
}
export function snap(p){
  let best=Infinity,chosen={x:p.x,z:p.z};
  for(const s of WORLD.segments){
    const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.z-s.a.z)*dz)/(dx*dx+dz*dz||1)));
    const q={x:s.a.x+t*dx,z:s.a.z+t*dz},d=distance(p,q);if(d<best){best=d;chosen=q;}
  }return chosen;
}
export function roadRoute(a,b){
  const nodes=WORLD.nodes;if(!nodes.length)return [b];
  const closest=p=>nodes.reduce((best,n,i)=>distance(n,p)<distance(nodes[best],p)?i:best,0);
  const start=closest(a),goal=closest(b),cost=new Map([[start,0]]),parent=new Map(),open=[{id:start,g:0,f:distance(nodes[start],nodes[goal])}];
  while(open.length){
    open.sort((a,b)=>b.f-a.f);const q=open.pop();if(q.g!==cost.get(q.id))continue;if(q.id===goal)break;
    for(const e of nodes[q.id].links){const g=q.g+e.length;if(g>=(cost.get(e.id)??Infinity))continue;cost.set(e.id,g);parent.set(e.id,q.id);open.push({id:e.id,g,f:g+distance(nodes[e.id],nodes[goal])});}
  }
  if(!cost.has(goal))return [snap(b),b];
  const path=[];for(let id=goal;id!==start;id=parent.get(id)){if(id===undefined)return[b];path.push(nodes[id]);}
  path.push(nodes[start]);return path.reverse().concat([b]);
}
