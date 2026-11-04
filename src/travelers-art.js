/* Jalur Senyap — travelers of the three-delivery demo.
 * Original local geometry. +Z faces forward; feet y=0; five-head proportions.
 * Load after art.js and atelier.js (companions-art.js may precede or follow).
 * Materials deliberately remain raw sRGB for Game.correctColors().
 */
(function(root){
'use strict';
const T=root.THREE,A=root.JSArt;
const P={ink:0x57483e,cream:0xe7d5af,linen:0xd7bd8d,skin:0xc28d66,
  leather:0x79563f,gold:0xc9a461,blue:0x667e85,teal:0x527f7e,
  orange:0xc57c4d,purple:0x76677e,olive:0x7f8063,hair:0x50453b};
const materials=new Map(),inks=new Map();
const v=(x,y,z)=>new T.Vector3(x,y,z);
function mat(color,cloth=false){
  const key=color+':'+cloth;
  if(!materials.has(key))materials.set(key,new T.MeshToonMaterial({
    color,gradientMap:A.gradient,map:cloth?(root.JSAtelier?.texture('linen')??null):null,
    side:cloth?T.DoubleSide:T.FrontSide
  }));
  return materials.get(key);
}
function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g;}
function mesh(parent,geometry,color,x=0,y=0,z=0,cloth=false){
  const m=new T.Mesh(geometry,typeof color==='number'?mat(color,cloth):color);
  m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
}
function ell(parent,x,y,z,sx,sy,sz,color){const m=mesh(parent,new T.SphereGeometry(1,20,12),color,x,y,z);m.scale.set(sx,sy,sz);return m;}
function line(parent,points,color=P.ink,opacity=.65){
  const key=color+':'+opacity;
  if(!inks.has(key))inks.set(key,new T.LineBasicMaterial({color,transparent:true,opacity}));
  const l=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>Array.isArray(p)?v(...p):p)),inks.get(key));parent.add(l);return l;
}
function tube(parent,points,r,color){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>v(...p))),16,r,6,false),color);}
function lathe(parent,points,color,cloth=false,depth=1,fold=0){
  const geo=new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),28),a=geo.attributes.position;
  if(depth!==1||fold){for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i),angle=Math.atan2(z,x);
    const f=Math.sin(angle*11+y*1.8)*fold;
    a.setXYZ(i,x+Math.cos(angle)*f,y,(z+Math.sin(angle)*f)*depth);
  }geo.computeVertexNormals();}
  return mesh(parent,geo,color,0,0,0,cloth);
}
function panel(parent,fn,color,cols=24,rows=14){
  const geo=new T.PlaneGeometry(1,1,cols,rows),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)p.setXYZ(i,...fn(uv.getX(i),1-uv.getY(i)));
  geo.computeVertexNormals();return mesh(parent,geo,color,0,0,0,true);
}
function rounded(parent,w,h,d,r,color,x,y,z,cloth=false){
  const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);
  s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);
  s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
  s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);
  s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:2,steps:1,curveSegments:5});
  geo.translate(0,0,-d/2);return mesh(parent,geo,color,x,y,z,cloth);
}
function disc(parent,r,depth,color,x,y,z){const m=mesh(parent,new T.CylinderGeometry(r,r,depth,24),color,x,y,z);m.rotation.x=Math.PI/2;return m;}

function face(parent,skin,hair,old=false,stern=false){
  const head=group(parent,0,1.665,.015),geo=new T.SphereGeometry(1,24,18),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const y=p.getY(i),taper=y<-.2?1+(y+.2)*.16:1;
    p.setXYZ(i,p.getX(i)*.174*taper,y*.205,p.getZ(i)*.158+(y<-.4?.009:0));
  }
  geo.computeVertexNormals();mesh(head,geo,skin);
  ell(head,0,.072,-.052,.184,.173,.161,hair);
  for(const sign of [-1,1]){
    ell(head,sign*.168,-.018,.004,.033,.051,.028,skin);
    line(head,[[sign*.173,.001,.032],[sign*.185,-.014,.033],[sign*.171,-.037,.03]],P.ink,.4);
    ell(head,sign*.067,.018,.145,.031,.014,.011,0xe9d4b2);
    ell(head,sign*.065,.018,.155,.012,.014,.006,0x42392f);
    ell(head,sign*.060,.024,.161,.0035,.004,.002,0xffebcd);
    line(head,[[sign*.031,.033,.152],[sign*.066,.038,.156],[sign*.100,.025,.142]],P.ink,.9);
    line(head,[[sign*.029,stern?.065:.073,.139],[sign*.061,.081,.147],[sign*.103,stern?.094:.072,.127]],hair,.95);
    ell(head,sign*.158,.025,-.014,.031,.086,.065,hair);
    if(old){
      line(head,[[sign*.034,-.009,.157],[sign*.071,-.022,.158],[sign*.103,-.010,.141]],P.ink,.35);
      line(head,[[sign*.108,.011,.135],[sign*.130,-.004,.119]],P.ink,.35);
      line(head,[[sign*.045,-.050,.148],[sign*.071,-.083,.143]],P.ink,.3);
    }
  }
  ell(head,0,-.036,.166,.026,.044,.033,skin);
  line(head,[[.009,-.063,.183],[.027,-.067,.166]],P.ink,.5);
  line(head,[[-.044,-.101,.132],[-.013,-.111,.149],[.023,-.107,.141],[.047,stern?-.107:-.098,.126]],P.ink,.75);
  line(head,[[-.019,-.137,.123],[.020,-.139,.123]],P.ink,.3);
  return head;
}
function arm(parent,sign,color,skin,cuff){
  const upper=group(parent,sign*.248,1.34,0);
  lathe(upper,[[.045,.055],[.096,.02],[.103,-.09],[.084,-.25],[.073,-.28]],color,true,1,.004);
  const fore=group(upper,sign*.012,-.27,0);
  lathe(fore,[[.074,.015],[.080,-.065],[.065,-.19],[.057,-.23]],color,true,1,.003);
  lathe(fore,[[.069,-.177],[.071,-.215],[.063,-.237]],cuff,true);
  ell(fore,0,-.278,.015,.060,.075,.046,skin);
  ell(fore,-sign*.050,-.267,.035,.024,.044,.025,skin);
  line(fore,[[-.032,-.304,.056],[0,-.318,.059],[.032,-.304,.055]],P.ink,.35);
  line(upper,[[sign*.065,-.05,.069],[sign*.075,-.15,.061],[sign*.042,-.24,.068]],P.ink,.32);
  return {upper,fore};
}
function leg(parent,x,color){
  const upper=group(parent,x,.72,0);
  lathe(upper,[[.085,.025],[.108,-.08],[.090,-.22],[.073,-.33]],color,true,.93,.003);
  const knee=group(upper,0,-.32,0);
  lathe(knee,[[.074,.01],[.077,-.08],[.066,-.23],[.081,-.31]],P.leather,false,.96);
  lathe(knee,[[.084,-.015],[.086,-.067]],P.linen,true);
  ell(knee,0,-.347,.057,.098,.053,.154,P.leather);
  ell(knee,0,-.386,.060,.103,.014,.159,0x55483b);
  for(let i=0;i<3;i++)line(knee,[[-.041,-.100-i*.044,.066],[.040,-.117-i*.044,.070]],P.cream,.62);
  return {upper,knee};
}
function base(id,options){
  const g=group();g.name=options.name;g.userData.asset='character:'+id;
  const body=group(g),long=options.long;
  lathe(body,long?[[.29,.14],[.32,.21],[.31,.51],[.245,.92],[.253,1.28],[.175,1.45],[.08,1.49]]:
    [[.24,.62],[.265,.70],[.232,.88],[.207,1.05],[.246,1.28],[.17,1.44],[.08,1.49]],options.coat,true,.76,.012);
  for(const sign of [-1,1])line(body,[[sign*.13,long?.21:.69,.205],[sign*.145,.80,.175],[sign*.117,1.06,.160]],P.ink,.35);
  const belt=lathe(body,[[.217,.94],[.222,1.015]],P.leather,false,.79);
  rounded(body,.079,.086,.021,.012,P.gold,-.06,.977,.182);
  rounded(body,.045,.053,.024,.006,P.leather,-.06,.977,.197);
  mesh(body,new T.CylinderGeometry(.075,.08,.14,16),options.skin,0,1.48,0);
  const legs=[leg(body,-.117,options.pants),leg(body,.117,options.pants)];
  const arms=[arm(body,-1,options.coat,options.skin,options.trim),arm(body,1,options.coat,options.skin,options.trim)];
  const head=face(body,options.skin,options.hair,options.old,options.stern);
  return {g,body,head,legs,arms,belt};
}
function shawl(parent,color,length,width=.42,open=.48){
  const g=group(parent),fn=(u,t)=>{
    const a=open+u*(Math.PI*2-open*2),r=.13+Math.sin(t*Math.PI*.5)*width;
    return [Math.sin(a)*r,1.495-t*(length+.12*Math.sin(a*.5)),Math.cos(a)*r*.77-.015+Math.sin(a*11)*.014*t];
  };
  panel(g,fn,color);
  line(g,Array.from({length:49},(_,i)=>fn(i/48,1)),P.cream,.7);
  for(const u of [0,1])line(g,Array.from({length:18},(_,i)=>fn(u,i/17)),P.ink,.65);
  for(const u of [.17,.36,.58,.79])line(g,Array.from({length:12},(_,i)=>fn(u,.22+i*.065)),P.ink,.27);
  return g;
}
function animate(rig,poses,cloth=[],extra){
  rig.g.userData.body=rig.body;
  rig.g.userData.animate=(time,speed=0,gliding=false)=>{
    const t=Number.isFinite(time)?time:0,run=gliding?0:Math.min(1,Math.max(0,Number.isFinite(speed)?speed/5:0));
    const step=Math.sin(t*7),breath=Math.sin(t*1.45);
    rig.body.position.y=(1-Math.cos(t*1.45))*.0025+run*.025;
    rig.head.rotation.y=Math.sin(t*.39)*.035*(1-run);
    rig.head.rotation.z=Math.sin(t*.58)*.012;
    rig.legs.forEach((leg,i)=>{leg.upper.rotation.x=(i?step:-step)*.27*run;leg.knee.rotation.x=Math.max(0,i?-step:step)*.17*run;});
    rig.arms.forEach((arm,i)=>{
      arm.upper.rotation.set(poses[i][0]+breath*.012+(i?-step:step)*.05*run,0,poses[i][1]);
      arm.fore.rotation.x=poses[i][2]+Math.sin(t*1.1+i)*.009;
    });
    cloth.forEach((g,i)=>{g.rotation.y=Math.sin(t*.85+i)*.008;g.rotation.x=Math.sin(t*1.1+i)*.004;});
    extra?.(t,run);
  };
  rig.g.userData.animate(0,0,false);return rig.g;
}

function juma(){
  const r=base('juma',{name:'Juma — Penjaga Menara',coat:P.blue,pants:0x82755f,trim:P.cream,skin:0xba875f,hair:0xaaa18b,old:true});
  // A broad, worn sun hat: curved brim, collapsed crown and a faded woven band.
  const hat=group(r.head,0,.162,-.015);hat.rotation.z=-.045;
  const brim=lathe(hat,[[.17,.025],[.26,.008],[.40,-.017],[.50,-.037],[.51,-.022]],P.linen,true,.86);
  const b=brim.geometry.attributes.position;
  for(let i=0;i<b.count;i++){const x=b.getX(i),z=b.getZ(i);b.setY(i,b.getY(i)+Math.sin(Math.atan2(z,x)*3)*.017*Math.hypot(x,z));}brim.geometry.computeVertexNormals();
  lathe(hat,[[.21,.006],[.205,.085],[.159,.155],[.055,.168],[0,.162]],0xcfb282,true,.90);
  lathe(hat,[[.207,.033],[.202,.069]],P.blue,true,.91);
  for(const radius of [.28,.35,.42,.50])line(hat,Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return [Math.sin(a)*radius,.009-(radius-.26)*.13+Math.sin(a*3)*.009,Math.cos(a)*radius*.86];}),P.leather,.25);
  rounded(hat,.080,.045,.015,.009,P.cream,.105,.052,.161,true).rotation.z=.15;
  for(const sign of [-1,1])ell(r.head,sign*.035,-.085,.159,.043,.022,.024,0xaaa18b);
  const beard=ell(r.head,0,-.142,.098,.092,.061,.055,0xaaa18b);beard.rotation.x=.15;
  for(const x of [-.04,0,.04])line(r.head,[[x,-.116,.146],[x*.8,-.17,.132]],0x756f61,.4);
  line(r.head,[[-.19,.13,.01],[-.17,-.13,.06],[0,-.215,.11],[.17,-.13,.06],[.19,.13,.01]],P.leather,.65);
  const scarf=shawl(r.body,0xd1ba8f,.28,.20,.65);
  // The brass telescope rests in the right hand, across the body.
  const scope=group(r.arms[1].fore,-.14,-.278,.025);scope.rotation.z=Math.PI/2;
  mesh(scope,new T.CylinderGeometry(.053,.059,.47,20),P.leather);
  for(const y of [-.235,-.09,.09,.235])mesh(scope,new T.CylinderGeometry(.063,.063,.025,20),P.gold,0,y,0);
  mesh(scope,new T.CylinderGeometry(.048,.048,.006,20),0x53696c,0,-.251,0);
  line(scope,[[-.034,-.255,-.02],[.026,-.255,.029]],P.cream,.5);
  tube(r.body,[[.19,1.40,-.08],[.30,1.20,.04],[.31,.90,.19],[.12,.85,.28]],.009,P.leather);
  return animate(r,[[-.10,.10,-.14],[-.62,-.08,-1.04]],[scarf]);
}

function bulamat(){
  const r=base('bulamat',{name:'Bu Lamat — Telaga Sumi',coat:P.teal,pants:P.teal,trim:0xd4b78a,skin:0xb98260,hair:0xb4aaa0,old:true,long:true});
  const wrap=group(r.head,0,.045,-.038);
  const cap=ell(wrap,0,.035,-.024,.200,.181,.177,P.teal);
  tube(wrap,[[-.18,.015,.045],[-.14,.16,.085],[-.02,.19,.10],[.14,.125,.09],[.18,.025,.025]],.025,0x77968a);
  ell(wrap,-.14,-.10,-.105,.078,.077,.055,P.teal);
  for(let i=0;i<4;i++)line(r.head,[[-.08+i*.037,.145,.085],[-.09+i*.036,.10,.134],[-.1+i*.033,.078,.141]],0xd8cbb5,.65);
  const orange=shawl(r.body,P.orange,.49,.30,.44);
  const tail=group(r.body);
  const end=(u,t)=>[-.22+t*.06+(u-.5)*(.18+.08*t),1.39-t*.67,.23+t*.07+Math.sin(t*5)*.017];
  panel(tail,end,P.orange,8,16);
  for(const t of [.86,.93])line(tail,Array.from({length:13},(_,i)=>end(i/12,t)),P.cream,.75);
  for(let i=0;i<7;i++){const q=end(i/6,1);line(tail,[q,[q[0]-.01,q[1]-.045,q[2]+.005]],P.cream,.7);}
  for(const sign of [-1,1]){disc(r.head,.020,.009,P.gold,sign*.177,-.073,.028);ell(r.head,sign*.177,-.105,.028,.012,.020,.012,P.cream);}
  disc(r.body,.036,.014,P.gold,-.19,1.39,.213);
  // Sculpted fan shell, cupped close to the heart; its ribs are sparse ink strokes.
  const shell=group(r.body,-.035,1.165,.365);shell.rotation.set(-.12,0,-.10);
  const shellFn=(u,t)=>{const a=.10+u*(Math.PI-.20),radius=.21*t*(1+.035*Math.cos(u*Math.PI*14));return [Math.cos(a)*radius,-.095+Math.sin(a)*radius,.025+Math.sin(t*Math.PI)*.045+Math.sin(u*Math.PI*14)*.003*t];};
  panel(shell,shellFn,P.cream,28,12);
  line(shell,Array.from({length:36},(_,i)=>shellFn(i/35,1)),P.orange,.7);
  for(let i=1;i<8;i++)line(shell,Array.from({length:12},(_,j)=>{const q=shellFn(i/8,j/11);q[2]+=.002;return q;}),P.orange,.52);
  ell(shell,0,-.093,.025,.038,.027,.022,P.linen);
  return animate(r,[[-.57,.23,-.98],[-.55,-.24,-.99]],[orange,tail],t=>{shell.rotation.z=-.10+Math.sin(t*1.45)*.007;});
}

function kesa(){
  const r=base('kesa',{name:'Kesa — Petugas Dewan Tol',coat:0x626b6b,pants:0x69635c,trim:0xb8a78a,skin:0xbd8c6e,hair:0x4b4341,stern:true});
  // Swept short hair leaves the eyes and reserved expression unobscured.
  for(let i=0;i<4;i++){
    const lock=ell(r.head,-.095+i*.049,.134,.077,.042,.072,.068,i===0?0x6b5b50:0x4b4341);lock.rotation.z=-.38;
    line(r.head,[[-.105+i*.049,.180,.074],[-.119+i*.049,.137,.123],[-.114+i*.049,.093,.125]],0x8a7561,.28);
  }
  const mantle=shawl(r.body,P.purple,.77,.27,.62);
  const shoulder=shawl(r.body,0x8b7b8d,.23,.23,.58);
  // One civic seal, with an engraved arch; its size makes the office readable.
  disc(r.body,.064,.023,P.gold,-.104,1.345,.214);
  disc(r.body,.047,.025,0x8d6553,-.104,1.345,.222);
  mesh(r.body,new T.TorusGeometry(.052,.004,5,24),P.cream,-.104,1.345,.240);
  line(r.body,[[-.132,1.322,.239],[-.132,1.351,.239],[-.104,1.372,.239],[-.076,1.351,.239],[-.076,1.322,.239]],P.cream,.9);
  line(r.body,[[-.139,1.320,.239],[-.069,1.320,.239]],P.cream,.8);
  tube(r.body,[[-.14,1.46,.12],[-.10,1.38,.21],[.09,1.38,.19],[.16,1.46,.09]],.008,P.gold);
  const ledger=group(r.arms[0].fore,0,-.205,.087);ledger.rotation.set(-.13,0,.06);
  rounded(ledger,.19,.27,.045,.015,0xb89a72,0,0,0);
  rounded(ledger,.17,.25,.022,.009,P.cream,0,0,.031);
  rounded(ledger,.045,.28,.020,.007,P.purple,-.065,0,.052,true);
  for(let i=0;i<3;i++)line(ledger,[[-.025,.073-i*.029,.044],[.065,.073-i*.029,.044]],P.ink,.45);
  disc(ledger,.028,.012,0x9e5844,.028,-.063,.05);
  return animate(r,[[-.27,.055,-.30],[-.07,-.09,-.06]],[mantle,shoulder]);
}

function pedagang(){
  const r=base('pedagang',{name:'Pedagang — Pengelana Jalur',coat:P.olive,pants:0x856f57,trim:0xb99c6c,skin:0xab7754,hair:0x564536,old:true});
  // Conical woven hat differs from Juma's broad, nearly flat lookout hat.
  const hat=group(r.head,0,.147,-.014);hat.rotation.z=.035;
  lathe(hat,[[.355,-.028],[.36,-.012],[.30,.033],[.21,.10],[.09,.17],[.018,.19],[0,.184]],P.linen,true,.91);
  for(const radius of [.12,.20,.28,.35])line(hat,Array.from({length:41},(_,i)=>{const a=i/40*Math.PI*2;return [Math.sin(a)*radius,.198-radius*.58,Math.cos(a)*radius*.91];}),P.leather,.4);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;line(hat,[[Math.sin(a)*.09,.151,Math.cos(a)*.09*.91],[Math.sin(a+.05)*.23,.063,Math.cos(a+.05)*.23*.91],[Math.sin(a)*.352,-.006,Math.cos(a)*.352*.91]],P.leather,.3);}
  lathe(hat,[[.27,.043],[.245,.063]],0x987a50,true,.92);
  const neck=lathe(r.body,[[.09,1.43],[.17,1.46],[.18,1.52],[.11,1.55]],0xb28a5f,true,.86);
  const scarf=group(r.body);
  const fn=(u,t)=>[.10-t*.16+(u-.5)*.16,1.48-t*.50,.20+.028*Math.sin(t*4)];
  panel(scarf,fn,0xb28a5f,8,14);
  for(const t of [.75,.86,.94])line(scarf,Array.from({length:10},(_,i)=>fn(i/9,t)),P.cream,.6);
  // A softened textile pack with external bindings, blanket and a side flask.
  const pack=group(r.body,0,1.08,-.352);pack.rotation.x=-.05;
  rounded(pack,.56,.68,.29,.075,0x9d8661,0,0,0,true);
  rounded(pack,.55,.26,.028,.055,P.olive,0,.24,-.166,true);
  rounded(pack,.28,.22,.055,.025,0xb18c61,.06,-.13,-.171,true);
  for(const x of [-.185,.185]){
    rounded(pack,.048,.64,.018,.012,P.leather,x,-.01,-.171);
    rounded(pack,.072,.088,.025,.010,P.gold,x,.10,-.186);
    tube(r.body,[[x*1.1,.86,-.21],[x*1.28,1.24,.16],[x*1.17,1.46,.09],[x*1.25,1.44,-.25]],.022,P.leather);
  }
  for(let i=0;i<4;i++)line(pack,[[-.22,-.27+i*.08,-.161],[.23,-.27+i*.08,-.161]],P.cream,.34);
  for(let i=-2;i<=2;i++)line(pack,[[i*.048-.022,-.16,-.205],[i*.048,-.13,-.209],[i*.048+.022,-.16,-.205]],P.cream,.65);
  const roll=group(pack,0,.40,-.01);roll.rotation.z=Math.PI/2;
  const rollMesh=mesh(roll,new T.CylinderGeometry(.105,.108,.65,24),P.blue,0,0,0,true);
  for(const y of [-.22,.22])mesh(roll,new T.CylinderGeometry(.112,.112,.035,20),P.leather,0,y,0);
  for(const sign of [-1,1])line(roll,Array.from({length:48},(_,i)=>{const a=i/47*Math.PI*4,rad=.013+i/47*.08;return [Math.cos(a)*rad,sign*.327,Math.sin(a)*rad];}),P.cream,.6);
  const flask=group(pack,.335,-.07,.005);flask.rotation.z=-.15;
  ell(flask,0,-.055,0,.092,.14,.073,0xa66d4f);
  mesh(flask,new T.CylinderGeometry(.036,.042,.07,12),P.leather,0,.086,0);
  tube(pack,[[.25,.24,.03],[.35,.16,.015],[.35,-.07,.02]],.009,P.leather);
  return animate(r,[[-.13,.08,-.18],[-.40,-.10,-.48]],[scarf],t=>{pack.rotation.z=Math.sin(t*.8)*.007;});
}

const original=A.character;
const travelers={juma,bulamat,kesa,pedagang};
A.character=function(id){return Object.prototype.hasOwnProperty.call(travelers,id)?travelers[id]():original.call(this,id);};
})(typeof window!=='undefined'?window:globalThis);
