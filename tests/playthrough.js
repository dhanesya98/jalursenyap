/* Assisted-navigation integration test. Actual controller, collisions and UI;
   no teleport, direct quest completion, or writes to the player's save key. */
window.addEventListener('DOMContentLoaded',()=>{
 const g=window.JalurGame;if(!g)return;g.state.storage={getItem:k=>localStorage.getItem('qa-demo1:'+k),setItem:(k,v)=>localStorage.setItem('qa-demo1:'+k,v)};g.ui.refreshTitle();
 const bar=document.createElement('nav');bar.style.cssText='position:fixed;z-index:110;bottom:8px;left:10px;background:#f3e9d2;padding:8px;display:flex;gap:8px;font:12px Segoe UI';bar.setAttribute('aria-label','Integration QA');document.body.append(bar);const out=document.createElement('output');let queue=[],leg=0,started=0,record=[];
 const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;bar.append(b);};
 function log(message){record.push(message);out.textContent=message;}
 function plan(){const s=g.state.value,w=g.data.world;if(!g.started||g.mode!=='play'){log('Mulai atau lanjutkan permainan dahulu');return;}let points=[];if(s.status==='ready')points=[[0,0,31]];else if(s.status==='travel'){
  if(s.stage===0)points=w.routes.north.points;
  if(s.stage===1)points=[...w.routes.west.points.slice(0,4),{grapple:'west1'},...w.routes.west.points.slice(5)];
  if(s.stage===2)points=w.routes[s.route].points;
 }else if(s.status==='return')points=s.stage===1?[...w.routes.north.points].reverse().concat([[0,0,31]]):[w.routes.west.points.at(-1),w.routes.west.points[5],w.routes.west.points[4],{grapple:'west2'},...w.routes.west.points.slice(0,3).reverse(),[0,0,31]];
 if(!points.length){log('Perjalanan telah selesai');return;}queue=points;leg=0;started=performance.now();log('Berjalan melalui controller');}
 add('Jalan ke tujuan',plan);add('Hentikan jalan',()=>{queue=[];g.player.resetInput();log('Berhenti');});
 add('Periksa save/load',()=>{g.save();const before=JSON.stringify(g.state.value);const ok=g.state.load()&&before===JSON.stringify(g.state.value);log('Save/load: '+(ok?'PASS':'FAIL'));});
 add('Ukur FPS',()=>{let first=0,n=0;const sample=t=>{if(!first)first=t;n++;if(t-first<5000)requestAnimationFrame(sample);else log('FPS: '+Math.round(n*1000/(t-first))+' · '+innerWidth+'×'+innerHeight+' · '+document.visibilityState);};requestAnimationFrame(sample);});
 add('Laporan',()=>{log('Status '+g.state.value.status+' · selesai '+g.state.value.completed.join(',')+' · '+g.state.condition());const pre=document.createElement('pre');pre.textContent=JSON.stringify({state:g.state.value,record},null,2);pre.style.cssText='position:fixed;z-index:120;right:10px;top:10px;max-height:70vh;overflow:auto;background:#eee3cb;padding:12px;font:10px monospace';pre.onclick=()=>pre.remove();document.body.append(pre);});bar.append(out);
 function tick(){requestAnimationFrame(tick);if(!queue.length||g.mode!=='play')return;if(performance.now()-started>180000){queue=[];g.player.resetInput();log('FAIL: batas waktu navigasi');return;}const target=queue[leg];if(!target){queue=[];g.player.resetInput();log('Tiba · gunakan E untuk interaksi');return;}
 if(target.grapple){g.player.resetInput();if(g.player.flight)return;const a=g.world.anchors.find(a=>a.id===target.grapple);if(g.player.position.distanceTo(a.landing)<1){leg++;return;}if(!g.state.value.unlocked.includes('grapple')||!g.player.travelTo(a.landing,'grapple')){log('FAIL: kait '+target.grapple);queue=[];return;}g.activeAnchor=a;return;}
 const dx=target[0]-g.player.position.x,dz=target[2]-g.player.position.z;if(Math.hypot(dx,dz)<1.25){leg++;g.player.resetInput();return;}g.cameraYaw=Math.atan2(-dx,-dz);g.player.keys={KeyW:true,ShiftLeft:true};}
 requestAnimationFrame(tick);
});
