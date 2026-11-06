/* Pure game rules. DOM and Three.js are intentionally kept out of this module. */
(function(root){
 'use strict';
 class EventBus { constructor(){this.handlers={};} on(name,fn){(this.handlers[name]??=[]).push(fn);return ()=>{this.handlers[name]=this.handlers[name].filter(f=>f!==fn);};} emit(name,data){(this.handlers[name]||[]).forEach(fn=>fn(data));} }
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
 const SAVE_KEY='jalur-senyap-demo1';
 const initial=()=>({version:6,questIndex:0,history:[],notes:[],timings:{},dialogueProgress:null,witnesses:[],capSaksi:[],letterReceived:false,stage:0,status:'ready',completed:[],package:null,weather:'hangat',reputation:{asharim:15,tseren:0,cirusia:0,bahtari:0,lulanai:0},rumors:[],discoveries:[],structures:[],checkpoint:'hub',position:[0,0,46],route:'safe',equipped:['ladder'],unlocked:['cape'],elapsed:0,deliveryTime:0,endingSeen:false,settings:{volume:0.6,quality:'medium',hints:true}});
 class State {
  constructor(data,bus,storage){this.data=data;this.bus=bus;this.storage=storage;this.value=initial();this.canSave=true;this.error=null;this.migrationNotice='';}
  step(){return this.data.quests.steps[this.value.questIndex]||null;}
  index(id){return this.data.quests.steps.findIndex(q=>q.id===id);}
  reached(id,v=this.value){return v.questIndex>this.index(id);}
  hasSave(){try{return !!this.storage?.getItem(SAVE_KEY);}catch{return false;}}
  expected(v){
   const q=this.data.quests.steps[v.questIndex],after=id=>this.reached(id,v);
   const completed=[];if(after('bread_handoff'))completed.push(0);if(after('shell_handoff'))completed.push(1);if(after('report'))completed.push(2);if(!q)completed.push(3);
   let packageIndex=null;
   if(after('take_bag')&&!after('bread_handoff'))packageIndex=0;
   if(after('return_bread')&&!after('shell_handoff'))packageIndex=1;
   if(after('return_shell')&&!after('report'))packageIndex=2;
   if(after('letter'))packageIndex=3;
   return {stage:q?.stage??3,status:q?.status??'complete',weather:q?.weather??'berat',completed,packageIndex,letterReceived:after('letter'),capSaksi:after('stamp')?['asharim']:[],witnesses:after('report')?['asharim']:[]};
  }
  syncProgress(){const e=this.expected(this.value);for(const k of ['stage','status','weather','completed','letterReceived','capSaksi','witnesses'])this.value[k]=e[k];this.value.endingSeen=this.value.status==='complete';}
  validate(v){
   if(!v||v.version!==6||!Number.isInteger(v.questIndex)||v.questIndex<0||v.questIndex>this.data.quests.steps.length)return false;
   const e=this.expected(v),finite=n=>Number.isFinite(n)&&n>=0,strings=a=>Array.isArray(a)&&a.every(x=>typeof x==='string'&&x.length<2000);
   if(!Array.isArray(v.history)||v.history.length!==v.questIndex||!v.history.every((h,i)=>h&&h.step===this.data.quests.steps[i].id&&this.data.quests.steps[i].actions.includes(h.action)&&finite(h.elapsed)))return false;
   for(const k of ['stage','status','weather','letterReceived'])if(v[k]!==e[k])return false;
   for(const k of ['completed','capSaksi','witnesses'])if(JSON.stringify(v[k])!==JSON.stringify(e[k]))return false;
   if(e.packageIndex===null){if(v.package!==null)return false;}else if(!v.package||v.package.id!==this.data.deliveries[e.packageIndex].id||!finite(v.package.integrity)||v.package.integrity>100||v.package.units!==(e.packageIndex===2&&!this.reached('detention',v)?2:1))return false;
   if(!Array.isArray(v.position)||v.position.length!==3||!v.position.every(Number.isFinite)||!['safe','fast'].includes(v.route)||!this.data.world.landmarks.some(l=>l.id===v.checkpoint))return false;
   if(!strings(v.structures)||!v.structures.every(id=>this.data.world.ladders.some(l=>l.id===id))||!strings(v.discoveries)||!v.discoveries.every(id=>this.data.world.discoveries.some(d=>d.id===id))||!strings(v.rumors))return false;
   if(!strings(v.unlocked)||!v.unlocked.every(x=>['cape','ladder'].includes(x))||!strings(v.equipped)||!v.equipped.every(x=>x==='ladder'))return false;
   if(!v.reputation||!['asharim','tseren','cirusia','bahtari','lulanai'].every(k=>finite(v.reputation[k]))||!finite(v.elapsed)||!finite(v.deliveryTime)||v.endingSeen!==(v.questIndex===this.data.quests.steps.length))return false;
   if(!Array.isArray(v.notes)||!v.notes.every(n=>n&&v.history.some(h=>h.action===n.action)&&this.data.quests.notes[n.action]&&n.text===this.data.quests.notes[n.action].text&&n.kind===this.data.quests.notes[n.action].kind))return false;
   if(!v.timings||typeof v.timings!=='object'||Array.isArray(v.timings)||!Object.entries(v.timings).every(([id,n])=>this.index(id)>=0&&finite(n)))return false;
   if(v.dialogueProgress){const {key,node}=v.dialogueProgress;if(!this.data.dialogues[key]?.nodes[node]||key!==this.data.quests.steps[v.questIndex]?.dialogue)return false;}
   return true;
  }
  migrate(v){
   if(!v||![4,5].includes(v.version))return v;
   if(!Number.isInteger(v.stage)||v.stage<0||v.stage>2||!['ready','travel','return','complete'].includes(v.status)||!Array.isArray(v.completed)||!v.completed.every((x,i)=>x===i)||v.completed.length>3||!Array.isArray(v.position)||v.position.length!==3||!v.position.every(Number.isFinite))throw Error('Simpanan lama tidak konsisten.');
   if(v.status==='complete'?(v.stage!==2||v.completed.length!==3):(v.completed.length!==v.stage)||(v.status==='ready'&&v.stage!==0))throw Error('Urutan simpanan lama tidak konsisten.');
   if(v.status==='travel'&&(!v.package||!Number.isFinite(v.package.integrity)||v.package.integrity<0||v.package.integrity>100))throw Error('Kondisi kiriman lama tidak valid.');
   const out=initial();
   const resume=v.stage===0?(v.status==='ready'?'welcome':'bread_route'):v.stage===1?(v.status==='travel'?'shell_crossing':'juma_ledger'):'return_shell';
   out.questIndex=this.index(resume);
   out.history=this.data.quests.steps.slice(0,out.questIndex).map(q=>({step:q.id,action:q.actions[0],elapsed:0,migrated:true}));
   const e=this.expected(out);for(const k of ['stage','status','weather','completed','letterReceived','capSaksi','witnesses'])out[k]=e[k];
   if(e.packageIndex!==null)out.package={id:this.data.deliveries[e.packageIndex].id,integrity:v.package?.integrity??100,units:1};
   out.position=v.stage===2?[0,0,39]:v.position.slice();out.checkpoint=v.stage===2?'hub':v.checkpoint;
   out.route=['safe','fast'].includes(v.route)?v.route:'safe';
   out.settings={...out.settings,...v.settings};out.elapsed=Number.isFinite(v.elapsed)&&v.elapsed>=0?v.elapsed:0;
   out.deliveryTime=e.packageIndex!==null&&Number.isFinite(v.deliveryTime)&&v.deliveryTime>=0?v.deliveryTime:0;
   out.structures=Array.isArray(v.structures)?v.structures.filter(id=>this.data.world.ladders.some(l=>l.id===id)):[];
   out.discoveries=Array.isArray(v.discoveries)?v.discoveries.filter(id=>id!=='lulanai'&&id!=='warjian'&&this.data.world.discoveries.some(d=>d.id===id)):[];
   for(const k of Object.keys(out.reputation)){const old=k==='bahtari'?(v.reputation?.bahtari??v.reputation?.pahitan):v.reputation?.[k];if(Number.isFinite(old)&&old>=0&&k!=='lulanai')out.reputation[k]=old;}
   if(out.questIndex>this.index('return_bread'))out.unlocked=['cape','ladder'];
   this.migrationNotice=v.stage===2?'Simpanan lama dilanjutkan setelah Telaga Sumi. Tugas perbekalan kini dimainkan; surat akan diserahkan setelah laporanmu.':'Simpanan lama disesuaikan dengan langkah questline baru.';
   return out;
  }
  load(){try{
   const raw=this.storage.getItem(SAVE_KEY),old=JSON.parse(raw);this.migrationNotice='';const v=this.migrate(old);
   if(!this.validate(v))throw Error('Format atau urutan simpanan tidak cocok.');
   if(old.version!==6){const key=SAVE_KEY+':backup-v'+old.version;try{if(!this.storage.getItem(key))this.storage.setItem(key,raw);}catch{this.migrationNotice+=' Cadangan belum bisa ditulis; simpanan lama tetap dipertahankan.';throw Error(this.migrationNotice);}}
   this.value={...initial(),...v,settings:{...initial().settings,...v.settings}};
   this.value.settings.volume=Number.isFinite(v.settings?.volume)?clamp(v.settings.volume,0,1):.6;
   this.value.settings.quality=['low','medium','high'].includes(v.settings?.quality)?v.settings.quality:'medium';
   this.value.position=this.value.position.map(n=>clamp(n,-220,220));this.bus.emit('loaded');return true;
  }catch(e){this.error=e.message;return false;}}
  save(position){if(position)this.value.position=position.slice();try{this.storage.setItem(SAVE_KEY,JSON.stringify(this.value));this.canSave=true;this.bus.emit('saved');return true;}catch(e){this.canSave=false;this.error=e.message;this.bus.emit('save-error');return false;}}
  reset(){this.value=initial();this.bus.emit('reset');}
  advance(action){
   const q=this.step(),s=this.value;if(!q||!q.actions.includes(action))return false;
   const before=this.expected(s),integrity=s.package?.integrity??100;
   s.history.push({step:q.id,action,elapsed:s.elapsed,integrity});s.questIndex++;s.dialogueProgress=null;
   const after=this.expected(s);
   if(after.packageIndex===null)s.package=null;
   else if(before.packageIndex!==after.packageIndex){s.package={id:this.data.deliveries[after.packageIndex].id,integrity:100,units:after.packageIndex===2?2:1};s.deliveryTime=0;}
   if(q.id==='detention'){s.package.units=1;s.package.integrity=Math.min(s.package.integrity,action==='DETAIN_PROTECT'?95:72);}
   if(action==='ACCEPT_SHELL'&&!s.unlocked.includes('ladder'))s.unlocked.push('ladder');
   if(q.id==='bread_handoff')s.reputation.asharim+=5;
   if(q.id==='shell_handoff')s.reputation.bahtari+=5;
   if(q.id==='report')s.reputation.asharim+=10;
   const note=this.data.quests.notes[action];if(note)s.notes.push({action,...note});
   this.syncProgress();
   if(q.id==='test_record')this.discover('lulanai');
   if(before.weather!==after.weather)this.bus.emit('weather',after.weather);
   this.bus.emit('quest-advanced',{step:q.id,action,next:this.step()?.id,complete:s.status==='complete'});
   return true;
  }
  canAltar(){return this.step()?.id==='relay_contact'&&this.value.capSaksi.includes('asharim')&&this.value.letterReceived;}
  rumor(text){if(this.value.rumors.includes(text))return false;this.value.rumors.push(text);this.bus.emit('rumor');return true;}
  discover(id){if(!this.data.world.discoveries.some(d=>d.id===id)||this.value.discoveries.includes(id))return false;if(id==='lulanai'&&!this.reached('test_record'))return false;this.value.discoveries.push(id);this.bus.emit('discovery',id);return true;}
  install(id){const s=this.value;if(!s.unlocked.includes('ladder')||!s.equipped.includes('ladder')||s.structures.includes(id)||!this.data.world.ladders.some(l=>l.id===id))return false;s.structures.push(id);s.reputation.asharim+=3;this.bus.emit('structure',id);return true;}
  checkpoint(id,position){if(!this.data.world.landmarks.some(l=>l.id===id))return;this.value.checkpoint=id;this.save(position);this.bus.emit('checkpoint',id);}
  damage(amount){const p=this.value.package;if(!p)return 0;const before=p.integrity;p.integrity=clamp(p.integrity-Math.max(0,amount),0,100);if(before>=60&&p.integrity<60)this.bus.emit('package-damaged');return before-p.integrity;}
  tick(dt,stormExposed,dialogue=false){if(!Number.isFinite(dt)||dt<0)return;const s=this.value;s.elapsed+=dt;const q=this.step();if(q)s.timings[q.id]=(s.timings[q.id]||0)+dt;if(!dialogue&&s.package)s.deliveryTime+=dt;if(!dialogue&&stormExposed&&s.package)this.damage(dt*.8);}
  condition(){const s=this.value,p=s.package;if(!p)return 'Tas kosong';const letter=p.id==='letter_mission';if(letter)return p.integrity<60?'Pembungkus tergores · segel utuh':'Segel utuh · surat tetap dibawa';if(p.id==='delivery_3')return `${p.units}/2 ikat · ${p.integrity<60?'bungkus tergores':p.integrity<90?'tepi bungkus robek':'bungkus terjaga'}`;if(p.integrity<30)return 'Lecet berat · laporkan saat menyerahkan';if(p.integrity<60)return 'Tergores dalam perjalanan';if(p.id==='delivery_1'&&s.deliveryTime>180)return 'Mulai dingin';return p.id==='delivery_1'?'Hangat & harum':'Lagu terjaga';}
  objective(){const q=this.step();if(!q)return {id:'departure',name:'BAB 0 selesai · berikutnya Dusun Sela',hint:this.data.copy.demoComplete,position:[143,26,-111],done:true};const id=q.target==='storm_shelter'?(this.value.route==='fast'?'storm_fast':'storm_safe'):q.target;const o=this.data.quests.objects.find(o=>o.id===id)||this.data.world.npcs.find(o=>o.id===id);return {id,name:q.name,hint:q.hint,position:o?.position||(id==='supply'?[-5,0,39]:id==='altar'?[125,26,-85]:[0,0,31]),done:false};}
  routeId(){const q=this.step();return q?.route==='chosen'?this.value.route:q?.route;}
  routePoints(){const q=this.step(),r=this.data.world.routes[this.routeId()];if(!r)return [this.objective().position];const p=r.points.map(p=>p.slice());return q.reverse?p.reverse():p;}
 }

 class Terrain {
  constructor(world){this.world=world;this.routes=Object.entries(world.routes).map(([id,r])=>({id,...r}));}
  nearest(x,z,route){let best={distance:Infinity};const points=route.points;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[2]-a[2],t=clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz),0,1),px=a[0]+dx*t,pz=a[2]+dz*t,d=Math.hypot(x-px,z-pz);if(d<best.distance)best={distance:d,height:a[1]+(b[1]-a[1])*t,x:px,z:pz,index:i,t};}return best;}
  base(x,z){const fade=clamp((Math.hypot(x,z-35)-24)/30,0,1);let y=(Math.sin(x*.026+z*.018)*1.8+Math.cos(z*.04-x*.02)*1.1-1)*fade;const hill=(cx,cz,h,r,fall)=>h*(1-clamp((Math.hypot(x-cx,z-cz)-r)/fall,0,1));y=Math.max(y,hill(0,-125,18,19,30),hill(125,-85,26,22,50),hill(160,-25,16,16,25));if(x<-61&&x>-83&&z>16&&z<92)y=-12;return y;}
  groundBase(x,z){let y=this.base(x,z);let candidates=[];for(const r of this.routes){if(r.id==='west'&&x<-60&&x>-84&&z>24&&z<70)continue;const p=this.nearest(x,z,r);if(p.distance<r.width+5)candidates.push({...p,width:r.width});}if(candidates.length){candidates.sort((a,b)=>a.distance-b.distance);const p=candidates[0],blend=1-clamp((p.distance-p.width)/5,0,1);y=y*(1-blend)+p.height*blend;}const oasisBlend=1-clamp((Math.hypot(x+135,z-65)-18)/10,0,1);return y*(1-oasisBlend)+2*oasisBlend;}
  height(x,z,currentY=Infinity){for(const b of this.world.bridges||[]){const a=b.from,c=b.to,dx=c[0]-a[0],dz=c[2]-a[2],t=((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz);if(t>=0&&t<=1&&Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t)<=b.width/2){const bh=a[1]+(c[1]-a[1])*t;if(currentY<bh-2.5)continue;return bh;}}return this.groundBase(x,z);}
  slope(x,z){const a=this.height(x+.6,z)-this.height(x-.6,z),b=this.height(x,z+.6)-this.height(x,z-.6);return {x:a/1.2,z:b/1.2,magnitude:Math.hypot(a,b)/1.2};}
  surface(x,z){const s=this.slope(x,z);if(s.magnitude>.85)return 'cliff';if(this.routes.some(r=>r.surface==='rock'&&this.nearest(x,z,r).distance<r.width)||this.height(x,z)>14)return 'rock';return 'sand';}
  speed(surface,weather){return surface==='cliff'?.48:surface==='rock'?1:weather==='berat'?.61:.82;}
 }
 root.JSCore={State,Terrain,EventBus,clamp,distance,initial,SAVE_KEY};
})(globalThis);
