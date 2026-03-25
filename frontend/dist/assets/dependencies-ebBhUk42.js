const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{a as p,_ as y,s as n}from"./main-CxzuflVX.js";import{i as h,p as $,s as k,a as b,f}from"./helpers-ByTbCZyC.js";let r=null;async function u(e){r=e,e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let i;try{i=await p.get("/dependencies/all")}catch{e.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load dependencies</h3></div>';return}const s=i.blocked||[],a=i.blocking||[],d=s.filter(t=>t.is_blocked),l=s.filter(t=>!t.is_blocked);e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dependencies</h1>
        <p>${s.length+a.length} dependency relationships across all projects</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary btn-sm" id="add-dep-page-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Dependency
        </button>
      </div>
    </div>

    <div class="dep-page-stats">
      <div class="stat-card">
        <div class="stat-icon stat-icon-red">🔒</div>
        <div class="stat-info"><span class="stat-val">${d.length}</span><span class="stat-label">Currently Blocked</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">✅</div>
        <div class="stat-info"><span class="stat-val">${l.length}</span><span class="stat-label">Resolved</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">➡</div>
        <div class="stat-info"><span class="stat-val">${a.length}</span><span class="stat-label">Blocking Others</span></div>
      </div>
    </div>

    ${d.length>0?`
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#dc2626">🔒 Currently Blocked (${d.length})</span></div>
      <div class="dep-task-list">${d.map(t=>g(t,"blocked")).join("")}</div>
    </div>`:""}

    ${l.length>0?`
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#10b981">✅ Resolved Dependencies (${l.length})</span></div>
      <div class="dep-task-list">${l.map(t=>g(t,"blocked")).join("")}</div>
    </div>`:""}

    ${a.length>0?`
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title" style="color:#6366f1">➡ Blocking Other Tasks (${a.length})</span></div>
      <div class="dep-task-list">${a.map(t=>g(t,"blocking")).join("")}</div>
    </div>`:""}

    ${s.length===0&&a.length===0?`
    <div class="full-empty">
      <div class="full-empty-icon">✅</div>
      <h3>No dependencies found</h3>
      <p>Click "Add Dependency" to create one.</p>
    </div>`:""}`,x(e)}function x(e){var i;(i=document.getElementById("add-dep-page-btn"))==null||i.addEventListener("click",()=>_()),e.querySelectorAll(".dep-go-task").forEach(s=>{s.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),s.dataset.taskId&&y(()=>import("./main-CxzuflVX.js").then(d=>d.r),__vite__mapDeps([0,1])).then(d=>d.router.navigate(`/tasks/${s.dataset.taskId}`))})}),e.querySelectorAll(".dep-rm-btn").forEach(s=>{s.addEventListener("click",async a=>{if(a.stopPropagation(),!!confirm("Remove this dependency?"))try{await p.delete(`/tasks/${s.dataset.taskId}/dependencies/${s.dataset.depId}`),n("Dependency removed","success"),u(r)}catch{n("Failed to remove","error")}})}),e.querySelectorAll(".dep-complete-btn").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();const d=s.dataset.taskId,l=s.dataset.taskTitle||"this task";if(confirm(`Mark "${l}" as completed?`))try{await p.post(`/tasks/${d}/move`,{status:"completed"}),n(`"${l}" completed`,"success"),u(r)}catch{n("Failed to complete task","error")}})}),e.querySelectorAll(".dep-complete-blocker-btn").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();const d=s.dataset.blockerId,l=s.dataset.blockerTitle||"this task";if(confirm(`Mark blocker "${l}" as completed? This will unblock dependent tasks.`))try{await p.post(`/tasks/${d}/move`,{status:"completed"}),n(`"${l}" completed — dependencies resolved`,"success"),u(r)}catch{n("Failed to complete blocker","error")}})}),e.querySelectorAll(".dep-close-btn").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();const d=s.dataset.taskId,l=s.dataset.depId;if(s.dataset.taskTitle,!!confirm("Close dependency and remove the link between tasks?"))try{await p.delete(`/tasks/${d}/dependencies/${l}`),n("Dependency closed","success"),u(r)}catch{n("Failed to close dependency","error")}})}),e.querySelectorAll(".dep-toggle-btn").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation();const d=s.closest(".dep-task-card").querySelector(".dep-detail-panel");if(d){const l=d.classList.toggle("hidden");s.textContent=l?"Details ▾":"Details ▴"}})})}function g(e,i){const s=h(e.due_date,e.status),a=i==="blocked"?e.blocked_by||[]:e.blocking||[],d=e.assignees||[],l=e.status==="completed";return`
    <div class="dep-task-card ${l?"dep-completed":""}">
      <div class="dep-task-header">
        <div class="dep-task-info">
          ${$(e.priority)}
          <a href="#/tasks/${e.id}" class="dep-task-title dep-go-task" data-task-id="${e.id}">${e.title}</a>
          ${k(e.status)}
          ${e.is_blocked?'<span class="dep-blocked-tag">🔒 BLOCKED</span>':""}
        </div>
        <div class="dep-task-meta">
          ${d.length>0?`<div class="dep-avatars">${d.slice(0,4).map(t=>`<img src="${t.avatar_url||b(t)}" title="${t.name}" class="dep-av"/>`).join("")}${d.length>4?`<span class="dep-av-more">+${d.length-4}</span>`:""}</div>`:""}
          ${e.project?`<span class="task-proj-chip" style="background:${e.project.color}18;color:${e.project.color}">${e.project.name}</span>`:""}
          ${e.due_date?`<span class="task-due ${s?"overdue":""}" style="font-size:12px">📅 ${f(e.due_date)}</span>`:""}
          ${l?"":`<button class="btn btn-sm dep-complete-btn" style="background:#10b981;color:#fff;font-size:11px;padding:3px 10px" data-task-id="${e.id}" data-task-title="${m(e.title)}" title="Mark as completed">✓ Complete</button>`}
          <button class="btn btn-ghost btn-sm dep-toggle-btn" style="font-size:11px;padding:2px 8px">Details ▾</button>
        </div>
      </div>

      <div class="dep-chain">
        ${a.map(t=>{const v=t.assignees||[],c=t.status==="completed";return`
          <div class="dep-chain-item ${i==="blocked"?c?"resolved":"blocked":"blocking"}">
            <span class="dep-chain-icon">${i==="blocked"?c?"✅":"🔒":"➡"}</span>
            <a href="#/tasks/${t.id}" class="dep-chain-title dep-go-task" data-task-id="${t.id}">${t.title}</a>
            ${k(t.status)}
            ${v.length>0?`<div class="dep-chain-avs">${v.slice(0,3).map(o=>`<img src="${o.avatar_url||b(o)}" title="${o.name}" class="dep-av-sm"/>`).join("")}</div>`:""}
            <div class="dep-chain-actions">
              ${i==="blocked"&&!c?`<button class="dep-complete-blocker-btn" data-blocker-id="${t.id}" data-blocker-title="${m(t.title)}" title="Complete blocker to unblock">✓</button>`:""}
              <button class="dep-close-btn" data-task-id="${e.id}" data-dep-id="${t.id}" data-task-title="${m(e.title)}" title="Close & remove dependency">✕</button>
            </div>
          </div>`}).join("")}
      </div>

      <div class="dep-detail-panel hidden">
        <div class="dep-detail-grid">
          <div class="dep-detail-col">
            <div class="dep-detail-label">Task Details</div>
            <div style="font-size:14px;font-weight:600;margin:4px 0">${e.title}</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0">
              ${k(e.status)} ${$(e.priority)}
              ${e.task_type?`<span style="font-size:11px;background:var(--s3);padding:2px 8px;border-radius:10px">${e.task_type}</span>`:""}
            </div>
            ${e.due_date?`<div style="margin-top:4px;font-size:12.5px" class="${s?"overdue":""}">📅 Due: ${f(e.due_date)}</div>`:""}
            ${e.project?`<div style="margin-top:4px"><span class="task-proj-chip" style="background:${e.project.color}18;color:${e.project.color}">${e.project.name}</span></div>`:""}
          </div>
          <div class="dep-detail-col">
            <div class="dep-detail-label">Assigned Members</div>
            ${d.length>0?d.map(t=>`
              <div class="dep-detail-member">
                <img src="${t.avatar_url||b(t)}" class="dep-av"/>
                <span>${t.name}</span>
              </div>`).join(""):'<span style="color:var(--muted);font-size:12px">No one assigned</span>'}

            <div class="dep-detail-label" style="margin-top:12px">${i==="blocked"?"Blocked By":"Blocking"} (${a.length})</div>
            ${a.map(t=>{const v=t.assignees||[],c=t.status==="completed";return`
              <div class="dep-detail-dep-row">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span>${i==="blocked"?c?"✅":"🔒":"➡"}</span>
                  <a href="#/tasks/${t.id}" class="dep-go-task" data-task-id="${t.id}" style="font-weight:600;color:var(--brand);cursor:pointer">${t.title}</a>
                  ${k(t.status)}
                  ${i==="blocked"&&!c?`<button class="btn btn-sm dep-complete-blocker-btn" style="background:#10b981;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px" data-blocker-id="${t.id}" data-blocker-title="${m(t.title)}">✓ Complete Blocker</button>`:""}
                  <button class="btn btn-sm dep-close-btn" style="font-size:10px;padding:2px 8px;color:var(--red)" data-task-id="${e.id}" data-dep-id="${t.id}" data-task-title="${m(e.title)}">✕ Remove Link</button>
                </div>
                ${v.length>0?`<div style="display:flex;gap:4px;margin-top:4px;align-items:center">${v.map(o=>`<img src="${o.avatar_url||b(o)}" title="${o.name}" class="dep-av-sm" style="margin-left:0"/><span style="font-size:11px">${o.name}</span>`).join("")}</div>`:'<div style="font-size:11px;color:var(--muted);margin-top:2px">Unassigned</div>'}
              </div>`}).join("")}
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          ${l?"":`<button class="btn btn-sm dep-complete-btn" style="background:#10b981;color:#fff" data-task-id="${e.id}" data-task-title="${m(e.title)}">✓ Complete Task</button>`}
          <button class="btn btn-primary btn-sm dep-go-task" data-task-id="${e.id}">Open Task →</button>
        </div>
      </div>
    </div>`}function m(e){return(e||"").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function _(){let e=[];try{e=(await p.get("/projects")).data||[]}catch{}const i=document.createElement("div");i.className="modal-overlay",i.innerHTML=`
    <div class="modal" style="max-width:520px">
      <div class="modal-header bg-white">
        <h3 class='text-white'>Add Dependency</h3>
        <button class="modal-close" id="adm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Project <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-project">
            <option value="">— Select project —</option>
            ${e.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Task (will be blocked) <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-task" disabled>
            <option value="">— Select project first —</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Depends on (blocker) <span style="color:var(--red)">*</span></label>
          <select class="form-input form-select" id="adm-depends" disabled>
            <option value="">— Select project first —</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Dependency Type</label>
          <select class="form-input form-select" id="adm-type">
            <option value="finish_to_start">Finish to Start (most common)</option>
            <option value="start_to_start">Start to Start</option>
            <option value="finish_to_finish">Finish to Finish</option>
            <option value="start_to_finish">Start to Finish</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="adm-cancel">Cancel</button>
        <button class="btn btn-primary" id="adm-submit">Add Dependency</button>
      </div>
    </div>`,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("active"));const s=()=>{i.remove()};i.addEventListener("click",a=>{a.target===i&&s()}),document.getElementById("adm-close").addEventListener("click",s),document.getElementById("adm-cancel").addEventListener("click",s),document.getElementById("adm-project").addEventListener("change",async function(){const a=this.value,d=document.getElementById("adm-task"),l=document.getElementById("adm-depends");if(!a){d.disabled=l.disabled=!0,d.innerHTML=l.innerHTML='<option value="">— Select project first —</option>';return}d.innerHTML=l.innerHTML='<option value="">Loading…</option>';try{const c=((await p.get(`/projects/${a}/tasks`,{per_page:200})).data||[]).map(o=>`<option value="${o.id}">${o.title} (${o.status})</option>`).join("");d.innerHTML=`<option value="">— Select task —</option>${c}`,l.innerHTML=`<option value="">— Select blocker —</option>${c}`,d.disabled=l.disabled=!1}catch{d.innerHTML=l.innerHTML='<option value="">Failed to load</option>'}}),document.getElementById("adm-submit").addEventListener("click",async()=>{const a=document.getElementById("adm-task").value,d=document.getElementById("adm-depends").value,l=document.getElementById("adm-type").value;if(!a||!d){n("Select both tasks","error");return}if(a===d){n("A task cannot depend on itself","error");return}try{await p.post(`/tasks/${a}/dependencies`,{depends_on_id:parseInt(d),type:l}),n("Dependency added","success"),s(),r&&u(r)}catch(t){n((t==null?void 0:t.message)||"Failed to add","error")}})}export{u as renderDependencies};
