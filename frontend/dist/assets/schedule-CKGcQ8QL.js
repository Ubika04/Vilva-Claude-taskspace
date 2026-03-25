import{a as f,_ as I,s as b}from"./main-CxzuflVX.js";async function B(t,s,n,i="work"){try{return await f.post("/schedule/validate",{task_id:t,scheduled_start:s,scheduled_end:n,schedule_type:i})}catch{return{has_conflicts:!1,time_conflicts:[],dependency_conflicts:[]}}}function L(t,s){var o,c;const n=document.getElementById(t);if(!n)return;if(!s.has_conflicts){n.innerHTML=`<div class="schedule-ok">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      No scheduling conflicts
    </div>`;return}let i="";(o=s.time_conflicts)!=null&&o.length&&(i+=`<div class="schedule-conflict-group">
      <div class="schedule-conflict-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        Time Conflicts
      </div>
      ${s.time_conflicts.map(d=>`
        <div class="schedule-conflict-item">
          <span class="schedule-conflict-task">${d.task_title}</span>
          <span class="schedule-conflict-type">${d.type}</span>
          <span class="schedule-conflict-time">${g(d.start)} — ${g(d.end)}</span>
        </div>
      `).join("")}
    </div>`),(c=s.dependency_conflicts)!=null&&c.length&&(i+=`<div class="schedule-conflict-group">
      <div class="schedule-conflict-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        Dependency Conflicts
      </div>
      ${s.dependency_conflicts.map(d=>`
        <div class="schedule-conflict-item">
          <span class="schedule-conflict-msg">${d.message}</span>
        </div>
      `).join("")}
    </div>`),n.innerHTML=`<div class="schedule-conflicts">${i}</div>`}async function M(t,s,n){const{openModal:i,closeModal:o}=await I(async()=>{const{openModal:e,closeModal:a}=await import("./modal-jGhccxZ4.js");return{openModal:e,closeModal:a}},[]),c=["review","meeting"].includes(n)?n:"work";i({title:`Schedule: ${s}`,body:`
      <div class="schedule-modal">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start</label>
            <input type="datetime-local" id="sched-start" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">End</label>
            <input type="datetime-local" id="sched-end" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select id="sched-type" class="form-select">
            <option value="work" ${c==="work"?"selected":""}>Work</option>
            <option value="review" ${c==="review"?"selected":""}>Review</option>
            <option value="meeting" ${c==="meeting"?"selected":""}>Meeting</option>
          </select>
        </div>
        <div id="sched-conflicts"></div>
        <div id="sched-slots" class="schedule-slots-section"></div>
        <div class="schedule-modal-actions">
          <button class="btn btn-ghost" id="sched-cancel">Cancel</button>
          <button class="btn btn-secondary" id="sched-find-slots">Find Available Slots</button>
          <button class="btn btn-primary" id="sched-save" disabled>Schedule</button>
        </div>
      </div>`});const d=new Date;d.setMinutes(0,0,0),d.setHours(d.getHours()+1);const v=p(d),y=new Date(d.getTime()+60*6e4),m=p(y);document.getElementById("sched-start").value=v,document.getElementById("sched-end").value=m;const l=async()=>{const e=document.getElementById("sched-start").value,a=document.getElementById("sched-end").value,u=document.getElementById("sched-type").value;if(!e||!a)return;const r=await B(t,e,a,u);L("sched-conflicts",r),document.getElementById("sched-save").disabled=r.has_conflicts};document.getElementById("sched-start").addEventListener("change",l),document.getElementById("sched-end").addEventListener("change",l),document.getElementById("sched-type").addEventListener("change",l),l(),document.getElementById("sched-find-slots").addEventListener("click",async()=>{var E;const e=document.getElementById("sched-start").value;if(!e)return;const a=e.split("T")[0],u=document.getElementById("sched-end").value,r=u&&e?Math.round((new Date(u)-new Date(e))/6e4):60;try{const k=await f.get("/schedule/available-slots",{date:a,duration_minutes:Math.max(15,r)}),w=document.getElementById("sched-slots");if(!((E=k.slots)!=null&&E.length)){w.innerHTML='<p class="text-muted">No available slots found for this day</p>';return}w.innerHTML=`
        <h4>Available Slots</h4>
        <div class="schedule-slot-list">
          ${k.slots.map(h=>`
            <button class="schedule-slot-btn" data-start="${h.start}" data-end="${h.end}">
              ${g(h.start)} — ${g(h.end)}
            </button>
          `).join("")}
        </div>`,w.querySelectorAll(".schedule-slot-btn").forEach(h=>{h.addEventListener("click",()=>{document.getElementById("sched-start").value=p(new Date(h.dataset.start)),document.getElementById("sched-end").value=p(new Date(h.dataset.end)),l()})})}catch{b("Failed to find slots","error")}}),document.getElementById("sched-save").addEventListener("click",async()=>{const e=document.getElementById("sched-start").value,a=document.getElementById("sched-end").value,u=document.getElementById("sched-type").value;try{await f.post(`/tasks/${t}/schedule`,{scheduled_start:e,scheduled_end:a,schedule_type:u}),b("Task scheduled successfully","success"),o()}catch(r){r.message&&b(r.message,"error")}}),document.getElementById("sched-cancel").addEventListener("click",o)}async function T(t){const s=new Date,n=new Date(s);n.setDate(n.getDate()+7),t.innerHTML=`
    <div class="schedule-page">
      <div class="schedule-header">
        <h2>My Schedule</h2>
        <div class="schedule-date-range">
          <input type="date" id="sched-range-from" class="form-input form-input-sm" value="${s.toISOString().split("T")[0]}" />
          <span>to</span>
          <input type="date" id="sched-range-to" class="form-input form-input-sm" value="${n.toISOString().split("T")[0]}" />
          <button class="btn btn-sm btn-secondary" id="sched-load">Load</button>
        </div>
      </div>
      <div id="schedule-timeline" class="schedule-timeline">
        <div class="spinner-wrap"><div class="spinner"></div></div>
      </div>
    </div>`,document.getElementById("sched-load").addEventListener("click",_),await _()}async function _(){var i,o;const t=(i=document.getElementById("sched-range-from"))==null?void 0:i.value,s=(o=document.getElementById("sched-range-to"))==null?void 0:o.value,n=document.getElementById("schedule-timeline");if(!(!t||!s))try{const c=await f.get("/schedule/my",{from:t,to:s});if(!(c!=null&&c.length)){n.innerHTML='<div class="schedule-empty"><p>No scheduled tasks in this period</p></div>';return}const d={};c.forEach(m=>{const l=new Date(m.scheduled_start).toLocaleDateString();d[l]||(d[l]=[]),d[l].push(m)});const v={work:"#6366f1",review:"#8b5cf6",meeting:"#f59e0b"},y={urgent:"#dc2626",high:"#d97706",medium:"#2563eb",low:"#64748b"};n.innerHTML=Object.entries(d).map(([m,l])=>`
      <div class="schedule-day">
        <div class="schedule-day-header">${m}</div>
        <div class="schedule-day-items">
          ${l.map(e=>{var a,u,r;return`
            <div class="schedule-item" style="border-left:3px solid ${v[e.schedule_type]||"#6366f1"}">
              <div class="schedule-item-time">
                ${$(e.scheduled_start)} — ${$(e.scheduled_end)}
                <span class="schedule-duration">${e.duration_minutes}m</span>
              </div>
              <div class="schedule-item-info">
                <span class="schedule-item-title">${((a=e.task)==null?void 0:a.title)||"Unknown"}</span>
                <span class="schedule-item-type" style="background:${v[e.schedule_type]||"#6366f1"}">${e.schedule_type}</span>
                ${(u=e.task)!=null&&u.priority?`<span class="schedule-item-prio" style="color:${y[e.task.priority]}">${e.task.priority}</span>`:""}
                ${(r=e.task)!=null&&r.status?`<span class="schedule-item-status">${e.task.status.replace("_"," ")}</span>`:""}
              </div>
            </div>
          `}).join("")}
        </div>
      </div>
    `).join("")}catch{n.innerHTML='<p class="text-muted">Failed to load schedule</p>'}}function g(t){return new Date(t).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function $(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function p(t){const s=t.getTimezoneOffset();return new Date(t.getTime()-s*6e4).toISOString().slice(0,16)}export{B as checkScheduleConflict,M as openScheduleModal,L as renderConflictWarnings,T as renderMySchedule};
