export class WorldAudio{
  constructor(){this.enabled=false;this.distance=0;}
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){
      this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume();
    }return this.enabled;
  }
  tone(freq=240,duration=.12,level=.025){
    if(!this.enabled)return;
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();
    o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(level,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);
    o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration);
  }
  footstep(distance){
    if(!this.enabled)return;this.distance+=distance;
    if(this.distance<.85)return;this.distance=0;
    const c=this.ctx,b=c.createBuffer(1,Math.floor(c.sampleRate*.07),c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=b;f.type='lowpass';f.frequency.value=600;g.gain.value=.055;
    src.connect(f).connect(g).connect(c.destination);src.start();
  }
}
