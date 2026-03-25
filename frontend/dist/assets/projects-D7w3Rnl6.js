const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css","assets/projects-8oxmbYM-.js","assets/tasks-DNAIkEJT.js","assets/tasks-qIqnclG-.js","assets/modal-jGhccxZ4.js","assets/helpers-ByTbCZyC.js"])))=>i.map(i=>d[i]);
import{_ as g,a as E,s as u}from"./main-CxzuflVX.js";import{getProjects as A,createProject as P,deleteProject as T}from"./projects-8oxmbYM-.js";import{g as M,u as B,c as D,d as S}from"./milestones-CVvBUD-S.js";import{openModal as k,closeModal as f}from"./modal-jGhccxZ4.js";import{f as x,i as L}from"./helpers-ByTbCZyC.js";let b=localStorage.getItem("vilva_proj_view")||"grid";async function $(e){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const t=(await A({per_page:50})).data||[];e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Projects</h1>
        <p>${t.length} project${t.length!==1?"s":""}</p>
      </div>
      <div class="page-header-right">
        <div class="view-toggle">
          <button class="view-toggle-btn ${b==="grid"?"active":""}" data-view="grid" title="Grid View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button class="view-toggle-btn ${b==="list"?"active":""}" data-view="list" title="List View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
        <button class="btn btn-primary" id="new-project-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Project
        </button>
      </div>
    </div>
    ${t.length===0?`
      <div class="project-empty">
        <div class="project-empty-icon">📁</div>
        <h3>No projects yet</h3>
        <p>Create your first project to get started</p>
      </div>`:b==="list"?O(t):`<div class="projects-grid" id="projects-grid">${t.map(s=>R(s)).join("")}</div>`}`,document.getElementById("new-project-btn").addEventListener("click",()=>z(e)),e.querySelectorAll(".view-toggle-btn").forEach(s=>{s.addEventListener("click",()=>{b=s.dataset.view,localStorage.setItem("vilva_proj_view",b),$(e)})}),H(e),V(e)}function H(e){e.querySelectorAll(".project-card, .project-list-row").forEach(a=>{a.addEventListener("click",t=>{t.target.closest(".project-card-actions, .proj-list-actions")||g(()=>import("./main-CxzuflVX.js").then(s=>s.r),__vite__mapDeps([0,1])).then(s=>s.router.navigate(`/projects/${a.dataset.id}`))})}),e.querySelectorAll("[data-kanban-id]").forEach(a=>{a.addEventListener("click",t=>{t.stopPropagation(),g(()=>import("./main-CxzuflVX.js").then(s=>s.r),__vite__mapDeps([0,1])).then(s=>s.router.navigate(`/projects/${a.dataset.kanbanId}/kanban`))})}),e.querySelectorAll("[data-delete-id]").forEach(a=>{a.addEventListener("click",async t=>{t.stopPropagation(),confirm("Delete this project and all its tasks? This cannot be undone.")&&(await T(a.dataset.deleteId),u("Project deleted","success"),$(e))})})}function O(e){const a={active:"#16a34a",archived:"#64748b",on_hold:"#d97706",completed:"#6366f1"};return`
    <div class="project-list-table" id="projects-grid">
      <div class="proj-list-header">
        <span class="proj-list-col name">Name</span>
        <span class="proj-list-col status">Status</span>
        <span class="proj-list-col progress">Progress</span>
        <span class="proj-list-col members">Members</span>
        <span class="proj-list-col due">Due Date</span>
        <span class="proj-list-col actions">Actions</span>
      </div>
      ${e.map(t=>{const s=a[t.status]||"#64748b",o=t.members||[];return`
          <div class="project-list-row" data-id="${t.id}">
            <span class="proj-list-col name">
              <span class="proj-list-color" style="background:${t.color}"></span>
              <span class="proj-list-name">${t.name}</span>
              ${t.ai_enabled?'<span class="proj-ai-badge" title="AI enabled">✨</span>':""}
            </span>
            <span class="proj-list-col status">
              <span class="proj-list-status-badge" style="color:${s};background:${s}15">
                <svg width="6" height="6" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${s}"/></svg>
                ${t.status||"active"}
              </span>
            </span>
            <span class="proj-list-col progress">
              <div class="pbar-wrap" style="width:80px"><div class="pbar" style="width:${t.progress||0}%"></div></div>
              <span style="font-size:12px;font-weight:700;color:${t.color};margin-left:6px">${t.progress||0}%</span>
            </span>
            <span class="proj-list-col members">
              <div style="display:flex">
                ${o.slice(0,4).map(i=>`<img src="${i.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(i.name)}&size=24&background=6366f1&color=fff`}" title="${i.name}" style="width:24px;height:24px;border-radius:50%;margin-left:-4px;border:1.5px solid #fff;object-fit:cover"/>`).join("")}
                ${o.length>4?`<span style="font-size:11px;color:#64748b;margin-left:4px">+${o.length-4}</span>`:""}
              </div>
            </span>
            <span class="proj-list-col due">
              ${t.due_date?x(t.due_date):'<span style="color:#94a3b8">—</span>'}
            </span>
            <span class="proj-list-col actions proj-list-actions">
              <button class="btn-icon" data-kanban-id="${t.id}" title="Kanban">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
              </button>
              <button class="btn-icon" data-delete-id="${t.id}" title="Delete" style="color:#dc2626">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              </button>
            </span>
          </div>`}).join("")}
    </div>`}function V(e){const a=e.querySelector("#projects-grid");a&&g(async()=>{const{default:t}=await import("./sortable.esm-CIycMrXb.js");return{default:t}},[]).then(({default:t})=>{t.create(a,{animation:160,ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",handle:b==="list"?".project-list-row":".project-card",filter:".project-card-actions, .proj-list-actions",onEnd:()=>{u("Project order saved","success",1500)}})}).catch(()=>{})}function R(e){const a=e.members||[],t=a.slice(0,4),s=a.length-4,i={active:"#16a34a",archived:"#64748b",on_hold:"#d97706"}[e.status]||"#64748b";return`
    <div class="project-card" data-id="${e.id}">
      <div class="project-card-bar" style="background:${e.color}"></div>
      <div class="project-card-body">
        <div class="project-card-top">
          <div class="project-card-name">
        ${e.name}
        ${e.ai_enabled?'<span class="proj-ai-badge" title="AI enabled">✨ AI</span>':""}
      </div>
          <div class="project-card-actions">
            <button class="btn-icon" data-kanban-id="${e.id}" title="Kanban Board">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
            </button>
            <button class="btn-icon" data-delete-id="${e.id}" title="Delete" style="color:#dc2626">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path stroke-linecap="round" d="M10 11v6m4-6v6"/></svg>
            </button>
          </div>
        </div>
        <div class="project-card-desc">${e.description||"No description provided."}</div>
        <div class="pbar-wrap"><div class="pbar" style="width:${e.progress||0}%"></div></div>
        <div class="project-card-meta">
          <span class="project-card-status" style="color:${i}">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${i}"/></svg>
            ${e.status||"active"}
          </span>
          <span class="project-card-tasks">${e.tasks_count||0} tasks</span>
          ${e.due_date?`<span class="project-card-due">Due ${new Date(e.due_date).toLocaleDateString("en",{month:"short",day:"numeric"})}</span>`:""}
          <span style="margin-left:auto;font-size:12.5px;font-weight:700;color:${e.color}">${e.progress||0}%</span>
        </div>
        ${a.length>0?`
        <div class="project-card-members">
          ${t.map(n=>`<img src="${n.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(n.name)}&size=26&background=6366f1&color=fff`}" title="${n.name}" alt="${n.name}"/>`).join("")}
          ${s>0?`<div class="member-more">+${s}</div>`:""}
        </div>`:""}
      </div>
    </div>`}async function z(e){let a=[];try{const t=await E.get("/users/search?per_page=50");a=Array.isArray(t)?t:t.data||[]}catch{}k({title:"Create New Project",subtitle:"Set up a workspace for your team to collaborate",body:`
      <form id="new-proj-form">
        <div class="form-group">
          <label class="form-label">Project Name *</label>
          <input name="name" class="form-input" placeholder="e.g. Website Redesign" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="What is this project about?"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="#6366f1" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
          <div class="form-group">
            <label class="form-label">Visibility</label>
            <select name="visibility" class="form-input form-select">
              <option value="team">Team</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input"/>
          </div>
        </div>
        <div class="form-sep">AI Task Generation</div>
        <div class="ai-toggle-row">
          <label class="ai-toggle-label">
            <input type="checkbox" name="ai_enabled" id="proj-ai-toggle" value="1" class="ai-toggle-cb"/>
            <span class="ai-toggle-track"><span class="ai-toggle-thumb"></span></span>
            <span>Enable AI task generation for this project</span>
          </label>
        </div>
        <div id="ai-context-wrap" class="hidden">
          <div class="form-group" style="margin-top:10px">
            <label class="form-label">AI Context <span class="form-hint" style="display:inline">— helps AI understand your project</span></label>
            <textarea name="ai_context" class="form-input form-textarea" rows="3"
              placeholder="e.g. This is a React/Node.js e-commerce app. We use Jira for tracking and deploy to AWS. Focus on frontend tasks."></textarea>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Members</label>
          <div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);padding:6px" id="proj-member-picker">
            ${a.map(t=>`
              <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;cursor:pointer;font-size:13px;border-radius:4px" class="proj-member-opt">
                <input type="checkbox" value="${t.id}" name="member_ids"/>
                <img src="${t.avatar_url}" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
                ${t.name}
              </label>`).join("")}
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="proj-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="proj-submit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Project
          </button>
        </div>
      </form>`}),document.getElementById("proj-cancel").addEventListener("click",f),document.getElementById("proj-ai-toggle").addEventListener("change",function(){document.getElementById("ai-context-wrap").classList.toggle("hidden",!this.checked)}),document.getElementById("new-proj-form").addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("proj-submit");s.disabled=!0,s.textContent="Creating…";try{const o=Object.fromEntries(new FormData(t.target));Object.keys(o).forEach(i=>{o[i]===""&&delete o[i]}),o.ai_enabled=!!o.ai_enabled,o.member_ids=[...document.querySelectorAll("#proj-member-picker input:checked")].map(i=>parseInt(i.value)),await P(o),f(),u("Project created!","success"),$(e)}catch{s.disabled=!1,s.textContent="Create Project"}})}async function Q(e){return async a=>{var d,r;a.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const{getProject:t,getProjectStats:s}=await g(async()=>{const{getProject:c,getProjectStats:l}=await import("./projects-8oxmbYM-.js");return{getProject:c,getProjectStats:l}},__vite__mapDeps([2,0,1])),[o,i]=await Promise.all([t(e),s(e)]);a.innerHTML=`
      <div class="project-detail-header">
        <div class="proj-header-top">
          <div class="proj-header-left">
            <div class="proj-header-label">
              <span class="proj-color-badge" style="background:${o.color}"></span>
              <span style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${o.status||"active"}</span>
            </div>
            <div class="proj-header-name">${o.name}</div>
            <div class="proj-header-desc">${o.description||""}</div>
          </div>
          <div class="proj-header-right">
            ${o.ai_enabled?`
            <button class="btn btn-ai btn-sm" id="ai-gen-tasks-btn" title="Generate tasks with AI">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              ✨ AI Tasks
            </button>`:""}
            <button class="btn btn-secondary btn-sm" id="open-kanban">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
              Kanban
            </button>
            <button class="btn btn-primary btn-sm" id="new-task-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
              New Task
            </button>
          </div>
        </div>
        <div class="proj-stats-strip">
          <div class="proj-stat"><span class="proj-stat-val">${i.total??0}</span><span class="proj-stat-lbl">Total</span></div>
          <div class="proj-stat brand"><span class="proj-stat-val">${i.in_progress??0}</span><span class="proj-stat-lbl">In Progress</span></div>
          <div class="proj-stat green"><span class="proj-stat-val">${i.completed??0}</span><span class="proj-stat-lbl">Completed</span></div>
          <div class="proj-stat red"><span class="proj-stat-val">${i.overdue??0}</span><span class="proj-stat-lbl">Overdue</span></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="proj-tabs">
        <button class="proj-tab active" data-tab="tasks">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Tasks
        </button>
        <button class="proj-tab" data-tab="milestones">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
          Milestones
        </button>
        <button class="proj-tab" data-tab="progress">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Progress
        </button>
      </div>

      <div id="proj-tab-content"></div>`,document.getElementById("open-kanban").addEventListener("click",()=>{g(()=>import("./main-CxzuflVX.js").then(c=>c.r),__vite__mapDeps([0,1])).then(c=>c.router.navigate(`/projects/${e}/kanban`))});const n=document.getElementById("proj-tab-content"),{renderTaskList:p,openNewTaskModal:m}=await g(async()=>{const{renderTaskList:c,openNewTaskModal:l}=await import("./tasks-DNAIkEJT.js");return{renderTaskList:c,openNewTaskModal:l}},__vite__mapDeps([3,0,1,4,5,6]));async function v(c){a.querySelectorAll(".proj-tab").forEach(l=>l.classList.toggle("active",l.dataset.tab===c)),c==="tasks"?(document.getElementById("new-task-btn").classList.remove("hidden"),await p(n,e)):c==="milestones"?(document.getElementById("new-task-btn").classList.add("hidden"),await w(n,e)):c==="progress"&&(document.getElementById("new-task-btn").classList.add("hidden"),await G(n,o,i,e))}a.querySelectorAll(".proj-tab").forEach(c=>{c.addEventListener("click",()=>v(c.dataset.tab))}),(d=document.getElementById("new-task-btn"))==null||d.addEventListener("click",()=>{m(n,parseInt(e))}),(r=document.getElementById("ai-gen-tasks-btn"))==null||r.addEventListener("click",()=>{W(o,parseInt(e),n)}),await v("tasks")}}async function w(e,a){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const s=(await M(a).catch(()=>({data:[]}))).data||[];e.innerHTML=`
    <div class="proj-ms-header">
      <span style="font-size:13px;color:var(--text3)">${s.length} milestone${s.length!==1?"s":""}</span>
      <button class="btn btn-primary btn-sm" id="add-milestone-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        Add Milestone
      </button>
    </div>
    <div class="proj-ms-list" id="proj-ms-list">
      ${s.length===0?'<div class="full-empty" style="padding:40px"><div class="full-empty-icon">🏁</div><h3>No milestones yet</h3><p>Add milestones to mark key checkpoints in your project</p></div>':s.map(o=>q(o,a)).join("")}
    </div>`,document.getElementById("add-milestone-btn").addEventListener("click",()=>{C(e,a,null)}),N(e,a,s)}function q(e,a){const t=e.status==="completed",s=!t&&e.due_date&&L(e.due_date,"active");return`
    <div class="proj-ms-row ${t?"ms-done":""} ${s?"ms-overdue":""}">
      <div class="proj-ms-row-left">
        <button class="ms-circle-btn ms-toggle-btn"
          data-project-id="${a}" data-milestone-id="${e.id}" data-current-status="${e.status}"
          title="${t?"Reopen":"Mark complete"}"
          style="border-color:${e.color||"#6366f1"}">
          ${t?`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${e.color||"#6366f1"}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`:`<span style="width:7px;height:7px;border-radius:50%;background:${e.color||"#6366f1"};display:inline-block"></span>`}
        </button>
        <div>
          <div class="proj-ms-title ${t?"done":""}">${e.title}</div>
          ${e.description?`<div class="proj-ms-desc">${e.description}</div>`:""}
        </div>
      </div>
      <div class="proj-ms-row-right">
        ${e.due_date?`<span class="ms-due ${s?"overdue":t?"done":""}">📅 ${x(e.due_date)}</span>`:""}
        <span class="ms-status-pill ${e.status==="completed"?"completed":s?"overdue":"open"}">
          ${e.status==="completed"?"Completed":s?"Overdue":"Open"}
        </span>
        <button class="btn-icon ms-edit-btn" data-milestone-id="${e.id}" title="Edit">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button class="btn-icon ms-delete-btn" data-project-id="${a}" data-milestone-id="${e.id}" title="Delete" style="color:#dc2626">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`}function N(e,a,t){e.querySelectorAll(".ms-toggle-btn").forEach(s=>{s.addEventListener("click",async()=>{const o=s.dataset.currentStatus==="open"?"completed":"open";try{await B(a,s.dataset.milestoneId,{status:o}),u(o==="completed"?"✅ Milestone completed!":"Milestone reopened","success"),w(e,a)}catch{u("Update failed","error")}})}),e.querySelectorAll(".ms-edit-btn").forEach(s=>{const o=t.find(i=>i.id==s.dataset.milestoneId);o&&s.addEventListener("click",()=>C(e,a,o))}),e.querySelectorAll(".ms-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(confirm("Delete this milestone?"))try{await S(a,s.dataset.milestoneId),u("Milestone deleted","success"),w(e,a)}catch{u("Delete failed","error")}})})}function C(e,a,t){const s=!!t;k({title:s?"Edit Milestone":"Add Milestone",body:`
      <form id="ms-form">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" value="${s?t.title:""}" placeholder="Milestone name" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Optional notes…">${s&&t.description||""}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${s&&t.due_date?t.due_date.slice(0,10):""}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="${s&&t.color||"#6366f1"}" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ms-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="ms-submit">${s?"Save":"Add Milestone"}</button>
        </div>
      </form>`}),document.getElementById("ms-cancel").addEventListener("click",f),document.getElementById("ms-form").addEventListener("submit",async o=>{o.preventDefault();const i=document.getElementById("ms-submit");i.disabled=!0,i.textContent="Saving…";const n=Object.fromEntries(new FormData(o.target));Object.keys(n).forEach(p=>{n[p]===""&&delete n[p]});try{s?(await B(a,t.id,n),u("Milestone updated","success")):(await D(a,n),u("Milestone added","success")),f(),w(e,a)}catch{i.disabled=!1,i.textContent=s?"Save":"Add Milestone"}})}async function G(e,a,t,s){const o=await M(s).then(l=>l.data||[]).catch(()=>[]),i=t.total||0,n=t.completed||0,p=t.in_progress||0,m=t.overdue||0;i-n-p-(t.backlog||0)-(t.review||0);const v=a.progress||0,d=o.filter(l=>l.status==="completed").length,r=o.length,c=[{label:"Completed",val:n,color:"#16a34a",bg:"#dcfce7"},{label:"In Progress",val:p,color:"#f59e0b",bg:"#fef3c7"},{label:"Review",val:t.review||0,color:"#7c3aed",bg:"#ede9fe"},{label:"To Do",val:t.todo||0,color:"#3b82f6",bg:"#dbeafe"},{label:"Backlog",val:t.backlog||0,color:"#94a3b8",bg:"#f1f5f9"}].filter(l=>l.val>0);e.innerHTML=`
    <div class="progress-tab-grid">

      <!-- Overall Progress Ring -->
      <div class="card progress-ring-card">
        <div class="card-header"><h3>Overall Progress</h3></div>
        <div class="card-body" style="display:flex;align-items:center;gap:28px">
          <div class="progress-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="#e2e8f0" stroke-width="10"/>
              <circle cx="55" cy="55" r="46" fill="none"
                stroke="${v>=100?"#16a34a":"#6366f1"}" stroke-width="10"
                stroke-dasharray="${2*Math.PI*46}"
                stroke-dashoffset="${2*Math.PI*46*(1-v/100)}"
                stroke-linecap="round"
                transform="rotate(-90 55 55)"/>
              <text x="55" y="59" text-anchor="middle" font-size="22" font-weight="800"
                fill="${v>=100?"#16a34a":"#0f172a"}" font-family="Inter,sans-serif">${v}%</text>
            </svg>
          </div>
          <div class="progress-ring-stats">
            <div class="progress-ring-stat"><span style="color:#16a34a;font-weight:700">${n}</span> Completed</div>
            <div class="progress-ring-stat"><span style="color:#f59e0b;font-weight:700">${p}</span> In Progress</div>
            <div class="progress-ring-stat"><span style="color:#dc2626;font-weight:700">${m}</span> Overdue</div>
            <div class="progress-ring-stat"><span style="color:#64748b;font-weight:700">${i}</span> Total tasks</div>
          </div>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="card">
        <div class="card-header"><h3>Task Breakdown</h3></div>
        <div class="card-body">
          ${c.map(l=>`
            <div class="breakdown-row">
              <div class="breakdown-label">
                <span class="breakdown-dot" style="background:${l.color}"></span>
                ${l.label}
              </div>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" style="width:${i>0?Math.round(l.val/i*100):0}%;background:${l.color}"></div>
              </div>
              <div class="breakdown-nums">
                <span style="font-weight:700">${l.val}</span>
                <span style="color:var(--muted);font-size:11px">${i>0?Math.round(l.val/i*100):0}%</span>
              </div>
            </div>`).join("")}
          ${c.length===0?'<div class="widget-empty">No tasks yet</div>':""}
        </div>
      </div>

    </div>

    <!-- Milestone Roadmap -->
    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <h3>Milestone Roadmap</h3>
        ${r>0?`<span style="font-size:12px;color:var(--text3)">${d}/${r} completed</span>`:""}
      </div>
      <div class="card-body">
        ${r===0?'<div class="widget-empty"><div class="widget-empty-icon">🏁</div>No milestones — add them in the Milestones tab</div>':`
          <div class="roadmap-track">
            <div class="roadmap-progress-line" style="width:${r>0?Math.round(d/r*100):0}%"></div>
            ${o.sort((l,y)=>l.due_date?y.due_date?new Date(l.due_date)-new Date(y.due_date):-1:1).map((l,y)=>{const I=r>1?Math.round(y/(r-1)*100):50,h=l.status==="completed",j=!h&&l.due_date&&L(l.due_date,"active"),_=h?"#16a34a":j?"#dc2626":l.color||"#6366f1";return`
                  <div class="roadmap-node" style="left:${I}%">
                    <div class="roadmap-dot ${h?"done":""}" style="border-color:${_};background:${h?_:"#fff"}">
                      ${h?'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>':""}
                    </div>
                    <div class="roadmap-label">
                      <div class="roadmap-title ${h?"done":""}">${l.title}</div>
                      ${l.due_date?`<div class="roadmap-date ${j?"overdue":""}">${x(l.due_date)}</div>`:""}
                    </div>
                  </div>`}).join("")}
          </div>`}
      </div>
    </div>`}async function W(e,a,t){const s={low:"#64748b",medium:"#2563eb",high:"#d97706",urgent:"#dc2626"};k({title:"✨ AI Generate Tasks",subtitle:`for ${e.name}`,wide:!0,body:`
      <div class="ai-gen-body">
        <p class="ai-modal-hint">Describe what needs to be done in this project. AI will break it down into tasks.</p>

        ${e.ai_context?`
        <div class="ai-context-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/></svg>
          Project context: <em>${e.ai_context.slice(0,120)}${e.ai_context.length>120?"…":""}</em>
        </div>`:""}

        <div class="ai-examples" style="margin-bottom:8px">
          <span class="ai-example-chip" data-ex="Build a user authentication system with login, register, and password reset">User auth system</span>
          <span class="ai-example-chip" data-ex="Create a dashboard with charts, filters, and export to CSV functionality">Analytics dashboard</span>
          <span class="ai-example-chip" data-ex="Set up CI/CD pipeline, Docker containers, and automated testing">DevOps setup</span>
          <span class="ai-example-chip" data-ex="Design and implement REST API endpoints for the mobile app">API for mobile</span>
        </div>

        <div class="form-group">
          <label class="form-label">What needs to be done? *</label>
          <textarea id="ai-gen-prompt" class="form-input form-textarea" rows="3"
            placeholder="e.g. Build a complete checkout flow with cart, payment integration (Stripe), order confirmation emails, and admin order management…"
            style="resize:vertical"></textarea>
        </div>

        <div id="ai-gen-result" class="ai-gen-result hidden">
          <div class="ai-gen-result-header">
            <div class="ai-gen-result-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span id="ai-gen-count">0</span> tasks generated — select which to create
            </div>
            <button type="button" class="btn btn-ghost btn-sm" id="ai-gen-select-all">Select all</button>
          </div>
          <div id="ai-gen-tasks-list" class="ai-gen-tasks-list"></div>
        </div>

        <div id="ai-gen-error" class="ai-error hidden"></div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ai-gen-cancel">Cancel</button>
          <button type="button" class="btn btn-secondary" id="ai-gen-parse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Generate Tasks
          </button>
          <button type="button" class="btn btn-primary hidden" id="ai-gen-create-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Selected
          </button>
        </div>
      </div>`});let o=[];document.querySelectorAll(".ai-example-chip").forEach(i=>{i.addEventListener("click",()=>{document.getElementById("ai-gen-prompt").value=i.dataset.ex})}),document.getElementById("ai-gen-cancel").addEventListener("click",f),document.getElementById("ai-gen-select-all").addEventListener("click",()=>{const i=document.querySelectorAll(".ai-task-check"),n=[...i].every(p=>p.checked);i.forEach(p=>p.checked=!n),document.getElementById("ai-gen-select-all").textContent=n?"Select all":"Deselect all"}),document.getElementById("ai-gen-parse-btn").addEventListener("click",async()=>{const i=document.getElementById("ai-gen-prompt").value.trim();if(!i)return;const n=document.getElementById("ai-gen-parse-btn"),p=document.getElementById("ai-gen-error"),m=document.getElementById("ai-gen-result");n.disabled=!0,n.innerHTML='<span class="spinner-sm"></span> Generating…',p.classList.add("hidden"),m.classList.add("hidden");try{o=(await E.post(`/projects/${a}/ai/generate-tasks`,{description:i})).tasks||[],document.getElementById("ai-gen-count").textContent=o.length,document.getElementById("ai-gen-tasks-list").innerHTML=o.map((d,r)=>{var c;return`
        <div class="ai-gen-task-row" data-index="${r}">
          <label class="ai-gen-task-check-wrap">
            <input type="checkbox" class="ai-task-check" data-index="${r}" checked/>
            <span class="ai-gen-task-check-box"></span>
          </label>
          <div class="ai-gen-task-info">
            <div class="ai-gen-task-title" contenteditable="true" data-index="${r}">${d.title}</div>
            ${d.description?`<div class="ai-gen-task-desc">${d.description}</div>`:""}
            <div class="ai-gen-task-meta">
              <span class="ai-gen-priority" style="color:${s[d.priority]||"#64748b"}">● ${d.priority}</span>
              ${d.due_date?`<span class="ai-gen-meta-item">📅 ${d.due_date}</span>`:""}
              ${d.estimated_minutes?`<span class="ai-gen-meta-item">⏱ ${Math.round(d.estimated_minutes/60*10)/10}h</span>`:""}
              <span class="ai-gen-meta-item" style="color:#94a3b8">${(c=d.status)==null?void 0:c.replace("_"," ")}</span>
            </div>
          </div>
        </div>`}).join(""),m.classList.remove("hidden"),document.getElementById("ai-gen-create-btn").classList.remove("hidden"),document.querySelectorAll(".ai-gen-task-title[contenteditable]").forEach(d=>{d.addEventListener("blur",()=>{const r=parseInt(d.dataset.index);o[r]&&(o[r].title=d.textContent.trim())})})}catch(v){p.textContent=(v==null?void 0:v.message)||"AI failed. Make sure ANTHROPIC_API_KEY is set in .env",p.classList.remove("hidden")}finally{n.disabled=!1,n.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> Generate Tasks'}}),document.getElementById("ai-gen-create-btn").addEventListener("click",async()=>{const i=document.getElementById("ai-gen-create-btn"),n=[...document.querySelectorAll(".ai-task-check:checked")].map(r=>o[parseInt(r.dataset.index)]).filter(Boolean);if(n.length===0){u("Select at least one task","error");return}i.disabled=!0,i.textContent=`Creating ${n.length} task${n.length>1?"s":""}…`;const{createTask:p}=await g(async()=>{const{createTask:r}=await import("./tasks-qIqnclG-.js");return{createTask:r}},__vite__mapDeps([4,0,1]));let m=0,v=0;for(const r of n)try{await p(a,{title:r.title,description:r.description||null,priority:r.priority||"medium",status:r.status||"todo",due_date:r.due_date||null,estimated_minutes:r.estimated_minutes||null}),m++}catch{v++}f(),m>0&&u(`✅ ${m} task${m>1?"s":""} created!`,"success"),v>0&&u(`${v} task${v>1?"s":""} failed`,"error");const{renderTaskList:d}=await g(async()=>{const{renderTaskList:r}=await import("./tasks-DNAIkEJT.js");return{renderTaskList:r}},__vite__mapDeps([3,0,1,4,5,6]));await d(t,a)})}export{Q as renderProjectDetail,$ as renderProjects};
