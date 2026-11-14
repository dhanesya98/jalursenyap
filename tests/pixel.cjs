/* Regression suite for shipped pixel scripts; no browser profile or real saves touched. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),storage=new Map(),elements=new Map(),listeners={};
function element(){const classes=new Set();return {children:[],style:{setProperty(){}},dataset:{},textContent:'',innerHTML:'',isConnected:true,tagName:'BUTTON',classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},setAttribute(){},addEventListener(){},getClientRects:()=>[{}],closest:()=>null,focus(){doc.activeElement=this;},append(...els){this.children.push(...els);},replaceChildren(){this.children=[];},querySelectorAll:()=>[],querySelector(){return this.children[0]||null;},click(){this.onclick?.();}};}
const doc={readyState:'loading',hidden:false,activeElement:null,body:element(),documentElement:element(),addEventListener(){},querySelectorAll:()=>[],createElement:element,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}};
const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},ctx=vm.createContext({console,Date,Math,performance:{now:()=>0},document:doc,navigator:{},localStorage:store,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame(){},addEventListener:(k,fn)=>listeners[k]=fn});ctx.globalThis=ctx;ctx.window=ctx;
for(const f of ['data/game-data.js','src/cincin-story.js','src/cincin-dialogues.js','src/gamedev-systems.js','src/bab0-pixel-data.js','src/pixel-campaign.js','src/bab0-pixel-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const C=ctx.PixelCampaign,E=ctx.BAB0_ENGINE,P=ctx.JSGamedevSkills.PuzzleEngine,D=ctx.BAB0_DATA,DB=ctx.CINCIN_DIALOGUES;
let groups=0;const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);},copy=x=>JSON.parse(JSON.stringify(x));
function at(id){const s=C.initial();for(const o of C.objectives){if(o.id===id)break;C.complete(s,o.id);}return s;}
function reset(s=C.initial()){Object.assign(E.state,copy(s));Object.assign(E.runtime,{started:true,stack:[],keys:{},path:[],patrols:[],flight:null,dialogue:null,challenge:null,scanCooldown:0,saveTime:0,hudTime:0,exitArmed:false});}
test('58 stable objectives, 22 sequences, 8 maps, canonical final order',()=>{assert.equal(C.objectives.length,58);assert.equal(C.order.length,22);assert.equal(Object.keys(D.MAPS).length,8);assert.deepEqual(copy(C.objectives.slice(-2).map(o=>o.id)),['cp-21-0','cp-20-0']);for(const o of C.objectives){assert(D.MAPS[o.map]);assert(DB[o.id]?.dialogue);}});
test('reward and bridge gates only change at completed objectives',()=>{let s=at('cp-7-0');C.complete(s,'cp-7-0');assert(!C.hasRing(s));C.complete(s,'cp-7-1');assert(!C.hasRing(s));C.complete(s,'cp-7-2');assert(C.hasRing(s));s=at('cp-18-2');assert(!C.access(s,'salkara'));assert(!C.walkable('balkut',960,234,s));C.complete(s,'cp-18-2');assert(C.access(s,'salkara'));assert(C.walkable('balkut',960,234,s));assert(!C.complete(s,'cp-18-2'));});
test('14 map arrivals remain stable without input for 120 frames',()=>{const all=at(null);let count=0;for(const [from,m]of Object.entries(D.MAPS))for(const ex of m.exits){reset(all);assert(E.switchMap(ex.to,ex.spawn));assert(!C.inExit(ex.to,E.state.player.x,E.state.player.y,18),from+' > '+ex.to);for(let i=0;i<120;i++)E.tick(1/60);assert.equal(E.state.mapId,ex.to);count++;}assert.equal(count,14);});
test('all 58 targets reachable from safe spawn with actual progression gates',()=>{for(const o of C.objectives){const s=at(o.id);assert(C.access(s,o.map),o.id+' map locked');const sp=C.safeSpawn(o.map,null,s),q=[[Math.round(sp[0]/8)*8,Math.round(sp[1]/8)*8]],seen=new Set([q[0].join(',')]);let reached=false;for(let i=0;i<q.length;i++){const [x,y]=q[i];if(Math.hypot(x-o.x,y-o.y)<80){reached=true;break;}for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){const p=[x+dx,y+dy],k=p.join(',');if(!seen.has(k)&&C.walkable(o.map,...p,s)){seen.add(k);q.push(p);}}}assert(reached,o.id+' unreachable');}});
test('click paths obey obstacles; traversal anchors land on navigable ground',()=>{const s=at(null);for(const [id,m]of Object.entries(D.MAPS)){const sp=C.safeSpawn(id,null,s);for(const o of C.objectives.filter(o=>o.map===id)){const route=C.path(id,sp,[o.x,o.y],s);if(!route.length&&Math.hypot(sp[0]-o.x,sp[1]-o.y)<82)continue;assert(route.length,id+' '+o.id);assert(route.every(p=>C.walkable(id,...p,s)));assert(Math.hypot(route.at(-1)[0]-o.x,route.at(-1)[1]-o.y)<82);}}for(const [id,links]of Object.entries(C.links))for(const l of links)for(const p of [l.from,l.to])assert(C.walkable(id,...p,s),l.id+' '+p);});
test('schema validation, corruption recovery, slots, migration and failure atomicity',()=>{storage.clear();let s=at('cp-2-0');C.save(store,C.PREFIX+'_slot_0',s);C.complete(s,'cp-2-0');C.save(store,C.PREFIX+'_slot_0',s);storage.set(C.PREFIX+'_slot_0','{broken');let r=C.load(store,C.PREFIX+'_slot_0');assert(r.recovered);assert.equal(r.data.completed.length,6);const invalid=C.snapshot(s);invalid.completed.reverse();assert.throws(()=>C.validate(invalid));const newer=C.snapshot(s);newer.version=99;assert.throws(()=>C.validate(newer));const before=JSON.stringify(E.state);storage.clear();storage.set(C.PREFIX+'_slot_1',JSON.stringify(invalid));assert(!E.loadFromSlot(1));assert.equal(JSON.stringify(E.state),before);const old={objIndex:57,mapId:'salkara',px:350,py:480,foundFlags:{},discoveries:[]};const migrated=C.migrate(old);assert.equal(C.current(migrated).id,'cp-21-0');old.foundFlags.all_complete=true;assert.equal(C.migrate(old).completed.length,58);old.objIndex=-1;assert.throws(()=>C.migrate(old));storage.clear();C.save(store,C.PREFIX+'_slot_0',s);const untouched=storage.get(C.PREFIX+'_slot_0');C.save(store,C.PREFIX+'_auto',C.initial());assert.equal(storage.get(C.PREFIX+'_slot_0'),untouched);assert.throws(()=>C.save({getItem:()=>null,setItem(){throw Error('quota');}},'x',s));});
function pathToAction(graph,start,action){const q=[[start,[]]],seen=new Set();for(let i=0;i<q.length;i++){const [id,route]=q[i];if(seen.has(id))continue;seen.add(id);const n=graph.nodes[id];assert(n,'missing node '+id);if(n.action===action)return route;if(n.next)q.push([n.next,[...route,{next:true}]]);for(const [j,ch]of (n.choices||[]).entries())q.push([ch.next,[...route,{choice:j}]]);}throw Error('No reachable terminal action '+action);}
test('58 complete runtime interactions: puzzle → choices → one completion; save/reload at every node',()=>{reset();for(const o of C.objectives){assert.equal(C.current(E.state).id,o.id);assert(E.switchMap(o.map,[o.x,o.y]));Object.assign(E.state.player,{x:o.x,y:o.y});if(o.sonar){E.interact();assert(!E.runtime.dialogue);E.runtime.scanCooldown=0;E.triggerSonar();assert(E.state.foundFlags['sonar_'+o.id]);}E.interact();const puzzle=o.minigame&&!['negotiate_kesa','council_odgar'].includes(o.minigame);if(puzzle){assert(E.runtime.challenge);assert(!E.runtime.dialogue);const ch=E.runtime.challenge;if(ch.kind==='cargo'){assert.notEqual(ch.counts[0]*45+ch.counts[1]*30+ch.counts[2]*15,180);ch.counts=[2,2,2];E.puzzleWin(ch);}else{const moves=P.solveBFS(ch.board);assert(moves?.length);for(const move of moves)E.puzzleMove(move);}assert(!E.puzzleWin(ch));assert.equal(C.current(E.state).id,o.id);}assert(E.runtime.dialogue,o.id);const graph=DB[o.id].dialogue,route=pathToAction(graph,E.runtime.dialogue.node,'CP_'+o.id.slice(3).replaceAll('-','_'));for(const step of route){assert(E.saveToSlot(2,true));const loaded=C.load(store,C.PREFIX+'_slot_2');assert.equal(loaded.data.dialogue.node,E.runtime.dialogue.node);if(step.next)E.advanceVN();else elements.get('vn-choices').children[step.choice].onclick();}E.advanceVN();assert.equal(E.state.completed.length,o.index+1,o.id);assert(!E.advanceObjective(o.id));}assert.equal(E.state.rumors.length,22);assert(C.bound(E.state));assert.equal(E.runtime.stack.at(-1).id,'ending-modal');});
test('timing double-click, cancel/reopen and stale callback cannot advance another objective',()=>{reset(at('cp-18-0'));E.state.settings.puzzleMode='timing';E.startChallenge(C.current(E.state));const first=E.runtime.challenge;first.phase=.5;E.timingHit();E.timingHit();assert.equal(E.state.completed.length,first.id==='cp-18-0'?C.objectives.findIndex(o=>o.id===first.id):0);assert(E.runtime.dialogue);assert(!E.puzzleWin(first));E.runtime.stack=[];E.startChallenge(C.current(E.state));const second=E.runtime.challenge;assert(!E.puzzleWin(first));assert.equal(E.runtime.challenge,second);});
test('1,000 reachable puzzle configurations solve without mutating their input',()=>{const states=new Set();for(let seed=0;seed<1000;seed++){let b=seed%2?P.createBridgeBoard(seed):P.createTuneBoard(seed),rng=seed+1;for(let i=0;i<1+seed%13;i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;b=P.applyMove(b,rng%3).state;}states.add(P.hashState(b));const before=JSON.stringify(b),moves=P.solveBFS(b);assert(moves);let next=b;for(const m of moves)next=P.applyMove(next,m).state;assert(P.isSolved(next));assert.equal(JSON.stringify(b),before);}assert.equal(states.size,43);});
test('council rejects the false claim; puzzle undo restores the actual prior board',()=>{reset(at('cp-20-0'));E.startDialogue('cp-20-0');elements.get('vn-choices').children[1].onclick();assert.equal(E.runtime.dialogue.node,'retry');E.advanceVN();assert.equal(E.runtime.dialogue.node,'n0');assert.equal(C.current(E.state).id,'cp-20-0');reset(at('cp-1-0'));E.startChallenge(C.current(E.state));const before=JSON.stringify(E.runtime.challenge.board);E.puzzleMove(0);elements.get('puzzle-undo').onclick();assert.equal(JSON.stringify(E.runtime.challenge.board),before);});
test('jump, slopes, storm shelter, Ruru cooldown and ladder',()=>{reset();E.jump();let max=0;E.runtime.keys.Space=true;for(let i=0;i<60;i++){E.tick(1/60);max=Math.max(max,E.state.player.z);}assert(max>20);assert.equal(E.state.player.z,0);assert(!('glide' in E.state.player));assert(C.terrain('senja',600,350).height>C.terrain('senja',600,600).height);reset(at('cp-6-0'));Object.assign(E.state.player,{x:950,y:440});E.state.cargo=80;E.tick(.1);assert(E.state.cargo<80);Object.assign(E.state.player,{x:500,y:250});const cargo=E.state.cargo;E.tick(.1);assert(E.state.cargo>cargo);E.triggerSonar();assert.equal(E.runtime.scanCooldown,12);E.triggerSonar();assert.equal(E.runtime.scanCooldown,12);for(const [map,links]of Object.entries(C.links)){reset(at(null));E.switchMap(map,links[0].from);Object.assign(E.state.player,{x:links[0].from[0],y:links[0].from[1]});E.useLink(links[0].kind);assert(E.runtime.flight);for(let i=0;i<140;i++)E.tick(1/60);assert(!E.runtime.flight);assert(Math.hypot(E.state.player.x-links[0].to[0],E.state.player.y-links[0].to[1])<1);}});
test('ground contours block water, walls and gaps; jump cannot bypass collision',()=>{
 const blocked=[['nilasar',645,453],['nilasar',450,600],['sumi',616,409],['sumi',535,455],['senja',440,510],['gerbang',460,590],['simpul',1010,385],['sela',895,400],['sela',1060,400],['balkut',965,340],['balkut',340,435],['salkara',722,423],['salkara',600,650]];
 for(const [map,x,y] of blocked){assert(!C.walkable(map,x,y,at(null)),map+' obstacle');assert(!C.walkable(map,x,y,at(null),true),map+' airborne bypass');}
 const open=[['nilasar',565,470],['nilasar',644,300],['sumi',463,465],['sumi',625,515],['senja',439,405],['senja',650,473],['sela',895,108],['sela',895,605],['balkut',960,234]];
 for(const [map,x,y] of open)assert(C.walkable(map,x,y,at(null)),map+' contour '+x+','+y);
 reset();E.runtime.interactOnArrival=true;E.runtime.keys.KeyD=true;E.tick(1/60);assert(!E.runtime.interactOnArrival);
});
test('swept feet do not tunnel into the well at sprint speed or during a hitch',()=>{
 for(const dt of [1/144,1/60,1/30,.1]){reset();Object.assign(E.state.player,{x:565,y:453});E.runtime.keys={KeyD:true,ShiftLeft:true,Space:true};E.jump();for(let t=0;t<2;t+=dt){E.tick(dt);assert(C.walkable('nilasar',E.state.player.x,E.state.player.y,E.state));}}
 const hit=C.movePoint('nilasar',565,453,200,0,C.initial());assert(C.walkable('nilasar',...hit,C.initial()));assert(!C.segmentClear('nilasar',[565,453],[765,453],C.initial()));
});
test('click routes execute with actual player feet for all objectives and exits',()=>{
 const progress=C.initial();let checks=0;
 for(const o of C.objectives){reset(progress);E.switchMap(o.map);E.runtime.patrols=[];E.runtime.exitArmed=false;
  const sp=[E.state.player.x,E.state.player.y],route=C.path(o.map,sp,[o.x,o.y],E.state);assert(route.length,o.id);
  let prev=sp;for(const p of route){assert(C.segmentClear(o.map,prev,p,E.state),o.id+' swept segment');prev=p;}
  E.runtime.path=route;for(let i=0;E.runtime.path.length&&i<24000;i++){E.runtime.exitArmed=false;E.tick(1/120);assert(C.walkable(o.map,E.state.player.x,E.state.player.y,E.state),o.id+' feet');assert(C.walkable(o.map,E.runtime.ruru.x,E.runtime.ruru.y,E.state),o.id+' Ruru boundary');}
  assert(!E.runtime.path.length,o.id+' stuck '+JSON.stringify({p:E.state.player,path:E.runtime.path,cargo:E.state.cargo}));assert.equal(E.state.mapId,o.map,o.id+' accidental exit');assert(Math.hypot(E.state.player.x-o.x,E.state.player.y-o.y)<82,o.id+' interaction distance');C.complete(progress,o.id);checks++;
 }
 const all=at(null);for(const [map,m]of Object.entries(D.MAPS))for(const ex of m.exits){const route=C.path(map,C.safeSpawn(map,null,all),[ex.x,ex.y],all);assert(route.length,map+' exit');assert(Math.hypot(route.at(-1)[0]-ex.x,route.at(-1)[1]-ex.y)<ex.r);checks++;}
 assert.equal(checks,72);
});
test('save recovery uses full feet and strips obsolete glide state',()=>{
 const old=C.snapshot(C.initial());old.player.x=645;old.player.y=453;old.player.glide=.3;
 const saved=C.validate(old);assert(C.walkable(saved.mapId,saved.player.x,saved.player.y,saved));assert(!('glide' in saved.player));
 const all=at(null);for(const [id,m]of Object.entries(D.MAPS))for(const patrol of m.patrols||[])assert(C.segmentClear(id,...patrol.waypoints,all),id+' patrol');
 assert(Object.values(C.links).flat().every(l=>l.kind==='ladder'));
 for(const file of ['src/bab0-pixel-engine.js','src/gamedev-systems.js','bab0.html'])assert(!/grappl|gliding|btn-hook|cape-meter|KeyF/.test(fs.readFileSync(path.join(root,file),'utf8')),file+' removed controls');
});
test('all eight maps contain swept feet at cliffs and outer boundaries in every direction',()=>{
 const all=at(null),directions=Array.from({length:16},(_,i)=>[Math.cos(i*Math.PI/8),Math.sin(i*Math.PI/8)]);let checked=0;
 for(const [map,m]of Object.entries(D.MAPS)) {
  const mask=C.collision(map).ground;
  for(let y=8;y<712;y+=8)for(let x=8;x<1272;x+=8) {
   if(!C.walkable(map,x,y,all)||directions.every(([dx,dy])=>C.walkable(map,x+dx*16,y+dy*16,all)))continue;
   for(const [dx,dy]of directions) {
    const to=C.movePoint(map,x,y,dx*32,dy*32,all);
    assert(C.walkable(map,...to,all),map+' edge escape');
    const ix=Math.round(to[0]),iy=Math.round(to[1]);
    for(let fy=-4;fy<=4;fy++)for(let fx=-7;fx<=7;fx++)if(fx*fx/49+fy*fy/16<=1)assert.equal(mask[(iy+fy)*1280+ix+fx],1,map+' foot outside painted ground');
    checked++;
   }
  }
  for(const p of [[-1,360],[1280,360],[640,-1],[640,720],[NaN,300],[640,Infinity]])assert(!C.walkable(map,...p,all),map+' world bound');
 }
 assert(checked>10000);console.log('  '+checked+' outward edge sweeps checked');
});
test('jump holding has no glide effect and simulation is stable across frame rates',()=>{
 const jumpPositions=[];for(const hold of [false,true]){reset();E.jump();E.runtime.keys.Space=hold;for(let i=0;i<120;i++)E.tick(1/120);jumpPositions.push([E.state.player.z,E.state.player.vz]);}
 assert.deepEqual(jumpPositions[0],jumpPositions[1]);
 const positions=[];for(const fps of [30,60,144]){reset();Object.assign(E.state.player,{x:600,y:575});E.runtime.keys.KeyD=true;let accumulator=0;for(let i=0;i<fps;i++){accumulator+=1/fps;while(accumulator+1e-10>=1/120){E.tick(1/120);accumulator-=1/120;}}positions.push([E.state.player.x,E.state.player.y]);}
 for(const p of positions)assert(Math.hypot(p[0]-positions[0][0],p[1]-positions[0][1])<.001);
});

test('Senja object colliders and both bridge decks match independent visual probes',()=>{
 const m=D.MAPS.senja,all=at(null);assert.equal(m.collisionObjects.length,17);assert.equal(m.walkSurfaces.length,12);
 assert.equal(new Set(m.collisionObjects.map(o=>o.id)).size,17);
 for(const p of [[175,444],[295,370],[578,350],[580,423],[550,510],[800,456],[734,478],[765,533],[453,650],[560,675],[700,640],[740,295],[440,385],[440,423],[350,526],[350,563]])assert(!C.walkable('senja',...p,all),'solid '+p);
 for(const p of [[400,568],[370,550],[320,527],[300,505],[380,405],[440,408],[493,399],[680,555],[650,470],[737,322]]){
  assert(C.walkable('senja',...p,all),'deck '+p);const route=C.path('senja',[609,620],p,all);assert(route.length);assert(Math.hypot(route.at(-1)[0]-p[0],route.at(-1)[1]-p[1])<1,'exact landing '+p);
 }
 reset(all);E.switchMap('senja');Object.assign(E.state.player,{x:590,y:617});E.useLink('ladder');assert(!E.runtime.flight,'no cliff shortcut');
});
test('WASD crosses both Senja bridges in both directions without click guidance',()=>{
 const legs=[[[418,580],[300,505]],[[300,505],[418,580]],[[493,399],[380,405]],[[380,405],[493,399]],[[680,555],[704,531]],[[704,531],[680,555]]];
 for(const [start,end]of legs){reset(at(null));E.switchMap('senja');Object.assign(E.state.player,{x:start[0],y:start[1]});assert(C.walkable('senja',...start,E.state));
  let reached=false;for(let i=0;i<2400;i++){const p=E.state.player,dx=end[0]-p.x,dy=end[1]-p.y;if(Math.hypot(dx,dy)<12){reached=true;break;}
   E.runtime.keys={KeyA:dx<-4,KeyD:dx>4,KeyW:dy<-4,KeyS:dy>4,ShiftLeft:true};E.tick(1/120);assert(!E.runtime.path.length);assert(C.walkable('senja',p.x,p.y,E.state));
  }assert(reached,'WASD stuck '+start+' -> '+end+' at '+E.state.player.x+','+E.state.player.y);
 }
});

test('held A and D cross Senja rails without a stalled frame or auto-path',()=>{
 for(const [start,key,frames,targetX]of [[[493,399],'KeyA',110,370],[[380,405],'KeyD',110,500],[[418,580],'KeyA',140,310],[[300,505],'KeyD',150,410],[[256.29,485.31],'KeyD',230,440]]){
  reset(at(null));E.switchMap('senja');Object.assign(E.state.player,{x:start[0],y:start[1]});E.runtime.keys={[key]:true};let stalled=0;
  for(let i=0;i<frames;i++){const before=[E.state.player.x,E.state.player.y];E.tick(1/120);const p=E.state.player;stalled=Math.hypot(p.x-before[0],p.y-before[1])<.01?stalled+1:0;assert(stalled<4,'held '+key+' stalls at '+p.x+','+p.y);assert(C.walkable('senja',p.x,p.y,E.state));assert(!E.runtime.path.length);}
  assert(key==='KeyA'?E.state.player.x<targetX:E.state.player.x>targetX,key+' crossing incomplete');
 }
});

test('reported landings, camp access and raised platform separation',()=>{
 const all=at(null);
 for(const [map,start,key,n,check]of [
 ['senja',[274.6,489.44],'KeyA',78,p=>p.x<200],
 ['balkut',[939.23,217.72],'KeyA',60,p=>p.x<880],
 ['balkut',[868.43,221.09],'KeyS',52,p=>p.y>280],
 ['salkara',[568,275],'KeyW',49,p=>p.y<225],
 ['simpul',[978.76,645.16],'KeyW',84,p=>p.y>=610],
 ['simpul',[885,380],'KeyW',38,p=>p.y<335]]){
  reset(all);E.switchMap(map);Object.assign(E.state.player,{x:start[0],y:start[1]});E.runtime.keys={[key]:true};
  for(let i=0;i<n;i++){E.tick(1/120);assert(C.walkable(map,E.state.player.x,E.state.player.y,E.state));}assert(check(E.state.player),map+' reported point');
 }
 assert(!C.segmentClear('simpul',[978,645],[978,540],all),'cannot climb vertical facade');
 for(const [map,start,end]of [['simpul',[978,645],[1050,520]],['simpul',[850,471],[885,330]],['salkara',[568,300],[568,217]]]){
  const route=C.path(map,start,end,all);assert(route.length);assert(Math.hypot(route.at(-1)[0]-end[0],route.at(-1)[1]-end[1])<2,map+' access');
 }
});


 test('bidirectional WASD route audit across every map',()=>{
 const routes=JSON.parse(fs.readFileSync(path.join(root,'tests/wasd-routes.json'),'utf8'));let failures=[];
 for(const r of routes)for(const reverse of [false,true])for(const sprint of [false,true]){
 const points=reverse?[...r.points].reverse():r.points;reset(at(null));E.switchMap(r.map);Object.assign(E.state.player,{x:points[0][0],y:points[0][1]});
 let failed=false;
 for(const [x,y]of points)if(!C.walkable(r.map,x,y,E.state)){failures.push(r.name+' invalid '+x+','+y);failed=true;break;}if(failed)continue;
 for(const end of points.slice(1)){let reached=false,stalled=0;
 for(let i=0;i<1500;i++){const p=E.state.player,dx=end[0]-p.x,dy=end[1]-p.y;if(Math.hypot(dx,dy)<6){reached=true;break;}const old=[p.x,p.y];E.runtime.exitArmed=false;E.runtime.keys={KeyA:dx<-2,KeyD:dx>2,KeyW:dy<-2,KeyS:dy>2,ShiftLeft:sprint};E.tick(1/120);assert(C.walkable(r.map,p.x,p.y,E.state));assert(!E.runtime.path.length);stalled=Math.hypot(p.x-old[0],p.y-old[1])<.005?stalled+1:0;if(stalled>=30)break;
 }if(!reached){failures.push(r.map+' '+r.name+' '+(reverse?'reverse':'forward')+' goal '+end+' stuck '+E.state.player.x.toFixed(2)+','+E.state.player.y.toFixed(2));break;}}
 }
 console.log(failures.join('\n'));assert.equal(failures.length,0,'WASD routes');console.log('  '+routes.length*4+' directional walk/sprint routes');
 });

test('held WASD with sprint and jump cannot cross walls or cliff faces',()=>{
 const cases=[
 ['nilasar',[970,450],'KeyS',p=>!(p.x>945&&p.y>495)],
 ['sumi',[616,510],'KeyW',p=>(p.x-616)**2/148**2+(p.y-409)**2/83**2>1],
 ['senja',[650,470],'KeyS',p=>!(p.x>620&&p.x<655&&p.y>500&&p.y<555)],
 ['gerbang',[350,570],'KeyD',p=>!(p.x>400&&p.x<470&&p.y>585&&p.y<630)],
 ['simpul',[978,645],'KeyW',p=>p.y>=610],
 ['sela',[895,605],'KeyW',p=>p.y>=579.5],
 ['sela',[570,380],'KeyW',p=>!(p.x>565&&p.x<680&&p.y>325&&p.y<350)],
 ['balkut',[750,560],'KeyA',p=>!(p.x>610&&p.x<655&&p.y>500&&p.y<600)],
 ['salkara',[460,500],'KeyA',p=>!(p.x>260&&p.x<410&&p.y>435&&p.y<515)]
 ];
 for(const [map,start,key,side]of cases)for(const sprint of [false,true]){
 reset(at(null));E.switchMap(map);Object.assign(E.state.player,{x:start[0],y:start[1]});assert(C.walkable(map,...start,E.state),map+' stress start');E.runtime.keys={[key]:true,ShiftLeft:sprint,Space:true};E.jump();
 for(let i=0;i<120;i++){E.runtime.exitArmed=false;E.tick(1/120);assert(C.walkable(map,E.state.player.x,E.state.player.y,E.state),map+' escaped ground');assert(side(E.state.player),map+' crossed wall face at '+E.state.player.x+','+E.state.player.y);}
 }
});
 
test('audio-design skill: quadratic slider-to-gain dB curve, multi-bus SFX bank & BGM assets',()=>{
 assert.equal(E.sliderToGain(0),0);
 assert.equal(E.sliderToGain(0.0005),0);
 assert(Math.abs(E.sliderToGain(0.5)-0.25)<1e-6);
 assert.equal(E.sliderToGain(1),1);
 assert.equal(E.linearToDb(0),-80);
 assert(Math.abs(E.linearToDb(0.5)-(-6.0206))<0.01);
 for(const fn of ['footstep','jump','land','ladder','sonar','sonarReveal','vnBlip','vnChoice','uiOpen','uiClose','uiClick','cargoStep','puzzleMove','puzzleHint','timingLock','timingMiss','puzzleWin','questComplete','stealthAlert','mapTravel','saveChime','waterRefill']){
  assert.equal(typeof E.SFX[fn],'function','Missing SFX.'+fn);
  E.SFX[fn]();
 }
 for(const track of ['desert_exploration.mp3','desert_sanctuary.mp3','seashell_lullaby.mp3']){
  const fp=path.join(root,'assets/audio/sfx',track);
  assert(fs.existsSync(fp)&&fs.statSync(fp).size>100000,track+' missing');
 }
});

console.log(`PASS ${groups} pixel regression groups. DOM is mocked: run browser smoke checks separately.`);








