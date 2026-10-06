// Original synthesized Foley. No recordings of real clashes or witnesses.
export class WorldAudio{
  constructor(){this.enabled=false;this.distance=0;this.events=0;}
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){
      this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume();
      if(!this.noise){this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const d=this.noise.getChannelData(0);let seed=713;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741823.5-1;}}
      this.music??=new Audio('./assets/network-pulse.mp3');this.music.loop=true;this.music.play().catch(()=>{});
      this.voice??=new Audio('./assets/anita-escort.mp3');this.voice.volume=.65;
      if(!this.bed){const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;s.loop=true;f.type='lowpass';f.frequency.value=180;g.gain.value=0;s.connect(f).connect(g).connect(c.destination);s.start();this.bed=g;}
    }else{this.music?.pause();this.voice?.pause();this.bed?.gain.setTargetAtTime(0,this.ctx.currentTime,.03);this.ctx?.suspend();}
    return this.enabled;
  }
  tone(freq=240,duration=.12,level=.025){
    if(!this.enabled)return;
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.65),c.currentTime+duration);g.gain.setValueAtTime(level,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration);
  }
  foley(kind='body'){
    if(!this.enabled)return;this.events++;
    const spec={body:[.14,260,.13,88],shield:[.23,2300,.07,410],barrier:[.32,1500,.09,155],miss:[.12,1700,.035,0],foot:[.09,650,.055,70],land:[.20,450,.10,62],wheel:[.28,1000,.045,180],hurt:[.28,800,.06,100]}[kind]||[.12,600,.04,80];
    const c=this.ctx,[duration,frequency,level,thud]=spec,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;f.type=kind==='shield'||kind==='barrier'?'bandpass':'lowpass';f.frequency.value=frequency;f.Q.value=kind==='shield'?3:.8;g.gain.setValueAtTime(.001,c.currentTime);g.gain.linearRampToValueAtTime(level,c.currentTime+.008);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);s.connect(f).connect(g).connect(c.destination);s.start(c.currentTime,.21,duration);
    if(thud)this.tone(thud,duration,level*.4);
  }
  footstep(distance){if(!this.enabled)return;this.distance+=distance;if(this.distance>.8){this.distance%=.8;this.foley('foot');}}
  escort(){if(!this.enabled)return;this.voice.currentTime=0;this.voice.play().catch(()=>{});}
  update(heat,mode){
    const active=this.enabled&&mode==='playing',speaking=this.voice&&!this.voice.paused;
    if(this.music)this.music.volume=active?(speaking?.035:Math.min(.16,.08+heat*.015)):.02;
    if(this.bed)this.bed.gain.setTargetAtTime(active?.012:0,this.ctx.currentTime,.1);
    if(!active&&this.voice&&!this.voice.paused)this.voice.pause();
  }
}
