// Small authored districts: a grid route avoids dragging companions through buildings.
export function route(start,goal,valid){
  const unit=1.5,cell=(x,z)=>[Math.round(x/unit),Math.round(z/unit)],key=(x,z)=>x+','+z;
  const a=cell(start.x,start.z),b=cell(goal.x,goal.z),open=[{x:a[0],z:a[1],g:0,f:0}],best=new Map([[key(...a),0]]),parent=new Map();
  let target=null;
  for(let n=0;open.length&&n<2400;n++){
    open.sort((p,q)=>q.f-p.f);const p=open.pop();
    if(Math.hypot(p.x-b[0],p.z-b[1])<1.5){target=p;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const x=p.x+dx,z=p.z+dz;if(x<-22||x>31||z<-33||z>26||!valid(x*unit,z*unit))continue;
      if(dx&&dz&&(!valid((p.x+dx)*unit,p.z*unit)||!valid(p.x*unit,(p.z+dz)*unit)))continue;
      const k=key(x,z),g=p.g+Math.hypot(dx,dz);if((best.get(k)??Infinity)<=g)continue;
      best.set(k,g);parent.set(k,p);open.push({x,z,g,f:g+Math.hypot(x-b[0],z-b[1])});
    }
  }
  if(!target)return [];
  const points=[];for(let p=target;p&&key(p.x,p.z)!==key(...a);p=parent.get(key(p.x,p.z)))points.push({x:p.x*unit,z:p.z*unit});
  return points.reverse();
}
