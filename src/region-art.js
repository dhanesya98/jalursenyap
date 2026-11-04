/* Destination scenery. Local Atelier textures only; all roots are at identity so
   JSAtelier.batchStatic can bake them without applying a second transform. */
(function(root){
'use strict';
const T=root.THREE;
const C={ink:0x695348,stone:0xd6bb94,edge:0xead3ac,clay:0xb77b5c,blue:0x527f87,
 linen:0xe4d5b1,wood:0x75594b,olive:0x7d825e,bronze:0xb89a63,slate:0x8e9690,dark:0x605b60};
const materials=new Map();
function mat(color,kind){
 const key=color+':'+(kind||'');if(materials.has(key))return materials.get(key);
 const m=new T.MeshToonMaterial({color,gradientMap:root.JSArt.gradient,map:kind?root.JSAtelier.texture(kind):null});
 m.userData.atelier=true;materials.set(key,m);return m;
}
function group(parent,name,x=0,y=0,z=0){const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
function mesh(parent,geometry,color,x=0,y=0,z=0,kind,outline=false){
 const m=new T.Mesh(geometry,typeof color==='number'?mat(color,kind):color);m.position.set(x,y,z);
 m.castShadow=m.receiveShadow=true;parent.add(m);
 if(outline)m.add(new T.LineSegments(new T.EdgesGeometry(geometry,35),new T.LineBasicMaterial({color:C.ink,transparent:true,opacity:.38})));
 return m;
}
const box=(g,w,h,d,c,x=0,y=0,z=0,kind='stone',outline=false)=>mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z,kind,outline);
const cyl=(g,rt,rb,h,c,x=0,y=0,z=0,kind='stone',n=16)=>mesh(g,new T.CylinderGeometry(rt,rb,h,n),c,x,y,z,kind);
function strokes(g,paths,color=C.ink,opacity=.48){
 const p=[];for(const path of paths)for(let i=1;i<path.length;i++)p.push(...path[i-1],...path[i]);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));
 const l=new T.LineSegments(geo,new T.LineBasicMaterial({color,transparent:true,opacity}));g.add(l);return l;
}
function beam(g,a,b,r,color=C.wood){
 const from=new T.Vector3(...a),to=new T.Vector3(...b),d=to.clone().sub(from);
 const m=cyl(g,r,r,d.length(),color,0,0,0,'wood',8);m.position.copy(from.add(to).multiplyScalar(.5));
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
}
function archPath(path,w,h,bottom=0){
 const r=w/2,spring=h-r;path.moveTo(-r,bottom);path.lineTo(-r,spring);
 path.absarc(0,spring,r,Math.PI,0,true);path.lineTo(r,bottom);path.closePath();return path;
}
function windowArch(g,w,h,y,z,trim=C.edge){
 const face=group(g,'Arched recess',0,y,z),inside=archPath(new T.Shape(),w,h);
 mesh(face,new T.ShapeGeometry(inside,12),C.dark,0,0,0);
 const ring=archPath(new T.Shape(),w+.26,h+.13,-.08);
 ring.holes.push(archPath(new T.Path(),w,h));
 mesh(face,new T.ExtrudeGeometry(ring,{depth:.13,bevelEnabled:false,curveSegments:10}),trim,0,0,.025,'stone');
 box(face,w+.35,.13,.27,C.edge,0,-.04,.07);
 const paths=[];for(let i=-1;i<=1;i++){const x=i*w*.23,top=h-w/2+Math.sqrt(w*w/4-x*x)-.09;paths.push([[x,.1,.025],[x,top,.025]]);}
 strokes(face,paths,C.bronze,.6);return face;
}
function pot(g,scale=1,color=C.clay){
 const a=group(g,'Hand-thrown water jar');a.scale.setScalar(scale);
 const profile=[[.17,0],[.32,.08],[.42,.32],[.38,.61],[.23,.8],[.21,.88],[.28,.94],[.26,1],[.19,1],[.18,.88]].map(p=>new T.Vector2(...p));
 mesh(a,new T.LatheGeometry(profile,16),color,0,0,0,'plaster');
 const rings=[];for(const y of [.2,.62]){const r=y<.3?.39:.37,points=[];for(let i=0;i<=32;i++){const t=i/32*Math.PI*2;points.push([Math.cos(t)*r,y,Math.sin(t)*r]);}rings.push(points);}
 strokes(a,rings,C.edge,.65);return a;
}
// Full footprints, not just their centre, stay clear of interaction approaches.
function isClear(world,x,z,radius){
 if(world.terrain.routes.some(route=>world.terrain.nearest(x,z,route).distance<=3.5+radius))return false;
 if((world.data.world.npcs||[]).some(n=>Math.hypot(x-n.position[0],z-n.position[2])<=4+radius))return false;
 if((world.data.world.anchors||[]).some(a=>Math.hypot(x-a.position[0],z-a.position[2])<=3.2+radius))return false;
 if((world.data.world.landmarks||[]).filter(l=>l.id!=='view').some(l=>Math.hypot(x-l.position[0]-5,z-l.position[2]-4)<=3+radius))return false;
 if(Math.hypot(x-125,z+85)<=4+radius)return false;
 return true;
}
function grounded(world,parent,name,x,z,radius,build){
 if(!isClear(world,x,z,radius))return null;
 const g=group(parent,name,x,world.ground(x,z),z);g.userData.footprint={x,z,radius};build(g);return g;
}
function building(world,parent,name,x,z,height,build){
 const g=grounded(world,parent,name,x,z,3.2,build);if(!g)throw new Error(name+' overlaps a protected approach');
 world.block(g,3.1,height);return g;
}
function rug(world,parent,x,z,w,d,rotation=0){
 return grounded(world,parent,'Ground-level woven rug',x,z,Math.hypot(w,d)/2,g=>{
  const m=mesh(g,new T.PlaneGeometry(w,d,6,6),mat(0xffffff,'rug'));
  // Conform every vertex to the existing ground; this is never a physics platform.
  m.rotation.x=-Math.PI/2;g.rotation.y=rotation;const a=m.geometry.attributes.position;
  for(let i=0;i<a.count;i++){const lx=a.getX(i),lz=-a.getY(i),dx=lx*Math.cos(rotation)+lz*Math.sin(rotation),dz=-lx*Math.sin(rotation)+lz*Math.cos(rotation);
   a.setZ(i,world.ground(x+dx,z+dz)-g.position.y+.045);}
  m.geometry.computeVertexNormals();m.castShadow=false;
 });
}
function palm(world,parent,x,z,height){
 return grounded(world,parent,'Sumi date palm',x,z,2.75,g=>{
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(-.12,height*.4,0),new T.Vector3(.3,height*.8,.15),new T.Vector3(.42,height,.18)]);
  mesh(g,new T.TubeGeometry(curve,14,.17,7,false),C.wood,0,0,0,'wood');
  const marks=[];for(let i=1;i<12;i++){const p=curve.getPoint(i/12),ring=[];for(let k=0;k<=10;k++){const a=k/10*Math.PI*2;ring.push([p.x+Math.cos(a)*.18,p.y,p.z+Math.sin(a)*.18]);}marks.push(ring);}strokes(g,marks,C.edge,.45);
  const p=[],uv=[],idx=[],spines=[];let n=0;
  for(let leaf=0;leaf<9;leaf++){
   const a=leaf*Math.PI*2/9,len=2.05+(leaf%3)*.12,spine=[];
   for(let j=0;j<=12;j++){
    const t=j/12,r=t*len,xx=.42+Math.sin(a)*r,yy=height+Math.sin(t*Math.PI)*.5-t*t*.7,zz=.18+Math.cos(a)*r,w=Math.sin(t*Math.PI)*.24;
    spine.push([xx,yy+.015,zz]);
    for(const side of [-1,1]){p.push(xx+Math.cos(a)*w*side,yy-.06,zz-Math.sin(a)*w*side);uv.push(t,side>0?1:0);}
    if(j<12){const k=n+j*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}
   }
   spines.push(spine);n+=26;
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
  const leafMat=mat(C.olive,'linen').clone();leafMat.side=T.DoubleSide;mesh(g,geo,leafMat);strokes(g,spines,C.wood,.5);
 });
}
function reeds(world,parent,x,z){
 return grounded(world,parent,'Reeds at the waterline',x,z,.85,g=>{
  const paths=[];for(let i=0;i<15;i++){const a=i*2.399,r=.15+(i%4)*.13,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.45+(i%5)*.11;
   paths.push([[x,0,z],[x+.05,h*.55,z],[x+Math.cos(a)*.18,h,z+Math.sin(a)*.18]],[[x,.2,z],[x-Math.sin(a)*.18,h*.75,z+Math.cos(a)*.18]]);}
  strokes(g,paths,C.olive,.85);
 });
}
function tower(world){
 const region=group(world.scene,'Menara Batu Senja — stone and blue');
 building(world,region,'Menara Batu Senja',0,-137,15,g=>{
  box(g,4.16,.25,4.16,C.edge,0,.125,0,'stone',true);
  box(g,3.92,9.2,3.92,C.stone,0,4.8,0,'stone',true);
  for(const x of [-1.92,1.92])for(const z of [-1.92,1.92])box(g,.45,9.45,.45,C.edge,x,4.75,z,'stone',true);
  box(g,4.25,.23,4.25,C.blue,0,8.35,0,'tiles');box(g,4.28,.24,4.28,C.edge,0,9.47,0,'stone',true);
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
   const face=group(g,'Tower facade');face.rotation.y=a;
   windowArch(face,.92,2.15,5.65,1.97,C.edge);windowArch(face,.55,1.12,3.35,1.97,C.blue);
   box(face,2.55,.1,.12,C.blue,0,5.28,2.02,'tiles');
   for(const x of [-1.6,-.8,0,.8,1.6])box(face,.45,.5,.38,C.edge,x,9.83,1.93,'stone',true);
  }
  const front=group(g,'Sealed timber door');windowArch(front,1.45,2.7,.18,1.98,C.edge);
  const door=archPath(new T.Shape(),1.29,2.55);mesh(front,new T.ShapeGeometry(door),C.wood,0,.2,2.005,'wood');
  strokes(front,[[[-.4,.3,2.02],[-.4,2.35,2.02]],[[0,.3,2.02],[0,2.7,2.02]],[[.4,.3,2.02],[.4,2.35,2.02]]],C.ink,.65);
  box(front,1.3,.09,.05,C.bronze,0,.85,2.05);box(front,1.3,.09,.05,C.bronze,0,1.75,2.05);
  cyl(g,1.65,1.7,.35,C.edge,0,9.8,0);
  const profile=[];for(let i=0;i<=18;i++){const a=i/18*Math.PI/2;profile.push(new T.Vector2(Math.max(.02,1.6*Math.cos(a)),Math.sin(a)*1.85));}
  mesh(g,new T.LatheGeometry(profile,32),C.blue,0,9.97,0,'tiles');
  const seams=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;seams.push(profile.map(p=>[Math.sin(a)*p.x*1.002,9.97+p.y,Math.cos(a)*p.x*1.002]));}strokes(g,seams,C.bronze,.65);
  beam(g,[0,11.75,0],[0,12.65,0],.045,C.bronze);mesh(g,new T.SphereGeometry(.13,10,6),C.bronze,0,12.65,0);
  // The little bell sits in a dark blue niche high above the delivery porch.
  const bell=group(g,'Courier bell',0,6.25,2.1);cyl(bell,.13,.26,.32,C.bronze,0,.1,0,undefined,12);mesh(bell,new T.SphereGeometry(.06,8,6),C.wood,0,-.1,0);
 });
 rug(world,region,-5.6,-132,2.3,1.4,-.17);
 for(const [x,z,s,c]of [[-5.1,-134.1,.95,C.clay],[-6.1,-133.7,.65,C.blue],[5.7,-135,.82,C.clay]])grounded(world,region,'Juma’s water jars',x,z,.6,g=>pot(g,s,c));
 grounded(world,region,'Stone bench beside the bell tower',6.1,-132,1.45,g=>{
  box(g,2.4,.2,.8,C.edge,0,.55,0,'stone',true);for(const x of [-.8,.8])box(g,.4,.5,.55,C.stone,x,.25,0);
 });
 return region;
}
function oasis(world){
 const region=group(world.scene,'Telaga Sumi — woven shelter and shore');
 building(world,region,'Bu Lamat’s woven shelter',-146,59,5,g=>{
  cyl(g,2.35,2.42,2.28,C.linen,0,1.14,0,'linen',32);
  cyl(g,2.43,2.45,.15,C.clay,0,.17,0,'linen',32);cyl(g,2.39,2.39,.17,C.blue,0,1.96,0,'linen',32);
  const roofGeo=new T.CylinderGeometry(.34,2.83,1.55,32,4,true),colors=[],p=roofGeo.attributes.position;
  for(let i=0;i<p.count;i++){const a=Math.atan2(p.getX(i),p.getZ(i)),c=new T.Color(Math.floor((a+Math.PI)/Math.PI*8)%4===0?C.clay:C.linen);colors.push(c.r,c.g,c.b);}
  roofGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));const roofMat=mat(0xffffff,'linen').clone();roofMat.vertexColors=true;roofMat.side=T.DoubleSide;
  mesh(g,roofGeo,roofMat,0,3.045,0);cyl(g,.36,.43,.18,C.blue,0,3.86,0,'linen',16);
  const seams=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;seams.push([[Math.sin(a)*2.84,2.27,Math.cos(a)*2.84],[Math.sin(a)*1.56,3.06,Math.cos(a)*1.56],[Math.sin(a)*.35,3.83,Math.cos(a)*.35]]);}
  strokes(g,seams,C.wood,.34);
  const door=group(g,'Folded shelter curtains',0,0,2.4);windowArch(door,1.15,1.9,.08,.012,C.clay);
  for(const side of [-1,1]){const curtain=box(door,.27,1.78,.11,C.blue,side*.71,.98,.04,'linen');curtain.rotation.z=side*.08;}
  beam(door,[-.94,2.03,.1],[.94,2.03,.1],.035,C.wood);
  const tassels=[];for(let i=0;i<20;i++){const a=i*Math.PI/10;tassels.push([[Math.sin(a)*2.8,2.28,Math.cos(a)*2.8],[Math.sin(a)*2.8,2.06,Math.cos(a)*2.8]]);}strokes(g,tassels,C.clay,.75);
  for(const side of [-1,1]){const rope=[];for(let j=0;j<=5;j++){const t=j/5;rope.push([side*(2.15+t*.72),2.4*(1-t)-Math.sin(t*Math.PI)*.15,-.7]);}strokes(g,[rope],C.wood,.6);}
 });
 rug(world,region,-142.7,62.3,2.6,1.75,.3);rug(world,region,-149.7,61.9,1.6,2.15,-.1);
 for(const [x,z,s,c]of [[-143.1,59.7,.95,C.clay],[-142.4,60.1,.6,C.blue],[-149.7,58.5,1.12,C.clay],[-150.4,59,.64,C.edge],[-142.7,64.4,.7,C.clay]])grounded(world,region,'Sumi water jars',x,z,.6,g=>pot(g,s,c));
 grounded(world,region,'A folded blanket and basket',-149.8,62.7,.85,g=>{
  box(g,1.1,.15,.7,C.blue,0,.1,0,'rug');box(g,1,.13,.64,C.linen,0,.24,0,'linen');
  cyl(g,.25,.35,.4,C.wood,.42,.2,.37,'wood',12);
 });
 // The old pool remains owned by World; this follows its outer shore, not its centre.
 for(const p of [[-153.5,69,6],[-153,87,6.8],[-128,81,6.2],[-140,91,6.6]])palm(world,region,...p);
 for(const p of [[-155,74],[-153,85],[-146,90],[-137,89],[-130,84],[-129,72],[-146,64]])reeds(world,region,...p);
 return region;
}
function wedge(g,inner,outer,spring,a,b,depth,color){
 const sh=new T.Shape();sh.moveTo(Math.cos(a)*inner,spring+Math.sin(a)*inner);sh.lineTo(Math.cos(a)*outer,spring+Math.sin(a)*outer);
 sh.absarc(0,spring,outer,a,b,false);sh.lineTo(Math.cos(b)*inner,spring+Math.sin(b)*inner);sh.absarc(0,spring,inner,b,a,true);sh.closePath();
 return mesh(g,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:5}),color,0,0,-depth/2,'stone',true);
}
function relay(world){
 const region=group(world.scene,'Simpul Sembilan — Warjian masonry');
 building(world,region,'Broken Warjian relay arch',126,-100,13,g=>{
  box(g,4.7,.5,3.9,C.slate,0,.25,0,'stone',true);
  // Steps end inside the building collider; surrounding ground stays continuous.
  box(g,2.3,.14,.55,C.edge,0,.07,2.43,'stone',true);box(g,2.1,.28,.55,C.stone,0,.14,1.93,'stone',true);
  for(const side of [-1,1]){
   for(let i=0;i<7;i++)box(g,.86,.78,1.8,i%3===0?C.stone:C.slate,side*1.83,.9+i*.8,0,'stone',true);
   box(g,1.05,.25,1.99,C.edge,side*1.83,6.26,0,'stone',true);
   box(g,.09,4.9,.04,C.bronze,side*1.83,3.38,.921,'tiles');
  }
  // Two incomplete voussoir chains keep the fracture readable against the sky.
  for(let i=0;i<5;i++)wedge(g,1.4,2.27,6.25,i*.195,i*.195+.18,1.8,i%2?C.stone:C.slate);
  for(let i=0;i<7;i++)wedge(g,1.4,2.27,6.25,Math.PI-1.38+i*.195,Math.PI-1.2+i*.195,1.8,i%2?C.slate:C.stone);
  const split=box(g,.58,.74,1.83,C.stone,-.46,8.27,0,'stone',true);split.rotation.z=.22;
  box(g,2.7,4.9,1.28,C.dark,0,2.95,-.24,'stone');box(g,2.5,.25,1.5,C.stone,0,5.52,-.2,'stone',true);
  // A bronze knot is the extinct relay's central instrument, not a new interaction.
  const dial=group(g,'Ninefold relay inlay',0,3.85,.5);
  for(const r of [1.04,.78])mesh(dial,new T.TorusGeometry(r,.035,6,36),C.bronze,0,0,.02);
  const knots=[];for(let i=0;i<9;i++){const a=i*Math.PI*2/9;knots.push([[Math.sin(a)*.8,Math.cos(a)*.8,.05],[Math.sin(a)*1.18,Math.cos(a)*1.18,.05]]);}strokes(dial,knots,C.bronze,.85);
  const crystal=mesh(dial,new T.OctahedronGeometry(.38,0),C.blue,0,0,.12);crystal.scale.set(1,1.4,.5);
  for(const side of [-1,1]){
   const a=group(g,'Fractured relay prong',side*.8,8.1,-.08);a.rotation.z=side*-.14;
   box(a,.25,2.9,.5,C.slate,0,1.4,0,'stone',true);box(a,.05,2.55,.03,C.bronze,0,1.25,.27);
  }
  strokes(g,[[[-2.24,4.7,.92],[-1.88,4.53,.93],[-1.65,4.18,.93]],[[1.44,2.7,.93],[1.91,2.53,.93],[2.22,2.7,.93]],[[.6,1.7,.43],[.27,1.46,.43],[.36,1.12,.43]]],C.ink,.7);
 });
 for(const [x,z,s,a]of [[120,-102,.9,.2],[132,-98,.7,-.32],[131,-106,1.1,.45],[120.5,-107,.6,.5]])grounded(world,region,'Fallen Warjian masonry',x,z,s,g=>{
  const m=box(g,s*1.15,s*.8,s*.95,C.slate,0,s*.36,0,'stone',true);m.rotation.y=a;m.rotation.z=.12;
  box(g,s*.64,.04,.035,C.bronze,0,s*.56,s*.48,'tiles');
 });
 grounded(world,region,'Old relay marker',133.5,-104,1.05,g=>{
  box(g,.9,2.1,.65,C.stone,0,1.05,0,'stone',true);box(g,.65,.08,.04,C.bronze,0,1.55,.34);
  strokes(g,[[[-.22,1.1,.34],[0,.86,.34],[.22,1.1,.34],[0,1.34,.34],[-.22,1.1,.34]]],C.ink,.6);
 });
 return region;
}
function build(world){
 if(world.regionArt)return world.regionArt;
 world.regionArt=[tower(world),oasis(world),relay(world)];
 return world.regionArt;
}
root.JSRegionArt={build};
})(globalThis);
