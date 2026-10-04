export const STORY={
  organiser:{
    name:'Mira / student organiser',
    title:'You came looking for a friend.',
    copy:'“Aman? Kabir said you would come. He is helping farther up the road. Before you go: Dev has people waiting at first aid and no water left. Three bottles are still at the gathering. Bring them here. You do not have to know every slogan to be useful.”',
    action:'I will bring the water'
  },
  aid:{
    name:'Dev / volunteer',
    title:'Small things keep a gathering alive.',
    copy:'“Thank you. People can stay now. Sana is trying to preserve an account of the crackdown, but her recorder was dropped near the street. Find it, then talk to her. She decides what happens to her testimony, not us.”',
    action:'Deliver the supplies'
  },
  witness:{
    name:'Sana / journalist',
    title:'An account is not a trophy.',
    copy:'“I recorded what people told me about the crackdown. Some want to speak publicly; others fear being identified. You can carry my statement to the assembly, or lodge a protected account at the record desk. Both challenge the attempt to erase us. Neither guarantees what happens tomorrow.”',
    action:'Carry the statement to the assembly',
    alternate:'Protect identities at the record desk'
  },
  barrier:{
    name:'Mira / at the police line',
    title:'We move together.',
    copy:'The fictional state crackdown is closing the street. Mira calls the gathering together. Join the crowd’s rhythm; the barricade falls in an authored resistance set piece. Beyond it, Kabir is separated from the others. Staying to help him will take time while officers close in.',
    action:'Stand with the gathering'
  },
  companion:{
    name:'Kabir / your friend',
    title:'You came back.',
    copy:'“I thought you had already gone. I can move, but not alone through this.” Help Kabir rejoin you. He will follow toward the handoff; this is simplified companion behaviour, not a realistic custody rescue.',
    action:'Stay together'
  },
  assembly:{
    name:'Iqbal / at the assembly',
    title:'Someone has to hear this.',
    copy:'The gathering opens a space for Sana’s authorised statement. Your route ends here, but the demand for accountability does not. The crowd has something more durable than a rumour: an account whose author chose to share it.',
    action:'Share Sana’s statement'
  },
  record:{
    name:'Leela / public-record desk',
    title:'Keep the names protected.',
    copy:'The desk accepts Sana’s account on her terms and keeps identifying details out of the public copy. People can demand accountability without turning vulnerable witnesses into spectacle.',
    action:'Lodge the protected account'
  },
  protest:{
    name:'The gathering',
    title:'A voice beside yours.',
    copy:'One student worries about being recognised. Another says silence will not keep them safe. They disagree, but hold the gathering together. Add your voice; solidarity here means people staying with people, not a score for damage.',
    action:'Join the gathering'
  }
};
export const ITEMS=[
  {id:'water0',x:-16,z:15,title:'Water at the benches',type:'water',prompt:'Take the water bottle'},
  {id:'water1',x:-25,z:18,title:'Water by the courtyard',type:'water',prompt:'Take the water bottle'},
  {id:'water2',x:-15,z:-3,title:'Water near the record desk',type:'water',prompt:'Take the water bottle'},
  {id:'recorder',x:3,z:-14,title:'Sana’s dropped recorder',type:'recorder',prompt:'Recover Sana’s recorder'},
  {id:'note0',x:-9,z:13,title:'Kabir’s unfinished message',type:'note',prompt:'Read the unfinished message',copy:'“Reached the gathering. Phone almost empty. Tell Aman I will wait by the police line.” You recognise the habit of ending a message before saying whether he is all right.'},
  {id:'note1',x:-20,z:-9,title:'The empty chair',type:'note',prompt:'Read the card on the chair',copy:'The chair was kept for someone who did not return after the fictional crackdown. Nobody agrees on what happened next. The gathering refuses to let absence become erasure.'}
];
