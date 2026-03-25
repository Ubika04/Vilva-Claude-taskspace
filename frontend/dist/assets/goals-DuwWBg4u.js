import{a as p,s as d}from"./main-CxzuflVX.js";import{openModal as h,closeModal as f}from"./modal-jGhccxZ4.js";import{i as y,f as $}from"./helpers-ByTbCZyC.js";const w=e=>p.get("/goals",e),x=e=>p.post("/goals",e),m=(e,t)=>p.patch(`/goals/${e}`,t),k=e=>p.delete(`/goals/${e}`);async function u(e){e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let t=[];try{t=(await w()).data||[]}catch{e.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load goals</h3></div>';return}const s=t.filter(a=>a.status==="active"),o=t.filter(a=>a.status==="completed"),l=t.filter(a=>a.status==="paused");e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Goals</h1>
        <p>Track progress toward your personal targets</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" id="new-goal-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Goal
        </button>
      </div>
    </div>

    <div class="goals-overview-strip">
      ${n("🎯",s.length,"Active","#6366f1")}
      ${n("✅",o.length,"Completed","#16a34a")}
      ${n("⏸",l.length,"Paused","#64748b")}
      ${n("📈",t.length>0?Math.round(t.reduce((a,i)=>a+i.progress_percent,0)/t.length)+"%":"—","Avg. Progress","#f59e0b")}
    </div>

    ${s.length>0?`
    <div class="goals-section">
      <div class="goals-section-title">Active Goals</div>
      <div class="goals-grid">
        ${s.map(a=>g(a)).join("")}
      </div>
    </div>`:""}

    ${l.length>0?`
    <div class="goals-section">
      <div class="goals-section-title">Paused</div>
      <div class="goals-grid">
        ${l.map(a=>g(a)).join("")}
      </div>
    </div>`:""}

    ${o.length>0?`
    <div class="goals-section">
      <div class="goals-section-title">Completed</div>
      <div class="goals-grid">
        ${o.map(a=>g(a)).join("")}
      </div>
    </div>`:""}

    ${t.length===0?`
    <div class="full-empty">
      <div class="full-empty-icon">🎯</div>
      <h3>No goals yet</h3>
      <p>Create your first goal and start tracking your progress</p>
    </div>`:""}
  `,document.getElementById("new-goal-btn").addEventListener("click",()=>b(e,null)),e.querySelectorAll(".goal-edit-btn").forEach(a=>{const i=t.find(r=>r.id==a.dataset.goalId);i&&a.addEventListener("click",()=>b(e,i))}),e.querySelectorAll(".goal-delete-btn").forEach(a=>{a.addEventListener("click",async()=>{if(confirm("Delete this goal?"))try{await k(a.dataset.goalId),d("Goal deleted","success"),u(e)}catch{d("Delete failed","error")}})}),e.querySelectorAll(".goal-update-form").forEach(a=>{a.addEventListener("submit",async i=>{i.preventDefault();const r=a.dataset.goalId,c=a.querySelector(".goal-update-input"),v=parseFloat(c.value);if(!(isNaN(v)||v<0))try{await m(r,{current_value:v}),d("Progress updated","success"),u(e)}catch{d("Update failed","error")}})}),e.querySelectorAll(".goal-status-toggle").forEach(a=>{a.addEventListener("click",async()=>{const{goalId:i,currentStatus:r}=a.dataset,c=r==="paused"?"active":"paused";try{await m(i,{status:c}),d(c==="active"?"Goal resumed":"Goal paused","success"),u(e)}catch{d("Update failed","error")}})})}function n(e,t,s,o){return`
    <div class="goal-overview-pill" style="border-left:3px solid ${o}">
      <span class="goal-pill-icon">${e}</span>
      <div>
        <div class="goal-pill-val" style="color:${o}">${t}</div>
        <div class="goal-pill-lbl">${s}</div>
      </div>
    </div>`}function g(e){const t=e.progress_percent,s=e.status==="active"&&y(e.due_date,"active"),o={active:"active",completed:"completed",paused:"paused"}[e.status]||"active",l=t>=100?"#16a34a":t>=60?"#6366f1":t>=30?"#f59e0b":"#dc2626";return`
    <div class="goal-card ${e.status==="completed"?"goal-done":""}">
      <div class="goal-card-top">
        <div class="goal-card-color-bar" style="background:${e.color||"#6366f1"}"></div>
        <div class="goal-card-header">
          <div class="goal-card-title">${e.title}</div>
          <div class="goal-card-actions">
            <button class="btn-icon goal-edit-btn" data-goal-id="${e.id}" title="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            ${e.status!=="completed"?`
            <button class="btn-icon goal-status-toggle" data-goal-id="${e.id}" data-current-status="${e.status}"
              title="${e.status==="paused"?"Resume":"Pause"}">
              ${e.status==="paused"?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'}
            </button>`:""}
            <button class="btn-icon goal-delete-btn" data-goal-id="${e.id}" title="Delete" style="color:#dc2626">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
        ${e.description?`<div class="goal-card-desc">${e.description}</div>`:""}
      </div>

      <div class="goal-progress-section">
        <div class="goal-progress-nums">
          <span class="goal-current" style="color:${l}">${e.current_value}</span>
          <span class="goal-sep">/</span>
          <span class="goal-target">${e.target_value} ${e.unit||""}</span>
          <span class="goal-pct-badge" style="background:${l}18;color:${l}">${t}%</span>
        </div>
        <div class="goal-pbar-wrap">
          <div class="goal-pbar" style="width:${t}%;background:${l}"></div>
        </div>
      </div>

      ${e.status!=="completed"?`
      <form class="goal-update-form" data-goal-id="${e.id}">
        <input type="number" class="goal-update-input form-input" value="${e.current_value}"
          min="0" max="${e.target_value}" step="any" style="width:100px;height:30px;font-size:12px;padding:4px 8px"/>
        <button type="submit" class="btn btn-primary btn-sm" style="height:30px;font-size:12px">Update</button>
      </form>`:`
      <div class="goal-completed-badge">🎉 Goal achieved!</div>`}

      <div class="goal-card-footer">
        <span class="goal-status-tag ${o}">${e.status}</span>
        ${e.due_date?`<span class="goal-due ${s?"overdue":""}">📅 ${$(e.due_date)}</span>`:""}
      </div>
    </div>`}function b(e,t){const s=!!t;h({title:s?"Edit Goal":"New Goal",body:`
      <form id="goal-form">
        <div class="form-group">
          <label class="form-label">Goal Title *</label>
          <input name="title" class="form-input" value="${s?t.title:""}" placeholder="What do you want to achieve?" required autofocus/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input form-textarea" placeholder="Describe your goal…">${s&&t.description||""}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Target Value *</label>
            <input type="number" name="target_value" class="form-input" value="${s?t.target_value:"100"}" min="1" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Current Value</label>
            <input type="number" name="current_value" class="form-input" value="${s?t.current_value:"0"}" min="0"/>
          </div>
          <div class="form-group">
            <label class="form-label">Unit</label>
            <input name="unit" class="form-input" value="${s&&t.unit||"%"}" placeholder="%, tasks, hours…"/>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" name="start_date" class="form-input" value="${s&&t.start_date?t.start_date.slice(0,10):""}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" name="due_date" class="form-input" value="${s&&t.due_date?t.due_date.slice(0,10):""}"/>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" name="color" class="form-input" value="${s&&t.color||"#6366f1"}" style="height:40px;padding:4px 6px;cursor:pointer"/>
          </div>
        </div>
        ${s?`
        <div class="form-group">
          <label class="form-label">Status</label>
          <select name="status" class="form-input form-select">
            <option value="active" ${t.status==="active"?"selected":""}>Active</option>
            <option value="paused" ${t.status==="paused"?"selected":""}>Paused</option>
            <option value="completed" ${t.status==="completed"?"selected":""}>Completed</option>
          </select>
        </div>`:""}
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="goal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="goal-submit">
            ${s?"Save Changes":"Create Goal"}
          </button>
        </div>
      </form>`}),document.getElementById("goal-cancel").addEventListener("click",f),document.getElementById("goal-form").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("goal-submit");l.disabled=!0,l.textContent="Saving…";const a=Object.fromEntries(new FormData(o.target));Object.keys(a).forEach(i=>{a[i]===""&&delete a[i]});try{s?(await m(t.id,a),d("Goal updated","success")):(await x(a),d("Goal created!","success")),f(),u(e)}catch{l.disabled=!1,l.textContent=s?"Save Changes":"Create Goal"}})}export{u as renderGoals};
