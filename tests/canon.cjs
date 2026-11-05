const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({console});context.window=context;
for(const rel of ['data/game-data.js','src/core.js'])vm.runInContext(fs.readFileSync(path.join(root,rel),'utf8'),context,{filename:rel});
const {GAME_DATA:data,JSCore:C}=context;
const entries=new Map(),storage={getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)};
const state=()=>new C.State(data,new C.EventBus(),storage);
let count=0;function test(name,fn){fn();count++;console.log('PASS',name);}
test('Canonical nation ids, images, and no Lulanai stamp',()=>{
 assert.equal(data.canon.year,100);assert.equal(data.canon.nara.age,17);assert.equal(data.canon.nara.birth,83);
 assert.equal(data.canon.nations.map(n=>n.id).join(','),'asharim,tseren,cirusia,bahtari,lulanai');
 assert(!data.canon.letter.stamps.includes('lulanai'));assert.equal(data.canon.letter.requiredNations,3);
 for(const n of data.canon.nations){assert(fs.existsSync(path.join(root,n.image)),n.id);assert(fs.statSync(path.join(root,n.image)).size>100000);}
});
test('Both song choices yield one witness; stamp attaches only with Maren letter handoff',()=>{
 for(const choice of ['A','B']){const s=state();s.accept(0);s.complete(0);s.accept(1);s.complete(1,choice);assert.equal(s.value.witnesses.join(','),'asharim');assert.equal(s.value.capSaksi.length,0);assert(!s.value.letterReceived);assert(s.validate(s.value));s.accept(2);assert.equal(s.value.capSaksi.join(','),'asharim');assert(s.value.letterReceived);assert(s.validate(s.value));s.complete(2);assert.equal(s.value.capSaksi.length,1);assert.equal(s.value.reputation.lulanai,0);assert(s.value.letterReceived);assert(s.condition().includes('Tetap dibawa'));assert(s.validate(s.value));}
});
test('Version 4 saves migrate at every valid checkpoint',()=>{
 const s=state();const snapshots=[];const snapshot=()=>snapshots.push(JSON.parse(JSON.stringify(s.value)));
 snapshot();s.accept(0);snapshot();s.complete(0);snapshot();s.accept(1);snapshot();s.complete(1);snapshot();s.accept(2);snapshot();s.complete(2);snapshot();
 for(const saved of snapshots){saved.version=4;delete saved.witnesses;delete saved.capSaksi;delete saved.letterReceived;saved.reputation.pahitan=saved.reputation.bahtari;saved.reputation.warjian=20;delete saved.reputation.bahtari;delete saved.reputation.lulanai;saved.discoveries=['warjian'];saved.rumors=['Lagu Pahitan; jejak Warjian.'];storage.setItem(C.SAVE_KEY,JSON.stringify(saved));const next=state();assert(next.load(),next.error);assert.equal(next.value.completed.join(','),saved.completed.join(','));assert.equal(next.value.discoveries.join(','),'lulanai');assert(!('pahitan'in next.value.reputation));assert.equal(next.value.reputation.lulanai,0);assert.equal(next.value.version,5);assert(!next.value.rumors[0].includes('Pahitan'));next.save();const again=state();assert(again.load());}
});
test('Corrupt or invented stamps are rejected',()=>{
 const s=state();assert(!s.validate(null));assert(!s.validate({version:5}));s.value.capSaksi=['lulanai'];assert(!s.validate(s.value));s.value.capSaksi=[];s.value.witnesses=['asharim'];assert(!s.validate(s.value));
});
test('Dialogue links, all action ids and critical lore clues stay valid',()=>{
 const actions=new Set(['ACCEPT_DELIVERY_1','ACCEPT_DELIVERY_2','ACCEPT_DELIVERY_3','COMPLETE_DELIVERY_1_A','COMPLETE_DELIVERY_1_B','COMPLETE_DELIVERY_2_A','COMPLETE_DELIVERY_2_B','RECORD_RUMOR','REVEAL_SECRET_PATH','TRIGGER_CLIFFHANGER']);
 for(const d of Object.values(data.dialogues))for(const n of Object.values(d.nodes)){for(const next of [n.next,...(n.choices||[]).map(c=>c.next)].filter(Boolean))assert(d.nodes[next]);for(const a of [n.action,...(n.choices||[]).map(c=>c.action)].filter(Boolean))assert(actions.has(a),a);assert(!/Pahitan|Warjian/.test(n.text));}
 assert(data.dialogues.juma_delivery1.nodes.juma_2.text.includes('Kakekku'));assert(data.dialogues.maren_delivery3.nodes.maren_2.text.includes('Sarai'));assert(data.dialogues.maren_delivery3.nodes.cap_saksi.text.includes('nama Nara'));assert(data.dialogues.simpul_sembilan.nodes.nara_cap.text.includes('Segel surat masih tertutup'));
});
test('Disabled voice never requests a recording and stops an existing voice',()=>{
 let requests=0,paused=false;
 context.Audio=function(){requests++;throw Error('VO must not load');};
 vm.runInContext(fs.readFileSync(path.join(root,'src/audio.js'),'utf8'),context);
 const audio=new context.JSAudio();audio.playVoice('maren_intro_start','Any line');assert.equal(requests,0);
 audio.currentVoice={pause(){paused=true},currentTime:5};audio.playVoice('missing_voice','Other line');assert(paused);assert.equal(audio.currentVoice,null);assert.equal(requests,0);
});
test('Game and atlas load the shared nation UI with all image paths bundled',()=>{
 for(const rel of ['index.html','atlas.html','pos-batu-biru.html']){const html=fs.readFileSync(path.join(root,rel),'utf8');assert(html.includes('src/nations.js'));assert(html.includes('src/nations.css'));assert(html.includes('data/game-data.js'));assert(!/Pahitan|Warjian/.test(html));}
 const compiled=fs.readFileSync(path.join(root,'data/game-data.js'),'utf8');assert(!/Pahitan|Warjian/.test(compiled));assert(!fs.readFileSync(path.join(root,'pos-batu-biru.html'),'utf8').includes('<title>Jalur Senyap — Tahun 100 Telan</title>'));
});
console.log(`${count} canonical integration checks passed.`);
