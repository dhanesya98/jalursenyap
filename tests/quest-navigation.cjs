const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({console,performance:{now:()=>0}});ctx.window=ctx;
for(const f of ['vendor/three.min.js','data/game-data.js','src/core.js','src/art.js','src/nara-art.js','src/atelier.js','src/companions-art.js','src/travelers-art.js','src/region-art.js','src/quest-world.js','src/world.js','src/controller.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const {THREE:T,JSCore:C,GAME_DATA:data,JSWorld:World,JSPlayer:Player}=ctx;
for(const route of ['safe','fast']){
 const bus=new C.EventBus(),s=new C.State(data,bus,{getItem(){return null},setItem(){}}),w=new World(new T.Scene(),data,s,bus),p=new Player(w,s,bus);p.setPosition([0,0,46]);let elapsed=0,respawns=0;bus.on('respawn',()=>respawns++);
 while(s.step()){
  s.value.route=route;w.sync();const id=s.step().id,points=w.questNavigation(p.position);
  for(const [i,target]of points.entries()){
   let n=0;p.keys={KeyW:true,ShiftLeft:true};
   while(Math.hypot(p.position.x-target[0],p.position.z-target[2])>(i===points.length-1?2.6:1.25)&&n<3600){const yaw=Math.atan2(-(target[0]-p.position.x),-(target[2]-p.position.z));p.update(1/60,yaw,elapsed);elapsed+=1/60;n++;}
   assert(n<3600,`${route}/${id} stuck at ${p.position.toArray()} towards ${target}`);
  }
  p.resetInput();assert.equal(respawns,0,`${route}/${id} fell`);const item=w.nearestInteraction(p.position);assert.equal(item?.id,s.objective().id,`${route}/${id} cannot interact at ${p.position.toArray()}`);
  assert(s.advance(s.step().actions[route==='fast'&&s.step().actions.length>1?1:0]));assert(s.validate(s.value));
 }
 console.log(`PASS ${route}: all 29 quest targets reached through controller; ${Math.round(elapsed)}s assisted travel (not human playtime).`);
}
