/* Jalur Senyap pixel runtime — Buku Seorang Perintis, 2026-11-14.
   Campaign/save policy lives in pixel-campaign.js. Original painted maps are preserved.
   All puzzle and dialogue completions are bound to stable objective IDs and one-shot guards. */
(function(root){
 'use strict';
 const C=root.PixelCampaign,D=root.BAB0_DATA,P=root.JSGamedevSkills.PuzzleEngine;
 const MAPS=D.MAPS,OBJECTIVES=C.objectives,DB=root.CINCIN_DIALOGUES, $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state=C.initial(),sprites={},runtime={started:false,stack:[],keys:{},path:[],time:0,scan:0,scanCooldown:0,
   guide:0,exitArmed:false,interactOnArrival:false,interactTarget:null,patrols:[],ruru:{x:610,y:600,dir:'up'},flight:null,auto:false,skip:false,
   autoTime:0,dialogue:null,challenge:null,saveTime:0,hudTime:0,footTime:0,previousButtons:[],focus:null};
 const top=()=>runtime.stack.at(-1)?.id||null;
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
   const hasWater=['sumi','sela','nilasar'].includes(state.mapId);
   waterAmb.gain.setTargetAtTime(paused||!hasWater?0:(state.mapId==='sumi'?.048:.02)*(inDiag?.35:1),audioContext.currentTime,.35);
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
  waterRefill(){[392,493.88,587.33,659.25].forEach((f,i)=>synthNote(f,.12,.05,i*.05,'sine','sfx',f*1.12));}
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
  closeAll();Object.assign(state,result.data);runtime.started=true;runtime.dialogue=null;runtime.challenge=null;runtime.flight=null;runtime.scanCooldown=0;runtime.auto=false;runtime.skip=false;
  enterMapRuntime();$('title-overlay').classList.add('hidden');$('hud-topbar').classList.remove('hidden');applySettings();syncHUD();unlockAudio();
  $('save-status').textContent='Tersimpan';if(state.dialogue)startDialogue(state.dialogue.id,state.dialogue.node);
  if(result.recovered||result.migrated)toast(result.recovered?'Simpanan dipulihkan dari cadangan.':'Simpanan pixel lama dipindahkan. Urutan Batu Nama dan sidang diselaraskan.');
  return true;
 }
 function safeStorage(key){try{return localStorage.getItem(key);}catch{return null;}}
 function begin(){
  closeAll();Object.assign(state,C.initial());runtime.started=true;runtime.dialogue=null;runtime.challenge=null;runtime.flight=null;runtime.scanCooldown=0;runtime.auto=false;runtime.skip=false;
  enterMapRuntime();$('title-overlay').classList.add('hidden');$('hud-topbar').classList.remove('hidden');applySettings();syncHUD();unlockAudio();
  simple('Nara','Pagi di Pos Nilasar',[
   'Matahari pagi baru menyentuh kubah biru Pos Nilasar. Biasanya halaman ini cepat lengang setelah subuh, tapi hari ini puluhan gerobak garam dan gandum justru tertahan di dekat gerbang.',
   'Ruru mengibaskan pasir dari telinganya, lalu mendongak ke arah pendopo berkubah biru. Bu Marsiyah menunggu dengan cawan air pertama.'],()=>{state.introSeen=true;saveToSlot(null,true);toast('WASD / klik tanah: berjalan · E: berinteraksi · Q: bantuan Ruru');});
 }
 function enterMapRuntime(){runtime.exitArmed=false;runtime.path=[];runtime.keys={};runtime.flight=null;runtime.interactOnArrival=false;runtime.interactTarget=null;const rx=state.player.x-24,ry=state.player.y+12;runtime.ruru={x:C.walkable(state.mapId,rx,ry,state)?rx:state.player.x,y:C.walkable(state.mapId,rx,ry,state)?ry:state.player.y,dir:state.player.dir};runtime.patrols=(MAPS[state.mapId].patrols||[]).map(p=>({...p,x:p.waypoints[0][0],y:p.waypoints[0][1],wp:1,angle:0}));}
 function switchMap(map,spawn){if(!C.travel(state,map,spawn)){SFX.timingMiss();toast(C.gateHint(map));return false;}SFX.mapTravel();enterMapRuntime();syncHUD();updateAudio();saveToSlot(null,true);toast(MAPS[map].name);return true;}
 function finish(id){if(!C.complete(state,id))return false;SFX.questComplete(id==='cp-7-2'||id==='cp-9-0'||id==='cp-21-0');syncHUD();saveToSlot(null,true);updateAudio();
  if(!cur())push('ending-modal');else toast((C.done(state,'cp-18-2')&&id==='cp-18-2')?'Jembatan Balkut turun. Karavan kini dapat melintas.':cur().itemLabel);return true;}
 function nearby(){
  const p=state.player,o=cur(),m=MAPS[state.mapId];
  if(o&&o.map===state.mapId&&Math.hypot(o.x-p.x,o.y-p.y)<82)return {kind:'objective',obj:o,label:o.itemLabel+' · E'};
  const link=nearLink();if(link&&link.kind==='ladder')return {kind:'ladder',obj:link,label:'Pasang / panjat tangga tali · E'};
  let best=null,d=72;for(const n of m.npcs||[]){const nd=Math.hypot(n.x-p.x,n.y-p.y);if(nd<d){best={kind:'npc',obj:n,label:'Bicara: '+n.name+' · E'};d=nd;}}
  return best;
 }
 function interact(preferred){
  if(top()==='vn-overlay'){advanceVN();return;}if(top()||runtime.flight||state.player.z>5)return;
  const p=state.player,oCur=cur();let near=null;
  if(preferred&&typeof preferred.x==='number'){
    if(oCur&&preferred.id===oCur.id&&Math.hypot(oCur.x-p.x,oCur.y-p.y)<82)near={kind:'objective',obj:oCur};
    else if(preferred.name&&Math.hypot(preferred.x-p.x,preferred.y-p.y)<82)near={kind:'npc',obj:preferred};
  }
  near=near||nearby();if(!near)return;
  if(near.kind==='ladder'){useLink('ladder');return;}
  if(near.kind==='npc'){const n=near.obj;if(n.hasShellSong)shellSong();if(n.id==='juru-air'){state.cargo=100;SFX.waterRefill();syncHUD();}
    if(n.poiText&&!state.poiSeen.includes(n.id)){state.poiSeen.push(n.id);state.rumors.push(n.poiText);saveToSlot(null,true);}
    simple(n.name,MAPS[state.mapId].name,[n.poiText||idle[n.id]||'Jalan masih panjang. Periksa catatan perjalananmu sebelum berangkat.']);return;}
  const o=near.obj;
  if(o.sonar&&!state.foundFlags['sonar_'+o.id]){toast('Minta Ruru membaca pijakan ini dahulu · Q');return;}
  if(o.minigame&&!['negotiate_kesa','council_odgar'].includes(o.minigame)&&!state.foundFlags['puzzle_'+o.id])startChallenge(o);
  else startDialogue(o.id);
 }
 const idle={marsiyah:'Air tidak bertanya nama. Beristirahatlah, lalu lanjutkan jalan yang sudah kau periksa.',bulamat:'Dengarkan airnya, Nara. Kerang ini masih menyimpan lagu orang yang kita tunggu.',jumel:'Lihat pijakanmu sebelum melihat cakrawala.',kesa:'Jaga ucapan dan muatanmu. Perintah di gerbang belum berubah.',ima:'Jangan membawa kegaduhan ke rumah, Nara. Dengarkan baik-baik apa yang kau temukan.',orsuk:'Kafilah membutuhkan jalan, bukan janji yang tak dapat dilalui.',maruani:'Batu menyimpan lebih banyak daripada yang diceritakan orang.',odgar:'Di depan api, bedakan apa yang kau lihat dan apa yang kau duga.'};
 function scan(){if(!runtime.started||top())return;if(runtime.scanCooldown>0){toast(`Ruru sedang beristirahat · ${Math.ceil(runtime.scanCooldown)} detik`);return;}
  runtime.scan=1.4;runtime.scanCooldown=12;runtime.guide=8;SFX.sonar();const o=cur();
  if(!o){toast('Ruru mendengar angin di perkemahan. Janji berikutnya masih menanti.');return;}
  if(o.map!==state.mapId){toast('Ruru menunjukkan jalur ke '+MAPS[o.map].name);return;}
  if(Math.hypot(state.player.x-o.x,state.player.y-o.y)<170){state.foundFlags['sonar_'+o.id]=true;SFX.sonarReveal();saveToSlot(null,true);toast('Pijakan terbaca · '+o.itemLabel);}else toast('Ikuti arah pirus. Dekati pijakan lalu pindai lagi.');
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
 function startChallenge(o){
  const kind=o.minigame==='cargo_balance'?'cargo':o.minigame.startsWith('winch_')?'bridge':'tune';
  runtime.challenge={id:o.id,kind,mode:state.settings.puzzleMode,done:false,phase:.1,direction:1,locks:0,
   board:kind==='bridge'?P.createBridgeBoard():P.createTuneBoard(),undo:[],counts:[1,2,1]};
  $('mg-title').textContent=kind==='cargo'?'Timbang bekal kafilah':kind==='bridge'?'Tambatan Balkut':'Selaraskan Perunggu';push('mg-overlay');renderChallenge();
 }
 function puzzleWin(ch){if(runtime.challenge!==ch||ch.done||cur()?.id!==ch.id)return false;ch.done=true;state.foundFlags['puzzle_'+ch.id]=true;runtime.challenge=null;pop();SFX.puzzleWin();startDialogue(ch.id);return true;}
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
  const bridge=ch.kind==='bridge';$('mg-desc').textContent=bridge?'Seimbangkan tiga penahan pada tanda II. Setiap tuas menggerakkan beberapa penahan sekaligus.':'Arahkan ketiga takik ke atas. Setiap putaran menggerakkan dua cincin; amati hubungan di antaranya.';
  const values=bridge?ch.board.pins:ch.board.rings;
  body.innerHTML=`<div class="puzzle-board">${values.map(v=>`<div class="dial">${bridge?['0','I','II'][v]:['↑','→','↓','←'][v]}</div>`).join('')}</div><div class="puzzle-moves">${(bridge?['Kiri + tengah','Semua penahan','Tengah + kanan']:['Luar + tengah','Tengah + dalam','Luar + dalam ↶']).map((label,i)=>`<button data-move="${i}">${i+1}. ${label}</button>`).join('')}</div><div class="button-row"><button id="puzzle-undo" ${ch.undo.length?'':'disabled'}>Urungkan · Z</button><button id="puzzle-reset">Ulangi</button><button id="puzzle-hint">Petunjuk</button></div><p class="muted">${ch.board.moves} langkah · tanpa batas waktu</p>`;
  body.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>puzzleMove(Number(b.dataset.move)));
  $('puzzle-undo').onclick=()=>{if(ch.undo.length){ch.board=ch.undo.pop();SFX.uiClose();}renderChallenge();};
  $('puzzle-reset').onclick=()=>{ch.board=bridge?P.createBridgeBoard():P.createTuneBoard();ch.undo=[];SFX.uiClick();renderChallenge();};
  $('puzzle-hint').onclick=()=>{SFX.puzzleHint();const hint=P.solveBFS(ch.board);body.querySelectorAll('[data-move]').forEach(b=>b.classList.toggle('hinted',Number(b.dataset.move)===hint?.[0]));toast(hint?.length?'Coba tuas '+(hint[0]+1)+'. Perhatikan dua bagian yang berubah.':'Semua penanda sudah selaras.');};
  restoreFocus();
 }
 function puzzleMove(i){const ch=runtime.challenge;if(!ch||ch.done||ch.kind==='cargo'||top()!=='mg-overlay')return;ch.undo.push(C.clone(ch.board));ch.board=P.applyMove(ch.board,i).state;SFX.puzzleMove(i);if(P.isSolved(ch.board))puzzleWin(ch);else renderChallenge();}
 function timingHit(){const ch=runtime.challenge;if(!ch||ch.done||top()!=='mg-overlay'||ch.mode!=='timing')return;if(ch.phase>=.38&&ch.phase<=.64){ch.locks++;SFX.timingLock(ch.locks);if(ch.locks>=(ch.kind==='bridge'?1:3))puzzleWin(ch);else{ch.phase=.06;$('timing-status').textContent=`${ch.locks} / 3 cincin terkunci`;}}else{SFX.timingMiss();$('timing-status').textContent='Belum selaras. Tunggu penanda di bidang hijau.';}}
 function renderJournal(){
  const o=cur(),seqs=C.order.filter(i=>OBJECTIVES.some(x=>x.seqIndex===i&&(C.done(state,x.id)||x.id===o?.id)));
  $('journal-status').textContent=`${state.completed.length} / 58 langkah · ${state.discovered.length} / 8 wilayah\n${C.bound(state)?'Cincin terikat pada detak Nara':C.hasRing(state)?'Cincin Perunggu ditemukan':'Tas perintis Nilasar'}`;
  $('jtab-perjalanan').innerHTML=seqs.slice().reverse().map(i=>{const st=root.STORY.steps[i],active=o?.seqIndex===i,objs=OBJECTIVES.filter(x=>x.seqIndex===i),complete=objs.every(x=>C.done(state,x.id));return `<article class="j-card ${active?'active':complete?'done':''}"><p class="eyebrow">BAB ${i<12?0:1} · ${complete?'SELESAI':'SEDANG DITEMPUH'}</p><h3>${esc(st.title)}</h3><p>${esc(active?o.itemLabel:st.note)}</p><ul class="objective-list">${objs.filter(x=>C.done(state,x.id)||x.id===o?.id).map(x=>`<li class="${C.done(state,x.id)?'done':''}">${C.done(state,x.id)?'✓':'◇'} ${esc(x.itemLabel)}</li>`).join('')}</ul>${active?'<button id="journal-find" class="primary">Tunjukkan jalur di peta</button>':''}</article>`;}).join('');
  $('journal-find')?.addEventListener('click',()=>{pop();openMap();});
  $('jtab-rumor').innerHTML=`<h3>Suara dan tempat yang ditemukan</h3>${state.rumors.length?state.rumors.map(r=>`<p class="j-card">${esc(r)}</p>`).join(''):'<p>Catatan akan terisi saat Nara memeriksa jalur dan mendengar kesaksian.</p>'}<h3>Jejak perjalanan · ${state.discovered.length} / 8</h3><p>${state.discovered.map(id=>esc(MAPS[id].name)).join(' · ')}</p><h3>Kepercayaan</h3><p>${C.done(state,'cp-18-2')?'Karavan Balkut dapat melintas melalui jembatan yang kau buka.':C.done(state,'cp-6-2')?'Marsiyah menerima laporan jujur dari Gerbang Timur.':'Kepercayaan tumbuh lewat perjalanan yang benar-benar kau jalani.'}</p>`;
  $('jtab-bangsa').innerHTML=root.GAME_DATA.canon.nations.map(n=>`<article class="nation-entry"><p class="eyebrow">${esc(n.region)}</p><h3>${esc(n.name)}</h3><p><i>${esc(n.greeting)}</i></p><p>${esc(n.description)}</p><details><summary>Adat, ekonomi, dan kesepakatan</summary><p>${esc(n.custom)}</p><p>${esc(n.economy)}</p><p>${esc(n.contract)}</p><p>${esc(n.politics)}</p></details></article>`).join('');
  const gear=[['Tas Peredam Tseren','Menjaga gema tetap teduh; muatan perlu perlindungan di tengah badai.'],['Jalur batu','Ikuti anak tangga dan papan jembatan. Pagar tali, batu, dan jurang tidak dapat dilintasi.'],['Lentera Ruru','Q membaca pijakan dan menunjukkan tujuan. Ruru perlu 12 detik sebelum memindai lagi.'],...(C.hasRing(state)?[['Cincin Perunggu',C.bound(state)?'Terikat pada detak nadi Nara.':'Perunggu kusam tanpa permata.']]:[])];
  $('jtab-perlengkapan').innerHTML='<div class="gear-grid">'+gear.map(([name,text])=>`<article class="j-card"><h3>${name}</h3><p>${text}</p></article>`).join('')+'</div>'+(C.done(state,'cp-1-2')?'<button id="journal-shell">Putar / jeda Kerang Suara</button>':'');$('journal-shell')?.addEventListener('click',shellSong);
 }
 const mapPoints={nilasar:[260,340],sumi:[100,340],senja:[220,170],gerbang:[390,330],simpul:[515,230],sela:[420,145],balkut:[480,75],salkara:[590,48]};
 function renderMap(){const o=cur();document.querySelectorAll('[data-travel]').forEach(b=>{const id=b.dataset.travel,m=MAPS[id],known=state.discovered.includes(id),open=C.access(state,id);b.disabled=!known||!open;b.classList.toggle('target',o?.map===id);b.innerHTML=`<img src="${sprites[m.bg]?.src||''}" alt=""><strong>${esc(m.name)}</strong><small>${id===state.mapId?'Kamu di sini':!open?'Jalur belum terbuka':known?'Singgahi kembali':'Belum dikunjungi'}${o?.map===id?' · Tujuan aktif':''}</small>`;});
  const canvas=$('route-map');if(!canvas)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,650,470);ctx.fillStyle='#dfd0a8';ctx.fillRect(0,0,650,470);
  ctx.strokeStyle='#b39e6b66';ctx.lineWidth=1;for(let i=0;i<14;i++){ctx.beginPath();ctx.ellipse(340,260,70+i*23,30+i*16,-.3,0,Math.PI*2);ctx.stroke();}
  for(const [id,m]of Object.entries(MAPS))for(const ex of m.exits){const a=mapPoints[id],b=mapPoints[ex.to];ctx.setLineDash([5,5]);ctx.strokeStyle=C.access(state,ex.to)?'#687b5c':'#aa9872';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}ctx.setLineDash([]);
  for(const [id,[x,y]]of Object.entries(mapPoints)){ctx.fillStyle=id===state.mapId?'#b1643b':state.discovered.includes(id)?'#3f6b53':'#ac9b73';ctx.beginPath();ctx.arc(x,y,o?.map===id?11:7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eadbbb';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#3d4930';ctx.font='14px Georgia';ctx.textAlign='center';ctx.fillText(({gerbang:'Gerbang Timur',simpul:'Simpul 009',sela:'Dusun Sela',balkut:'Balkut',salkara:'Salkara'})[id]||MAPS[id].name,x,y+25);}
  ctx.textAlign='left';ctx.font='italic 17px Georgia';ctx.fillStyle='#766240';ctx.fillText('Lembah Pasir — Ambang Salkara',34,430);$('world-atlas-img').src=sprites['world-atlas']?.src||'';
 }
 function openMap(){renderMap();push('map-overlay');}
 function renderSlots(){const box=$('save-slots-box');box.replaceChildren();for(let i=0;i<3;i++){let info='Belum terisi';try{const r=C.load(localStorage,C.PREFIX+'_slot_'+i,C.LEGACY+'_slot_'+i);if(r.data)info=`${r.data.completed.length}/58 · ${MAPS[r.data.mapId].name}${r.recovered?' · cadangan':''}`;}catch{}
  const row=document.createElement('div');row.className='save-slot';row.innerHTML=`<div><strong>Slot ${i+1}</strong><small>${esc(info)}</small></div><div class="button-row"><button data-save="${i}">Simpan</button><button data-load="${i}" ${info==='Belum terisi'?'disabled':''}>Muat</button></div>`;box.append(row);}
  box.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{saveToSlot(Number(b.dataset.save));renderSlots();});box.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadFromSlot(Number(b.dataset.load)));
 }
 function applySettings(){if(!hasDOM)return;document.documentElement.style.setProperty('--text-scale',state.settings.textScale);document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);document.querySelectorAll('[data-setting]').forEach(el=>{if(el.type==='checkbox')el.checked=state.settings[el.dataset.setting];else el.value=state.settings[el.dataset.setting];});updateAudio();}
 function syncHUD(){if(!hasDOM)return;const o=cur();$('hud-progress').textContent=o?`BAB ${o.chapter} · ${state.completed.length+1} / 58`:'BUKU I · SELESAI';$('hud-location').textContent=MAPS[state.mapId].name;$('hud-seq-title').textContent=o?.seqTitle||'Mandat empat hari';$('hud-seq-obj').textContent=o?o.itemLabel+(o.map!==state.mapId?' · '+MAPS[o.map].name:''):'Bawa pulang ingatan. Jalan berikutnya masih menanti.';refreshMeters();}
 function refreshMeters(){
  if(!hasDOM)return;
  const p=state.player,t=C.terrain(state.mapId,p.x,p.y),safe=C.sheltered(state.mapId,p.x,p.y);
  $('cargo-meter').value=state.cargo;
  $('hud-weather').textContent=storm()?(safe?'Badai · berlindung':'Badai · cari tempat teduh'):windy()?'Angin lintas jalur · jaga muatan':'Angin teduh';
  $('hud-terrain').textContent=t.name+(runtime.flight?' · memanjat':p.z>0?' · melompat':'');
  $('btn-sonar').textContent=runtime.scanCooldown>0?`Ruru · ${Math.ceil(runtime.scanCooldown)} dtk`:'◉ Ruru [Q]';
 }
 function nearLink(kind){const p=state.player;for(const link of C.links[state.mapId]||[]){if(kind&&link.kind!==kind)continue;for(const reverse of [false,true]){const from=reverse?link.to:link.from;if(Math.hypot(from[0]-p.x,from[1]-p.y)<65)return {...link,from,to:reverse?link.from:link.to};}}return null;}
 function useLink(kind='ladder'){if(kind!=='ladder'||top()||runtime.flight||state.player.z>0)return;const link=nearLink('ladder');if(!link){toast('Dekati tangga tali untuk memanjat.');return;}if(!C.walkable(state.mapId,...link.to,state))return;runtime.flight={...link,start:[state.player.x,state.player.y],t:0,duration:1.8};runtime.path=[];SFX.ladder();}
 function jump(){if(top()||runtime.flight||state.player.z>0)return;state.player.vz=175;state.player.z=.1;SFX.jump();}
 function move(dx,dy){const p=state.player;[p.x,p.y]=C.movePoint(state.mapId,p.x,p.y,dx,dy,state);}
 function checkpoint(){const p=state.lastSafe;if(p){switchMap(p.mapId,[p.x,p.y]);state.cargo=Math.max(50,state.cargo);}}
 function tick(dt){runtime.time+=dt;pollGamepad();
  if(top()==='mg-overlay'&&runtime.challenge?.mode==='timing'){const ch=runtime.challenge;ch.phase+=ch.direction*dt*(ch.kind==='bridge'?.9:1.2);if(ch.phase>.96||ch.phase<.04){ch.phase=C.clamp(ch.phase,.04,.96);ch.direction*=-1;}if($('timing-needle'))$('timing-needle').style.left=(ch.phase*100)+'%';}
  if(top()==='vn-overlay'&&runtime.dialogue){const v=runtime.dialogue,n=v.graph.nodes[v.node];if(!n.choices?.length&&(runtime.auto||(runtime.skip&&v.wasRead))){runtime.autoTime+=dt;const wait=runtime.skip&&v.wasRead?.18:Math.max(2.5,n.text.length*.045);if(runtime.autoTime>wait)advanceVN();}}
  if(!runtime.started||top())return;
  state.elapsed+=dt;runtime.scanCooldown=Math.max(0,runtime.scanCooldown-dt);runtime.scan=Math.max(0,runtime.scan-dt);runtime.guide=Math.max(0,runtime.guide-dt);
  const p=state.player,o=cur();const previous=[p.x,p.y],terr=C.terrain(state.mapId,p.x,p.y),safe=C.sheltered(state.mapId,p.x,p.y);
  if(runtime.flight){const f=runtime.flight;f.t=Math.min(1,f.t+dt/f.duration);p.x=f.start[0]+(f.to[0]-f.start[0])*f.t;p.y=f.start[1]+(f.to[1]-f.start[1])*f.t;p.z=Math.sin(f.t*Math.PI)*7;if(f.t===1){p.z=0;runtime.flight=null;}}
  else{
   let pathDistance=Infinity;
   let dx=(runtime.keys.KeyD||runtime.keys.ArrowRight?1:0)-(runtime.keys.KeyA||runtime.keys.ArrowLeft?1:0),dy=(runtime.keys.KeyS||runtime.keys.ArrowDown?1:0)-(runtime.keys.KeyW||runtime.keys.ArrowUp?1:0);
   if(dx||dy){runtime.path=[];runtime.interactOnArrival=false;runtime.interactTarget=null;}else if(runtime.path.length){const target=runtime.path[0],dist=Math.hypot(target[0]-p.x,target[1]-p.y);if(dist<.0001)runtime.path.shift();else{pathDistance=dist;dx=(target[0]-p.x)/dist;dy=(target[1]-p.y)/dist;}}
   const mag=Math.hypot(dx,dy);if(mag){dx/=mag;dy/=mag;p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
   const sprint=runtime.keys.ShiftLeft||runtime.keys.ShiftRight;
   if(p.z>0){p.vz-=dt*460;p.z=Math.max(0,p.z+p.vz*dt);if(p.z===0){p.vz=0;SFX.land(terr.name);}}
   const downhill=dy>0&&terr.height>10;const speed=(sprint?240:170)*terr.speed*(downhill&&sprint?1.22:1)*(storm()&&!safe?.82:1);
   const distance=Math.min(speed*dt,pathDistance);move(dx*distance,dy*distance);
   if(windy()&&!safe){if(!runtime.path.length)move((9+Math.sin(runtime.time*1.7)*7)*dt*(storm()?1:.4),1.7*dt);if(o?.seqIndex>=4&&o.seqIndex<=8)state.cargo=Math.max(0,state.cargo-dt*(sprint?1.5:.35)*(storm()?1:.5));}
   if(safe)state.cargo=Math.min(100,state.cargo+dt*3);
   if(state.cargo===0){SFX.stealthAlert();checkpoint();toast('Muatan perlu diikat ulang. Kembali ke pijakan aman.');return;}
  }
  p.moving=Math.hypot(p.x-previous[0],p.y-previous[1])>.1;if(p.moving){const sp=runtime.keys.ShiftLeft||runtime.keys.ShiftRight;p.walkTime+=dt*4;runtime.footTime+=dt;if(runtime.footTime>(sp?.29:.38)&&p.z===0){runtime.footTime=0;SFX.footstep(terr.name,sp);}}
  const m=MAPS[state.mapId];if(!C.inExit(state.mapId,p.x,p.y,18))runtime.exitArmed=true;
  if(runtime.exitArmed&&!runtime.flight)for(const ex of m.exits){if(Math.hypot(p.x-ex.x,p.y-ex.y)<ex.r){if(!C.access(state,ex.to)){runtime.exitArmed=false;runtime.path=[];toast(C.gateHint(ex.to));}else switchMap(ex.to,ex.spawn);return;}}
  for(const patrol of runtime.patrols){const target=patrol.waypoints[patrol.wp],dx=target[0]-patrol.x,dy=target[1]-patrol.y,dist=Math.hypot(dx,dy);if(dist<5)patrol.wp=(patrol.wp+1)%patrol.waypoints.length;else{patrol.x+=dx/dist*patrol.speed*dt;patrol.y+=dy/dist*patrol.speed*dt;patrol.angle=Math.atan2(dy,dx);}
   if(o?.stealth&&o.map===state.mapId){const d=Math.hypot(p.x-patrol.x,p.y-patrol.y),a=Math.atan2(p.y-patrol.y,p.x-patrol.x)-patrol.angle,diff=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));if(d<patrol.visionDist&&diff<patrol.visionAngle&&C.lineClear(state.mapId,[patrol.x,patrol.y],[p.x,p.y])){SFX.stealthAlert();checkpoint();toast('Terlihat pengintai. Tunggu arah pandang berbalik atau gunakan penghalang.');return;}}
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
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#302e23';ctx.fillRect(0,0,1280,720);if(sprites[m.bg])ctx.drawImage(sprites[m.bg],0,0,1280,720);
  for(const rect of m.coverRects||[]){const x=rect[0]*12.8,y=rect[1]*7.2,w=(rect[2]-rect[0])*12.8,h=(rect[3]-rect[1])*7.2;if(sprites['prop-cargo'])ctx.drawImage(sprites['prop-cargo'],x-6,y-28,w+12,h+36);}
  for(const [x,y] of m.lights||[]){const glow=ctx.createRadialGradient(x*12.8,y*7.2,0,x*12.8,y*7.2,23+Math.sin(t*2+x)*3);glow.addColorStop(0,'#efbd5638');glow.addColorStop(1,'#efbd5600');ctx.fillStyle=glow;ctx.fillRect(x*12.8-28,y*7.2-28,56,56);}
  if(storm()){for(const s of C.shelters[state.mapId]||[]){ctx.fillStyle='rgba(68,126,110,.12)';ctx.fillRect(s[0]*12.8,s[1]*7.2,(s[2]-s[0])*12.8,(s[3]-s[1])*7.2);}}
  // Actual bridge state is readable in the world, not just in a journal sentence.
  if(state.mapId==='balkut'){const open=C.done(state,'cp-18-2');if(!open){ctx.save();ctx.translate(886,216);ctx.rotate(-.42);ctx.fillStyle='#202c25e6';ctx.strokeStyle='#dcba77';ctx.lineWidth=2;ctx.fillRect(-46,-38,92,52);ctx.strokeRect(-46,-38,92,52);ctx.beginPath();ctx.moveTo(-46,-8);ctx.lineTo(46,8);ctx.moveTo(-46,8);ctx.lineTo(46,-8);ctx.stroke();ctx.fillStyle='#edce8c';ctx.font='bold 11px Georgia';ctx.textAlign='center';ctx.fillText('TERANGKAT',0,-18);ctx.restore();}}
  for(const ex of m.exits){const open=C.access(state,ex.to),target=o?.map===ex.to;ctx.strokeStyle=open?(target?'#94d9c2':'#dec58b'):'#a87655';ctx.lineWidth=target?3:2;ctx.beginPath();ctx.ellipse(ex.x,ex.y,24,12,0,0,Math.PI*2);ctx.stroke();ctx.font='12px Georgia';ctx.textAlign='center';const label=open?ex.label:'Jalur tertutup';const w=ctx.measureText(label).width+14;ctx.fillStyle='#20362dde';ctx.fillRect(ex.x-w/2,ex.y-34,w,20);ctx.fillStyle='#efe2bf';ctx.fillText(label,ex.x,ex.y-20);}
  for(const link of C.links[state.mapId]||[]){ctx.strokeStyle='#e6cca0';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(...link.from);ctx.lineTo(...link.to);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#315d49';ctx.strokeStyle='#e6cca0';ctx.beginPath();ctx.arc(...link.from,10,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f5e3b8';ctx.font='12px Georgia';ctx.textAlign='center';ctx.fillText('E',link.from[0],link.from[1]+4);}
  for(const guard of runtime.patrols){if(o?.stealth){ctx.save();ctx.translate(guard.x,guard.y);ctx.rotate(guard.angle);ctx.fillStyle='#b4563550';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,guard.visionDist,-guard.visionAngle,guard.visionAngle);ctx.fill();ctx.restore();}}
  if(runtime.guide>0&&o?.map===state.mapId){ctx.strokeStyle='#75c6aa88';ctx.lineWidth=2;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(o.x,o.y);ctx.stroke();ctx.setLineDash([]);}
  if(runtime.scan>0){ctx.strokeStyle='#91dfcc';ctx.lineWidth=3;ctx.globalAlpha=runtime.scan/1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,(1.4-runtime.scan)*230,(1.4-runtime.scan)*125,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  const actors=[];for(const n of m.npcs||[])actors.push({x:n.x,y:n.y,sp:sprites[n.sprite],w:46,h:54,name:n.name,target:o?.npc===n.id});for(const g of runtime.patrols)actors.push({x:g.x,y:g.y,sp:sprites[g.sprite],w:46,h:54});
  if(state.mapId==='simpul'&&o?.seqIndex===10)actors.push({x:1125,y:410,sp:sprites['npc-maruani'],w:40,h:56,name:'Siluet di bukit'});
  const r=runtime.ruru;actors.push({x:r.x,y:r.y,sp:sprites['ruru-'+r.dir],w:32,h:32,bob:p.moving?Math.abs(Math.sin(t*6))*3:0});actors.push({x:p.x,y:p.y,sp:sprites['nara-'+p.dir],w:46,h:50,bob:p.z+(p.moving?Math.abs(Math.sin(p.walkTime*4))*3:0),player:true});
  actors.sort((a,b)=>a.y-b.y);for(const a of actors){ctx.fillStyle='#211c174d';ctx.beginPath();ctx.ellipse(a.x+5,a.y,15,6,-.3,0,Math.PI*2);ctx.fill();if(a.sp)ctx.drawImage(a.sp,Math.round(a.x-a.w/2),Math.round(a.y-a.h+4-(a.bob||0)),a.w,a.h);if(a.target){ctx.fillStyle='#efc468';ctx.beginPath();ctx.moveTo(a.x,a.y-a.h-17+Math.sin(t*3)*3);ctx.lineTo(a.x-6,a.y-a.h-8);ctx.lineTo(a.x+6,a.y-a.h-8);ctx.fill();}if(a.name&&Math.hypot(a.x-p.x,a.y-p.y)<160){ctx.font='11px Georgia';ctx.textAlign='center';ctx.fillStyle='#233a2ddd';const w=ctx.measureText(a.name).width+12;ctx.fillRect(a.x-w/2,a.y+7,w,17);ctx.fillStyle='#efdfba';ctx.fillText(a.name,a.x,a.y+19);}}
  if(o?.map===state.mapId&&!o.npc){ctx.strokeStyle='#f1cf82';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y,15+Math.sin(t*3)*2,7,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#eed6a1';ctx.fillRect(o.x-3,o.y-20,6,6);}
  if(runtime.flight){ctx.strokeStyle='#dec187';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y-p.z-28);ctx.lineTo(...runtime.flight.to);ctx.stroke();}
  if(storm()&&!state.settings.reducedMotion){ctx.fillStyle='#e9cc9377';for(let i=0;i<65;i++){const x=(i*137+runtime.time*240)%1280,y=(i*73+runtime.time*28)%720;ctx.fillRect(x,y,13,2);}}
  if(runtime.debugCollision){ctx.save();for(const [polys,color] of [[m.walkPolygons,'#36ec7860'],[m.blockPolygons,'#ff333388']]){ctx.fillStyle=color;ctx.strokeStyle=color;for(const poly of polys){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}}ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.ellipse(p.x,p.y,7,4,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  const gradient=ctx.createRadialGradient(640,360,280,640,360,790);gradient.addColorStop(0,'#15231600');gradient.addColorStop(1,storm()?'#59391b66':'#14241a44');ctx.fillStyle=gradient;ctx.fillRect(0,0,1280,720);
 }
 function back(){if(top()==='title-overlay')return;if(top()==='mg-overlay'){cancelChallenge();return;}if(top()==='vn-overlay'){renderSlots();push('pause-overlay');return;}if(top()){pop();return;}if(runtime.started){renderSlots();push('pause-overlay');}}
 function action(code){if(code==='F2'){runtime.debugCollision=!runtime.debugCollision;return;}if(code==='Escape'){back();return;}if(top()==='mg-overlay'){if(code==='Space'||code==='KeyE')timingHit();if(/^Digit[123]$/.test(code))puzzleMove(Number(code.slice(-1))-1);if(code==='KeyZ')$('puzzle-undo')?.click();return;}
  if(top()==='vn-overlay'){if(code==='ArrowUp'||code==='ArrowDown'){const btns=Array.from($('vn-choices').querySelectorAll('button'));if(btns.length){const i=btns.indexOf(document.activeElement);btns[(i+(code==='ArrowDown'?1:-1)+btns.length)%btns.length]?.focus();}}if(code==='KeyE'||code==='Space')advanceVN();if(code==='KeyB')openBacklog();if(code==='KeyV'){runtime.auto=!runtime.auto;runtime.skip=false;renderVN();}if(code==='KeyS'){runtime.skip=!runtime.skip;runtime.auto=false;renderVN();}return;}
  if(top())return;if(code==='KeyE')interact();else if(code==='Space')jump();else if(code==='KeyQ')scan();else if(code==='KeyM')openMap();else if(code==='KeyJ'||code==='Tab'){renderJournal();push('journal-overlay');}}
 function openBacklog(){$('vn-backlog-list').innerHTML=state.backlog.map(b=>`<article class="j-card"><strong>${esc(b.speaker)}</strong><p>${esc(b.text)}</p></article>`).join('');push('vn-backlog-overlay');}
 function pollGamepad(){if(!hasDOM||!navigator.getGamepads||!document.hasFocus())return;const pad=Array.from(navigator.getGamepads()).find(Boolean);if(!pad)return;
  const pressed=pad.buttons.map(b=>b.pressed);const edge=i=>pressed[i]&&!runtime.previousButtons[i];
  if(!top()){runtime.keys.ArrowLeft=pad.axes[0]<-.25;runtime.keys.ArrowRight=pad.axes[0]>.25;runtime.keys.ArrowUp=pad.axes[1]<-.25;runtime.keys.ArrowDown=pad.axes[1]>.25;runtime.keys.ShiftRight=pressed[5];runtime.keys.Space=pressed[0];if(edge(0))jump();if(edge(2))interact();if(edge(3))scan();if(edge(1))back();if(edge(9))back();}
  else{if(edge(1)||edge(9))back();else if(edge(0)){if(top()==='mg-overlay'&&runtime.challenge?.mode==='timing')timingHit();else document.activeElement?.click();}const axis=pad.axes[1]>.6?1:pad.axes[1]<-.6?-1:0;const move=edge(13)||edge(15)?1:edge(12)||edge(14)?-1:axis&&axis!==runtime.prevAxis?axis:0;if(move){const f=focusables(),i=f.indexOf(document.activeElement);f[(i+move+f.length)%f.length]?.focus();}runtime.prevAxis=axis;}
  runtime.previousButtons=pressed;
 }
 function bind(){
  window.addEventListener('keydown',e=>{if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
    if(e.code==='Tab'&&top()){const f=focusables(),i=f.indexOf(document.activeElement);if(f.length){e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}return;}
    if(!top()||top()==='vn-overlay'||top()==='mg-overlay')e.preventDefault();}
   if(top()&&['INPUT','SELECT'].includes(e.target.tagName)&&e.code!=='Escape')return;
   runtime.keys[e.code]=true;if(!e.repeat&&(runtime.started||e.code==='Escape'))action(e.code);
  });window.addEventListener('keyup',e=>{runtime.keys[e.code]=false;});window.addEventListener('blur',()=>{runtime.keys={};runtime.path=[];});document.addEventListener('visibilitychange',()=>{runtime.keys={};updateAudio();});
  $('game-canvas').addEventListener('pointerdown',e=>{if(!runtime.started||top())return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*1280/r.width,y=(e.clientY-r.top)*720/r.height;
    const targets=[...(MAPS[state.mapId].npcs||[]),...(cur()?.map===state.mapId?[cur()]:[])];const target=targets.find(o=>Math.hypot(o.x-x,o.y-y)<48);
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
  document.querySelectorAll('[data-jtab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-jtab]').forEach(x=>x.classList.toggle('primary',x===b));for(const id of ['perjalanan','rumor','bangsa','perlengkapan'])$('jtab-'+id).classList.toggle('hidden',id!==b.dataset.jtab);});
  on('map-mode-local',()=>{ $('map-pane-local').classList.remove('hidden');$('map-pane-world').classList.add('hidden');$('map-mode-local').classList.add('primary');$('map-mode-world').classList.remove('primary');});on('map-mode-world',()=>{$('map-pane-local').classList.add('hidden');$('map-pane-world').classList.remove('hidden');$('map-mode-local').classList.remove('primary');$('map-mode-world').classList.add('primary');});
  document.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{if(!state.discovered.includes(b.dataset.travel)||!C.access(state,b.dataset.travel))return;closeAll();switchMap(b.dataset.travel);});
  document.querySelectorAll('[data-setting]').forEach(el=>el.onchange=()=>{const key=el.dataset.setting;state.settings[key]=el.type==='checkbox'?el.checked:key==='puzzleMode'?el.value:Number(el.value);applySettings();saveToSlot(null,true);});
  const touch=document.createElement('div');touch.className='touch-controls hidden';touch.innerHTML='<div class="touch-directions"><button data-touch="KeyW">↑</button><button data-touch="KeyA">←</button><button data-touch="KeyS">↓</button><button data-touch="KeyD">→</button></div><div><button id="touch-jump">Lompat</button><button id="touch-interact">E</button></div>';$('stage').append(touch);runtime.touch=touch;
  touch.querySelectorAll('[data-touch]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);runtime.keys[b.dataset.touch]=true;};b.onpointerup=b.onpointercancel=()=>runtime.keys[b.dataset.touch]=false;});$('touch-jump').onpointerdown=e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);runtime.keys.Space=true;jump();};$('touch-jump').onpointerup=$('touch-jump').onpointercancel=()=>{runtime.keys.Space=false;};on('touch-interact',interact);
 }
 function assets(){const all={...root.PIXEL_BAB0_ASSETS,...root.PIXEL_UI_ASSETS};return Promise.all(Object.entries(all).map(([key,src])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{sprites[key]=img;resolve();};img.onerror=()=>{console.warn('Asset unavailable',key);resolve();};img.src=src;})));}
 async function boot(){await assets();runtime.debugCollision=new URLSearchParams(root.location?.search||'').has('collision');
  // Restore optional social interactions from the 3D Nilasar courtyard.
  MAPS.nilasar.npcs.push({id:'perintis-istirahat',name:'Perintis yang beristirahat',sprite:'npc-pedagang-bahtari',x:900,y:430,poiText:'Jalan ke utara belum aman setelah longsoran. Satu pijakan yang diperiksa bisa menyelamatkan seluruh pedati.'},{id:'pedati',name:'Pedati kafilah',sprite:'prop-cargo',x:830,y:500,poiText:'Tali tambat aus di bagian yang bergesekan dengan kayu. Muatan diikat rendah agar tidak mudah terguling di lereng.'});
  
  $('journal-nara').src=portrait('Nara');$('journal-ruru').src=portrait('Ruru');if(sprites['world-atlas'])$('world-atlas-img').src=sprites['world-atlas'].src;bind();runtime.stack=[{id:'title-overlay'}];syncStack();enterMapRuntime();syncHUD();applySettings();$('loading').classList.add('hidden');
  if(safeStorage(C.PREFIX+'_auto')||safeStorage(C.PREFIX+'_auto.bak')||safeStorage(C.LEGACY))$('btn-continue').classList.remove('hidden');focusables()[0]?.focus();
  let previous=performance.now(),accumulator=0;function frame(now){const elapsed=Math.min(.1,Math.max(0,(now-previous)/1000));previous=now;if(!document.hidden){accumulator+=elapsed;while(accumulator>=1/120){tick(1/120);accumulator-=1/120;}draw();runtime.touch.classList.toggle('hidden',!runtime.started||!!top());}else accumulator=0;requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }
 root.BAB0_ENGINE={state,runtime,ALL_OBJECTIVES:OBJECTIVES,SFX,sliderToGain,linearToDb,updateAudio,unlockAudio,switchMap,advanceObjective:finish,triggerSonar:scan,saveToSlot,loadFromSlot,
  interact,startChallenge,puzzleWin,puzzleMove,timingHit,startDialogue,advanceVN,tick,nearby,jump,nearLink,useLink,begin};
 if(hasDOM){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();}
})(globalThis);




