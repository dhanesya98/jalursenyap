/* Nara, art study v5. Original articulated mesh, +Z forward, feet y=0.
   No external resources. Canvas textures gracefully fall back in Node tests.
   JSNara().userData.animate(seconds, speed, gliding). */
(function(root){
 'use strict';
 const T=root.THREE, P={ink:0x564332,cream:0xe6d5ae,trim:0x9d7953,scarf:0xb65e3c,shirt:0x6d8385,pants:0x766f5c,leather:0x835536,leatherLight:0xa06c41,gold:0xc8a05d,skin:0xc58d60,hair:0x423730};
 const v=(x,y,z)=>new T.Vector3(x,y,z);
 let textures={},mats={},ramp;
 function texture(kind){
  if(textures[kind])return textures[kind];if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#fff8e8';ctx.fillRect(0,0,512,512);
  let seed=397;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<15000;i++){const x=rand()*512,y=rand()*512;ctx.fillStyle=rand()>.5?'rgba(81,55,36,.06)':'rgba(255,255,245,.12)';ctx.fillRect(x,y,rand()*2+1,1);}
  ctx.strokeStyle='rgba(84,57,37,.12)';ctx.lineWidth=.6;
  if(kind==='cloth'){for(let i=0;i<512;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+2,512);ctx.stroke();}for(let i=0;i<512;i+=5){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i+1);ctx.stroke();}
   ctx.strokeStyle='rgba(95,61,37,.65)';ctx.lineWidth=2;for(const y of [468,500]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}ctx.lineWidth=1.3;for(let x=0;x<512;x+=32){ctx.beginPath();ctx.moveTo(x,484);ctx.lineTo(x+16,472);ctx.lineTo(x+32,484);ctx.lineTo(x+16,496);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(x+11,484);ctx.lineTo(x+21,484);ctx.stroke();}}
  else {for(let i=0;i<230;i++){const x=rand()*512,y=rand()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*20,y+rand()*6);ctx.stroke();}ctx.setLineDash([5,4]);ctx.strokeStyle='rgba(247,219,174,.7)';ctx.lineWidth=2;ctx.strokeRect(14,14,484,484);}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;textures[kind]=t;return t;
 }
 function material(color,kind,side){
  if(!ramp){ramp=new T.DataTexture(new Uint8Array([105,105,105,183,183,183,245,245,245]),3,1,T.RGBFormat);ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.needsUpdate=true;}
  const key=color+'-'+kind+'-'+side;if(!mats[key])mats[key]=new T.MeshToonMaterial({color,gradientMap:ramp,map:kind?texture(kind):null,side:side||T.FrontSide});return mats[key];
 }
 function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g;}
 function mesh(parent,geo,color,x=0,y=0,z=0,kind=null){const m=new T.Mesh(geo,typeof color==='number'?material(color,kind):color);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function ell(parent,x,y,z,sx,sy,sz,color){const m=mesh(parent,new T.SphereGeometry(1,16,12),color,x,y,z);m.scale.set(sx,sy,sz);return m;}
 function line(parent,pts,color=P.ink,opacity=.72){const m=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>Array.isArray(p)?v(...p):p)),new T.LineBasicMaterial({color,transparent:true,opacity}));parent.add(m);return m;}
 function tube(parent,pts,r,color){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>v(...p))),16,r,6,false),color);}
 function lathe(parent,pts,color,kind){return mesh(parent,new T.LatheGeometry(pts.map(p=>new T.Vector2(...p)),20),color,0,0,0,kind);}
 function rounded(parent,w,h,d,r,color,x,y,z,kind){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:r*.17,bevelThickness:r*.17,bevelSegments:2,steps:1,curveSegments:4});geo.translate(0,0,-d/2);return mesh(parent,geo,color,x,y,z,kind);}
 function panel(parent,fn,color,kind='cloth',cols=20,rows=18){const geo=new T.PlaneGeometry(1,1,cols,rows),p=geo.attributes.position,u=geo.attributes.uv;for(let i=0;i<p.count;i++){const q=fn(u.getX(i),1-u.getY(i));p.setXYZ(i,...q);}geo.computeVertexNormals();const m=mesh(parent,geo,material(color,kind,T.DoubleSide));m.userData.base=new Float32Array(p.array);m.userData.wave=(time,power)=>{const a=m.userData.base;for(let i=0;i<p.count;i++){const fall=1-u.getY(i);p.setXYZ(i,a[i*3]+Math.sin(time*2.2+fall*3)*power*fall*fall,a[i*3+1],a[i*3+2]+Math.sin(time*2.8+u.getX(i)*5-fall*2)*power*fall);}p.needsUpdate=true;geo.computeVertexNormals();};return m;}
 function nara(){
  const root=group();root.name='Nara — Jubah Pengantar';root.userData.asset='character:nara';const body=group(root);root.userData.body=body;
  // Soft tunic with tailored waist, split hem and rolled sleeves.
  const torso=lathe(body,[[.225,.65],[.255,.71],[.225,.85],[.19,1.08],[.225,1.3],[.16,1.43],[.08,1.48]],P.shirt,'cloth');torso.scale.z=.73;
  line(body,[[-.02,1.42,.12],[.015,1.28,.174],[.035,1.06,.153]],P.ink,.6);
  const belt=lathe(body,[[.213,.91],[.214,.99]],P.leather);belt.scale.z=.77;
  rounded(body,.092,.105,.025,.012,P.gold,-.075,.952,.177);rounded(body,.058,.067,.028,.008,P.leather,-.075,.952,.195);
  function limb(x){const leg=group(body,x,.77,0);const thigh=lathe(leg,[[.10,0],[.115,-.11],[.102,-.27],[.075,-.36]],P.pants,'cloth');thigh.scale.z=.92;const knee=group(leg,0,-.35,0);const boot=lathe(knee,[[.078,-.005],[.084,-.08],[.071,-.23],[.085,-.29]],P.leather,'leather');ell(knee,0,-.343,.06,.098,.065,.157,P.leather);ell(knee,0,-.387,.065,.102,.022,.16,0x594330);const cuff=lathe(knee,[[.093,-.015],[.094,-.07]],P.trim);for(let i=0;i<3;i++)line(knee,[[-.047,-.09-i*.043,.071],[.045,-.11-i*.043,.075]],P.cream,.75);line(leg,[[-.05,-.08,.087],[-.065,-.23,.083],[0,-.32,.065]],P.ink,.4);return {leg,knee};}
  const legs=[limb(-.115),limb(.115)];
  function arm(sign){const a=group(body,sign*.235,1.34,0);ell(a,sign*.014,-.115,0,.105,.20,.108,P.shirt);const fore=group(a,sign*.025,-.27,0);const sleeve=lathe(fore,[[.085,.055],[.082,-.035],[.068,-.12]],P.shirt,'cloth');const cuff=lathe(fore,[[.088,-.075],[.088,-.125]],P.pants);ell(fore,0,-.215,.017,.057,.13,.06,P.skin);ell(fore,0,-.323,.028,.065,.083,.046,P.skin);ell(fore,-sign*.054,-.31,.035,.026,.05,.028,P.skin);line(fore,[[-.035,-.354,.067],[0,-.365,.072],[.035,-.35,.066]],P.ink,.45);return {a,fore};}
  const arms=[arm(-1),arm(1)];
  // Face is sculpted at five-head proportions, with chin, cheeks, eyelids and swept hair.
  const head=group(body,0,1.705,.005);const faceGeo=new T.SphereGeometry(1,24,18);const fp=faceGeo.attributes.position;for(let i=0;i<fp.count;i++){const y=fp.getY(i);fp.setXYZ(i,fp.getX(i)*(.173*(y<-.25?.88:1)),y*.208,fp.getZ(i)*.158+(y<-.5?.012:0));}faceGeo.computeVertexNormals();mesh(head,faceGeo,P.skin);
  for(const s of [-1,1]){ell(head,s*.169,-.015,.012,.036,.055,.026,P.skin);line(head,[[s*.175,.012,.036],[s*.185,-.011,.039],[s*.17,-.035,.034]],P.trim,.6);ell(head,s*.067,.018,.145,.039,.018,.012,0xe8d2ad);ell(head,s*.063,.019,.157,.014,.017,.007,0x382c28);ell(head,s*.059,.025,.164,.004,.005,.002,0xf5e7cd);line(head,[[s*.028,.028,.151],[s*.06,.04,.158],[s*.098,.027,.144]],P.ink,.95);tube(head,[[s*.027,.075,.137],[s*.061,.087,.144],[s*.103,.074,.127]],.008,P.hair);}
  ell(head,0,-.036,.164,.026,.043,.033,P.skin);line(head,[[.01,-.062,.186],[.027,-.065,.169]],P.ink,.7);line(head,[[-.04,-.107,.132],[-.01,-.112,.15],[.025,-.109,.142],[.047,-.103,.13]],P.ink,.75);line(head,[[-.022,-.135,.126],[.014,-.138,.129]],0x956947,.45);
  const hairBase=ell(head,0,.075,-.042,.183,.182,.172,P.hair);
  function lock(points,width,depth,color){const curve=new T.CatmullRomCurve3(points.map(a=>v(...a))),verts=[],idx=[];for(let i=0;i<=10;i++){const t=i/10,c=curve.getPoint(t),tangent=curve.getTangent(t),side=v(-tangent.y,tangent.x,0).normalize(),w=Math.sin(Math.PI*(.08+t*.9))*width*(1-t*.72);for(let j=0;j<8;j++){const a=j/8*Math.PI*2;const q=c.clone().addScaledVector(side,Math.cos(a)*w);q.z+=Math.sin(a)*depth*(1-t*.85);verts.push(q.x,q.y,q.z);if(i&&j<7){const n=i*8+j;idx.push(n-8,n,n+1,n-8,n+1,n-7);}}if(i){const n=i*8;idx.push(n-1,n+7,n,n-1,n,n-8);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();mesh(head,g,color);line(head,Array.from({length:9},(_,i)=>{const p=curve.getPoint(i/8);p.z+=depth*(1-i/8*.85)+.003;return p;}),0x765942,.42);}
  for(let i=0;i<7;i++){const x=-.13+i*.043;lock([[x,.18,.02],[x-.05,.21,.10],[x-.11,.13,.158],[x-.12,.047+(i%3)*.018,.154]],.04,.025,i%3?P.hair:0x514036);}
  for(const s of [-1,1])for(let i=0;i<3;i++)lock([[s*.13,.13-i*.043,-.035],[s*.21,.06-i*.055,.02],[s*.195,-.04-i*.05,.04],[s*.16,-.10-i*.04,.077]],.034,.025,P.hair);
  for(let i=0;i<5;i++){const x=-.12+i*.06;lock([[x,.16,-.07],[x+.02,.12,-.20],[x+.04,-.04,-.20],[x+.04,-.13,-.15]],.055,.028,P.hair);}
  // Curved cape, open at the chest; broad asymmetric hem carries the silhouette.
  const capeGroup=group(body);const capeFn=(u,t)=>{const a=.69+u*(Math.PI*2-1.38),r=.14+.20*Math.sin(Math.min(1,t*3)*Math.PI*.5)+.19*t*t;return [Math.sin(a)*r*(1+.08*Math.sin(a)),1.46-t*(.91+.09*Math.sin(a)),Math.cos(a)*r*.78-.025+Math.sin(u*Math.PI*14)*.025*t];};
  const cape=panel(capeGroup,capeFn,P.cream);
  const capeEdges=[line(capeGroup,Array.from({length:30},(_,i)=>capeFn(i/29,1)),P.ink,.82),line(capeGroup,Array.from({length:20},(_,i)=>capeFn(0,i/19)),P.ink,.7),line(capeGroup,Array.from({length:20},(_,i)=>capeFn(1,i/19)),P.ink,.7)];
  for(const u of [.16,.34,.53,.71,.87])line(capeGroup,Array.from({length:16},(_,i)=>{const t=.22+i/15*.68,q=capeFn(u,t);q[2]-=.002;return q;}),P.trim,.36);
  const shoulder=panel(capeGroup,(u,t)=>{const q=capeFn(u,t*.37);q[0]*=1.04;q[2]*=1.04;return q;},0xeee0bf);
  // Brass clasp pins the two cloth panels. Deliberately one warm focal point.
  const clasp=mesh(body,new T.CylinderGeometry(.05,.05,.018,16),P.gold,-.205,1.385,.175);clasp.rotation.x=Math.PI/2;const cr=mesh(body,new T.TorusGeometry(.036,.004,5,20),P.leather,-.205,1.385,.188);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;line(body,[[-.205+Math.sin(a)*.015,1.385+Math.cos(a)*.015,.19],[-.205+Math.sin(a)*.029,1.385+Math.cos(a)*.029,.19]],P.leather,.7);}
  const scarf=lathe(body,[[.11,1.42],[.21,1.45],[.22,1.51],[.16,1.56],[.095,1.56]],P.scarf,'cloth');scarf.scale.z=.82;
  line(body,[[-.18,1.47,.09],[-.08,1.445,.17],[.06,1.46,.18],[.19,1.49,.08]],0x7c402e,.7);
  const scarfA=panel(body,(u,t)=>[.12+t*.45+Math.sin(t*4)*.06+(u-.5)*(.16-.055*t),1.49-t*.44,-.11-t*.37+Math.sin(t*4)*.065],P.scarf,'cloth',6,18);
  const scarfB=panel(body,(u,t)=>[.04-t*.17+(u-.5)*(.13-.03*t),1.48-t*.63,-.19-t*.15],0x9e5038,'cloth',6,18);
  // Bag rests outside the cloak, not buried behind it. Rounded worn flap and visible letters.
  const bag=group(body,.475,.72,.04);bag.rotation.y=.45;bag.rotation.z=-.08;rounded(bag,.43,.37,.17,.06,P.leather,0,.02,0,'leather');rounded(bag,.45,.20,.028,.06,P.leatherLight,0,.135,.105,'leather');
  for(const x of [-.14,.13])rounded(bag,.032,.22,.018,.008,P.leatherLight,x,-.02,.105);const seal=mesh(bag,new T.CylinderGeometry(.057,.057,.016,20),P.gold,0,.09,.13);seal.rotation.x=Math.PI/2;mesh(bag,new T.TorusGeometry(.043,.0035,5,24),P.leather,0,.09,.141);line(bag,[[-.024,.101,.143],[0,.08,.143],[.025,.101,.143]],P.leather,.9);
  rounded(bag,.12,.17,.02,.008,0xdcc9a1,-.12,.23,-.005).rotation.z=.12;rounded(bag,.13,.12,.02,.005,0xe8d5ad,.01,.21,-.025).rotation.z=-.1;line(bag,[[-.04,.245,-.009],[.01,.21,-.009],[.065,.245,-.009]],P.leather,.6);
  const strap=panel(body,(u,t)=>[-.19+t*.65+(u-.5)*.065,1.39-t*.63,.22+Math.sin(t*Math.PI)*.01],P.leather,'leather',2,12);tube(body,[[-.19,1.39,.22],[-.23,1.47,.01],[-.11,1.37,-.26],[.31,.9,-.31],[.46,.78,-.04]],.025,P.leather);
  const wings=group(body,0,1.42,-.14);wings.visible=false;for(const s of [-1,1]){panel(wings,(u,t)=>[s*u*1.45,-t*(.55+.18*u),u*.18-t*.06+Math.sin(u*Math.PI)*.05],P.cream,'cloth',16,8);tube(wings,[[0,0,0],[s*.7,-.03,.10],[s*1.45,0,.18]],.013,P.leather);line(wings,[[0,-.55,-.06],[s*.7,-.64,.04],[s*1.45,-.73,.12]],P.ink,.8);}
  root.userData.animate=(time,speed=0,gliding=false)=>{const run=Math.min(1,speed/5),s=Math.sin(time*(speed>6?11:8));body.position.y=gliding?0:Math.abs(s)*.025*run+Math.sin(time*1.7)*.006;body.rotation.z=gliding?0:Math.sin(time*.9)*.009*(1-run);legs.forEach((l,i)=>{l.leg.rotation.x=gliding?.25:(i?s:-s)*.62*run;l.knee.rotation.x=Math.max(0,i?-s:s)*.45*run;});arms.forEach((a,i)=>{a.a.rotation.x=gliding?-.8:(i?-s:s)*.38*run;a.a.rotation.z=gliding?(i?.94:-.94):(i?-.10:.10);});capeGroup.visible=!gliding;wings.visible=gliding;cape.userData.wave(time,.015+run*.035);shoulder.userData.wave(time,.008);scarfA.userData.wave(time,.025+run*.05);scarfB.userData.wave(time,.02+run*.04);bag.rotation.z=-.08+s*.035*run;head.rotation.y=Math.sin(time*.55)*.025*(1-run);};
  root.userData.animate(0,0,false);return root;
 }
 root.JSNara=nara;
})(typeof window!=='undefined'?window:globalThis);
