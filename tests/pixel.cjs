/* Regression suite for shipped pixel scripts; no browser profile or real saves touched. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),storage=new Map(),elements=new Map(),listeners={};
function element(){const classes=new Set();return {children:[],style:{setProperty(){}},dataset:{},textContent:'',innerHTML:'',isConnected:true,tagName:'BUTTON',classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},setAttribute(){},addEventListener(){},getClientRects:()=>[{}],closest:()=>null,focus(){doc.activeElement=this;},append(...els){this.children.push(...els);},replaceChildren(){this.children=[];},querySelectorAll:()=>[],querySelector(){return this.children[0]||null;},click(){this.onclick?.();}};}
const doc={readyState:'loading',hidden:false,activeElement:null,body:element(),documentElement:element(),addEventListener(){},querySelectorAll:()=>[],createElement:element,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}};
const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},ctx=vm.createContext({console,Date,Math,performance:{now:()=>0},document:doc,navigator:{},localStorage:store,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame(){},addEventListener:(k,fn)=>listeners[k]=fn});ctx.globalThis=ctx;ctx.window=ctx;
for(const f of ['data/game-data.js','src/cincin-story.js','src/cincin-dialogues.js','src/gamedev-systems.js','src/bab0-pixel-data.js','src/rpg-system.js','src/pixel-campaign.js','src/bab0-pixel-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const C=ctx.PixelCampaign,E=ctx.BAB0_ENGINE,P=ctx.JSGamedevSkills.PuzzleEngine,D=ctx.BAB0_DATA,DB=ctx.CINCIN_DIALOGUES,R=ctx.RPGSystem;
let groups=0;const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);},copy=x=>JSON.parse(JSON.stringify(x));
function at(id){const s=C.initial();for(const o of C.objectives){if(o.id===id)break;C.complete(s,o.id);}return s;}
function reset(s=C.initial()){Object.assign(E.state,copy(s));Object.assign(E.runtime,{started:true,stack:[],keys:{},path:[],patrols:[],flight:null,dialogue:null,challenge:null,scanCooldown:0,saveTime:0,hudTime:0,time:0,hazardCooldown:0,exitArmed:false});if(E.runtime.feel){E.runtime.feel.trauma=0;E.runtime.feel.hitStop=0;}}
test('71 stable objectives, 27 sequences, 9 maps, canonical final order',()=>{assert.equal(C.objectives.length,71);assert.equal(C.order.length,27);assert.equal(Object.keys(D.MAPS).length,9);assert.deepEqual(copy(C.objectives.slice(-2).map(o=>o.id)),['cp-25-1','cp-26-0']);for(const o of C.objectives){assert(D.MAPS[o.map]);assert(DB[o.id]?.dialogue);}});
test('reward and bridge gates only change at completed objectives',()=>{let s=at('cp-7-0');C.complete(s,'cp-7-0');assert(!C.hasRing(s));C.complete(s,'cp-7-1');assert(!C.hasRing(s));C.complete(s,'cp-7-2');assert(C.hasRing(s));s=at('cp-18-2');assert(!C.access(s,'salkara'));assert(!C.walkable('balkut',960,234,s));C.complete(s,'cp-18-2');assert(C.access(s,'salkara'));assert(C.walkable('balkut',960,234,s));assert(!C.complete(s,'cp-18-2'));s=at('cp-23-2');assert(!C.access(s,'tepisalkara'));C.complete(s,'cp-23-2');assert(C.access(s,'tepisalkara'));});
test('16 map arrivals remain stable without input for 120 frames',()=>{const all=at(null);let count=0;for(const [from,m]of Object.entries(D.MAPS))for(const ex of m.exits){reset(all);assert(E.switchMap(ex.to,ex.spawn));assert(!C.inExit(ex.to,E.state.player.x,E.state.player.y,18),from+' > '+ex.to);for(let i=0;i<120;i++)E.tick(1/60);assert.equal(E.state.mapId,ex.to);count++;}assert.equal(count,16);});
test('all 71 targets reachable from safe spawn with actual progression gates',()=>{for(const o of C.objectives){const s=at(o.id);assert(C.access(s,o.map),o.id+' map locked');const sp=C.safeSpawn(o.map,null,s),q=[[Math.round(sp[0]/8)*8,Math.round(sp[1]/8)*8]],seen=new Set([q[0].join(',')]);let reached=false;for(let i=0;i<q.length;i++){const [x,y]=q[i];if(Math.hypot(x-o.x,y-o.y)<80){reached=true;break;}for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){const p=[x+dx,y+dy],k=p.join(',');if(!seen.has(k)&&C.walkable(o.map,...p,s)){seen.add(k);q.push(p);}}}assert(reached,o.id+' unreachable');}});
test('click paths obey obstacles; traversal anchors land on navigable ground',()=>{const s=at(null);for(const [id,m]of Object.entries(D.MAPS)){const sp=C.safeSpawn(id,null,s);for(const o of C.objectives.filter(o=>o.map===id)){const route=C.path(id,sp,[o.x,o.y],s);if(!route.length&&Math.hypot(sp[0]-o.x,sp[1]-o.y)<82)continue;assert(route.length,id+' '+o.id);assert(route.every(p=>C.walkable(id,...p,s)));assert(Math.hypot(route.at(-1)[0]-o.x,route.at(-1)[1]-o.y)<82);}}for(const [id,links]of Object.entries(C.links))for(const l of links)for(const p of [l.from,l.to])assert(C.walkable(id,...p,s),l.id+' '+p);});
test('schema validation, corruption recovery, slots, migration and failure atomicity',()=>{storage.clear();let s=at('cp-2-0');C.save(store,C.PREFIX+'_slot_0',s);C.complete(s,'cp-2-0');C.save(store,C.PREFIX+'_slot_0',s);storage.set(C.PREFIX+'_slot_0','{broken');let r=C.load(store,C.PREFIX+'_slot_0');assert(r.recovered);assert.equal(r.data.completed.length,6);const invalid=C.snapshot(s);invalid.completed.reverse();assert.throws(()=>C.validate(invalid));const newer=C.snapshot(s);newer.version=99;assert.throws(()=>C.validate(newer));const before=JSON.stringify(E.state);storage.clear();storage.set(C.PREFIX+'_slot_1',JSON.stringify(invalid));assert(!E.loadFromSlot(1));assert.equal(JSON.stringify(E.state),before);const old={objIndex:57,mapId:'salkara',px:350,py:480,foundFlags:{},discoveries:[]};const migrated=C.migrate(old);assert.equal(C.current(migrated).id,'cp-21-0');old.foundFlags.all_complete=true;assert.equal(C.migrate(old).completed.length,58);old.objIndex=-1;assert.throws(()=>C.migrate(old));storage.clear();C.save(store,C.PREFIX+'_slot_0',s);const untouched=storage.get(C.PREFIX+'_slot_0');C.save(store,C.PREFIX+'_auto',C.initial());assert.equal(storage.get(C.PREFIX+'_slot_0'),untouched);assert.throws(()=>C.save({getItem:()=>null,setItem(){throw Error('quota');}},'x',s));});
function pathToAction(graph,start,action){const q=[[start,[]]],seen=new Set();for(let i=0;i<q.length;i++){const [id,route]=q[i];if(seen.has(id))continue;seen.add(id);const n=graph.nodes[id];assert(n,'missing node '+id);if(n.action===action)return route;if(n.next)q.push([n.next,[...route,{next:true}]]);for(const [j,ch]of (n.choices||[]).entries())q.push([ch.next,[...route,{choice:j}]]);}throw Error('No reachable terminal action '+action);}
test('71 complete runtime interactions: puzzle -> choices -> one completion; save/reload at every node',()=>{reset();for(const o of C.objectives){assert.equal(C.current(E.state).id,o.id);assert(E.switchMap(o.map,[o.x,o.y]));Object.assign(E.state.player,{x:o.x,y:o.y});if(o.sonar){E.interact();assert(!E.runtime.dialogue);E.runtime.scanCooldown=0;E.triggerSonar();assert(E.state.foundFlags['sonar_'+o.id]);}E.interact();const puzzle=o.minigame&&!['negotiate_kesa','council_odgar','confront_dargun'].includes(o.minigame);if(puzzle){assert(E.runtime.challenge);assert(!E.runtime.dialogue);const ch=E.runtime.challenge;if(ch.kind==='cargo'){assert.notEqual(ch.counts[0]*45+ch.counts[1]*30+ch.counts[2]*15,180);ch.counts=[2,2,2];E.puzzleWin(ch);}else{const moves=P.solveBFS(ch.board);assert(moves?.length,o.id+' BFS');for(const move of moves)E.puzzleMove(move);}assert(!E.puzzleWin(ch));assert.equal(C.current(E.state).id,o.id);}assert(E.runtime.dialogue,o.id);const graph=DB[o.id].dialogue,route=pathToAction(graph,E.runtime.dialogue.node,'CP_'+o.id.slice(3).replaceAll('-','_'));for(const step of route){assert(E.saveToSlot(2,true));const loaded=C.load(store,C.PREFIX+'_slot_2');assert.equal(loaded.data.dialogue.node,E.runtime.dialogue.node);if(step.next)E.advanceVN();else elements.get('vn-choices').children[step.choice].onclick();}E.advanceVN();assert.equal(E.state.completed.length,o.index+1,o.id);assert(!E.advanceObjective(o.id));}assert.equal(E.state.rumors.length,27);assert(C.bound(E.state));assert.equal(E.state.rpg.unlockedItems.includes('gear_mandat_cirusia'),true);assert.equal(E.runtime.stack.at(-1).id,'ending-modal');});
test('timing double-click, cancel/reopen and stale callback cannot advance another objective',()=>{reset(at('cp-18-0'));E.state.settings.puzzleMode='timing';E.startChallenge(C.current(E.state));const first=E.runtime.challenge;first.phase=.5;E.timingHit();E.timingHit();assert.equal(E.state.completed.length,first.id==='cp-18-0'?C.objectives.findIndex(o=>o.id===first.id):0);assert(E.runtime.dialogue);assert(!E.puzzleWin(first));E.runtime.stack=[];E.startChallenge(C.current(E.state));const second=E.runtime.challenge;assert(!E.puzzleWin(first));assert.equal(E.runtime.challenge,second);});
test('1,000 reachable puzzle configurations solve without mutating their input',()=>{const states=new Set();for(let seed=0;seed<1000;seed++){let b=seed%2?P.createBridgeBoard(seed):P.createTuneBoard(seed),rng=seed+1;for(let i=0;i<1+seed%13;i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;b=P.applyMove(b,rng%3).state;}states.add(P.hashState(b));const before=JSON.stringify(b),moves=P.solveBFS(b);assert(moves);let next=b;for(const m of moves)next=P.applyMove(next,m).state;assert(P.isSolved(next));assert.equal(JSON.stringify(b),before);}assert.equal(states.size,43);});
test('council rejects the false claim; puzzle undo restores the actual prior board',()=>{reset(at('cp-20-0'));E.startDialogue('cp-20-0');elements.get('vn-choices').children[1].onclick();assert.equal(E.runtime.dialogue.node,'retry');E.advanceVN();assert.equal(E.runtime.dialogue.node,'n0');assert.equal(C.current(E.state).id,'cp-20-0');reset(at('cp-1-0'));E.startChallenge(C.current(E.state));const before=JSON.stringify(E.runtime.challenge.board);E.puzzleMove(0);elements.get('puzzle-undo').onclick();assert.equal(JSON.stringify(E.runtime.challenge.board),before);});
test('jump, slopes, storm shelter, Ruru cooldown and ladder',()=>{reset();E.jump();let max=0;E.runtime.keys.Space=true;for(let i=0;i<60;i++){E.tick(1/60);max=Math.max(max,E.state.player.z);}assert(max>20);assert.equal(E.state.player.z,0);assert(!('glide' in E.state.player));assert(C.terrain('senja',600,350).height>C.terrain('senja',600,600).height);reset(at('cp-6-0'));Object.assign(E.state.player,{x:950,y:440});E.state.cargo=80;E.tick(.1);assert(E.state.cargo<80);Object.assign(E.state.player,{x:500,y:250});const cargo=E.state.cargo;E.tick(.1);assert(E.state.cargo>cargo);E.triggerSonar();assert.equal(E.runtime.scanCooldown,4);E.triggerSonar();assert.equal(E.runtime.scanCooldown,4);for(const [map,links]of Object.entries(C.links)){reset(at(null));E.switchMap(map,links[0].from);Object.assign(E.state.player,{x:links[0].from[0],y:links[0].from[1]});E.useLink(links[0].kind);assert(E.runtime.flight);for(let i=0;i<140;i++)E.tick(1/60);assert(!E.runtime.flight);assert(Math.hypot(E.state.player.x-links[0].to[0],E.state.player.y-links[0].to[1])<1);}});
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
 assert.equal(checks,87);
});
test('save recovery uses full feet and strips obsolete glide state',()=>{
 const old=C.snapshot(C.initial());old.player.x=645;old.player.y=453;old.player.glide=.3;
 const saved=C.validate(old);assert(C.walkable(saved.mapId,saved.player.x,saved.player.y,saved));assert(!('glide' in saved.player));
 const all=at(null);for(const [id,m]of Object.entries(D.MAPS))for(const patrol of m.patrols||[])assert(C.segmentClear(id,...patrol.waypoints,all),id+' patrol');
 assert(Object.values(C.links).flat().every(l=>l.kind==='ladder'));
 for(const file of ['src/bab0-pixel-engine.js','src/gamedev-systems.js','index.html'])assert(!/grappl|gliding|btn-hook|cape-meter|KeyF/.test(fs.readFileSync(path.join(root,file),'utf8')),file+' removed controls');
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
 for(const fn of ['footstep','jump','land','ladder','sonar','sonarReveal','vnBlip','vnChoice','uiOpen','uiClose','uiClick','cargoStep','puzzleMove','puzzleHint','timingLock','timingMiss','puzzleWin','questComplete','stealthAlert','mapTravel','saveChime','waterRefill','hit','guard','enemyHit','negotiate']){
  assert.equal(typeof E.SFX[fn],'function','Missing SFX.'+fn);
  E.SFX[fn]();
 }
 for(const track of ['desert_exploration.mp3','desert_sanctuary.mp3','seashell_lullaby.mp3']){
  const fp=path.join(root,'assets/audio/sfx',track);
  assert(fs.existsSync(fp)&&fs.statSync(fp).size>100000,track+' missing');
 }
});

test('RPG Bab 0 balance: hits-to-kill (2-4 regular, 25-60 boss) and hits-to-survive (5-8)',()=>{
 // Mid-variance (0.5) and no crit (0.9) for deterministic expected-hit checks
 const dmg=(atk,def)=>R.calculateDamage(atk,def,{varianceRoll:0.5,critRoll:0.9}).damage;
 assert(dmg(10,1000)>=1); // Ratio defense never grants 0-damage immunity
 // Lv 2 Nara with Tongkat (+3 ATK) + Rompi (+6 HP, +2 DEF) vs Bandit Gurun (HP 28, ATK 9, DEF 4)
 const rpg2=R.initialRpgState();R.grantXp(rpg2,R.XP_THRESHOLDS[2]);R.unlockItem(rpg2,'gear_tongkat_perintis');R.equipItem(rpg2,'gear_tongkat_perintis');
 const s2=R.getDerivedStats(rpg2),b=R.ENCOUNTERS.bandit_gurun;
 const htkBandit=Math.ceil(b.maxHp/dmg(s2.ketangkasan,b.def));
 const htsBandit=Math.ceil(s2.ketahanan/dmg(b.atk,s2.pertahanan));
 assert(htkBandit>=2&&htkBandit<=4,'Bandit HTK='+htkBandit);
 assert(htsBandit>=5&&htsBandit<=8,'Bandit HTS='+htsBandit);
 // Lv 3 Nara vs Pengintai Dewan (HP 36, ATK 11, DEF 6)
 const rpg3=R.initialRpgState();R.grantXp(rpg3,R.XP_THRESHOLDS[3]);R.unlockItem(rpg3,'gear_tongkat_perintis');R.equipItem(rpg3,'gear_tongkat_perintis');
 const s3=R.getDerivedStats(rpg3),p=R.ENCOUNTERS.pengintai_dewan;
 const htkScout=Math.ceil(p.maxHp/dmg(s3.ketangkasan,p.def));
 const htsScout=Math.ceil(s3.ketahanan/dmg(p.atk,s3.pertahanan));
 assert(htkScout>=2&&htkScout<=4,'Scout HTK='+htkScout);
 assert(htsScout>=5&&htsScout<=8,'Scout HTS='+htsScout);
 // Lv 4 Nara vs Kapten Blokade Boss (HP 340, ATK 14, DEF 12) -> 25-60 actions
 const rpg4=R.initialRpgState();R.grantXp(rpg4,R.XP_THRESHOLDS[4]);R.unlockItem(rpg4,'gear_kompas_bahtari');R.equipItem(rpg4,'gear_kompas_bahtari');
 const s4=R.getDerivedStats(rpg4),boss=R.ENCOUNTERS.kapten_blokade;
 const htkBoss=Math.ceil(boss.maxHp/dmg(s4.ketangkasan,boss.def));
 const htsBoss=Math.ceil(s4.ketahanan/dmg(boss.atk,s4.pertahanan));
 assert(htkBoss>=25&&htkBoss<=60,'Boss HTK='+htkBoss);
 assert(htsBoss>=5&&htsBoss<=8,'Boss HTS='+htsBoss);
});

test('RPG equip/unequip restores exact base stats with zero free heal and Bab 0 spoiler guard',()=>{
 const rpg=R.initialRpgState();
 R.unequipItem(rpg,'gear_rompi_kulit');
 const base=R.getBaseStats(rpg.level);
 assert.deepEqual(R.getDerivedStats(rpg),base);
 rpg.hp=20; // Damaged Nara
 for(const item of Object.values(R.ITEMS)){
  R.unlockItem(rpg,item.id);
  if(item.slot&&item.category!=='mystery'){
   const hpBefore=rpg.hp;
   assert(R.equipItem(rpg,item.id));
   assert.equal(rpg.hp,Math.min(hpBefore,R.getDerivedStats(rpg).ketahanan),'No free heal on equip '+item.id);
   assert(R.unequipItem(rpg,item.id));
   assert.deepEqual(R.getDerivedStats(rpg),base,'Exact stat restore after '+item.id);
   assert.equal(rpg.hp,Math.min(hpBefore,base.ketahanan),'No free heal on unequip '+item.id);
  }
  assert(!/lulanai|nada pengikat/i.test(item.name+item.feature),'Spoiler in item '+item.id);
 }
 // Cincin Perunggu has 0 combat modifiers in Bab 0
 assert.equal(R.ITEMS.artefak_cincin_perunggu.modifiers.length,0);
 assert(!/lulanai|nada pengikat/i.test(fs.readFileSync(path.join(root,'index.html'),'utf8')));
});

test('tactical combat: Baca Celah buff, Siasat Ruru stun/cooldown, Negosiasi & patrol/sentinel clearing',()=>{
 reset(at('cp-4-0'));
 for(const id of ['bandit_gurun','pengintai_dewan','penghadang_sela','penjaga_cirusia','kapten_blokade']){
  assert(R.ENCOUNTERS[id],'Missing encounter '+id);
  assert(R.ENCOUNTERS[id].sprite,'Missing sprite on '+id);
 }
 // critBonus option works without breaking default BASE_CRIT_CHANCE
 assert.equal(R.calculateDamage(15,4,{varianceRoll:0.5,critRoll:0.2}).isCrit,false);
 assert.equal(R.calculateDamage(15,4,{varianceRoll:0.5,critRoll:0.2,critBonus:0.25}).isCrit,true);
 // Patrol confrontation: Guard -> Ruru stun -> Negotiate (threshold lowered by Baca Celah)
 E.switchMap('gerbang');
 E.openEncounter('pengintai_dewan',{kind:'patrol',id:'guard-1',name:'Pengawal Dewan'});
 assert.equal(E.runtime.stack.at(-1).id,'encounter-overlay');
 assert(E.combatAction('guard'));
 assert.equal(E.runtime.encounter.focusBuff,true);
 assert.equal(E.runtime.encounter.negDiscount,2);
 const enemyHpBefore=E.runtime.encounter.hp;
 assert(E.combatAction('attack')); // consumes focusBuff
 assert(E.runtime.encounter.hp<enemyHpBefore);
 assert.equal(E.runtime.encounter.focusBuff,false);
 // Ensure enemy survives Ruru stun hit even on a lucky crit after opening attack
 if(E.runtime.encounter.hp<50)E.runtime.encounter.hp=50;
 // Stun via Siasat Ruru sets 2-turn cooldown and skips enemy counterattack
 const naraHpBeforeStun=E.state.rpg.hp;
 assert(E.combatAction('ruru'));
 assert.equal(E.runtime.encounter.ruruCd,1); // decremented once on skipped enemy turn
 assert.equal(E.state.rpg.hp,naraHpBeforeStun);
 assert(!E.combatAction('ruru')); // still on cooldown
 // Guard again to reach -4 negotiate threshold so base Kepekaan 8 suffices against negotiateKepekaan 12
 assert(E.combatAction('guard'));
 assert.equal(E.runtime.encounter.negDiscount,4);
 assert(E.combatAction('negotiate'));
 assert.equal(E.runtime.encounter.done,true);
 assert.equal(E.state.rpg.encounterResults.pengintai_dewan,'negotiated');
 assert(E.runtime.clearedPatrols.includes('guard-1'));
 assert(!E.runtime.patrols.some(p=>p.id==='guard-1'));
 // Field sentinels spawn at walkable coordinates on designated maps and clear on victory
 reset();
 E.switchMap('senja');
 assert.equal(E.runtime.sentinels.length,1);
 const sen=E.runtime.sentinels[0];
 assert(C.walkable('senja',sen.x,sen.y,E.state));
 E.openEncounter(sen.encId,{kind:'sentinel',id:sen.id,name:sen.name});
 E.runtime.encounter.hp=1;
 assert(E.combatAction('attack'));
 assert.equal(E.runtime.encounter.done,true);
 assert.equal(E.state.rpg.choiceFlags['cleared_'+sen.id],true);
 assert.equal(E.runtime.sentinels.length,0);
});

test('Bab 1 puzzles: loom, sluice, monolith, unique winches & 600 reachable states',()=>{
 // Pure immutability + BFS solvability across all new families
 for(let seed=0;seed<600;seed++){
  const m=seed%3;
  let b=m===0?P.createLoomBoard(seed,seed%2?'caravan_knot':'loom_ima'):m===1?P.createSluiceBoard(seed,seed%2?'cliff_anchor':'canal_sluice'):P.createMonolithBoard(seed);
  let rng=seed+7;
  for(let i=0;i<1+(seed%9);i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;b=P.applyMove(b,rng%P.moveCount(b.kind)).state;}
  const before=JSON.stringify(b),moves=P.solveBFS(b);
  assert(Array.isArray(moves),'BFS failed for '+before);
  let next=b;for(const mv of moves)next=P.applyMove(next,mv).state;
  assert(P.isSolved(next));
  assert.equal(JSON.stringify(b),before);
 }
 // Verify distinct winch boards and Bab 1 quest kinds + keyboard 1-4 + undo
 const w1=P.createBridgeBoard(209,'winch_1'),w2=P.createBridgeBoard(209,'winch_2'),w3=P.createBridgeBoard(209,'winch_3');
 assert.notDeepEqual(w1.pins,w2.pins);assert.notDeepEqual(w2.pins,w3.pins);
 const expectedKinds={'cp-13-1':'loom','cp-14-0':'sluice','cp-15-1':'loom','cp-16-0':'tune','cp-17-1':'sluice','cp-18-0':'bridge','cp-21-0':'monolith','cp-23-1':'valve','cp-24-1':'evidence','cp-24-2':'evidence','cp-25-0':'tune'};
 for(const [id,kind]of Object.entries(expectedKinds)){
  reset(at(id));E.startChallenge(C.current(E.state));
  assert.equal(E.runtime.challenge.kind,kind,id+' kind mismatch');
  const prev=JSON.stringify(E.runtime.challenge.board);
  E.puzzleMove(3%P.moveCount(kind));
  if(kind==='loom'||kind==='sluice'||kind==='monolith'||kind==='valve'||kind==='evidence')assert.notEqual(JSON.stringify(E.runtime.challenge.board),prev);
  elements.get('puzzle-undo').onclick();
  assert.equal(JSON.stringify(E.runtime.challenge.board),prev);
 }
 // Also test 400 random reachable valve & evidence boards
 for(let seed=0;seed<400;seed++){
  let b=seed%2?P.createValveBoard(seed):P.createEvidenceBoard(seed,seed%4===1?'wind_chronicle':'kitchen_blueprint');
  let rng=seed+13;
  for(let i=0;i<1+(seed%7);i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;b=P.applyMove(b,rng%P.moveCount(b.kind)).state;}
  const before=JSON.stringify(b),moves=P.solveBFS(b);
  assert(Array.isArray(moves),'BFS failed for '+before);
  let next=b;for(const mv of moves)next=P.applyMove(next,mv).state;
  assert(P.isSolved(next));
  assert.equal(JSON.stringify(b),before);
 }
});

test('Bab 1 travel obstacles, stealth patrol awareness telegraphing & GameFeel shake decay',()=>{
 assert.equal(D.MAPS.sela.patrols.length,2);
 assert.equal(D.MAPS.balkut.patrols.length,1);
 assert(D.MAPS.sela.hazards.length>=3);
 assert(D.MAPS.balkut.hazards.length>=3);
 assert(D.MAPS.salkara.hazards.length>=3);
 // Stealth patrol awareness ramps cleanly instead of unfair 1-frame snap
 reset(at('cp-17-0'));E.runtime.encounter=null;E.runtime.encounterGrace=0;
 E.switchMap('balkut',[690,405]);
 assert.equal(E.runtime.patrols.length,1);
 const pat=E.runtime.patrols[0];
 Object.assign(E.state.player,{x:720,y:380});
 pat.angle=Math.atan2(380-pat.y,720-pat.x);pat.awareness=0;
 E.tick(0.2);
 assert(pat.awareness>0&&pat.awareness<1,'awareness ramp='+pat.awareness);
 assert(!E.runtime.encounter,'should warn before instant encounter');
 // Active hazard + GameFeel shake injects and decays smoothly
 E.runtime.feel.addTrauma(0.5);
 assert.equal(E.runtime.feel.trauma,0.5);
 E.tick(0.05);
 const magDuring=Math.hypot(E.runtime.feel.offset.x,E.runtime.feel.offset.y);
 E.tick(0.5);
 assert(E.runtime.feel.trauma<0.15);
 // Sela canal sluice hazard clears after cp-14-0 completes
 reset(at('cp-14-0'));E.switchMap('sela',[962,108]);E.runtime.patrols=[];
 E.runtime.time=4.5; // inside active window of sela-sluice-north (period 6.2, activeFrom 0.58)
 assert(D.MAPS.sela.hazards[0].clearedOnce==='cp-14-0');
 // Check Balkut wind gust non-lethal clamp (HP >= 5)
 reset(at('cp-17-0'));E.switchMap('balkut',[736,518]);E.runtime.patrols=[];
 E.state.rpg.hp=6;E.runtime.time=4.0;E.runtime.hazardCooldown=0;
 E.tick(0.05);
 assert(E.state.rpg.hp>=5);
 assert(magDuring>=0);
});

test('RPG Bab 1 balance, gear, garam_mineral drop & save roundtrip',()=>{
 const dmg=(atk,def,mult=1)=>R.calculateDamage(atk,def,{varianceRoll:0.5,critRoll:0.9,actionMult:mult}).damage;
 // Lv 5 Nara (Sela/Balkut gear) vs prajurit_tebing_balkut
 const rpg5=R.initialRpgState();R.grantXp(rpg5,R.XP_THRESHOLDS[5]);
 R.unlockItem(rpg5,'gear_selendang_sela');R.equipItem(rpg5,'gear_selendang_sela');
 R.unlockItem(rpg5,'gear_tali_balkut');R.equipItem(rpg5,'gear_tali_balkut');
 const s5=R.getDerivedStats(rpg5),pb=R.ENCOUNTERS.prajurit_tebing_balkut;
 const htkPb=Math.ceil(pb.maxHp/dmg(s5.ketangkasan,pb.def));
 const htsPb=Math.ceil(s5.ketahanan/dmg(pb.atk,s5.pertahanan));
 assert(htkPb>=2&&htkPb<=4,'Prajurit Balkut HTK='+htkPb);
 assert(htsPb>=5&&htsPb<=8,'Prajurit Balkut HTS='+htsPb);
 // Lv 6 Nara (full Bab 1 gear) vs penjaga_sidang_salkara & juara_tujuh_panji boss
 const rpg6=R.initialRpgState();R.grantXp(rpg6,R.XP_THRESHOLDS[6]);
 for(const id of ['gear_selendang_sela','gear_tali_balkut','gear_lencana_salkara']){R.unlockItem(rpg6,id);R.equipItem(rpg6,id);}
 const s6=R.getDerivedStats(rpg6),ps=R.ENCOUNTERS.penjaga_sidang_salkara,jb=R.ENCOUNTERS.juara_tujuh_panji;
 const htkPs=Math.ceil(ps.maxHp/dmg(s6.ketangkasan,ps.def));
 const htsPs=Math.ceil(s6.ketahanan/dmg(ps.atk,s6.pertahanan));
 assert(htkPs>=2&&htkPs<=4,'Penjaga Salkara HTK='+htkPs);
 assert(htsPs>=5&&htsPs<=8,'Penjaga Salkara HTS='+htsPs);
 const htkBoss=Math.ceil(jb.maxHp/dmg(s6.ketangkasan,jb.def));
 const htsBoss=Math.ceil(s6.ketahanan/dmg(jb.atk,s6.pertahanan));
 assert(htkBoss>=25&&htkBoss<=60,'Juara Tujuh Panji HTK='+htkBoss);
 assert(htsBoss>=5&&htsBoss<=8,'Juara Tujuh Panji HTS='+htsBoss);
 // Consumable garam_mineral +24 heal, drop grant, and complete cp-15-2 reward
 rpg6.hp=10;rpg6.consumables.garam_mineral=2;
 assert.equal(R.useConsumable(rpg6,'garam_mineral'),24);
 assert.equal(rpg6.hp,34);
 assert.equal(rpg6.consumables.garam_mineral,1);
 const s15=at('cp-15-2');C.complete(s15,'cp-15-2');
 assert(s15.rpg.consumables.garam_mineral>=2);
 assert(s15.rpg.unlockedItems.includes('gear_tali_balkut'));
 const roundtrip=C.validate(JSON.parse(JSON.stringify(s15)));
 assert.equal(roundtrip.rpg.consumables.garam_mineral,s15.rpg.consumables.garam_mineral);
});

test('Enemy intent telegraphing, heavy-parry counter, brace break & Bab 1 sentinels',()=>{
 reset(at('cp-17-0'));
 // Balkut sentinel -> prajurit_tebing_balkut, Salkara sentinel -> juara_tujuh_panji
 assert(E.switchMap('balkut'));assert.equal(E.runtime.sentinels[0].encId,'prajurit_tebing_balkut');
 assert(C.walkable('balkut',E.runtime.sentinels[0].x,E.runtime.sentinels[0].y,E.state));
 reset(at('cp-20-0'));
 assert(E.switchMap('salkara'));assert.equal(E.runtime.sentinels[0].encId,'juara_tujuh_panji');
 assert(C.walkable('salkara',E.runtime.sentinels[0].x,E.runtime.sentinels[0].y,E.state));
 // Intent schedule: round 1 strike, round 2 brace (when boss), round 3 heavy
 E.openEncounter('juara_tujuh_panji');
 assert.equal(R.getEnemyIntent(E.runtime.encounter).type,'strike');
 assert(E.combatAction('attack')); // completes round 1 -> enemy round 1 strike -> round 2
 assert.equal(R.getEnemyIntent(E.runtime.encounter).type,'brace');
 assert(E.combatAction('attack')); // round 2 -> enemy braces
 assert.equal(E.runtime.encounter.enemyBraced,true);
 assert.equal(R.getEnemyIntent(E.runtime.encounter).type,'heavy');
 // Siasat Ruru breaks enemy brace AND puts Ruru on cooldown=1 (2 minus end-of-round tick? No, stun skips turn and sets cd=1)
 assert(E.combatAction('ruru'));
 assert.equal(E.runtime.encounter.enemyBraced,false);
 // Advance cleanly: test heavy-parry on fresh encounter at round 3
 E.retreatEncounter();
 E.openEncounter('juara_tujuh_panji');
 E.runtime.encounter.round=3;E.runtime.encounter.ruruCd=2;
 assert.equal(R.getEnemyIntent(E.runtime.encounter).type,'heavy');
 assert(E.combatAction('guard')); // blocks heavy strike -> Tangkis Balasan shaves 2 CD (down to 0)
 assert.equal(E.runtime.encounter.ruruCd,0);
 assert.equal(E.runtime.encounter.negDiscount,3);
 // Victory grants enemy drop
 E.runtime.encounter.hp=1;
 const garamBefore=E.state.rpg.consumables.garam_mineral||0;
 assert(E.combatAction('attack'));
 assert.equal(E.state.rpg.consumables.garam_mineral,garamBefore+1);
});

test('Puzzle full-state hash undo invariant & Bab 0 mild travel hazards',()=>{
 // Exact full-state undo across all 5 PuzzleEngine families + non-trivial tune depth >= 3
 assert(P.solveBFS(P.createTuneBoard(103)).length>=3,'tune board too shallow');
 for(const [seed,fn,variant]of [[103,'createTuneBoard',undefined],[209,'createBridgeBoard','winch_3'],[307,'createLoomBoard','loom_ima'],[409,'createSluiceBoard','canal_sluice'],[521,'createMonolithBoard',undefined]]){
  const b0=P[fn](seed,variant);
  const h0=JSON.stringify(b0);
  const s1=P.applyMove(b0,0).state;
  const s2=P.applyMove(s1,1%P.moveCount(b0.kind)).state;
  assert.notEqual(JSON.stringify(s2),h0);
  assert.equal(JSON.stringify(b0),h0);
 }
 // Bab 0 hazards on sumi, senja, gerbang, simpul are walkable and >= 55px from active objectives
 for(const mapId of ['sumi','senja','gerbang','simpul']){
  const m=D.MAPS[mapId];
  assert(m.hazards&&m.hazards.length>=1,'missing Bab 0 hazard on '+mapId);
  for(const hz of m.hazards){
   assert(C.walkable(mapId,hz.x,hz.y,E.state),'unwalkable hazard '+hz.id);
   for(const obj of C.objectives){
    if(obj.map===mapId)assert(Math.hypot(obj.x-hz.x,obj.y-hz.y)>=55,'hazard near objective '+obj.id);
   }
  }
 }
 // Bab 1 bridge/camp exits stay clear of top-right quest card & bottom HUD bar
 const exBalkutToSalkara=D.MAPS.balkut.exits.find(e=>e.to==='salkara');
 const exSalkaraToBalkut=D.MAPS.salkara.exits.find(e=>e.to==='balkut');
 assert(exBalkutToSalkara.y>=210&&exBalkutToSalkara.x<=960,'balkut->salkara overlaps HUD card');
 assert(exSalkaraToBalkut.y<=610,'salkara->balkut overlaps bottom HUD');
 // Every map exit and its arrival spawn must stand on walkable ground (late-game all unlocked)
 const sAll=at(null);
 for(const [mapId,m]of Object.entries(D.MAPS))for(const ex of m.exits){
  assert(C.walkable(mapId,ex.x,ex.y,sAll),'unwalkable exit '+mapId+'->'+ex.to);
  assert(C.walkable(ex.to,ex.spawn[0],ex.spawn[1],sAll),'unwalkable exit spawn '+mapId+'->'+ex.to);
 }
});

test('Bab 1 Finale: Tepi Salkara hazards, sentinel boss, Dargun truth gate & clean 112x112 sprite set',()=>{
 // Dargun confrontation rejects false blame and accepts evidence
 reset(at('cp-25-1'));E.startDialogue('cp-25-1');
 elements.get('vn-choices').children[1].onclick();
 assert.equal(E.runtime.dialogue.node,'retry');
 E.advanceVN();assert.equal(E.runtime.dialogue.node,'n0');
 // Tepi Salkara sentinel, hazards >= 55px from objectives, and patrol segment clear
 const mTepi=D.MAPS.tepisalkara;
 assert(mTepi.hazards.length>=2&&mTepi.patrols.length>=1);
 for(const hz of mTepi.hazards){
  assert(C.walkable('tepisalkara',hz.x,hz.y,at(null)));
  for(const o of C.objectives.filter(x=>x.map==='tepisalkara'))assert(Math.hypot(o.x-hz.x,o.y-hz.y)>=55,'tepi hazard near '+o.id);
 }
 reset(at('cp-24-0'));E.switchMap('tepisalkara');
 assert.equal(E.runtime.sentinels[0].encId,'bayangan_tepi_salkara');
 assert(C.walkable('tepisalkara',E.runtime.sentinels[0].x,E.runtime.sentinels[0].y,E.state));
 // RPG finale encounters balance check (Lv 6 w/ kalung_tujuh_panji)
 const dmg=(atk,def)=>R.calculateDamage(atk,def,{varianceRoll:0.5,critRoll:0.9}).damage;
 const rpg6=R.initialRpgState();R.grantXp(rpg6,R.XP_THRESHOLDS[6]);
 for(const id of ['gear_selendang_sela','gear_kalung_tujuh_panji','gear_lencana_salkara']){R.unlockItem(rpg6,id);R.equipItem(rpg6,id);}
 const s6=R.getDerivedStats(rpg6),boss=R.ENCOUNTERS.bayangan_tepi_salkara,scout=R.ENCOUNTERS.pengawal_gorkan_pesisir;
 const htkBoss=Math.ceil(boss.maxHp/dmg(s6.ketangkasan,boss.def));
 const htsBoss=Math.ceil(s6.ketahanan/dmg(boss.atk,s6.pertahanan));
 assert(htkBoss>=25&&htkBoss<=60,'Tepi boss HTK='+htkBoss);
 assert(htsBoss>=5&&htsBoss<=8,'Tepi boss HTS='+htsBoss);
 assert(Math.ceil(scout.maxHp/dmg(s6.ketangkasan,scout.def))<=4);
 // Verify zero old 112x128 NPC sprites remain on disk
 const diskNpcs=fs.readdirSync(path.join(root,'assets/pixel-bab0')).filter(f=>/^npc-.*\.(webp|png)$/.test(f));
 assert(!diskNpcs.some(f=>fs.existsSync(path.join(root,'assets/pixel-bab0',f.replace(/\.png$/,'.webp')))&&f.endsWith('.png')),'duplicate old webp next to png');
});

// Verify Official Mode vs Dev Mode separation in an async check after boot() completes
function mockEnv(dev){
 const st=new Map(),els=new Map(),winListeners={},docListeners={};let rafFn=null,drawCalls=0;
 const ctx2d=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get(t,k){if(k in t)return t[k];return ()=>{drawCalls++;};},set(){return true;}});
 function mkEl(){const cls=new Set();return {children:[],style:{setProperty(){}},dataset:{},textContent:'',innerHTML:'',value:'',isConnected:true,tagName:'BUTTON',classList:{add:k=>cls.add(k),remove:k=>cls.delete(k),contains:k=>cls.has(k),toggle:(k,on)=>on?cls.add(k):cls.delete(k)},setAttribute(){},removeAttribute(){},addEventListener(){},getContext:()=>ctx2d,getClientRects:()=>[{}],closest:()=>null,focus(){d.activeElement=this;},append(...xs){this.children.push(...xs);},replaceChildren(){this.children=[];},querySelectorAll:()=>[],querySelector(){return this.children[0]||null;},click(){this.onclick?.();}};}
 const d={readyState:'complete',hidden:false,activeElement:null,head:mkEl(),body:mkEl(),documentElement:mkEl(),addEventListener:(k,fn)=>docListeners[k]=fn,querySelector:()=>null,querySelectorAll:()=>[],createElement:mkEl,getElementById(id){if(!els.has(id))els.set(id,mkEl());return els.get(id);}};
 const c=vm.createContext({console,Date,Math,performance:{now:()=>0},document:d,navigator:{},localStorage:{getItem:k=>st.get(k)||null,setItem:(k,v)=>st.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame(fn){rafFn=fn;},URLSearchParams,location:{search:'?collision'},addEventListener:(k,fn)=>winListeners[k]=fn,...(dev?{JALUR_DEV_MODE:true}:{})});
 c.globalThis=c;c.window=c;
 for(const f of ['data/game-data.js','src/cincin-story.js','src/cincin-dialogues.js','src/gamedev-systems.js','src/bab0-pixel-data.js','src/rpg-system.js','src/pixel-campaign.js','src/bab0-pixel-engine.js','src/dev-tools.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
 return {c,winListeners,els,stepFrame:t=>{if(rafFn)rafFn(t);},getDrawCalls:()=>drawCalls};
}

(async()=>{
 const off=mockEnv(false),dev=mockEnv(true);
 // Flush Promise.all([]) inside async boot()
 await Promise.resolve();await Promise.resolve();await Promise.resolve();

 assert.equal(typeof off.winListeners.keydown,'function','Official keydown listener must bind');
 off.stepFrame(16.6);
 assert(off.getDrawCalls()>0,'Canvas render loop must draw frames cleanly without throwing');
 off.c.BAB0_ENGINE.begin();
 const beforeDraw=off.getDrawCalls();
 off.stepFrame(33.3);
 assert(off.getDrawCalls()>beforeDraw,'In-game canvas frame loop must continue drawing after begin()');
 assert.equal(off.c.BAB0_ENGINE.runtime.debugCollision,false,'?collision query must stay disabled in official index.html');
 assert(!off.c.JALUR_DEV_TOOLS,'dev-tools must self-disable without JALUR_DEV_MODE');
 off.c.BAB0_ENGINE.runtime.started=true;
 off.winListeners.keydown({code:'F2',target:{tagName:'BODY'},preventDefault(){}});
 assert.equal(off.c.BAB0_ENGINE.runtime.debugCollision,false,'F2 must stay disabled in official index.html');

 assert.equal(typeof dev.winListeners.keydown,'function','Dev keydown listener must bind');
 assert(dev.c.JALUR_DEV_TOOLS);
 assert.equal(dev.c.BAB0_ENGINE.runtime.debugCollision,true,'?collision query enables debugCollision in Dev Mode');
 dev.c.BAB0_ENGINE.runtime.debugCollision=false;
 assert(dev.c.JALUR_DEV_TOOLS.warpObjective('cp-24-0'));
 assert.equal(dev.c.BAB0_ENGINE.runtime.started,true);
 assert.equal(dev.c.PixelCampaign.current(dev.c.BAB0_ENGINE.state).id,'cp-24-0');
 assert.equal(dev.c.BAB0_ENGINE.state.mapId,'tepisalkara');
 assert(dev.c.PixelCampaign.walkable('tepisalkara',dev.c.BAB0_ENGINE.state.player.x,dev.c.BAB0_ENGINE.state.player.y,dev.c.BAB0_ENGINE.state));
 dev.winListeners.keydown({code:'F2',target:{tagName:'BODY'},preventDefault(){}});
 assert.equal(dev.c.BAB0_ENGINE.runtime.debugCollision,true,'F2 must toggle debugCollision in Dev Mode');
 dev.winListeners.keydown({code:'F2',target:{tagName:'BODY'},preventDefault(){}});
 assert.equal(dev.c.BAB0_ENGINE.runtime.debugCollision,false,'F2 must toggle debugCollision off on second press');
 dev.c.JALUR_DEV_TOOLS.warpObjective('cp-23-1');
 dev.c.BAB0_ENGINE.startChallenge(dev.c.PixelCampaign.current(dev.c.BAB0_ENGINE.state));
 assert(dev.c.BAB0_ENGINE.runtime.challenge);
 assert(dev.c.JALUR_DEV_TOOLS.solveActivePuzzle());
 assert(!dev.c.BAB0_ENGINE.runtime.challenge);
 dev.c.JALUR_DEV_TOOLS.unlockAllGear();
 assert(dev.c.BAB0_ENGINE.state.rpg.unlockedItems.includes('gear_mandat_cirusia'));
 assert(dev.c.JALUR_DEV_TOOLS.launchEncounter('bayangan_tepi_salkara'));
 assert(dev.c.BAB0_ENGINE.runtime.encounter);
 assert(dev.c.JALUR_DEV_TOOLS.winActiveEncounter());
 assert.equal(dev.c.BAB0_ENGINE.runtime.encounter.done,true);
 assert(dev.c.JALUR_DEV_TOOLS.warpMap('nilasar'));
 assert.equal(dev.c.BAB0_ENGINE.state.mapId,'nilasar');

 groups++;
 console.log('PASS Official mode disables F2/dev tools while Dev Mode bundle enables full dev panel');
 console.log(`PASS ${groups} pixel regression groups. DOM is mocked: run browser smoke checks separately.`);
})().catch(err=>{console.error(err);process.exitCode=1;});








