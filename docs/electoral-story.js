// All people and records here are invented. No real voter database is used.
export const DEMANDS=[
  {id:'accountability',title:'Leadership accountability',copy:'Press for Gyanesh Kumar’s resignation/removal through lawful constitutional processes; demand independent scrutiny. A new name alone does not repair the system.'},
  {id:'sir',title:'End the contested SIR process',copy:'The movement’s demand: scrap/suspend SIR and replace exclusion risks with transparent, rights-protecting roll maintenance. This is a demand, not an enacted policy.'},
  {id:'inclusion',title:'Every eligible voter included',copy:'Compare pre- and post-SIR rolls across affected states, assist eligible omitted and first-time voters, and protect a timely route for pending appeals. Review past harm; do not pretend past elections can be replayed by a game.'}
];
const c=(name,before,after,account,answer,why)=>({name,before,after,account,answer,why});
export const CASES={
  jantar:{
    organiser:c('Case D-01 / consented adult','Listed in the earlier roll at the same residence.','Missing; marked “absent”.','The resident has returned and asks for a status check. The game dossier confirms current eligibility.','include','Refer the eligible omitted resident for inclusion assistance; an “absent” mark alone is not a final finding.'),
    aid:c('Case D-02 / duplicate entry','Two entries for one person.','One valid entry remains; the duplicate was removed.','The resident confirms they can find the remaining entry and asks not to create another.','duplicate','Keep one valid registration. Inclusion does not mean duplicating an already registered person.'),
    protest:c('Case D-03 / disputed deletion','Previously listed.','Not listed; an appeal is awaiting a decision.','The resident requests help tracking the appeal. The file does not establish a final outcome.','appeal','Track and support the unresolved appeal; do not invent a restored registration or erase the pending case.')
  },
  jamia:{
    organiser:c('Case B-01 / Meena, fictional adult','Listed before SIR.','Missing from the revised roll.','Meena consents to assistance. Current residence and eligibility are confirmed within the fictional dossier.','include','Help the eligible omitted voter seek inclusion. Preserve consent and follow-up; submission is not official approval.'),
    aid:c('Case B-02 / first-time adult voter','Not listed; was below voting age.','Still not listed after reaching the qualifying age.','The invented file confirms eligibility and a request for registration support.','include','Assist a first-time eligible voter. A pre-SIR entry is not a prerequisite for every eligible new applicant.'),
    protest:c('Case B-03 / one voter, two entries','Duplicate entries recorded.','One active valid entry remains.','The person wants to retain that valid registration, not appear twice.','duplicate','Record that a valid entry remains; do not turn a legitimate duplicate correction into a false omission claim.')
  },
  shaheen:{
    organiser:c('Case W-01 / pending appellant','Listed before SIR.','Deleted; inclusion appeal remains pending.','The person consents to case tracking. No final determination is available in this fictional file.','appeal','Support the appeal and keep its status visible. Neither automatic exclusion nor an invented success is justified by an unresolved file.'),
    aid:c('Case W-02 / omitted eligible resident','Earlier registration at current address.','Missing after revision.','The fictional evidence confirms present eligibility and consent to inclusion assistance.','include','Refer for inclusion and follow-up. A camp submission does not by itself restore voting rights.'),
    protest:c('Case W-03 / young eligible resident','Too young for the earlier roll.','No current registration.','The fictional dossier confirms qualifying age, eligibility and consent.','include','Include support for eligible first-time voters as well as people omitted from an older roll.')
  }
};
export const CHOICES=[
  {id:'include',label:'Assist inclusion',detail:'Eligible, missing or first-time; refer and follow up.'},
  {id:'duplicate',label:'One valid entry remains',detail:'Do not create a duplicate registration.'},
  {id:'appeal',label:'Support pending appeal',detail:'Track unresolved status; no invented outcome.'}
];
export const movement={
  reviewed:[],outcomes:[],attempts:0,active:null,mandate:[],
  reset(){this.reviewed=[];this.outcomes=[];this.attempts=0;this.active=null;this.mandate=[];},
  missing(district){return Object.keys(CASES[district]).find(id=>!this.reviewed.includes(id));},
  answer(district,choice){
    const entry=CASES[district][this.active];this.attempts++;
    if(choice!==entry.answer)return {correct:false,copy:'Compare both rolls and the resident’s account. A missing name is not always the same situation: eligibility, duplicates and unresolved appeals need different responses.'};
    const id=this.active;this.reviewed.push(id);this.outcomes.push({case:entry.name,response:choice,status:'referred / fictional; not an official registration'});this.active=null;
    return {correct:true,id,copy:entry.why};
  }
};
