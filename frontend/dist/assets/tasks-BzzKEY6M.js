const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxoKqBs3.js","assets/main-CFH2NeAm.css","assets/tasks-45bDwRW6.js","assets/projects-Dq97Au35.js"])))=>i.map(i=>d[i]);
import{_ as g,s as v,h as S}from"./main-CxoKqBs3.js";import{createTask as A,getMyTasks as P,getTask as I,getProjectTasks as H,deleteTask as R,updateTask as f}from"./tasks-45bDwRW6.js";import{openModal as z,closeModal as T}from"./modal-jGhccxZ4.js";import{p as $,s as _,i as x,f as E,a as b,r as O}from"./helpers-BEw8rxzH.js";async function q(e){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const t=(await P()).data||[];e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Tasks</h1>
        <p>${t.length} task${t.length!==1?"s":""} assigned to you</p>
      </div>
    </div>
    <div class="my-tasks-filters">
      <input type="search" id="mt-search" class="form-input" placeholder="Search tasks…" style="width:220px"/>
      <select id="mt-status" class="form-input form-select" style="width:140px">
        <option value="">All Status</option>
        <option value="backlog">Backlog</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="review">Review</option>
        <option value="completed">Completed</option>
      </select>
      <select id="mt-priority" class="form-input form-select" style="width:140px">
        <option value="">All Priority</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>
    </div>
    <div class="my-tasks-list" id="mt-list">
      ${t.length===0?'<div class="full-empty"><div class="full-empty-icon">🎯</div><h3>No tasks assigned to you</h3><p>Tasks assigned to you will appear here</p></div>':t.map(d=>L(d)).join("")}
    </div>`;let r=[...t];const l=()=>{const d=document.getElementById("mt-search").value.toLowerCase(),n=document.getElementById("mt-status").value,i=document.getElementById("mt-priority").value;r=t.filter(o=>(!d||o.title.toLowerCase().includes(d))&&(!n||o.status===n)&&(!i||o.priority===i)),document.getElementById("mt-list").innerHTML=r.length===0?'<div class="my-tasks-empty">No tasks match your filters</div>':r.map(o=>L(o)).join(""),c()};["mt-search","mt-status","mt-priority"].forEach(d=>{var n,i;(n=document.getElementById(d))==null||n.addEventListener("input",l),(i=document.getElementById(d))==null||i.addEventListener("change",l)}),c();function c(){e.querySelectorAll(".task-list-item").forEach(d=>{d.addEventListener("click",()=>{g(()=>import("./main-CxoKqBs3.js").then(n=>n.r),__vite__mapDeps([0,1])).then(n=>n.router.navigate(`/tasks/${d.dataset.taskId}`))})})}}function L(e){const a=x(e.due_date,e.status);return`
    <div class="task-list-item" data-task-id="${e.id}">
      <div class="task-list-item-left">
        ${$(e.priority)}
        <span class="task-list-item-title">${e.title}</span>
        ${e.project?`<span class="task-list-item-project" style="background:${e.project.color}15;color:${e.project.color}">${e.project.name}</span>`:""}
      </div>
      <div class="task-list-item-right">
        ${_(e.status)}
        ${e.due_date?`<span class="task-due ${a?"overdue":""}">📅 ${E(e.due_date)}</span>`:""}
        <div style="display:flex">
          ${(e.assignees||[]).slice(0,3).map(t=>`<img src="${b(t)}" class="av-xs" title="${t.name}" style="margin-left:-5px;border:1.5px solid #fff;object-fit:cover"/>`).join("")}
        </div>
      </div>
    </div>`}async function C(e,a){var d;e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const r=(await H(a)).data||[];e.innerHTML=`
    <div class="task-table-wrap">
      <div class="task-table-toolbar">
        <div class="task-table-toolbar-left">
          <input type="search" id="tbl-search" class="form-input" placeholder="Search…" style="width:190px"/>
          <select id="tbl-status" class="form-input form-select" style="width:130px">
            <option value="">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <select id="tbl-priority" class="form-input form-select" style="width:130px">
            <option value="">All Priority</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
        </div>
        <button class="btn btn-primary btn-sm" id="add-task-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Task
        </button>
      </div>
      <table class="tasks">
        <thead>
          <tr>
            <th style="width:38%">Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignees</th>
            <th>Due Date</th>
            <th style="width:44px"></th>
          </tr>
        </thead>
        <tbody id="tasks-tbody">
          ${r.length===0?'<tr><td colspan="6" class="table-empty">No tasks yet — add your first task above</td></tr>':r.map(n=>B(n)).join("")}
        </tbody>
      </table>
    </div>`,(d=document.getElementById("add-task-btn"))==null||d.addEventListener("click",()=>W(e,a));const l=()=>{const n=document.getElementById("tbl-search").value.toLowerCase(),i=document.getElementById("tbl-status").value,o=document.getElementById("tbl-priority").value,s=r.filter(p=>(!n||p.title.toLowerCase().includes(n))&&(!i||p.status===i)&&(!o||p.priority===o));document.getElementById("tasks-tbody").innerHTML=s.length===0?'<tr><td colspan="6" class="table-empty">No matching tasks</td></tr>':s.map(p=>B(p)).join(""),c()};["tbl-search","tbl-status","tbl-priority"].forEach(n=>{var i,o;(i=document.getElementById(n))==null||i.addEventListener("input",l),(o=document.getElementById(n))==null||o.addEventListener("change",l)}),c();function c(){e.querySelectorAll("tr[data-task-id]").forEach(n=>{n.addEventListener("click",i=>{i.target.closest("[data-delete-task]")||g(()=>import("./main-CxoKqBs3.js").then(o=>o.r),__vite__mapDeps([0,1])).then(o=>o.router.navigate(`/tasks/${n.dataset.taskId}`))})}),e.querySelectorAll("[data-delete-task]").forEach(n=>{n.addEventListener("click",async i=>{i.stopPropagation(),confirm("Delete this task?")&&(await R(n.dataset.deleteTask),v("Task deleted","success"),C(e,a))})})}}function B(e){const a=x(e.due_date,e.status);return`
    <tr data-task-id="${e.id}">
      <td>
        <div class="td-title">
          <span class="task-title-text">${e.title}</span>
          ${e.subtasks_count>0?`<span style="font-size:11px;color:#94a3b8;margin-left:6px">⊞ ${e.subtasks_count}</span>`:""}
        </div>
      </td>
      <td>${$(e.priority)}</td>
      <td>${_(e.status)}</td>
      <td>
        <div class="td-assignees">
          ${(e.assignees||[]).slice(0,3).map(t=>`<img src="${b(t)}" class="av-xs" title="${t.name}" style="border:1.5px solid #fff;object-fit:cover"/>`).join("")}
        </div>
      </td>
      <td style="font-size:12.5px;color:${a?"#dc2626":"#64748b"};font-weight:${a?700:400};white-space:nowrap">
        ${e.due_date?`📅 ${E(e.due_date)}`:"—"}
      </td>
      <td class="td-actions">
        <button class="btn-icon" data-delete-task="${e.id}" title="Delete" style="color:#dc2626">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>`}async function y(e){return async a=>{var r,l,c,d,n;a.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const t=await I(e);a.innerHTML=`
      <div class="task-detail">
        <div class="task-detail-main">

          <!-- Header -->
          <div class="task-header-card">
            <div class="task-breadcrumb">
              <a href="#" data-nav="projects">Projects</a>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              <a href="#" data-nav="project-${t.project_id}">${((r=t.project)==null?void 0:r.name)||"Project"}</a>
            </div>
            <div class="task-title-editable" id="task-title-edit" contenteditable="true">${t.title}</div>
            <div class="task-pills">
              ${$(t.priority)}
              ${_(t.status)}
              ${t.is_blocked?'<span style="background:#fef3c7;color:#d97706;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:100px">🔒 Blocked</span>':""}
              ${t.due_date?`<span class="task-due ${x(t.due_date,t.status)?"overdue":""}" style="font-size:12.5px;padding:3px 8px;background:#f1f5f9;border-radius:100px">📅 ${E(t.due_date)}</span>`:""}
              ${t.estimated_minutes?`<span style="font-size:12.5px;padding:3px 8px;background:#f1f5f9;border-radius:100px">⏱ Est. ${t.estimated_minutes>=60?Math.floor(t.estimated_minutes/60)+"h "+(t.estimated_minutes%60||"")+"m":t.estimated_minutes+"m"}`:""}
            </div>
          </div>

          <!-- Description -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 6h16M4 10h16M4 14h10"/></svg>
                Description
              </span>
            </div>
            <div class="desc-area" id="task-desc-edit" contenteditable="true" data-placeholder="Add a description…">${t.description||""}</div>
          </div>

          <!-- Subtasks -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                Subtasks
                <span class="badge badge-slate" style="font-weight:700">${((l=t.subtasks)==null?void 0:l.length)||0}</span>
              </span>
            </div>
            <div id="subtasks-list">
              ${(t.subtasks||[]).map(i=>`
                <div class="subtask-item">
                  <input type="checkbox" class="subtask-cb" data-subtask-id="${i.id}" ${i.status==="completed"?"checked":""}/>
                  <span class="subtask-label ${i.status==="completed"?"done":""}">${i.title}</span>
                </div>`).join("")}
            </div>
            <div class="subtask-add">
              <input type="text" id="subtask-input" class="form-input" placeholder="Add a subtask…" style="flex:1"/>
              <button class="btn btn-secondary btn-sm" id="add-subtask-btn">Add</button>
            </div>
          </div>

          <!-- Time Tracking -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline stroke-linecap="round" points="12 6 12 12 16 14"/></svg>
                Time Tracking
              </span>
            </div>
            <div class="timer-section-row">
              <div>
                <div class="timer-big" id="task-timer-display">
                  ${F(t.total_time_spent||0)}
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-top:2px">Total tracked</div>
              </div>
              <div class="timer-controls">
                ${N(t)}
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Comments
                <span class="badge badge-slate">${((c=t.comments)==null?void 0:c.length)||0}</span>
              </span>
            </div>
            <div id="comments-list">
              ${(t.comments||[]).map(i=>V(i)).join("")}
            </div>
            <div class="comment-composer">
              <img src="${b(null)}" class="av-sm" alt="You"/>
              <textarea id="comment-input" placeholder="Write a comment… use @name to mention someone" rows="1"></textarea>
              <button class="btn btn-primary btn-sm" id="post-comment-btn">Send</button>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <aside class="task-detail-sidebar">

          <!-- Status / Priority quick-edit -->
          <div class="ts-section">
            <span class="ts-label">Status</span>
            <select class="form-input form-select form-select" id="ts-status" style="margin-bottom:12px">
              <option value="backlog" ${t.status==="backlog"?"selected":""}>Backlog</option>
              <option value="todo" ${t.status==="todo"?"selected":""}>To Do</option>
              <option value="in_progress" ${t.status==="in_progress"?"selected":""}>In Progress</option>
              <option value="review" ${t.status==="review"?"selected":""}>Review</option>
              <option value="completed" ${t.status==="completed"?"selected":""}>Completed</option>
            </select>
            <span class="ts-label">Priority</span>
            <select class="form-input form-select" id="ts-priority">
              <option value="low" ${t.priority==="low"?"selected":""}>🟢 Low</option>
              <option value="medium" ${t.priority==="medium"?"selected":""}>🔵 Medium</option>
              <option value="high" ${t.priority==="high"?"selected":""}>🟠 High</option>
              <option value="urgent" ${t.priority==="urgent"?"selected":""}>🔴 Urgent</option>
            </select>
          </div>

          <!-- Assignees -->
          <div class="ts-section">
            <span class="ts-label">Assignees</span>
            <div class="ts-assignees">
              ${(t.assignees||[]).map(i=>`
                <div class="ts-assignee-chip">
                  <img src="${b(i)}" class="av-xs" alt="${i.name}" style="object-fit:cover"/>
                  <span>${i.name}</span>
                </div>`).join("")}
              ${((d=t.assignees)==null?void 0:d.length)===0?'<span style="font-size:13px;color:#94a3b8">Unassigned</span>':""}
            </div>
          </div>

          <!-- Dates -->
          <div class="ts-section">
            <span class="ts-label">Due Date</span>
            <input type="date" id="ts-due-date" class="form-input" value="${t.due_date||""}" style="margin-bottom:12px"/>
            <span class="ts-label">Start Date</span>
            <input type="date" id="ts-start-date" class="form-input" value="${t.start_date||""}"/>
          </div>

          <!-- Tags -->
          <div class="ts-section">
            <span class="ts-label">Tags</span>
            <div class="ts-tags">
              ${(t.tags||[]).map(i=>`<span class="tag-chip" style="background:${i.color}20;color:${i.color}">${i.name}</span>`).join("")}
              ${((n=t.tags)==null?void 0:n.length)===0?'<span style="font-size:13px;color:#94a3b8">No tags</span>':""}
            </div>
          </div>

          <!-- Attachments -->
          <div class="ts-section">
            <span class="ts-label">Attachments</span>
            <div id="attach-list">
              ${U(t.attachments||[])}
            </div>
            <label style="cursor:pointer;display:block;margin-top:8px">
              <input type="file" id="file-upload" class="hidden" multiple/>
              <span class="btn btn-ghost btn-sm" style="width:100%;justify-content:center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                Attach File
              </span>
            </label>
          </div>

          <!-- Dependencies -->
          ${(t.blocked_by||[]).length>0?`
          <div class="ts-section">
            <span class="ts-label">Blocked By</span>
            ${t.blocked_by.map(i=>`
              <div class="ts-dep-chip ${i.status!=="completed"?"blocked":""}">
                ${i.status==="completed"?"✓":"⚠"} ${i.title}
              </div>`).join("")}
          </div>`:""}

        </aside>
      </div>`,J(a,t)}}function N(e){const a=e.active_timer;return a?a.status==="active"?`
      <span class="timer-live-badge">● LIVE</span>
      <button class="btn btn-secondary btn-sm timer-action-btn" data-action="pause" data-task-id="${e.id}">⏸ Pause</button>
      <button class="btn btn-danger btn-sm timer-action-btn" data-action="stop" data-task-id="${e.id}">■ Stop</button>`:a.status==="paused"?`
      <button class="btn btn-success btn-sm timer-action-btn" data-action="resume" data-task-id="${e.id}">▶ Resume</button>
      <button class="btn btn-danger btn-sm timer-action-btn" data-action="stop" data-task-id="${e.id}">■ Stop</button>`:"":`<button class="btn btn-success btn-sm timer-action-btn" data-action="start" data-task-id="${e.id}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start Timer
    </button>`}function V(e){var a,t;return`
    <div class="comment-item">
      <img src="${b(e.user)}" class="av-sm" alt="${((a=e.user)==null?void 0:a.name)||""}"/>
      <div class="comment-bubble-wrap">
        <div class="comment-bubble">
          <span class="comment-author">${((t=e.user)==null?void 0:t.name)||"User"}</span>
          <span class="comment-time">${O(e.created_at)}</span>
          <div class="comment-text">${e.body}</div>
        </div>
      </div>
    </div>`}function U(e){if(!e.length)return'<div style="font-size:13px;color:#94a3b8">No attachments</div>';const a={image:"🖼️",pdf:"📄",video:"🎬",default:"📎"};return e.map(t=>{var c,d;const r=(d=(c=t.original_name)==null?void 0:c.split(".").pop())==null?void 0:d.toLowerCase();return`
      <div class="attach-item">
        <div class="attach-icon">${["jpg","jpeg","png","gif","webp"].includes(r)?a.image:r==="pdf"?a.pdf:["mp4","mov"].includes(r)?a.video:a.default}</div>
        <div style="flex:1;min-width:0">
          <div class="attach-name">${t.original_name}</div>
          ${t.size?`<div class="attach-size">${(t.size/1024).toFixed(1)} KB</div>`:""}
        </div>
        <a href="#" class="btn btn-ghost btn-sm download-link" data-id="${t.id}" style="padding:4px 8px;font-size:11.5px">↓</a>
      </div>`}).join("")}function F(e){if(!e)return"0:00:00";const a=String(Math.floor(e/3600)).padStart(1,"0"),t=String(Math.floor(e%3600/60)).padStart(2,"0"),r=String(e%60).padStart(2,"0");return`${a}:${t}:${r}`}function J(e,a){var l,c,d,n,i,o;(l=document.getElementById("ts-status"))==null||l.addEventListener("change",async s=>{await f(a.id,{status:s.target.value}),v("Status updated","success")}),(c=document.getElementById("ts-priority"))==null||c.addEventListener("change",async s=>{await f(a.id,{priority:s.target.value}),v("Priority updated","success")}),(d=document.getElementById("ts-due-date"))==null||d.addEventListener("change",async s=>{await f(a.id,{due_date:s.target.value||null}),v("Due date updated","success")});const t=document.getElementById("task-title-edit");t==null||t.addEventListener("blur",async()=>{const s=t.textContent.trim();s&&s!==a.title&&(await f(a.id,{title:s}),v("Title updated","success"))}),t==null||t.addEventListener("keydown",s=>{s.key==="Enter"&&(s.preventDefault(),t.blur())});const r=document.getElementById("task-desc-edit");r==null||r.addEventListener("blur",async()=>{const s=r.textContent.trim();s!==(a.description||"")&&(await f(a.id,{description:s}),v("Description saved","success"))}),e.querySelectorAll(".timer-action-btn").forEach(s=>{s.addEventListener("click",async()=>{await S(s.dataset.taskId,s.dataset.action)&&y(a.id)(e)})}),(n=document.getElementById("post-comment-btn"))==null||n.addEventListener("click",async()=>{const{postComment:s}=await g(async()=>{const{postComment:m}=await import("./tasks-45bDwRW6.js");return{postComment:m}},__vite__mapDeps([2,0,1])),p=document.getElementById("comment-input"),u=p.value.trim();u&&(await s(a.id,{body:u}),p.value="",v("Comment posted","success"),y(a.id)(e))}),e.querySelectorAll(".subtask-cb").forEach(s=>{s.addEventListener("change",async()=>{await f(s.dataset.subtaskId,{status:s.checked?"completed":"todo"})})}),(i=document.getElementById("add-subtask-btn"))==null||i.addEventListener("click",async()=>{const s=document.getElementById("subtask-input"),p=s.value.trim();p&&(await A(a.project_id,{title:p,parent_id:a.id,status:"todo"}),s.value="",v("Subtask added","success"),y(a.id)(e))}),e.querySelectorAll("[data-nav]").forEach(s=>{s.addEventListener("click",p=>{p.preventDefault();const u=s.dataset.nav;u==="projects"?g(()=>import("./main-CxoKqBs3.js").then(m=>m.r),__vite__mapDeps([0,1])).then(m=>m.router.navigate("/projects")):u.startsWith("project-")&&g(()=>import("./main-CxoKqBs3.js").then(m=>m.r),__vite__mapDeps([0,1])).then(m=>m.router.navigate(`/projects/${u.replace("project-","")}`))})}),(o=document.getElementById("file-upload"))==null||o.addEventListener("change",async s=>{const{uploadAttachment:p}=await g(async()=>{const{uploadAttachment:h}=await import("./tasks-45bDwRW6.js");return{uploadAttachment:h}},__vite__mapDeps([2,0,1])),u=s.target.files[0];if(!u)return;const m=new FormData;m.append("file",u),await p(a.id,m),v("File uploaded","success"),y(a.id)(e)}),e.querySelectorAll(".download-link").forEach(s=>{s.addEventListener("click",async p=>{p.preventDefault();const{downloadAttachment:u}=await g(async()=>{const{downloadAttachment:h}=await import("./tasks-45bDwRW6.js");return{downloadAttachment:h}},__vite__mapDeps([2,0,1])),{url:m}=await u(s.dataset.id);window.open(m,"_blank")})})}async function W(e,a=null){let t=[];if(!a)try{const{getProjects:n}=await g(async()=>{const{getProjects:o}=await import("./projects-Dq97Au35.js");return{getProjects:o}},__vite__mapDeps([3,0,1]));t=(await n({per_page:100})).data||[]}catch{}const r=a?"":`
    <div class="form-group">
      <label class="form-label">Project *</label>
      <select name="project_id" id="new-task-project" class="form-input form-select" required>
        <option value="">— Select a project —</option>
        ${t.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")}
      </select>
    </div>`;z({title:"Create Task",subtitle:a?"Add a new task to this project":"Add a task to any project",body:`
      <form id="new-task-form">

        ${r}

        <div class="form-group">
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" placeholder="What needs to be done?" required autofocus/>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Add details, steps, or context…"></textarea>
        </div>

        <div class="form-sep">Details</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-input form-select">
              <option value="low">🟢 Low</option>
              <option value="medium" selected>🔵 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input form-select">
              <option value="backlog">Backlog</option>
              <option value="todo" selected>To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">Estimated Time (min)</label>
            <input type="number" name="estimated_minutes" class="form-input" placeholder="e.g. 60" min="1"/>
          </div>
        </div>

        <div class="form-sep">Assignment</div>

        <div class="form-group">
          <label class="form-label">Assign To</label>
          <div class="picker-wrap">
            <input type="text" id="assignee-search" class="form-input" placeholder="Search team members…" autocomplete="off"/>
            <div id="assignee-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="assignee-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="assignee_ids" id="assignee-ids" value="[]"/>
        </div>

        <div class="form-group">
          <label class="form-label">Watchers <span class="form-hint" style="display:inline">— notified on updates</span></label>
          <div class="picker-wrap">
            <input type="text" id="watcher-search" class="form-input" placeholder="Search team members…" autocomplete="off"/>
            <div id="watcher-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="watcher-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="watcher_ids" id="watcher-ids" value="[]"/>
        </div>

        <div class="form-sep">Labels</div>

        <div class="form-group">
          <label class="form-label">Tags</label>
          <div class="picker-wrap">
            <input type="text" id="tag-search" class="form-input" placeholder="Search or create tag…" autocomplete="off"/>
            <div id="tag-dropdown" class="picker-dropdown" style="display:none"></div>
          </div>
          <div id="tag-chips" class="picker-chips-wrap"></div>
          <input type="hidden" name="tag_ids" id="tag-ids" value="[]"/>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="cancel-task">Cancel</button>
          <button type="submit" class="btn btn-primary" id="submit-task">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
            Create Task
          </button>
        </div>
      </form>`,wide:!0});const l=[],c=[],d=[];k("assignee-search","assignee-dropdown","assignee-chips","assignee-ids",l,"user"),k("watcher-search","watcher-dropdown","watcher-chips","watcher-ids",c,"user"),k("tag-search","tag-dropdown","tag-chips","tag-ids",d,"tag"),document.getElementById("cancel-task").addEventListener("click",T),document.getElementById("new-task-form").addEventListener("submit",async n=>{n.preventDefault();const i=document.getElementById("submit-task");i.disabled=!0,i.textContent="Creating…";const o=Object.fromEntries(new FormData(n.target));o.assignee_ids=l,o.watcher_ids=c,o.tag_ids=d;const s=a||o.project_id;if(!s){v("Please select a project","error"),i.disabled=!1,i.textContent="Create Task";return}delete o.project_id;try{await A(s,o),T(),v("Task created!","success"),a&&e?C(e,a):e&&q(e)}catch{i.disabled=!1,i.textContent="Create Task"}})}let j={};function k(e,a,t,r,l,c){const d=document.getElementById(e),n=document.getElementById(a),i=document.getElementById(t),o=document.getElementById(r);d&&(d.addEventListener("input",()=>{clearTimeout(j[e]);const s=d.value.trim();if(!s){n.style.display="none";return}j[e]=setTimeout(async()=>{try{const{api:p}=await g(async()=>{const{api:M}=await import("./main-CxoKqBs3.js").then(D=>D.b);return{api:M}},__vite__mapDeps([0,1])),u=c==="user"?`/users/search?q=${encodeURIComponent(s)}&per_page=8`:`/tags?q=${encodeURIComponent(s)}&per_page=10`,m=await p.get(u.split("?")[0],{q:s,per_page:c==="user"?8:10}),h=m.data||m||[];K(h,n,i,o,l,d,c)}catch{}},280)}),document.addEventListener("mousedown",s=>{!d.contains(s.target)&&!n.contains(s.target)&&(n.style.display="none")}))}function K(e,a,t,r,l,c,d){var n,i;if(!e.length){a.innerHTML=d==="tag"&&c.value.trim()?`<div class="picker-item" id="create-tag-item" style="color:#6366f1;font-weight:600">+ Create "${c.value.trim()}"</div>`:'<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">No results</div>',a.style.display="block",d==="tag"&&((n=document.getElementById("create-tag-item"))==null||n.addEventListener("click",async()=>{try{const{api:o}=await g(async()=>{const{api:p}=await import("./main-CxoKqBs3.js").then(u=>u.b);return{api:p}},__vite__mapDeps([0,1])),s=await o.post("/tags",{name:c.value.trim(),color:"#6366f1"});l.includes(s.id)||(l.push(s.id),r.value=JSON.stringify(l),w(t,s.id,s.name,s.color,l,r,d)),a.style.display="none",c.value=""}catch{}}));return}a.innerHTML=e.map(o=>{const s=o.id,p=o.name,u=l.includes(s);if(d==="user"){const m=o.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(p)}&size=24&background=6366f1&color=fff`;return`<div class="picker-item ${u?"selected":""}" data-id="${s}" data-name="${p}" data-avatar="${m}">
        <img src="${m}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0"/>
        <span style="flex:1">${p}</span>
        <span style="font-size:11.5px;color:#94a3b8">${o.email||""}</span>
        ${u?'<span style="color:#6366f1;font-size:14px;font-weight:700">✓</span>':""}
      </div>`}else return`<div class="picker-item ${u?"selected":""}" data-id="${s}" data-name="${p}" data-color="${o.color||"#6366f1"}">
        <span style="width:10px;height:10px;border-radius:50%;background:${o.color||"#6366f1"};flex-shrink:0;display:inline-block"></span>
        <span>${p}</span>
        ${u?'<span style="color:#6366f1;margin-left:auto">✓</span>':""}
      </div>`}).join(""),a.style.display="block",d==="tag"&&c.value.trim()&&(a.innerHTML+=`<div class="picker-item" id="create-tag-item-alt" style="color:#6366f1;font-weight:600;border-top:1px solid #e2e8f0;margin-top:2px;padding-top:8px">+ Create "${c.value.trim()}"</div>`,(i=document.getElementById("create-tag-item-alt"))==null||i.addEventListener("click",async()=>{try{const{api:o}=await g(async()=>{const{api:p}=await import("./main-CxoKqBs3.js").then(u=>u.b);return{api:p}},__vite__mapDeps([0,1])),s=await o.post("/tags",{name:c.value.trim(),color:"#6366f1"});l.includes(s.id)||(l.push(s.id),r.value=JSON.stringify(l),w(t,s.id,s.name,s.color,l,r,d)),a.style.display="none",c.value=""}catch{}})),a.querySelectorAll("[data-id]").forEach(o=>{o.addEventListener("click",()=>{const s=parseInt(o.dataset.id);l.includes(s)||(l.push(s),r.value=JSON.stringify(l),w(t,s,o.dataset.name,o.dataset.color,l,r,d)),a.style.display="none",c.value=""})})}function w(e,a,t,r,l,c,d){const n=document.createElement("div");if(n.className="picker-chip",n.dataset.id=a,d==="user"){const i=`https://ui-avatars.com/api/?name=${encodeURIComponent(t)}&size=18&background=6366f1&color=fff`;n.innerHTML=`<img src="${i}" style="width:18px;height:18px;border-radius:50%;object-fit:cover"/><span>${t}</span><span class="rm">×</span>`}else n.innerHTML=`<span style="width:8px;height:8px;border-radius:50%;background:${r||"#6366f1"};display:inline-block"></span><span>${t}</span><span class="rm">×</span>`;n.querySelector(".rm").addEventListener("click",()=>{const i=l.indexOf(a);i>-1&&l.splice(i,1),c.value=JSON.stringify(l),n.remove()}),e.appendChild(n)}export{W as openNewTaskModal,q as renderMyTasks,y as renderTaskDetail,C as renderTaskList};
