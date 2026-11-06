/* Physical quest props share the same terrain and objective data as the journal. */
(function(root){
 'use strict';
 const T=THREE;
 function build(w){
  const stone=new T.MeshToonMaterial({color:0xb7a58b}),wood=new T.MeshToonMaterial({color:0x846448}),paper=new T.MeshToonMaterial({color:0xeee2c6}),blue=new T.MeshToonMaterial({color:0x3d6e8f});
  const box=(g,x,y,z,sx,sy,sz,m)=>{const o=new T.Mesh(new T.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
  for(const o of w.data.quests.objects){
   const g=new T.Group();g.name=o.name;g.position.set(o.position[0],w.ground(o.position[0],o.position[2]),o.position[2]);w.scene.add(g);
   if(o.kind==='book'||o.kind==='stamp'||o.kind==='cargo'){box(g,0,.8,0,1.7,.15,1,wood);for(const x of [-.65,.65])box(g,x,.4,0,.12,.8,.7,wood);box(g,0,.92,0,o.kind==='cargo'?.9:.65,o.kind==='cargo'?.55:.05,.55,o.kind==='stamp'?blue:paper);}
   else if(o.kind==='ring'){const ring=new T.Mesh(new T.TorusGeometry(.85,.15,8,24,Math.PI*1.83),stone);ring.rotation.x=-Math.PI/2;ring.position.y=.6;g.add(ring);box(g,0,.2,0,2,.3,1.6,stone);}
   else if(o.kind==='well'){const ring=new T.Mesh(new T.TorusGeometry(1.1,.25,6,24),stone);ring.rotation.x=-Math.PI/2;ring.position.y=.75;g.add(ring);}
   else if(o.kind==='door'){box(g,-1.6,1.5,-3,.3,3,7,stone);box(g,4.8,1.5,-3,.3,3,7,stone);box(g,1.6,1.5,-6.7,6.7,3,.3,stone);box(g,1.6,3,-3,6.7,.25,7,wood);box(g,-.65,.6,0,.2,1.2,1,wood);}
   else if(o.kind==='stone'){box(g,0,.65,0,1.2,1.3,1,stone);box(g,0,1.32,0,.85,.06,.7,blue);}
   else if(o.kind==='shelter'){box(g,0,1.25,-1,4,2.5,.4,stone);box(g,0,2.5,0,4.5,.2,2.8,wood);}
   else {const prop=JSArt.prop(o.kind==='lantern'?'lantern':'sign');g.add(prop);}
   w.interactions.push({id:o.id,name:o.name,kind:'quest',position:g.position.clone(),group:g});
  }
  // A fixed, walkable crossing replaces the removed grapple mechanic.
  for(const b of w.data.world.bridges||[]){const g=new T.Group();w.scene.add(g);const from=new T.Vector3(...b.from),to=new T.Vector3(...b.to),length=from.distanceTo(to),mid=from.clone().lerp(to,.5);g.position.copy(mid);g.rotation.z=Math.atan2(to.y-from.y,to.x-from.x);box(g,0,-.15,0,length,.22,b.width,wood);for(let x=-length/2;x<=length/2;x+=3){for(const z of [-b.width/2,b.width/2])box(g,x,.5,z,.12,1,.12,wood);}for(const z of [-b.width/2,b.width/2])box(g,0,1,z,length,.08,.08,wood);}
  const gate=JSArt.prop('gate');gate.position.set(60,w.ground(60,-28),-28);w.scene.add(gate);w.northGate={x:60,z:-28,radius:4.6,bottom:gate.position.y,top:gate.position.y+6,active:true,group:gate};w.blockers.push(w.northGate);
  const marker=new T.Mesh(new T.OctahedronGeometry(.24),new T.MeshBasicMaterial({color:0xf2c46b,depthTest:false}));marker.renderOrder=10;w.scene.add(marker);w.questMarker=marker;
 }
 function sync(w){if(w.northGate){w.northGate.active=!w.state.reached('kesa_open');w.northGate.group.visible=w.northGate.active;}if(w.questMarker){const o=w.state.objective();w.questMarker.visible=!o.done&&w.state.value.settings.hints;w.questMarker.position.set(o.position[0],w.ground(o.position[0],o.position[2])+2.2,o.position[2]);}}
 function animate(w,t){if(w.questMarker)w.questMarker.rotation.y=t;const phase=t%5,pulse=phase<.22||phase>.55&&phase<.77||phase>1.1&&phase<1.32;if(w.relayLight)w.relayLight.intensity=w.state.reached('letter')&&!w.state.reached('relay_contact')?(pulse?2.4:.12):.12;}
 root.JSQuestWorld={build,sync,animate};
})(globalThis);
