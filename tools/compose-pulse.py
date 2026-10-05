"""Original instrumental tension loop; no sampled copyrighted recordings."""
import math,wave,struct,os,random
random.seed(4)
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rate=22050;duration=32
with wave.open(os.path.join(root,'art','network-pulse.wav'),'wb') as out:
    out.setparams((1,2,rate,0,'NONE','not compressed'))
    for i in range(rate*duration):
        t=i/rate;beat=t%.5;bar=int(t/4)%4
        freqs=[(110,130.813,164.814),(87.307,110,130.813),(98,123.471,146.832),(82.407,98,123.471)][bar]
        pad=sum(math.sin(2*math.pi*f*t) for f in freqs)*.055
        kick=math.sin(2*math.pi*(52*beat+20*(1-math.exp(-beat*20))))*math.exp(-beat*25)*.17
        hat=(random.random()*2-1)*math.exp(-(t%.25)*85)*.025
        edge=min(1,t/1,(duration-t)/1)
        out.writeframesraw(struct.pack('<h',int(max(-1,min(1,(pad+kick+hat)*edge))*32767)))
