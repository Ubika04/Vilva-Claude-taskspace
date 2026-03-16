const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxoKqBs3.js","assets/main-CFH2NeAm.css"])))=>i.map(i=>d[i]);
import{a as $,_ as n,s as w}from"./main-CxoKqBs3.js";import{b as u,i as _,s as y,f as m,p as b}from"./helpers-BEw8rxzH.js";async function j(a){var v,p,h;a.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let d;try{d=await $.get("/dashboard")}catch{a.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load dashboard</h3><p>Check that the server is running on port 8000</p></div>';return}const i=d.my_tasks||[],e=d.overdue||[],l=d.project_progress||[],r=d.weekly_stats||[],g=r.reduce((s,t)=>s+(t.seconds||0),0),k=r.reduce((s,t)=>s+(t.tasks_done||0),0);a.innerHTML=`
    <!-- Stat strip -->
    <div class="dash-stats">
      ${c("📋","stat-icon-blue",i.length,"Active Tasks")}
      ${c("⚠️","stat-icon-red",e.length,"Overdue")}
      ${c("✅","stat-icon-green",k,"Done This Week")}
      ${c("⏱","stat-icon-purple",u(g),"Tracked This Week")}
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
            ${i.length===0?'<div class="widget-empty"><div class="widget-empty-icon">🎯</div>No active tasks assigned to you</div>':i.slice(0,8).map(s=>T(s)).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 style="color:var(--red)">⚠ Overdue</h3>
            ${e.length>0?`<span class="badge-count">${e.length}</span>`:""}
          </div>
          <div class="dash-card-rows">
            ${e.length===0?'<div class="widget-empty"><div class="widget-empty-icon">🎉</div>Nothing overdue — great work!</div>':e.slice(0,6).map(s=>f(s)).join("")}
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="dash-col">

        ${d.active_timer?`
        <div class="timer-widget-card">
          <div class="timer-widget-label">Timer Running</div>
          <div class="timer-widget-task">${((v=d.active_timer.task)==null?void 0:v.title)||"Unknown Task"}</div>
          <div class="timer-widget-clock" id="dash-timer-clock">00:00:00</div>
          <button class="timer-widget-stop" id="dash-stop-timer" data-task-id="${d.active_timer.task_id}">■ Stop Timer</button>
        </div>`:""}

        <div class="card">
          <div class="card-header"><h3>Project Progress</h3></div>
          <div class="card-body">
            ${l.length===0?'<div class="widget-empty">No active projects</div>':l.map(s=>`
                <div class="proj-prog-row">
                  <div class="proj-prog-top">
                    <span class="proj-prog-dot" style="background:${s.color}"></span>
                    <span class="proj-prog-name">${s.name}</span>
                    <span class="proj-prog-stat">${s.done}/${s.total}</span>
                  </div>
                  <div class="pbar-wrap"><div class="pbar" style="width:${s.progress}%"></div></div>
                  <div class="proj-prog-pct">${s.progress}%</div>
                </div>`).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>This Week</h3></div>
          <div class="card-body">
            ${r.length===0?'<div class="widget-empty">No activity this week</div>':`<div class="bar-chart">
                  ${r.map(s=>{const t=Math.max(4,Math.min(100,s.seconds/28800*100)),o=new Date(s.date+"T12:00:00").toLocaleDateString("en",{weekday:"short"});return`<div class="bar-col">
                      <div class="bar-tasks">${s.tasks_done>0?s.tasks_done:""}</div>
                      <div class="bar-fill" style="height:${t}%" title="${u(s.seconds)}"></div>
                      <div class="bar-day">${o}</div>
                    </div>`}).join("")}
                </div>
                <div class="chart-note">Bar height = hours tracked · Numbers = tasks done</div>`}
          </div>
        </div>

      </div>
    </div>
  `,a.querySelectorAll("[data-task-id]").forEach(s=>{s.addEventListener("click",()=>{n(()=>import("./main-CxoKqBs3.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate(`/tasks/${s.dataset.taskId}`))})}),(p=document.getElementById("dash-view-all-tasks"))==null||p.addEventListener("click",s=>{s.preventDefault(),n(()=>import("./main-CxoKqBs3.js").then(t=>t.r),__vite__mapDeps([0,1])).then(t=>t.router.navigate("/my-tasks"))}),(h=document.getElementById("dash-stop-timer"))==null||h.addEventListener("click",async function(){try{const{stopTimer:s}=await n(async()=>{const{stopTimer:t}=await import("./main-CxoKqBs3.js").then(o=>o.t);return{stopTimer:t}},__vite__mapDeps([0,1]));await s(this.dataset.taskId),w("Timer stopped","success"),j(a)}catch{}})}function c(a,d,i,e){return`
    <div class="stat-card">
      <div class="stat-icon ${d}">${a}</div>
      <div class="stat-info">
        <span class="stat-val">${i}</span>
        <span class="stat-label">${e}</span>
      </div>
    </div>`}function T(a){const d=_(a.due_date,a.status);return`
    <div class="dash-task-row" data-task-id="${a.id}">
      <div class="dash-task-left">
        ${y(a.status)}
        <span class="dash-task-title">${a.title}</span>
      </div>
      <div class="dash-task-right">
        ${a.project?`<span class="dash-task-project" style="background:${a.project.color}18;color:${a.project.color}">${a.project.name}</span>`:""}
        ${a.due_date?`<span class="dash-task-due ${d?"is-overdue":""}">📅 ${m(a.due_date)}</span>`:""}
        ${b(a.priority)}
      </div>
    </div>`}function f(a){return`
    <div class="dash-overdue-row" data-task-id="${a.id}">
      <div class="dash-overdue-left">
        <span class="dash-overdue-dot"></span>
        <span class="dash-overdue-title">${a.title}</span>
      </div>
      <div class="dash-overdue-right">
        ${a.project?`<span class="dash-overdue-proj">${a.project.name}</span>`:""}
        <span class="dash-overdue-date">📅 ${m(a.due_date)}</span>
      </div>
    </div>`}export{j as renderDashboard};
