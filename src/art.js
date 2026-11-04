/* Jalur Senyap: original procedural art, Three.js r128, no network dependencies.
 * JSArt.character(id) -> Group. Faces local +Z, feet at y=0, ~1.95 units tall.
 * group.userData.animate(seconds, horizontalSpeed, gliding) drives its rig.
 * JSArt.prop(kind,{length,width,height,color}) -> Group, rooted at y=0.
 * checkpoint / altar: group.userData.setActive(bool).
 * ladder: y=0..length. gate: open central span x=-3..3, pillars x=+-4.
 * Geometry is visual only. World owns collision/interaction and elevations.
 */
(function (global) {
  'use strict';
  const T = global.THREE;
  const palette = {
    ink: 0x493c38, cream: 0xe8dfc1, paper: 0xf3e9d2, sand: 0xd8b787,
    adobe: 0xc49675, terracotta: 0xb86e50, teal: 0x547d82,
    slate: 0x587581, olive: 0x7c8565, moss: 0x6f7a68,
    wood: 0x705648, gold: 0xd4ad69, lantern: 0xf2c46b,
    purple: 0x706474, skin: 0xc69675, dark: 0x3b3435
  };
  let ramp;
  const materials = new Map();
  function init() {
    if (!ramp) {
      ramp = new T.DataTexture(new Uint8Array([90,90,90, 166,166,166, 231,231,231]),3,1,T.RGBFormat);
      ramp.minFilter = ramp.magFilter = T.NearestFilter;
      ramp.needsUpdate = true;
    }
  }
  function mat(color, extra) {
    init();
    if (extra) return new T.MeshToonMaterial(Object.assign({color,gradientMap:ramp},extra));
    const key = String(color);
    if (!materials.has(key)) materials.set(key,new T.MeshToonMaterial({color,gradientMap:ramp}));
    return materials.get(key);
  }
  function mesh(parent,geo,color,x=0,y=0,z=0,outline=false) {
    const m = new T.Mesh(geo,typeof color === 'number' ? mat(color) : color);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
    parent.add(m);
    if(outline) {
      const line = new T.LineSegments(new T.EdgesGeometry(geo,32),new T.LineBasicMaterial({color:palette.ink,transparent:true,opacity:.42}));
      m.add(line);
    }
    return m;
  }
  function ball(p,r,c,x=0,y=0,z=0,sx=1,sy=1,sz=1) {
    const m=mesh(p,new T.SphereGeometry(r,12,8),c,x,y,z);m.scale.set(sx,sy,sz);return m;
  }
  function cyl(p,rt,rb,h,c,x=0,y=0,z=0,n=12,outline=false) {return mesh(p,new T.CylinderGeometry(rt,rb,h,n),c,x,y,z,outline);}
  function box(p,w,h,d,c,x=0,y=0,z=0,outline=false) {return mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z,outline);}
  function ring(p,r,t,c,x=0,y=0,z=0) {return mesh(p,new T.TorusGeometry(r,t,6,24),c,x,y,z);}
  function group(p,x=0,y=0,z=0) {const g=new T.Group();g.position.set(x,y,z);if(p)p.add(g);return g;}
  function beam(p,a,b,r,c) {
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);
    const m=cyl(p,r,r,d.length(),c);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
  }
  function lathe(p,points,c,x=0,y=0,z=0) {return mesh(p,new T.LatheGeometry(points.map(a=>new T.Vector2(...a)),16),c,x,y,z);}
  function inkLoop(p,points,color=palette.ink) {
    const g=new T.BufferGeometry().setFromPoints(points.map(a=>new T.Vector3(...a)));
    const l=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity:.6}));p.add(l);return l;
  }
  function cloth(p,w,h,color,x=0,y=0,z=0) {
    const geo=new T.PlaneGeometry(w,h,6,8),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const px=pos.getX(i),py=pos.getY(i),t=(h*.5-py)/h;
      pos.setXYZ(i,px*(.75+.25*t),py,Math.sin(px*8)*.018*t+t*t*.1);
    }
    geo.computeVertexNormals();
    const m=mesh(p,geo,mat(color,{side:T.DoubleSide}),x,y,z);
    m.userData.base=new Float32Array(pos.array);m.userData.wave=(t,amp=.03)=>{
      const base=m.userData.base;
      for(let i=0;i<pos.count;i++){const u=(h*.5-base[i*3+1])/h;pos.setZ(i,base[i*3+2]+Math.sin(t*3+base[i*3]*4-u*3)*amp*u);}
      pos.needsUpdate=true;
    };return m;
  }
  function face(p,skin,old=false) {
    const h=group(p,0,1.73,.015);
    ball(h,.205,skin,0,0,0,.91,1.09,.88);
    ball(h,.042,skin,-.187,-.015,0,.6,1,.7);ball(h,.042,skin,.187,-.015,0,.6,1,.7);
    for(const x of [-.075,.075]){
      ball(h,.023,palette.dark,x,.023,.164,1,.62,.45);
      const brow=box(h,.065,.012,.012,palette.ink,x,.069,.162);brow.rotation.z=x>0?-.10:.10;
      if(old)inkLoop(h,[[x-.025,-.026,.169],[x,-.033,.173],[x+.026,-.023,.168]]);
    }
    ball(h,.035,skin,0,-.029,.185,.66,1,.85);
    inkLoop(h,[[-.044,-.095,.16],[0,-.106,.171],[.043,-.095,.16]]);
    return h;
  }
  function handArm(parent,x,color,skin=palette.skin) {
    const g=group(parent,x,1.41,0);
    cyl(g,.086,.066,.36,color,0,-.14,0,10);
    const fore=group(g,0,-.34,0);
    cyl(fore,.065,.048,.28,color,0,-.11,0,10);
    ball(fore,.066,skin,0,-.28,.015,.8,1.13,.8);
    g.userData.fore=fore;return g;
  }
  function leg(parent,x,color) {
    const g=group(parent,x,.74,0);
    cyl(g,.092,.075,.34,color,0,-.16,0,10);
    const knee=group(g,0,-.32,0);
    cyl(knee,.074,.059,.29,color,0,-.125,0,10);
    ball(knee,.1,palette.wood,0,-.29,.075,.95,.7,1.65);
    const wrap=cyl(knee,.08,.078,.08,palette.cream,0,-.18,0,10);
    g.userData.knee=knee;return g;
  }
  function bag() {
    const g=group();g.name='Tas Pengantar';
    const b=box(g,.44,.39,.19,palette.wood,0,.22,0,true);
    const flap=box(g,.46,.15,.024,palette.terracotta,0,.35,.11);flap.rotation.x=-.12;
    const seal=mesh(g,new T.CylinderGeometry(.065,.065,.015,10),palette.gold,0,.285,.132);seal.rotation.x=Math.PI/2;
    box(g,.035,.19,.023,palette.gold,-.14,.24,.115);box(g,.035,.19,.023,palette.gold,.14,.24,.115);
    ring(g,.21,.014,palette.wood,0,.59,0).scale.y=.65;
    g.userData.asset='bag';return g;
  }
  function nara() {
    const root=group();root.name='Nara';
    const body=group(root);root.userData.body=body;
    const leftLeg=leg(body,-.13,palette.slate),rightLeg=leg(body,.13,palette.slate);
    const torso=lathe(body,[[.24,.68],[.28,.77],[.20,1.06],[.26,1.34],[.16,1.5]],palette.cream);torso.scale.z=.72;
    cyl(body,.218,.22,.075,palette.wood,0,1.03,0,12).scale.z=.75;
    const head=face(body,palette.skin);
    ball(head,.202,palette.dark,0,.092,-.035,1,.74,1);
    for(let i=0;i<5;i++){const hair=mesh(head,new T.ConeGeometry(.06,.16,5),palette.dark,-.15+i*.07,.13,.115);hair.rotation.z=(i-2)*-.2;hair.rotation.x=.5;}
    const scarf=ring(body,.19,.065,palette.terracotta,0,1.5,0);scarf.rotation.x=Math.PI/2;scarf.scale.set(1.2,1,.75);
    const scarfTail=cloth(body,.19,.62,palette.terracotta,.25,1.15,-.20);scarfTail.rotation.z=-.22;
    const armL=handArm(body,-.27,palette.cream),armR=handArm(body,.27,palette.cream);
    const satchel=bag();satchel.position.set(.29,.61,-.025);satchel.scale.setScalar(.95);body.add(satchel);
    const strap=beam(body,[-.19,1.46,.18],[.29,.79,.19],.026,palette.wood);
    const cape=cloth(body,.82,1.02,palette.cream,0,.99,-.225);cape.rotation.x=-.13;
    const border=cloth(body,.82,.07,palette.terracotta,0,.52,-.28);border.rotation.x=-.13;
    const wingGroup=group(body,0,1.42,-.14);wingGroup.visible=false;
    const wingPos=new Float32Array([0,0,0, -1.6,-.08,.35, -1.17,-.7,.08, 0,-.5,-.12, 0,0,0, 1.6,-.08,.35, 1.17,-.7,.08, 0,-.5,-.12]);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(wingPos,3));geo.setIndex([0,1,2,0,2,3,4,7,6,4,6,5]);geo.computeVertexNormals();
    mesh(wingGroup,geo,mat(palette.cream,{side:T.DoubleSide}));
    for(const sign of [-1,1]){
      beam(wingGroup,[0,0,0],[sign*1.6,-.08,.35],.018,palette.wood);
      beam(wingGroup,[0,0,0],[sign*1.17,-.7,.08],.012,palette.gold);
      beam(wingGroup,[sign*1.6,-.08,.35],[sign*1.17,-.7,.08],.022,palette.terracotta);
    }
    root.userData.animate=(time,speed=0,gliding=false)=>{
      const run=Math.min(1,speed/5),s=Math.sin(time*(speed>6?11:8));
      body.position.y=gliding?0:Math.abs(s)*.035*run+Math.sin(time*2)*.008;
      leftLeg.rotation.x=gliding?.26:s*.65*run;rightLeg.rotation.x=gliding?.4:-s*.65*run;
      leftLeg.userData.knee.rotation.x=Math.max(0,-s)*.6*run;rightLeg.userData.knee.rotation.x=Math.max(0,s)*.6*run;
      armL.rotation.x=gliding?-.8:-s*.45*run;armR.rotation.x=gliding?-.8:s*.45*run;
      armL.rotation.z=gliding?-.92:.10;armR.rotation.z=gliding?.92:-.1;
      wingGroup.visible=gliding;cape.visible=!gliding;border.visible=!gliding;
      cape.userData.wave(time,.025+run*.06);border.userData.wave(time,.025+run*.06);
      scarfTail.userData.wave(time,.05+run*.08);
      wingGroup.rotation.x=gliding?.14+Math.sin(time*3)*.02:0;
    };
    root.userData.asset='character:nara';return root;
  }
  function ruru() {
    const root=group();root.name='Ruru';const body=group(root);
    ball(body,.24,palette.cream,0,.34,0,.8,1,1.36);
    const head=group(body,0,.48,.27);ball(head,.18,palette.sand,0,0,0,1.05,.95,1);
    ball(head,.09,palette.paper,0,-.04,.145,.75,.65,1.2);
    ball(head,.026,palette.dark,0,-.016,.225,1,.7,.6);
    for(const s of [-1,1]){
      ball(head,.025,palette.dark,s*.096,.025,.135,.8,1,.6);
      const ear=mesh(head,new T.ConeGeometry(.105,.38,7),palette.sand,s*.105,.23,-.018);ear.rotation.z=s*-.16;ear.scale.z=.46;
      const inner=mesh(head,new T.ConeGeometry(.065,.27,6),palette.terracotta,s*.105,.235,.018);inner.rotation.z=s*-.16;inner.scale.z=.15;
    }
    const legs=[];for(const x of [-.13,.13])for(const z of [-.18,.19]){const l=group(body,x,.29,z);cyl(l,.037,.03,.22,palette.sand,0,-.1,0,8);ball(l,.045,palette.wood,0,-.22,.025,1,.6,1.35);legs.push(l);}
    const tail=group(body,0,.34,-.27);tail.rotation.x=-.45;
    const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(0,.1,-.23),new T.Vector3(.04,.32,-.4),new T.Vector3(.08,.48,-.34)]);
    mesh(tail,new T.TubeGeometry(curve,10,.075,7,false),palette.sand);
    ball(tail,.085,mat(palette.lantern,{emissive:palette.lantern,emissiveIntensity:.65}),.08,.49,-.34);
    const pouch=box(body,.13,.16,.17,palette.terracotta,.17,.39,-.02);pouch.rotation.z=.1;
    root.userData.animate=(time,speed=0)=>{const run=Math.min(1,speed/4);body.position.y=Math.abs(Math.sin(time*9))*.025*run;legs.forEach((l,i)=>l.rotation.x=Math.sin(time*11+i*Math.PI*.5)*.55*run);tail.rotation.y=Math.sin(time*2.8)*.28;head.rotation.z=Math.sin(time*1.3)*.06;};
    root.userData.asset='character:ruru';return root;
  }
  function npc(id) {
    const configs={maren:[palette.terracotta,palette.slate],juma:[palette.olive,palette.sand],bulamat:[palette.teal,palette.terracotta],kesa:[palette.purple,palette.dark],pedagang:[palette.adobe,palette.cream]};
    const [robe,accent]=configs[id]||configs.pedagang;
    const root=group();root.name=id;const body=group(root);
    const robeMesh=lathe(body,[[.35,.09],[.39,.2],[.34,.55],[.23,.95],[.26,1.3],[.18,1.5]],robe);robeMesh.scale.z=.74;
    const hem=ring(body,.35,.023,accent,0,.17,0);hem.rotation.x=Math.PI/2;hem.scale.y=.75;
    cyl(body,.24,.24,.12,accent,0,.96,0).scale.z=.76;
    for(const s of [-1,1])ball(body,.085,palette.wood,s*.16,.055,.075,1,.62,1.5);
    const head=face(body,id==='bulamat'?0xc38d6d:palette.skin,id!=='kesa');
    const arms=[handArm(body,-.28,robe),handArm(body,.28,robe)];
    const shawl=lathe(body,[[.25,1.15],[.31,1.34],[.24,1.48],[.13,1.53]],accent);shawl.scale.z=.8;
    if(id==='juma'||id==='pedagang'){
      const brim=cyl(head,id==='juma'?.37:.45,id==='juma'?.37:.45,.034,accent,0,.17,0,16,true);
      brim.rotation.z=id==='juma'?.08:0;
      cyl(head,.17,.21,.21,id==='juma'?palette.wood:palette.sand,0,.27,0,12);
      ring(head,.197,.022,robe,0,.205,0).rotation.x=Math.PI/2;
      if(id==='juma'){
        ball(head,.14,palette.cream,0,-.15,.04,.9,.52,.82);
        const scope=cyl(arms[1].userData.fore,.043,.061,.43,palette.gold,0,-.22,.16);scope.rotation.x=Math.PI/2;
        ring(scope,.055,.012,palette.wood,0,-.21,0).rotation.x=Math.PI/2;
      }else{
        const pack=bag();pack.position.set(0,.66,-.35);pack.scale.setScalar(1.35);body.add(pack);
        cyl(body,.12,.12,.63,palette.teal,0,1.3,-.35).rotation.z=Math.PI/2;
      }
    } else if(id==='kesa'){
      cyl(head,.14,.205,.30,palette.purple,0,.24,0,8,true);
      const badge=mesh(head,new T.OctahedronGeometry(.055),palette.gold,0,.27,.19);
      const cloak=cloth(body,.85,1.3,palette.purple,0,.86,-.27);cloak.rotation.x=-.13;
      beam(body,[.48,.1,.2],[.48,1.88,.2],.027,palette.wood);ring(body,.09,.024,palette.gold,.48,1.92,.2);
      const seal=prop('letter');seal.scale.setScalar(.45);seal.position.set(-.33,.89,.25);body.add(seal);
    } else {
      const hood=ball(head,.225,accent,0,.08,-.045,1,.83,1);
      const wrap=ring(head,.195,.036,accent,0,.08,.015);wrap.rotation.x=Math.PI*.47;
      if(id==='bulamat'){
        const shell=prop('shell');shell.scale.setScalar(.35);shell.position.set(.26,.88,.32);body.add(shell);
        const veil=cloth(body,.24,.7,accent,-.23,1.2,.02);veil.rotation.z=-.2;
      }else{
        for(let i=0;i<3;i++)ball(body,.025,palette.gold,-.12+i*.12,1.37,.23);
        beam(body,[-.45,.05,.2],[-.45,1.85,.2],.025,palette.wood);
        ring(body,.08,.018,palette.gold,-.45,1.89,.2);
      }
    }
    root.userData.animate=(time,speed=0)=>{
      body.position.y=Math.sin(time*1.7)*.013;
      arms[0].rotation.z=.12+Math.sin(time*1.3)*.025;arms[1].rotation.z=-.12-Math.sin(time*1.2)*.025;
      arms[0].rotation.x=-.15;arms[1].rotation.x=id==='bulamat'?-.45:-.15;
      head.rotation.y=Math.sin(time*.47)*.06;
    };
    root.userData.asset='character:'+id;return root;
  }
  function dome(opts={}) {
    const g=group(),r=opts.radius||3,h=opts.height||3.5,points=[];
    for(let i=0;i<=18;i++){const t=i/18;points.push([Math.max(.015,r*Math.sin(t*Math.PI)*(.87+.15*Math.sin(t*Math.PI*1.5))),t*h]);}
    lathe(g,points,opts.color||palette.teal);
    const finial=cyl(g,.018,.055,.65,palette.gold,0,h+.22,0,8);
    ball(g,.075,palette.gold,0,h+.58,0);
    for(let a=0;a<8;a++){
      const theta=a*Math.PI/4;
      const pts=points.map(([rad,y])=>[Math.cos(theta)*rad*1.003,y,Math.sin(theta)*rad*1.003]);
      inkLoop(g,pts,palette.gold);
    }
    return g;
  }
  function lantern(opts={}) {
    const g=group();const h=opts.height||1.4;
    cyl(g,.035,.05,h,palette.wood,0,h/2,0,8);
    const hang=group(g,.22,h,0);beam(g,[0,h,0],[.22,h,0],.024,palette.wood);
    ring(hang,.08,.014,palette.gold,0,-.07,0);
    const glass=mat(palette.lantern,{emissive:palette.lantern,emissiveIntensity:.8});
    ball(hang,.15,glass,0,-.3,0,.75,1.3,.75);
    cyl(hang,.14,.11,.06,palette.gold,0,-.15,0,8);cyl(hang,.11,.14,.06,palette.gold,0,-.46,0,8);
    for(let a=0;a<4;a++){const angle=a*Math.PI/2;beam(hang,[Math.cos(angle)*.11,-.17,Math.sin(angle)*.11],[Math.cos(angle)*.11,-.44,Math.sin(angle)*.11],.008,palette.wood);}
    g.userData.animate=t=>{hang.rotation.z=Math.sin(t*1.3)*.035;};return g;
  }
  function checkpoint() {
    const g=group();cyl(g,.7,.9,.25,palette.adobe,0,.125,0,8,true);
    cyl(g,.24,.42,1.8,palette.adobe,0,1.1,0,6,true);
    const crystal=mesh(g,new T.OctahedronGeometry(.3),mat(palette.teal,{emissive:palette.teal,emissiveIntensity:.2}),0,2.25,0);
    const halo=ring(g,.44,.017,palette.gold,0,2.25,0);halo.rotation.x=.5;
    g.userData.setActive=on=>{crystal.material.color.setHex(on?palette.lantern:palette.teal);crystal.material.emissive.setHex(on?palette.lantern:palette.teal);crystal.material.emissiveIntensity=on?.7:.2;};
    g.userData.animate=t=>{crystal.rotation.y=t*.7;halo.rotation.y=-t*.3;};return g;
  }
  function grapple() {
    const g=group();cyl(g,.17,.27,.45,palette.wood,0,.225,0,8,true);
    const gold=mat(palette.lantern,{emissive:palette.lantern,emissiveIntensity:.35});
    ring(g,.46,.065,gold,0,.88,0);ring(g,.31,.016,palette.wood,0,.88,0);
    for(const s of [-1,1])beam(g,[s*.18,.4,0],[s*.35,.6,0],.035,palette.gold);
    const pennant=cloth(g,.17,.55,palette.terracotta,.52,.51,0);
    g.userData.animate=t=>{pennant.userData.wave(t,.04);};return g;
  }
  function ladder(opts={}) {
    const g=group(),h=opts.length||6,w=opts.width||1.15;
    beam(g,[-w/2,0,0],[-w/2,h,0],.035,palette.wood);beam(g,[w/2,0,0],[w/2,h,0],.035,palette.wood);
    for(let y=.2;y<h;y+=.36){const rung=cyl(g,.035,.035,w+.12,palette.cream,0,y,0,8);rung.rotation.z=Math.PI/2;}
    for(const x of [-w/2,w/2]){ring(g,.08,.025,palette.gold,x,h,0);box(g,.18,.07,.25,palette.wood,x,h,.08);}
    return g;
  }
  function tower(opts={}) {
    const g=group(),h=opts.height||14,r=opts.radius||3;
    cyl(g,r*.84,r,h,palette.adobe,0,h/2,0,12,true);
    cyl(g,r*1.14,r*1.05,.35,palette.cream,0,h-.5,0,12,true);
    for(let i=0;i<10;i++){const a=i*Math.PI/5;box(g,.16,1.05,.16,palette.wood,Math.cos(a)*r*1.02,h+.1,Math.sin(a)*r*1.02);}
    const cap=dome({radius:r*.93,height:r*1.05});cap.position.y=h+.65;g.add(cap);
    for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
      const niche=group(g,Math.sin(angle)*(r*.86+.012),h*.7,Math.cos(angle)*(r*.86+.012));niche.rotation.y=angle;
      box(niche,.65,1.6,.03,palette.wood);mesh(niche,new T.CircleGeometry(.325,12,0,Math.PI),palette.wood,0,.8,.025);
      const blind=cloth(niche,.6,.7,palette.terracotta,0,.35,.05);blind.rotation.x=.13;
    }
    return g;
  }
  function gate() {
    const g=group();for(const x of [-4,4]){cyl(g,1.1,1.35,6.2,palette.adobe,x,3.1,0,8,true);cyl(g,1.32,1.28,.3,palette.cream,x,6.1,0,8,true);const d=dome({radius:1.2,height:1.7});d.position.set(x,6.25,0);g.add(d);}
    const arch=mesh(g,new T.TorusGeometry(3.9,.42,8,24,Math.PI),palette.adobe,0,3.1,0,true);
    const trim=mesh(g,new T.TorusGeometry(3.4,.06,6,24,Math.PI),palette.teal,0,3.1,.42);
    for(const s of [-1,1]){const banner=cloth(g,.7,2,palette.terracotta,s*3.95,4.45,.9);const beamObj=beam(g,[s*4-.5,5.55,.9],[s*4+.5,5.55,.9],.035,palette.wood);}
    return g;
  }
  function palm(opts={}) {
    const g=group(),h=opts.height||6.5;
    const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.22,h*.4,0),new T.Vector3(.65,h*.8,.15),new T.Vector3(.4,h,.2)]);
    mesh(g,new T.TubeGeometry(curve,12,.16,8,false),palette.wood);
    const crown=group(g,.4,h,.2);
    for(let i=0;i<9;i++){
      const leaf=group(crown);leaf.rotation.y=i*Math.PI*2/9;
      const geo=new T.PlaneGeometry(.65,2.7,2,8);geo.translate(0,1.35,0);
      const p=geo.attributes.position;
      for(let k=0;k<p.count;k++){const t=p.getY(k)/2.7;p.setX(k,p.getX(k)*Math.sin(t*Math.PI));p.setZ(k,-t*t*1.8);}
      geo.computeVertexNormals();const m=mesh(leaf,geo,mat(palette.olive,{side:T.DoubleSide}));m.rotation.x=1.1;
    }
    return g;
  }
  function caravan(opts={}) {
    const g=group(),w=opts.width||6,h=opts.height||4,d=opts.depth||6;
    box(g,w+.4,.25,d+.4,palette.cream,0,.125,0,true);
    box(g,w,h,.45,palette.adobe,0,h/2,-d/2,true);
    for(const s of [-1,1])box(g,.45,h,d,palette.adobe,s*w/2,h/2,0,true);
    for(const s of [-1,1])box(g,w*.28,h,.45,palette.adobe,s*w*.36,h/2,d/2,true);
    box(g,w,.55,.45,palette.adobe,0,h-.25,d/2,true);
    box(g,w+.4,.28,d+.4,palette.cream,0,h,0,true);
    const cap=dome({radius:w*.41,height:w*.39});cap.position.y=h+.1;g.add(cap);
    const canopy=mesh(g,new T.PlaneGeometry(w*.9,3.5,8,5),mat(palette.terracotta,{side:T.DoubleSide}),0,3,d/2+1.3);canopy.rotation.x=-Math.PI/2;
    const p=canopy.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,-.22*(1-(x/(w*.45))**2));}canopy.geometry.computeVertexNormals();
    for(const s of [-1,1])beam(g,[s*w*.45,0,d/2+2.8],[s*w*.45,3,d/2+2.8],.055,palette.wood);
    const carpet=box(g,2.2,.025,3,palette.teal,0,.265,2.0);inkLoop(g,[[-1,.282,.55],[-1,.282,3.4],[1,.282,3.4],[1,.282,.55],[-1,.282,.55]],palette.gold);
    const jar=lathe(g,[[.02,0],[.3,.1],[.38,.5],[.18,.8],[.17,.96]],palette.terracotta,w*.37,.25,d*.45);
    const lamp=lantern({height:1.1});lamp.position.set(-w*.35,.25,d*.45);g.add(lamp);
    return g;
  }
  function altar() {
    const g=group();cyl(g,1.3,1.55,.35,palette.moss,0,.175,0,8,true);cyl(g,.72,.95,.8,palette.moss,0,.75,0,8,true);
    ring(g,.84,.025,palette.gold,0,1.15,0).rotation.x=Math.PI/2;
    const core=mesh(g,new T.OctahedronGeometry(.4),mat(palette.teal,{emissive:palette.teal,emissiveIntensity:.2}),0,1.85,0);
    const orbit=ring(g,.7,.025,palette.gold,0,1.85,0);orbit.rotation.x=.35;
    const slot=box(g,.42,.045,.035,palette.dark,0,.99,.81);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;box(g,.07,.27,.04,palette.gold,Math.sin(a)*.73,.78,Math.cos(a)*.73).rotation.y=a;}
    g.userData.setActive=on=>{core.material.color.setHex(on?palette.lantern:palette.teal);core.material.emissive.setHex(on?palette.lantern:palette.teal);core.material.emissiveIntensity=on?1.2:.2;g.userData.active=on;};
    g.userData.animate=t=>{core.rotation.y=t*.4;core.position.y=1.85+Math.sin(t*1.5)*.08;orbit.rotation.z=t*.2;};return g;
  }
  function ruin(opts={}) {
    const g=group(),h=opts.height||12;
    const m=cyl(g,1.1,2.2,h,palette.moss,0,h/2,0,7,true);m.rotation.z=.04;
    for(const y of [h*.2,h*.45,h*.7]){
      inkLoop(g,[[-.5,y,1.7],[-.2,y+.3,1.8],[.12,y+.12,1.8],[.45,y+.5,1.7]],palette.ink);
    }
    const halo=ring(g,2.1,.18,palette.gold,0,h*.8,0);halo.rotation.x=.8;
    const smaller=ring(g,1.4,.12,palette.moss,0,h*.92,0);smaller.rotation.y=.7;
    return g;
  }
  function prop(kind,opts={}) {
    const factory={lantern,checkpoint,grapple,ladder,gate,tower,dome,palm,caravan,altar,ruin,bag};
    let g;
    if(factory[kind])g=factory[kind](opts);
    else {
      g=group();
      if(kind==='bread'){
        ball(g,.32,palette.sand,0,.18,0,1.5,.63,1);for(let i=-1;i<=1;i++)inkLoop(g,[[i*.17-.045,.34,-.15],[i*.17+.03,.385,0],[i*.17+.07,.34,.15]],palette.terracotta);
        const wrap=box(g,.55,.025,.48,palette.cream,0,.025,0);beam(g,[-.3,.22,0],[.3,.22,0],.012,palette.wood);
      }else if(kind==='shell'){
        const shell=mesh(g,new T.SphereGeometry(.28,18,10,0,Math.PI*2,0,Math.PI*.62),palette.paper,0,.06,0);shell.scale.set(1.1,.7,1);shell.rotation.x=-.8;
        for(let i=-3;i<=3;i++){const a=i*.2;inkLoop(g,[[0,.07,.1],[Math.sin(a)*.16,.18,0],[Math.sin(a)*.3,.24,-.2]],palette.teal);}
        ball(g,.045,palette.gold,0,.1,.23);
      }else if(kind==='letter'){
        box(g,.45,.018,.31,palette.paper,0,.025,0,true);inkLoop(g,[[-.22,.036,-.15],[0,.04,.07],[.22,.036,-.15]],palette.wood);
        cyl(g,.055,.055,.018,palette.terracotta,0,.047,.04,12);ring(g,.033,.006,palette.gold,0,.059,.04).rotation.x=Math.PI/2;
      }else if(kind==='sign'){
        cyl(g,.045,.065,1.65,palette.wood,0,.825,0,8);box(g,1.15,.38,.08,palette.cream,0,1.44,0,true);
        inkLoop(g,[[-.35,1.45,.045],[.32,1.45,.045],[.15,1.59,.045]],palette.wood);
        inkLoop(g,[[.32,1.45,.045],[.15,1.31,.045]],palette.wood);
        ring(g,.13,.018,palette.gold,0,.94,0);
      }else if(kind==='rock'){
        const r=opts.radius||1;const m=mesh(g,new T.DodecahedronGeometry(r,0),opts.color||palette.adobe,0,r*.55,0,true);m.scale.set(1,.65,.8);
      }else throw new Error('Unknown art prop: '+kind);
    }
    g.name=kind;g.userData.asset='prop:'+kind;return g;
  }
  function character(id) {return id==='nara'?(global.JSNara?global.JSNara():nara()):id==='ruru'?ruru():npc(id);}
  global.JSArt={init,character,prop,palette,get gradient(){init();return ramp;}};
})(window);
