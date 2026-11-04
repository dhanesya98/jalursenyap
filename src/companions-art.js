/* Visual study 02: articulated Maren and Ruru. Original local geometry. */
(function(root){
'use strict';
const T=root.THREE,P={ink:0x59473c,skin:0xc4916d,cream:0xe8d6b0,clay:0xad6248,blue:0x607b82,wood:0x76533b,gold:0xd5ae69,fur:0xe6d2a8,inner:0xc89278};
const cache=new Map();
function mat(c,cloth=false){const k=c+':'+cloth;if(!cache.has(k))cache.set(k,new T.MeshToonMaterial({color:c,gradientMap:JSArt.gradient,map:cloth?(root.JSAtelier?.texture('linen')??null):null,side:cloth?T.DoubleSide:T.FrontSide}));return cache.get(k);}
function group(p,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);p?.add(g);return g;}
function mesh(p,geo,c,x=0,y=0,z=0,cloth=false){const m=new T.Mesh(geo,typeof c==='number'?mat(c,cloth):c);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
function ell(p,x,y,z,a,b,c,color){const m=mesh(p,new T.SphereGeometry(1,16,10),color,x,y,z);m.scale.set(a,b,c);return m;}
function line(p,pts,c=P.ink,opacity=.65){const l=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(v=>new T.Vector3(...v))),new T.LineBasicMaterial({color:c,transparent:true,opacity}));p.add(l);return l;}
function tube(p,pts,r,c){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v))),12,r,6,false),c);}
function sleeve(p,x){const arm=group(p,x,1.34,0);const upper=mesh(arm,new T.CylinderGeometry(.105,.085,.35,12),P.clay,0,-.14,0,true);const fore=group(arm,0,-.32,0);mesh(fore,new T.CylinderGeometry(.085,.065,.26,12),P.clay,0,-.11,0,true);mesh(fore,new T.CylinderGeometry(.074,.074,.07,12),P.blue,0,-.22,0,true);ell(fore,0,-.29,.015,.06,.08,.045,P.skin);return {arm,fore};}
function maren(){
 const g=group();g.name='Maren';g.userData.asset='character:maren';const body=group(g);
 const geo=new T.LatheGeometry([[.29,.10],[.36,.18],[.34,.52],[.25,.95],[.27,1.28],[.18,1.48]].map(p=>new T.Vector2(...p)),32);
 const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i)),fold=Math.sin(a*10)*.018*Math.max(0,1-y/1.3);p.setXYZ(i,p.getX(i)+Math.cos(a)*fold,y,p.getZ(i)*.77+Math.sin(a)*fold);}geo.computeVertexNormals();mesh(body,geo,P.clay,0,0,0,true);
 for(const s of [-1,1])ell(body,s*.145,.06,.075,.105,.065,.17,P.wood);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;line(body,[[Math.cos(a)*.335,.2,Math.sin(a)*.26],[Math.cos(a)*.32,.48,Math.sin(a)*.25],[Math.cos(a)*.25,.91,Math.sin(a)*.19]],0x7d5547,.38);}
 const belt=mesh(body,new T.CylinderGeometry(.255,.26,.10,24),P.wood,0,.96,0);belt.scale.z=.78;mesh(body,new T.TorusGeometry(.047,.012,6,16),P.gold,-.09,.96,.215);
 const arms=[sleeve(body,-.27),sleeve(body,.27)];
 // Draped shoulder shawl: deep diagonal ends instead of a rigid collar.
 const vertices=[],uv=[],indices=[];for(let j=0;j<=8;j++)for(let i=0;i<=32;i++){const u=i/32,v=j/8,a=.28+u*(Math.PI*2-.56),r=.16+Math.sin(v*Math.PI*.75)*.18,y=1.5-v*(.33+.32*Math.pow(Math.sin(a*.5),2));vertices.push(Math.sin(a)*r,y,Math.cos(a)*r*.76);uv.push(u,v);if(i<32&&j<8){const n=j*33+i;indices.push(n,n+1,n+33,n+1,n+34,n+33);}}
 const shawl=new T.BufferGeometry();shawl.setAttribute('position',new T.Float32BufferAttribute(vertices,3));shawl.setAttribute('uv',new T.Float32BufferAttribute(uv,2));shawl.setIndex(indices);shawl.computeVertexNormals();mesh(body,shawl,P.blue,0,0,0,true);line(body,vertices.slice(-99).reduce((a,_,i,arr)=>{if(i%3===0)a.push(arr.slice(i,i+3));return a;},[]),P.cream,.8);
 ell(body,.14,1.38,.19,.04,.04,.018,P.gold);
 const head=group(body,0,1.68,.015);ell(head,0,0,0,.175,.215,.16,P.skin);ell(head,0,.075,-.065,.209,.207,.184,P.blue);
 for(const s of [-1,1]){ell(head,s*.17,-.025,.005,.035,.05,.03,P.skin);ell(head,s*.19,-.08,.015,.015,.025,.012,P.gold);ell(head,s*.066,.018,.15,.025,.012,.009,0xe6ceb0);ell(head,s*.065,.019,.158,.012,.013,.006,P.ink);line(head,[[s*.035,.055,.155],[s*.067,.067,.153],[s*.099,.056,.143]],0x756a60,.9);line(head,[[s*.035,-.016,.16],[s*.068,-.023,.16],[s*.103,-.008,.143]],P.ink,.36);line(head,[[s*.10,.005,.145],[s*.125,-.005,.13]],P.ink,.35);}
 ell(head,0,-.035,.16,.026,.042,.035,P.skin);line(head,[[-.048,-.101,.14],[-.01,-.112,.16],[.027,-.109,.151],[.05,-.098,.132]],P.ink,.7);
 tube(head,[[-.19,.02,.06],[-.17,.14,.10],[-.04,.24,.025],[.12,.20,-.01],[.20,.07,.01]],.026,P.blue);
 for(let i=0;i<5;i++)line(head,[[-.13+i*.025,.15,.11],[-.11+i*.02,.09,.15],[-.1+i*.02,.065,.15]],0xb3b0a1,.7);
 // A parcel in her arms makes her role legible even before dialogue.
 const parcel=group(body,-.13,1.04,.32);parcel.rotation.set(.22,0,-.12);mesh(parcel,new T.BoxGeometry(.31,.28,.065),P.cream);for(const x of [-.08,.07])mesh(parcel,new T.BoxGeometry(.013,.285,.073),P.wood,x,0,0);mesh(parcel,new T.BoxGeometry(.315,.014,.074),P.wood,0,.025,0);const seal=mesh(parcel,new T.CylinderGeometry(.031,.031,.015,12),P.clay,.02,.025,.045);seal.rotation.x=Math.PI/2;
 arms[0].arm.rotation.x=-.65;arms[0].fore.rotation.x=-.55;arms[0].arm.rotation.z=-.18;
 const staff=tube(body,[[.43,.03,.12],[.43,1.35,.12],[.48,1.75,.12]],.022,P.wood);mesh(body,new T.TorusGeometry(.075,.013,6,20),P.gold,.48,1.8,.12);
 g.userData.animate=t=>{body.position.y=Math.sin(t*1.4)*.008;head.rotation.y=Math.sin(t*.35)*.035;head.rotation.z=Math.sin(t*.48)*.015;arms[1].arm.rotation.x=-.12+Math.sin(t)*.018;arms[1].arm.rotation.z=-.12;};g.userData.animate(0);return g;
}
function ruru(){
 const g=group();g.name='Ruru';g.userData.asset='character:ruru';const body=group(g);
 ell(body,0,.31,-.04,.21,.245,.32,P.fur);ell(body,0,.32,.17,.18,.21,.19,P.cream);
 const head=group(body,0,.48,.24);ell(head,0,0,0,.185,.168,.17,P.fur);
 for(const s of [-1,1]){ell(head,s*.13,-.05,.08,.10,.075,.09,P.cream);ell(head,s*.075,.026,.143,.028,.033,.014,P.ink);ell(head,s*.069,.038,.157,.008,.01,.004,0xffefcd);line(head,[[s*.05,.071,.144],[s*.09,.082,.137],[s*.117,.06,.126]],0xa28c69,.6);
  const ear=group(head,s*.12,.115,-.02);ear.rotation.z=-s*.2;const outer=new T.Shape();outer.moveTo(-.07,0);outer.bezierCurveTo(-.12,.18,-.06,.38,.015,.46);outer.bezierCurveTo(.10,.29,.12,.11,.07,0);outer.closePath();mesh(ear,new T.ExtrudeGeometry(outer,{depth:.045,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.018,bevelThickness:.018,curveSegments:10}),P.fur,0,0,-.025);const inner=new T.Shape();inner.moveTo(-.038,.045);inner.quadraticCurveTo(-.065,.23,.014,.385);inner.quadraticCurveTo(.075,.17,.038,.045);inner.closePath();mesh(ear,new T.ShapeGeometry(inner,14),P.inner,0,0,.045);
  for(let i=0;i<3;i++)line(head,[[s*(.14+i*.008),-.04-i*.015,.13],[s*(.23+i*.01),-.05-i*.012,.12]],0x9d8869,.55);
 }
 ell(head,0,-.055,.145,.095,.06,.10,P.cream);ell(head,0,-.03,.23,.029,.02,.018,P.ink);line(head,[[0,-.045,.239],[0,-.075,.225],[.028,-.083,.213]],P.ink,.65);
 const legs=[];for(const x of [-.13,.13])for(const z of [-.2,.18]){const l=group(body,x,.28,z);ell(l,0,-.08,0,.045,.11,.045,P.fur);ell(l,0,-.22,.025,.055,.045,.08,P.wood);legs.push(l);}
 // A broad fox tail curls upward, tapering naturally toward its warm lantern.
 const tail=group(body,0,.28,-.27),curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.05,.03,-.24),new T.Vector3(.15,.20,-.48),new T.Vector3(.16,.49,-.43),new T.Vector3(.09,.61,-.25)]),verts=[],idx=[];
 for(let i=0;i<=24;i++){const t=i/24,c=curve.getPoint(t),tangent=curve.getTangent(t),side=new T.Vector3(1,0,0).cross(tangent).normalize(),up=tangent.clone().cross(side).normalize(),r=.045+Math.sin(t*Math.PI)*.105;for(let j=0;j<=12;j++){const a=j/12*Math.PI*2,v=c.clone().addScaledVector(side,Math.cos(a)*r).addScaledVector(up,Math.sin(a)*r);verts.push(v.x,v.y,v.z);if(i<24&&j<12){const n=i*13+j;idx.push(n,n+1,n+13,n+1,n+14,n+13);}}}
 const fur=new T.BufferGeometry();fur.setAttribute('position',new T.Float32BufferAttribute(verts,3));fur.setIndex(idx);fur.computeVertexNormals();mesh(tail,fur,P.fur);
 const lamp=group(tail,.09,.51,-.25);mesh(lamp,new T.TorusGeometry(.045,.009,5,14),P.gold,0,.08,0);const glow=new T.MeshToonMaterial({color:0xf2c46b,emissive:0xf2c46b,emissiveIntensity:.45,gradientMap:JSArt.gradient});ell(lamp,0,-.025,0,.054,.075,.054,glow);for(const y of [-.09,.04])mesh(lamp,new T.CylinderGeometry(.058,.058,.018,8),P.wood,0,y,0);for(const s of [-1,1])tube(lamp,[[s*.04,-.08,.035],[s*.04,.04,.035]],.005,P.gold);
 g.userData.animate=(t,speed=0)=>{const run=Math.min(1,speed/4);body.position.y=Math.abs(Math.sin(t*9))*.025*run;legs.forEach((l,i)=>l.rotation.x=Math.sin(t*11+i*Math.PI*.5)*.5*run);tail.rotation.y=Math.sin(t*2)*.17;head.rotation.z=Math.sin(t*1.2)*.045;lamp.rotation.x=Math.sin(t*2)*.08;};g.userData.animate(0);return g;
}
const original=JSArt.character;JSArt.character=id=>id==='maren'?maren():id==='ruru'?ruru():original(id);
})(globalThis);
