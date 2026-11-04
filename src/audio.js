/* Original synthesized soundscape. No remote audio or copyrighted recordings. */
(function(root){
 class Audio {
  constructor(){this.ctx=null;this.master=null;this.volume=.6;this.weather='hangat';this.lastMusic=-50;this.currentVoice=null;}
  stopVoice(){if(this.currentVoice){try{this.currentVoice.pause();}catch(_){}this.currentVoice=null;}}
  playVoice(key){this.stopVoice();if(!key)return;const a=new window.Audio(`assets/audio/vo/${key}.wav`);a.volume=Math.min(1,this.volume*1.2);a.play().then(()=>{this.currentVoice=a;}).catch(()=>{this.playChime();});}
  init(){if(this.ctx){this.ctx.resume().catch(()=>{});return;}try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.5;this.master.connect(this.ctx.destination);const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*3,this.ctx.sampleRate),out=buffer.getChannelData(0);let last=0;for(let i=0;i<out.length;i++){last=(last+.02*(Math.random()*2-1))/1.02;out[i]=last*3;}const noise=this.ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;this.filter=this.ctx.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=360;this.wind=this.ctx.createGain();this.wind.gain.value=.08;noise.connect(this.filter);this.filter.connect(this.wind);this.wind.connect(this.master);noise.start();this.setWeather(this.weather);}catch(e){console.warn('Audio tidak tersedia',e);this.ctx=null;}}
  setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v*.5,this.ctx.currentTime,.15);if(this.currentVoice)this.currentVoice.volume=Math.min(1,v*1.2);}
  pause(on){if(this.master)this.master.gain.setTargetAtTime(this.volume*(on?.12:.5),this.ctx.currentTime,.25);}
  setWeather(w){this.weather=w;if(!this.ctx)return;this.wind.gain.setTargetAtTime(w==='berat'?.32:w==='kabut'?.035:.08,this.ctx.currentTime,1.2);this.filter.frequency.setTargetAtTime(w==='berat'?1000:w==='kabut'?210:380,this.ctx.currentTime,1.2);}
  note(freq,duration=.3,gain=.1,delay=0,type='sine'){if(!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=freq;o.type=type;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(gain,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.03);o.onended=()=>{o.disconnect();g.disconnect();};}
  playChime(){this.note(587.33,.22,.025);}
  playJump(){this.note(210,.15,.075,0,'triangle');}
  playFootstep(surface){this.note(surface==='rock'?130:78,.075,.06,0,'triangle');}
  playGrapple(){[392,587,784].forEach((f,i)=>this.note(f,.22,.07,i*.05,'triangle'));}
  playCheckpoint(){[293.66,369.99,440].forEach((f,i)=>this.note(f,.7,.06,i*.16));}
  playSimpulEcho(){[146.83,220,293.66,329.63,440,392,293.66].forEach((f,i)=>this.note(f,2,.1,i*.55));}
  playShell(){[440,493.88,587.33,493.88,440,369.99,392].forEach((f,i)=>this.note(f,.85,.08,i*.45));}
  update(time,sheltered){if(time-this.lastMusic>65&&sheltered&&this.weather!=='berat'){this.lastMusic=time;[293.66,440,392,329.63,293.66].forEach((f,i)=>this.note(f,2.5,.025,i*1.1));}}
 }
 root.JSAudio=Audio;
})(globalThis);
