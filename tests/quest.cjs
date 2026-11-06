const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),context=vm.createContext({console});context.window=context;
for(const file of ['data/game-data.js','src/core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const {GAME_DATA:data,JSCore:C}=context;let count=0;
function test(name,fn){fn();console.log('PASS',name);count++;}
function make(){const entries=new Map(),storage={getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)};return {s:new C.State(data,new C.EventBus(),storage),storage,entries};}
function until(s,id){while(s.step()&&s.step().id!==id)assert(s.advance(s.step().actions[0]));}
test('Every action branch completes, survives reload and rejects premature/repeated steps',()=>{
 const choices=data.quests.steps.filter(q=>q.actions.length>1);
 for(let mask=0;mask<2**choices.length;mask++){
  const {s,storage}=make();let branch=0;
  while(s.step()){
   const q=s.step(),action=q.actions.length>1?q.actions[(mask>>branch++)&1]:q.actions[0];
   const before=JSON.stringify(s.value);
   for(const other of data.quests.steps.filter(x=>x.id!==q.id).flatMap(x=>x.actions))assert(!s.advance(other),q.id+' accepted '+other);
   assert.equal(JSON.stringify(s.value),before);
   s.tick(.5,false);assert(s.advance(action));assert(!s.advance(action));assert(s.validate(s.value),q.id);
   s.save([3,0,39]);const reloaded=new C.State(data,new C.EventBus(),storage);assert(reloaded.load(),reloaded.error);assert.equal(JSON.stringify(reloaded.value),JSON.stringify(s.value));
  }
  assert.equal(s.value.completed.join(','),'0,1,2,3');assert.equal(s.value.capSaksi.join(','),'asharim');assert.equal(s.value.package.id,'letter_mission');assert(s.condition().includes('segel')||s.condition().includes('Segel'));assert.equal(s.value.history.length,29);
 }
});
test('Third delivery is not recorded by the shell handoff; custody/report/cap remain separate',()=>{
 const {s}=make();until(s,'well');assert(!s.value.witnesses.length);assert(!s.value.letterReceived);assert(!s.value.notes.some(n=>/penahanan|gagal sebagian/.test(n.text)));
 until(s,'detention');assert.equal(s.value.package.units,2);assert(s.advance('DETAIN_RECEIPT'));assert.equal(s.value.package.units,1);assert(!s.value.completed.includes(2));assert(!s.value.witnesses.length);
 until(s,'warnings');assert(s.value.completed.includes(2));assert(s.value.witnesses.includes('asharim'));assert(!s.value.capSaksi.length);assert(!s.value.letterReceived);
 until(s,'stamp');assert(s.value.letterReceived);assert(!s.value.capSaksi.length);assert(s.advance('STAMP_LETTER'));assert.equal(s.value.capSaksi.length,1);
});
test('Cargo choices change preservation; damage cannot softlock or break the letter seal',()=>{
 const a=make().s,b=make().s;until(a,'detention');until(b,'detention');a.advance('DETAIN_RECEIPT');b.advance('DETAIN_PROTECT');assert(b.value.package.integrity>a.value.package.integrity);
 for(const s of [a,b]){s.damage(999);assert(s.validate(s.value));until(s,'epilogue');s.damage(999);assert(s.condition().includes('segel utuh'));s.advance('FINISH_CHAPTER');assert.equal(s.value.status,'complete');}
});
test('009 requires both signs and a stamp; local trace and epilogue cannot be skipped',()=>{
 const {s}=make();assert(!s.canAltar());assert(!s.discover('lulanai'));until(s,'relay_ring');assert(!s.canAltar());s.advance('INSPECT_RING');assert(s.canAltar());s.advance('CONTACT_LETTER');assert(!s.canAltar());assert(!s.value.endingSeen);assert(!s.value.discoveries.includes('lulanai'));assert(!s.value.notes.some(n=>n.action==='HEAR_TEST_TRACE'));
 until(s,'test_record');assert(!s.value.endingSeen);s.advance('COMPARE_RECORD');assert(s.value.discoveries.includes('lulanai'));assert(!s.value.endingSeen);s.advance('FINISH_CHAPTER');assert(s.value.endingSeen);
});
test('Tampered progression, stamps, cargo and unfinished dialogue are rejected',()=>{
 for(const mutate of [v=>v.capSaksi=['asharim'],v=>v.questIndex=12,v=>v.stage=3,v=>v.completed=[0,1],v=>v.notes=[{kind:'test',text:'invented',action:'CONTACT_LETTER'}],v=>v.dialogueProgress={key:'simpul_sembilan',node:'n0'}]){const {s,storage}=make();mutate(s.value);storage.setItem(C.SAVE_KEY,JSON.stringify(s.value));const next=make().s;next.storage=storage;const before=next.value;assert(!next.load());assert.equal(next.value,before);}
});
test('Dialogue resume points and local timing survive saves',()=>{
 const {s,storage}=make();until(s,'report');s.value.dialogueProgress={key:'maren_report',node:'n3'};s.tick(12,false,true);s.save();const next=new C.State(data,new C.EventBus(),storage);assert(next.load());assert.equal(next.value.dialogueProgress.node,'n3');assert.equal(next.value.timings.report,12);assert.equal(next.value.elapsed,12);next.advance('REPORT_HESITANT');assert.equal(next.value.dialogueProgress,null);
});
test('Version 4 and 5 saves migrate at every old milestone without inventing the third delivery',()=>{
 for(const version of [4,5])for(const [stage,status] of [[0,'ready'],[0,'travel'],[1,'return'],[1,'travel'],[2,'return'],[2,'travel'],[2,'complete']]){
  const {s,storage,entries}=make(),v={...JSON.parse(JSON.stringify(C.initial())),version,stage,status,completed:status==='complete'?[0,1,2]:Array.from({length:stage},(_,i)=>i),package:status==='travel'?{id:'delivery_'+(stage+1),integrity:85}:null};
  const raw=JSON.stringify(v);storage.setItem(C.SAVE_KEY,raw);assert(s.load(),s.error);assert(s.validate(s.value));assert.equal(entries.get(C.SAVE_KEY+':backup-v'+version),raw);
  if(stage===2){assert.equal(s.step().id,'return_shell');assert.equal(s.value.completed.join(','),'0,1');assert(!s.value.letterReceived);assert(!s.value.witnesses.length);assert(!s.value.notes.length);}
  s.save();assert(s.load());assert.equal(entries.get(C.SAVE_KEY+':backup-v'+version),raw);
 }
});
test('A refused legacy backup never replaces the old save',()=>{const {s,storage}=make();const raw=JSON.stringify({...C.initial(),version:5});storage.setItem(C.SAVE_KEY,raw);s.storage={getItem:storage.getItem,setItem(){throw Error('read only')}};assert(!s.load());assert.equal(storage.getItem(C.SAVE_KEY),raw);assert.equal(s.value.questIndex,0);});
console.log(`${count} quest integration groups passed.`);
