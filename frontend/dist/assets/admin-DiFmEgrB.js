const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{a as v,s as c,_ as C}from"./main-CxzuflVX.js";import{a as P,i as q,p as T,s as N,f as O}from"./helpers-ByTbCZyC.js";let g=null;async function _(){if(g)return g;try{g=(await v.get("/admin/roles")).data||[]}catch{g=[{name:"admin",display_name:"Admin"},{name:"manager",display_name:"Manager"},{name:"member",display_name:"Member"},{name:"guest",display_name:"Guest"}]}return g}async function x(e){var l,i,d;e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let s;try{s=await v.get("/admin/users")}catch{e.innerHTML=`
      <div class="full-empty">
        <div class="full-empty-icon">🔒</div>
        <h3>Admin access required</h3>
        <p>You don't have permission to view this page.</p>
      </div>`;return}const a=s.data||[],n=await _();e.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>User Management</h1>
        <p>${a.length} member${a.length!==1?"s":""} total</p>
      </div>
      <div class="page-header-right" style="display:flex;gap:10px;align-items:center">
        <input type="search" id="admin-search" class="form-input" placeholder="Search members…" style="width:220px"/>
        <button class="btn btn-primary btn-sm" id="add-user-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          Add Member
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button class="admin-tab active" data-tab="members">👥 Members</button>
      <button class="admin-tab" data-tab="roles">🔑 Roles & Permissions</button>
    </div>

    <!-- Members Tab -->
    <div class="admin-tab-panel" id="tab-members">
      <div class="admin-overview-strip">
        ${L("👥","stat-icon-blue",a.length,"Members")}
        ${L("📋","stat-icon-purple",a.reduce((t,r)=>t+r.task_stats.total,0),"Total Tasks")}
        ${L("⚡","stat-icon-amber",a.reduce((t,r)=>t+r.task_stats.in_progress,0),"In Progress")}
        ${L("⚠️","stat-icon-red",a.reduce((t,r)=>t+r.task_stats.overdue,0),"Overdue")}
      </div>
      <div class="admin-members-list" id="admin-members-list">
        ${a.map(t=>F(t)).join("")}
      </div>
    </div>

    <!-- Roles & Permissions Tab -->
    <div class="admin-tab-panel hidden" id="tab-roles">
      ${U(n,a)}
    </div>`,e.querySelectorAll(".admin-tab").forEach(t=>{t.addEventListener("click",()=>{var r;e.querySelectorAll(".admin-tab").forEach(o=>o.classList.remove("active")),e.querySelectorAll(".admin-tab-panel").forEach(o=>o.classList.add("hidden")),t.classList.add("active"),(r=document.getElementById(`tab-${t.dataset.tab}`))==null||r.classList.remove("hidden")})}),(l=document.getElementById("add-user-btn"))==null||l.addEventListener("click",()=>R(e)),(i=document.getElementById("admin-search"))==null||i.addEventListener("input",function(){const t=this.value.toLowerCase();e.querySelectorAll(".admin-member-card").forEach(r=>{r.style.display=r.dataset.name.toLowerCase().includes(t)?"":"none"})}),D(e),(d=document.getElementById("create-role-btn"))==null||d.addEventListener("click",()=>{B(e,null)}),e.querySelectorAll(".role-edit-btn").forEach(t=>{t.addEventListener("click",()=>{const r=t.dataset.roleName,o=n.find(m=>m.name===r);o&&B(e,o)})}),e.querySelectorAll(".role-delete-btn").forEach(t=>{t.addEventListener("click",async()=>{var o,m;const r=t.dataset.roleName;if(confirm(`Are you sure you want to delete the role "${r}"? This cannot be undone.`))try{await v.delete(`/admin/roles/${r}`),c("Role deleted","success"),g=null,x(e)}catch(b){c(((m=(o=b==null?void 0:b.response)==null?void 0:o.data)==null?void 0:m.message)||"Failed to delete role","error")}})})}function D(e){e.querySelectorAll(".admin-expand-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.closest(".admin-member-card").querySelector(".admin-task-list"),l=!n.classList.contains("hidden");n.classList.toggle("hidden",l),s.innerHTML=l?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg> Show tasks':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg> Hide tasks'})}),e.querySelectorAll(".admin-task-row").forEach(s=>{s.addEventListener("click",()=>{C(()=>import("./main-CxzuflVX.js").then(a=>a.r),__vite__mapDeps([0,1])).then(a=>a.router.navigate(`/tasks/${s.dataset.taskId}`))})}),e.querySelectorAll(".admin-edit-btn").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation();const n=JSON.parse(s.dataset.user);R(e,n)})}),e.querySelectorAll(".admin-reset-pw-btn").forEach(s=>{s.addEventListener("click",a=>{a.stopPropagation(),H(s.dataset.userId,s.dataset.userName)})}),e.querySelectorAll(".admin-delete-btn").forEach(s=>{s.addEventListener("click",async a=>{var i,d;a.stopPropagation();const n=s.dataset.userId,l=s.dataset.userName;if(confirm(`Are you sure you want to remove ${l}? This action cannot be undone.`))try{await v.delete(`/admin/users/${n}`),c("Member removed","success"),x(e)}catch(t){c(((d=(i=t==null?void 0:t.response)==null?void 0:i.data)==null?void 0:d.message)||"Failed to remove member","error")}})})}async function R(e,s=null){var r;const a=await _(),n=!!s,l=n?"Edit Member":"Add New Member",i=n&&((r=s.roles)==null?void 0:r[0])||"member",d=document.createElement("div");d.className="modal-overlay",d.innerHTML=`
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <h3>${l}</h3>
        <button class="modal-close" id="um-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Name <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="um-name" value="${n?s.name:""}" placeholder="Full name" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Email <span style="color:var(--red)">*</span></label>
          <input type="email" class="form-input" id="um-email" value="${n?s.email:""}" placeholder="email@company.com" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Mobile</label>
          <input type="text" class="form-input" id="um-mobile" value="${n&&s.mobile||""}" placeholder="+91 9876543210"/>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Role <span style="color:var(--red)">*</span></label>
            <select class="form-input form-select" id="um-role">
              ${a.map(o=>`<option value="${o.name}" ${o.name===i?"selected":""}>${o.display_name||o.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input type="text" class="form-input" id="um-dept" value="${n&&s.department||""}" placeholder="e.g. Engineering"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Designation</label>
          <input type="text" class="form-input" id="um-desig" value="${n&&s.designation||""}" placeholder="e.g. Senior Developer"/>
        </div>
        ${n?"":`
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="um-password" placeholder="Leave blank for default (password)"/>
        </div>`}
        ${n?`
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-input form-select" id="um-status">
            <option value="active" ${s.status==="active"?"selected":""}>Active</option>
            <option value="inactive" ${s.status==="inactive"?"selected":""}>Inactive</option>
            <option value="suspended" ${s.status==="suspended"?"selected":""}>Suspended</option>
          </select>
        </div>`:""}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="um-cancel">Cancel</button>
        <button class="btn btn-primary" id="um-submit">${n?"Save Changes":"Create Member"}</button>
      </div>
    </div>`,document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("active")),document.getElementById("um-name").focus();const t=()=>{d.remove()};d.addEventListener("click",o=>{o.target===d&&t()}),document.getElementById("um-close").addEventListener("click",t),document.getElementById("um-cancel").addEventListener("click",t),document.getElementById("um-submit").addEventListener("click",async()=>{var y,f,p,E,M,I;const o=document.getElementById("um-name").value.trim(),m=document.getElementById("um-email").value.trim(),b=document.getElementById("um-mobile").value.trim(),$=document.getElementById("um-role").value,k=document.getElementById("um-dept").value.trim(),w=document.getElementById("um-desig").value.trim();if(!o||!m){c("Name and email are required","error");return}const h={name:o,email:m,role:$,mobile:b||null,department:k||null,designation:w||null};try{if(n){const u=(y=document.getElementById("um-status"))==null?void 0:y.value;u&&(h.status=u),await v.patch(`/admin/users/${s.id}`,h),c("Member updated","success")}else{const u=(f=document.getElementById("um-password"))==null?void 0:f.value;u&&(h.password=u),await v.post("/admin/users",h),c("Member created","success")}t(),x(e)}catch(u){const A=(E=(p=u==null?void 0:u.response)==null?void 0:p.data)!=null&&E.message||(I=(M=u==null?void 0:u.response)==null?void 0:M.data)!=null&&I.errors?Object.values(u.response.data.errors||{}).flat().join(", "):"Operation failed";c(A,"error")}})}function H(e,s){const a=document.createElement("div");a.className="modal-overlay",a.innerHTML=`
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <h3>Reset Password</h3>
        <button class="modal-close" id="rp-close">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:14px;color:var(--text2);font-size:13px">Set a new password for <strong>${s}</strong></p>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" class="form-input" id="rp-password" placeholder="Min. 6 characters" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-input" id="rp-confirm" placeholder="Repeat password" required/>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="rp-cancel">Cancel</button>
        <button class="btn btn-primary" id="rp-submit">Reset Password</button>
      </div>
    </div>`,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("active")),document.getElementById("rp-password").focus();const n=()=>{a.remove()};a.addEventListener("click",l=>{l.target===a&&n()}),document.getElementById("rp-close").addEventListener("click",n),document.getElementById("rp-cancel").addEventListener("click",n),document.getElementById("rp-submit").addEventListener("click",async()=>{const l=document.getElementById("rp-password").value,i=document.getElementById("rp-confirm").value;if(l!==i){c("Passwords do not match","error");return}if(l.length<6){c("Password must be at least 6 characters","error");return}try{const d=await v.post(`/admin/users/${e}/reset-password`,{password:l});c(d.message||"Password reset","success"),n()}catch(d){c((d==null?void 0:d.message)||"Failed to reset password","error")}})}const j={projects:["projects.view","projects.create","projects.update","projects.delete"],tasks:["tasks.view","tasks.create","tasks.update","tasks.delete","tasks.assign"],members:["members.manage"],reports:["reports.view","reports.export"]},S={"projects.view":"View Projects","projects.create":"Create Projects","projects.update":"Update Projects","projects.delete":"Delete Projects","tasks.view":"View Tasks","tasks.create":"Create Tasks","tasks.update":"Update Tasks","tasks.delete":"Delete Tasks","tasks.assign":"Assign Tasks","members.manage":"Manage Members","reports.view":"View Reports","reports.export":"Export Reports"};function U(e,s){const a={};for(const l of s)for(const i of l.roles||[])a[i]=(a[i]||0)+1;const n={owner:Object.values(j).flat(),admin:Object.values(j).flat(),manager:["projects.view","projects.update","tasks.view","tasks.create","tasks.update","tasks.assign","members.manage","reports.view"],member:["projects.view","tasks.view","tasks.create","tasks.update"],guest:["projects.view","tasks.view"]};return`
    <div style="margin-bottom:16px">
      <button class="btn btn-primary btn-sm" id="create-role-btn">
        + Create Role
      </button>
    </div>
    <div class="roles-grid">
      ${e.map(l=>{const i=n[l.name]||l.permissions||[],d=a[l.name]||0,t=s.filter(r=>(r.roles||[]).includes(l.name));return`
        <div class="role-card">
          <div class="role-card-header">
            <div class="role-card-title">
              <span class="admin-role-badge role-${l.name}">${l.display_name||l.name}</span>
              <span class="role-count">${d} member${d!==1?"s":""}</span>
            </div>
          </div>

          <div class="role-perms">
            ${Object.entries(j).map(([r,o])=>`
              <div class="role-perm-group">
                <div class="role-perm-group-label">${r.charAt(0).toUpperCase()+r.slice(1)}</div>
                ${o.map(m=>`
                  <div class="role-perm-item ${i.includes(m)?"granted":"denied"}">
                    <span>${i.includes(m)?"✅":"❌"}</span>
                    <span>${S[m]||m}</span>
                  </div>`).join("")}
              </div>`).join("")}
          </div>

          ${t.length>0?`
          <div class="role-members">
            <div class="role-perm-group-label" style="margin-bottom:6px">Members with this role</div>
            <div class="role-member-list">
              ${t.slice(0,8).map(r=>`
                <div class="role-member-chip" title="${r.name}">
                  <img src="${r.avatar_url||""}" class="dep-av-sm" style="margin-left:0"/>
                  <span>${r.name}</span>
                </div>`).join("")}
              ${t.length>8?`<span style="font-size:11px;color:var(--muted)">+${t.length-8} more</span>`:""}
            </div>
          </div>`:""}

          ${l.is_system?"":`
          <div style="display:flex;gap:4px;margin-top:10px">
            <button class="btn btn-ghost btn-sm role-edit-btn" data-role-name="${l.name}">Edit</button>
            <button class="btn btn-ghost btn-sm role-delete-btn" data-role-name="${l.name}" style="color:var(--red)">Delete</button>
          </div>`}
        </div>`}).join("")}
    </div>`}function B(e,s=null){const a=!!s,n=a?"Edit Role":"Create Role",l=(s==null?void 0:s.permissions)||[],i=document.createElement("div");i.className="modal-overlay",i.innerHTML=`
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <h3>${n}</h3>
        <button class="modal-close" id="rm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Role Name <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="rm-name" value="${a?s.name:""}" placeholder="e.g. editor" required ${a?'readonly style="opacity:0.6"':""}/>
        </div>
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input type="text" class="form-input" id="rm-display-name" value="${a&&s.display_name||""}" placeholder="e.g. Editor"/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" id="rm-description" rows="2" placeholder="Optional description">${a&&s.description||""}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Permissions</label>
          <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border,#e2e8f0);border-radius:6px;padding:8px">
            ${Object.entries(j).map(([t,r])=>`
              <div style="margin-bottom:8px">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3,#94a3b8);margin-bottom:4px">${t}</div>
                ${r.map(o=>`
                  <label style="display:flex;align-items:center;gap:6px;padding:3px 4px;cursor:pointer;font-size:13px">
                    <input type="checkbox" class="rm-perm-cb" value="${o}" ${l.includes(o)?"checked":""}/>
                    ${S[o]||o}
                  </label>`).join("")}
              </div>`).join("")}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="rm-cancel">Cancel</button>
        <button class="btn btn-primary" id="rm-submit">${a?"Save Changes":"Create Role"}</button>
      </div>
    </div>`,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("active")),document.getElementById(a?"rm-display-name":"rm-name").focus();const d=()=>{i.remove()};i.addEventListener("click",t=>{t.target===i&&d()}),document.getElementById("rm-close").addEventListener("click",d),document.getElementById("rm-cancel").addEventListener("click",d),document.getElementById("rm-submit").addEventListener("click",async()=>{var $,k,w,h,y,f;const t=document.getElementById("rm-name").value.trim(),r=document.getElementById("rm-display-name").value.trim(),o=document.getElementById("rm-description").value.trim(),m=[...i.querySelectorAll(".rm-perm-cb:checked")].map(p=>p.value);if(!t){c("Role name is required","error");return}const b={name:t,display_name:r||null,description:o||null,permissions:m};try{a?(await v.patch(`/admin/roles/${s.name}`,b),c("Role updated","success")):(await v.post("/admin/roles",b),c("Role created","success")),d(),g=null,x(e)}catch(p){const E=(k=($=p==null?void 0:p.response)==null?void 0:$.data)!=null&&k.message||(h=(w=p==null?void 0:p.response)==null?void 0:w.data)!=null&&h.errors?Object.values(((f=(y=p==null?void 0:p.response)==null?void 0:y.data)==null?void 0:f.errors)||{}).flat().join(", "):"Operation failed";c(E,"error")}})}function L(e,s,a,n){return`
    <div class="stat-card">
      <div class="stat-icon ${s}">${e}</div>
      <div class="stat-info">
        <span class="stat-val">${a}</span>
        <span class="stat-label">${n}</span>
      </div>
    </div>`}function F(e){const s=e.task_stats,a=e.tasks||[];(e.roles||[]).includes("admin");const n=e.avatar_url||P(e),l=(e.roles||[])[0]||"member",i=e.last_active_at?new Date(e.last_active_at).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"}):"Never",d=JSON.stringify({id:e.id,name:e.name,email:e.email,mobile:e.mobile,department:e.department,designation:e.designation,status:e.status,roles:e.roles}).replace(/"/g,"&quot;");return`
    <div class="admin-member-card" data-name="${e.name}">
      <div class="admin-member-header">
        <img src="${n}" class="admin-member-avatar" alt="${e.name}"/>
        <div class="admin-member-info">
          <div class="admin-member-name">
            ${e.name}
            <span class="admin-role-badge role-${l}">${l.charAt(0).toUpperCase()+l.slice(1)}</span>
            <span class="admin-status-dot ${e.status==="active"?"active":"inactive"}"></span>
          </div>
          <div class="admin-member-email">${e.email}${e.mobile?` · ${e.mobile}`:""}</div>
          <div class="admin-member-meta">
            ${e.department?`<span class="admin-meta-chip">${e.department}</span>`:""}
            ${e.designation?`<span class="admin-meta-chip">${e.designation}</span>`:""}
            <span class="admin-member-last">Last active: ${i}</span>
          </div>
        </div>
        <div class="admin-member-stats">
          <div class="admin-stat-pill">
            <span class="admin-stat-num">${s.total}</span>
            <span class="admin-stat-lbl">Total</span>
          </div>
          <div class="admin-stat-pill amber">
            <span class="admin-stat-num">${s.in_progress}</span>
            <span class="admin-stat-lbl">Active</span>
          </div>
          <div class="admin-stat-pill green">
            <span class="admin-stat-num">${s.completed}</span>
            <span class="admin-stat-lbl">Done</span>
          </div>
          ${s.overdue>0?`
          <div class="admin-stat-pill red">
            <span class="admin-stat-num">${s.overdue}</span>
            <span class="admin-stat-lbl">Overdue</span>
          </div>`:""}
        </div>
        <div class="admin-member-actions">
          <button class="btn btn-ghost btn-sm admin-reset-pw-btn" data-user-id="${e.id}" data-user-name="${e.name}" title="Reset password">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path stroke-linecap="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm admin-edit-btn" data-user="${d}" title="Edit member">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path stroke-linecap="round" stroke-linejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm admin-delete-btn" data-user-id="${e.id}" data-user-name="${e.name}" title="Remove member">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          ${a.length>0?`
          <button class="admin-expand-btn btn btn-ghost btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            Show tasks
          </button>`:""}
        </div>
      </div>
      ${a.length>0?`
      <div class="admin-task-list hidden">
        <div class="admin-task-list-head">
          <span>Task</span><span>Project</span><span>Status</span><span>Due</span>
        </div>
        ${a.map(t=>V(t)).join("")}
      </div>
      `:'<div class="admin-no-tasks">No tasks assigned to this member</div>'}
    </div>`}function V(e){const s=q(e.due_date,e.status);return`
    <div class="admin-task-row" data-task-id="${e.id}">
      <div class="admin-task-title-cell">
        ${T(e.priority)}
        <span class="admin-task-title">${e.title}</span>
      </div>
      <div>
        ${e.project?`<span class="task-proj-chip" style="background:${e.project.color}18;color:${e.project.color}">${e.project.name}</span>`:'<span class="muted">—</span>'}
      </div>
      <div>${N(e.status)}</div>
      <div>
        ${e.due_date?`<span class="task-due ${s?"overdue":""}">📅 ${O(e.due_date)}</span>`:'<span class="muted">—</span>'}
      </div>
    </div>`}export{x as renderAdmin};
