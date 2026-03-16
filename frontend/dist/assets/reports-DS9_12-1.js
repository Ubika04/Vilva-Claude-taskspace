import{a as o}from"./main-CxoKqBs3.js";import{b as d}from"./helpers-BEw8rxzH.js";async function p(e){const a=new Date().toISOString().slice(0,10),r=new Date(Date.now()-30*864e5).toISOString().slice(0,10);e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Reports</h1>
        <p>Analytics and productivity insights</p>
      </div>
    </div>

    <div class="reports-tabs">
      <div class="rtab active" data-tab="productivity">User Productivity</div>
      <div class="rtab" data-tab="time">Time Tracking</div>
    </div>

    <div id="tab-productivity">
      <div class="report-filters">
        <label style="font-size:13px;font-weight:600;color:#64748b">From</label>
        <input type="date" id="prod-from" class="form-input" value="${r}" style="width:150px"/>
        <label style="font-size:13px;font-weight:600;color:#64748b">To</label>
        <input type="date" id="prod-to" class="form-input" value="${a}" style="width:150px"/>
        <button class="btn btn-primary btn-sm" id="run-prod">Run Report</button>
        <a href="/api/v1/reports/export-csv?type=productivity" class="btn btn-secondary btn-sm" download>Export CSV</a>
      </div>
      <div id="prod-result"></div>
    </div>

    <div id="tab-time" class="hidden">
      <div class="report-filters">
        <label style="font-size:13px;font-weight:600;color:#64748b">From</label>
        <input type="date" id="time-from" class="form-input" value="${r}" style="width:150px"/>
        <label style="font-size:13px;font-weight:600;color:#64748b">To</label>
        <input type="date" id="time-to" class="form-input" value="${a}" style="width:150px"/>
        <button class="btn btn-primary btn-sm" id="run-time">Run Report</button>
        <a href="/api/v1/reports/export-csv?type=time_tracking" class="btn btn-secondary btn-sm" download>Export CSV</a>
      </div>
      <div id="time-result"></div>
    </div>`,e.querySelectorAll(".rtab").forEach(t=>{t.addEventListener("click",()=>{e.querySelectorAll(".rtab").forEach(s=>s.classList.remove("active")),t.classList.add("active"),e.querySelectorAll('[id^="tab-"]').forEach(s=>s.classList.add("hidden")),document.getElementById(`tab-${t.dataset.tab}`).classList.remove("hidden")})}),document.getElementById("run-prod").addEventListener("click",async()=>{const t=document.getElementById("prod-result");t.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';try{const s=await o.get("/reports/user-productivity",{from:document.getElementById("prod-from").value,to:document.getElementById("prod-to").value});t.innerHTML=i(s)}catch{t.innerHTML='<div class="full-empty"><p>Failed to load report</p></div>'}}),document.getElementById("run-time").addEventListener("click",async()=>{const t=document.getElementById("time-result");t.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';try{const s=await o.get("/reports/time-tracking",{from:document.getElementById("time-from").value,to:document.getElementById("time-to").value});t.innerHTML=l(s)}catch{t.innerHTML='<div class="full-empty"><p>Failed to load report</p></div>'}})}function i(e){const a=Math.floor((e.total_seconds||0)/3600),r=Math.floor((e.total_seconds||0)%3600/60);return`
    <div class="report-stats">
      <div class="report-stat-card"><span class="report-stat-val">${a}h ${r}m</span><span class="report-stat-lbl">Total Time Tracked</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${e.tasks_completed||0}</span><span class="report-stat-lbl">Tasks Completed</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${Object.keys(e.daily||{}).length}</span><span class="report-stat-lbl">Active Days</span></div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header"><h3>Daily Breakdown</h3></div>
      <table class="tasks">
        <thead><tr><th>Date</th><th>Time Tracked</th><th>Tasks Completed</th></tr></thead>
        <tbody>
          ${Object.entries(e.daily||{}).map(([t,s])=>`
            <tr>
              <td style="font-weight:600">${new Date(t).toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"})}</td>
              <td>${d(s.total_seconds)}</td>
              <td>${s.task_count||0}</td>
            </tr>`).join("")||'<tr><td colspan="3" class="table-empty">No data for this period</td></tr>'}
        </tbody>
      </table>
    </div>`}function l(e){return`
    <div class="report-stats">
      <div class="report-stat-card"><span class="report-stat-val">${d(e.total_seconds||0)}</span><span class="report-stat-lbl">Total Time</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${e.total_tasks||0}</span><span class="report-stat-lbl">Tasks Worked</span></div>
      <div class="report-stat-card"><span class="report-stat-val">${e.total_users||0}</span><span class="report-stat-lbl">Team Members</span></div>
    </div>
    <div class="card" style="overflow:hidden">
      <div class="card-header"><h3>Time Log</h3></div>
      <table class="tasks">
        <thead><tr><th>Task</th><th>User</th><th>Duration</th><th>Date</th></tr></thead>
        <tbody>
          ${(e.logs||[]).map(a=>{var r,t;return`
            <tr>
              <td style="font-weight:500">${((r=a.task)==null?void 0:r.title)||"—"}</td>
              <td>${((t=a.user)==null?void 0:t.name)||"—"}</td>
              <td style="font-weight:600;color:#6366f1">${d(a.duration)}</td>
              <td style="color:#64748b">${new Date(a.start_time).toLocaleDateString()}</td>
            </tr>`}).join("")||'<tr><td colspan="4" class="table-empty">No time logs for this period</td></tr>'}
        </tbody>
      </table>
    </div>`}export{p as renderReports};
