export function clampNumber(value:unknown,min:number,max:number,fallback=min){const n=typeof value==="number"&&Number.isFinite(value)?value:fallback;return Math.max(min,Math.min(max,n));}
export function validateMovement(previous:{x:number;y:number},next:{x:number;y:number},deltaMs:number,maxSpeed=900){const distance=Math.hypot(next.x-previous.x,next.y-previous.y);return distance<=maxSpeed*(Math.max(1,deltaMs)/1000)+80;}
export function validateCooldown(last:number,now:number,cooldown:number){return now-last>=cooldown;}
