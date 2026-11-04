(function(root){
 'use strict';
 const {clamp}=JSCore;
 class Player {
  constructor(world,state,bus){this.world=world;this.state=state;this.bus=bus;this.position=new THREE.Vector3(0,0,46);this.velocity=new THREE.Vector3();this.yaw=Math.PI;this.grounded=true;this.gliding=false;this.glideLeft=4.5;this.airPeak=0;this.flight=null;this.keys={};this.surface='sand';this.lastStep=0;}
  resetInput(){this.keys={};}
  setPosition(p){this.position.fromArray(p);this.position.y=Math.max(this.position.y,this.world.terrain.height(p[0],p[2]));this.velocity.set(0,0,0);this.grounded=true;this.flight=null;this.airPeak=this.position.y;this.resetInput();}
  jump(){if(this.flight)return;if(this.grounded){this.velocity.y=9.8;this.grounded=false;this.airPeak=this.position.y;this.bus.emit('jump');}}
  travelTo(target,type='grapple'){
   if(this.flight)return false;const start=this.position.clone(),end=target.clone();end.y=this.world.terrain.height(end.x,end.z)+.08;const d=start.distanceTo(end);if(d>58)return false;
   let rise=type==='grapple'?7:.5;
   for(let i=1;i<40;i++){const t=i/40,x=THREE.MathUtils.lerp(start.x,end.x,t),z=THREE.MathUtils.lerp(start.z,end.z,t),base=THREE.MathUtils.lerp(start.y,end.y,t),den=4*t*(1-t);rise=Math.max(rise,(this.world.terrain.height(x,z)+.4-base)/den);}
   rise=Math.min(rise,35);
   for(let i=1;i<60;i++){const t=i/60,p=start.clone().lerp(end,t);p.y+=4*rise*t*(1-t);if(this.world.isBlocked(p,.38)||p.y<this.world.terrain.height(p.x,p.z)-.05)return false;}
   this.flight={start,end,rise,t:0,duration:Math.max(.65,d/(type==='grapple'?25:5)),type};this.grounded=false;this.gliding=false;this.velocity.set(0,0,0);this.bus.emit(type);return true;
  }
  update(dt,camYaw,elapsed){
   if(this.flight){const f=this.flight;f.t=Math.min(1,f.t+dt/f.duration);this.position.copy(f.start).lerp(f.end,f.t);this.position.y+=4*f.rise*f.t*(1-f.t);this.yaw=Math.atan2(f.end.x-f.start.x,f.end.z-f.start.z);if(f.t===1){this.flight=null;this.grounded=true;this.airPeak=this.position.y;this.glideLeft=4.5;}return;}
   const steps=Math.max(1,Math.ceil(dt/(1/120)));for(let s=0;s<steps;s++)this.step(dt/steps,camYaw,elapsed);
  }
  step(dt,camYaw,elapsed){
   const p=this.position,weather=this.state.value.weather;this.surface=this.world.terrain.surface(p.x,p.z);
   let f=(this.keys.KeyW||this.keys.ArrowUp?1:0)-(this.keys.KeyS||this.keys.ArrowDown?1:0),r=(this.keys.KeyD||this.keys.ArrowRight?1:0)-(this.keys.KeyA||this.keys.ArrowLeft?1:0);
   let x=-Math.sin(camYaw)*f+Math.cos(camYaw)*r,z=-Math.cos(camYaw)*f-Math.sin(camYaw)*r;const norm=Math.hypot(x,z);if(norm){x/=norm;z/=norm;let angle=Math.atan2(x,z)-this.yaw;angle=Math.atan2(Math.sin(angle),Math.cos(angle));this.yaw+=angle*(1-Math.exp(-14*dt));}
   const sprint=this.keys.ShiftLeft||this.keys.ShiftRight;
   this.gliding=!this.grounded&&!!this.keys.Space&&this.velocity.y<.4&&this.glideLeft>0;
   if(this.gliding){this.glideLeft=Math.max(0,this.glideLeft-dt*(weather==='berat'?1.8:1));this.velocity.y=Math.max(weather==='berat'?-3.7:-1.9,this.velocity.y-4.5*dt);}else this.velocity.y-=22*dt;
   const speed=(sprint?9:5.8)*(this.gliding?1.35:this.world.terrain.speed(this.surface,weather));
   const alpha=1-Math.exp(-15*dt);this.velocity.x=THREE.MathUtils.lerp(this.velocity.x,x*speed,alpha);this.velocity.z=THREE.MathUtils.lerp(this.velocity.z,z*speed,alpha);
   const next=p.clone();next.x+=this.velocity.x*dt;next.z+=this.velocity.z*dt;
   if(weather==='berat'&&!this.world.isSheltered(p)){const wind=(Math.sin(elapsed*.8)*.5+.7);next.x+=wind*dt*(this.gliding?2.8:.32);}
   if(this.grounded){const slope=this.world.terrain.slope(p.x,p.z),rise=this.world.terrain.height(next.x,next.z)-this.world.terrain.height(p.x,p.z);if(slope.magnitude>.9&&rise>.015){next.x=p.x;next.z=p.z;this.velocity.x*=.6;this.velocity.z*=.6;}}
   this.world.resolveCollision(next,.4);p.x=clamp(next.x,-211,211);p.z=clamp(next.z,-211,211);p.y+=this.velocity.y*dt;
   this.airPeak=Math.max(this.airPeak,p.y);const ground=this.world.terrain.height(p.x,p.z);
   if(p.y<=ground+.01&&this.velocity.y<=0){if(!this.grounded&&this.airPeak-ground>6){this.state.damage((this.airPeak-ground-6)*6);this.bus.emit('land',this.airPeak-ground);}p.y=ground;this.velocity.y=0;this.grounded=true;this.gliding=false;this.glideLeft=4.5;this.airPeak=p.y;}else if(this.grounded&&p.y-ground<.35){p.y=ground;this.velocity.y=0;this.airPeak=p.y;}else this.grounded=false;
   if(p.y<-10.5){this.bus.emit('respawn');}
   if(norm&&this.grounded){this.lastStep+=dt;if(this.lastStep>(sprint?.27:.4)){this.lastStep=0;this.bus.emit('step',this.surface);}}
  }
 }
 root.JSPlayer=Player;
})(globalThis);
