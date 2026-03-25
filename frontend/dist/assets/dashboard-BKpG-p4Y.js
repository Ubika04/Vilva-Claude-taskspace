const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{a as y,_ as g}from"./main-CxzuflVX.js";import{b as u,s as b,i as $,f as v,p as w}from"./helpers-ByTbCZyC.js";function j(){return localStorage.getItem("vilva_ui_theme")||""}function T(a,e){const l=a.my_tasks||[],i=a.overdue||[],t=a.project_progress||[],r=a.weekly_stats||[],s=r.reduce((n,o)=>n+(o.seconds||0),0),d=r.reduce((n,o)=>n+(o.tasks_done||0),0);switch(e){case"compact":return E(l,i,t,r,s,d);case"terminal":return S(l,i,t,r,s,d);case"flat":return A(l,i,t,r,s,d);case"brutalist":return D(l,i,t,r,s,d);case"glass":return O(l,i,t,r,s,d);default:return null}}function E(a,e,l,i,t,r){return`
    <div class="dc-strip">
      <span class="dc-stat">${a.length} active</span>
      <span class="dc-stat dc-red">${e.length} overdue</span>
      <span class="dc-stat dc-green">${r} done</span>
      <span class="dc-stat dc-purple">${u(t)}</span>
    </div>
    <div class="dc-table-wrap">
      <table class="dc-table">
        <thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
        <tbody>
          ${a.map(s=>{var d;return`<tr class="dash-task-row" data-task-id="${s.id}">
            <td class="dc-task-title">${s.title}</td>
            <td class="dc-muted">${((d=s.project)==null?void 0:d.name)||"—"}</td>
            <td>${b(s.status)}</td>
            <td>${w(s.priority)}</td>
            <td class="dc-muted ${$(s.due_date,s.status)?"dc-red":""}">${s.due_date?v(s.due_date):"—"}</td>
          </tr>`}).join("")||'<tr><td colspan="5" class="dc-empty">No tasks</td></tr>'}
        </tbody>
      </table>
    </div>
    ${e.length>0?`<div class="dc-warn">⚠ ${e.length} overdue task${e.length>1?"s":""}</div>`:""}
    <div class="dc-projects">
      ${l.map(s=>`<div class="dc-proj"><span style="color:${s.color}">●</span> ${s.name} <span class="dc-muted">${s.progress}%</span></div>`).join("")}
    </div>`}function S(a,e,l,i,t,r){const s="─".repeat(56);return`
    <pre class="term-dash">
┌${s}┐
│ VILVA TASKSPACE — DASHBOARD                            │
├${s}┤
│ Active: ${String(a.length).padEnd(6)} Overdue: ${String(e.length).padEnd(6)} Done: ${String(r).padEnd(6)} Time: ${u(t).padEnd(8)}│
├${s}┤
│ TASKS                                                  │
├${s}┤
${a.slice(0,12).map(d=>{const n=d.title.slice(0,30).padEnd(30),o=(d.status||"").padEnd(12),p=(d.priority||"").padEnd(8);return`│ ${n} ${o} ${p}   │`}).join(`
`)||"│ (no tasks)                                             │"}
├${s}┤
│ PROJECTS                                               │
├${s}┤
${l.map(d=>{const n="█".repeat(Math.round(d.progress/5))+"░".repeat(20-Math.round(d.progress/5));return`│ ${d.name.slice(0,20).padEnd(20)} [${n}] ${String(d.progress).padStart(3)}% │`}).join(`
`)||"│ (no projects)                                          │"}
└${s}┘</pre>
    <div class="term-tasks">
      ${a.map(d=>`<div class="term-row dash-task-row" data-task-id="${d.id}">
        <span class="term-arrow">></span>
        <span class="term-title">${d.title}</span>
        <span class="term-meta">[${d.status}]</span>
        <span class="term-meta">{${d.priority}}</span>
        ${d.due_date?`<span class="term-date">${v(d.due_date)}</span>`:""}
      </div>`).join("")}
    </div>`}function A(a,e,l,i,t,r){return`
    <div class="flat-stats-bar">
      <div class="flat-stat"><strong>${a.length}</strong> Active Tasks</div>
      <div class="flat-stat flat-red"><strong>${e.length}</strong> Overdue</div>
      <div class="flat-stat flat-green"><strong>${r}</strong> Done This Week</div>
      <div class="flat-stat"><strong>${u(t)}</strong> Tracked</div>
    </div>
    <div class="flat-two-col">
      <div>
        <h2 class="flat-h2">My Tasks</h2>
        <div class="flat-task-list">
          ${a.map(s=>{var d,n;return`<div class="flat-task-row dash-task-row" data-task-id="${s.id}">
            <span class="flat-dot" style="background:${{low:"#94a3b8",medium:"#3b82f6",high:"#f59e0b",urgent:"#dc2626"}[s.priority]||"#94a3b8"}"></span>
            <span class="flat-task-title">${s.title}</span>
            <span class="flat-task-meta">${((d=s.project)==null?void 0:d.name)||""}</span>
            <span class="flat-task-status">${(n=s.status)==null?void 0:n.replace("_"," ")}</span>
            ${s.due_date?`<span class="flat-task-due ${$(s.due_date,s.status)?"overdue":""}">${v(s.due_date)}</span>`:""}
          </div>`}).join("")||'<div class="flat-empty">No tasks assigned</div>'}
        </div>
      </div>
      <div>
        <h2 class="flat-h2">Projects</h2>
        ${l.map(s=>`<div class="flat-proj-row">
          <span class="flat-proj-name">${s.name}</span>
          <div class="flat-prog-bar"><div class="flat-prog-fill" style="width:${s.progress}%;background:${s.color}"></div></div>
          <span class="flat-prog-pct">${s.progress}%</span>
        </div>`).join("")||'<div class="flat-empty">No projects</div>'}
        ${e.length>0?`<h2 class="flat-h2 flat-red" style="margin-top:20px">⚠ Overdue (${e.length})</h2>
          ${e.slice(0,5).map(s=>`<div class="flat-task-row dash-overdue-row" data-task-id="${s.id}">
            <span class="flat-dot" style="background:#dc2626"></span>
            <span class="flat-task-title">${s.title}</span>
            <span class="flat-task-due overdue">${v(s.due_date)}</span>
          </div>`).join("")}`:""}
      </div>
    </div>`}function D(a,e,l,i,t,r){return`
    <div class="brut-stats">
      <div class="brut-stat"><div class="brut-stat-num">${a.length}</div><div class="brut-stat-lbl">TASKS</div></div>
      <div class="brut-stat brut-red"><div class="brut-stat-num">${e.length}</div><div class="brut-stat-lbl">OVERDUE</div></div>
      <div class="brut-stat brut-green"><div class="brut-stat-num">${r}</div><div class="brut-stat-lbl">DONE</div></div>
      <div class="brut-stat"><div class="brut-stat-num">${u(t)}</div><div class="brut-stat-lbl">TRACKED</div></div>
    </div>
    <div class="brut-section">
      <div class="brut-heading">MY TASKS</div>
      ${a.map(s=>{var d,n;return`<div class="brut-task dash-task-row" data-task-id="${s.id}">
        <div class="brut-task-pri" style="background:${{urgent:"#dc2626",high:"#f59e0b",medium:"#3b82f6",low:"#94a3b8"}[s.priority]}"></div>
        <div class="brut-task-body">
          <strong>${s.title}</strong>
          <span>${((d=s.project)==null?void 0:d.name)||""} · ${(n=s.status)==null?void 0:n.replace("_"," ")}</span>
        </div>
        ${s.due_date?`<div class="brut-task-due ${$(s.due_date,s.status)?"brut-red":""}">${v(s.due_date)}</div>`:""}
      </div>`}).join("")||'<div class="brut-empty">NO TASKS</div>'}
    </div>
    <div class="brut-section">
      <div class="brut-heading">PROJECTS</div>
      <div class="brut-proj-grid">
        ${l.map(s=>`<div class="brut-proj">
          <div class="brut-proj-bar" style="background:${s.color}"></div>
          <div class="brut-proj-name">${s.name}</div>
          <div class="brut-proj-pct">${s.progress}%</div>
        </div>`).join("")||'<div class="brut-empty">NO PROJECTS</div>'}
      </div>
    </div>`}function O(a,e,l,i,t,r){return`
    <div class="glass-stats">
      <div class="glass-stat"><div class="glass-stat-icon">📋</div><div class="glass-stat-val">${a.length}</div><div class="glass-stat-lbl">Active</div></div>
      <div class="glass-stat glass-warn"><div class="glass-stat-icon">⚠️</div><div class="glass-stat-val">${e.length}</div><div class="glass-stat-lbl">Overdue</div></div>
      <div class="glass-stat glass-ok"><div class="glass-stat-icon">✅</div><div class="glass-stat-val">${r}</div><div class="glass-stat-lbl">Done</div></div>
      <div class="glass-stat"><div class="glass-stat-icon">⏱</div><div class="glass-stat-val">${u(t)}</div><div class="glass-stat-lbl">Tracked</div></div>
    </div>
    <div class="glass-grid">
      <div class="glass-card glass-tasks-card">
        <h3>My Tasks</h3>
        ${a.slice(0,8).map(s=>`<div class="glass-task dash-task-row" data-task-id="${s.id}">
          <div class="glass-task-left">
            <div class="glass-pri-dot" style="background:${{urgent:"#dc2626",high:"#f59e0b",medium:"#6366f1",low:"#94a3b8"}[s.priority]}"></div>
            <span>${s.title}</span>
          </div>
          <div class="glass-task-right">
            ${b(s.status)}
            ${s.due_date?`<span class="glass-due ${$(s.due_date,s.status)?"overdue":""}">${v(s.due_date)}</span>`:""}
          </div>
        </div>`).join("")||'<div class="glass-empty">No tasks</div>'}
      </div>
      <div class="glass-card glass-right-col">
        <h3>Projects</h3>
        ${l.map(s=>`<div class="glass-proj">
          <div class="glass-proj-info"><span class="glass-proj-dot" style="background:${s.color}"></span>${s.name}</div>
          <div class="glass-prog-wrap"><div class="glass-prog" style="width:${s.progress}%;background:${s.color}"></div></div>
          <span class="glass-pct">${s.progress}%</span>
        </div>`).join("")||'<div class="glass-empty">No projects</div>'}
        ${e.length>0?`<div class="glass-warn-banner">⚠ ${e.length} overdue</div>`:""}
      </div>
    </div>`}async function L(a){var p;a.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let e;try{e=await y.get("/dashboard")}catch{a.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load dashboard</h3><p>Check that the server is running on port 8000</p></div>';return}const l=j(),i=T(e,l);if(i){a.innerHTML=i,f(a);return}const t=e.my_tasks||[],r=e.overdue||[],s=e.project_progress||[],d=e.weekly_stats||[],n=d.reduce((c,h)=>c+(h.seconds||0),0),o=d.reduce((c,h)=>c+(h.tasks_done||0),0);a.innerHTML=`
    <!-- Stat strip -->
    <div class="dash-stats">
      ${m("📋","stat-icon-blue",t.length,"Active Tasks")}
      ${m("⚠️","stat-icon-red",r.length,"Overdue")}
      ${m("✅","stat-icon-green",o,"Done This Week")}
      ${m("⏱","stat-icon-purple",u(n),"Tracked This Week")}
    </div>

    <div class="dash-grid">
      <!-- Left column -->
      <div class="dash-col">

        <div class="card">
          <div class="card-header">
            <h3>My Tasks</h3>
            <a href="#" class="btn btn-ghost btn-sm" id="dash-view-all-tasks">View all →</a>
          </div>
          <div class="dash-card-rows">
            ${t.length===0?'<div class="widget-empty"><div class="widget-empty-icon">🎯</div>No active tasks assigned to you</div>':t.slice(0,8).map(c=>P(c)).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 style="color:var(--red)">⚠ Overdue</h3>
            ${r.length>0?`<span class="badge-count">${r.length}</span>`:""}
          </div>
          <div class="dash-card-rows">
            ${r.length===0?'<div class="widget-empty"><div class="widget-empty-icon">🎉</div>Nothing overdue — great work!</div>':r.slice(0,6).map(c=>R(c)).join("")}
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="dash-col">

        ${e.active_timer?`
        <div class="timer-widget-card">
          <div class="timer-widget-label">Timer Running</div>
          <div class="timer-widget-task">${((p=e.active_timer.task)==null?void 0:p.title)||"Unknown Task"}</div>
          <div class="timer-widget-clock" id="dash-timer-clock">00:00:00</div>
          <button class="timer-widget-stop" id="dash-stop-timer" data-task-id="${e.active_timer.task_id}">■ Stop Timer</button>
        </div>`:""}

        <div class="card">
          <div class="card-header"><h3>Project Progress</h3></div>
          <div class="card-body">
            ${s.length===0?'<div class="widget-empty">No active projects</div>':s.map(c=>`
                <div class="proj-prog-row">
                  <div class="proj-prog-top">
                    <span class="proj-prog-dot" style="background:${c.color}"></span>
                    <span class="proj-prog-name">${c.name}</span>
                    <span class="proj-prog-stat">${c.done}/${c.total}</span>
                  </div>
                  <div class="pbar-wrap"><div class="pbar" style="width:${c.progress}%"></div></div>
                  <div class="proj-prog-pct">${c.progress}%</div>
                </div>`).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>This Week</h3></div>
          <div class="card-body">
            ${d.length===0?'<div class="widget-empty">No activity this week</div>':`<div class="bar-chart">
                  ${d.map(c=>{const h=Math.max(4,Math.min(100,c.seconds/28800*100)),k=new Date(c.date+"T12:00:00").toLocaleDateString("en",{weekday:"short"});return`<div class="bar-col">
                      <div class="bar-tasks">${c.tasks_done>0?c.tasks_done:""}</div>
                      <div class="bar-fill" style="height:${h}%" title="${u(c.seconds)}"></div>
                      <div class="bar-day">${k}</div>
                    </div>`}).join("")}
                </div>
                <div class="chart-note">Bar height = hours tracked · Numbers = tasks done</div>`}
          </div>
        </div>

      </div>
    </div>
  `,f(a)}function f(a){var e,l;a.querySelectorAll(".dash-task-row[data-task-id], .task-list-item[data-task-id]").forEach(i=>{i.addEventListener("click",()=>{g(()=>import("./main-CxzuflVX.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate(`/tasks/${i.dataset.taskId}`))})}),a.querySelectorAll(".dash-overdue-row[data-task-id]").forEach(i=>{i.addEventListener("click",()=>{g(()=>import("./main-CxzuflVX.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate(`/tasks/${i.dataset.taskId}`))})}),a.querySelectorAll(".project-card[data-id]").forEach(i=>{i.addEventListener("click",()=>{g(()=>import("./main-CxzuflVX.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate(`/projects/${i.dataset.id}`))})}),a.querySelectorAll(".dash-timer-btn").forEach(i=>{i.addEventListener("click",async t=>{var n,o,p;t.stopPropagation();const r=i.dataset.timerTaskId;if(!r||r==="undefined")return;const s=((n=i.closest("[data-task-title]"))==null?void 0:n.dataset.taskTitle)||((p=(o=i.closest(".dash-task-row"))==null?void 0:o.querySelector(".dash-task-name"))==null?void 0:p.textContent)||null,d=i.classList.contains("running");i.disabled=!0;try{const{handleTimerAction:c}=await g(async()=>{const{handleTimerAction:k}=await import("./main-CxzuflVX.js").then(_=>_.t);return{handleTimerAction:k}},__vite__mapDeps([0,1]));await c(r,d?"stop":"start",s)}finally{i.disabled=!1}})}),(e=document.getElementById("dash-view-all-tasks"))==null||e.addEventListener("click",i=>{i.preventDefault(),g(()=>import("./main-CxzuflVX.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate("/my-tasks"))}),(l=document.getElementById("dash-stop-timer"))==null||l.addEventListener("click",async function(){const i=this.dataset.taskId;this.disabled=!0;try{const{handleTimerAction:t}=await g(async()=>{const{handleTimerAction:r}=await import("./main-CxzuflVX.js").then(s=>s.t);return{handleTimerAction:r}},__vite__mapDeps([0,1]));await t(i,"stop"),L(a)}catch{this.disabled=!1}})}function m(a,e,l,i){return`
    <div class="stat-card">
      <div class="stat-icon ${e}">${a}</div>
      <div class="stat-info">
        <span class="stat-val">${l}</span>
        <span class="stat-label">${i}</span>
      </div>
    </div>`}function P(a){const e=$(a.due_date,a.status),l=a.status!=="completed";return`
    <div class="dash-task-row" data-task-id="${a.id}">
      <div class="dash-task-left">
        ${b(a.status)}
        <span class="dash-task-title">${a.title}</span>
      </div>
      <div class="dash-task-right">
        ${a.project?`<span class="dash-task-project" style="background:${a.project.color}18;color:${a.project.color}">${a.project.name}</span>`:""}
        ${a.due_date?`<span class="dash-task-due ${e?"is-overdue":""}">📅 ${v(a.due_date)}</span>`:""}
        ${w(a.priority)}
        ${l&&a.id?`<button class="dash-timer-btn" data-timer-task-id="${a.id}" title="Start timer">▶</button>`:""}
      </div>
    </div>`}function R(a){return`
    <div class="dash-overdue-row" data-task-id="${a.id}">
      <div class="dash-overdue-left">
        <span class="dash-overdue-dot"></span>
        <span class="dash-overdue-title">${a.title}</span>
      </div>
      <div class="dash-overdue-right">
        ${a.project?`<span class="dash-overdue-proj">${a.project.name}</span>`:""}
        <span class="dash-overdue-date">📅 ${v(a.due_date)}</span>
      </div>
    </div>`}export{L as renderDashboard};
