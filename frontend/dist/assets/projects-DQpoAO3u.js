const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxoKqBs3.js","assets/main-CFH2NeAm.css","assets/projects-Dq97Au35.js","assets/tasks-BzzKEY6M.js","assets/tasks-45bDwRW6.js","assets/modal-jGhccxZ4.js","assets/helpers-BEw8rxzH.js"])))=>i.map(i=>d[i]);
import{_ as d,s as l}from"./main-CxoKqBs3.js";import{getProjects as m,deleteProject as h,createProject as b}from"./projects-Dq97Au35.js";import{openModal as g,closeModal as c}from"./modal-jGhccxZ4.js";async function p(t){t.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const s=(await m({per_page:50})).data||[];t.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Projects</h1>
        <p>${s.length} project${s.length!==1?"s":""}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" id="new-project-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Project
        </button>
      </div>
    </div>
    <div class="projects-grid" id="projects-grid">
      ${s.length===0?`
        <div class="project-empty">
          <div class="project-empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>`:s.map(e=>j(e)).join("")}
    </div>`,document.getElementById("new-project-btn").addEventListener("click",()=>f(t)),t.querySelectorAll(".project-card").forEach(e=>{e.addEventListener("click",r=>{r.target.closest(".project-card-actions")||d(()=>import("./main-CxoKqBs3.js").then(a=>a.r),__vite__mapDeps([0,1])).then(a=>a.router.navigate(`/projects/${e.dataset.id}`))})}),t.querySelectorAll("[data-kanban-id]").forEach(e=>{e.addEventListener("click",r=>{r.stopPropagation(),d(()=>import("./main-CxoKqBs3.js").then(a=>a.r),__vite__mapDeps([0,1])).then(a=>a.router.navigate(`/projects/${e.dataset.kanbanId}/kanban`))})}),t.querySelectorAll("[data-delete-id]").forEach(e=>{e.addEventListener("click",async r=>{r.stopPropagation(),confirm("Delete this project and all its tasks? This cannot be undone.")&&(await h(e.dataset.deleteId),l("Project deleted","success"),p(t))})})}function j(t){const o=t.members||[],s=o.slice(0,4),e=o.length-4,a={active:"#16a34a",archived:"#64748b",on_hold:"#d97706"}[t.status]||"#64748b";return`
    <div class="project-card" data-id="${t.id}">
      <div class="project-card-bar" style="background:${t.color}"></div>
      <div class="project-card-body">
        <div class="project-card-top">
          <div class="project-card-name">${t.name}</div>
          <div class="project-card-actions">
            <button class="btn-icon" data-kanban-id="${t.id}" title="Kanban Board">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
            </button>
            <button class="btn-icon" data-delete-id="${t.id}" title="Delete" style="color:#dc2626">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path stroke-linecap="round" d="M10 11v6m4-6v6"/></svg>
            </button>
          </div>
        </div>
        <div class="project-card-desc">${t.description||"No description provided."}</div>
        <div class="pbar-wrap"><div class="pbar" style="width:${t.progress||0}%"></div></div>
        <div class="project-card-meta">
          <span class="project-card-status" style="color:${a}">
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="${a}"/></svg>
            ${t.status||"active"}
          </span>
          <span class="project-card-tasks">${t.tasks_count||0} tasks</span>
          ${t.due_date?`<span class="project-card-due">Due ${new Date(t.due_date).toLocaleDateString("en",{month:"short",day:"numeric"})}</span>`:""}
          <span style="margin-left:auto;font-size:12.5px;font-weight:700;color:${t.color}">${t.progress||0}%</span>
        </div>
        ${o.length>0?`
        <div class="project-card-members">
          ${s.map(n=>`<img src="${n.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(n.name)}&size=26&background=6366f1&color=fff`}" title="${n.name}" alt="${n.name}"/>`).join("")}
          ${e>0?`<div class="member-more">+${e}</div>`:""}
        </div>`:""}
      </div>
    </div>`}function f(t){g({title:"Create New Project",subtitle:"Set up a workspace for your team to collaborate",body:`
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
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="proj-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="proj-submit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Project
          </button>
        </div>
      </form>`}),document.getElementById("proj-cancel").addEventListener("click",c),document.getElementById("new-proj-form").addEventListener("submit",async o=>{o.preventDefault();const s=document.getElementById("proj-submit");s.disabled=!0,s.textContent="Creating…";try{await b(Object.fromEntries(new FormData(o.target))),c(),l("Project created!","success"),p(t)}catch{s.disabled=!1,s.textContent="Create Project"}})}async function x(t){return async o=>{o.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const{getProject:s,getProjectStats:e}=await d(async()=>{const{getProject:i,getProjectStats:u}=await import("./projects-Dq97Au35.js");return{getProject:i,getProjectStats:u}},__vite__mapDeps([2,0,1])),[r,a]=await Promise.all([s(t),e(t)]);o.innerHTML=`
      <div class="project-detail-header">
        <div class="proj-header-top">
          <div class="proj-header-left">
            <div class="proj-header-label">
              <span class="proj-color-badge" style="background:${r.color}"></span>
              <span style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${r.status||"active"}</span>
            </div>
            <div class="proj-header-name">${r.name}</div>
            <div class="proj-header-desc">${r.description||""}</div>
          </div>
          <div class="proj-header-right">
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
          <div class="proj-stat"><span class="proj-stat-val">${a.total??0}</span><span class="proj-stat-lbl">Total</span></div>
          <div class="proj-stat brand"><span class="proj-stat-val">${a.in_progress??0}</span><span class="proj-stat-lbl">In Progress</span></div>
          <div class="proj-stat green"><span class="proj-stat-val">${a.completed??0}</span><span class="proj-stat-lbl">Completed</span></div>
          <div class="proj-stat red"><span class="proj-stat-val">${a.overdue??0}</span><span class="proj-stat-lbl">Overdue</span></div>
        </div>
      </div>
      <div id="task-list-container"></div>`,document.getElementById("open-kanban").addEventListener("click",()=>{d(()=>import("./main-CxoKqBs3.js").then(i=>i.r),__vite__mapDeps([0,1])).then(i=>i.router.navigate(`/projects/${t}/kanban`))});const n=document.getElementById("task-list-container"),{renderTaskList:v}=await d(async()=>{const{renderTaskList:i}=await import("./tasks-BzzKEY6M.js");return{renderTaskList:i}},__vite__mapDeps([3,0,1,4,5,6]));await v(n,t)}}export{x as renderProjectDetail,p as renderProjects};
