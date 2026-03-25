const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/sidePanel-Bf10QYLB.js","assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css","assets/tasks-qIqnclG-.js","assets/helpers-ByTbCZyC.js"])))=>i.map(i=>d[i]);
import{s as m,_ as b}from"./main-CxzuflVX.js";import{getKanbanBoard as g,moveTask as y,createTask as $}from"./tasks-qIqnclG-.js";import{i as v,p as h,f as _,a as w}from"./helpers-ByTbCZyC.js";import{Sortable as T}from"./sortable.esm-CIycMrXb.js";const d=[{key:"backlog",label:"Backlog",color:"#94a3b8"},{key:"todo",label:"To Do",color:"#3b82f6"},{key:"in_progress",label:"In Progress",color:"#f59e0b"},{key:"working_on",label:"Working On",color:"#ef4444"},{key:"review",label:"Review / Testing",color:"#8b5cf6"},{key:"blocked",label:"Blocked",color:"#d97706"},{key:"completed",label:"Done",color:"#10b981"}];async function E(e){return async o=>{o.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let i;try{i=await g(e)}catch{o.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load board</h3></div>';return}const t=d.flatMap(n=>i[n.key]||[]),a=t.filter(n=>v(n.due_date,n.status)).length,s=t.filter(n=>n.active_timer).length;o.innerHTML=`
      <div class="kb-topbar">
        <div class="kb-col-summary">
          ${d.map(n=>`
            <div class="kb-summary-pill">
              <span class="kb-summary-dot" style="background:${n.color}"></span>
              <span>${n.label}</span>
              <strong id="kb-count-${n.key}">${(i[n.key]||[]).length}</strong>
            </div>`).join("")}
        </div>
        <div class="kb-topbar-meta">
          ${a>0?`<span class="kb-meta-badge red">⚠ ${a} overdue</span>`:""}
          ${s>0?`<span class="kb-meta-badge purple">⏱ ${s} timing</span>`:""}
        </div>
      </div>
      <div class="kanban-wrap" id="kanban-board">
        ${d.map(n=>x(n,i[n.key]||[])).join("")}
      </div>`,C(o),A(o,e)}}function x(e,o){return`
    <div class="kb-col" data-col="${e.key}">
      <div class="kb-col-header">
        <span class="kb-col-dot" style="background:${e.color}"></span>
        <span class="kb-col-title">${e.label}</span>
        <span class="kb-col-count" id="kb-count-${e.key}">${o.length}</span>
      </div>
      <div class="kb-col-body sortable-list" id="kb-col-${e.key}" data-status="${e.key}">
        ${o.map(i=>I(i)).join("")}
        <button class="kb-add-btn" data-add-col="${e.key}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add task
        </button>
      </div>
    </div>`}const k={feature:"✨",bug:"🐛",improvement:"🔧",story:"📖",spike:"🔬",chore:"🧹",task:"📋"};function I(e){const o=v(e.due_date,e.status),i=k[e.task_type]||k.task,t=e.status==="working_on";return`
    <div class="kb-card ${o?"overdue":""} ${e.is_blocked?"blocked":""} ${t?"timing":""}" data-task-id="${e.id}">
      ${(e.tags||[]).length>0?`<div class="kb-card-tags">${e.tags.map(a=>`<span style="padding:1px 6px;border-radius:3px;font-size:10.5px;font-weight:700;background:${a.color}20;color:${a.color}">${a.name}</span>`).join("")}</div>`:""}
      <div class="kb-card-title-row">
        <div class="kb-card-title"><span class="kb-type-icon" title="${e.task_type||"task"}">${i}</span> ${e.title}</div>
        ${t?'<span class="kb-timing-indicator" title="Timer running (auto)">⏱</span>':""}
      </div>
      ${e.is_blocked?'<div style="font-size:11px;color:#d97706;font-weight:600;margin-bottom:6px">🔒 Blocked</div>':""}
      <div class="kb-card-footer">
        <div class="kb-card-footer-l">
          ${h(e.priority)}
          ${e.subtasks_count>0?`<span style="font-size:11px;color:#94a3b8">⊞ ${e.subtasks_count}</span>`:""}
          ${t?'<span class="kb-timing-badge">⏱ live</span>':""}
          ${e.is_reviewed?'<span class="kb-reviewed-badge">✓ Reviewed</span>':""}
          ${e.score?`<span class="kb-score-badge">${e.score}pts</span>`:""}
        </div>
        <div class="kb-card-footer-r">
          ${e.due_date?`<span class="kb-card-due ${o?"overdue":""}">📅 ${_(e.due_date)}</span>`:""}
          <div class="kb-card-avs">
            ${(e.assignees||[]).slice(0,3).map(a=>`<img src="${w(a)}" title="${a.name}" alt="${a.name}"/>`).join("")}
          </div>
        </div>
      </div>
    </div>`}function C(e,o){e.querySelectorAll(".sortable-list").forEach(i=>{T.create(i,{group:"kanban",animation:160,ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",handle:".kb-card",filter:".kb-add-btn",onEnd:async t=>{var n;const a=parseInt(t.item.dataset.taskId);if(!a)return;const s=t.to.dataset.status;u(t.from),u(t.to),t.item.classList.add("moving");try{await y(a,{status:s,position:t.newIndex}),m(`→ ${((n=d.find(l=>l.key===s))==null?void 0:n.label)||s}`,"success",1800)}catch{t.from.insertBefore(t.item,t.from.children[t.oldIndex]),u(t.from),u(t.to),m("Failed to move task","error")}t.item.classList.remove("moving")}})})}function u(e){const o=e.closest(".kb-col");if(!o)return;const i=o.dataset.col,t=e.querySelectorAll(".kb-card").length,a=document.getElementById(`kb-count-${i}`);a&&(a.textContent=t);const s=o.querySelector(".kb-col-count");s&&(s.textContent=t)}function A(e,o,i){e.querySelectorAll("[data-add-col]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.addCol;L(e,o,a)})}),e.querySelectorAll(".kb-card").forEach(t=>{t.addEventListener("click",a=>{a.target.closest(".kb-timer-btn")||(a.shiftKey?b(()=>import("./sidePanel-Bf10QYLB.js"),__vite__mapDeps([0,1,2,3,4])).then(s=>s.openSidePanel(t.dataset.taskId)):b(()=>import("./main-CxzuflVX.js").then(s=>s.r),__vite__mapDeps([1,2])).then(s=>s.router.navigate(`/tasks/${t.dataset.taskId}`)))})})}function L(e,o,i,t){b(async()=>{const{openModal:a,closeModal:s}=await import("./modal-jGhccxZ4.js");return{openModal:a,closeModal:s}},[]).then(({openModal:a,closeModal:s})=>{var n;a({title:`Add Task — ${(n=d.find(l=>l.key===i))==null?void 0:n.label}`,body:`
        <form id="quick-add-form">
          <div class="form-group">
            <label class="form-label">Task Title *</label>
            <input name="title" class="form-input" placeholder="What needs to be done?" required autofocus/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type *</label>
              <select name="task_type" class="form-input form-select" required>
                <option value="task">📋 Task</option>
                <option value="feature">✨ Feature</option>
                <option value="bug">🐛 Bug</option>
                <option value="improvement">🔧 Improvement</option>
                <option value="story">📖 Story</option>
                <option value="spike">🔬 Spike</option>
                <option value="chore">🧹 Chore</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select name="priority" class="form-input form-select">
                <option value="low">🟢 Low</option>
                <option value="medium" selected>🔵 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" name="due_date" class="form-input"/>
            </div>
            <div class="form-group">
              <label class="form-label">Score</label>
              <select name="score" class="form-input form-select">
                <option value="">—</option>
                <option value="1">1 pt</option>
                <option value="2">2 pts</option>
                <option value="3">3 pts</option>
                <option value="5">5 pts</option>
                <option value="8">8 pts</option>
                <option value="13">13 pts</option>
                <option value="21">21 pts</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid #e2e8f0">
            <button type="button" class="btn btn-ghost" id="qa-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="qa-submit">Add Task</button>
          </div>
        </form>`}),document.getElementById("qa-cancel").addEventListener("click",s),document.getElementById("quick-add-form").addEventListener("submit",async l=>{l.preventDefault();const c=document.getElementById("qa-submit");c.disabled=!0,c.textContent="Adding…";const r=Object.fromEntries(new FormData(l.target));Object.keys(r).forEach(p=>{r[p]===""&&delete r[p]}),r.status=i;try{await $(o,r),s(),m("Task added","success");const{renderKanban:p}=await b(async()=>{const{renderKanban:f}=await Promise.resolve().then(()=>S);return{renderKanban:f}},void 0);(await p(o))(e)}catch{c.disabled=!1,c.textContent="Add Task"}})})}const S=Object.freeze(Object.defineProperty({__proto__:null,renderKanban:E},Symbol.toStringTag,{value:"Module"}));export{E as renderKanban};
