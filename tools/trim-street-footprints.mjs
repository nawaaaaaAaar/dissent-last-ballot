// ODbL source geometry remains unchanged; only gameplay display contours are adapted.
import fs from 'node:fs';
import clipping from 'polygon-clipping';
const file='docs/delhi-map.json',data=JSON.parse(fs.readFileSync(file)),segments=[];
for(const road of data.roads)for(let i=1;i<road.points.length;i++){
  if(['footway','path','steps'].includes(road.kind))continue;
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.01)continue;
  const width=road.kind==='service'?3:road.kind==='pedestrian'?2.5:4.5;
  const r=width/2+.75,nx=-dz/length*r,nz=dx/length*r,ex=dx/length*r,ez=dz/length*r;
  const ring=[[a[0]+nx-ex,a[1]+nz-ez],[a[0]-nx-ex,a[1]-nz-ez],[b[0]-nx+ex,b[1]-nz+ez],[b[0]+nx+ex,b[1]+nz+ez]];
  ring.push(ring[0]);segments.push({ring,box:[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))]});
}
const result=[];
for(const b of data.buildings){
  const ring=b.points,box=[Math.min(...ring.map(p=>p[0])),Math.min(...ring.map(p=>p[1])),Math.max(...ring.map(p=>p[0])),Math.max(...ring.map(p=>p[1]))];
  const cuts=segments.filter(s=>s.box[0]<=box[2]&&s.box[2]>=box[0]&&s.box[1]<=box[3]&&s.box[3]>=box[1]);
  let shapes=[[ring]];
  if(cuts.length){const union=clipping.union(...cuts.map(s=>[s.ring]));shapes=clipping.difference([ring],union);}
  for(const shape of shapes){
    const points=shape[0],area=Math.abs(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;
    if(area<1)continue;
    result.push({...b,points,holes:shape.slice(1)});
  }
}
data.renderBuildings=result;data.adaptation='Display footprints cut back for arcade vehicle streets and 0.75-unit verges. Original OSM footprints retained in buildings; pedestrian traces are not used to erase buildings.';
fs.writeFileSync(file,JSON.stringify(data));
console.log({sourceFootprints:data.buildings.length,displayParts:result.length,roadSegments:segments.length});
