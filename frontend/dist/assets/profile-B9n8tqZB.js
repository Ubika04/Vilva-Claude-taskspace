import{a as p,b as i,s as o}from"./main-CxzuflVX.js";import{a as w}from"./helpers-ByTbCZyC.js";async function E(d){var u,v,g;d.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';let e;try{e=await p.get("/me"),i.set("user",e)}catch{e=i.get("user")||{}}const c=((v=(u=e.roles)==null?void 0:u[0])==null?void 0:v.name)||((g=e.roles)==null?void 0:g[0])||"Member",b=c.charAt(0).toUpperCase()+c.slice(1),n=e.task_stats||{total:0,in_progress:0,completed:0,overdue:0},f=e.projects||[],h=e.created_at?new Date(e.created_at).toLocaleDateString("en",{month:"long",day:"numeric",year:"numeric"}):"—";d.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>
    </div>

    <div class="profile-layout">

      <!-- Left Column: Avatar + Info Card -->
      <div class="profile-left-col">
        <div class="profile-avatar-card card">
          <div class="profile-avatar-wrap">
            <img id="profile-avatar-preview" src="${e.avatar_url||w(e)}" class="profile-avatar-img" alt="${e.name||""}"/>
            <label class="profile-avatar-overlay" for="avatar-input" title="Change photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </label>
            <input type="file" id="avatar-input" accept="image/*" style="display:none"/>
          </div>
          <div class="profile-card-name">${e.name||""}</div>
          <div class="profile-card-role">
            <span class="admin-role-badge role-${c}">${b}</span>
          </div>
          <div class="profile-card-email">${e.email||""}</div>
          ${e.mobile?`<div class="profile-card-meta">📱 ${e.mobile}</div>`:""}
          ${e.department?`<div class="profile-card-meta">🏢 ${e.department}</div>`:""}
          ${e.designation?`<div class="profile-card-meta">💼 ${e.designation}</div>`:""}
          <div class="profile-card-meta" style="margin-top:8px;color:var(--muted);font-size:11px">Joined ${h}</div>
          <div id="avatar-status" class="profile-avatar-status"></div>
        </div>

        <!-- Task Stats -->
        <div class="card" style="margin-top:14px;padding:18px">
          <h4 style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:12px">MY TASK STATS</h4>
          <div class="profile-stats-grid">
            <div class="profile-stat"><span class="profile-stat-num">${n.total}</span><span class="profile-stat-lbl">Total</span></div>
            <div class="profile-stat" style="color:#f59e0b"><span class="profile-stat-num">${n.in_progress}</span><span class="profile-stat-lbl">Active</span></div>
            <div class="profile-stat" style="color:#10b981"><span class="profile-stat-num">${n.completed}</span><span class="profile-stat-lbl">Done</span></div>
            <div class="profile-stat" style="color:#ef4444"><span class="profile-stat-num">${n.overdue}</span><span class="profile-stat-lbl">Overdue</span></div>
          </div>
        </div>

        <!-- Projects -->
        ${f.length>0?`
        <div class="card" style="margin-top:14px;padding:18px">
          <h4 style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:10px">MY PROJECTS</h4>
          <div class="profile-projects-list">
            ${f.map(a=>`
              <a href="#/projects/${a.id}" class="profile-project-chip" style="background:${a.color}12;color:${a.color};border:1px solid ${a.color}30">
                <span class="profile-proj-dot" style="background:${a.color}"></span>
                ${a.name}
              </a>`).join("")}
          </div>
        </div>`:""}
      </div>

      <!-- Right Column: Forms -->
      <div class="profile-forms-col">

        <!-- Account Info -->
        <div class="card">
          <div class="card-header"><h3>Account Information</h3></div>
          <div class="card-body">
            <form id="profile-info-form">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" id="pf-name" class="form-input" value="${e.name||""}" placeholder="Your full name" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" id="pf-email" class="form-input" value="${e.email||""}" placeholder="you@example.com" required/>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Mobile</label>
                  <input type="text" id="pf-mobile" class="form-input" value="${e.mobile||""}" placeholder="+91 9876543210"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input type="text" id="pf-dept" class="form-input" value="${e.department||""}" placeholder="e.g. Engineering"/>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">Designation</label>
                  <input type="text" id="pf-desig" class="form-input" value="${e.designation||""}" placeholder="e.g. Senior Developer"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Timezone</label>
                  <input type="text" id="pf-timezone" class="form-input" value="${e.timezone||"UTC"}" placeholder="e.g. Asia/Kolkata"/>
                </div>
              </div>
              <div class="form-footer">
                <button type="submit" class="btn btn-primary" id="save-info-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card" style="margin-top:16px">
          <div class="card-header"><h3>Change Password</h3></div>
          <div class="card-body">
            <form id="profile-pw-form">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" id="pf-current-pw" class="form-input" placeholder="Enter current password"/>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input type="password" id="pf-new-pw" class="form-input" placeholder="At least 8 characters"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input type="password" id="pf-confirm-pw" class="form-input" placeholder="Repeat new password"/>
                </div>
              </div>
              <div class="form-footer">
                <button type="submit" class="btn btn-primary" id="save-pw-btn">Update Password</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>`,document.getElementById("avatar-input").addEventListener("change",async function(){const a=this.files[0];if(!a)return;const t=document.getElementById("avatar-status");t.textContent="Uploading…";const s=new FileReader;s.onload=l=>{document.getElementById("profile-avatar-preview").src=l.target.result},s.readAsDataURL(a);try{const l=new FormData;l.append("avatar",a);const r=await p.upload("/me/avatar",l),m=i.get("user");m&&(m.avatar_url=r.avatar_url,i.set("user",m));const y=document.getElementById("sidebar-avatar");y&&(y.src=r.avatar_url),t.textContent="✓ Photo updated",o("Profile photo updated","success")}catch{t.textContent="✗ Upload failed",o("Failed to upload photo","error")}}),document.getElementById("profile-info-form").addEventListener("submit",async function(a){a.preventDefault();const t=document.getElementById("save-info-btn");t.disabled=!0,t.textContent="Saving…";try{const s={name:document.getElementById("pf-name").value.trim(),email:document.getElementById("pf-email").value.trim(),mobile:document.getElementById("pf-mobile").value.trim()||null,department:document.getElementById("pf-dept").value.trim()||null,designation:document.getElementById("pf-desig").value.trim()||null,timezone:document.getElementById("pf-timezone").value.trim()||"UTC"},l=await p.patch("/me",s);i.set("user",l);const r=document.getElementById("sidebar-name");r&&(r.textContent=l.name),d.querySelector(".profile-card-name").textContent=l.name,d.querySelector(".profile-card-email").textContent=l.email,o("Profile updated","success")}catch(s){o((s==null?void 0:s.message)||"Failed to save profile","error")}finally{t.disabled=!1,t.textContent="Save Changes"}}),document.getElementById("profile-pw-form").addEventListener("submit",async function(a){a.preventDefault();const t=document.getElementById("save-pw-btn"),s=document.getElementById("pf-new-pw").value,l=document.getElementById("pf-confirm-pw").value;if(s!==l){o("Passwords do not match","error");return}if(s.length<8){o("Password must be at least 8 characters","error");return}t.disabled=!0,t.textContent="Updating…";try{await p.patch("/me",{current_password:document.getElementById("pf-current-pw").value,password:s,password_confirmation:l}),o("Password changed successfully","success"),document.getElementById("pf-current-pw").value="",document.getElementById("pf-new-pw").value="",document.getElementById("pf-confirm-pw").value=""}catch(r){o((r==null?void 0:r.message)||"Failed to change password","error")}finally{t.disabled=!1,t.textContent="Update Password"}})}export{E as renderProfile};
