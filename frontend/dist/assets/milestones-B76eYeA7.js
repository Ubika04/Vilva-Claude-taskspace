const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{s as n,_ as m}from"./main-CxzuflVX.js";import{g as h,u as f,d as $}from"./milestones-CVvBUD-S.js";import{getProjects as g}from"./projects-8oxmbYM-.js";import{i as p,f as y}from"./helpers-ByTbCZyC.js";async function r(e){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let i=[];try{i=(await g({per_page:100})).data||[]}catch{e.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load projects</h3></div>';return}const s=await Promise.all(i.map(t=>h(t.id).then(o=>({project:t,milestones:o.data||[]})).catch(()=>({project:t,milestones:[]})))),a=s.reduce((t,o)=>t+o.milestones.filter(l=>l.status==="open").length,0),d=s.reduce((t,o)=>t+o.milestones.filter(l=>l.status==="completed").length,0),v=s.reduce((t,o)=>t+o.milestones.filter(l=>l.status==="open"&&p(l.due_date,"active")).length,0);e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Milestones</h1>
        <p>Track project checkpoints across all your projects</p>
      </div>
    </div>

    <div class="dash-stats" style="margin-bottom:20px">
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">🏁</div>
        <div class="stat-info"><span class="stat-val">${a+d}</span><span class="stat-label">Total</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-purple">⏳</div>
        <div class="stat-info"><span class="stat-val">${a}</span><span class="stat-label">Open</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">✅</div>
        <div class="stat-info"><span class="stat-val">${d}</span><span class="stat-label">Completed</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-red">⚠️</div>
        <div class="stat-info"><span class="stat-val">${v}</span><span class="stat-label">Overdue</span></div>
      </div>
    </div>

    <div id="milestones-content">
      ${s.filter(t=>t.milestones.length>0).map(t=>w(t.project,t.milestones)).join("")}
      ${s.every(t=>t.milestones.length===0)?'<div class="full-empty"><div class="full-empty-icon">🏁</div><h3>No milestones yet</h3><p>Add milestones from within a project to track key checkpoints</p></div>':""}
    </div>`,e.querySelectorAll(".ms-toggle-btn").forEach(t=>{t.addEventListener("click",async()=>{const{projectId:o,milestoneId:l,currentStatus:u}=t.dataset,c=u==="open"?"completed":"open";try{await f(o,l,{status:c}),n(c==="completed"?"✅ Milestone completed!":"Milestone reopened","success"),r(e)}catch{n("Update failed","error")}})}),e.querySelectorAll(".ms-delete-btn").forEach(t=>{t.addEventListener("click",async()=>{if(confirm("Delete this milestone?"))try{await $(t.dataset.projectId,t.dataset.milestoneId),n("Milestone deleted","success"),r(e)}catch{n("Delete failed","error")}})}),e.querySelectorAll("[data-goto-project]").forEach(t=>{t.addEventListener("click",()=>{m(()=>import("./main-CxzuflVX.js").then(o=>o.r),__vite__mapDeps([0,1])).then(o=>o.router.navigate(`/projects/${t.dataset.gotoProject}`))})})}function w(e,i){const s=[...i].sort((a,d)=>a.due_date?d.due_date?new Date(a.due_date)-new Date(d.due_date):-1:1);return`
    <div class="ms-project-group">
      <div class="ms-project-label" data-goto-project="${e.id}" style="cursor:pointer">
        <span class="ms-project-dot" style="background:${e.color}"></span>
        <span class="ms-project-name">${e.name}</span>
        <span class="ms-project-count">${i.length} milestone${i.length!==1?"s":""}</span>
      </div>
      <div class="ms-timeline">
        ${s.map(a=>j(a,e.id)).join("")}
      </div>
    </div>`}function j(e,i){const s=e.status==="completed",a=!s&&p(e.due_date,"active");return`
    <div class="ms-row ${s?"ms-done":""} ${a?"ms-overdue":""}">
      <div class="ms-row-left">
        <button class="ms-circle-btn ms-toggle-btn"
          data-project-id="${i}"
          data-milestone-id="${e.id}"
          data-current-status="${e.status}"
          title="${s?"Reopen":"Mark complete"}"
          style="border-color:${e.color||"#6366f1"}">
          ${s?`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${e.color||"#6366f1"}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`:`<span style="width:8px;height:8px;border-radius:50%;background:${e.color||"#6366f1"};display:inline-block"></span>`}
        </button>
        <div class="ms-row-info">
          <div class="ms-row-title ${s?"done":""}">${e.title}</div>
          ${e.description?`<div class="ms-row-desc">${e.description}</div>`:""}
        </div>
      </div>
      <div class="ms-row-right">
        ${e.due_date?`<span class="ms-due ${a?"overdue":s?"done":""}">
              ${s?"✅":a?"⚠️":"📅"} ${y(e.due_date)}
            </span>`:""}
        <span class="ms-status-pill ${s?"completed":a?"overdue":"open"}">
          ${s?"Completed":a?"Overdue":"Open"}
        </span>
        <button class="ms-delete-btn btn-icon" data-project-id="${i}" data-milestone-id="${e.id}" title="Delete" style="color:#dc2626;opacity:.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`}export{r as renderMilestones};
