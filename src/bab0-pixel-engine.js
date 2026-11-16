/* Jalur Senyap pixel runtime — Buku Seorang Perintis, 2026-11-14.
   Campaign/save policy lives in pixel-campaign.js. Original painted maps are preserved.
   All puzzle and dialogue completions are bound to stable objective IDs and one-shot guards. */
(function(root){
 'use strict';
 const C=root.PixelCampaign,D=root.BAB0_DATA,GS=root.JSGamedevSkills,P=GS.PuzzleEngine,R=root.RPGSystem;
 const MAPS=D.MAPS,OBJECTIVES=C.objectives,DB=root.CINCIN_DIALOGUES, $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const feel=new GS.GameFeel();feel.maxOffset={x:14,y:9};
 const state=C.initial(),sprites={},runtime={started:false,stack:[],keys:{},path:[],time:0,scan:0,scanCooldown:0,
   guide:0,exitArmed:false,interactOnArrival:false,interactTarget:null,patrols:[],clearedPatrols:[],sentinels:[],encounter:null,encounterGrace:0,hazardCooldown:0,feel,ruru:{x:610,y:600,dir:'up'},flight:null,auto:false,skip:false,
   autoTime:0,dialogue:null,challenge:null,saveTime:0,hudTime:0,footTime:0,previousButtons:[],focus:null};
 const MAP_SENTINELS={
  senja:[{id:'sentinel-senja',encId:'bandit_gurun',name:'Perampok Jalur Gurun',sprite:'npc-kutlak',x:336,y:384}],
  gerbang:[{id:'sentinel-gerbang',encId:'pengintai_dewan',name:'Pengintai Razia Dewan',sprite:'npc-kesa',x:384,y:424}],
  simpul:[{id:'sentinel-simpul',encId:'pengintai_dewan',name:'Pengintai Jalur Simpul',sprite:'npc-kesa',x:944,y:392}],
  sela:[{id:'sentinel-sela',encId:'penghadang_sela',name:'Pengutip Cukai Kanal Sela',sprite:'npc-dargun',x:712,y:288}],
  balkut:[{id:'sentinel-balkut',encId:'prajurit_tebing_balkut',name:'Penjaga Tebing Balkut',sprite:'npc-hurgak',x:640,y:320}],
  salkara:[{id:'sentinel-salkara',encId:'juara_tujuh_panji',name:'Juara Tujuh Panji',sprite:'npc-salgur',x:320,y:304}],
  tepisalkara:[{id:'sentinel-tepisalkara',encId:'bayangan_tepi_salkara',name:'Utusan Gema Pesisir',sprite:'npc-maruani',x:904,y:264}]
 };
 const top=()=>runtime.stack.at(-1)?.id||null;
 const DEV_MODE=!!root.JALUR_DEV_MODE;
 const cur=()=>C.current(state);
 const storm=()=>!!cur()?.storm;
 const windy=()=>storm()||cur()?.type==='delivery';
 const hasDOM=typeof document!=='undefined';
 let audioContext=null,limiter=null,buses=null,wind=null,windFilter=null,waterAmb=null,waterFilter=null,noiseBuffer=null,bgm=null,shell=null,lastTrack='',activeVoices=0,lastFootIdx=-1,lastVoiceTime=0;
 const MAX_POLYPHONY=10;
 const audioFile=name=>root.PIXEL_AUDIO_ASSETS?.[name]||`assets/audio/sfx/${name}.mp3`;
 const sliderToGain=v=>{const x=C.clamp(Number(v)||0,0,1);return x<=.001?0:x*x;};
 const linearToDb=lin=>lin<=.0001?-80:20*Math.log10(lin);
 function unlockAudio(){
  try{if(!audioContext){
    audioContext=new (root.AudioContext||root.webkitAudioContext)();
    limiter=audioContext.createDynamicsCompressor();
    limiter.threshold.value=-1.5;limiter.knee.value=3;limiter.ratio.value=12;limiter.attack.value=.002;limiter.release.value=.18;
    limiter.connect(audioContext.destination);
    buses={master:audioContext.createGain(),music:audioContext.createGain(),musicDuck:audioContext.createGain(),sfx:audioContext.createGain(),ambience:audioContext.createGain(),ui:audioContext.createGain(),voice:audioContext.createGain()};
    buses.musicDuck.connect(buses.music);buses.music.connect(buses.master);buses.sfx.connect(buses.master);buses.ambience.connect(buses.master);buses.ui.connect(buses.master);buses.voice.connect(buses.master);buses.master.connect(limiter);
    noiseBuffer=audioContext.createBuffer(1,audioContext.sampleRate*2,audioContext.sampleRate);
    const v=noiseBuffer.getChannelData(0);let last=0;for(let i=0;i<v.length;i++){last=(last+.04*(Math.random()*2-1))/1.04;v[i]=last*2.2;}
    const n=audioContext.createBufferSource();n.buffer=noiseBuffer;n.loop=true;
    windFilter=audioContext.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=420;
    wind=audioContext.createGain();wind.gain.value=0;n.connect(windFilter);windFilter.connect(wind);wind.connect(buses.ambience);n.start();
    const wn=audioContext.createBufferSource();wn.buffer=noiseBuffer;wn.loop=true;
    waterFilter=audioContext.createBiquadFilter();waterFilter.type='bandpass';waterFilter.frequency.value=680;waterFilter.Q.value=2.2;
    waterAmb=audioContext.createGain();waterAmb.gain.value=0;wn.connect(waterFilter);waterFilter.connect(waterAmb);waterAmb.connect(buses.ambience);wn.start();
   }
   audioContext.resume().catch(()=>{});updateAudio();
  }catch{} }
 function updateAudio(){
  if(!hasDOM)return;
  const paused=!runtime.started||document.hidden||['pause-overlay','title-overlay','confirm-overlay'].includes(top());
  const track=['nilasar','sumi','sela'].includes(state.mapId)?'desert_sanctuary':'desert_exploration';
  if(typeof Audio!=='undefined'&&track!==lastTrack){bgm?.pause();bgm=new Audio(audioFile(track));bgm.loop=true;lastTrack=track;bgm.addEventListener('error',()=>toast('Musik belum dapat dimuat. Perjalanan tetap dapat dilanjutkan.'));}
  const masterG=sliderToGain(state.settings.volume),musicG=sliderToGain(state.settings.music),fxG=sliderToGain(state.settings.effects);
  const inDiag=top()==='vn-overlay'||top()==='mg-overlay',shellPlaying=!!(shell&&!shell.paused);
  const duck=inDiag?.24:1,shellDuck=shellPlaying?.12:.52;
  if(buses&&audioContext){
   const now=audioContext.currentTime;
   buses.master.gain.setTargetAtTime(paused?0:masterG*.85,now,.08);
   buses.music.gain.setTargetAtTime(musicG,now,.1);
   buses.musicDuck.gain.setTargetAtTime(duck,now,inDiag?.03:.35);
   buses.sfx.gain.setTargetAtTime(fxG,now,.08);
   buses.ambience.gain.setTargetAtTime(fxG*.85,now,.15);
   buses.ui.gain.setTargetAtTime(fxG*.9,now,.08);
   buses.voice.gain.setTargetAtTime(fxG*.85,now,.08);
  }
  if(bgm){bgm.volume=Math.min(1,masterG*musicG*duck*shellDuck);if(paused)bgm.pause();else if(bgm.paused)bgm.play().catch(()=>{});}
  if(shell){shell.volume=Math.min(1,masterG*musicG*.92);if(paused)shell.pause();}
  if(wind&&audioContext){
   const now=audioContext.currentTime,isStorm=storm(),isWind=windy();
   windFilter.frequency.setTargetAtTime(isStorm?920:isWind?580:360,now,.4);
   wind.gain.setTargetAtTime(paused?0:(isStorm?.16:isWind?.055:.022)*(inDiag?.32:1),now,.3);
  }
  if(waterAmb&&audioContext){
   const hasWater=['sumi','sela','nilasar','tepisalkara'].includes(state.mapId);
   waterAmb.gain.setTargetAtTime(paused||!hasWater?0:(state.mapId==='sumi'?.048:state.mapId==='tepisalkara'?.032:.02)*(inDiag?.35:1),audioContext.currentTime,.35);
  }
 }
 function synthNote(freq=440,duration=.09,gain=.06,delay=0,type='triangle',busName='sfx',slideTo=0){
  if(!audioContext||state.settings.volume<=.001||state.settings.effects<=.001||activeVoices>=MAX_POLYPHONY)return;
  try{
   const now=audioContext.currentTime+delay,o=audioContext.createOscillator(),g=audioContext.createGain();
   activeVoices++;o.type=type;o.frequency.setValueAtTime(Math.max(24,freq),now);
   if(slideTo>0)o.frequency.exponentialRampToValueAtTime(Math.max(24,slideTo),now+duration);
   g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(gain,now+Math.min(.014,duration*.25));
   g.gain.exponentialRampToValueAtTime(.0001,now+duration);
   o.connect(g);g.connect(buses?.[busName]||audioContext.destination);
   o.start(now);o.stop(now+duration+.02);
   o.onended=()=>{activeVoices=Math.max(0,activeVoices-1);try{o.disconnect();g.disconnect();}catch{}};
  }catch{activeVoices=Math.max(0,activeVoices-1);}
 }
 function synthNoise(duration=.06,gain=.04,delay=0,filterFreq=900,filterType='bandpass',busName='sfx',q=1.8){
  if(!audioContext||!noiseBuffer||state.settings.volume<=.001||state.settings.effects<=.001||activeVoices>=MAX_POLYPHONY)return;
  try{
   const now=audioContext.currentTime+delay,src=audioContext.createBufferSource(),flt=audioContext.createBiquadFilter(),g=audioContext.createGain();
   activeVoices++;src.buffer=noiseBuffer;flt.type=filterType;flt.frequency.setValueAtTime(filterFreq,now);flt.Q.value=q;
   g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(gain,now+Math.min(.01,duration*.25));
   g.gain.exponentialRampToValueAtTime(.0001,now+duration);
   src.connect(flt);flt.connect(g);g.connect(buses?.[busName]||audioContext.destination);
   src.start(now,Math.random()*1.2,duration+.03);
   src.onended=()=>{activeVoices=Math.max(0,activeVoices-1);try{src.disconnect();flt.disconnect();g.disconnect();}catch{}};
  }catch{activeVoices=Math.max(0,activeVoices-1);}
 }
 function tone(freq=440,duration=.09){synthNote(freq,duration,.055,0,'triangle','sfx');}
 const SFX={
  footstep(surfaceName='Pasir lembut',sprint=false){
   const isSand=surfaceName.includes('Pasir'),isBasalt=surfaceName.includes('Basal'),isCliff=surfaceName.includes('lereng')||surfaceName.includes('Tebing');
   const pool=isSand?[112,122,130,118]:isBasalt?[195,212,226,204]:isCliff?[154,166,174,160]:[162,175,186,168];
   let idx=Math.floor(Math.random()*pool.length);if(idx===lastFootIdx)idx=(idx+1)%pool.length;lastFootIdx=idx;
   const pitch=Math.pow(2,((Math.random()*2-1)*1.0)/12)*(sprint?1.08:1);
   const vol=(sprint?.052:.036)*Math.pow(10,((Math.random()*2-1)*1.5)/20);
   synthNote(pool[idx]*pitch,isSand?.055:.042,vol,0,'triangle','sfx',pool[idx]*pitch*.72);
   synthNoise(isSand?.065:.035,vol*(isSand?.95:.55),0,isSand?680:isBasalt?1650:1200,'bandpass','sfx',isSand?1.4:2.5);
  },
  jump(){synthNote(195,.14,.065,0,'triangle','sfx',340);synthNoise(.07,.035,0,820,'highpass','sfx',1.2);},
  land(surfaceName='Pasir lembut'){synthNote(128,.08,.06,0,'sine','sfx',68);synthNoise(.06,.045,0,surfaceName.includes('Pasir')?540:980,'lowpass','sfx',1.4);},
  ladder(){[0,.09,.18].forEach((d,i)=>{synthNote(190+i*28,.06,.048,d,'triangle','sfx',140);synthNoise(.04,.03,d,1100,'bandpass','sfx',2.4);});},
  sonar(){
   synthNote(523.25,.38,.065,0,'sine','sfx',783.99);
   synthNote(659.25,.42,.05,.09,'sine','sfx',987.77);
   synthNote(1046.5,.55,.04,.18,'triangle','sfx',1318.5);
  },
  sonarReveal(){[587.33,783.99,1046.5,1318.5].forEach((f,i)=>synthNote(f,.26,.055,i*.06,'sine','ui'));},
  vnBlip(speaker='Nara'){
   const now=performance.now();if(now-lastVoiceTime<35)return;lastVoiceTime=now;
   const s=speaker.toLowerCase();
   const base=s.includes('ruru')?680:s.includes('nara')?390:s.includes('marsiyah')||s.includes('lamit')||s.includes('ima')?315:s.includes('kesa')||s.includes('odgar')||s.includes('dargun')?215:265;
   const pitch=base*Math.pow(2,((Math.random()*2-1)*1.2)/12);
   synthNote(pitch,.048,.038,0,s.includes('ruru')?'sine':'triangle','voice',pitch*1.04);
  },
  vnChoice(){synthNote(440,.06,.048,0,'triangle','ui',554.37);},
  uiOpen(kind='modal'){
   if(kind==='journal'||kind==='map'){synthNoise(.08,.045,0,1350,'bandpass','ui',1.6);synthNote(392,.09,.04,.02,'triangle','ui',493.88);}
   else{synthNote(349.23,.08,.045,0,'triangle','ui',440);}
  },
  uiClose(){synthNote(415.3,.07,.04,0,'triangle','ui',311.13);},
  uiClick(){synthNote(520,.035,.035,0,'triangle','ui',620);},
  cargoStep(total=180){
   const f=240+Math.min(240,total);synthNote(f,.07,.05,0,'triangle','sfx',f*.88);
   if(total===180)[523.25,659.25,783.99].forEach((n,i)=>synthNote(n,.18,.05,i*.05,'sine','ui'));
  },
  puzzleMove(i=0){
   synthNote(310+i*65,.11,.055,0,'triangle','sfx',260+i*55);
   synthNote(620+i*110,.16,.032,.02,'sine','sfx');
  },
  puzzleHint(){[587.33,880].forEach((f,i)=>synthNote(f,.16,.045,i*.07,'sine','ui'));},
  timingLock(locks=1){[440,554.37,659.25,880].slice(0,locks+1).forEach((f,i)=>synthNote(f,.16,.055,i*.05,'sine','sfx'));},
  timingMiss(){synthNote(185,.14,.055,0,'sawtooth','sfx',130);},
  puzzleWin(){[392,493.88,587.33,783.99].forEach((f,i)=>synthNote(f,.32,.06,i*.08,'triangle','ui'));},
  questComplete(isRing=false){
   const notes=isRing?[293.66,369.99,440,587.33,739.99]:[329.63,392,493.88,659.25];
   notes.forEach((f,i)=>synthNote(f,.36,.06,i*.085,'sine','ui'));
  },
  stealthAlert(){synthNote(220,.16,.07,0,'sawtooth','sfx',155);synthNote(165,.22,.07,.12,'sawtooth','sfx',110);},
  mapTravel(){synthNoise(.12,.04,0,720,'bandpass','sfx',1.5);[329.63,440,523.25].forEach((f,i)=>synthNote(f,.18,.045,i*.06,'triangle','ui'));},
  saveChime(){[523.25,659.25].forEach((f,i)=>synthNote(f,.14,.04,i*.06,'sine','ui'));},
  waterRefill(){[392,493.88,587.33,659.25].forEach((f,i)=>synthNote(f,.12,.05,i*.05,'sine','sfx',f*1.12));},
  hit(crit=false){synthNoise(.07,.06,0,crit?1500:950,'bandpass','sfx',1.6);synthNote(crit?392:293.66,.09,.07,0,'triangle','sfx',crit?220:140);if(crit)synthNote(587.33,.11,.06,.04,'sine','sfx',880);},
  guard(){synthNote(329.63,.12,.05,0,'sine','sfx',440);synthNote(493.88,.14,.045,.04,'triangle','sfx',523.25);},
  enemyHit(){synthNoise(.09,.065,0,480,'lowpass','sfx',1.3);synthNote(164.81,.13,.07,0,'sawtooth','sfx',92);},
  negotiate(){[349.23,440,523.25].forEach((f,i)=>synthNote(f,.14,.045,i*.06,'sine','ui'));}
 };
 function shellSong(){unlockAudio();if(!shell){shell=new Audio(audioFile('seashell_lullaby'));shell.addEventListener('ended',updateAudio);}
  if(shell.paused){shell.play().then(updateAudio).catch(()=>toast('Rekaman kerang belum dapat diputar.'));toast('Kerang Suara · lagu dari Telaga Sumi');}else{shell.pause();updateAudio();toast('Lagu kerang dijeda.');}}
 function toast(text){if(!hasDOM)return;const el=$('hud-toast');el.textContent=text;el.classList.add('shown');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('shown'),3800);}
 function focusables(id=top()) {const el=id&&$(id);return el?Array.from(el.querySelectorAll('button:not(:disabled),input,select,summary,[tabindex="0"]')).filter(x=>!x.closest('.hidden')&&x.getClientRects().length):[];}
 function syncStack(){if(!hasDOM)return;const active=top();document.querySelectorAll('.modal-backdrop,#vn-overlay').forEach(el=>{el.inert=el.id!==active;el.style.zIndex=String(30+runtime.stack.findIndex(x=>x.id===el.id));});$('hud-topbar').inert=!!active;$('hud-topbar').classList.toggle('vn-active',active==='vn-overlay');if(active)$('hud-prompt').classList.add('hidden');updateAudio();}
 function push(id){
  if(top()===id)return;runtime.stack.push({id,focus:document.activeElement});$(id).classList.remove('hidden');
  if(id==='journal-overlay'||id==='map-overlay')SFX.uiOpen('journal');else if(id!=='vn-overlay')SFX.uiOpen('modal');
  runtime.keys={};runtime.path=[];syncStack();focusables()[0]?.focus();
 }
 function pop(){
  const entry=runtime.stack.pop();if(!entry)return;$(entry.id).classList.add('hidden');
  if(entry.id!=='vn-overlay')SFX.uiClose();
  runtime.keys={};runtime.autoTime=0;syncStack();if(entry.focus?.isConnected&&!entry.focus.closest('.hidden'))entry.focus.focus();else focusables()[0]?.focus();
 }
 function closeAll(){while(runtime.stack.length)pop();}
 function saveToSlot(slot=null,quiet=false){
  try{const key=slot===null?C.PREFIX+'_auto':C.PREFIX+'_slot_'+slot;C.save(localStorage,key,state);$('save-status').textContent='Tersimpan';if(!quiet){SFX.saveChime();toast(slot===null?'Perjalanan tersimpan.':`Slot ${slot+1} tersimpan.`);}return true;
  }catch(e){$('save-status').textContent='Belum tersimpan';if(!quiet||!runtime.saveError)toast('Gagal menyimpan. Penyimpanan browser mungkin penuh atau dinonaktifkan.');runtime.saveError=true;return false;}
 }
 function loadFromSlot(slot=null){
  let result;try{result=C.load(localStorage,slot===null?C.PREFIX+'_auto':C.PREFIX+'_slot_'+slot,slot===null?C.LEGACY:C.LEGACY+'_slot_'+slot);}catch(e){toast('Penyimpanan tidak dapat diakses.');return false;}
  if(!result.data){toast(result.error);return false;}
  closeAll();Object.assign(state,result.data);runtime.started=true;runtime.dialogue=null;runtime.challenge=null;runtime.encounter=null;runtime.encounterGrace=0;runtime.clearedPatrols=[];runtime.flight=null;runtime.scanCooldown=0;runtime.auto=false;runtime.skip=false;
  enterMapRuntime();$('title-overlay').classList.add('hidden');$('hud-topbar').classList.remove('hidden');applySettings();syncHUD();unlockAudio();
  $('save-status').textContent='Tersimpan';if(state.dialogue)startDialogue(state.dialogue.id,state.dialogue.node);
  if(result.recovered||result.migrated)toast(result.recovered?'Simpanan dipulihkan dari cadangan.':'Simpanan pixel lama dipindahkan. Urutan Batu Nama dan sidang diselaraskan.');
  return true;
 }
 function safeStorage(key){try{return localStorage.getItem(key);}catch{return null;}}
 function begin(){
  closeAll();Object.assign(state,C.initial());runtime.started=true;runtime.dialogue=null;runtime.challenge=null;runtime.encounter=null;runtime.encounterGrace=0;runtime.clearedPatrols=[];runtime.flight=null;runtime.scanCooldown=0;runtime.auto=false;runtime.skip=false;
  enterMapRuntime();$('title-overlay').classList.add('hidden');$('hud-topbar').classList.remove('hidden');applySettings();syncHUD();unlockAudio();
  simple('Nara','Pagi di Pos Nilasar',[
   'Matahari pagi baru menyentuh kubah biru Pos Nilasar. Biasanya halaman ini cepat lengang setelah subuh, tapi hari ini puluhan gerobak garam dan gandum justru tertahan di dekat gerbang.',
   'Ruru mengibaskan pasir dari telinganya, lalu mendongak ke arah pendopo berkubah biru. Bu Marsiyah menunggu dengan cawan air pertama.'],()=>{state.introSeen=true;saveToSlot(null,true);toast('WASD / klik tanah: berjalan · E: berinteraksi · Q: bantuan Ruru');});
 }
 function enterMapRuntime(){
  runtime.exitArmed=false;runtime.path=[];runtime.keys={};runtime.flight=null;runtime.interactOnArrival=false;runtime.interactTarget=null;
  const rx=state.player.x-24,ry=state.player.y+12;runtime.ruru={x:C.walkable(state.mapId,rx,ry,state)?rx:state.player.x,y:C.walkable(state.mapId,rx,ry,state)?ry:state.player.y,dir:state.player.dir};
  const clearedP=new Set(runtime.clearedPatrols||[]),flags=state.rpg?.choiceFlags||{};
  runtime.patrols=(MAPS[state.mapId].patrols||[]).filter(p=>!clearedP.has(p.id)).map(p=>({...p,x:p.waypoints[0][0],y:p.waypoints[0][1],wp:1,angle:0,awareness:0}));
  runtime.sentinels=(MAP_SENTINELS[state.mapId]||[]).filter(s=>!flags['cleared_'+s.id]).map(s=>({...s,kind:'sentinel'}));
 }
 function switchMap(map,spawn){if(!C.travel(state,map,spawn)){SFX.timingMiss();toast(C.gateHint(map));return false;}SFX.mapTravel();enterMapRuntime();syncHUD();updateAudio();saveToSlot(null,true);toast(MAPS[map].name);return true;}
 function finish(id){if(!C.complete(state,id))return false;SFX.questComplete(id==='cp-7-2'||id==='cp-9-0'||id==='cp-21-0');syncHUD();saveToSlot(null,true);updateAudio();
  if(!cur())push('ending-modal');else toast((C.done(state,'cp-18-2')&&id==='cp-18-2')?'Jembatan Balkut turun. Karavan kini dapat melintas.':cur().itemLabel);return true;}
 function nearby(){
  const p=state.player,o=cur(),m=MAPS[state.mapId];
  if(o&&o.map===state.mapId&&Math.hypot(o.x-p.x,o.y-p.y)<82)return {kind:'objective',obj:o,label:o.itemLabel+' · E'};
  const link=nearLink();if(link&&link.kind==='ladder')return {kind:'ladder',obj:link,label:'Pasang / panjat tangga tali · E'};
  let best=null,d=72;
  for(const n of m.npcs||[]){const nd=Math.hypot(n.x-p.x,n.y-p.y);if(nd<d){best={kind:'npc',obj:n,label:'Bicara: '+n.name+' · E'};d=nd;}}
  for(const s of runtime.sentinels||[]){const sd=Math.hypot(s.x-p.x,s.y-p.y);if(sd<d){best={kind:'sentinel',obj:s,label:'Hadapi: '+s.name+' · E'};d=sd;}}
  return best;
 }
 function interact(preferred){
  if(top()==='vn-overlay'){advanceVN();return;}if(top()||runtime.flight||state.player.z>5)return;
  const p=state.player,oCur=cur();let near=null;
  if(preferred&&typeof preferred.x==='number'){
    if(oCur&&preferred.id===oCur.id&&Math.hypot(oCur.x-p.x,oCur.y-p.y)<82)near={kind:'objective',obj:oCur};
    else if(preferred.kind==='sentinel'&&Math.hypot(preferred.x-p.x,preferred.y-p.y)<82)near={kind:'sentinel',obj:preferred};
    else if(preferred.name&&Math.hypot(preferred.x-p.x,preferred.y-p.y)<82)near={kind:'npc',obj:preferred};
  }
  near=near||nearby();if(!near)return;
  if(near.kind==='ladder'){useLink('ladder');return;}
  if(near.kind==='sentinel'){const s=near.obj;openEncounter(s.encId,{kind:'sentinel',id:s.id,name:s.name});return;}
  if(near.kind==='npc'){const n=near.obj;if(n.hasShellSong)shellSong();if(n.id==='juru-air'){state.cargo=100;SFX.waterRefill();syncHUD();}
    if(n.poiText&&!state.poiSeen.includes(n.id)){state.poiSeen.push(n.id);state.rumors.push(n.poiText);saveToSlot(null,true);}
    simple(n.name,MAPS[state.mapId].name,[n.poiText||idle[n.id]||'Jalan masih panjang. Periksa catatan perjalananmu sebelum berangkat.']);return;}
  const o=near.obj;
  if(o.sonar&&!state.foundFlags['sonar_'+o.id]){toast('Minta Ruru membaca pijakan ini dahulu · Q');return;}
  if(o.minigame&&!['negotiate_kesa','council_odgar','confront_dargun'].includes(o.minigame)&&!state.foundFlags['puzzle_'+o.id])startChallenge(o);
  else startDialogue(o.id);
 }
 const idle={marsiyah:'Air tidak bertanya nama. Beristirahatlah, lalu lanjutkan jalan yang sudah kau periksa.',bulamat:'Dengarkan airnya, Nara. Kerang ini masih menyimpan lagu orang yang kita tunggu.',jumel:'Lihat pijakanmu sebelum melihat cakrawala.',kesa:'Jaga ucapan dan muatanmu. Perintah di gerbang belum berubah.',ima:'Jangan membawa kegaduhan ke rumah, Nara. Dengarkan baik-baik apa yang kau temukan.',orsuk:'Kafilah membutuhkan jalan, bukan janji yang tak dapat dilalui.',maruani:'Batu menyimpan lebih banyak daripada yang diceritakan orang.',odgar:'Di depan api, bedakan apa yang kau lihat dan apa yang kau duga.',dargun:'Buktikan dulu di Tepi Salkara jika kau berani menantang ingatan Panji Gorkan.',salgur:'Kami berdiri di belakang utusan yang jujur, selama perkemahan tetap tenang.',hurgak:'Panji Dolgak menjaga besi dan kuda—jangan beri penyusup alasan menyalakan api.',kutlak:'Catat siapa yang datang dan pergi di tenda belakang.',borlan:'Roda pedati butuh kedamaian yang nyata, bukan janji kosong.',burgul:'Ikuti angin laut menuju tebing batu bernyanyi di utara.'};
 function scan(){if(!runtime.started||top())return;if(runtime.scanCooldown>0){toast(`Ruru sedang beristirahat · ${Math.ceil(runtime.scanCooldown)} detik`);return;}
  runtime.scan=1.4;runtime.scanCooldown=4;runtime.guide=8;SFX.sonar();const o=cur();
  if(!o){toast('Ruru mendengar angin di perkemahan. Janji berikutnya masih menanti.');return;}
  if(o.map!==state.mapId){toast('Ruru menunjukkan jalur ke '+MAPS[o.map].name);return;}
  const range=state.rpg?.unlockedItems?.includes('alat_lentera_ruru')?220:170;
  if(Math.hypot(state.player.x-o.x,state.player.y-o.y)<range){const first=!state.foundFlags['sonar_'+o.id];state.foundFlags['sonar_'+o.id]=true;if(first&&R&&state.rpg)R.grantXp(state.rpg,10);SFX.sonarReveal();saveToSlot(null,true);toast('Pijakan terbaca · '+o.itemLabel);}else toast('Ikuti arah pirus. Dekati pijakan lalu pindai lagi.');
 }
 function startDialogue(id,node){const entry=DB[id];if(!entry?.dialogue){toast('Catatan percakapan belum tersedia.');return;}
  runtime.dialogue={id,graph:entry.dialogue,node:node||entry.dialogue.node||'n0',callback:()=>finish(id)};
  state.dialogue={id,node:runtime.dialogue.node};push('vn-overlay');renderVN();
 }
 function simple(speaker,title,lines,callback){const nodes={};lines.forEach((text,i)=>nodes['n'+i]={speaker,text,...(i<lines.length-1?{next:'n'+(i+1)}:{})});runtime.dialogue={id:'local',graph:{npc:speaker,title,nodes},node:'n0',callback};push('vn-overlay');renderVN();}
 function portrait(speaker){const n=speaker.toLowerCase();const aliases=[['nara','nara'],['ruru','ruru'],['marsiyah','marsiyah'],['maren','marsiyah'],['lamit','bu-lamit'],['jumel','jumel'],['juma','jumel'],['kesa','kesa'],['ima','ima'],['orsuk','orsuk'],['maruani','maruani'],['odgar','odgar'],['dargun','dargun'],['salgur','salgur'],['hurgak','hurgak'],['kutlak','kutlak'],['borlan','borlan'],['burgul','burgul'],['hemira','hemira'],['sahdan','sahdan'],['tarun','tarun'],['taluk','taluk'],['tiwano','tiwano'],['wilanu','wilanu'],['juru air','wilanu'],['dalumi','dalumi'],['wuren','wuren'],['saryel','saryel'],['azhel','azhel'],['ilyam','ilyam'],['pantang','wakil-pantang'],['terbuka','wakil-terbuka'],['sesal','wakil-sesal'],['garam','pedagang-asharim'],['asharim','pedagang-asharim'],['tseren','pedagang-tseren'],['cirusia','pedagang-cirusia'],['bahtari','pedagang-bahtari'],['perintis','pedagang-bahtari'],['lulanai','perajin-lulanai']];const hit=aliases.find(([name])=>n.includes(name));return hit?sprites['portrait-'+hit[1]]?.src||'':'';}
 function renderVN(){const v=runtime.dialogue,n=v?.graph.nodes[v.node];if(!n)return;
  const lineKey=v.id+':'+v.node;v.wasRead=v.id!=='local'&&state.seenLines.includes(lineKey);
  if(v.id!=='local'){state.dialogue={id:v.id,node:v.node};}
  const speaker=n.speaker||v.graph.npc||'Nara';$('vn-speaker').textContent=speaker;$('vn-role').textContent=v.graph.title||'CATATAN PERJALANAN';$('vn-text').textContent=n.text;SFX.vnBlip(speaker);
  const pSrc=portrait(speaker),pImg=$('vn-portrait'),pWrap=pImg.closest?.('.vn-portrait-wrap');if(pSrc){pImg.src=pSrc;pWrap?.classList.remove('hidden');}else{pImg.removeAttribute?.('src');pWrap?.classList.add('hidden');}
  if(!state.backlog.length||state.backlog.at(-1).key!==lineKey)state.backlog.push({key:lineKey,speaker,text:n.text});state.backlog=state.backlog.slice(-300);
  $('vn-choices').replaceChildren();const choices=n.choices||[];
  for(const ch of choices){const b=document.createElement('button');b.textContent=ch.text;b.onclick=()=>{if(top()!=='vn-overlay'||runtime.dialogue!==v)return;SFX.vnChoice();markRead(v);v.node=ch.next;renderVN();};$('vn-choices').append(b);}
  $('vn-next').classList.toggle('hidden',choices.length>0);$('vn-progress').textContent='Buku I · '+MAPS[state.mapId].name;
  $('vn-auto-btn').setAttribute('aria-pressed',String(runtime.auto));$('vn-skip-btn').setAttribute('aria-pressed',String(runtime.skip));runtime.autoTime=0;
  if(v.id!=='local')saveToSlot(null,true);(choices.length?$('vn-choices').querySelector('button'):$('vn-next'))?.focus();updateAudio();
 }
 function markRead(v){if(!v||v.id==='local')return;const key=v.id+':'+v.node;if(!state.seenLines.includes(key))state.seenLines.push(key);}
 function advanceVN(){if(top()!=='vn-overlay')return;const v=runtime.dialogue,n=v?.graph.nodes[v.node];if(!n||n.choices?.length)return;markRead(v);
  if(n.next){v.node=n.next;renderVN();return;}
  if(v.id!=='local'&&n.action!=='CP_'+v.id.slice(3).replaceAll('-','_')){toast('Percakapan belum menghasilkan tindakan yang sesuai.');return;}
  const callback=v.callback;runtime.dialogue=null;state.dialogue=null;pop();callback?.();
 }
 function cancelChallenge(){runtime.challenge=null;pop();}
 function createBoardFor(minigame){
  if(minigame==='loom_ima'||minigame==='caravan_knot')return P.createLoomBoard(minigame==='caravan_knot'?319:307,minigame);
  if(minigame==='canal_sluice'||minigame==='cliff_anchor')return P.createSluiceBoard(minigame==='cliff_anchor'?421:409,minigame);
  if(minigame==='resonance_batunama')return P.createMonolithBoard(521);
  if(minigame==='sabotage_valve')return P.createValveBoard(613);
  if(minigame==='kitchen_blueprint'||minigame==='wind_chronicle')return P.createEvidenceBoard(701,minigame);
  if(String(minigame||'').startsWith('winch_'))return P.createBridgeBoard(209,minigame);
  return P.createTuneBoard(minigame==='coastal_resonance'?197:103);
 }
 function puzzleMeta(ch){
  const v=ch.board?.variant||ch.minigame||'';
  if(ch.kind==='bridge')return {title:'Tambatan Balkut',desc:'Seimbangkan tiga penahan pada tanda II. Setiap tuas menggerakkan beberapa penahan sekaligus.',moves:['Kiri + tengah','Semua penahan','Tengah + kanan']};
  if(ch.kind==='loom'){
   if(v==='caravan_knot')return {title:'Simpul Tambat Pedati',desc:'Kencangkan keempat simpul tali pedati hingga seluruhnya terkunci (I). Setiap tarikan mengencangkan dua atau tiga simpul.',moves:['Simpul atas','Lingkar kanan','Silang utama','Kunci bawah']};
   return {title:'Kunci Alat Tenun Ima',desc:'Tegangkan keempat benang tenun hingga menyala utuh (✦). Amati benang yang bertaut pada setiap tarikan.',moves:['Pakan atas','Benang kanan','Silang Lulanai','Gelendong bawah']};
  }
  if(ch.kind==='sluice'){
   if(v==='cliff_anchor')return {title:'Jangkar Tebing Blokade',desc:'Ratakan beban tiga katrol batu tambatan ke angka 2 takar agar tali tebing tidak tersentak.',moves:['Katrol 1 → 2','Katrol 2 → 3','Katrol 3 → 1','Tukar ujung']};
   return {title:'Sekat Pintu Air Kanal',desc:'Seimbangkan tinggi air di ketiga bilik kanal ke garis aman 2 takar agar arus jembatan tenang.',moves:['Hulu → Tengah','Tengah → Hilir','Hilir → Hulu','Tukar ujung']};
  }
  if(ch.kind==='monolith')return {title:'Sandi Monolit Batu Nama',desc:'Selaraskan keempat prasasti Batu Nama ke segel utuh (◎). Setiap ketukan nada memajukan dua atau tiga prasasti.',moves:['Prasasti 1 + 2','Prasasti 2 + 3','Prasasti 3 + 4','Nada 1 + 2 + 4']};
  if(ch.kind==='valve')return {title:'Katup Minyak Lentera Sabotase',desc:'Kunci keempat katup selang minyak ke tanda segel penuh (●). Amati pasangan katup yang ikut berputar setiap kali tuas ditarik.',moves:['Katup 1 + 2','Katup 2 + 3','Katup 3 + 4','Katup 1 + 3 + 4']};
  if(ch.kind==='evidence'){
   if(v==='wind_chronicle')return {
    title:'Rekonstruksi Angin & Kapal Bahtari',
    desc:'Cocokkan ketiga kesaksian dermaga dan teluk agar sesuai dengan bukti lapangan.',
    clues:['1. Baling-baling menara sinyal macet menunjuk bara bertiup ke arah darat utara-barat.',
           '2. Kayu lambung kapal Bahtari sudah terempas di karang dua jam sebelum puncak kebakaran.',
           '3. Karena pelaut sudah karam lebih dulu, kebakaran tenda berasal dari kelalaian api di darat.'],
    slots:[
     {label:'Arah Angin Malam Itu',opts:['Ke Laut Selatan','Menuju Darat Utara-Barat','Tenang Tanpa Angin']},
     {label:'Waktu Karam Kapal Bahtari',opts:['Setelah Kebakaran Padam','Tepat Saat Api Menyala','Dua Jam Sebelum Puncak Api']},
     {label:'Kesimpulan Sumber Api',opts:['Obor Penyerang Pelaut','Kelalaian Api Dapur & Angin','Meriam Dewan Tata']}
    ],
    moves:['Ubah Arah Angin','Ubah Waktu Kapal','Ubah Kesimpulan']
   };
   return {
    title:'Denah Dapur Pos Karavan (107 Thn Lalu)',
    desc:'Cocokkan bukti fisik reruntuhan dapur tua untuk menentukan titik awal kebakaran.',
    clues:['1. Jelaga paling tebal membakar batu tepat di sebelah timur tungku masak dalam.',
           '2. Guci minyak lentera cadangan pecah di samping tungku dapur karena panas dari dalam ruangan.',
           '3. Daun pintu selatan menghadap pantai tidak terbakar dari luar; asap justru menerobos ke tembok gudang tenda.'],
    slots:[
     {label:'Titik Awal Api',opts:['Obor Penyerbu di Pantai','Tungku Masak Dalam Ruangan','Sambaran Petir Atap']},
     {label:'Letak Guci Minyak',opts:['Dekat Pintu Pantai Selatan','Tepat di Samping Tungku Dalam','Di Atas Gerobak Luar']},
     {label:'Arah Sebaran Asap',opts:['Keluar ke Laut Selatan','Berhenti di Tembok Barat','Menembus Gudang Tenda']}
    ],
    moves:['Ubah Titik Api','Ubah Letak Minyak','Ubah Sebaran Asap']
   };
  }
  return {title:v==='coastal_resonance'?'Redam Gema Maruani':'Selaraskan Perunggu',desc:'Arahkan ketiga takik ke atas. Setiap putaran menggerakkan dua cincin; amati hubungan di antaranya.',moves:['Luar + tengah','Tengah + dalam','Luar + dalam ↶']};
 }
 function startChallenge(o){
  const kind=o.minigame==='cargo_balance'?'cargo':(o.minigame==='loom_ima'||o.minigame==='caravan_knot')?'loom':(o.minigame==='canal_sluice'||o.minigame==='cliff_anchor')?'sluice':o.minigame==='resonance_batunama'?'monolith':o.minigame==='sabotage_valve'?'valve':(o.minigame==='kitchen_blueprint'||o.minigame==='wind_chronicle')?'evidence':String(o.minigame||'').startsWith('winch_')?'bridge':'tune';
  const board=kind==='cargo'?null:createBoardFor(o.minigame);
  const par=board?P.solveBFS(board)?.length||null:null;
  runtime.challenge={id:o.id,minigame:o.minigame,kind,mode:kind==='evidence'?'logic':state.settings.puzzleMode,done:false,phase:.1,direction:1,locks:0,
   board,par,undo:[],counts:[1,2,1]};
  $('mg-title').textContent=kind==='cargo'?'Timbang bekal kafilah':puzzleMeta(runtime.challenge).title;push('mg-overlay');renderChallenge();
 }
 function puzzleWin(ch){if(runtime.challenge!==ch||ch.done||cur()?.id!==ch.id)return false;ch.done=true;const first=!state.foundFlags['puzzle_'+ch.id];state.foundFlags['puzzle_'+ch.id]=true;if(first&&R&&state.rpg)R.grantXp(state.rpg,25);runtime.challenge=null;pop();feel.addTrauma(.22);SFX.puzzleWin();startDialogue(ch.id);return true;}
 function renderChallenge(){const ch=runtime.challenge;if(!ch)return;const body=$('mg-body');
  const prev=document.activeElement,fSel=prev?.dataset?.plus!==undefined?`[data-plus="${prev.dataset.plus}"]`:prev?.dataset?.minus!==undefined?`[data-minus="${prev.dataset.minus}"]`:prev?.dataset?.move!==undefined?`[data-move="${prev.dataset.move}"]`:prev?.id?`#${prev.id}`:null;
  const restoreFocus=()=>{const el=fSel&&body.querySelector(fSel);(el&&!el.disabled?el:focusables()[0])?.focus();};
  body.replaceChildren();
  if(ch.kind==='cargo'){
    const total=ch.counts[0]*45+ch.counts[1]*30+ch.counts[2]*15;$('mg-desc').textContent='Seimbangkan bekal menjadi 180 kg. Garam, minyak, dan tali tetap dibutuhkan: sisakan sedikitnya satu dari setiap jenis.';
    body.innerHTML=`<div class="cargo-total">${total} / 180 kg</div>`;
    ['Garam · 45 kg','Minyak · 30 kg','Tali · 15 kg'].forEach((label,i)=>{const row=document.createElement('div');row.className='cargo-row';row.innerHTML=`<strong>${label}</strong><div><button data-minus="${i}">−</button><span>${ch.counts[i]}</span><button data-plus="${i}">+</button></div>`;body.append(row);});
    body.querySelectorAll('[data-minus],[data-plus]').forEach(b=>b.onclick=()=>{const add=b.hasAttribute('data-plus'),i=Number(add?b.dataset.plus:b.dataset.minus);ch.counts[i]=C.clamp(ch.counts[i]+(add?1:-1),1,6);SFX.cargoStep(ch.counts[0]*45+ch.counts[1]*30+ch.counts[2]*15);renderChallenge();});
    const b=document.createElement('button');b.className='primary';b.textContent='Kunci muatan';b.disabled=total!==180;b.onclick=()=>puzzleWin(ch);body.append(b);restoreFocus();return;
  }
  if(ch.mode==='timing'){
    $('mg-desc').textContent='Kunci penanda saat berada di bidang hijau. Tiga kunci untuk resonansi; satu untuk tambatan. Mode logika tanpa batas waktu tersedia di pengaturan.';
    body.innerHTML='<div class="timing-track"><div class="timing-zone"></div><div id="timing-needle" class="timing-needle"></div></div><p id="timing-status"></p><button id="timing-hit" class="primary">Kunci irama · Spasi</button>';
    $('timing-hit').onclick=timingHit;restoreFocus();return;
  }
  const meta=puzzleMeta(ch);$('mg-desc').textContent=meta.desc;
  let boardHtml='';
  if(ch.kind==='loom'){
   const knot=ch.board.variant==='caravan_knot';
   boardHtml=`<div class="puzzle-grid">${ch.board.cells.map((v,idx)=>`<div class="dial dial-cell ${v?'is-on':''}"><small>${['AK','AKn','BK','BKn'][idx]}</small><span>${v?(knot?'I':'✦'):(knot?'○':'·')}</span></div>`).join('')}</div>`;
  }else if(ch.kind==='sluice'){
   const labs=ch.board.variant==='cliff_anchor'?['Kiri','Tengah','Kanan']:['Hulu','Tengah','Hilir'];
   boardHtml=`<div class="puzzle-board">${ch.board.levels.map((v,idx)=>`<div class="dial dial-sluice ${v===2?'is-on':''}"><div class="sluice-bar" style="height:${(v/4)*100}%"></div><div class="sluice-target"></div><span>${v}</span><small>${labs[idx]}</small></div>`).join('')}</div>`;
  }else if(ch.kind==='monolith'){
   boardHtml=`<div class="puzzle-board">${ch.board.glyphs.map((v,idx)=>`<div class="dial dial-monolith ${v===0?'is-on':''}"><small>P${idx+1}</small><span>${['◎','◇','△'][v]}</span></div>`).join('')}</div>`;
  }else if(ch.kind==='valve'){
   boardHtml=`<div class="puzzle-board">${ch.board.valves.map((v,idx)=>`<div class="dial dial-valve ${v===2?'is-on':''}"><small>K${idx+1}</small><span>${['○','◑','●'][v]}</span></div>`).join('')}</div>`;
  }else if(ch.kind==='evidence'){
   boardHtml=`<div class="evidence-clues">${(meta.clues||[]).map(c=>`<p>${esc(c)}</p>`).join('')}</div><div class="evidence-board">${(meta.slots||[]).map((sl,idx)=>`<div class="evidence-card"><small>${esc(sl.label)}</small><strong>${esc(sl.opts[ch.board.slots[idx]])}</strong></div>`).join('')}</div>`;
  }else{
   const bridge=ch.kind==='bridge',values=bridge?ch.board.pins:ch.board.rings;
   boardHtml=`<div class="puzzle-board">${values.map(v=>`<div class="dial">${bridge?['0','I','II'][v]:['↑','→','↓','←'][v]}</div>`).join('')}</div>`;
  }
  const parNote=ch.par?` (optimal ${ch.par} langkah)`:'';
  body.innerHTML=`${boardHtml}<div class="puzzle-moves ${meta.moves.length===4?'cols-4':''}">${meta.moves.map((label,i)=>`<button data-move="${i}">${i+1}. ${label}</button>`).join('')}</div><div class="button-row"><button id="puzzle-undo" ${ch.undo.length?'':'disabled'}>Urungkan · Z</button><button id="puzzle-reset">Ulangi</button><button id="puzzle-hint">Petunjuk</button><button id="puzzle-skip">Lewati (Cerita)</button></div><p class="muted">${ch.board.moves} langkah${parNote} · tanpa batas waktu</p>`;
  body.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>puzzleMove(Number(b.dataset.move)));
  $('puzzle-undo').onclick=()=>{if(ch.undo.length){ch.board=ch.undo.pop();SFX.uiClose();}renderChallenge();};
  $('puzzle-reset').onclick=()=>{ch.board=createBoardFor(ch.minigame);ch.par=P.solveBFS(ch.board)?.length||null;ch.undo=[];SFX.uiClick();renderChallenge();};
  $('puzzle-hint').onclick=()=>{SFX.puzzleHint();const hint=P.solveBFS(ch.board);body.querySelectorAll('[data-move]').forEach(b=>b.classList.toggle('hinted',Number(b.dataset.move)===hint?.[0]));toast(hint?.length?'Coba langkah '+(hint[0]+1)+' ('+meta.moves[hint[0]]+').':'Semua penanda sudah selaras.');};
  $('puzzle-skip').onclick=()=>puzzleWin(ch);
  restoreFocus();
 }
 function puzzleMove(i){const ch=runtime.challenge;if(!ch||ch.done||ch.kind==='cargo'||top()!=='mg-overlay')return;if(i<0||i>=P.moveCount(ch.board.kind))return;ch.undo.push(C.clone(ch.board));ch.board=P.applyMove(ch.board,i).state;SFX.puzzleMove(i);if(P.isSolved(ch.board))puzzleWin(ch);else renderChallenge();}
 function timingHit(){const ch=runtime.challenge;if(!ch||ch.done||top()!=='mg-overlay'||ch.mode!=='timing')return;if(ch.phase>=.38&&ch.phase<=.64){ch.locks++;feel.addTrauma(.12);SFX.timingLock(ch.locks);if(ch.locks>=(ch.kind==='bridge'?1:3))puzzleWin(ch);else{ch.phase=.06;$('timing-status').textContent=`${ch.locks} / 3 cincin terkunci`;}}else{feel.addTrauma(.18);SFX.timingMiss();$('timing-status').textContent='Belum selaras. Tunggu penanda di bidang hijau.';}}
 function equipItem(id){if(!R||!state.rpg)return false;const ok=R.equipItem(state.rpg,id);if(ok){SFX.uiClick();refreshMeters();renderJournal();saveToSlot(null,true);}return ok;}
 function unequipItem(id){if(!R||!state.rpg)return false;const ok=R.unequipItem(state.rpg,id);if(ok){SFX.uiClose();refreshMeters();renderJournal();saveToSlot(null,true);}return ok;}
 function renderJournal(){
  const o=cur(),seqs=C.order.filter(i=>OBJECTIVES.some(x=>x.seqIndex===i&&(C.done(state,x.id)||x.id===o?.id)));
  const rpg=state.rpg||R?.initialRpgState(),dStats=R?R.getDerivedStats(rpg):{ketahanan:40,ketangkasan:10,pertahanan:6,kepekaan:8};
  const nextXp=R?.XP_THRESHOLDS[rpg.level+1];
  if($('journal-rpg-stats')){
   $('journal-rpg-stats').innerHTML=`<div class="rpg-xp-bar"><strong>Tingkat ${rpg.level}</strong><span>XP ${rpg.xp}${nextXp?' / '+nextXp:' (Maks)'}</span></div><div class="rpg-stat-grid"><span>Ketahanan<b>${rpg.hp}/${dStats.ketahanan}</b></span><span>Ketangkasan<b>${dStats.ketangkasan}</b></span><span>Pertahanan<b>${dStats.pertahanan}</b></span><span>Kepekaan<b>${dStats.kepekaan}</b></span></div>`;
  }
  $('journal-status').textContent=`${state.completed.length} / 71 langkah · ${state.discovered.length} / 9 wilayah\n${C.bound(state)?'Cincin terikat pada detak Nara':C.hasRing(state)?'Cincin Perunggu ditemukan':'Tas perintis Nilasar'}`;
  $('jtab-perjalanan').innerHTML=seqs.slice().reverse().map(i=>{const st=root.STORY.steps[i],active=o?.seqIndex===i,objs=OBJECTIVES.filter(x=>x.seqIndex===i),complete=objs.every(x=>C.done(state,x.id)),stage=R?R.getQuestStage(state,i,OBJECTIVES):{status:complete?'completed':'active',done:objs.filter(x=>C.done(state,x.id)).length,total:objs.length};const badgeLabel=stage.status==='completed'?'SELESAI':stage.status==='ready'?`SIAP · ${stage.done}/${stage.total}`:`AKTIF · ${stage.done}/${stage.total}`;return `<article class="j-card ${active?'active':complete?'done':''}"><p class="eyebrow">BAB ${i<12?0:1}<span class="quest-badge ${stage.status}">${badgeLabel}</span></p><h3>${esc(st.title)}</h3><p>${esc(active?o.itemLabel:st.note)}</p><ul class="objective-list">${objs.filter(x=>C.done(state,x.id)||x.id===o?.id).map(x=>`<li class="${C.done(state,x.id)?'done':''}">${C.done(state,x.id)?'[x]':'[ ]'} ${esc(x.itemLabel)}</li>`).join('')}</ul>${active?'<button id="journal-find" class="primary">Tunjukkan jalur di peta</button>':''}</article>`;}).join('');
  $('journal-find')?.addEventListener('click',()=>{pop();openMap();});
  $('jtab-rumor').innerHTML=`<h3>Suara dan tempat yang ditemukan</h3>${state.rumors.length?state.rumors.map(r=>`<p class="j-card">${esc(r)}</p>`).join(''):'<p>Catatan akan terisi saat Nara memeriksa jalur dan mendengar kesaksian.</p>'}<h3>Jejak perjalanan · ${state.discovered.length} / 9</h3><p>${state.discovered.map(id=>esc(MAPS[id].name)).join(' · ')}</p><h3>Kepercayaan &amp; Pilihan Jalur</h3><p>${C.done(state,'cp-26-0')?'Gencatan senjata Salkara disahkan bersama Mandat Kesaksian Cirusia.':C.done(state,'cp-18-2')?'Karavan Balkut dapat melintas melalui jembatan yang kau buka.':C.done(state,'cp-6-2')?'Marsiyah menerima laporan jujur dari Gerbang Timur.':'Kepercayaan tumbuh lewat perjalanan yang benar-benar kau jalani.'}</p>`;
  const visibleNations=root.GAME_DATA.canon.nations.filter(n=>!/lulanai/i.test(n.name));
  $('jtab-bangsa').innerHTML=visibleNations.map(n=>`<article class="nation-entry"><p class="eyebrow">${esc(n.region)}</p><h3>${esc(n.name)}</h3><p><i>${esc(n.greeting)}</i></p><p>${esc(n.description)}</p><details><summary>Adat, ekonomi, dan kesepakatan</summary><p>${esc(n.custom)}</p><p>${esc(n.economy)}</p><p>${esc(n.contract)}</p><p>${esc(n.politics)}</p></details></article>`).join('');
  const itemIcon=id=>sprites['item-'+id]?.src||root.PIXEL_BAB0_ASSETS?.['item-'+id]||`assets/items/${id}.png`;
  const gearCards=(R?Object.values(R.ITEMS).filter(it=>rpg.unlockedItems.includes(it.id)):[]).map(it=>{
   const tierCls=it.category==='mystery'?'mystery':it.modifiers?.length?'uncommon':'';
   const badgeText=it.category==='mystery'?'Artefak Misteri':it.modifiers?.length?'Aktif Otomatis':it.tier;
   const modsText=it.modifiers?.length?it.modifiers.map(m=>`+${m.amount} ${m.stat[0].toUpperCase()+m.stat.slice(1)}`).join(' · '):(it.category==='mystery'?'Peninggalan misterius tanpa stat tempur':'Aktif otomatis sebagai alat perintis');
   return `<article class="gear-card ${it.category==='mystery'?'':'equipped'}"><div class="gear-head"><div class="gear-title-row"><img class="gear-icon" src="${esc(itemIcon(it.id))}" alt=""><h3>${esc(it.name)}</h3></div><span class="gear-tier ${tierCls}">${esc(badgeText)}</span></div><p>${esc(it.feature)}</p><div class="gear-mods">${esc(modsText)}</div></article>`;
  }).join('');
  const consCards=R?Object.values(R.CONSUMABLES).map(c=>{const qty=rpg.consumables[c.id]||0;return `<article class="gear-card"><div class="gear-head"><div class="gear-title-row"><img class="gear-icon" src="${esc(itemIcon(c.id))}" alt=""><h3>${esc(c.name)}</h3></div><span class="gear-tier">Sisa ${qty}</span></div><p>${esc(c.desc)}</p><div class="button-row"><button type="button" data-use-cons="${c.id}" ${qty<=0||rpg.hp>=dStats.ketahanan?'disabled':''}>Pakai</button></div></article>`;}).join(''):'';
  $('jtab-perlengkapan').innerHTML=`<p class="muted" style="margin:0 0 10px">Seluruh perlengkapan &amp; pusaka yang kau temukan langsung aktif otomatis sepanjang perjalanan.</p><div class="gear-grid">${gearCards}${consCards}</div>`+(C.done(state,'cp-1-2')?'<div class="button-row"><button id="journal-shell">Putar / jeda Kerang Suara</button></div>':'');
  $('jtab-perlengkapan').querySelectorAll('[data-use-cons]').forEach(b=>b.onclick=()=>{const healed=R.useConsumable(rpg,b.dataset.useCons);if(healed>0){SFX.waterRefill();refreshMeters();renderJournal();saveToSlot(null,true);toast(`Pulih +${healed} Ketahanan.`);}});
  $('journal-shell')?.addEventListener('click',shellSong);
 }
 const mapPoints={nilasar:[260,340],sumi:[100,340],senja:[220,170],gerbang:[390,330],simpul:[515,230],sela:[410,150],balkut:[460,88],salkara:[538,62],tepisalkara:[598,32]};
 function renderMap(){const o=cur();document.querySelectorAll('[data-travel]').forEach(b=>{const id=b.dataset.travel,m=MAPS[id],known=state.discovered.includes(id),open=C.access(state,id);b.disabled=!known||!open;b.classList.toggle('target',o?.map===id);b.innerHTML=`<img src="${sprites[m.bg]?.src||''}" alt=""><strong>${esc(m.name)}</strong><small>${id===state.mapId?'Kamu di sini':!open?'Jalur belum terbuka':known?'Singgahi kembali':'Belum dikunjungi'}${o?.map===id?' · Tujuan aktif':''}</small>`;});
  const canvas=$('route-map');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,650,470);ctx.fillStyle='#dfd0a8';ctx.fillRect(0,0,650,470);
  ctx.strokeStyle='#b39e6b66';ctx.lineWidth=1;for(let i=0;i<14;i++){ctx.beginPath();ctx.ellipse(340,260,70+i*23,30+i*16,-.3,0,Math.PI*2);ctx.stroke();}
  for(const [id,m]of Object.entries(MAPS))for(const ex of m.exits){const a=mapPoints[id],b=mapPoints[ex.to];ctx.setLineDash([5,5]);ctx.strokeStyle=C.access(state,ex.to)?'#687b5c':'#aa9872';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}ctx.setLineDash([]);
  for(const [id,[x,y]]of Object.entries(mapPoints)){ctx.fillStyle=id===state.mapId?'#b1643b':state.discovered.includes(id)?'#3f6b53':'#ac9b73';ctx.beginPath();ctx.arc(x,y,o?.map===id?11:7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eadbbb';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#3d4930';ctx.font='14px Georgia';ctx.textAlign='center';ctx.fillText(({gerbang:'Gerbang Timur',simpul:'Simpul 009',sela:'Dusun Sela',balkut:'Balkut',salkara:'Salkara',tepisalkara:'Tepi Salkara'})[id]||MAPS[id].name,x,y+25);}
  ctx.textAlign='left';ctx.font='italic 17px Georgia';ctx.fillStyle='#766240';ctx.fillText('Lembah Pasir — Pesisir Tepi Salkara',34,430);$('world-atlas-img').src=sprites['world-atlas']?.src||'';
 }
 function openMap(){renderMap();push('map-overlay');}
 function renderSlots(){const box=$('save-slots-box');box.replaceChildren();for(let i=0;i<3;i++){let info='Belum terisi';try{const r=C.load(localStorage,C.PREFIX+'_slot_'+i,C.LEGACY+'_slot_'+i);if(r.data)info=`${r.data.completed.length}/71 · ${MAPS[r.data.mapId].name}${r.recovered?' · cadangan':''}`;}catch{}
  const row=document.createElement('div');row.className='save-slot';row.innerHTML=`<div><strong>Slot ${i+1}</strong><small>${esc(info)}</small></div><div class="button-row"><button data-save="${i}">Simpan</button><button data-load="${i}" ${info==='Belum terisi'?'disabled':''}>Muat</button></div>`;box.append(row);}
  box.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{saveToSlot(Number(b.dataset.save));renderSlots();});box.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadFromSlot(Number(b.dataset.load)));
 }
 function applySettings(){if(!hasDOM)return;document.documentElement.style.setProperty('--text-scale',state.settings.textScale);document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);document.querySelectorAll('[data-setting]').forEach(el=>{if(el.type==='checkbox')el.checked=state.settings[el.dataset.setting];else el.value=state.settings[el.dataset.setting];});updateAudio();}
 function syncHUD(){if(!hasDOM)return;const o=cur();$('hud-progress').textContent=o?`BAB ${o.chapter} · ${state.completed.length+1} / 71`:'BUKU I · TUNTAS';$('hud-location').textContent=MAPS[state.mapId].name;$('hud-seq-title').textContent=o?.seqTitle||'Gencatan Senjata Salkara';$('hud-seq-obj').textContent=o?o.itemLabel+(o.map!==state.mapId?' · '+MAPS[o.map].name:''):'Mandat Kesaksian Cirusia di tangan. Jalan ke Pegunungan Silin menanti.';refreshMeters();}
 function refreshMeters(){
  if(!hasDOM)return;
  const p=state.player,t=C.terrain(state.mapId,p.x,p.y),safe=C.sheltered(state.mapId,p.x,p.y);
  const rpg=state.rpg||R?.initialRpgState(),dStats=R?R.getDerivedStats(rpg):{ketahanan:40};
  const prevXp=R?.XP_THRESHOLDS[rpg.level]||0,nextXp=R?.XP_THRESHOLDS[rpg.level+1];
  if($('hud-level-num'))$('hud-level-num').textContent=String(rpg.level);
  if($('xp-meter')){$('xp-meter').min=prevXp;$('xp-meter').max=nextXp||Math.max(prevXp+1,rpg.xp);$('xp-meter').value=nextXp?rpg.xp:Math.max(prevXp+1,rpg.xp);}
  if($('hud-xp-text'))$('hud-xp-text').textContent=nextXp?`${rpg.xp}/${nextXp} XP`:'Maks';
  if($('hud-rpg-level'))$('hud-rpg-level').textContent='Perintis Nilasar · Thn 103';
  if($('hp-meter')){$('hp-meter').max=dStats.ketahanan;$('hp-meter').value=rpg.hp;}
  $('cargo-meter').value=state.cargo;
  $('hud-weather').textContent=storm()?(safe?'Badai · berlindung':'Badai · cari tempat teduh'):windy()?'Angin lintas jalur · jaga muatan':'Angin teduh';
  $('hud-terrain').textContent=t.name+(runtime.flight?' · memanjat':p.z>0?' · melompat':'');
  const sonarSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M5 12a7 7 0 0 1 14 0"/><path d="M2 12a10 10 0 0 1 20 0"/></svg>';
  $('btn-sonar').innerHTML=runtime.scanCooldown>0?`${sonarSvg} Ruru · ${Math.ceil(runtime.scanCooldown)} dtk`:`${sonarSvg} Ruru <kbd>Q</kbd>`;
 }
 function nearLink(kind){const p=state.player;for(const link of C.links[state.mapId]||[]){if(kind&&link.kind!==kind)continue;for(const reverse of [false,true]){const from=reverse?link.to:link.from;if(Math.hypot(from[0]-p.x,from[1]-p.y)<65)return {...link,from,to:reverse?link.from:link.to};}}return null;}
 function useLink(kind='ladder'){if(kind!=='ladder'||top()||runtime.flight||state.player.z>0)return;const link=nearLink('ladder');if(!link){toast('Dekati tangga tali untuk memanjat.');return;}if(!C.walkable(state.mapId,...link.to,state))return;runtime.flight={...link,start:[state.player.x,state.player.y],t:0,duration:1.8};runtime.path=[];SFX.ladder();}
 function jump(){if(top()||runtime.flight||state.player.z>0)return;state.player.vz=175;state.player.z=.1;SFX.jump();}
 function move(dx,dy){const p=state.player;[p.x,p.y]=C.movePoint(state.mapId,p.x,p.y,dx,dy,state);}
 function checkpoint(){const p=state.lastSafe;if(p){switchMap(p.mapId,[p.x,p.y]);state.cargo=Math.max(50,state.cargo);}}
 function hazardState(h){
  const cleared=!!(h.clearedOnce&&C.done(state,h.clearedOnce));
  const phase=h.period?((runtime.time%h.period)/h.period):1;
  const active=!cleared&&(h.kind==='slick'||phase>=(h.activeFrom??0.55));
  const telegraph=!cleared&&!active&&h.kind!=='slick'&&phase>=((h.activeFrom??0.55)-0.25);
  return {cleared,phase,active,telegraph};
 }
 function tick(dt){runtime.time+=dt;feel.update(dt);pollGamepad();
  if(top()==='mg-overlay'&&runtime.challenge?.mode==='timing'){const ch=runtime.challenge;ch.phase+=ch.direction*dt*(ch.kind==='bridge'?.9:1.2);if(ch.phase>.96||ch.phase<.04){ch.phase=C.clamp(ch.phase,.04,.96);ch.direction*=-1;}if($('timing-needle'))$('timing-needle').style.left=(ch.phase*100)+'%';}
  if(top()==='vn-overlay'&&runtime.dialogue){const v=runtime.dialogue,n=v.graph.nodes[v.node];if(!n.choices?.length&&(runtime.auto||(runtime.skip&&v.wasRead))){runtime.autoTime+=dt;const wait=runtime.skip&&v.wasRead?.18:Math.max(2.5,n.text.length*.045);if(runtime.autoTime>wait)advanceVN();}}
  if(!runtime.started||top())return;
  state.elapsed+=dt;runtime.scanCooldown=Math.max(0,runtime.scanCooldown-dt);runtime.scan=Math.max(0,runtime.scan-dt);runtime.guide=Math.max(0,runtime.guide-dt);runtime.encounterGrace=Math.max(0,(runtime.encounterGrace||0)-dt);runtime.hazardCooldown=Math.max(0,(runtime.hazardCooldown||0)-dt);
  const p=state.player,o=cur();const previous=[p.x,p.y],terr=C.terrain(state.mapId,p.x,p.y),safe=C.sheltered(state.mapId,p.x,p.y);
  let hazardSpeed=1,hazardPush=[0,0],activeHazards=[];
  for(const h of MAPS[state.mapId].hazards||[]){
   const hs=hazardState(h);if(!hs.active)continue;
   if(Math.hypot(p.x-h.x,p.y-h.y)<h.r&&p.z<4&&!safe){
    activeHazards.push(h);
    hazardSpeed=Math.min(hazardSpeed,h.kind==='slick'?.76:h.kind==='rock_slide'?.72:.8);
    if(h.push){const scale=runtime.path.length?.32:1;hazardPush[0]+=h.push[0]*scale;hazardPush[1]+=h.push[1]*scale;}
   }
  }
  if(runtime.flight){const f=runtime.flight;f.t=Math.min(1,f.t+dt/f.duration);p.x=f.start[0]+(f.to[0]-f.start[0])*f.t;p.y=f.start[1]+(f.to[1]-f.start[1])*f.t;p.z=Math.sin(f.t*Math.PI)*7;if(f.t===1){p.z=0;runtime.flight=null;}}
  else{
   let pathDistance=Infinity;
   let dx=(runtime.keys.KeyD||runtime.keys.ArrowRight?1:0)-(runtime.keys.KeyA||runtime.keys.ArrowLeft?1:0),dy=(runtime.keys.KeyS||runtime.keys.ArrowDown?1:0)-(runtime.keys.KeyW||runtime.keys.ArrowUp?1:0);
   if(dx||dy){runtime.path=[];runtime.interactOnArrival=false;runtime.interactTarget=null;}else if(runtime.path.length){const target=runtime.path[0],dist=Math.hypot(target[0]-p.x,target[1]-p.y);if(dist<.0001)runtime.path.shift();else{pathDistance=dist;dx=(target[0]-p.x)/dist;dy=(target[1]-p.y)/dist;}}
   const mag=Math.hypot(dx,dy);if(mag){dx/=mag;dy/=mag;p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
   const sprint=runtime.keys.ShiftLeft||runtime.keys.ShiftRight;
   if(p.z>0){p.vz-=dt*460;p.z=Math.max(0,p.z+p.vz*dt);if(p.z===0){p.vz=0;feel.addTrauma(.12);SFX.land(terr.name);}}
   const downhill=dy>0&&terr.height>10;const speed=(sprint?240:170)*terr.speed*(downhill&&sprint?1.22:1)*(storm()&&!safe?.82:1)*hazardSpeed;
   const distance=Math.min(speed*dt,pathDistance);move(dx*distance,dy*distance);
   if(hazardPush[0]||hazardPush[1])move(hazardPush[0]*dt,hazardPush[1]*dt);
   if(activeHazards.length&&!runtime.path.length){const hit=activeHazards.find(h=>h.damage>0);if(hit&&runtime.hazardCooldown<=0){runtime.hazardCooldown=1.65;feel.addTrauma(.22);SFX.hit();if(state.rpg){const drop=Math.min(hit.damage,Math.max(0,state.rpg.hp-5));if(drop>0)state.rpg.hp-=drop;refreshMeters();}toast(hit.name+' menerpa! Lompat [Spasi] atau tunggu reda.');}}
   if(windy()&&!safe){if(!runtime.path.length)move((9+Math.sin(runtime.time*1.7)*7)*dt*(storm()?1:.4),1.7*dt);if(o?.seqIndex>=4&&o.seqIndex<=8)state.cargo=Math.max(0,state.cargo-dt*(sprint?1.5:.35)*(storm()?1:.5));}
   if(safe)state.cargo=Math.min(100,state.cargo+dt*3);
   if(state.cargo===0){SFX.stealthAlert();feel.addTrauma(.24);checkpoint();toast('Muatan perlu diikat ulang. Kembali ke pijakan aman.');return;}
  }
  p.moving=Math.hypot(p.x-previous[0],p.y-previous[1])>.1;if(p.moving){const sp=runtime.keys.ShiftLeft||runtime.keys.ShiftRight;p.walkTime+=dt*4;runtime.footTime+=dt;if(runtime.footTime>(sp?.29:.38)&&p.z===0){runtime.footTime=0;SFX.footstep(terr.name,sp);}}
  const m=MAPS[state.mapId];if(!C.inExit(state.mapId,p.x,p.y,18))runtime.exitArmed=true;
  if(runtime.exitArmed&&!runtime.flight)for(const ex of m.exits){if(Math.hypot(p.x-ex.x,p.y-ex.y)<ex.r){if(!C.access(state,ex.to)){runtime.exitArmed=false;runtime.path=[];toast(C.gateHint(ex.to));}else switchMap(ex.to,ex.spawn);return;}}
  for(const patrol of runtime.patrols){const target=patrol.waypoints[patrol.wp],dx=target[0]-patrol.x,dy=target[1]-patrol.y,dist=Math.hypot(dx,dy);if(dist<5)patrol.wp=(patrol.wp+1)%patrol.waypoints.length;else{patrol.x+=dx/dist*patrol.speed*dt;patrol.y+=dy/dist*patrol.speed*dt;patrol.angle=Math.atan2(dy,dx);}
   if(o?.stealth&&o.map===state.mapId&&runtime.encounterGrace<=0){const d=Math.hypot(p.x-patrol.x,p.y-patrol.y),a=Math.atan2(p.y-patrol.y,p.x-patrol.x)-patrol.angle,diff=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));const spotted=!safe&&d<patrol.visionDist&&diff<patrol.visionAngle&&C.lineClear(state.mapId,[patrol.x,patrol.y],[p.x,p.y]);
    if(spotted){const prevA=patrol.awareness||0;patrol.awareness=Math.min(1,prevA+dt*(runtime.keys.ShiftLeft||runtime.keys.ShiftRight?1.4:.92));if(prevA<.35&&patrol.awareness>=.35)toast('Awas! '+patrol.name+' menoleh ke arahmu!');if(patrol.awareness>=1){patrol.awareness=0;feel.addTrauma(.28);SFX.stealthAlert();runtime.encounterGrace=2.5;openEncounter(state.mapId==='sela'?'penghadang_sela':'pengintai_dewan',{kind:'patrol',id:patrol.id,name:patrol.name});toast('Terlihat pengintai! Hadapi atau tawarkan negosiasi.');return;}}
    else patrol.awareness=Math.max(0,(patrol.awareness||0)-dt*.65);
   }else patrol.awareness=0;
  }
  if(!top()&&!runtime.flight&&runtime.encounterGrace<=0){
   for(const s of runtime.sentinels||[]){
    const dx=p.x-s.x,dy=p.y-s.y;
    if((dx*dx)/(28*28)+(dy*dy)/(14*14)<=1){
     runtime.path=[];runtime.keys={};runtime.interactOnArrival=false;runtime.interactTarget=null;
     runtime.encounterGrace=2.5;feel.addTrauma(.22);SFX.stealthAlert();
     openEncounter(s.encId,{kind:'sentinel',id:s.id,name:s.name});
     toast(s.name+' menghadang jalanmu!');
     return;
    }
   }
  }
  const r=runtime.ruru;let target=[p.x-24,p.y+12];if(runtime.guide>0&&o?.map===state.mapId){const dist=Math.hypot(o.x-p.x,o.y-p.y);if(dist>1){const q=[p.x+(o.x-p.x)/dist*45,p.y+(o.y-p.y)/dist*45];if(C.walkable(state.mapId,...q,state))target=q;}}else if(storm())target=[p.x-12,p.y+7];
  // Ruru uses the same ground boundaries; following must not cut over water or cliff corners.
  if(!C.walkable(state.mapId,...target,state))target=[p.x,p.y];
  r.repath=Math.max(0,(r.repath||0)-dt);
  if(C.segmentClear(state.mapId,[r.x,r.y],target,state))r.path=[];
  else {
   if(!r.repath){r.path=C.path(state.mapId,[r.x,r.y],target,state);r.repath=.4;}
   if(r.path?.length){if(Math.hypot(r.path[0][0]-r.x,r.path[0][1]-r.y)<2)r.path.shift();if(r.path.length)target=r.path[0];}
  }
  const rx=target[0]-r.x,ry=target[1]-r.y;[r.x,r.y]=C.movePoint(state.mapId,r.x,r.y,rx*(1-Math.exp(-dt*5)),ry*(1-Math.exp(-dt*5)),state);r.dir=Math.abs(rx)>Math.abs(ry)?rx>0?'right':'left':ry>0?'down':'up';
  if(runtime.interactOnArrival&&!runtime.path.length){const target=runtime.interactTarget;runtime.interactOnArrival=false;runtime.interactTarget=null;interact(target);}
  runtime.saveTime+=dt;if(runtime.saveTime>15&&!runtime.flight&&p.z===0){runtime.saveTime=0;saveToSlot(null,true);}
  runtime.hudTime+=dt;if(runtime.hudTime>.15){runtime.hudTime=0;refreshMeters();const near=nearby();$('hud-prompt').classList.toggle('hidden',!near);if(near)$('hud-prompt').textContent=near.label;}
 }
 function draw(){if(!hasDOM)return;const canvas=$('game-canvas'),ctx=canvas.getContext('2d'),m=MAPS[state.mapId],o=cur(),t=state.settings.reducedMotion?0:runtime.time,p=state.player;
  const sh=state.settings.reducedMotion?{x:0,y:0}:feel.offset;
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#302e23';ctx.fillRect(0,0,1280,720);ctx.save();ctx.translate(sh.x,sh.y);if(sprites[m.bg])ctx.drawImage(sprites[m.bg],0,0,1280,720);
  for(const rect of m.coverRects||[]){const x=rect[0]*12.8,y=rect[1]*7.2,w=(rect[2]-rect[0])*12.8,h=(rect[3]-rect[1])*7.2;if(sprites['prop-cargo'])ctx.drawImage(sprites['prop-cargo'],x-6,y-28,w+12,h+36);}
  for(const h of m.hazards||[]){
   const hs=hazardState(h);
   ctx.save();
   if(hs.cleared){ctx.strokeStyle='rgba(222,197,139,.22)';ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.beginPath();ctx.ellipse(h.x,h.y,h.r,h.r*.52,0,0,Math.PI*2);ctx.stroke();ctx.restore();continue;}
   if(h.kind==='slick'){ctx.fillStyle='rgba(78,162,158,.18)';ctx.strokeStyle='rgba(145,223,204,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(h.x,h.y,h.r,h.r*.52,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
   else if(h.kind==='sluice_surge'||h.kind==='resonance_field'){
    const col=h.kind==='sluice_surge'?(hs.active?'rgba(84,198,232,.36)':'rgba(84,198,232,.14)'):(hs.active?'rgba(218,168,84,.3)':'rgba(218,168,84,.12)');
    const stroke=h.kind==='sluice_surge'?'#6ed8f5':'#e8be6b';
    ctx.fillStyle=col;ctx.strokeStyle=hs.active||hs.telegraph?stroke:stroke+'66';ctx.lineWidth=hs.active?2.5:1.5;
    if(hs.telegraph)ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(h.x,h.y,h.r*(hs.active?1+Math.sin(t*10)*.05:1),h.r*.52,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   }else{
    const col=h.kind==='wind_gust'?(hs.active?'rgba(232,196,120,.34)':'rgba(232,196,120,.14)'):(hs.active?'rgba(210,104,64,.36)':'rgba(210,104,64,.14)');
    const stroke=h.kind==='wind_gust'?'#ebd291':'#e27b52';
    ctx.fillStyle=col;ctx.strokeStyle=hs.active||hs.telegraph?stroke:stroke+'66';ctx.lineWidth=hs.active?2.4:1.4;
    if(!hs.active)ctx.setLineDash([5,5]);ctx.beginPath();ctx.ellipse(h.x,h.y,h.r,h.r*.54,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(hs.active&&!state.settings.reducedMotion){ctx.setLineDash([]);ctx.strokeStyle=stroke;for(let k=-1;k<=1;k++){const sx=h.x-h.r*.6+((t*140+k*24)%Math.max(12,h.r*1.1));ctx.beginPath();ctx.moveTo(sx,h.y+k*10);ctx.lineTo(sx+18,h.y+k*10+4);ctx.stroke();}}
   }
   ctx.restore();
  }
  for(const [x,y] of m.lights||[]){const glow=ctx.createRadialGradient(x*12.8,y*7.2,0,x*12.8,y*7.2,23+Math.sin(t*2+x)*3);glow.addColorStop(0,'#efbd5638');glow.addColorStop(1,'#efbd5600');ctx.fillStyle=glow;ctx.fillRect(x*12.8-28,y*7.2-28,56,56);}
  if(storm()){for(const s of C.shelters[state.mapId]||[]){ctx.fillStyle='rgba(68,126,110,.12)';ctx.fillRect(s[0]*12.8,s[1]*7.2,(s[2]-s[0])*12.8,(s[3]-s[1])*7.2);}}
  // Actual bridge state is readable in the world, not just in a journal sentence.
  if(state.mapId==='balkut'){const open=C.done(state,'cp-18-2');if(!open){ctx.save();ctx.translate(886,216);ctx.rotate(-.42);ctx.fillStyle='#202c25e6';ctx.strokeStyle='#dcba77';ctx.lineWidth=2;ctx.fillRect(-46,-38,92,52);ctx.strokeRect(-46,-38,92,52);ctx.beginPath();ctx.moveTo(-46,-8);ctx.lineTo(46,8);ctx.moveTo(-46,8);ctx.lineTo(46,-8);ctx.stroke();ctx.restore();}}
  function nextPortalTo(from,goal){if(!goal||from===goal)return null;const q=[[from,null]],seen=new Set([from]);for(let i=0;i<q.length;i++){const [curId,firstHop]=q[i];for(const ex of MAPS[curId]?.exits||[]){if(!C.access(state,ex.to)||seen.has(ex.to))continue;const hop=firstHop||ex.to;if(ex.to===goal)return hop;seen.add(ex.to);q.push([ex.to,hop]);}}return null;}
  const nextHop=o&&o.map!==state.mapId?nextPortalTo(state.mapId,o.map):null;
  const worldLabels=[];
  for(const ex of m.exits){const open=C.access(state,ex.to),target=open&&(ex.to===nextHop||o?.map===ex.to);if(target){const pulse=Math.sin(t*3.5),pg=ctx.createRadialGradient(ex.x,ex.y,2,ex.x,ex.y,42+pulse*4);pg.addColorStop(0,'rgba(125,238,255,0.55)');pg.addColorStop(1,'rgba(56,189,248,0)');ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(ex.x,ex.y,42+pulse*4,20+pulse*2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5ee7ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(ex.x,ex.y,26+pulse*2.5,13+pulse*1.2,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#e0faff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(ex.x,ex.y,17+pulse*1.5,8+pulse*.8,0,0,Math.PI*2);ctx.stroke();const ang=Math.atan2(ex.y-p.y,ex.x-p.x),dist=Math.hypot(ex.x-p.x,ex.y-p.y);if(dist>48){ctx.save();for(let s=1;s<=3;s++){const d=Math.min(dist-24,38+s*22),ax=p.x+Math.cos(ang)*d,ay=p.y+Math.sin(ang)*d;ctx.save();ctx.translate(ax,ay);ctx.rotate(ang);ctx.globalAlpha=0.35+0.45*((Math.sin(t*5-s*1.1)+1)/2);ctx.strokeStyle='#7deeff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(3,0);ctx.lineTo(-6,6);ctx.stroke();ctx.restore();}ctx.restore();}}else{ctx.strokeStyle=open?'#dec58b':'#a87655';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(ex.x,ex.y,24,12,0,0,Math.PI*2);ctx.stroke();}worldLabels.push({cls:'portal-label'+(open?(target?' target':''):' locked'),text:open?(target?'Tujuan: '+ex.label:ex.label):'Jalur tertutup',x:ex.x,y:ex.y-20});}
  if(state.mapId==='balkut'&&!C.done(state,'cp-18-2'))worldLabels.push({cls:'portal-label locked',text:'TERANGKAT',x:886,y:190});
  for(const link of C.links[state.mapId]||[]){ctx.strokeStyle='#e6cca0';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(...link.from);ctx.lineTo(...link.to);ctx.stroke();ctx.setLineDash([]);worldLabels.push({cls:'link-label',text:'E',x:link.from[0],y:link.from[1]});}
  for(const guard of runtime.patrols){if(o?.stealth){ctx.save();ctx.translate(guard.x,guard.y);ctx.rotate(guard.angle);ctx.fillStyle=(guard.awareness||0)>.35?'#d9483668':'#b4563550';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,guard.visionDist,-guard.visionAngle,guard.visionAngle);ctx.fill();ctx.restore();if((guard.awareness||0)>.05){ctx.save();ctx.strokeStyle=guard.awareness>.5?'#e04a38':'#f0be59';ctx.lineWidth=3;ctx.beginPath();ctx.arc(guard.x,guard.y-58,9,-Math.PI/2,-Math.PI/2+Math.PI*2*guard.awareness);ctx.stroke();ctx.fillStyle='#f8ebd2';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('!',guard.x,guard.y-54);ctx.restore();}}}
  if(runtime.guide>0&&o?.map===state.mapId){ctx.strokeStyle='#75c6aa88';ctx.lineWidth=2;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(o.x,o.y);ctx.stroke();ctx.setLineDash([]);}
  if(runtime.scan>0){ctx.strokeStyle='#91dfcc';ctx.lineWidth=3;ctx.globalAlpha=runtime.scan/1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,(1.4-runtime.scan)*230,(1.4-runtime.scan)*125,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  const actors=[];for(const n of m.npcs||[])actors.push({x:n.x,y:n.y,sp:sprites[n.sprite],w:46,h:54,name:n.name,target:o?.npc===n.id});for(const g of runtime.patrols)actors.push({x:g.x,y:g.y,sp:sprites[g.sprite],w:46,h:54});for(const s of runtime.sentinels||[])actors.push({x:s.x,y:s.y,sp:sprites[s.sprite],w:46,h:54,name:s.name,sentinel:true});
  if(state.mapId==='simpul'&&o?.seqIndex===10)actors.push({x:1125,y:410,sp:sprites['npc-maruani'],w:40,h:56,name:'Siluet di bukit'});
  const r=runtime.ruru;actors.push({x:r.x,y:r.y,sp:sprites['ruru-'+r.dir],w:32,h:32,bob:p.moving?Math.abs(Math.sin(t*6))*3:0});actors.push({x:p.x,y:p.y,sp:sprites['nara-'+p.dir],w:46,h:50,bob:p.z+(p.moving?Math.abs(Math.sin(p.walkTime*4))*3:0),player:true});
  actors.sort((a,b)=>a.y-b.y);for(const a of actors){ctx.fillStyle='#211c174d';ctx.beginPath();ctx.ellipse(a.x+5,a.y,15,6,-.3,0,Math.PI*2);ctx.fill();if(a.sentinel){const pulse=Math.sin(t*3.6);ctx.fillStyle='rgba(217,72,54,.22)';ctx.beginPath();ctx.ellipse(a.x,a.y-1,28+pulse*1.5,14+pulse*.75,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e05338';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(a.x,a.y-1,28+pulse*1.5,14+pulse*.75,0,0,Math.PI*2);ctx.stroke();}if(a.sp)ctx.drawImage(a.sp,Math.round(a.x-a.w/2),Math.round(a.y-a.h+4-(a.bob||0)),a.w,a.h);if(a.target){const ty=a.y-a.h-10+Math.sin(t*3.5)*3;const ng=ctx.createRadialGradient(a.x,a.y-4,2,a.x,a.y-4,28);ng.addColorStop(0,'rgba(94,231,255,0.45)');ng.addColorStop(1,'rgba(56,189,248,0)');ctx.fillStyle=ng;ctx.beginPath();ctx.ellipse(a.x,a.y-2,28,13,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#7deeff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(a.x,a.y-1,20+Math.sin(t*3)*2,9,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#7deeff';ctx.strokeStyle='#132b36';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a.x,ty);ctx.lineTo(a.x-7,ty-10);ctx.lineTo(a.x+7,ty-10);ctx.closePath();ctx.fill();ctx.stroke();}if(a.name&&Math.hypot(a.x-p.x,a.y-p.y)<160)worldLabels.push({cls:'npc-label',text:a.name,x:a.x,y:a.y+8});}
  const wl=$('world-labels');if(wl&&canvas.getBoundingClientRect){const rc=canvas.getBoundingClientRect();const key=Math.round(rc.left)+','+Math.round(rc.top)+','+Math.round(rc.width)+','+Math.round(rc.height)+'|'+worldLabels.map(l=>`${l.cls}:${l.text}@${Math.round(l.x)},${Math.round(l.y)}`).join(';');if(wl.dataset.key!==key){wl.dataset.key=key;wl.replaceChildren();for(const l of worldLabels){const el=document.createElement('span');el.className=l.cls;el.textContent=l.text;el.style.left=(rc.left+(l.x/1280)*rc.width)+'px';el.style.top=(rc.top+(l.y/720)*rc.height)+'px';wl.append(el);}}}
  if(o?.map===state.mapId&&!o.npc){const pulse=Math.sin(t*3.5),og=ctx.createRadialGradient(o.x,o.y-4,2,o.x,o.y-4,38+pulse*4);og.addColorStop(0,'rgba(125,238,255,0.62)');og.addColorStop(0.55,'rgba(56,189,248,0.28)');og.addColorStop(1,'rgba(56,189,248,0)');ctx.fillStyle=og;ctx.beginPath();ctx.ellipse(o.x,o.y-2,38+pulse*4,18+pulse*2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5ee7ff';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(o.x,o.y,21+pulse*3,10+pulse*1.2,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#e0faff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(o.x,o.y,13+pulse*1.5,6+pulse*.7,0,0,Math.PI*2);ctx.stroke();const dy=o.y-24+pulse*3;ctx.fillStyle='#7deeff';ctx.strokeStyle='#132b36';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(o.x,dy-8);ctx.lineTo(o.x+7,dy);ctx.lineTo(o.x,dy+8);ctx.lineTo(o.x-7,dy);ctx.closePath();ctx.fill();ctx.stroke();}
  if(runtime.flight){ctx.strokeStyle='#dec187';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y-p.z-28);ctx.lineTo(...runtime.flight.to);ctx.stroke();}
  if(storm()&&!state.settings.reducedMotion){ctx.fillStyle='#e9cc9377';for(let i=0;i<65;i++){const x=(i*137+runtime.time*240)%1280,y=(i*73+runtime.time*28)%720;ctx.fillRect(x,y,13,2);}}
  if(runtime.debugCollision){ctx.save();for(const [polys,color] of [[m.walkPolygons,'#36ec7860'],[m.blockPolygons,'#ff333388']]){ctx.fillStyle=color;ctx.strokeStyle=color;for(const poly of polys){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}}ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.ellipse(p.x,p.y,7,4,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  ctx.restore();
  const gradient=ctx.createRadialGradient(640,360,280,640,360,790);gradient.addColorStop(0,'#15231600');gradient.addColorStop(1,storm()?'#59391b66':'#14241a44');ctx.fillStyle=gradient;ctx.fillRect(0,0,1280,720);
 }
 function back(){if(top()==='title-overlay')return;if(top()==='mg-overlay'){cancelChallenge();return;}if(top()==='encounter-overlay'){retreatEncounter();return;}if(top()==='vn-overlay'){renderSlots();push('pause-overlay');return;}if(top()){pop();return;}if(runtime.started){renderSlots();push('pause-overlay');}}
  function action(code){if(code==='F2'){if(DEV_MODE)runtime.debugCollision=!runtime.debugCollision;return;}if(code==='Escape'){back();return;}if(top()==='mg-overlay'){if(code==='Space'||code==='KeyE')timingHit();if(/^Digit[1-4]$/.test(code))puzzleMove(Number(code.slice(-1))-1);if(code==='KeyZ')$('puzzle-undo')?.click();return;}
  if(top()==='encounter-overlay'){if(/^Digit[1-5]$/.test(code)){const idx=Number(code.slice(-1))-1;$('enc-actions')?.querySelectorAll('button')?.[idx]?.click();}return;}
  if(top()==='vn-overlay'){const btns=Array.from($('vn-choices').querySelectorAll('button'));if(['ArrowUp','KeyW','ArrowLeft','KeyA','ArrowDown','KeyS','ArrowRight','KeyD'].includes(code)){if(btns.length){const up=['ArrowUp','KeyW','ArrowLeft','KeyA'].includes(code),i=btns.indexOf(document.activeElement);btns[(i+(up?-1:1)+btns.length)%btns.length]?.focus();}}if(code==='KeyE'||code==='Space'){if(btns.length&&btns.includes(document.activeElement))document.activeElement.click();else advanceVN();}if(code==='KeyB')openBacklog();if(code==='KeyV'){runtime.auto=!runtime.auto;runtime.skip=false;renderVN();}if(code==='KeyT'){runtime.skip=!runtime.skip;runtime.auto=false;renderVN();}return;}
  if(top())return;if(code==='KeyE')interact();else if(code==='Space')jump();else if(code==='KeyQ')scan();else if(code==='KeyM')openMap();else if(code==='KeyJ'||code==='Tab'){renderJournal();push('journal-overlay');}}
 function openBacklog(){$('vn-backlog-list').innerHTML=state.backlog.map(b=>`<article class="j-card"><strong>${esc(b.speaker)}</strong><p>${esc(b.text)}</p></article>`).join('');push('vn-backlog-overlay');}
 function pollGamepad(){if(!hasDOM||!navigator.getGamepads||!document.hasFocus())return;const pad=Array.from(navigator.getGamepads()).find(Boolean);if(!pad)return;
  const pressed=pad.buttons.map(b=>b.pressed);const edge=i=>pressed[i]&&!runtime.previousButtons[i];
  if(!top()){runtime.keys.ArrowLeft=pad.axes[0]<-.25;runtime.keys.ArrowRight=pad.axes[0]>.25;runtime.keys.ArrowUp=pad.axes[1]<-.25;runtime.keys.ArrowDown=pad.axes[1]>.25;runtime.keys.ShiftRight=pressed[5];runtime.keys.Space=pressed[0];if(edge(0))jump();if(edge(2))interact();if(edge(3))scan();if(edge(1))back();if(edge(9))back();}
  else{if(edge(1)||edge(9))back();else if(edge(0)){if(top()==='mg-overlay'&&runtime.challenge?.mode==='timing')timingHit();else document.activeElement?.click();}const axis=pad.axes[1]>.6?1:pad.axes[1]<-.6?-1:0;const move=edge(13)||edge(15)?1:edge(12)||edge(14)?-1:axis&&axis!==runtime.prevAxis?axis:0;if(move){const f=focusables(),i=f.indexOf(document.activeElement);f[(i+move+f.length)%f.length]?.focus();}runtime.prevAxis=axis;}
  runtime.previousButtons=pressed;
 }
 const titleParallax={tx:0,ty:0,cx:0,cy:0,hover:false,idx:0,timer:0,activeSlot:0};
 const slideUrl=f=>(DEV_MODE&&root.location?.pathname?.includes('Bab0-TopDown-Pixel')?'../assets/title-slides/':'assets/title-slides/')+f;
 function updateSlideMeta(slides,idx){
  const s=slides[idx];if(!s)return;
  if($('title-slide-title'))$('title-slide-title').textContent=s.title;
  if($('title-slide-region'))$('title-slide-region').textContent=`${s.region} · ${idx+1}/${slides.length}`;
 }
 const preloadImg=u=>{if(typeof Image!=='function')return null;const i=new Image();i.src=u;return i;};
 function goTitleSlide(delta){
  const slides=root.BAB0_DATA?.TITLE_SLIDES;if(!slides?.length)return;
  const nextIdx=(titleParallax.idx+delta+slides.length)%slides.length;
  const next=slides[nextIdx],src=slideUrl(next.file),fallback=root.PIXEL_BAB0_ASSETS?.['title-cover']||'assets/pixel-bab0/title-cover.webp';
  const imgA=$('title-bg'),imgB=$('title-bg-next');if(!imgA||!imgB||typeof Image!=='function')return;
  const loader=new Image();
  const commit=chosen=>{
   titleParallax.idx=nextIdx;
   const incoming=titleParallax.activeSlot===0?imgB:imgA,outgoing=titleParallax.activeSlot===0?imgA:imgB;
   incoming.src=chosen;
   incoming.classList.add('is-active');outgoing.classList.remove('is-active');
   titleParallax.activeSlot=titleParallax.activeSlot===0?1:0;
   updateSlideMeta(slides,nextIdx);
   const ahead=slides[(nextIdx+1)%slides.length];if(ahead)preloadImg(slideUrl(ahead.file));
  };
  loader.onload=()=>commit(src);loader.onerror=()=>{if(nextIdx===0)commit(fallback);};loader.src=src;
 }
 function initTitleShowcase(on){
  const overlay=$('title-overlay'),slides=root.BAB0_DATA?.TITLE_SLIDES;if(!overlay||!slides?.length)return;
  updateSlideMeta(slides,0);
  if($('title-bg')){$('title-bg').src=slideUrl(slides[0].file);$('title-bg').onerror=()=>{$('title-bg').src=root.PIXEL_BAB0_ASSETS?.['title-cover']||'';};}
  const ahead=slides[1];if(ahead)preloadImg(slideUrl(ahead.file));
  const restartTimer=()=>{if(titleParallax.timer&&typeof clearInterval==='function')clearInterval(titleParallax.timer);titleParallax.timer=setInterval(()=>{if(!document.hidden&&!overlay.classList.contains('hidden'))goTitleSlide(1);},6500);};
  restartTimer();
  on('title-slide-prev',()=>{goTitleSlide(-1);restartTimer();});
  on('title-slide-next',()=>{goTitleSlide(1);restartTimer();});
  overlay.addEventListener('pointermove',e=>{
   const r=overlay.getBoundingClientRect();if(!r.width||!r.height)return;
   titleParallax.tx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
   titleParallax.ty=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
   titleParallax.hover=true;
  });
  overlay.addEventListener('pointerleave',()=>{titleParallax.hover=false;});
 }
 function stepTitleParallax(now){
  const overlay=$('title-overlay');if(!overlay||overlay.classList.contains('hidden'))return;
  if(state.settings?.reducedMotion){
   if(titleParallax.cx||titleParallax.cy){titleParallax.cx=0;titleParallax.cy=0;overlay.style.setProperty('--px-bg-x','0px');overlay.style.setProperty('--px-bg-y','0px');overlay.style.setProperty('--px-atm-x','0px');overlay.style.setProperty('--px-atm-y','0px');overlay.style.setProperty('--px-fg-x','0px');overlay.style.setProperty('--px-fg-y','0px');overlay.style.setProperty('--px-seal-x','0px');overlay.style.setProperty('--px-seal-y','0px');}
   return;
  }
  const t=now*0.00045;
  const idleX=Math.sin(t)*0.32,idleY=Math.cos(t*0.78)*0.24;
  const gx=titleParallax.hover?titleParallax.tx*0.85+idleX*0.15:idleX;
  const gy=titleParallax.hover?titleParallax.ty*0.85+idleY*0.15:idleY;
  titleParallax.cx+=(gx-titleParallax.cx)*0.075;
  titleParallax.cy+=(gy-titleParallax.cy)*0.075;
  const x=titleParallax.cx,y=titleParallax.cy;
  overlay.style.setProperty('--px-bg-x',(-x*20).toFixed(2)+'px');
  overlay.style.setProperty('--px-bg-y',(-y*13).toFixed(2)+'px');
  overlay.style.setProperty('--px-atm-x',(-x*36).toFixed(2)+'px');
  overlay.style.setProperty('--px-atm-y',(-y*22).toFixed(2)+'px');
  overlay.style.setProperty('--px-fg-x',(x*8).toFixed(2)+'px');
  overlay.style.setProperty('--px-fg-y',(y*5).toFixed(2)+'px');
  overlay.style.setProperty('--px-seal-x',(x*14).toFixed(2)+'px');
  overlay.style.setProperty('--px-seal-y',(y*9).toFixed(2)+'px');
 }
 function bind(){
  window.addEventListener('keydown',e=>{if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
    if(e.code==='Tab'&&top()){const f=focusables(),i=f.indexOf(document.activeElement);if(f.length){e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}return;}
    if(!top()||top()==='vn-overlay'||top()==='mg-overlay')e.preventDefault();}
   if(top()&&['INPUT','SELECT'].includes(e.target.tagName)&&e.code!=='Escape')return;
   runtime.keys[e.code]=true;if(!e.repeat&&(runtime.started||e.code==='Escape'))action(e.code);
  });window.addEventListener('keyup',e=>{runtime.keys[e.code]=false;});window.addEventListener('blur',()=>{runtime.keys={};runtime.path=[];});document.addEventListener('visibilitychange',()=>{runtime.keys={};updateAudio();});
  $('game-canvas').addEventListener('pointerdown',e=>{if(!runtime.started||top())return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*1280/r.width,y=(e.clientY-r.top)*720/r.height;
    const targets=[...(MAPS[state.mapId].npcs||[]),...(runtime.sentinels||[]),...(cur()?.map===state.mapId?[cur()]:[])];const target=targets.find(o=>Math.hypot(o.x-x,o.y-y)<48);
    if(target&&Math.hypot(target.x-state.player.x,target.y-state.player.y)<80){interact(target);return;}
    runtime.path=C.path(state.mapId,[state.player.x,state.player.y],[x,y],state);runtime.interactOnArrival=!!target;runtime.interactTarget=target||null;
    if(!runtime.path.length&&Math.hypot(x-state.player.x,y-state.player.y)>16)toast('Pijakan itu belum dapat dicapai. Coba jalur yang terbuka.');});
  const on=(id,fn)=>$(id)?.addEventListener('click',fn);
  on('btn-start',()=>{if(safeStorage(C.PREFIX+'_auto'))push('confirm-overlay');else begin();});on('confirm-new',begin);on('btn-continue',()=>loadFromSlot());on('btn-title-help',()=>push('help-overlay'));on('btn-help',()=>push('help-overlay'));
  on('btn-open-journal',()=>{renderJournal();push('journal-overlay');});on('btn-open-map',openMap);on('btn-track',openMap);on('btn-open-pause',()=>{renderSlots();push('pause-overlay');});on('btn-sonar',scan);on('hud-prompt',interact);
  on('btn-checkpoint',()=>{closeAll();runtime.dialogue=null;state.dialogue=null;checkpoint();});on('btn-title',()=>{const saved=saveToSlot(null,true);runtime.dialogue=null;runtime.challenge=null;runtime.auto=false;runtime.skip=false;runtime.interactOnArrival=false;runtime.interactTarget=null;closeAll();runtime.started=false;$('hud-topbar').classList.add('hidden');$('title-overlay').classList.remove('hidden');runtime.stack=[{id:'title-overlay'}];$('btn-continue').classList.toggle('hidden',!(saved||safeStorage(C.PREFIX+'_auto')||safeStorage(C.PREFIX+'_auto.bak')||safeStorage(C.LEGACY)));syncStack();focusables()[0]?.focus();});
  on('vn-next',advanceVN);on('vn-backlog-btn',openBacklog);on('vn-auto-btn',()=>{runtime.auto=!runtime.auto;runtime.skip=false;renderVN();});on('vn-skip-btn',()=>{runtime.skip=!runtime.skip;runtime.auto=false;renderVN();});
  on('challenge-cancel',cancelChallenge);on('btn-ending-explore',pop);on('btn-fullscreen',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>toast('Layar penuh belum tersedia.'));else document.exitFullscreen?.();});
  document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=pop);
  const encClose=$('encounter-overlay')?.querySelector?.('[data-close-modal]');if(encClose)encClose.onclick=retreatEncounter;
  document.querySelectorAll('[data-jtab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-jtab]').forEach(x=>x.classList.toggle('primary',x===b));for(const id of ['perjalanan','rumor','bangsa','perlengkapan'])$('jtab-'+id).classList.toggle('hidden',id!==b.dataset.jtab);});
  on('map-mode-local',()=>{ $('map-pane-local').classList.remove('hidden');$('map-pane-world').classList.add('hidden');$('map-mode-local').classList.add('primary');$('map-mode-world').classList.remove('primary');});on('map-mode-world',()=>{$('map-pane-local').classList.add('hidden');$('map-pane-world').classList.remove('hidden');$('map-mode-local').classList.remove('primary');$('map-mode-world').classList.add('primary');});
  document.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{if(!state.discovered.includes(b.dataset.travel)||!C.access(state,b.dataset.travel))return;closeAll();switchMap(b.dataset.travel);});
  document.querySelectorAll('[data-setting]').forEach(el=>el.onchange=()=>{const key=el.dataset.setting;state.settings[key]=el.type==='checkbox'?el.checked:key==='puzzleMode'?el.value:Number(el.value);applySettings();saveToSlot(null,true);});
  const touch=document.createElement('div');touch.className='touch-controls hidden';touch.innerHTML='<div class="touch-directions"><button data-touch="KeyW">↑</button><button data-touch="KeyA">←</button><button data-touch="KeyS">↓</button><button data-touch="KeyD">→</button></div><div><button id="touch-jump">Lompat</button><button id="touch-interact">E</button></div>';$('stage').append(touch);runtime.touch=touch;
  touch.querySelectorAll('[data-touch]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);runtime.keys[b.dataset.touch]=true;};b.onpointerup=b.onpointercancel=()=>runtime.keys[b.dataset.touch]=false;});$('touch-jump').onpointerdown=e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);runtime.keys.Space=true;jump();};$('touch-jump').onpointerup=$('touch-jump').onpointercancel=()=>{runtime.keys.Space=false;};on('touch-interact',interact);
  initTitleShowcase(on);
 }
 function assets(){const all={...root.PIXEL_BAB0_ASSETS,...root.PIXEL_UI_ASSETS};return Promise.all(Object.entries(all).map(([key,src])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{sprites[key]=img;resolve();};img.onerror=()=>{console.warn('Asset unavailable',key);resolve();};img.src=src;})));}
 async function boot(){
  const logoUri=root.PIXEL_BAB0_ASSETS?.['game-logo']||'assets/pixel-bab0/logo-jalur-senyap.png';
  const favUri=root.PIXEL_BAB0_ASSETS?.['game-favicon']||'assets/pixel-bab0/favicon-jalur-senyap.png';
  for(const lid of ['loading-logo','title-logo','pause-logo','ending-logo']){if($(lid))$(lid).src=logoUri;}
  if($('title-bg')&&!$('title-bg').src)$('title-bg').src=root.PIXEL_BAB0_ASSETS?.['title-cover']||'assets/pixel-bab0/title-cover.webp';
  if(document.head){let ic=document.querySelector('link[rel="icon"]');if(!ic){ic=document.createElement('link');ic.rel='icon';ic.type='image/png';document.head.append(ic);}ic.href=favUri;}
  await assets();runtime.debugCollision=DEV_MODE&&new URLSearchParams(root.location?.search||'').has('collision');
  // Restore optional social interactions from the 3D Nilasar courtyard.
  MAPS.nilasar.npcs.push({id:'perintis-istirahat',name:'Perintis yang beristirahat',sprite:'npc-pedagang-bahtari',x:900,y:430,poiText:'Jalan ke utara belum aman setelah longsoran. Satu pijakan yang diperiksa bisa menyelamatkan seluruh pedati.'},{id:'pedati',name:'Pedati kafilah',sprite:'prop-cargo',x:830,y:500,poiText:'Tali tambat aus di bagian yang bergesekan dengan kayu. Muatan diikat rendah agar tidak mudah terguling di lereng.'});
  
  $('journal-nara').src=portrait('Nara');$('journal-ruru').src=portrait('Ruru');
  const finalLogo=sprites['game-logo']?.src||logoUri;for(const lid of ['loading-logo','title-logo','pause-logo','ending-logo']){if($(lid))$(lid).src=finalLogo;}
  if(sprites['world-atlas'])$('world-atlas-img').src=sprites['world-atlas'].src;bind();runtime.stack=[{id:'title-overlay'}];syncStack();enterMapRuntime();syncHUD();applySettings();$('loading').classList.add('hidden');
  if(safeStorage(C.PREFIX+'_auto')||safeStorage(C.PREFIX+'_auto.bak')||safeStorage(C.LEGACY))$('btn-continue').classList.remove('hidden');focusables()[0]?.focus();
  let previous=performance.now(),accumulator=0;function frame(now){const elapsed=Math.min(.1,Math.max(0,(now-previous)/1000));previous=now;if(!document.hidden){stepTitleParallax(now);accumulator+=elapsed;while(accumulator>=1/120){tick(1/120);accumulator-=1/120;}draw();runtime.touch.classList.toggle('hidden',!runtime.started||!!top());}else accumulator=0;requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }
 function triggerEncAnim(opts){
  if(!hasDOM)return;
  const stage=$(opts.stageId);
  if(stage&&opts.animCls){
   stage.classList.remove('anim-shake-hit','anim-lunge-right','anim-lunge-left','anim-guard');
   void stage.offsetWidth;
   stage.classList.add(opts.animCls);
   setTimeout(()=>stage.classList.remove(opts.animCls),460);
  }
  if(opts.hitImgs){
   const imgs=document.querySelectorAll(opts.hitImgs);
   imgs.forEach(img=>{img.classList.remove('is-hit');void img.offsetWidth;img.classList.add('is-hit');});
   setTimeout(()=>imgs.forEach(img=>img.classList.remove('is-hit')),420);
  }
  if(opts.popId&&opts.popText){
   const layer=$(opts.popId);
   if(layer){
    const tag=document.createElement('span');
    tag.className='enc-float '+(opts.popKind||'dmg');
    tag.textContent=opts.popText;
    layer.append(tag);
    setTimeout(()=>tag.remove(),900);
   }
  }
 }
 function resolveEncounterVictory(enc,outcome){
  const rpg=state.rpg,e=enc.tmpl;
  enc.done=true;enc.busy=false;
  const first=!rpg.encounterResults[e.id];
  rpg.encounterResults[e.id]=outcome;
  if(outcome==='negotiated')rpg.choiceFlags['negosiasi_'+e.id]=true;
  const xp=outcome==='negotiated'?e.stealthXp:e.xpReward;
  if(first)R.grantXp(rpg,xp);
  let dropName=null;
  if(first&&e.drop&&R.CONSUMABLES?.[e.drop]){
   rpg.consumables[e.drop]=(rpg.consumables[e.drop]||0)+1;
   dropName=R.CONSUMABLES[e.drop].name;
  }
  if(enc.source?.kind==='patrol'){
   if(!runtime.clearedPatrols.includes(enc.source.id))runtime.clearedPatrols.push(enc.source.id);
   runtime.patrols=runtime.patrols.filter(p=>p.id!==enc.source.id);
  }else if(enc.source?.kind==='sentinel'){
   rpg.choiceFlags['cleared_'+enc.source.id]=true;
   runtime.sentinels=runtime.sentinels.filter(s=>s.id!==enc.source.id);
  }
  return {first,xp,dropName};
 }
 function openEncounter(forcedId,source=null){
  if(!R||!state.rpg)return;
  if(runtime.encounter&&top()==='encounter-overlay')return;
  const fallback=R.DEFAULT_MAP_ENCOUNTERS?.[state.mapId]||'bandit_gurun';
  const id=forcedId||(state.mapId==='gerbang'||state.mapId==='simpul'?(C.done(state,'cp-5-2')?'kapten_blokade':'pengintai_dewan'):fallback);
  const tmpl=R.ENCOUNTERS[id]||R.ENCOUNTERS.bandit_gurun;
  runtime.encounter={id:tmpl.id,tmpl,hp:tmpl.maxHp,round:1,stunned:0,guarded:false,enemyBraced:false,focusBuff:false,negDiscount:0,ruruCd:0,busy:false,done:false,source,log:[`${tmpl.name} menghadang jalur (${tmpl.region}).`]};
  push('encounter-overlay');renderEncounter();
 }
 function retreatEncounter(){
  const enc=runtime.encounter,patrol=enc?.source?.kind==='patrol'&&!enc.done,sentinel=enc?.source?.kind==='sentinel'&&!enc.done;
  runtime.encounter=null;pop();
  runtime.encounterGrace=2.5;
  if(patrol){checkpoint();toast('Mundur dari pengintai ke pijakan aman.');}
  else if(sentinel)toast('Mundur dari '+enc.tmpl.name+'. Keluar dari lingkaran merahnya agar tidak terhadang lagi.');
 }
 function finishEnemyTurn(){
  const enc=runtime.encounter;if(!enc||enc.done)return;
  const rpg=state.rpg,d=R.getDerivedStats(rpg),e=enc.tmpl;
  enc.busy=false;
  if(enc.hp<=0){
   const {first,xp,dropName}=resolveEncounterVictory(enc,'victory');
   enc.log.push(`${e.name} mundur dari jalur!${first?` (+${xp} XP${dropName?`, +1 ${dropName}`:''})`:''}`);
   SFX.questComplete();refreshMeters();saveToSlot(null,true);renderEncounter();return;
  }
  if(enc.stunned>0){
   enc.stunned--;
   enc.guarded=false;
   enc.enemyBraced=false;
   enc.round++;
   enc.ruruCd=Math.max(0,enc.ruruCd-1);
   enc.log.push(`${e.name} masih teralihkan oleh siasat Ruru dan kehilangan giliran!`);
   triggerEncAnim({stageId:'enc-enemy-visual',animCls:'anim-shake-hit',popId:'enc-enemy-pop',popText:'Teralihkan!',popKind:'stun'});
   refreshMeters();saveToSlot(null,true);renderEncounter();return;
  }
  const intent=R.getEnemyIntent?R.getEnemyIntent(enc):{type:'strike',label:'Serangan Terukur',mult:1};
  if(intent.type==='brace'){
   enc.guarded=false;enc.enemyBraced=true;enc.round++;enc.ruruCd=Math.max(0,enc.ruruCd-1);
   enc.log.push(`${e.name} mengangkat tameng penahan — pukulan biasa melemah, Siasat Ruru bisa mematahkannya!`);
   SFX.guard();
   triggerEncAnim({stageId:'enc-enemy-visual',animCls:'anim-guard',popId:'enc-enemy-pop',popText:'Tameng!',popKind:'guard'});
   refreshMeters();saveToSlot(null,true);renderEncounter();return;
  }
  const hit=R.calculateDamage(e.atk,d.pertahanan,{actionMult:intent.mult});
  const reduced=enc.guarded?Math.max(1,Math.round(hit.damage*0.45)):hit.damage;
  const wasGuarded=enc.guarded,parriedHeavy=wasGuarded&&intent.type==='heavy';
  enc.guarded=false;
  enc.round++;
  enc.ruruCd=Math.max(0,enc.ruruCd-(parriedHeavy?2:1));
  if(parriedHeavy)enc.negDiscount=Math.min(6,enc.negDiscount+1);
  rpg.hp=Math.max(0,rpg.hp-reduced);
  if(hit.isCrit||intent.type==='heavy')feel.addTrauma(wasGuarded?.14:.28);
  enc.log.push(`${e.name} melepaskan ${intent.label.toLowerCase()}${wasGuarded?' (ditahan!)':''}: ${reduced} kerusakan${hit.isCrit?' (Kritis!)':''}.${parriedHeavy?' Tangkis Balasan: Ruru siap lebih cepat!':''}`);
  SFX.enemyHit();
  triggerEncAnim({stageId:'enc-enemy-visual',animCls:'anim-lunge-left'});
  triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-shake-hit',hitImgs:'#enc-nara-img,#enc-ruru-img',popId:'enc-ally-pop',popText:parriedHeavy?`-${reduced} TANGKIS!`:`-${reduced}${wasGuarded?' (Tahan)':hit.isCrit?' KRITIS!':''}`,popKind:wasGuarded?'guard':(hit.isCrit?'crit':'dmg')});
  if(rpg.hp<=0){
   enc.done=true;rpg.hp=Math.max(1,Math.round(d.ketahanan*0.5));
   enc.log.push('Nara menarik diri ke pijakan aman untuk memulihkan napas.');
   runtime.encounterGrace=2.5;
  }
  refreshMeters();saveToSlot(null,true);renderEncounter();
 }
 function combatAction(kind){
  const enc=runtime.encounter;if(!enc||enc.done||enc.busy)return false;
  const rpg=state.rpg,d=R.getDerivedStats(rpg),e=enc.tmpl;
  const nextEnemy=()=>{
   if(enc.done)return;
   if(enc.hp<=0){finishEnemyTurn();return;}
   if(typeof HTMLElement!=='undefined'){
    enc.busy=true;renderEncounter();
    setTimeout(()=>{if(runtime.encounter===enc)finishEnemyTurn();},360);
   }else finishEnemyTurn();
  };
  if(kind==='attack'){
   const focused=enc.focusBuff,braced=enc.enemyBraced&&!focused;
   enc.focusBuff=false;enc.enemyBraced=false;
   const h=R.calculateDamage(d.ketangkasan,e.def,{actionMult:(focused?1.45:1)*(braced?0.65:1),critBonus:focused?0.25:0});
   enc.hp=Math.max(0,enc.hp-h.damage);
   enc.log.push(`Nara menyerang${focused?' tepat ke celah':braced?' menembus tameng':''}: ${h.damage} kerusakan${h.isCrit?' (Kritis!)':''}.`);
   SFX.hit(h.isCrit);
   triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-lunge-right'});
   triggerEncAnim({stageId:'enc-enemy-visual',animCls:'anim-shake-hit',hitImgs:'#enc-enemy-img',popId:'enc-enemy-pop',popText:`-${h.damage}${h.isCrit?' KRITIS!':''}`,popKind:h.isCrit?'crit':'dmg'});
   nextEnemy();return true;
  }
  if(kind==='guard'){
   enc.guarded=true;enc.focusBuff=true;enc.negDiscount=Math.min(4,enc.negDiscount+2);
   enc.log.push('Nara membaca gerak lawan: benturan ditahan 55%, serangan berikut menguat, peluang negosiasi terbuka.');
   SFX.guard();
   triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-guard',popId:'enc-ally-pop',popText:'Siaga + Celah',popKind:'guard'});
   nextEnemy();return true;
  }
  if(kind==='ruru'){
   if(enc.ruruCd>0)return false;
   const hasPeluit=rpg.unlockedItems.includes('alat_lentera_ruru'),wasBraced=enc.enemyBraced;
   enc.enemyBraced=false;
   const h=R.calculateDamage(d.ketangkasan,e.def,{actionMult:hasPeluit?1.45:1.2});
   enc.hp=Math.max(0,enc.hp-h.damage);enc.stunned=1;enc.ruruCd=2;
   enc.log.push(`Ruru menyambar membuka celah${wasBraced?' dan mematahkan tameng lawan':''}! ${h.damage} kerusakan${h.isCrit?' (Kritis!)':''} — lawan kehilangan giliran.`);
   SFX.sonar();
   triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-lunge-right'});
   triggerEncAnim({stageId:'enc-enemy-visual',animCls:'anim-shake-hit',hitImgs:'#enc-enemy-img',popId:'enc-enemy-pop',popText:`-${h.damage} ${wasBraced?'PECAH + STUN!':'STUN!'}`,popKind:'stun'});
   nextEnemy();return true;
  }
  if(kind==='negotiate'){
   const reqKep=Math.max(6,e.negotiateKepekaan-enc.negDiscount);
   if(d.kepekaan<reqKep)return false;
   const {first,xp,dropName}=resolveEncounterVictory(enc,'negotiated');
   enc.log.push(`Nara meredakan ketegangan lewat kata-kata terukur.${first?` (+${xp} XP${dropName?`, +1 ${dropName}`:''})`:''}`);
   SFX.negotiate();
   triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-guard',popId:'enc-ally-pop',popText:'Damai!',popKind:'heal'});
   refreshMeters();saveToSlot(null,true);renderEncounter();return true;
  }
  if(kind==='heal'){
   const itemId=(rpg.consumables.garam_mineral||0)>0?'garam_mineral':(rpg.consumables.teh_gurun||0)>0?'teh_gurun':(rpg.consumables.roti_nilasar||0)>0?'roti_nilasar':null;
   if(!itemId||rpg.hp>=d.ketahanan)return false;
   const healed=R.useConsumable(rpg,itemId);
   const label=R.CONSUMABLES?.[itemId]?.name||itemId;
   enc.log.push(`Minum ${label} (+${healed} Ketahanan).`);
   SFX.waterRefill();
   triggerEncAnim({stageId:'enc-ally-visual',animCls:'anim-guard',popId:'enc-ally-pop',popText:`+${healed} HP`,popKind:'heal'});
   nextEnemy();return true;
  }
  return false;
 }
 function renderEncounter(){
  const enc=runtime.encounter;if(!enc||!hasDOM)return;
  const rpg=state.rpg,d=R.getDerivedStats(rpg),e=enc.tmpl;
  $('enc-region').textContent=e.region;$('enc-name').textContent=e.name;$('enc-desc').textContent=e.desc;
  $('enc-enemy-title').textContent=e.name;
  if($('enc-round'))$('enc-round').textContent=`Ronde ${enc.round}`;
  if($('enc-turn-badge')){
   $('enc-turn-badge').textContent=enc.done?'Selesai':enc.busy?'Giliran Lawan':'Giliranmu';
   $('enc-turn-badge').classList.toggle('enemy',!!enc.busy&&!enc.done);
  }
  const nImg=$('enc-nara-img'),rImg=$('enc-ruru-img'),eImg=$('enc-enemy-img');
  if(nImg&&sprites['portrait-nara'])nImg.src=sprites['portrait-nara'].src;
  if(rImg&&sprites['portrait-ruru'])rImg.src=sprites['portrait-ruru'].src;
  if(nImg)nImg.classList.toggle('is-guarding',!!enc.guarded);
  if(eImg){
   const usePortrait=!!(e.portrait&&sprites[e.portrait]?.src);
   const src=usePortrait?sprites[e.portrait].src:(e.sprite&&sprites[e.sprite]?.src)||'';
   if(src)eImg.src=src;
   eImg.classList.toggle('is-sprite',!usePortrait);
   eImg.classList.toggle('is-stunned',enc.stunned>0);
  }
  if($('enc-ally-buffs')){
   const buffs=[];
   if(enc.guarded)buffs.push('<span class="enc-badge">Siaga 55%</span>');
   if(enc.focusBuff)buffs.push('<span class="enc-badge">Celah 1.45x</span>');
   if(enc.negDiscount>0)buffs.push(`<span class="enc-badge">Negosiasi -${enc.negDiscount}</span>`);
   $('enc-ally-buffs').innerHTML=buffs.join('');
  }
  if($('enc-enemy-debuffs')){
   const deb=[];
   const intent=R.getEnemyIntent?R.getEnemyIntent(enc):{type:'strike',label:'Serangan Terukur'};
   if(!enc.done)deb.push(`<span class="enc-badge intent ${intent.type==='heavy'?'warn':''}">Pola: ${esc(intent.label)}</span>`);
   if(enc.enemyBraced)deb.push('<span class="enc-badge">Tameng Aktif</span>');
   if(enc.stunned>0)deb.push('<span class="enc-badge warn">Teralihkan</span>');
   $('enc-enemy-debuffs').innerHTML=deb.join('');
  }
  $('enc-nara-stats').textContent=`Lv ${rpg.level} · Ketangkasan ${d.ketangkasan} · Pertahanan ${d.pertahanan} · Kepekaan ${d.kepekaan}`;
  $('enc-enemy-stats').textContent=`Serangan ${e.atk} · Pertahanan ${e.def}`;
  $('enc-nara-hp').max=d.ketahanan;$('enc-nara-hp').value=rpg.hp;$('enc-nara-hp-text').textContent=`${rpg.hp} / ${d.ketahanan}`;
  $('enc-enemy-hp').max=e.maxHp;$('enc-enemy-hp').value=enc.hp;$('enc-enemy-hp-text').textContent=`${enc.hp} / ${e.maxHp}`;
  $('enc-log').innerHTML=enc.log.slice(-6).map(l=>`<p>${esc(l)}</p>`).join('');
  if($('enc-log'))$('enc-log').scrollTop=$('enc-log').scrollHeight;
  const act=$('enc-actions');act.replaceChildren();
  if(enc.done){
   const b=document.createElement('button');b.className='primary';b.innerHTML='<b>Lanjutkan perjalanan</b><span>Kembali ke peta</span>';
   b.onclick=()=>{runtime.encounter=null;pop();};act.append(b);return;
  }
  const addBtn=(title,sub,cls,disabled,fn)=>{
   const b=document.createElement('button');if(cls)b.className=cls;
   b.innerHTML=`<b>${esc(title)}</b><span>${esc(sub)}</span>`;
   b.disabled=!!(disabled||enc.busy);b.onclick=fn;act.append(b);
  };
  addBtn('[1] Serang',enc.focusBuff?'Celah terbuka · 1.45x + crit':enc.enemyBraced?'Tameng lawan · 0.65x':'Serangan cepat Nara','primary',false,()=>combatAction('attack'));
  addBtn('[2] Baca Celah','Tahan 55% · perkuat pukulan','',false,()=>combatAction('guard'));
  const hasPeluit=rpg.unlockedItems.includes('alat_lentera_ruru');
  addBtn('[3] Siasat Ruru',enc.ruruCd>0?`Menunggu ${enc.ruruCd} giliran`:(hasPeluit?'Peluit 1.45x + Alihkan 1x':'Ganggu 1.2x + Alihkan 1x'),'',enc.ruruCd>0,()=>combatAction('ruru'));
  const reqKep=Math.max(6,e.negotiateKepekaan-enc.negDiscount);
  addBtn('[4] Negosiasi',`Butuh Kepekaan ${reqKep} (milik ${d.kepekaan})`,'',d.kepekaan<reqKep,()=>combatAction('negotiate'));
  const garamQty=rpg.consumables.garam_mineral||0,tehQty=rpg.consumables.teh_gurun||0,rotiQty=rpg.consumables.roti_nilasar||0;
  const healSub=garamQty>0?`Garam Balkut (${garamQty}) · +24 HP`:tehQty>0?`Teh Gurun (${tehQty}) · +18 HP`:rotiQty>0?`Roti Nilasar (${rotiQty}) · +12 HP`:'Bekal habis';
  addBtn('[5] Pulih Napas',healSub,'',(garamQty+tehQty+rotiQty)<=0||rpg.hp>=d.ketahanan,()=>combatAction('heal'));
 }
 root.BAB0_ENGINE={state,runtime,ALL_OBJECTIVES:OBJECTIVES,SFX,sliderToGain,linearToDb,updateAudio,unlockAudio,switchMap,advanceObjective:finish,triggerSonar:scan,saveToSlot,loadFromSlot,
  interact,startChallenge,puzzleWin,puzzleMove,timingHit,startDialogue,advanceVN,tick,nearby,jump,nearLink,useLink,begin,equipItem,unequipItem,openEncounter,combatAction,retreatEncounter,
  enterMapRuntime,syncHUD,refreshMeters,closeAll,openMap,renderJournal,renderEncounter,resolveEncounterVictory,applySettings,toast,checkpoint};
 if(hasDOM){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();}
})(globalThis);




