const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css","assets/sidePanel-Bf10QYLB.js","assets/tasks-qIqnclG-.js","assets/helpers-ByTbCZyC.js","assets/projects-8oxmbYM-.js"])))=>i.map(i=>d[i]);
import{_ as x,s as v,a as T,b as P}from"./main-CxzuflVX.js";import{createTask as A,getMyTasks as Q,getTask as X,getProjectTasks as Z,deleteTask as tt,updateTask as E}from"./tasks-qIqnclG-.js";import{openModal as et,closeModal as U}from"./modal-jGhccxZ4.js";import{p as H,s as z,i as F,f as q,a as I,r as Y}from"./helpers-ByTbCZyC.js";async function G(e){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const[s,t]=await Promise.all([Q(),T.get("/projects").catch(()=>({data:[]}))]),c=s.data||[],r=t.data||[];e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Tasks</h1>
        <p>${c.length} task${c.length!==1?"s":""} assigned to you</p>
      </div>
    </div>
    <div class="my-tasks-filters">
      <input type="search" id="mt-search" class="form-input" placeholder="Search tasks…" style="width:220px"/>
      <select id="mt-status" class="form-input form-select" style="width:140px">
        <option value="">All Status</option>
        <option value="backlog">Backlog</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="working_on">Working On</option>
        <option value="review">Review / Testing</option>
        <option value="blocked">Blocked</option>
        <option value="completed">Done</option>
      </select>
      <select id="mt-priority" class="form-input form-select" style="width:140px">
        <option value="">All Priority</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>
    </div>

    <!-- Asana-style inline add row -->
    <div class="mt-add-row" id="mt-add-row">
      <div class="mt-add-trigger" id="mt-add-trigger">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        <span>Add task…</span>
      </div>
      <div class="mt-add-form hidden" id="mt-add-form">
        <div class="mt-add-form-row">
          <input type="text" id="mt-add-title" class="mt-add-input" placeholder="Task name" autofocus/>
          <select id="mt-add-project" class="mt-add-select" title="Project">
            ${r.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")}
          </select>
          <select id="mt-add-priority" class="mt-add-select" title="Priority">
            <option value="medium">🔵 Medium</option>
            <option value="low">⚪ Low</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
          <select id="mt-add-status" class="mt-add-select" title="Status">
            <option value="todo">To Do</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
          </select>
          <input type="date" id="mt-add-due" class="mt-add-select" title="Due date"/>
          <select id="mt-add-type" class="mt-add-select" title="Type">
            <option value="task">📋 Task</option>
            <option value="feature">✨ Feature</option>
            <option value="bug">🐛 Bug</option>
            <option value="improvement">🔧 Improvement</option>
          </select>
          <button class="btn btn-primary btn-sm" id="mt-add-submit" style="white-space:nowrap">Add</button>
          <button class="btn btn-ghost btn-sm" id="mt-add-cancel" style="padding:6px">✕</button>
        </div>
      </div>
    </div>

    <div class="my-tasks-list" id="mt-list">
      ${c.length===0?'<div class="full-empty"><div class="full-empty-icon">🎯</div><h3>No tasks assigned to you</h3><p>Click "+ Add task" above to create one</p></div>':c.map(l=>W(l)).join("")}
    </div>`;const i=document.getElementById("mt-add-trigger"),u=document.getElementById("mt-add-form"),m=document.getElementById("mt-add-title");i.addEventListener("click",()=>{i.classList.add("hidden"),u.classList.remove("hidden"),m.focus()}),document.getElementById("mt-add-cancel").addEventListener("click",()=>{u.classList.add("hidden"),i.classList.remove("hidden"),m.value=""}),m.addEventListener("keydown",l=>{l.key==="Enter"&&(l.preventDefault(),document.getElementById("mt-add-submit").click()),l.key==="Escape"&&document.getElementById("mt-add-cancel").click()}),document.getElementById("mt-add-submit").addEventListener("click",async()=>{var b;const l=m.value.trim();if(!l){m.focus();return}const p=document.getElementById("mt-add-project").value;if(!p){v("Select a project","error");return}const y=document.getElementById("mt-add-submit");y.disabled=!0,y.textContent="…";try{const g=(b=P.get("user"))==null?void 0:b.id;await A(p,{title:l,priority:document.getElementById("mt-add-priority").value,status:document.getElementById("mt-add-status").value,task_type:document.getElementById("mt-add-type").value,due_date:document.getElementById("mt-add-due").value||null,assignees:g?[g]:[]}),v("Task added","success"),m.value="",m.focus(),G(e)}catch(g){v((g==null?void 0:g.message)||"Failed to add task","error")}finally{y.disabled=!1,y.textContent="Add"}});let a=[...c];const d=()=>{const l=document.getElementById("mt-search").value.toLowerCase(),p=document.getElementById("mt-status").value,y=document.getElementById("mt-priority").value;a=c.filter(b=>(!l||b.title.toLowerCase().includes(l))&&(!p||b.status===p)&&(!y||b.priority===y)),document.getElementById("mt-list").innerHTML=a.length===0?'<div class="my-tasks-empty">No tasks match your filters</div>':a.map(b=>W(b)).join(""),o()};["mt-search","mt-status","mt-priority"].forEach(l=>{var p,y;(p=document.getElementById(l))==null||p.addEventListener("input",d),(y=document.getElementById(l))==null||y.addEventListener("change",d)}),o();function o(){e.querySelectorAll(".task-list-item").forEach(l=>{l.addEventListener("click",()=>{x(()=>import("./main-CxzuflVX.js").then(p=>p.r),__vite__mapDeps([0,1])).then(p=>p.router.navigate(`/tasks/${l.dataset.taskId}`))})})}}function W(e){const s=F(e.due_date,e.status),t=e.status==="working_on";return`
    <div class="task-list-item ${t?"working":""}" data-task-id="${e.id}">
      <div class="task-list-item-left">
        ${H(e.priority)}
        <span class="task-list-item-title">${e.title}</span>
        ${e.project?`<span class="task-list-item-project" style="background:${e.project.color}15;color:${e.project.color}">${e.project.name}</span>`:""}
      </div>
      <div class="task-list-item-right">
        ${t?'<span class="task-timer-auto-badge">⏱ Timer On</span>':""}
        ${z(e.status)}
        ${e.due_date?`<span class="task-due ${s?"overdue":""}">📅 ${q(e.due_date)}</span>`:""}
        <div style="display:flex">
          ${(e.assignees||[]).slice(0,3).map(c=>`<img src="${I(c)}" class="av-xs" title="${c.name}" style="margin-left:-5px;border:1.5px solid #fff;object-fit:cover"/>`).join("")}
        </div>
      </div>
    </div>`}async function R(e,s){var m;e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const c=(await Z(s)).data||[];e.innerHTML=`
    <div class="task-table-wrap">
      <div class="task-table-toolbar">
        <div class="task-table-toolbar-left">
          <input type="search" id="tbl-search" class="form-input" placeholder="Search…" style="width:190px"/>
          <select id="tbl-status" class="form-input form-select" style="width:130px">
            <option value="">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="working_on">Working On</option>
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
            <th style="width:32%" class="sortable-th" data-sort="title">Title ↕</th>
            <th class="sortable-th" data-sort="task_type">Type ↕</th>
            <th class="sortable-th" data-sort="priority">Priority ↕</th>
            <th class="sortable-th" data-sort="status">Status ↕</th>
            <th>Assignees</th>
            <th class="sortable-th" data-sort="score">Score ↕</th>
            <th class="sortable-th" data-sort="due_date">Due Date ↕</th>
            <th style="width:44px"></th>
          </tr>
        </thead>
        <tbody id="tasks-tbody">
          ${c.length===0?'<tr><td colspan="8" class="table-empty">No tasks yet — add your first task above</td></tr>':c.map(a=>K(a)).join("")}
        </tbody>
      </table>
      <!-- Asana-style compact inline add -->
      <div class="inline-task-add" id="inline-add-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
        <input type="text" id="inline-task-title" placeholder="Add a task… (press Enter)" autocomplete="off"/>
        <select id="inline-task-type" title="Type">
          <option value="task">📋 Task</option>
          <option value="feature">✨ Feature</option>
          <option value="bug">🐛 Bug</option>
          <option value="improvement">🔧 Improvement</option>
          <option value="story">📖 Story</option>
          <option value="spike">🔬 Spike</option>
          <option value="chore">🧹 Chore</option>
        </select>
        <select id="inline-task-priority" title="Priority">
          <option value="medium">🔵</option>
          <option value="low">🟢</option>
          <option value="high">🟠</option>
          <option value="urgent">🔴</option>
        </select>
      </div>
    </div>`;const r=document.getElementById("inline-task-title");r==null||r.addEventListener("keydown",async a=>{if(a.key!=="Enter")return;const d=r.value.trim();if(!d)return;const o=document.getElementById("inline-task-type").value,l=document.getElementById("inline-task-priority").value;r.disabled=!0;try{await A(s,{title:d,task_type:o,priority:l}),r.value="",v("Task added","success",1500),R(e,s)}catch{v("Failed to add task","error")}r.disabled=!1,r.focus()}),(m=document.getElementById("add-task-btn"))==null||m.addEventListener("click",()=>rt(e,s));const i=()=>{const a=document.getElementById("tbl-search").value.toLowerCase(),d=document.getElementById("tbl-status").value,o=document.getElementById("tbl-priority").value,l=c.filter(p=>(!a||p.title.toLowerCase().includes(a))&&(!d||p.status===d)&&(!o||p.priority===o));document.getElementById("tasks-tbody").innerHTML=l.length===0?'<tr><td colspan="8" class="table-empty">No matching tasks</td></tr>':l.map(p=>K(p)).join(""),u()};["tbl-search","tbl-status","tbl-priority"].forEach(a=>{var d,o;(d=document.getElementById(a))==null||d.addEventListener("input",i),(o=document.getElementById(a))==null||o.addEventListener("change",i)}),u();function u(){e.querySelectorAll("tr[data-task-id]").forEach(a=>{a.addEventListener("click",d=>{d.target.closest("[data-delete-task]")||(d.shiftKey?x(()=>import("./sidePanel-Bf10QYLB.js"),__vite__mapDeps([2,0,1,3,4])).then(o=>o.openSidePanel(a.dataset.taskId)):x(()=>import("./main-CxzuflVX.js").then(o=>o.r),__vite__mapDeps([0,1])).then(o=>o.router.navigate(`/tasks/${a.dataset.taskId}`)))})}),e.querySelectorAll("[data-delete-task]").forEach(a=>{a.addEventListener("click",async d=>{d.stopPropagation(),confirm("Delete this task?")&&(await tt(a.dataset.deleteTask),v("Task deleted","success"),R(e,s))})})}}const O={feature:"✨",bug:"🐛",improvement:"🔧",story:"📖",spike:"🔬",chore:"🧹",task:"📋"};function K(e){const s=F(e.due_date,e.status),t=O[e.task_type]||O.task;return`
    <tr data-task-id="${e.id}">
      <td>
        <div class="td-title">
          <span class="task-title-text">${e.title}</span>
          ${e.subtasks_count>0?`<span style="font-size:11px;color:#94a3b8;margin-left:6px">⊞ ${e.subtasks_count}</span>`:""}
          ${e.is_reviewed?'<span class="reviewed-badge">✓</span>':""}
        </div>
      </td>
      <td><span class="task-type-icon" title="${e.task_type||"task"}">${t}</span> <span style="font-size:12px;color:#64748b">${e.task_type||"task"}</span></td>
      <td>${H(e.priority)}</td>
      <td>${z(e.status)}</td>
      <td>
        <div class="td-assignees">
          ${(e.assignees||[]).slice(0,3).map(c=>`<img src="${I(c)}" class="av-xs" title="${c.name}" style="border:1.5px solid #fff;object-fit:cover"/>`).join("")}
        </div>
      </td>
      <td style="font-size:12px;font-weight:700;color:#6366f1;text-align:center">${e.score?e.score+"pts":"—"}</td>
      <td style="font-size:12.5px;color:${s?"#dc2626":"#64748b"};font-weight:${s?700:400};white-space:nowrap">
        ${e.due_date?`📅 ${q(e.due_date)}`:"—"}
      </td>
      <td class="td-actions">
        <button class="btn-icon" data-delete-task="${e.id}" title="Delete" style="color:#dc2626">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>`}async function L(e){return async s=>{var c,r,i,u,m;s.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let t;try{t=await X(e)}catch(a){console.error("Failed to load task:",a),s.innerHTML=`<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Failed to load task</h3><p>${a.message||""}</p></div>`;return}if(!t||!t.id){s.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Task not found</h3></div>';return}s.innerHTML=`
      <div class="task-detail">
        <div class="task-detail-main">

          <!-- Header -->
          <div class="task-header-card">
            <div class="task-breadcrumb">
              <a href="#" data-nav="projects">Projects</a>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              <a href="#" data-nav="project-${t.project_id}">${((c=t.project)==null?void 0:c.name)||"Project"}</a>
            </div>
            <div class="task-title-editable" id="task-title-edit" contenteditable="true">${t.title}</div>
            <div class="task-pills">
              <span class="task-type-pill">${O[t.task_type]||"📋"} ${(t.task_type||"task").replace("_"," ")}</span>
              ${H(t.priority)}
              ${z(t.status)}
              ${t.is_blocked?'<span style="background:#fef3c7;color:#d97706;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:100px">🔒 Blocked</span>':""}
              ${t.due_date?`<span class="task-due ${F(t.due_date,t.status)?"overdue":""}" style="font-size:12.5px;padding:3px 8px;background:#f1f5f9;border-radius:100px">📅 ${q(t.due_date)}</span>`:""}
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
                <span class="badge badge-slate" style="font-weight:700">${((r=t.subtasks)==null?void 0:r.length)||0}</span>
              </span>
            </div>
            <div id="subtasks-list">
              ${(t.subtasks||[]).map(a=>`
                <div class="subtask-item">
                  <input type="checkbox" class="subtask-cb" data-subtask-id="${a.id}" ${a.status==="completed"?"checked":""}/>
                  <span class="subtask-label ${a.status==="completed"?"done":""}">${a.title}</span>
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
                  ${dt(t.total_time_spent||0)}
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-top:2px">Total tracked</div>
              </div>
              <div class="timer-controls">
                ${it(t)}
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Comments
                <span class="badge badge-slate">${((i=t.comments)==null?void 0:i.length)||0}</span>
              </span>
            </div>
            <div id="comments-list">
              ${(t.comments||[]).map(a=>ot(a)).join("")}
            </div>
            <div class="comment-composer">
              <img src="${I(null)}" class="av-sm" alt="You"/>
              <textarea id="comment-input" placeholder="Write a comment… use @name to mention someone" rows="1"></textarea>
              <button class="btn btn-primary btn-sm" id="post-comment-btn">Send</button>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <aside class="task-detail-sidebar">

          <!-- Status / Priority / Type quick-edit -->
          <div class="ts-section">
            <span class="ts-label">Status</span>
            <select class="form-input form-select" id="ts-status" style="margin-bottom:12px">
              <option value="backlog" ${t.status==="backlog"?"selected":""}>Backlog</option>
              <option value="todo" ${t.status==="todo"?"selected":""}>To Do</option>
              <option value="in_progress" ${t.status==="in_progress"?"selected":""}>In Progress</option>
              <option value="working_on" ${t.status==="working_on"?"selected":""}>🔥 Working On</option>
              <option value="review" ${t.status==="review"?"selected":""}>Review / Testing</option>
              <option value="blocked" ${t.status==="blocked"?"selected":""}>🚫 Blocked</option>
              <option value="completed" ${t.status==="completed"?"selected":""}>Done</option>
            </select>
            <span class="ts-label">Priority</span>
            <select class="form-input form-select" id="ts-priority" style="margin-bottom:12px">
              <option value="low" ${t.priority==="low"?"selected":""}>🟢 Low</option>
              <option value="medium" ${t.priority==="medium"?"selected":""}>🔵 Medium</option>
              <option value="high" ${t.priority==="high"?"selected":""}>🟠 High</option>
              <option value="urgent" ${t.priority==="urgent"?"selected":""}>🔴 Urgent</option>
            </select>
            <span class="ts-label">Task Type</span>
            <select class="form-input form-select" id="ts-task-type" style="margin-bottom:12px">
              <option value="task" ${t.task_type==="task"?"selected":""}>📋 Task</option>
              <option value="feature" ${t.task_type==="feature"?"selected":""}>✨ Feature</option>
              <option value="bug" ${t.task_type==="bug"?"selected":""}>🐛 Bug</option>
              <option value="improvement" ${t.task_type==="improvement"?"selected":""}>🔧 Improvement</option>
              <option value="story" ${t.task_type==="story"?"selected":""}>📖 Story</option>
              <option value="spike" ${t.task_type==="spike"?"selected":""}>🔬 Spike</option>
              <option value="chore" ${t.task_type==="chore"?"selected":""}>🧹 Chore</option>
            </select>
          </div>

          <!-- Reviewed + Score -->
          <div class="ts-section">
            <div class="ts-reviewed-row">
              <span class="ts-label" style="margin-bottom:0">Reviewed</span>
              <label class="toggle-switch">
                <input type="checkbox" id="ts-reviewed" ${t.is_reviewed?"checked":""}/>
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </label>
            </div>
            <span class="ts-label" style="margin-top:12px">Score</span>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="range" id="ts-score" min="0" max="100" value="${t.score||0}" class="score-slider"/>
              <span id="ts-score-val" class="score-val">${t.score||0}</span>
            </div>
          </div>

          <!-- Timebox -->
          <div class="ts-section">
            <span class="ts-label">Timebox</span>
            <div style="display:flex;flex-direction:column;gap:6px">
              <input type="datetime-local" id="ts-timebox-start" class="form-input" value="${t.timebox_start?t.timebox_start.slice(0,16):""}" placeholder="Start"/>
              <input type="datetime-local" id="ts-timebox-end" class="form-input" value="${t.timebox_end?t.timebox_end.slice(0,16):""}" placeholder="End"/>
            </div>
          </div>

          <!-- Assignees -->
          <div class="ts-section">
            <span class="ts-label">Assignees</span>
            <div class="ts-assignees">
              ${(t.assignees||[]).map(a=>`
                <div class="ts-assignee-chip">
                  <img src="${I(a)}" class="av-xs" alt="${a.name}" style="object-fit:cover"/>
                  <span>${a.name}</span>
                </div>`).join("")}
              ${((u=t.assignees)==null?void 0:u.length)===0?'<span style="font-size:13px;color:#94a3b8">Unassigned</span>':""}
            </div>
          </div>

          <!-- Reviewers -->
          <div class="ts-section">
            <span class="ts-label">Reviewers</span>
            <div id="ts-reviewers-list">
              ${(t.reviewers||[]).map(a=>{var l,p;const d=((l=a.pivot)==null?void 0:l.review_status)||"pending",o=((p=a.pivot)==null?void 0:p.review_note)||"";return`
                <div class="ts-reviewer-chip">
                  <img src="${I(a)}" alt="${a.name}"/>
                  <span>${a.name}</span>
                  <span class="rv-status ${d}" title="${o}">${d==="approved"?"✅ Approved":d==="rejected"?"❌ Rejected":"⏳ Pending"}</span>
                  <button class="rv-remove" data-reviewer-id="${a.id}" title="Remove reviewer">×</button>
                </div>`}).join("")}
              ${(t.reviewers||[]).length===0?'<span style="font-size:13px;color:#94a3b8">No reviewers</span>':""}
            </div>
            <button class="btn btn-ghost btn-sm" id="add-reviewer-btn" style="width:100%;justify-content:center;margin-top:6px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
              Add Reviewer
            </button>
            ${(()=>{var o,l,p;const a=typeof P<"u"?(l=(o=P)==null?void 0:o.get)==null?void 0:l.call(o,"user"):null,d=a&&(t.reviewers||[]).find(y=>y.id===a.id);return((p=d==null?void 0:d.pivot)==null?void 0:p.review_status)==="pending"?`
            <div class="rv-actions">
              <button class="btn btn-primary btn-sm" id="rv-approve-btn">✅ Approve</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--red)" id="rv-reject-btn">❌ Reject</button>
            </div>`:""})()}
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
              ${(t.tags||[]).map(a=>`<span class="tag-chip" style="background:${a.color}20;color:${a.color}">${a.name}</span>`).join("")}
              ${((m=t.tags)==null?void 0:m.length)===0?'<span style="font-size:13px;color:#94a3b8">No tags</span>':""}
            </div>
          </div>

          <!-- Attachments -->
          <div class="ts-section">
            <span class="ts-label">Attachments</span>
            <div id="attach-list">
              ${nt(t.attachments||[])}
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
          <div class="ts-section">
            <span class="ts-label">Dependencies</span>
            <div id="dep-blocked-by">
              ${(t.blocked_by||[]).length>0?`
                <div style="font-size:11px;font-weight:700;color:#d97706;margin-bottom:4px">BLOCKED BY</div>
                ${t.blocked_by.map(a=>`
                  <div class="ts-dep-chip ${a.status!=="completed"?"blocked":"resolved"}">
                    <span>${a.status==="completed"?"✅":"🔒"} ${a.title}</span>
                    <button class="dep-remove-btn" data-dep-task-id="${t.id}" data-dep-on-id="${a.id}" title="Remove">×</button>
                  </div>`).join("")}`:""}
            </div>
            <div id="dep-blocking">
              ${(t.blocking||[]).length>0?`
                <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:4px;margin-top:8px">BLOCKING</div>
                ${t.blocking.map(a=>`
                  <div class="ts-dep-chip blocking">
                    <span>➡ ${a.title}</span>
                  </div>`).join("")}`:""}
            </div>
            <div style="margin-top:8px">
              <button class="btn btn-ghost btn-sm" id="add-dep-btn" style="width:100%;justify-content:center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
                Add Dependency
              </button>
            </div>
          </div>

        </aside>
      </div>
      <!-- Activity Log -->
      <div class="section-card activity-log-card" id="activity-log-section">
        <div class="section-head">
          <span class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Activity
          </span>
        </div>
        <div id="activity-list" class="activity-list">
          <div style="color:#94a3b8;font-size:13px">Loading activity…</div>
        </div>
      </div>`,lt(s,t),st(t.id)}}async function st(e){const s=document.getElementById("activity-list");if(s)try{const{api:t}=await x(async()=>{const{api:i}=await import("./main-CxzuflVX.js").then(u=>u.c);return{api:i}},__vite__mapDeps([0,1])),r=(await t.get(`/tasks/${e}/activity`)).data||[];if(!r.length){s.innerHTML='<div style="color:#94a3b8;font-size:13px">No activity yet</div>';return}s.innerHTML=r.map(i=>{var u,m,a,d;return`
      <div class="activity-item">
        <img src="${((u=i.user)==null?void 0:u.avatar_url)||`https://ui-avatars.com/api/?name=${encodeURIComponent(((m=i.user)==null?void 0:m.name)||"?")}&size=24&background=6366f1&color=fff`}" class="av-xs activity-av" alt="${((a=i.user)==null?void 0:a.name)||""}"/>
        <div class="activity-body">
          <span class="activity-user">${((d=i.user)==null?void 0:d.name)||"System"}</span>
          <span class="activity-event">${at(i)}</span>
          <span class="activity-time">${Y(i.created_at)}</span>
        </div>
      </div>`}).join("")}catch{s.innerHTML='<div style="color:#94a3b8;font-size:13px">No activity recorded</div>'}}function at(e){var t;const s=e.properties||{};switch(e.event){case"created":return"created this task";case"updated":{const c=Object.keys(s.changes||s||{}).filter(r=>r!=="updated_at");return c.length?`updated ${c.join(", ")}`:"updated this task"}case"status_changed":return`moved to <strong>${(s.to||"").replace("_"," ")}</strong>`;case"assigned":return`assigned to ${s.assignee||"someone"}`;case"commented":return"left a comment";case"timer_started":return"started the timer";case"timer_stopped":return`stopped the timer (${s.duration||""})`;default:return((t=e.event)==null?void 0:t.replace(/_/g," "))||"did something"}}function it(e){var s;return e.status==="working_on"?'<span class="timer-auto-badge">⏱ Timer running automatically</span>':((s=e.active_timer)==null?void 0:s.status)==="active"?'<span class="timer-auto-badge">⏱ Timer active</span>':'<span style="font-size:12px;color:var(--muted)">Set status to "Working On" to start timer</span>'}function ot(e){var s,t;return`
    <div class="comment-item">
      <img src="${I(e.user)}" class="av-sm" alt="${((s=e.user)==null?void 0:s.name)||""}"/>
      <div class="comment-bubble-wrap">
        <div class="comment-bubble">
          <span class="comment-author">${((t=e.user)==null?void 0:t.name)||"User"}</span>
          <span class="comment-time">${Y(e.created_at)}</span>
          <div class="comment-text">${e.body}</div>
        </div>
      </div>
    </div>`}function nt(e){if(!e.length)return'<div style="font-size:13px;color:#94a3b8">No attachments</div>';const s={image:"🖼️",pdf:"📄",video:"🎬",default:"📎"};return e.map(t=>{var i,u;const c=(u=(i=t.original_name)==null?void 0:i.split(".").pop())==null?void 0:u.toLowerCase();return`
      <div class="attach-item">
        <div class="attach-icon">${["jpg","jpeg","png","gif","webp"].includes(c)?s.image:c==="pdf"?s.pdf:["mp4","mov"].includes(c)?s.video:s.default}</div>
        <div style="flex:1;min-width:0">
          <div class="attach-name">${t.original_name}</div>
          ${t.size?`<div class="attach-size">${(t.size/1024).toFixed(1)} KB</div>`:""}
        </div>
        <a href="#" class="btn btn-ghost btn-sm download-link" data-id="${t.id}" style="padding:4px 8px;font-size:11.5px">↓</a>
      </div>`}).join("")}function dt(e){if(!e)return"0:00:00";const s=String(Math.floor(e/3600)).padStart(1,"0"),t=String(Math.floor(e%3600/60)).padStart(2,"0"),c=String(e%60).padStart(2,"0");return`${s}:${t}:${c}`}function lt(e,s){var u,m,a,d,o,l,p,y,b,g,w,j,M,N,V;(u=document.getElementById("ts-status"))==null||u.addEventListener("change",async n=>{await E(s.id,{status:n.target.value}),v("Status updated","success")}),(m=document.getElementById("ts-priority"))==null||m.addEventListener("change",async n=>{await E(s.id,{priority:n.target.value}),v("Priority updated","success")}),(a=document.getElementById("ts-task-type"))==null||a.addEventListener("change",async n=>{await E(s.id,{task_type:n.target.value}),v("Task type updated","success")}),(d=document.getElementById("ts-reviewed"))==null||d.addEventListener("change",async n=>{await E(s.id,{is_reviewed:n.target.checked}),v(n.target.checked?"Marked as reviewed":"Unmarked review","success")});const t=document.getElementById("ts-score"),c=document.getElementById("ts-score-val");t==null||t.addEventListener("input",()=>{c.textContent=t.value}),t==null||t.addEventListener("change",async()=>{await E(s.id,{score:parseInt(t.value)||null}),v("Score updated","success")}),(o=document.getElementById("ts-timebox-start"))==null||o.addEventListener("change",async n=>{await E(s.id,{timebox_start:n.target.value||null}),v("Timebox start set","success")}),(l=document.getElementById("ts-timebox-end"))==null||l.addEventListener("change",async n=>{await E(s.id,{timebox_end:n.target.value||null}),v("Timebox end set","success")}),(p=document.getElementById("ts-due-date"))==null||p.addEventListener("change",async n=>{await E(s.id,{due_date:n.target.value||null}),v("Due date updated","success")});const r=document.getElementById("task-title-edit");r==null||r.addEventListener("blur",async()=>{const n=r.textContent.trim();n&&n!==s.title&&(await E(s.id,{title:n}),v("Title updated","success"))}),r==null||r.addEventListener("keydown",n=>{n.key==="Enter"&&(n.preventDefault(),r.blur())});const i=document.getElementById("task-desc-edit");i==null||i.addEventListener("blur",async()=>{const n=i.textContent.trim();n!==(s.description||"")&&(await E(s.id,{description:n}),v("Description saved","success"))}),(y=document.getElementById("post-comment-btn"))==null||y.addEventListener("click",async()=>{const{postComment:n}=await x(async()=>{const{postComment:f}=await import("./tasks-qIqnclG-.js");return{postComment:f}},__vite__mapDeps([3,0,1])),k=document.getElementById("comment-input"),h=k.value.trim();h&&(await n(s.id,{body:h}),k.value="",v("Comment posted","success"),(await L(s.id))(e))}),e.querySelectorAll(".subtask-cb").forEach(n=>{n.addEventListener("change",async()=>{await E(n.dataset.subtaskId,{status:n.checked?"completed":"todo"})})}),(b=document.getElementById("add-subtask-btn"))==null||b.addEventListener("click",async()=>{const n=document.getElementById("subtask-input"),k=n.value.trim();k&&(await A(s.project_id,{title:k,parent_id:s.id,task_type:s.task_type||"task",status:"todo"}),n.value="",v("Subtask added","success"),(await L(s.id))(e))}),e.querySelectorAll("[data-nav]").forEach(n=>{n.addEventListener("click",k=>{k.preventDefault();const h=n.dataset.nav;h==="projects"?x(()=>import("./main-CxzuflVX.js").then(f=>f.r),__vite__mapDeps([0,1])).then(f=>f.router.navigate("/projects")):h.startsWith("project-")&&x(()=>import("./main-CxzuflVX.js").then(f=>f.r),__vite__mapDeps([0,1])).then(f=>f.router.navigate(`/projects/${h.replace("project-","")}`))})}),(g=document.getElementById("add-subtask-btn"))==null||g.removeEventListener("click",()=>{}),e.querySelectorAll(".dep-remove-btn").forEach(n=>{n.addEventListener("click",async k=>{if(k.stopPropagation(),!!confirm("Remove this dependency?"))try{await T.delete(`/tasks/${n.dataset.depTaskId}/dependencies/${n.dataset.depOnId}`),v("Dependency removed","success"),(await L(s.id))(e)}catch{v("Failed to remove dependency","error")}})}),(w=document.getElementById("add-dep-btn"))==null||w.addEventListener("click",async()=>{const{openModal:n,closeModal:k}=await x(async()=>{const{openModal:f,closeModal:_}=await import("./modal-jGhccxZ4.js");return{openModal:f,closeModal:_}},[]);let h=[];try{h=((await T.get(`/projects/${s.project_id}/tasks`,{per_page:100})).data||[]).filter(_=>_.id!==s.id)}catch{}n({title:"Add Dependency",subtitle:`What does "${s.title}" depend on?`,body:`
        <form id="dep-form">
          <div class="form-group">
            <label class="form-label">This task is blocked by:</label>
            <select name="depends_on_id" class="form-input form-select" required id="dep-task-select">
              <option value="">— Select a task —</option>
              ${h.map(f=>`<option value="${f.id}">${f.title} (${f.status})</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Dependency Type</label>
            <select name="type" class="form-input form-select">
              <option value="finish_to_start">Finish to Start (most common)</option>
              <option value="start_to_start">Start to Start</option>
              <option value="finish_to_finish">Finish to Finish</option>
              <option value="start_to_finish">Start to Finish</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid #e2e8f0">
            <button type="button" class="btn btn-ghost" id="dep-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary" id="dep-submit">Add Dependency</button>
          </div>
        </form>`}),document.getElementById("dep-cancel").addEventListener("click",k),document.getElementById("dep-form").addEventListener("submit",async f=>{f.preventDefault();const _=document.getElementById("dep-submit");_.disabled=!0,_.textContent="Adding…";const B=Object.fromEntries(new FormData(f.target));if(!B.depends_on_id){v("Select a task","error"),_.disabled=!1,_.textContent="Add Dependency";return}try{await T.post(`/tasks/${s.id}/dependencies`,{depends_on_id:parseInt(B.depends_on_id),type:B.type}),k(),v("Dependency added","success"),(await L(s.id))(e)}catch{_.disabled=!1,_.textContent="Add Dependency"}})}),(j=document.getElementById("file-upload"))==null||j.addEventListener("change",async n=>{const{uploadAttachment:k}=await x(async()=>{const{uploadAttachment:_}=await import("./tasks-qIqnclG-.js");return{uploadAttachment:_}},__vite__mapDeps([3,0,1])),h=n.target.files[0];if(!h)return;const f=new FormData;f.append("file",h),await k(s.id,f),v("File uploaded","success"),(await L(s.id))(e)}),e.querySelectorAll(".download-link").forEach(n=>{n.addEventListener("click",async k=>{k.preventDefault();const{downloadAttachment:h}=await x(async()=>{const{downloadAttachment:_}=await import("./tasks-qIqnclG-.js");return{downloadAttachment:_}},__vite__mapDeps([3,0,1])),{url:f}=await h(n.dataset.id);window.open(f,"_blank")})}),e.querySelectorAll(".rv-remove").forEach(n=>{n.addEventListener("click",async k=>{k.stopPropagation();const h=n.dataset.reviewerId;if(confirm("Remove this reviewer?"))try{await T.delete(`/tasks/${s.id}/reviewers/${h}`),v("Reviewer removed","success"),(await L(s.id))(e)}catch{v("Failed to remove reviewer","error")}})}),(M=document.getElementById("add-reviewer-btn"))==null||M.addEventListener("click",async()=>{var _,B;const{openModal:n,closeModal:k}=await x(async()=>{const{openModal:$,closeModal:S}=await import("./modal-jGhccxZ4.js");return{openModal:$,closeModal:S}},[]);let h=[];try{const $=await T.get("/users/search?per_page=50");h=Array.isArray($)?$:$.data||[]}catch{}const f=(s.reviewers||[]).map($=>$.id);h=h.filter($=>!f.includes($.id)),n({title:"Add Reviewers",body:`
        <div class="form-group">
          <label class="form-label">Select reviewers:</label>
          <div style="max-height:250px;overflow-y:auto;display:flex;flex-direction:column;gap:4px" id="rv-user-list">
            ${h.map($=>`
              <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;font-size:13px" class="rv-user-opt">
                <input type="checkbox" value="${$.id}"/>
                <img src="${$.avatar_url}" style="width:24px;height:24px;border-radius:50%;object-fit:cover"/>
                ${$.name}
              </label>`).join("")}
            ${h.length===0?'<span style="color:#94a3b8;font-size:13px">No available users</span>':""}
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid #e2e8f0">
          <button class="btn btn-ghost" id="rv-cancel">Cancel</button>
          <button class="btn btn-primary" id="rv-submit">Add Reviewers</button>
        </div>`}),(_=document.getElementById("rv-cancel"))==null||_.addEventListener("click",k),(B=document.getElementById("rv-submit"))==null||B.addEventListener("click",async()=>{const $=[...document.querySelectorAll("#rv-user-list input:checked")].map(S=>parseInt(S.value));if(!$.length){v("Select at least one reviewer","error");return}try{await T.post(`/tasks/${s.id}/reviewers`,{reviewer_ids:$}),k(),v("Reviewers added","success"),(await L(s.id))(e)}catch{v("Failed to add reviewers","error")}})}),(N=document.getElementById("rv-approve-btn"))==null||N.addEventListener("click",async()=>{const n=prompt("Approval note (optional):")||"";try{await T.post(`/tasks/${s.id}/review`,{status:"approved",note:n}),v("Review approved","success"),(await L(s.id))(e)}catch{v("Failed to submit review","error")}}),(V=document.getElementById("rv-reject-btn"))==null||V.addEventListener("click",async()=>{const n=prompt("Reason for rejection:");if(n!==null)try{await T.post(`/tasks/${s.id}/review`,{status:"rejected",note:n}),v("Review rejected","success"),(await L(s.id))(e)}catch{v("Failed to submit review","error")}})}async function rt(e,s=null,t=null){let c=[];if(!s)try{const{getProjects:b}=await x(async()=>{const{getProjects:w}=await import("./projects-8oxmbYM-.js");return{getProjects:w}},__vite__mapDeps([5,0,1]));c=(await b({per_page:100})).data||[]}catch{}const r=s?"":`
    <div class="form-group">
      <label class="form-label">Project *</label>
      <select name="project_id" id="new-task-project" class="form-input form-select" required>
        <option value="">— Select a project —</option>
        ${c.map(b=>`<option value="${b.id}">${b.name}</option>`).join("")}
      </select>
    </div>`,i=t||{},u=b=>["low","medium","high","urgent"].map(g=>`<option value="${g}"${(i.priority||"medium")===g?" selected":""}>${{low:"🟢 Low",medium:"🔵 Medium",high:"🟠 High",urgent:"🔴 Urgent"}[g]}</option>`).join(""),m=b=>["backlog","todo","in_progress","working_on","review"].map(g=>`<option value="${g}"${(i.status||"todo")===g?" selected":""}>${{backlog:"Backlog",todo:"To Do",in_progress:"In Progress",working_on:"Working On",review:"Review"}[g]}</option>`).join("");et({title:t?"✨ AI Task — Confirm & Create":"Create Task",subtitle:s?"Add a new task to this project":"Add a task to any project",body:`
      <form id="new-task-form">

        ${r}

        <div class="form-group">
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" placeholder="What needs to be done?" required autofocus value="${(i.title||"").replace(/"/g,"&quot;")}"/>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Add details, steps, or context…">${i.description||""}</textarea>
        </div>

        <div class="form-sep">Details</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select name="task_type" class="form-input form-select" required>
              <option value="task" ${(i.task_type||"task")==="task"?"selected":""}>📋 Task</option>
              <option value="feature" ${i.task_type==="feature"?"selected":""}>✨ Feature</option>
              <option value="bug" ${i.task_type==="bug"?"selected":""}>🐛 Bug</option>
              <option value="improvement" ${i.task_type==="improvement"?"selected":""}>🔧 Improvement</option>
              <option value="story" ${i.task_type==="story"?"selected":""}>📖 Story</option>
              <option value="spike" ${i.task_type==="spike"?"selected":""}>🔬 Spike</option>
              <option value="chore" ${i.task_type==="chore"?"selected":""}>🧹 Chore</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-input form-select">${u()}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input form-select">${m()}</select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${i.due_date||""}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Estimated Time (min)</label>
            <input type="number" name="estimated_minutes" class="form-input" placeholder="e.g. 60" min="1" value="${i.estimated_minutes||""}"/>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Score (Story Points)</label>
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
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input" value="${i.start_date||""}"/>
          </div>
        </div>

        <div class="form-sep">Timeboxing</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Timebox Start</label>
            <input type="datetime-local" name="timebox_start" class="form-input" id="tb-start"/>
          </div>
          <div class="form-group">
            <label class="form-label">Timebox End</label>
            <input type="datetime-local" name="timebox_end" class="form-input" id="tb-end"/>
          </div>
        </div>
        <div id="timebox-conflict" class="hidden" style="font-size:12px;color:#dc2626;font-weight:600;padding:6px 10px;background:#fef2f2;border-radius:6px;margin-top:4px"></div>

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
      </form>`,wide:!0});const a=[],d=[],o=[];D("assignee-search","assignee-dropdown","assignee-chips","assignee-ids",a,"user"),D("watcher-search","watcher-dropdown","watcher-chips","watcher-ids",d,"user"),D("tag-search","tag-dropdown","tag-chips","tag-ids",o,"tag");const l=document.getElementById("tb-start"),p=document.getElementById("tb-end"),y=document.getElementById("timebox-conflict");if(l&&p&&y){const b=async()=>{if(!l.value||!p.value){y.classList.add("hidden");return}try{const g=await T.post("/timebox/validate",{timebox_start:l.value,timebox_end:p.value});g.has_conflicts?(y.innerHTML="⚠ "+g.conflicts.map(w=>w.message).join("<br>⚠ "),y.classList.remove("hidden")):y.classList.add("hidden")}catch{y.classList.add("hidden")}};l.addEventListener("change",b),p.addEventListener("change",b)}document.getElementById("cancel-task").addEventListener("click",U),document.getElementById("new-task-form").addEventListener("submit",async b=>{b.preventDefault();const g=document.getElementById("submit-task");g.disabled=!0,g.textContent="Creating…";const w=Object.fromEntries(new FormData(b.target));Object.keys(w).forEach(M=>{w[M]===""&&delete w[M]}),w.assignee_ids=a,w.watcher_ids=d,w.tag_ids=o;const j=s||w.project_id;if(!j){v("Please select a project","error"),g.disabled=!1,g.textContent="Create Task";return}delete w.project_id;try{await A(j,w),U(),v("Task created!","success"),s&&e?R(e,s):e&&location.hash==="#/my-tasks"&&G(e)}catch{g.disabled=!1,g.textContent="Create Task"}})}let J={};function D(e,s,t,c,r,i){const u=document.getElementById(e),m=document.getElementById(s),a=document.getElementById(t),d=document.getElementById(c);u&&(u.addEventListener("input",()=>{clearTimeout(J[e]);const o=u.value.trim();if(!o){m.style.display="none";return}J[e]=setTimeout(async()=>{try{const{api:l}=await x(async()=>{const{api:g}=await import("./main-CxzuflVX.js").then(w=>w.c);return{api:g}},__vite__mapDeps([0,1])),p=i==="user"?`/users/search?q=${encodeURIComponent(o)}&per_page=8`:`/tags?q=${encodeURIComponent(o)}&per_page=10`,y=await l.get(p.split("?")[0],{q:o,per_page:i==="user"?8:10}),b=y.data||y||[];ct(b,m,a,d,r,u,i)}catch{}},280)}),document.addEventListener("mousedown",o=>{!u.contains(o.target)&&!m.contains(o.target)&&(m.style.display="none")}))}function ct(e,s,t,c,r,i,u){var m,a;if(!e.length){s.innerHTML=u==="tag"&&i.value.trim()?`<div class="picker-item" id="create-tag-item" style="color:#6366f1;font-weight:600">+ Create "${i.value.trim()}"</div>`:'<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">No results</div>',s.style.display="block",u==="tag"&&((m=document.getElementById("create-tag-item"))==null||m.addEventListener("click",async()=>{try{const{api:d}=await x(async()=>{const{api:l}=await import("./main-CxzuflVX.js").then(p=>p.c);return{api:l}},__vite__mapDeps([0,1])),o=await d.post("/tags",{name:i.value.trim(),color:"#6366f1"});r.includes(o.id)||(r.push(o.id),c.value=JSON.stringify(r),C(t,o.id,o.name,o.color,r,c,u)),s.style.display="none",i.value=""}catch{}}));return}s.innerHTML=e.map(d=>{const o=d.id,l=d.name,p=r.includes(o);if(u==="user"){const y=d.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(l)}&size=24&background=6366f1&color=fff`;return`<div class="picker-item ${p?"selected":""}" data-id="${o}" data-name="${l}" data-avatar="${y}">
        <img src="${y}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0"/>
        <span style="flex:1">${l}</span>
        <span style="font-size:11.5px;color:#94a3b8">${d.email||""}</span>
        ${p?'<span style="color:#6366f1;font-size:14px;font-weight:700">✓</span>':""}
      </div>`}else return`<div class="picker-item ${p?"selected":""}" data-id="${o}" data-name="${l}" data-color="${d.color||"#6366f1"}">
        <span style="width:10px;height:10px;border-radius:50%;background:${d.color||"#6366f1"};flex-shrink:0;display:inline-block"></span>
        <span>${l}</span>
        ${p?'<span style="color:#6366f1;margin-left:auto">✓</span>':""}
      </div>`}).join(""),s.style.display="block",u==="tag"&&i.value.trim()&&(s.innerHTML+=`<div class="picker-item" id="create-tag-item-alt" style="color:#6366f1;font-weight:600;border-top:1px solid #e2e8f0;margin-top:2px;padding-top:8px">+ Create "${i.value.trim()}"</div>`,(a=document.getElementById("create-tag-item-alt"))==null||a.addEventListener("click",async()=>{try{const{api:d}=await x(async()=>{const{api:l}=await import("./main-CxzuflVX.js").then(p=>p.c);return{api:l}},__vite__mapDeps([0,1])),o=await d.post("/tags",{name:i.value.trim(),color:"#6366f1"});r.includes(o.id)||(r.push(o.id),c.value=JSON.stringify(r),C(t,o.id,o.name,o.color,r,c,u)),s.style.display="none",i.value=""}catch{}})),s.querySelectorAll("[data-id]").forEach(d=>{d.addEventListener("click",()=>{const o=parseInt(d.dataset.id);r.includes(o)||(r.push(o),c.value=JSON.stringify(r),C(t,o,d.dataset.name,d.dataset.color,r,c,u)),s.style.display="none",i.value=""})})}function C(e,s,t,c,r,i,u){const m=document.createElement("div");if(m.className="picker-chip",m.dataset.id=s,u==="user"){const a=`https://ui-avatars.com/api/?name=${encodeURIComponent(t)}&size=18&background=6366f1&color=fff`;m.innerHTML=`<img src="${a}" style="width:18px;height:18px;border-radius:50%;object-fit:cover"/><span>${t}</span><span class="rm">×</span>`}else m.innerHTML=`<span style="width:8px;height:8px;border-radius:50%;background:${c||"#6366f1"};display:inline-block"></span><span>${t}</span><span class="rm">×</span>`;m.querySelector(".rm").addEventListener("click",()=>{const a=r.indexOf(s);a>-1&&r.splice(a,1),i.value=JSON.stringify(r),m.remove()}),e.appendChild(m)}export{rt as openNewTaskModal,G as renderMyTasks,L as renderTaskDetail,R as renderTaskList};
