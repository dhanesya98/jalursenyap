/* Pos Batu Biru: authored visual slice. All near-field scenery is real 3D.
   Textures are drawn locally; no network, image services, or runtime generation. */
(function(root){
'use strict';
const T=root.THREE, C={ink:0x695348,plaster:0xe5bd87,edge:0xf0d5a2,clay:0xbe7652,blue:0x467e89,wood:0x705144,linen:0xe8d9b7,olive:0x777a53,gold:0xe4b65e};
const mats=new Map(),textures=new Map();let seed=42;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function texture(kind){
 if(textures.has(kind))return textures.get(kind);if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#fff9eb';x.fillRect(0,0,512,512);seed=kind.length*319;
 for(let i=0;i<4200;i++){x.fillStyle=`rgba(112,85,63,${random()*.10})`;x.fillRect(random()*512,random()*512,random()*3+.3,random()*1.7+.3);}
 if(kind==='plaster'||kind==='stone'){
  for(let i=0;i<40;i++){const px=random()*512,py=random()*512;x.fillStyle='rgba(138,101,68,.05)';x.beginPath();x.ellipse(px,py,random()*23+4,random()*12+2,random()*3,0,6.29);x.fill();for(let k=0;k<4;k++){x.strokeStyle='rgba(104,76,64,.12)';x.lineWidth=.7;x.beginPath();x.moveTo(px+k*3,py);x.lineTo(px+k*3+4,py+6);x.stroke();}}
  if(kind==='stone'){x.strokeStyle='rgba(97,73,61,.42)';x.lineWidth=1.4;for(let j=0;j<4;j++){const y=j*128+3;x.beginPath();x.moveTo(0,y);x.lineTo(512,y+2);x.stroke();for(let i=0;i<3;i++){const a=i*205+(j%2)*93;x.beginPath();x.moveTo(a,y);x.lineTo(a+3,y+125);x.stroke();}}}
 }
 if(kind==='linen'||kind==='wood'){for(let i=0;i<512;i+=kind==='linen'?4:13){x.strokeStyle=kind==='linen'?'rgba(109,88,67,.10)':'rgba(86,55,41,.22)';x.lineWidth=.8;x.beginPath();x.moveTo(i,0);x.bezierCurveTo(i+3,170,i-4,340,i+1,512);x.stroke();}if(kind==='linen')for(let i=0;i<512;i+=5){x.strokeStyle='rgba(109,88,67,.06)';x.beginPath();x.moveTo(0,i);x.lineTo(512,i);x.stroke();}}
 if(kind==='tiles'){
  x.strokeStyle='rgba(51,79,76,.55)';x.lineWidth=2;for(let j=0;j<8;j++)for(let i=-1;i<8;i++){const px=i*72+(j%2)*36,py=j*64;x.strokeRect(px,py,70,62);x.fillStyle=`rgba(232,219,170,${random()*.12})`;x.fillRect(px+2,py+2,67,59);if(random()<.25){x.strokeStyle='rgba(227,209,153,.65)';x.beginPath();x.moveTo(px+10,py+8);x.lineTo(px+17,py+16);x.lineTo(px+12,py+27);x.stroke();x.strokeStyle='rgba(51,79,76,.55)';}}}
 if(kind==='rug'){x.fillStyle='#ede0b9';x.fillRect(0,0,512,512);for(let j=0;j<8;j++)for(let i=0;i<8;i++){x.strokeStyle=(i+j)%2?'#a96f4e':'#527c80';x.lineWidth=2;x.beginPath();x.moveTo(i*64+32,j*64+5);x.lineTo(i*64+57,j*64+32);x.lineTo(i*64+32,j*64+59);x.lineTo(i*64+7,j*64+32);x.closePath();x.stroke();}x.strokeStyle='#a5694e';x.lineWidth=12;x.strokeRect(15,15,482,482);}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;textures.set(kind,t);return t;
}
function mat(color,kind){const key=color+':'+(kind||'');if(mats.has(key))return mats.get(key);const m=new T.MeshToonMaterial({color,gradientMap:JSArt.gradient,map:kind?texture(kind):null});m.userData.atelier=true;mats.set(key,m);return m;}
function mesh(g,geo,color,x=0,y=0,z=0,kind,edges=false){const m=new T.Mesh(geo,typeof color==='number'?mat(color,kind):color);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);if(edges){const l=new T.LineSegments(new T.EdgesGeometry(geo,36),new T.LineBasicMaterial({color:C.ink,transparent:true,opacity:.43}));m.add(l);}return m;}
function box(g,w,h,d,c,x,y,z,kind='plaster',edges=true){return mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z,kind,edges);}
function line(g,pts,color=C.ink,opacity=.6){const l=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color,transparent:true,opacity}));g.add(l);return l;}
function cylinder(g,a,b,h,c,x,y,z,n=16,kind){return mesh(g,new T.CylinderGeometry(a,b,h,n),c,x,y,z,kind,true);}
function group(g,x=0,y=0,z=0){const a=new T.Group();a.position.set(x,y,z);if(g)g.add(a);return a;}
function beam(g,a,b,r,c){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=cylinder(g,r,r,d.length(),c,0,0,0,8,'wood');m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
function arch(g,cx,z,width,height,depth,color){
 const radius=width/2,spring=height-radius;
 for(let i=0;i<13;i++){const a=i*Math.PI/13,b=(i+1)*Math.PI/13-.012,shape=new T.Shape(),outer=radius+.38;shape.moveTo(Math.cos(a)*radius,spring+Math.sin(a)*radius);shape.lineTo(Math.cos(a)*outer,spring+Math.sin(a)*outer);shape.absarc(0,spring,outer,a,b,false);shape.lineTo(Math.cos(b)*radius,spring+Math.sin(b)*radius);shape.absarc(0,spring,radius,b,a,true);const m=mesh(g,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:3}),i%3===0?C.edge:color,cx,0,z,'stone',true);}
 for(const side of [-1,1])for(let j=0;j<Math.ceil(spring/.55);j++){const h=Math.min(.54,spring-j*.55);box(g,.38,h,depth,color,cx+side*(radius+.19),j*.55+h/2,z+depth/2,'stone');}
}
function niche(g,x,y,z,w,h){const sh=new T.Shape();sh.moveTo(-w/2,0);sh.lineTo(-w/2,h-w/2);sh.absarc(0,h-w/2,w/2,Math.PI,0,true);sh.lineTo(w/2,0);sh.closePath();mesh(g,new T.ShapeGeometry(sh),new T.MeshBasicMaterial({color:0x615b61}),x,y,z);box(g,w+.16,.12,.26,C.edge,x,y-.04,z+.07);for(let i=-2;i<=2;i++)box(g,.035,h*.76,.04,C.wood,x+i*w/6,y+h*.38,z+.06,'wood',false);}
function dome(g,x,y,z,r){const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push(new T.Vector2(Math.max(.025,r*Math.cos(t*Math.PI/2)),t*r*1.12));}const m=mesh(g,new T.LatheGeometry(pts,48),C.blue,x,y,z,'tiles');for(let i=0;i<12;i++){const a=i*Math.PI/6;line(g,pts.map(p=>[x+Math.sin(a)*p.x*1.002,y+p.y,z+Math.cos(a)*p.x*1.002]),0x9e996d,.6);}cylinder(g,r*1.04,r*1.04,.22,C.edge,x,y,z,32,'stone');cylinder(g,.035,.1,.8,C.gold,x,y+r*1.12+.3,z,10);mesh(g,new T.SphereGeometry(.14,12,8),C.gold,x,y+r*1.12+.77,z);}
function jar(g,x,z,scale=1,color=C.clay){const a=group(g,x,0,z);a.scale.setScalar(scale);const points=[[.16,0],[.32,.06],[.48,.35],[.43,.65],[.25,.82],[.22,.95],[.29,1],[.28,1.06],[.20,1.06],[.19,.94]].map(p=>new T.Vector2(...p));mesh(a,new T.LatheGeometry(points,20),color,0,0,0,'plaster');for(const y of [.23,.35,.75]){const r=y<.5?.47:.32;const ring=mesh(a,new T.TorusGeometry(r,.009,3,32),C.edge,0,y,0);ring.rotation.x=Math.PI/2;}return a;}
function crate(g,x,y,z,s=1){const a=group(g,x,y,z);box(a,s,s*.72,s*.75,C.wood,0,s*.36,0,'wood');for(const side of [-1,1]){box(a,s,.07,.04,C.edge,0,.11,side*s*.39,'wood');box(a,s,.07,.04,C.edge,0,s*.61,side*s*.39,'wood');}for(let i=-2;i<=2;i++)line(a,[[i*s/5,.1,s*.38],[i*s/5,s*.62,s*.38]],C.ink,.7);return a;}
function palm(g,x,z,height){const base=group(g,x,0,z);const curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(-.25,height*.4,0),new T.Vector3(.35,height*.8,.1),new T.Vector3(.55,height,.2)]);mesh(base,new T.TubeGeometry(curve,18,.17,9,false),C.wood,0,0,0,'wood');for(let j=0;j<18;j++){const p=curve.getPoint(j/18),ring=mesh(base,new T.TorusGeometry(.18,.018,3,10),C.edge,p.x,p.y,p.z);ring.rotation.x=Math.PI/2;}
 const leaves=group(base,.55,height,.2),pos=[],idx=[];let count=0;
 for(let l=0;l<11;l++){const a=l*6.283/11,len=2.6+(l%3)*.25,spine=[];for(let i=0;i<=18;i++){const t=i/18,rad=t*len;spine.push([Math.cos(a)*rad,Math.sin(t*Math.PI)*.62-t*t*.75,Math.sin(a)*rad]);}line(leaves,spine,C.wood,.8);for(let i=2;i<17;i++){const t=i/18,p=spine[i],w=Math.sin(t*Math.PI)*.60;for(const side of [-1,1]){const q=[p[0]+Math.cos(a+side*1.0)*w,p[1]-.15,p[2]+Math.sin(a+side*1.0)*w],next=spine[i+1];pos.push(...p,...q,...next);idx.push(count,count+1,count+2);count+=3;}}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();const lm=mat(C.olive,'linen').clone();lm.side=T.DoubleSide;mesh(leaves,geo,lm);return base;
}
function canopy(g){
 const width=11,depth=7,y=4.4,cx=.5,cz=32;
 for(const x of [-5,6])for(const z of [28.5,35.5]){beam(g,[x,0,z],[x,y+.15,z],.075,C.wood);cylinder(g,.12,.12,.07,C.gold,x,3.5,z,8);}
 beam(g,[-5,y,28.5],[6,y,28.5],.07,C.wood);beam(g,[-5,y,35.5],[6,y,35.5],.065,C.wood);
 const pos=[],uv=[],colors=[],idx=[];let n=0;
 for(let iz=0;iz<=12;iz++)for(let ix=0;ix<=20;ix++){const u=ix/20,v=iz/12,yy=y-Math.sin(u*Math.PI)*.6-Math.sin(v*Math.PI)*.35;pos.push(cx+(u-.5)*width,yy,cz+(v-.5)*depth);uv.push(u*3,v*2);const col=new T.Color(Math.floor(u*10)%3===0?C.clay:C.linen);colors.push(col.r,col.g,col.b);if(ix<20&&iz<12){n=iz*21+ix;idx.push(n,n+21,n+1,n+1,n+21,n+22);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(idx);geo.computeVertexNormals();const m=mat(0xffffff,'linen').clone();m.side=T.DoubleSide;m.vertexColors=true;const cloth=mesh(g,geo,m);const base=new Float32Array(pos);cloth.userData.animate=t=>{const p=geo.attributes.position;for(let i=0;i<p.count;i++){const u=(base[i*3]+5)/width,v=(base[i*3+2]-28.5)/depth;p.setY(i,base[i*3+1]+Math.sin(t*1.4+u*5+v*2)*.055*Math.sin(u*Math.PI)*Math.sin(v*Math.PI));}p.needsUpdate=true;};
 for(let j=0;j<=10;j++){const x=-5+j*1.1,yy=y-Math.sin(j/10*Math.PI)*.6;line(g,[[x,yy+.02,28.5],[x,yy-.33,32],[x,yy+.02,35.5]],C.ink,.3);const tassel=beam(g,[x,yy,35.5],[x,yy-.18,35.5],.014,C.wood);}
 return cloth;
}
function buildHub(world){
 const g=group(world.scene);g.name='Pos Batu Biru — visual slice';world.atelier=g;
 // Continuous courtyard paving is below the collider ground; details sit at the same height.
 const floor=cylinder(g,15,15,.1,C.plaster,0,-.07,35,64,'stone');floor.castShadow=false;
 const pavers=new T.InstancedMesh(new T.BoxGeometry(1.05,.035,.72),mat(C.edge,'stone'),231);pavers.receiveShadow=true;let n=0;const matrix=new T.Matrix4(),quat=new T.Quaternion();
 for(let row=0;row<11;row++)for(let col=0;col<21;col++){const x=(col-10)*1.1+(row%2)*.5,z=31+row*.78;matrix.compose(new T.Vector3(x,-.005,z),quat,new T.Vector3(1,1,1));pavers.setMatrixAt(n,matrix);pavers.setColorAt(n,new T.Color([0xffffff,0xead8bb,0xe2c69d,0xf2dfbb][(col*3+row)%4]));n++;}g.add(pavers);
 // Main post, offset from the traversable centre lane and Maren's interaction radius.
 const post=group(g,-9,0,24);post.name='Maison des courriers';
 box(post,9,5.8,7,C.plaster,0,2.9,0);box(post,9.4,.3,7.4,C.edge,0,5.85,0,'stone');
 for(const x of [-4.45,4.45])box(post,.55,5.95,7.2,C.edge,x,2.98,0,'stone');
 box(post,8.4,.3,.13,C.blue,0,5.25,3.58,'tiles');box(post,9.5,.22,7.5,C.edge,0,.1,0,'stone');
 for(let i=0;i<12;i++){box(post,.55,.4,.55,C.edge,-4.1+i*.75,6.13,3.5,'stone');}
 for(const side of [-1,1]){const buttress=box(post,.85,2.5,.85,C.plaster,side*4.55,1.25,3.5,'stone');buttress.rotation.z=side*.035;}
 // Dark recess behind the thick voussoir arch; the interior is intentionally non-traversable.
 niche(post,0,.05,3.515,2.8,4.25);arch(post,0,3.53,2.8,4.25,.32,C.edge);
 for(const x of [-3.25,3.25])niche(post,x,2.7,3.52,.8,1.5);
 for(const x of [-2.5,2.5]){const t=box(post,.68,2.3,.045,C.clay,x,2.6,3.56,'rug',false);t.rotation.z=x>0?.025:-.02;beam(post,[x-.45,3.8,3.7],[x+.45,3.8,3.7],.035,C.wood);}
 dome(post,-.2,6.0,-.1,3.75);
 // One slim tower gives the post a readable silhouette without filling the horizon.
 const tower=group(g,-15,0,22);cylinder(tower,1.25,1.6,9.2,C.plaster,0,4.6,0,12,'stone');cylinder(tower,1.65,1.4,.38,C.edge,0,8.7,0,12,'stone');dome(tower,0,9.25,0,1.35);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const face=group(tower,Math.sin(a)*1.28,6.6,Math.cos(a)*1.28);face.rotation.y=a;niche(face,0,0,.01,.55,1.6);}
 const annex=group(g,10,0,22);box(annex,6,3.9,5,C.plaster,0,1.95,0);box(annex,6.4,.22,5.4,C.edge,0,3.9,0,'stone');dome(annex,0,4,0,2.15);niche(annex,0,.1,2.52,1.8,3.1);arch(annex,0,2.53,1.8,3.1,.22,C.edge);
 for(const b of [{x:-9,z:24,r:5.2,h:10},{x:-15,z:22,r:1.5,h:12},{x:10,z:22,r:3.4,h:7}])world.blockers.push({x:b.x,z:b.z,radius:b.r,bottom:0,top:b.h,active:true});
 post.traverse(o=>{if(o.isMesh)world.solidMeshes.push(o);});annex.traverse(o=>{if(o.isMesh)world.solidMeshes.push(o);});
 const awning=canopy(g);world.animations.push(awning);
 // Maren's worktable, papers, kettle and a bowl of bread are everyday storytelling.
 const table=group(g,-2.8,0,30.8);box(table,2.5,.12,1.05,C.wood,0,.92,0,'wood');for(const x of [-1,1])for(const z of [-.36,.36])box(table,.1,.9,.1,C.wood,x,.45,z,'wood');
 for(let i=0;i<4;i++){const letter=JSArt.prop('letter');letter.position.set(-.65+i*.08,1+i*.022,.08);letter.rotation.y=i*.2;table.add(letter);}const bread=JSArt.prop('bread');bread.position.set(.63,1,0);table.add(bread);jar(table,.1,-.18,.25,C.blue).position.y=1;
 world.blockers.push({x:-2.8,z:30.8,radius:1.25,bottom:0,top:1.05,active:true});
 const rug=mesh(g,new T.PlaneGeometry(3.8,2.2),mat(0xffffff,'rug'),-.6,.035,32.3);rug.rotation.x=-Math.PI/2;rug.receiveShadow=true;rug.castShadow=false;
 for(const [x,z,s,c]of [[-5,30,1.15,C.clay],[-5.9,30.5,.82,C.blue],[-6.1,29.5,.65,C.edge],[5,32,.9,C.clay],[5.7,31,.65,C.blue]])jar(g,x,z,s,c);
 crate(g,4,0,29,1);crate(g,4.8,0,29.5,.75);crate(g,4,.74,29,.7);
 for(const [x,z]of [[-3.5,29.1],[3.7,35.1],[-11.5,28.5]]){const l=JSArt.prop('lantern',{height:2.2});l.position.set(x,0,z);g.add(l);world.animations.push(l);}
 // Low walls provide a foreground frame, but leave the north and south exits clear.
 for(const side of [-1,1]){const wall=box(g,6.8,.65,.5,C.plaster,side*9,.325,44,'stone');box(g,7,.12,.7,C.edge,side*9,.71,44,'stone');}
 palm(g,-13,35,7.4);palm(g,8.5,30,7);palm(g,13,38,6.1);
 // Water basin, tiled rim and hand-drawn concentric ripples.
 const well=group(g,-7.7,0,38.3);cylinder(well,1.35,1.45,.48,C.edge,0,.24,0,24,'stone');cylinder(well,1.4,1.4,.13,C.blue,0,.52,0,24,'tiles');const water=mesh(well,new T.CircleGeometry(1.22,48),new T.MeshBasicMaterial({color:0x79aaa2}),0,.595,0);water.rotation.x=-Math.PI/2;for(const r of [.35,.72,1.05]){const ripple=mesh(well,new T.RingGeometry(r,r+.008,48),new T.MeshBasicMaterial({color:0xc7ded0,side:T.DoubleSide}),0,.60,0);ripple.rotation.x=-Math.PI/2;}world.blockers.push({x:-7.7,z:38.3,radius:1.5,bottom:0,top:.65,active:true});
 // Small growth where the stone meets sand. Clusters, not uniformly scattered noise.
 const plants=group(g);seed=427;for(const [cx,cz]of [[-12,42],[12,43],[7,27],[-14,31],[-4.5,45],[9,42]])for(let i=0;i<14;i++){const x=cx+(random()-.5)*2,z=cz+(random()-.5)*1.6,h=.15+random()*.45;for(let k=0;k<3;k++){const a=random()*6.28;line(plants,[[x,.02,z],[x+Math.sin(a)*.1,h*.55,z+Math.cos(a)*.1],[x+Math.sin(a)*.24,h,z+Math.cos(a)*.24]],0x7c7954,.7);}if(i%3===0)mesh(plants,new T.IcosahedronGeometry(.055,0),0xbda6b6,x,h,z);}
 for(const [x,z,s]of [[-4.8,46,1],[8.9,43.3,.7],[-12,40.9,.6]]){const stone=mesh(g,new T.DodecahedronGeometry(s,0),C.clay,x,s*.2,z,'plaster',true);stone.scale.set(1,.45,.78);stone.rotation.y=x;}
 world.supply=JSArt.prop('bag');world.supply.position.set(-5,0,39);g.add(world.supply);world.interactions.push({id:'supply',name:'Persediaan Pos',position:new T.Vector3(-5,0,39),kind:'supply'});
 return g;
}
function tintMaterial(m){
 if(!m.isMeshToonMaterial||m.userData.inkShader)return;m.userData.inkShader=true;
 m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',`float lightValue = dot(reflectedLight.directDiffuse, vec3(0.3333)) / max(dot(diffuseColor.rgb,vec3(0.3333)), 0.025);
 float inkBand = smoothstep(0.08,0.65,lightValue);
 vec3 shadeTint = vec3(0.56,0.52,0.67);
 vec3 outgoingLight = diffuseColor.rgb * mix(shadeTint,vec3(1.0,0.96,0.86),inkBand) + totalEmissiveRadiance;`);};m.customProgramCacheKey=()=> 'ink-gouache-v1';m.needsUpdate=true;
}
// Bake only static scenery, preserving articulated characters and animated cloth.
function batchStatic(g){
 g.updateMatrixWorld(true);const buckets=new Map(),remove=[];
 const visit=o=>{if(o.userData.animate||o.isInstancedMesh)return;
  if((o.isMesh||o.isLine)&&o.geometry?.attributes.position&&!Array.isArray(o.material)){
   const isLine=!!o.isLine,mat=o.material,key=isLine?'line:'+mat.color.getHex()+':'+mat.opacity:'mesh:'+mat.uuid;
   let b=buckets.get(key);if(!b){b={material:mat,line:isLine,p:[],n:[],uv:[],color:[]};buckets.set(key,b);}
   const geom=o.geometry,pos=geom.attributes.position,idx=geom.index,normal=geom.attributes.normal,uv=geom.attributes.uv,col=geom.attributes.color,nm=new T.Matrix3().getNormalMatrix(o.matrixWorld),v=new T.Vector3();
   const append=i=>{v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);b.p.push(v.x,v.y,v.z);if(!isLine){if(normal)v.fromBufferAttribute(normal,i).applyMatrix3(nm).normalize();else v.set(0,1,0);b.n.push(v.x,v.y,v.z);b.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);b.color.push(col?col.getX(i):1,col?col.getY(i):1,col?col.getZ(i):1);}};
   if(isLine&&!o.isLineSegments){const count=idx?idx.count:pos.count;for(let i=1;i<count;i++){append(idx?idx.getX(i-1):i-1);append(idx?idx.getX(i):i);}}
   else for(let i=0;i<(idx?idx.count:pos.count);i++)append(idx?idx.getX(i):i);
   remove.push(o);
  }
  for(const child of [...o.children])visit(child);
 };for(const child of [...g.children])visit(child);
 for(const o of remove)o.parent?.remove(o);
 for(const b of buckets.values()){const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(b.p,3));let object;if(b.line)object=new T.LineSegments(geom,b.material);else{geom.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));geom.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geom.setAttribute('color',new T.Float32BufferAttribute(b.color,3));object=new T.Mesh(geom,b.material);object.castShadow=object.receiveShadow=true;}g.add(object);}g.userData.batchedFrom=remove.length;g.userData.batchedTo=buckets.size;
}
function apply(game){
 game.scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])tintMaterial(m);});
 game.renderer.toneMapping=T.NoToneMapping;game.renderer.toneMappingExposure=1;
 game.sun.shadow.camera.left=game.sun.shadow.camera.bottom=-25;game.sun.shadow.camera.right=game.sun.shadow.camera.top=25;game.sun.shadow.mapSize.set(2048,2048);game.sun.shadow.normalBias=.035;game.sun.shadow.bias=-.0002;game.sun.shadow.radius=2;
 game.hemi.color.setHex(0xffedcd);game.hemi.groundColor.setHex(0x9e94b7);
 if(root.ATELIER_BACKDROP){const tex=new T.TextureLoader().load(root.ATELIER_BACKDROP);tex.encoding=T.sRGBEncoding;tex.wrapS=T.MirroredRepeatWrapping;tex.repeat.x=3;const panorama=new T.Mesh(new T.CylinderGeometry(460,460,345,96,1,true),new T.MeshBasicMaterial({map:tex,side:T.BackSide,fog:false,depthWrite:false}));panorama.position.y=104;panorama.rotation.y=.45;game.scene.remove(game.sky);game.sky=panorama;game.scene.add(panorama);}
 // Character contact shadows anchor feet even under the diffuse awning.
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,8,64,64,64);gr.addColorStop(0,'rgba(69,49,69,.35)');gr.addColorStop(1,'rgba(69,49,69,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const t=new T.CanvasTexture(c),m=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});game.contact=new T.Mesh(new T.PlaneGeometry(1.25,.8),m);game.contact.rotation.x=-Math.PI/2;game.scene.add(game.contact);}
 // Gentle print grain lives in screen space; paper does not crawl over moving meshes.
 if(typeof document!=='undefined'){const overlay=document.createElement('div');overlay.className='print-grain';overlay.setAttribute('aria-hidden','true');document.getElementById('viewport').append(overlay);}
}
root.JSAtelier={buildHub,apply,texture,tintMaterial,batchStatic};
})(globalThis);
