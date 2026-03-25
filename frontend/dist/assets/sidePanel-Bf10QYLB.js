const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{_ as L,s as c}from"./main-CxzuflVX.js";import{getTask as _,updateTask as d}from"./tasks-qIqnclG-.js";import{p as E,s as T,a as x}from"./helpers-ByTbCZyC.js";const g={feature:"✨",bug:"🐛",improvement:"🔧",story:"📖",spike:"🔬",chore:"🧹",task:"📋"};function B(n){const a=document.getElementById("side-panel-overlay"),t=document.getElementById("side-panel-header"),p=document.getElementById("side-panel-body");if(!a||!t||!p)return;a.classList.remove("hidden"),p.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>',t.innerHTML="",S(n,t,p),a.addEventListener("click",o=>{o.target===a&&v()});const r=o=>{o.key==="Escape"&&(v(),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}function v(){var n;(n=document.getElementById("side-panel-overlay"))==null||n.classList.add("hidden")}async function S(n,a,t,p){var r,o,m,y,b;try{const s=await _(n),w=g[s.task_type]||g.task;a.innerHTML=`
      <div class="sp-header-top">
        <div class="sp-type-badge">${w} ${s.task_type||"task"}</div>
        <div class="sp-header-actions">
          <button class="btn btn-ghost btn-sm sp-open-full" data-task-id="${s.id}" title="Open full detail">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm sp-close" title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="sp-title" contenteditable="true" id="sp-title">${s.title}</div>
      <div class="sp-pills">
        ${E(s.priority)}
        ${T(s.status)}
        ${s.is_reviewed?'<span class="reviewed-badge-lg">✓ Reviewed</span>':""}
        ${s.score?`<span class="score-badge-lg">${s.score}pts</span>`:""}
      </div>`,t.innerHTML=`
      <div class="sp-section">
        <label class="sp-label">Status</label>
        <select class="form-input form-select" id="sp-status">
          ${["backlog","todo","in_progress","working_on","review","completed"].map(e=>`<option value="${e}" ${s.status===e?"selected":""}>${{backlog:"Backlog",todo:"To Do",in_progress:"In Progress",working_on:"🔥 Working On",review:"Review",completed:"Completed"}[e]}</option>`).join("")}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Priority</label>
        <select class="form-input form-select" id="sp-priority">
          ${["low","medium","high","urgent"].map(e=>`<option value="${e}" ${s.priority===e?"selected":""}>${{low:"🟢 Low",medium:"🔵 Medium",high:"🟠 High",urgent:"🔴 Urgent"}[e]}</option>`).join("")}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Task Type</label>
        <select class="form-input form-select" id="sp-type">
          ${["task","feature","bug","improvement","story","spike","chore"].map(e=>`<option value="${e}" ${s.task_type===e?"selected":""}>${g[e]} ${e}</option>`).join("")}
        </select>
      </div>
      <div class="sp-section">
        <label class="sp-label">Due Date</label>
        <input type="date" class="form-input" id="sp-due" value="${s.due_date||""}"/>
      </div>
      <div class="sp-section">
        <label class="sp-label">Assignees</label>
        <div class="sp-assignees">
          ${(s.assignees||[]).map(e=>`
            <div class="sp-assignee">
              <img src="${x(e)}" class="av-xs"/>
              <span>${e.name}</span>
            </div>`).join("")||'<span style="color:#94a3b8;font-size:13px">Unassigned</span>'}
        </div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Description</label>
        <div class="sp-desc" id="sp-desc" contenteditable="true" data-placeholder="Add description…">${s.description||""}</div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Tags</label>
        <div class="sp-tags">
          ${(s.tags||[]).map(e=>`<span class="tag-chip" style="background:${e.color}20;color:${e.color}">${e.name}</span>`).join("")||'<span style="color:#94a3b8;font-size:13px">No tags</span>'}
        </div>
      </div>
      <div class="sp-section">
        <div class="ts-reviewed-row">
          <label class="sp-label" style="margin-bottom:0">Reviewed</label>
          <label class="toggle-switch">
            <input type="checkbox" id="sp-reviewed" ${s.is_reviewed?"checked":""}/>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>
      <div class="sp-section">
        <label class="sp-label">Score</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="sp-score" min="0" max="100" value="${s.score||0}" class="score-slider"/>
          <span id="sp-score-val" class="score-val">${s.score||0}</span>
        </div>
      </div>`,(r=a.querySelector(".sp-close"))==null||r.addEventListener("click",v),(o=a.querySelector(".sp-open-full"))==null||o.addEventListener("click",()=>{v(),L(()=>import("./main-CxzuflVX.js").then(e=>e.r),__vite__mapDeps([0,1])).then(e=>e.router.navigate(`/tasks/${s.id}`))});const i=a.querySelector("#sp-title");i==null||i.addEventListener("blur",async()=>{const e=i.textContent.trim();e&&e!==s.title&&(await d(s.id,{title:e}),c("Title updated","success"))}),i==null||i.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),i.blur())});const u=(e,k)=>{var h;(h=t.querySelector(`#${e}`))==null||h.addEventListener("change",async f=>{await d(s.id,{[k]:f.target.value}),c(`${k.replace("_"," ")} updated`,"success")})};u("sp-status","status"),u("sp-priority","priority"),u("sp-type","task_type"),(m=t.querySelector("#sp-due"))==null||m.addEventListener("change",async e=>{await d(s.id,{due_date:e.target.value||null}),c("Due date updated","success")}),(y=t.querySelector("#sp-desc"))==null||y.addEventListener("blur",async()=>{const e=t.querySelector("#sp-desc").textContent.trim();e!==(s.description||"")&&(await d(s.id,{description:e}),c("Description saved","success"))}),(b=t.querySelector("#sp-reviewed"))==null||b.addEventListener("change",async e=>{await d(s.id,{is_reviewed:e.target.checked}),c(e.target.checked?"Marked reviewed":"Unmarked","success")});const l=t.querySelector("#sp-score"),$=t.querySelector("#sp-score-val");l==null||l.addEventListener("input",()=>{$.textContent=l.value}),l==null||l.addEventListener("change",async()=>{await d(s.id,{score:parseInt(l.value)||null}),c("Score updated","success")})}catch{t.innerHTML='<div style="padding:24px;color:#dc2626">Failed to load task</div>'}}export{v as closeSidePanel,B as openSidePanel};
