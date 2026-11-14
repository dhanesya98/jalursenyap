/* Pixel campaign rules. DOM-free; shared story order, stable objective IDs and versioned saves.
   Design references: gamedev-skills level-design, dialogue-systems, save-systems, puzzle. */
(function(root) {
  'use strict';
  const D=root.BAB0_DATA, S=root.STORY;
  const order=S.order || [...Array(20).keys(),21,20];
  const objectives=order.flatMap(seqIndex=>S.steps[seqIndex].items.map((itemLabel,itemIndex)=>{
    const st=S.steps[seqIndex],id=`cp-${seqIndex}-${itemIndex}`;
    return {id,seqIndex,itemIndex,itemLabel,chapter:seqIndex<12?0:1,seqTitle:st.title,
      type:st.type,scene:st.scene,last:itemIndex===st.items.length-1,note:st.note,
      reward:itemIndex===st.items.length-1?st.reward:null,...D.STEP_TARGETS[id]};
  })).map((o,index)=>({...o,index}));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const PREFIX='jalur_senyap_pixel_v4', LEGACY='jalur_senyap_complete_pixel_v3';
  const initial=()=>({version:4,completed:[],foundFlags:{},mapId:'nilasar',
    player:{x:640,y:590,dir:'up',walkTime:0,moving:false,targetX:null,targetY:null,z:0,vz:0},
    discovered:['nilasar'],rumors:[],poiSeen:[],introSeen:false,dialogue:null,backlog:[],seenLines:[],
    cargo:100,elapsed:0,settings:{volume:.55,music:.7,effects:.55,reducedMotion:false,textScale:1,puzzleMode:'logic'},
    lastSafe:{mapId:'nilasar',x:640,y:590}});
  const current=s=>objectives[s.completed.length]||null;
  const done=(s,id)=>s.completed.includes(id);
  function complete(s,id) {
    const o=current(s);if(!o||o.id!==id)return false;
    s.completed.push(id);s.foundFlags[id]=true;s.dialogue=null;
    if(o.last&&!s.rumors.includes(o.note))s.rumors.push(o.note);
    return true;
  }
  const hasRing=s=>done(s,'cp-7-2'),bound=s=>done(s,'cp-9-0');
  function access(s,map) {
    if(map==='simpul')return hasRing(s)&&done(s,'cp-8-0');
    if(map==='sela')return done(s,'cp-11-2');
    if(map==='balkut')return done(s,'cp-14-2');
    if(map==='salkara')return done(s,'cp-18-2');
    return !!D.MAPS[map];
  }
  function gateHint(map) {return ({simpul:'Temukan cincin dan temui Kesa untuk membuka jalur menara.',sela:'Laporkan perjalanan kepada Marsiyah dan siapkan rute timur.',balkut:'Periksa jalur dan daftar pelintas di kanal terlebih dahulu.',salkara:'Amankan ketiga tambatan untuk menurunkan jembatan Balkut.'})[map]||'Jalur belum terbuka.';}
  const rect=(r,x,y)=>x>=r[0]*12.8&&x<=r[2]*12.8&&y>=r[1]*7.2&&y<=r[3]*7.2;
  // The same native-pixel ground mask serves manual motion, paths, spawns and saves.
  const WIDTH=1280, HEIGHT=720, collisionCache=new Map();
  function paintPolygon(mask,poly,value) {
    const lo=Math.max(0,Math.ceil(Math.min(...poly.map(p=>p[1])))),hi=Math.min(HEIGHT-1,Math.floor(Math.max(...poly.map(p=>p[1]))));
    for(let y=lo;y<=hi;y++) {
      const hits=[];
      for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
        const a=poly[j],b=poly[i];
        if((a[1]>y)!==(b[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      hits.sort((a,b)=>a-b);
      for(let i=0;i+1<hits.length;i+=2)mask.fill(value,y*WIDTH+Math.max(0,Math.ceil(hits[i])),y*WIDTH+Math.min(WIDTH,Math.floor(hits[i+1])+1));
    }
  }
  function collision(map) {
    if(collisionCache.has(map))return collisionCache.get(map);
    const m=D.MAPS[map],ground=new Uint8Array(WIDTH*HEIGHT),solid=new Uint8Array(WIDTH*HEIGHT);
    for(const p of m.walkPolygons)paintPolygon(ground,p,1);
    for(const p of m.blockPolygons){paintPolygon(ground,p,0);paintPolygon(solid,p,1);}
    // Minkowski clearance for Nara's 7 x 4 px elliptical foot, including its interior.
    const clear=new Uint8Array(ground),prefix=new Uint16Array(WIDTH+1);
    for(let y=0;y<HEIGHT;y++) {
      prefix[0]=0;for(let x=0;x<WIDTH;x++)prefix[x+1]=prefix[x]+(ground[y*WIDTH+x]?0:1);
      for(let dy=-4;dy<=4;dy++) {
        const cy=y-dy;if(cy<0||cy>=HEIGHT)continue;
        const rx=Math.floor(7*Math.sqrt(1-dy*dy/16));
        for(let x=0;x<WIDTH;x++)if(x<rx||x+rx>=WIDTH||prefix[x+rx+1]!==prefix[x-rx])clear[cy*WIDTH+x]=0;
      }
    }
    clear.fill(0,0,WIDTH*4);clear.fill(0,WIDTH*(HEIGHT-4));
    const gate=new Uint8Array(WIDTH*HEIGHT);
    if(map==='balkut')paintPolygon(gate,[[855,226],[886,213],[911,266],[869,288]],1);
    const edges=[];
    for(const poly of [...m.walkPolygons,...m.blockPolygons])for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const a=poly[j],b=poly[i],ex=b[0]-a[0],ey=b[1]-a[1],length=Math.hypot(ex,ey);
      if(length)edges.push({a,b,ex,ey,length,minx:Math.min(a[0],b[0])-12,maxx:Math.max(a[0],b[0])+12,miny:Math.min(a[1],b[1])-12,maxy:Math.max(a[1],b[1])+12});
    }
    const data={ground,solid,clear,gate,edges};collisionCache.set(map,data);return data;
  }
  function walkable(map,x,y,s) {
    if(!D.MAPS[map]||!Number.isFinite(x)||!Number.isFinite(y)||x<7||x>=WIDTH-7||y<4||y>=HEIGHT-4)return false;
    const c=collision(map),ix=Math.round(x),iy=Math.round(y);
    if(!c.clear[iy*WIDTH+ix])return false;
    if(map==='balkut'&&s&&!done(s,'cp-18-2')) {
      // No arrival or old save may appear on the far side of the closed bridge.
      if(x>874)return false;
      for(let dy=-4;dy<=4;dy++)for(let dx=-7;dx<=7;dx++)if(c.gate[(iy+dy)*WIDTH+ix+dx])return false;
    }
    return true;
  }
  function segmentClear(map,a,b,s) {
    if(!walkable(map,...a,s)||!walkable(map,...b,s))return false;
    let x=Math.round(a[0]),y=Math.round(a[1]);const bx=Math.round(b[0]),by=Math.round(b[1]);
    const dx=b[0]-a[0],dy=b[1]-a[1],sx=Math.sign(dx),sy=Math.sign(dy);
    let tx=dx?(x+sx*.5-a[0])/dx:Infinity,ty=dy?(y+sy*.5-a[1])/dy:Infinity;
    const stepx=dx?1/Math.abs(dx):Infinity,stepy=dy?1/Math.abs(dy):Infinity;
    // Supercover DDA checks every crossed pixel; uniform samples missed tiny corner
    // intersections, so a planned diagonal could fail when executed in smaller steps.
    while(x!==bx||y!==by){
      if(x===bx)tx=Infinity;if(y===by)ty=Infinity;
      if(Math.abs(tx-ty)<1e-10){if(!walkable(map,x+sx,y,s)||!walkable(map,x,y+sy,s))return false;x+=sx;y+=sy;tx+=stepx;ty+=stepy;}
      else if(tx<ty){x+=sx;tx+=stepx;}else{y+=sy;ty+=stepy;}
      if(!walkable(map,x,y,s))return false;
    }
    return true;
  }
  function movePoint(map,x,y,dx,dy,s) {
    if(!walkable(map,x,y,s))return [x,y];
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2));dx/=steps;dy/=steps;
    for(let i=0;i<steps;i++) {
      if(segmentClear(map,[x,y],[x+dx,y+dy],s)){x+=dx;y+=dy;}
      else {
        const slide=slideAlongContour(map,x,y,dx,dy,s);
        if(slide){x=slide[0];y=slide[1];}
        else {if(segmentClear(map,[x,y],[x+dx,y],s))x+=dx;if(segmentClear(map,[x,y],[x,y+dy],s))y+=dy;}
      }
    }
    return [x,y];
  }
  // Project input onto the real edge, not raster X/Y axes. This lets W/S follow
  // sloped stairs and rails without staircase-shaped sticking or wall climbing.
  function slideAlongContour(map,x,y,dx,dy,s) {
    const geometry=collision(map),ground=geometry.ground,candidates=[];
    const open=(x,y)=>x>=0&&x<WIDTH&&y>=0&&y<HEIGHT&&ground[Math.round(y)*WIDTH+Math.round(x)];
    for(const edge of geometry.edges){
      if(x<edge.minx||x>edge.maxx||y<edge.miny||y>edge.maxy)continue;
      const {a,ex,ey,length}=edge;
      const t=clamp(((x-a[0])*ex+(y-a[1])*ey)/(length*length),0,1),qx=a[0]+ex*t,qy=a[1]+ey*t,dist=Math.hypot(x-qx,y-qy);
      if(dist>12)continue;
      let nx=-ey/length,ny=ex/length;
      const plus=open(qx+nx*3,qy+ny*3),minus=open(qx-nx*3,qy-ny*3);
      if(!!plus===!!minus)continue; // Internal seams between overlapping surfaces are not walls.
      if(plus){nx=-nx;ny=-ny;}
      const inward=dx*nx+dy*ny;if(inward<=0)continue;
      const sx=dx-inward*nx,sy=dy-inward*ny;
      if(sx*dx+sy*dy<.00001)continue;
      if(segmentClear(map,[x,y],[x+sx,y+sy],s))candidates.push({dist,x:x+sx,y:y+sy});
      else {
        // A subpixel separation skin clears raster stair-steps at a sloped edge.
        // Both legs are swept: this never pushes the foot through another object.
        const ax=x-nx*.8,ay=y-ny*.8;
        if(segmentClear(map,[x,y],[ax,ay],s)&&segmentClear(map,[ax,ay],[ax+sx,ay+sy],s))candidates.push({dist,x:ax+sx,y:ay+sy});
      }
    }
    candidates.sort((a,b)=>a.dist-b.dist);if(candidates.length)return [candidates[0].x,candidates[0].y];
    // At a junction the foot touches two overlapping surfaces at once. Use the
    // union's clearance gradient, so internal polygon endpoints cannot snag it.
    let gx=0,gy=0;
    for(const radius of [2,4,6])for(let i=0;i<24;i++){
      const ax=Math.cos(i*Math.PI/12),ay=Math.sin(i*Math.PI/12);
      if(!walkable(map,x+ax*radius,y+ay*radius,s)){gx+=ax/radius;gy+=ay/radius;}
    }
    const length=Math.hypot(gx,gy);if(length<.01)return null;
    const nx=gx/length,ny=gy/length,inward=dx*nx+dy*ny;if(inward<=0)return null;
    const sx=dx-inward*nx,sy=dy-inward*ny;
    if(Math.hypot(sx,sy)<Math.hypot(dx,dy)*.15)return null;
    for(const skin of [0,.8,1.6]){
      const ax=x-nx*skin,ay=y-ny*skin;
      if(segmentClear(map,[x,y],[ax,ay],s)&&segmentClear(map,[ax,ay],[ax+sx,ay+sy],s))return [ax+sx,ay+sy];
    }
    return null;
  }
  const inExit=(map,x,y,margin=0)=>D.MAPS[map].exits.some(e=>Math.hypot(e.x-x,e.y-y)<e.r+margin);
  function safeSpawn(map,point,s) {
    const [x,y]=point||D.MAPS[map].spawn;
    if(walkable(map,x,y,s)&&!inExit(map,x,y,18))return [x,y];
    // Nearest safe point on the same walkable area; searched deterministically.
    for(let r=8;r<400;r+=8)for(let a=0;a<Math.PI*2;a+=Math.PI/16){
      const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;
      if(walkable(map,nx,ny,s)&&!inExit(map,nx,ny,18))return [nx,ny];
    }
    throw Error('Tidak ada titik kedatangan aman: '+map);
  }
  function travel(s,map,point) {
    if(!access(s,map))return false;
    const [x,y]=safeSpawn(map,point,s);s.mapId=map;
    Object.assign(s.player,{x,y,z:0,vz:0,targetX:null,targetY:null,moving:false});
    if(!s.discovered.includes(map))s.discovered.push(map);
    s.lastSafe={mapId:map,x,y};return true;
  }
  // Painted maps keep their authored perspective. Heights affect traversal speed and ability animation.
  function terrain(map,x,y) {
    if(map==='senja')return {name:'Batu lereng',speed:.84,height:clamp((650-y)*.18,0,70)};
    if(map==='balkut'&&x>540)return {name:'Tebing Balkut',speed:.82,height:clamp((620-y)*.2,0,80)};
    if(map==='simpul')return {name:'Basal menara',speed:1.06,height:clamp((620-y)*.1,0,40)};
    if(map==='sumi'||map==='sela')return {name:'Pijakan batu',speed:1.02,height:0};
    return {name:'Pasir lembut',speed:.88,height:0};
  }
  const shelters={nilasar:[[35,25,65,46],[18,44,37,58],[78,46,94,66]],gerbang:[[34,36,56,58]],simpul:[[58,54,69,70]],senja:[[42,36,64,52]],sela:[[32,28,55,45]],balkut:[[10,45,35,65]],sumi:[[60,32,78,55]],salkara:[[32,27,48,44]]};
  const sheltered=(map,x,y)=>(shelters[map]||[]).some(r=>rect(r,x,y));
  const links={}; // Senja uses the visible stairs; no straight-line cliff shortcut.
  function path(map,start,end,s) {
    if(!walkable(map,...start,s)||!end.every(Number.isFinite))return [];
    if(segmentClear(map,start,end,s))return [end.slice()];
    const size=map==='senja'?4:8,w=1280/size+1,h=720/size+1,idx=(x,y)=>y*w+x;
    let seed=-1,seedDist=Infinity;
    const sx=Math.round(start[0]/size),sy=Math.round(start[1]/size);
    for(let y=Math.max(0,sy-3);y<=Math.min(h-1,sy+3);y++)for(let x=Math.max(0,sx-3);x<=Math.min(w-1,sx+3);x++) {
      const d=Math.hypot(x*size-start[0],y*size-start[1]);
      if(d<seedDist&&segmentClear(map,start,[x*size,y*size],s)){seed=idx(x,y);seedDist=d;}
    }
    if(seed<0)return [];
    const prev=new Int32Array(w*h).fill(-2),q=new Int32Array(w*h);prev[seed]=-1;q[0]=seed;
    let count=1,best=seed,bestDist=Infinity;
    for(let head=0;head<count;head++) {
      const k=q[head],x=k%w,y=Math.floor(k/w),a=[x*size,y*size],d=Math.hypot(a[0]-end[0],a[1]-end[1]);
      if(d<bestDist){best=k;bestDist=d;}
      if(d<8&&segmentClear(map,a,end,s))break;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const xx=x+dx,yy=y+dy,n=idx(xx,yy);
        if(xx<0||yy<0||xx>=w||yy>=h||prev[n]!==-2||!segmentClear(map,a,[xx*size,yy*size],s))continue;
        prev[n]=k;q[count++]=n;
      }
    }
    if(bestDist>80)return [];
    const route=[];for(let k=best;k!==-1;k=prev[k])route.push([k%w*size,Math.floor(k/w)*size]);route.reverse();
    if(segmentClear(map,route.at(-1),end,s))route.push(end.slice());
    // Smoothing is a swept-foot query too; it never cuts across a blocked corner.
    const out=[];let anchor=start;
    for(let i=0;i<route.length;) {
      let j=i;while(j+1<route.length&&segmentClear(map,anchor,route[j+1],s))j++;
      out.push(route[j]);anchor=route[j];i=j+1;
    }
    return out;
  }
  function lineClear(map,a,b) {
    const c=collision(map),steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));
    for(let i=0;i<=steps;i++) {
      const x=Math.round(a[0]+(b[0]-a[0])*i/steps),y=Math.round(a[1]+(b[1]-a[1])*i/steps);
      if(x<0||x>=WIDTH||y<0||y>=HEIGHT||!c.ground[y*WIDTH+x])return false;
    }
    return true;
  }
  function snapshot(s) {
    const base=initial();for(const k of Object.keys(base))base[k]=clone(s[k]);
    base.version=4;base.objectiveId=current(s)?.id||null;base.savedAt=Date.now();
    return base;
  }
  function validate(d) {
    if(!d||d.version!==4||!Array.isArray(d.completed)||d.completed.length>objectives.length)throw Error('Format simpanan tidak dikenali.');
    if(!d.completed.every((id,i)=>id===objectives[i].id))throw Error('Urutan simpanan tidak valid.');
    if(!D.MAPS[d.mapId]||!access(d,d.mapId))throw Error('Wilayah simpanan tidak valid.');
    if(!d.player||![d.player.x,d.player.y].every(Number.isFinite)||d.player.x<0||d.player.x>1280||d.player.y<0||d.player.y>720)throw Error('Posisi simpanan tidak valid.');
    if(!Array.isArray(d.discovered)||!d.discovered.every(m=>!!D.MAPS[m])||!Array.isArray(d.rumors)||!d.rumors.every(x=>typeof x==='string'))throw Error('Catatan simpanan tidak valid.');
    if(!d.foundFlags||typeof d.foundFlags!=='object'||Array.isArray(d.foundFlags))throw Error('Penanda simpanan tidak valid.');
    if(!Number.isFinite(d.cargo)||d.cargo<0||d.cargo>100||!Number.isFinite(d.elapsed)||d.elapsed<0)throw Error('Status simpanan tidak valid.');
    if(!d.settings||!['volume','music','effects'].every(k=>Number.isFinite(d.settings[k])&&d.settings[k]>=0&&d.settings[k]<=1)||![1,1.2,1.4].includes(d.settings.textScale)||!['logic','timing'].includes(d.settings.puzzleMode))throw Error('Pengaturan simpanan tidak valid.');
    if(!Array.isArray(d.backlog)||!d.backlog.every(b=>typeof b.speaker==='string'&&typeof b.text==='string')||!Array.isArray(d.seenLines)||!d.seenLines.every(x=>typeof x==='string')||!Array.isArray(d.poiSeen)||!d.poiSeen.every(x=>typeof x==='string'))throw Error('Riwayat simpanan tidak valid.');
    if(d.dialogue){const dlg=root.CINCIN_DIALOGUES[d.dialogue.id]?.dialogue;if(d.dialogue.id!==current(d)?.id||!dlg?.nodes[d.dialogue.node])throw Error('Posisi dialog tidak valid.');}
    const result=clone(d),sp=safeSpawn(d.mapId,[d.player.x,d.player.y],d);
    Object.assign(result.player,{x:sp[0],y:sp[1],z:0,vz:0,targetX:null,targetY:null});
    delete result.player.glide;
    result.lastSafe={mapId:d.mapId,x:sp[0],y:sp[1]};return result;
  }
  function migrate(old) {
    if(old?.version===4)return validate(old);
    if(old?.version!==undefined)throw Error('Versi simpanan lebih baru / tidak didukung.');
    if(!old||!Number.isInteger(old.objIndex)||old.objIndex<0||old.objIndex>=58||!D.MAPS[old.mapId]||![old.px,old.py].every(Number.isFinite)||old.px<0||old.px>1280||old.py<0||old.py>720)throw Error('Simpanan pixel lama tidak valid.');
    const legacyIds=S.steps.flatMap((st,i)=>st.items.map((_,j)=>`cp-${i}-${j}`));
    const known=new Set(legacyIds.slice(0,old.foundFlags?.all_complete?58:old.objIndex));
    const d=initial();for(const o of objectives){if(!known.has(o.id))break;d.completed.push(o.id);}
    d.foundFlags=Object.fromEntries(d.completed.map(id=>[id,true]));
    for(const o of objectives.filter(o=>o.last&&done(d,o.id)))d.rumors.push(o.note);
    d.introSeen=d.completed.length>0;d.mapId=access(d,old.mapId)?old.mapId:'nilasar';
    d.discovered=Object.keys(D.MAPS).filter(m=>m==='nilasar'||(old.discoveries||[]).includes(D.MAPS[m].name)).filter(m=>access(d,m));
    if(!d.discovered.includes(d.mapId))d.discovered.push(d.mapId);
    const sp=safeSpawn(d.mapId,d.mapId===old.mapId?[old.px,old.py]:null,d);d.player.x=sp[0];d.player.y=sp[1];return validate(d);
  }
  function save(storage,key,s) {
    const data=JSON.stringify(validate(snapshot(s)));
    const previous=storage.getItem(key);
    if(previous){try{validate(JSON.parse(previous));storage.setItem(key+'.bak',previous);}catch{}}
    // Each localStorage setItem is atomic; primary is never removed before replacement.
    storage.setItem(key,data);return true;
  }
  function load(storage,key,legacyKey) {
    const errors=[];
    for(const k of [key,key+'.bak',...(legacyKey?[legacyKey,legacyKey+'.bak']:[])]){
      try{const raw=storage.getItem(k);if(!raw)continue;const parsed=JSON.parse(raw);const migrated=k.startsWith(LEGACY);return {data:migrated?migrate(parsed):validate(parsed),recovered:k.endsWith('.bak'),migrated};}catch(e){errors.push(e.message);}
    }
    return {data:null,error:errors[0]||'Belum ada simpanan.'};
  }
  root.PixelCampaign={objectives,order,initial,current,complete,done,hasRing,bound,access,gateHint,
    walkable,collision,segmentClear,movePoint,inExit,safeSpawn,travel,terrain,sheltered,shelters,links,path,lineClear,
    snapshot,validate,migrate,save,load,PREFIX,LEGACY,clone,clamp};
})(globalThis);

