(function(root){
 'use strict';
 class World {
  constructor(scene,data,state,bus){this.scene=scene;this.data=data;this.state=state;this.bus=bus;this.terrain=new JSCore.Terrain(data.world);this.blockers=[];this.solidMeshes=[];this.animations=[];this.npcs=[];this.interactions=[];this.anchors=[];this.checkpoints=[];this.ladders=[];this.lanterns=[];this.discoveries=data.world.discoveries;this.build();}
  ground(x,z){return this.terrain.height(x,z);}
  place(kind,x,z,options={}){const g=JSArt.prop(kind,options);g.position.set(x,this.ground(x,z),z);if(options.y!==undefined)g.position.y=options.y;if(options.rotation)g.rotation.y=options.rotation;this.scene.add(g);if(g.userData.animate)this.animations.push(g);return g;}
  block(g,radius,height=8){this.blockers.push({x:g.position.x,z:g.position.z,radius,bottom:g.position.y,top:g.position.y+height,active:true,group:g});g.traverse(o=>{if(o.isMesh)this.solidMeshes.push(o);});return this.blockers[this.blockers.length-1];}
  terrainMesh(){
   const geo=new THREE.PlaneGeometry(440,440,220,220);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,colors=[];
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=this.ground(x,z),surface=this.terrain.surface(x,z);p.setY(i,y);const c=new THREE.Color(y<-5?0x836454:surface==='cliff'?0xa68e76:surface==='rock'?0xc6b79c:0xd9b887);const variation=Math.sin(x*.17+z*.23)*.025;c.offsetHSL(0,0,variation);colors.push(c.r,c.g,c.b);}
   geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
   this.land=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color:0xffffff,vertexColors:true,gradientMap:JSArt.gradient}));this.land.receiveShadow=true;this.scene.add(this.land);
   for(const [id,r] of Object.entries(this.data.world.routes)){const verts=[],idx=[];let n=0;for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],steps=Math.ceil(JSCore.distance(a,b)/2),dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);for(let j=0;j<=steps;j++){const t=j/steps,x=a[0]+dx*t,z=a[2]+dz*t;if(id==='west'&&x<-60&&x>-84)continue;const width=id==='fast'?1.05:1.45;verts.push(x-dz/len*width,this.ground(x-dz/len*width,z+dx/len*width)+.055,z+dx/len*width,x+dz/len*width,this.ground(x+dz/len*width,z-dx/len*width)+.055,z-dx/len*width);if(j>0&&n>0)idx.push(n-2,n-1,n,n-1,n+1,n);n+=2;}}
    const ribbon=new THREE.BufferGeometry();ribbon.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));ribbon.setIndex(idx);ribbon.computeVertexNormals();const mesh=new THREE.Mesh(ribbon,new THREE.MeshBasicMaterial({color:id==='fast'?0xac9170:id==='safe'?0xcbb997:0xc6a574,transparent:true,opacity:.48,side:THREE.DoubleSide,depthWrite:false}));this.scene.add(mesh);
   }
  }
  build(){
   this.terrainMesh();JSAtelier.buildHub(this);JSRegionArt.build(this);
   this.place('ruin',-14,-121);this.place('sign',4,-120);
   const pool=new THREE.Mesh(new THREE.CircleGeometry(13,48),new THREE.MeshBasicMaterial({color:0x74aaa0,transparent:true,opacity:.85}));pool.rotation.x=-Math.PI/2;pool.position.set(-142,2.025,77);this.scene.add(pool);
   // Final monolith is behind the altar, clear of its interaction radius.
   this.place('ruin',114,-95);this.altar=this.place('altar',125,-85);this.interactions.push({id:'altar',name:'Altar Simpul Sembilan',position:new THREE.Vector3(125,this.ground(125,-85),-85),kind:'altar'});
   this.gate=this.place('gate',70,-10,{rotation:Math.PI/2});this.gateBlock={x:70,z:-10,radius:5,bottom:this.gate.position.y,top:this.gate.position.y+6,active:false,group:this.gate};this.blockers.push(this.gateBlock);
   for(const item of this.data.world.npcs){const group=JSArt.character(item.id);group.position.set(item.position[0],this.ground(item.position[0],item.position[2]),item.position[2]);this.scene.add(group);this.npcs.push({id:item.id,group});this.interactions.push({id:item.id,name:item.name,position:group.position.clone(),kind:'npc'});}
   for(const cp of this.data.world.landmarks.filter(l=>l.id!=='view')){const x=cp.position[0]+5,z=cp.position[2]+4;const group=this.place('checkpoint',x,z);this.checkpoints.push({...cp,position:new THREE.Vector3(x,this.ground(x,z),z),group,inside:false});this.interactions.push({id:'cp-'+cp.id,name:'Sejenak di '+cp.name,position:group.position.clone(),kind:'checkpoint',checkpoint:cp.id});}
   for(const a of []){const x=a.position[0],z=a.position[2],y=this.ground(x,z);const group=this.place('grapple',x,z,{y:y+3.2});this.anchors.push({...a,position:new THREE.Vector3(x,y+3.8,z),landing:new THREE.Vector3(x,y+.08,z),group});}
   for(const spec of this.data.world.ladders){const bottom=new THREE.Vector3(spec.bottom[0],this.ground(spec.bottom[0],spec.bottom[2]),spec.bottom[2]),top=new THREE.Vector3(spec.top[0],this.ground(spec.top[0],spec.top[2]),spec.top[2]);const sign=this.place('sign',bottom.x,bottom.z);const item={...spec,bottom,top,sign,group:null};this.ladders.push(item);this.interactions.push({id:spec.id,name:spec.name,position:bottom.clone(),kind:'ladder',ladder:item},{id:spec.id+'-top',name:'Turun '+spec.name,position:top.clone(),kind:'ladder',ladder:item,down:true});}
   // Deliberately spaced, restrained set dressing and readable warm landmarks.
   let seed=1123;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<60;i++){const x=(rnd()-.5)*390,z=(rnd()-.5)*390;if(Math.hypot(x,z-35)<29||this.terrain.routes.some(r=>this.terrain.nearest(x,z,r).distance<8))continue;const rock=this.place(i%11===0?'ruin':'rock',x,z);rock.scale.setScalar(.6+rnd()*1.5);rock.rotation.y=rnd()*6.28;}
   for(const [id,r] of Object.entries(this.data.world.routes)){if(id==='direct')continue;for(let i=1;i<r.points.length;i++){const a=r.points[i],x=a[0]+(id==='safe'?3.7:-3.7),z=a[2];if(x<-61&&x>-83)continue;const g=this.place('lantern',x,z);this.lanterns.push(g);}}
   this.data.world.discoveries.forEach(d=>{this.place('ruin',d.position[0]+3,d.position[2]+3);});

   for(const l of this.data.world.ledges||[]){const p=new THREE.Vector3(l.bottom[0],this.ground(l.bottom[0],l.bottom[2]),l.bottom[2]),top=new THREE.Vector3(l.top[0],this.ground(l.top[0],l.top[2]),l.top[2]);this.place('lantern',p.x,p.z);this.interactions.push({id:l.id,name:l.name,position:p,kind:'ledge',top});}
   this.hubLight=new THREE.PointLight(0xf2c46b,.7,16);this.hubLight.position.set(0,3,31);this.scene.add(this.hubLight);this.relayLight=new THREE.PointLight(0xf2c46b,.3,18);this.relayLight.position.set(125,this.ground(125,-85)+2,-85);this.scene.add(this.relayLight);
   this.scanRing=new THREE.Mesh(new THREE.RingGeometry(.92,1,64),new THREE.MeshBasicMaterial({color:0xf2c46b,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));this.scanRing.rotation.x=-Math.PI/2;this.scanRing.visible=false;this.scene.add(this.scanRing);
   this.guide=new THREE.Mesh(new THREE.OctahedronGeometry(.18),new THREE.MeshBasicMaterial({color:0xf2c46b}));this.guide.visible=false;this.scene.add(this.guide);
   JSQuestWorld.build(this);this.scene.updateMatrixWorld(true);this.sync();
  }
  sync(){const s=this.state.value;this.gateBlock.active=s.weather==='berat';this.gate.visible=s.weather==='berat';this.altar.userData.setActive?.(false);JSQuestWorld.sync(this);for(const cp of this.checkpoints)cp.group.userData.setActive?.(cp.id===s.checkpoint);for(const l of this.ladders)if(s.structures.includes(l.id)&&!l.group){const g=JSArt.prop('ladder',{length:l.bottom.distanceTo(l.top)});g.position.copy(l.bottom);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),l.top.clone().sub(l.bottom).normalize());this.scene.add(g);l.group=g;}else if(!s.structures.includes(l.id)&&l.group){this.scene.remove(l.group);l.group=null;} }
  isBlocked(p,r=.4){return this.blockers.some(b=>b.active&&p.y+1.5>b.bottom&&p.y<b.top&&Math.hypot(p.x-b.x,p.z-b.z)<b.radius+r);}
  resolveCollision(p,r){for(const b of this.blockers){if(!b.active||p.y+1.5<=b.bottom||p.y>=b.top)continue;const dx=p.x-b.x,dz=p.z-b.z,d=Math.hypot(dx,dz),min=b.radius+r;if(d<min){const angle=d<.001?0:Math.atan2(dz,dx);p.x=b.x+Math.cos(angle)*min;p.z=b.z+Math.sin(angle)*min;}}}
  isSheltered(p){return Math.hypot(p.x,p.z-35)<22||Math.hypot(p.x+135,p.z-65)<18||Math.hypot(p.x,p.z+125)<12;}
  stormExposed(p){if(this.isSheltered(p))return false;const fast=this.terrain.nearest(p.x,p.z,this.data.world.routes.fast).distance,safe=this.terrain.nearest(p.x,p.z,this.data.world.routes.safe).distance;return (fast<8&&safe>10)||this.terrain.surface(p.x,p.z)!=='rock';}
  nearestInteraction(pos){const objective=this.state.objective(),active=this.interactions.find(i=>i.id===objective.id);if(active&&pos.distanceTo(active.position)<3.7)return {...active,name:objective.name};let nearest=null,d=3.7;for(const item of this.interactions){if(item.kind==='quest'||item.kind==='altar')continue;const dist=pos.distanceTo(item.position);if(dist<d){nearest=item;d=dist;}}return nearest;}
  grappleTarget(){return null;}
  questNavigation(pos){const objective=this.state.objective(),route=this.state.routeId(),points=this.state.routePoints();let path=[];if(route){const nearest=p=>{let at=0,d=Infinity;points.forEach((v,i)=>{const n=Math.hypot(v[0]-p.x,v[2]-p.z);if(n<d){at=i;d=n;}});return at;};const from=nearest(pos),to=nearest({x:objective.position[0],z:objective.position[2]});if(from<=to)path=points.slice(from,to+1);}const id=this.state.step()?.id;if(id==='test_entry')path=[[114,0,-83],[108,0,-90]];if(id==='epilogue')path=[[112,0,-115],[143,0,-115]];path.push(objective.position);return path.map(p=>[p[0],this.ground(p[0],p[2]),p[2]]);}
  animate(t,dt,player,scan){JSQuestWorld.animate(this,t);for(const n of this.npcs){n.group.userData.animate?.(t,0,false);if(n.group.position.distanceTo(player)<10){const dx=player.x-n.group.position.x,dz=player.z-n.group.position.z;n.group.rotation.y=Math.atan2(dx,dz);}}for(const g of this.animations)g.userData.animate?.(t);if(scan>0){this.scanRing.visible=true;this.scanRing.position.set(player.x,this.ground(player.x,player.z)+.15,player.z);this.scanRing.scale.setScalar((1-scan/2.4)*32+.2);this.scanRing.material.opacity=scan/2.4*.65;}else this.scanRing.visible=false;}
 }
 root.JSWorld=World;
})(globalThis);
