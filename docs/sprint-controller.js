/**
 * Reusable sprint rules used by DISSENT. No engine, DOM or network dependency.
 * Pass a stamina-bearing state, seconds, requested sprint and actual movement.
 * Hold Shift on desktop; on touch, request sprint beyond 85% stick magnitude.
 */
export const SPRINT_RULES=Object.freeze({
  walkSpeed:2.6,runSpeed:4.6,drainPerSecond:18,recoverPerSecond:13,
  stopAt:5,resumeAt:30,touchThreshold:.85
});
export function sprintAllowed(state){
  if(state.stamina<=SPRINT_RULES.stopAt)state.exhausted=true;
  if(state.stamina>=SPRINT_RULES.resumeAt)state.exhausted=false;
  return !state.exhausted;
}
export function wantsSprint({shift=false,toggle=false,touch=false,stickMagnitude=0}={}){
  return shift||toggle||(touch&&stickMagnitude>SPRINT_RULES.touchThreshold);
}
export function updateStamina(state,dt,sprinting,moving){
  if(!Number.isFinite(dt)||dt<0)return state.stamina;
  state.stamina=Math.max(0,Math.min(100,state.stamina+
    (sprinting&&moving?-SPRINT_RULES.drainPerSecond:SPRINT_RULES.recoverPerSecond)*dt));
  sprintAllowed(state);return state.stamina;
}
