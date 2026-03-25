import{a as u,s as k,_ as y}from"./main-CxzuflVX.js";import{b as g,s as w}from"./helpers-ByTbCZyC.js";async function L(s){const r=new Date().toISOString().slice(0,10),o=new Date(Date.now()-30*864e5).toISOString().slice(0,10);s.innerHTML=`
    <div class="rpt-page">
      <div class="rpt-header">
        <div>
          <h1 class="rpt-title">Reports & Analytics</h1>
          <p class="rpt-subtitle">Track productivity, time, and team velocity</p>
        </div>
        <div class="rpt-header-actions">
          <div class="rpt-date-range">
            <input type="date" id="rpt-from" class="rpt-date-input" value="${o}" />
            <span class="rpt-date-sep">to</span>
            <input type="date" id="rpt-to" class="rpt-date-input" value="${r}" />
          </div>
          <button class="rpt-refresh-btn" id="rpt-refresh" title="Refresh all reports">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <div class="rpt-tabs">
        <button class="rpt-tab active" data-tab="productivity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          Productivity
        </button>
        <button class="rpt-tab" data-tab="time">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>
          Time Tracking
        </button>
        <button class="rpt-tab" data-tab="velocity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Velocity
        </button>
      </div>

      <div id="rpt-content">
        <div class="rpt-loading"><div class="spinner"></div><span>Loading reports...</span></div>
      </div>
    </div>`;let e="productivity";s.querySelectorAll(".rpt-tab").forEach(a=>{a.addEventListener("click",()=>{s.querySelectorAll(".rpt-tab").forEach(t=>t.classList.remove("active")),a.classList.add("active"),e=a.dataset.tab,m(e)})}),document.getElementById("rpt-refresh").addEventListener("click",()=>m(e)),document.getElementById("rpt-from").addEventListener("change",()=>m(e)),document.getElementById("rpt-to").addEventListener("change",()=>m(e)),await m("productivity")}async function m(s){var a,t;const r=document.getElementById("rpt-content"),o=(a=document.getElementById("rpt-from"))==null?void 0:a.value,e=(t=document.getElementById("rpt-to"))==null?void 0:t.value;r.innerHTML=`<div class="rpt-loading"><div class="spinner"></div><span>Loading ${s} report...</span></div>`;try{switch(s){case"productivity":await $(r,o,e);break;case"time":await M(r,o,e);break;case"velocity":await j(r,o,e);break}}catch(i){console.error("Report error:",i),r.innerHTML=`
      <div class="rpt-error">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4m0 4h.01"/></svg>
        <h3>Failed to load report</h3>
        <p>${(i==null?void 0:i.message)||"Check that the backend server is running and try again."}</p>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('rpt-refresh').click()">Try Again</button>
      </div>`}}async function $(s,r,o){var h;const e=await u.get("/reports/user-productivity",{from:r,to:o}),a=e.total_seconds||0,t=Math.floor(a/3600),i=Math.floor(a%3600/60),d=e.daily||{},n=Object.entries(d),v=n.reduce((c,[,p])=>Math.max(c,p.total_seconds||0),1);s.innerHTML=`
    <div class="rpt-stats-row">
      ${l(t+"h "+i+"m","Time Tracked","#6366f1",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>')}
      ${l(e.tasks_completed||0,"Tasks Completed","#10b981",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>')}
      ${l(n.length,"Active Days","#f59e0b",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>')}
      ${l(((h=e.user)==null?void 0:h.name)||"You","User","#8b5cf6",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>')}
    </div>

    ${n.length>0?`
    <div class="rpt-card">
      <div class="rpt-card-head">
        <h3>Daily Activity</h3>
        <span class="rpt-card-badge">${n.length} days</span>
      </div>
      <div class="rpt-bar-chart">
        ${n.map(([c,p])=>{const b=Math.max(8,Math.round(p.total_seconds/v*100)),f=new Date(c).toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"});return`
            <div class="rpt-bar-col">
              <div class="rpt-bar-value">${g(p.total_seconds)}</div>
              <div class="rpt-bar-fill" style="height:${b}%"></div>
              <div class="rpt-bar-tasks">${p.task_count||0} tasks</div>
              <div class="rpt-bar-label">${f}</div>
            </div>`}).join("")}
      </div>
    </div>`:`
    <div class="rpt-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      <h3>No activity data</h3>
      <p>No time tracked in this date range. Start a timer on a task to see data here.</p>
    </div>`}

    ${x(e.time_logs||[])}`,T(s)}async function M(s,r,o){const e=await u.get("/reports/time-tracking",{from:r,to:o}),a=e.logs||[];s.innerHTML=`
    <div class="rpt-stats-row">
      ${l(g(e.total_seconds||0),"Total Time","#6366f1",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>')}
      ${l(e.total_tasks||0,"Tasks Worked","#10b981",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>')}
      ${l(e.total_users||0,"Team Members","#8b5cf6",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>')}
      ${l(a.length,"Time Entries","#f59e0b",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>')}
    </div>

    ${a.length>0?`
    <div class="rpt-card">
      <div class="rpt-card-head">
        <h3>Time Entries</h3>
        <a href="/api/v1/reports/export-csv?type=time_tracking&from=${r}&to=${o}" class="rpt-export-btn" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </a>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead>
            <tr><th>Task</th><th>User</th><th>Duration</th><th>Date</th><th>Project</th></tr>
          </thead>
          <tbody>
            ${a.map(t=>{var i,d,n,v;return`
              <tr>
                <td><span class="rpt-task-name">${((i=t.task)==null?void 0:i.title)||"—"}</span></td>
                <td><span class="rpt-user-name">${((d=t.user)==null?void 0:d.name)||"—"}</span></td>
                <td><span class="rpt-duration">${g(t.duration)}</span></td>
                <td><span class="rpt-date">${new Date(t.start_time).toLocaleDateString("en",{month:"short",day:"numeric"})}</span></td>
                <td><span class="rpt-project">${((v=(n=t.task)==null?void 0:n.project)==null?void 0:v.name)||"—"}</span></td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>
    </div>`:`
    <div class="rpt-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>
      <h3>No time entries</h3>
      <p>No time logs found for this period. Start tracking time on tasks to see entries here.</p>
    </div>`}`}async function j(s,r,o){var a;let e=[];try{e=(await u.get("/projects",{per_page:100})).data||[]}catch{}s.innerHTML=`
    <div class="rpt-vel-selector">
      <label>Select Project</label>
      <select id="vel-project" class="rpt-select">
        ${e.length===0?'<option value="">No projects available</option>':'<option value="">Choose a project...</option>'+e.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
      </select>
      <button class="rpt-refresh-btn" id="run-vel-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Load Velocity
      </button>
    </div>
    <div id="vel-result">
      <div class="rpt-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <h3>Select a project</h3>
        <p>Choose a project above to view velocity and scoring data.</p>
      </div>
    </div>`,(a=document.getElementById("run-vel-btn"))==null||a.addEventListener("click",async()=>{var d;const t=(d=document.getElementById("vel-project"))==null?void 0:d.value;if(!t){k("Please select a project","error");return}const i=document.getElementById("vel-result");i.innerHTML='<div class="rpt-loading"><div class="spinner"></div><span>Loading velocity...</span></div>';try{const n=await u.get("/reports/velocity",{project_id:t,from:r,to:o}),v=Object.entries(n.weekly||{}),h=n.member_stats||[];i.innerHTML=`
        <div class="rpt-stats-row">
          ${l(n.total_score||0,"Total Score","#6366f1",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>')}
          ${l(n.total_tasks||0,"Tasks Completed","#10b981",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>')}
          ${l(v.length,"Weeks Tracked","#f59e0b",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>')}
          ${l(h.length,"Contributors","#8b5cf6",'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>')}
        </div>

        ${v.length>0?`
        <div class="rpt-card">
          <div class="rpt-card-head"><h3>Weekly Velocity</h3></div>
          <div class="rpt-table-wrap">
            <table class="rpt-table">
              <thead><tr><th>Week</th><th>Tasks</th><th>Score</th><th>Time</th><th>Avg Score</th></tr></thead>
              <tbody>
                ${v.map(([c,p])=>`
                  <tr>
                    <td><strong>${new Date(c).toLocaleDateString("en",{month:"short",day:"numeric"})}</strong></td>
                    <td>${p.tasks_completed}</td>
                    <td><span class="rpt-score">${p.total_score} pts</span></td>
                    <td>${g((p.total_time_mins||0)*60)}</td>
                    <td>${p.avg_score}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>`:""}

        ${h.length>0?`
        <div class="rpt-card">
          <div class="rpt-card-head"><h3>Member Scoring</h3></div>
          <div class="rpt-members-grid">
            ${h.map(c=>`
              <div class="rpt-member-card">
                <div class="rpt-member-name">${c.name}</div>
                <div class="rpt-member-stats">
                  <div><span class="rpt-member-val">${c.tasks_done}</span><span class="rpt-member-lbl">tasks</span></div>
                  <div><span class="rpt-member-val rpt-score">${c.total_score}</span><span class="rpt-member-lbl">points</span></div>
                  <div><span class="rpt-member-val">${g((c.total_time_mins||0)*60)}</span><span class="rpt-member-lbl">time</span></div>
                </div>
              </div>`).join("")}
          </div>
        </div>`:""}

        ${v.length===0&&h.length===0?`
        <div class="rpt-empty">
          <h3>No velocity data</h3>
          <p>No completed tasks with scores found in this period for the selected project.</p>
        </div>`:""}`}catch(n){i.innerHTML=`<div class="rpt-error"><h3>Failed to load velocity</h3><p>${(n==null?void 0:n.message)||"Unknown error"}</p></div>`}})}function l(s,r,o,e){return`
    <div class="rpt-stat">
      <div class="rpt-stat-icon" style="background:${o}15;color:${o}">${e}</div>
      <div class="rpt-stat-info">
        <span class="rpt-stat-val">${s}</span>
        <span class="rpt-stat-lbl">${r}</span>
      </div>
    </div>`}function x(s){var e;if(!s||s.length===0)return"";const r={};for(const a of s)(e=a.task)!=null&&e.id&&!r[a.task.id]&&(r[a.task.id]=a.task);const o=Object.values(r);return o.length===0?"":`
    <div class="rpt-card">
      <div class="rpt-card-head"><h3>Tasks in Report</h3><span class="rpt-card-badge">${o.length} tasks</span></div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead><tr><th>Task</th><th>Status</th><th>Project</th><th></th></tr></thead>
          <tbody>
            ${o.map(a=>{var t;return`
              <tr>
                <td><span class="rpt-task-name">${a.title}</span></td>
                <td>${w(a.status)}</td>
                <td><span class="rpt-project">${((t=a.project)==null?void 0:t.name)||"—"}</span></td>
                <td><button class="btn btn-ghost btn-sm rpt-edit-btn" data-task-id="${a.id}">Edit</button></td>
              </tr>`}).join("")}
          </tbody>
        </table>
      </div>
    </div>`}function T(s){s.querySelectorAll(".rpt-edit-btn").forEach(r=>{r.addEventListener("click",async()=>{const o=r.dataset.taskId;if(o)try{const e=await u.get(`/tasks/${o}`);_(e)}catch{k("Failed to load task","error")}})})}async function _(s){const{openModal:r,closeModal:o}=await y(async()=>{const{openModal:t,closeModal:i}=await import("./modal-jGhccxZ4.js");return{openModal:t,closeModal:i}},[]),e=["backlog","todo","in_progress","working_on","review","blocked","completed"],a=["low","medium","high","urgent"];r({title:`Edit: ${s.title}`,body:`
      <form id="rpt-edit-form" class="rpt-edit-form">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input name="title" class="form-input" value="${(s.title||"").replace(/"/g,"&quot;")}"/>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-input form-select">
              ${e.map(t=>`<option value="${t}" ${s.status===t?"selected":""}>${t.replace("_"," ")}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-input form-select">
              ${a.map(t=>`<option value="${t}" ${s.priority===t?"selected":""}>${t}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Score</label>
            <select name="score" class="form-input form-select">
              <option value="">—</option>
              ${[1,2,3,5,8,13,21].map(t=>`<option value="${t}" ${s.score==t?"selected":""}>${t} pts</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${s.due_date||""}"/>
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:12px;border-top:1px solid var(--border)">
          <button type="button" class="btn btn-ghost" id="rpt-edit-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="rpt-edit-save">Save Changes</button>
        </div>
      </form>`}),document.getElementById("rpt-edit-cancel").addEventListener("click",o),document.getElementById("rpt-edit-form").addEventListener("submit",async t=>{t.preventDefault();const i=document.getElementById("rpt-edit-save");i.disabled=!0,i.textContent="Saving...";const d=Object.fromEntries(new FormData(t.target));Object.keys(d).forEach(n=>{d[n]===""&&delete d[n]}),d.score&&(d.score=parseInt(d.score));try{await u.patch(`/tasks/${s.id}`,d),o(),k("Task updated","success")}catch{i.disabled=!1,i.textContent="Save Changes"}})}export{L as renderReports};
