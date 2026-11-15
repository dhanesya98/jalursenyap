/* Jalur Senyap — Dev Mode Tools (embedded ONLY in Bab0-TopDown-Pixel/Jalur-Senyap-Complete-Pixel.html).
   Official index.html never sets JALUR_DEV_MODE and never loads this module. */
(function(root){
 'use strict';
 if(!root.JALUR_DEV_MODE||typeof document==='undefined')return;
 const C=root.PixelCampaign,D=root.BAB0_DATA,R=root.RPGSystem,E=root.BAB0_ENGINE;
 if(!C||!D||!E)return;
 const $=id=>document.getElementById(id);

 function ensureStarted(){
  E.closeAll();
  E.runtime.dialogue=null;
  E.runtime.challenge=null;
  E.runtime.encounter=null;
  if(!E.runtime.started){
   E.runtime.started=true;
   $('title-overlay')?.classList.add('hidden');
   $('hud-topbar')?.classList.remove('hidden');
   E.applySettings();
   E.unlockAudio();
  }
 }

 function warpObjective(targetId){
  const idx=targetId==='COMPLETE_ALL'?C.objectives.length:C.objectives.findIndex(o=>o.id===targetId);
  if(idx<0)return false;
  ensureStarted();
  const prevSettings=E.state.settings?JSON.parse(JSON.stringify(E.state.settings)):null;
  const fresh=C.initial();
  if(prevSettings)fresh.settings=prevSettings;
  fresh.introSeen=true;
  for(let i=0;i<idx;i++){
   const step=C.objectives[i];
   if(!fresh.discovered.includes(step.map))fresh.discovered.push(step.map);
   C.complete(fresh,step.id);
  }
  const dest=C.objectives[Math.min(idx,C.objectives.length-1)];
  if(!fresh.discovered.includes(dest.map))fresh.discovered.push(dest.map);
  const spawn=C.safeSpawn(dest.map,[dest.x,dest.y],fresh);
  fresh.mapId=dest.map;
  Object.assign(fresh.player,{x:spawn[0],y:spawn[1],z:0,vz:0,dir:'down',moving:false});
  fresh.lastSafe={mapId:dest.map,x:spawn[0],y:spawn[1]};
  if(R&&fresh.rpg){
   const st=R.getDerivedStats(fresh.rpg);
   fresh.rpg.hp=st.ketahanan;
  }
  Object.assign(E.state,fresh);
  E.runtime.clearedPatrols=[];
  E.runtime.scanCooldown=0;
  E.runtime.encounterGrace=0;
  E.enterMapRuntime();
  E.syncHUD();
  E.refreshMeters();
  E.saveToSlot(null,true);
  E.toast(targetId==='COMPLETE_ALL'?'[DEV] Seluruh 71 misi Bab 0–1 diselesaikan.':`[DEV] Lompat ke ${dest.id}: ${dest.itemLabel}`);
  refreshPanel();
  return true;
 }

 function warpMap(mapId){
  if(!D.MAPS[mapId])return false;
  ensureStarted();
  if(!E.state.discovered.includes(mapId))E.state.discovered.push(mapId);
  const spawn=C.safeSpawn(mapId,null,E.state);
  E.state.mapId=mapId;
  Object.assign(E.state.player,{x:spawn[0],y:spawn[1],z:0,vz:0,moving:false});
  E.state.lastSafe={mapId,x:spawn[0],y:spawn[1]};
  E.enterMapRuntime();
  E.syncHUD();
  E.updateAudio();
  E.saveToSlot(null,true);
  E.toast(`[DEV] Pindah ke peta ${D.MAPS[mapId].name}`);
  refreshPanel();
  return true;
 }

 function healFull(){
  ensureStarted();
  E.state.cargo=100;
  if(R&&E.state.rpg){
   const d=R.getDerivedStats(E.state.rpg);
   E.state.rpg.hp=d.ketahanan;
  }
  E.refreshMeters();
  if(E.runtime.encounter)E.renderEncounter();
  E.toast('[DEV] Ketahanan & Muatan dipulihkan 100%.');
  refreshPanel();
 }

 function grantXp(amount=100){
  ensureStarted();
  if(R&&E.state.rpg){
   R.grantXp(E.state.rpg,amount);
   E.refreshMeters();
   E.saveToSlot(null,true);
   E.toast(`[DEV] +${amount} XP (Tingkat ${E.state.rpg.level}).`);
  }
  refreshPanel();
 }

 function unlockAllGear(){
  ensureStarted();
  if(R&&E.state.rpg){
   for(const id of Object.keys(R.ITEMS))R.unlockItem(E.state.rpg,id);
   for(const id of Object.keys(R.CONSUMABLES)){
    E.state.rpg.consumables[id]=(E.state.rpg.consumables[id]||0)+3;
   }
   const d=R.getDerivedStats(E.state.rpg);
   E.state.rpg.hp=d.ketahanan;
   E.refreshMeters();
   E.saveToSlot(null,true);
   E.toast('[DEV] Semua perlengkapan & +3 setiap bekal dibuka.');
  }
  refreshPanel();
 }

 function toggleCollision(){
  E.runtime.debugCollision=!E.runtime.debugCollision;
  E.toast(E.runtime.debugCollision?'[DEV] Garis batas jalan & rintangan [F2]: AKTIF':'[DEV] Garis batas jalan & rintangan [F2]: NONAKTIF');
  refreshPanel();
 }

 function solveActivePuzzle(){
  const ch=E.runtime.challenge;
  if(!ch){
   E.toast('[DEV] Belum ada puzzle yang sedang terbuka.');
   return false;
  }
  if(ch.kind==='cargo')ch.counts=[2,2,2];
  const ok=E.puzzleWin(ch);
  if(ok)E.toast('[DEV] Puzzle diselesaikan otomatis.');
  refreshPanel();
  return ok;
 }

 function launchEncounter(encId){
  if(!R?.ENCOUNTERS?.[encId])return false;
  ensureStarted();
  E.openEncounter(encId,{kind:'dev',id:'dev-'+encId,name:R.ENCOUNTERS[encId].name});
  refreshPanel();
  return true;
 }

 function winActiveEncounter(){
  const enc=E.runtime.encounter;
  if(!enc){
   E.toast('[DEV] Tidak sedang dalam pertarungan.');
   return false;
  }
  if(!enc.done){
   enc.hp=0;
   E.resolveEncounterVictory(enc,'victory');
   enc.log.push('[DEV] Lawan langsung dikalahkan.');
   E.refreshMeters();
   E.renderEncounter();
   E.saveToSlot(null,true);
   E.toast('[DEV] Pertarungan dimenangkan.');
  }
  refreshPanel();
  return true;
 }

 function advanceOneObjective(){
  const cur=C.current(E.state);
  if(!cur){
   E.toast('[DEV] Sudah di akhir Bab 1 (71/71 selesai).');
   return false;
  }
  const nextObj=C.objectives[cur.index+1];
  return warpObjective(nextObj?nextObj.id:'COMPLETE_ALL');
 }

 const PRESETS=[
  {label:'Bab 0 Awal (Nilasar)',id:'cp-0-0'},
  {label:'Cincin Perunggu (Batu Nama)',id:'cp-7-0'},
  {label:'Bab 1 Awal (Bal-Kut)',id:'cp-14-0'},
  {label:'Sidang 7 Panji (Salkara)',id:'cp-20-0'},
  {label:'Sabotase Minyak (Salkara)',id:'cp-23-0'},
  {label:'Pesisir Tepi Salkara',id:'cp-24-0'},
  {label:'Gencatan Senjata (Tamat Bab 1)',id:'cp-26-0'}
 ];

 let fab=null,panel=null,statusEl=null,objSelect=null,mapSelect=null,encSelect=null,colBtn=null;

 function refreshPanel(){
  if(!panel)return;
  const o=C.current(E.state),p=E.state.player,rpg=E.state.rpg;
  if(statusEl){
   statusEl.textContent=`Peta: ${E.state.mapId} (${Math.round(p.x)},${Math.round(p.y)}) · Misi: ${o?o.id:`SELESAI (${E.state.completed.length}/71)`} · Lv ${rpg?.level||1} (${rpg?.hp||0} HP)`;
  }
  if(objSelect&&o)objSelect.value=o.id;
  if(mapSelect)mapSelect.value=E.state.mapId;
  if(colBtn)colBtn.textContent=E.runtime.debugCollision?'[F2] Garis Batas Jalan: ON':'[F2] Garis Batas Jalan: OFF';
 }

 function togglePanel(force){
  if(!panel)return;
  const open=force!==undefined?force:panel.classList.contains('hidden');
  panel.classList.toggle('hidden',!open);
  if(open)refreshPanel();
 }

 function mountUI(){
  if(document.getElementById('dev-mode-shell'))return;
  const style=document.createElement('style');
  style.id='dev-mode-styles';
  style.textContent=`
   #dev-mode-shell{position:fixed;left:12px;bottom:12px;z-index:120;font-family:system-ui,-apple-system,sans-serif;color:#f5ebd4;font-size:12px}
   #dev-fab{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;border:1px solid #d49b38;background:rgba(24,20,16,.92);color:#ffd275;font-weight:700;font-size:11px;letter-spacing:.04em;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.45)}
   #dev-fab:hover{background:#2d2419;border-color:#ffda85}
   #dev-panel{position:fixed;left:12px;bottom:50px;width:min(380px,calc(100vw - 24px));max-height:calc(100vh - 76px);overflow:auto;background:rgba(20,18,16,.96);border:1px solid #c9923b;border-radius:12px;padding:12px;box-shadow:0 14px 36px rgba(0,0,0,.65);backdrop-filter:blur(6px)}
   #dev-panel.hidden{display:none}
   .dev-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,215,130,.2)}
   .dev-head strong{color:#ffd275;font-size:13px}
   .dev-status{margin:6px 0 8px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.06);font-size:11px;line-height:1.4;color:#e6dcc3}
   .dev-sec{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
   .dev-sec h4{margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#d7be8e}
   .dev-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
   .dev-row select,.dev-row button,#dev-panel button{font-family:inherit;font-size:11px;border-radius:6px;border:1px solid rgba(255,215,130,.3);background:#2a241d;color:#f5ebd4;padding:5px 8px;cursor:pointer}
   .dev-row select{flex:1;min-width:160px}
   #dev-panel button:hover{background:#3c3226;border-color:#ffd275}
   #dev-panel button.dev-accent{background:#7b541c;border-color:#f0be59;color:#fff7e2;font-weight:700}
  `;
  document.head?.append(style);

  const shell=document.createElement('div');
  shell.id='dev-mode-shell';

  fab=document.createElement('button');
  fab.id='dev-fab';
  fab.type='button';
  fab.textContent='DEV MODE · Panel [F9]';
  fab.onclick=()=>togglePanel();

  panel=document.createElement('section');
  panel.id='dev-panel';
  panel.className='hidden';
  panel.setAttribute('aria-label','Panel Pengembang');

  const head=document.createElement('div');
  head.className='dev-head';
  head.innerHTML='<strong>DEV MODE · Uji Coba Cepat</strong>';
  const closeBtn=document.createElement('button');
  closeBtn.type='button';
  closeBtn.textContent='Tutup [F9]';
  closeBtn.onclick=()=>togglePanel(false);
  head.append(closeBtn);

  statusEl=document.createElement('div');
  statusEl.className='dev-status';

  const s1=document.createElement('div');
  s1.className='dev-sec';
  s1.innerHTML='<h4>Lompat Bab / Misi</h4>';
  const presetRow=document.createElement('div');
  presetRow.className='dev-row';
  PRESETS.forEach(p=>{
   const b=document.createElement('button');
   b.type='button';
   b.textContent=p.label;
   b.onclick=()=>warpObjective(p.id);
   presetRow.append(b);
  });
  const objRow=document.createElement('div');
  objRow.className='dev-row';
  objSelect=document.createElement('select');
  C.objectives.forEach(o=>{
   const opt=document.createElement('option');
   opt.value=o.id;
   opt.textContent=`[Bab ${o.chapter}] ${o.id} — ${o.itemLabel}`;
   objSelect.append(opt);
  });
  const optAll=document.createElement('option');
  optAll.value='COMPLETE_ALL';
  optAll.textContent='[Tamat] Selesaikan Semua 71 Langkah';
  objSelect.append(optAll);
  const goObj=document.createElement('button');
  goObj.type='button';
  goObj.className='dev-accent';
  goObj.textContent='Lompat';
  goObj.onclick=()=>warpObjective(objSelect.value);
  const nextObjBtn=document.createElement('button');
  nextObjBtn.type='button';
  nextObjBtn.textContent='+1 Misi';
  nextObjBtn.onclick=advanceOneObjective;
  objRow.append(objSelect,goObj,nextObjBtn);
  s1.append(presetRow,objRow);

  const s2=document.createElement('div');
  s2.className='dev-sec';
  s2.innerHTML='<h4>Teleport Peta</h4>';
  const mapRow=document.createElement('div');
  mapRow.className='dev-row';
  mapSelect=document.createElement('select');
  Object.entries(D.MAPS).forEach(([id,m])=>{
   const opt=document.createElement('option');
   opt.value=id;
   opt.textContent=`${id} — ${m.name}`;
   mapSelect.append(opt);
  });
  const goMap=document.createElement('button');
  goMap.type='button';
  goMap.className='dev-accent';
  goMap.textContent='Pindah';
  goMap.onclick=()=>warpMap(mapSelect.value);
  mapRow.append(mapSelect,goMap);
  s2.append(mapRow);

  const s3=document.createElement('div');
  s3.className='dev-sec';
  s3.innerHTML='<h4>Status, Puzzle &amp; Peta</h4>';
  const actRow=document.createElement('div');
  actRow.className='dev-row';
  const bHeal=document.createElement('button');
  bHeal.type='button';bHeal.textContent='Pulih 100%';bHeal.onclick=healFull;
  const bXp=document.createElement('button');
  bXp.type='button';bXp.textContent='+100 XP';bXp.onclick=()=>grantXp(100);
  const bGear=document.createElement('button');
  bGear.type='button';bGear.textContent='Buka Semua Item';bGear.onclick=unlockAllGear;
  const bPuz=document.createElement('button');
  bPuz.type='button';bPuz.className='dev-accent';bPuz.textContent='Selesaikan Puzzle Aktif';bPuz.onclick=solveActivePuzzle;
  colBtn=document.createElement('button');
  colBtn.type='button';colBtn.onclick=toggleCollision;
  actRow.append(bHeal,bXp,bGear,bPuz,colBtn);
  s3.append(actRow);

  const s4=document.createElement('div');
  s4.className='dev-sec';
  s4.innerHTML='<h4>Uji Pertarungan RPG</h4>';
  const encRow=document.createElement('div');
  encRow.className='dev-row';
  encSelect=document.createElement('select');
  Object.values(R?.ENCOUNTERS||{}).forEach(e=>{
   const opt=document.createElement('option');
   opt.value=e.id;
   opt.textContent=`${e.name} (HP ${e.maxHp})`;
   encSelect.append(opt);
  });
  const bFight=document.createElement('button');
  bFight.type='button';bFight.className='dev-accent';bFight.textContent='Mulai Laga';bFight.onclick=()=>launchEncounter(encSelect.value);
  const bWin=document.createElement('button');
  bWin.type='button';bWin.textContent='Menangkan Laga';bWin.onclick=winActiveEncounter;
  encRow.append(encSelect,bFight,bWin);
  s4.append(encRow);

  panel.append(head,statusEl,s1,s2,s3,s4);
  shell.append(panel,fab);
  document.body?.append(shell);
  refreshPanel();

  if(root.addEventListener){
   root.addEventListener('keydown',ev=>{
    if(ev.code==='F9'){ev.preventDefault?.();togglePanel();}
   });
   if(typeof setInterval==='function'){
    setInterval(()=>{if(panel&&!panel.classList.contains('hidden'))refreshPanel();},450);
   }
  }
 }

 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI);
 else mountUI();

 root.JALUR_DEV_TOOLS={warpObjective,warpMap,healFull,grantXp,unlockAllGear,toggleCollision,solveActivePuzzle,launchEncounter,winActiveEncounter,advanceOneObjective,togglePanel};
})(globalThis);
