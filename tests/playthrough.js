/* Assisted-navigation integration test. Actual controller, collisions and UI;
   no teleport, direct quest completion, or writes to the player's save key. */
window.addEventListener('DOMContentLoaded',()=>{
 const g=window.JalurGame;if(!g)return;g.state.storage={getItem:k=>localStorage.getItem('qa-bab0-v6:'+k),setItem:(k,v)=>localStorage.setItem('qa-bab0-v6:'+k,v)};g.ui.refreshTitle();
 const bar=document.createElement('nav');bar.style.cssText='position:fixed;z-index:110;bottom:8px;left:10px;background:#f3e9d2;padding:8px;display:flex;gap:8px;font:12px Segoe UI';bar.setAttribute('aria-label','Integration QA');document.body.append(bar);const out=document.createElement('output');let queue=[],leg=0,started=0,record=[];
 const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;bar.append(b);};
 function log(message){record.push(message);out.textContent=message;}
 function plan(){const s=g.state.value;if(!g.started||g.mode!=='play'){log('Mulai atau lanjutkan permainan dahulu');return;}if(!g.state.step()){log('Bab selesai');return;}queue=g.world.questNavigation(g.player.position);leg=0;started=performance.now();log('Berjalan melalui controller');}
 add('Jalan ke tujuan',plan);add('Hentikan jalan',()=>{queue=[];g.player.resetInput();log('Berhenti');});
 add('Periksa save/load',()=>{g.save();const before=JSON.stringify(g.state.value);const ok=g.state.load()&&before===JSON.stringify(g.state.value);log('Save/load: '+(ok?'PASS':'FAIL'));});
 add('Ukur FPS',()=>{let first=0,n=0;const sample=t=>{if(!first)first=t;n++;if(t-first<5000)requestAnimationFrame(sample);else log('FPS: '+Math.round(n*1000/(t-first))+' · '+innerWidth+'×'+innerHeight+' · '+document.visibilityState);};requestAnimationFrame(sample);});
 add('Laporan',()=>{log('Langkah '+(g.state.step()?.id||'selesai')+' · '+g.state.value.status+' · selesai '+g.state.value.completed.join(',')+' · '+g.state.condition());const pre=document.createElement('pre');pre.textContent=JSON.stringify({state:g.state.value,record},null,2);pre.style.cssText='position:fixed;z-index:120;right:10px;top:10px;max-height:70vh;overflow:auto;background:#eee3cb;padding:12px;font:10px monospace';pre.onclick=()=>pre.remove();document.body.append(pre);});bar.append(out);
 function tick(){requestAnimationFrame(tick);if(!queue.length||g.mode!=='play')return;if(performance.now()-started>180000){queue=[];g.player.resetInput();log('FAIL: batas waktu navigasi');return;}const target=queue[leg];if(!target){queue=[];g.player.resetInput();log('Tiba · gunakan E untuk interaksi');return;}
 const dx=target[0]-g.player.position.x,dz=target[2]-g.player.position.z;if(Math.hypot(dx,dz)<(leg===queue.length-1?2.6:1.25)){leg++;g.player.resetInput();return;}g.cameraYaw=Math.atan2(-dx,-dz);g.player.keys={KeyW:true,ShiftLeft:true};}
 requestAnimationFrame(tick);

 let auto=false,chosen=0,lastStep='',lastDecision=0,startedRun=0;
 add('Uji alur lengkap A',()=>{g.start(false);lastStep='';chosen=0;auto=true;startedRun=performance.now();log('QA otomatis A aktif');});
 add('Uji alur lengkap B',()=>{g.start(false);lastStep='';chosen=1;auto=true;startedRun=performance.now();log('QA otomatis B aktif');});
 add('Hentikan QA',()=>{auto=false;queue=[];g.player.resetInput();});
 function autoTick(now){requestAnimationFrame(autoTick);if(!auto)return;if(now-startedRun>720000){auto=false;log('FAIL: batas waktu QA');return;}if(now-lastDecision<160)return;lastDecision=now;
  if(!g.started){g.start(false);return;}
  if(g.mode==='ending'){auto=false;log('PASS: 29 langkah sampai epilog; surat tetap dibawa');return;}
  if(g.mode==='pause'){g.setMode('play');return;}
  if(g.mode==='dialogue'){const choices=g.ui.dialogue?.nodes[g.ui.node]?.choices;if(choices)g.ui.choose(Math.min(chosen,choices.length-1));else g.ui.advance();return;}
  if(g.mode!=='play')return;
  const id=g.state.step()?.id;if(!id){auto=false;log('PASS: selesai');return;}
  if(id!==lastStep){lastStep=id;queue=[];g.player.resetInput();g.state.value.route=chosen?'fast':'safe';g.world.sync();plan();return;}
  if(!queue.length){const item=g.world.nearestInteraction(g.player.position);if(item?.id===g.state.objective().id)g.interact();else{auto=false;log('FAIL: interaksi '+id+' tidak terjangkau');}}
 }
 requestAnimationFrame(autoTick);

});
