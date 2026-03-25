import{a as v,b as M,s as r}from"./main-CxzuflVX.js";import{a as E}from"./helpers-ByTbCZyC.js";const k={scheduled:{label:"Scheduled",color:"#3b82f6",bg:"#dbeafe"},in_progress:{label:"In Progress",color:"#f59e0b",bg:"#fef3c7"},completed:{label:"Completed",color:"#10b981",bg:"#dcfce7"},cancelled:{label:"Cancelled",color:"#94a3b8",bg:"#f1f5f9"}},h={pending:{label:"Pending",color:"#94a3b8",icon:"⏳"},accepted:{label:"Accepted",color:"#10b981",icon:"✅"},declined:{label:"Declined",color:"#ef4444",icon:"❌"},tentative:{label:"Tentative",color:"#f59e0b",icon:"❓"}};async function w(a){var i;a.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const e=new Date;e.setDate(e.getDate()-7);const o=new Date;o.setDate(o.getDate()+30);let t=[];try{t=(await v.get(`/meetings?from=${I(e)}&to=${I(o)}`)).data||[]}catch{a.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Could not load meetings</h3></div>';return}const p=t.filter(l=>l.status==="scheduled"||l.status==="in_progress"),d=t.filter(l=>l.status==="completed"||l.status==="cancelled");a.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Meetings</h1>
        <p>${t.length} meeting${t.length!==1?"s":""}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary btn-sm" id="new-meeting-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>
          New Meeting
        </button>
      </div>
    </div>

    ${p.length>0?`
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-head"><span class="section-title">Upcoming & Active</span></div>
      <div class="mtg-list">${p.map(l=>L(l)).join("")}</div>
    </div>`:""}

    ${d.length>0?`
    <div class="section-card">
      <div class="section-head"><span class="section-title">Past Meetings</span></div>
      <div class="mtg-list">${d.map(l=>L(l)).join("")}</div>
    </div>`:""}

    ${t.length===0?`
    <div class="full-empty">
      <div class="full-empty-icon">📅</div>
      <h3>No meetings yet</h3>
      <p>Create your first meeting to get started.</p>
    </div>`:""}`,(i=document.getElementById("new-meeting-btn"))==null||i.addEventListener("click",()=>D(a)),a.querySelectorAll(".mtg-card").forEach(l=>{l.addEventListener("click",()=>B(a,l.dataset.meetingId,t))})}function L(a){var i,l,y,s,c,u;const e=k[a.status]||k.scheduled,o=new Date(a.scheduled_start),t=new Date(a.scheduled_end),p=(i=M.get("user"))==null?void 0:i.id,d=(l=a.attendees)==null?void 0:l.find(m=>m.id===p);return`
    <div class="mtg-card" data-meeting-id="${a.id}">
      <div class="mtg-card-color" style="background:${a.color||"#f59e0b"}"></div>
      <div class="mtg-card-body">
        <div class="mtg-card-top">
          <h4 class="mtg-card-title">${a.title}</h4>
          <span class="mtg-status-pill" style="background:${e.bg};color:${e.color}">${e.label}</span>
        </div>
        <div class="mtg-card-meta">
          <span>📅 ${o.toLocaleDateString("en",{month:"short",day:"numeric"})}</span>
          <span>🕐 ${o.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})} – ${t.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</span>
          <span>⏱ ${a.duration_minutes}min</span>
          ${a.location?`<span>📍 ${a.location}</span>`:""}
          ${a.video_link?"<span>🔗 Video</span>":""}
        </div>
        <div class="mtg-card-bottom">
          <div class="mtg-card-attendees">
            <img src="${E(a.organizer)}" title="Organizer: ${(y=a.organizer)==null?void 0:y.name}" class="av-xs" style="border:2px solid ${a.color||"#f59e0b"};border-radius:50%"/>
            ${(a.attendees||[]).slice(0,5).map(m=>{var g;return`<img src="${E(m)}" title="${m.name} (${((g=h[m.rsvp_status])==null?void 0:g.label)||"Pending"})" class="av-xs" style="border-radius:50%;margin-left:-6px"/>`}).join("")}
            ${(a.attendees||[]).length>5?`<span class="mtg-more-badge">+${a.attendees.length-5}</span>`:""}
          </div>
          ${d?`<span class="mtg-rsvp-badge" style="color:${(s=h[d.rsvp_status])==null?void 0:s.color}">${(c=h[d.rsvp_status])==null?void 0:c.icon} ${(u=h[d.rsvp_status])==null?void 0:u.label}</span>`:""}
          ${a.project?`<span class="task-proj-chip" style="background:${a.project.color}18;color:${a.project.color}">${a.project.name}</span>`:""}
        </div>
      </div>
    </div>`}async function B(a,e,o){var u,m,g,$,f;let t=o==null?void 0:o.find(n=>n.id==e);if(!t)try{t=(await v.get(`/meetings/${e}`)).data}catch{r("Failed to load meeting","error");return}const p=(u=M.get("user"))==null?void 0:u.id,d=((m=t.organizer)==null?void 0:m.id)===p,i=k[t.status]||k.scheduled,l=new Date(t.scheduled_start),y=new Date(t.scheduled_end),s=document.createElement("div");s.className="modal-overlay",s.innerHTML=`
    <div class="modal" style="max-width:600px;max-height:85vh;overflow-y:auto">
      <div class="modal-header">
        <div>
          <h3>${t.title}</h3>
          <span class="mtg-status-pill" style="background:${i.bg};color:${i.color};font-size:11px">${i.label}</span>
        </div>
        <button class="modal-close" id="md-close">&times;</button>
      </div>
      <div class="modal-body" style="padding:16px 20px">
        ${t.description?`<p style="color:var(--text2);margin-bottom:14px">${t.description}</p>`:""}

        <div class="mtg-detail-grid">
          <div class="mtg-detail-item"><span class="mtg-detail-label">Date</span><span>${l.toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</span></div>
          <div class="mtg-detail-item"><span class="mtg-detail-label">Time</span><span>${l.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})} – ${y.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})} (${t.duration_minutes}min)</span></div>
          ${t.location?`<div class="mtg-detail-item"><span class="mtg-detail-label">Location</span><span>📍 ${t.location}</span></div>`:""}
          ${t.video_link?`<div class="mtg-detail-item"><span class="mtg-detail-label">Video Link</span><a href="${t.video_link}" target="_blank" rel="noopener" style="color:var(--brand);text-decoration:underline">Join Meeting</a></div>`:""}
          <div class="mtg-detail-item"><span class="mtg-detail-label">Organizer</span><div style="display:flex;align-items:center;gap:6px"><img src="${E(t.organizer)}" class="av-xs" style="border-radius:50%"/> ${(g=t.organizer)==null?void 0:g.name}</div></div>
        </div>

        <div style="margin-top:16px">
          <span class="ts-label">Attendees (${(t.attendees||[]).length})</span>
          <div class="mtg-attendee-list">
            ${(t.attendees||[]).map(n=>{const b=h[n.rsvp_status]||h.pending;return`<div class="mtg-attendee-row">
                <img src="${E(n)}" class="av-xs" style="border-radius:50%"/>
                <span>${n.name}</span>
                <span class="mtg-rsvp-pill" style="color:${b.color}">${b.icon} ${b.label}</span>
              </div>`}).join("")}
          </div>
        </div>

        ${t.status==="scheduled"&&!d?`
        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" id="rsvp-accept">Accept</button>
          <button class="btn btn-ghost btn-sm" id="rsvp-tentative">Tentative</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--red)" id="rsvp-decline">Decline</button>
        </div>`:""}

        <div style="margin-top:16px">
          <span class="ts-label">Meeting Notes</span>
          <textarea id="md-notes" class="form-input" rows="4" placeholder="Add meeting notes…" ${d?"":"readonly"}>${t.notes||""}</textarea>
          ${d?'<button class="btn btn-ghost btn-sm" id="md-save-notes" style="margin-top:6px">Save Notes</button>':""}
        </div>
      </div>
      <div class="modal-footer">
        ${d?'<button class="btn btn-ghost btn-sm" style="color:var(--red)" id="md-delete">Delete Meeting</button>':""}
        <button class="btn btn-ghost" id="md-cancel">Close</button>
      </div>
    </div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("active"));const c=()=>{s.remove()};s.addEventListener("click",n=>{n.target===s&&c()}),document.getElementById("md-close").addEventListener("click",c),document.getElementById("md-cancel").addEventListener("click",c),["accept","tentative","decline"].forEach(n=>{var b;(b=document.getElementById(`rsvp-${n}`))==null||b.addEventListener("click",async()=>{const _={accept:"accepted",tentative:"tentative",decline:"declined"};try{await v.post(`/meetings/${t.id}/rsvp`,{status:_[n]}),r(`RSVP: ${_[n]}`,"success"),c(),w(a)}catch{r("Failed to RSVP","error")}})}),($=document.getElementById("md-save-notes"))==null||$.addEventListener("click",async()=>{try{await v.patch(`/meetings/${t.id}/notes`,{notes:document.getElementById("md-notes").value}),r("Notes saved","success")}catch{r("Failed to save notes","error")}}),(f=document.getElementById("md-delete"))==null||f.addEventListener("click",async()=>{if(confirm("Delete this meeting?"))try{await v.delete(`/meetings/${t.id}`),r("Meeting deleted","success"),c(),w(a)}catch{r("Failed to delete","error")}})}async function D(a,e=null){var l,y;const o=!!e;let t=[];try{const s=await v.get("/users/search?per_page=50");t=Array.isArray(s)?s:s.data||[]}catch{}let p=[];try{p=(await v.get("/projects")).data||[]}catch{}const d=document.createElement("div");d.className="modal-overlay",d.innerHTML=`
    <div class="modal" style="max-width:520px;max-height:85vh;overflow-y:auto">
      <div class="modal-header">
        <h3>${o?"Edit Meeting":"New Meeting"}</h3>
        <button class="modal-close" id="mm-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Title <span style="color:var(--red)">*</span></label>
          <input type="text" class="form-input" id="mm-title" value="${(e==null?void 0:e.title)||""}" placeholder="Meeting title" required/>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" id="mm-desc" rows="2" placeholder="What is this meeting about?">${(e==null?void 0:e.description)||""}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Start <span style="color:var(--red)">*</span></label>
            <input type="datetime-local" class="form-input" id="mm-start" value="${((l=e==null?void 0:e.scheduled_start)==null?void 0:l.slice(0,16))||""}" required/>
          </div>
          <div class="form-group">
            <label class="form-label">End <span style="color:var(--red)">*</span></label>
            <input type="datetime-local" class="form-input" id="mm-end" value="${((y=e==null?void 0:e.scheduled_end)==null?void 0:y.slice(0,16))||""}" required/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-input" id="mm-location" value="${(e==null?void 0:e.location)||""}" placeholder="Room or address"/>
          </div>
          <div class="form-group">
            <label class="form-label">Video Link</label>
            <input type="url" class="form-input" id="mm-video" value="${(e==null?void 0:e.video_link)||""}" placeholder="https://meet.google.com/..."/>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label">Project</label>
            <select class="form-input form-select" id="mm-project">
              <option value="">None</option>
              ${p.map(s=>`<option value="${s.id}" ${(e==null?void 0:e.project_id)==s.id?"selected":""}>${s.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <input type="color" class="form-input" id="mm-color" value="${(e==null?void 0:e.color)||"#f59e0b"}" style="height:38px;padding:4px"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Attendees</label>
          <div class="mtg-attendee-picker" id="mm-attendees">
            ${t.map(s=>`
              <label class="mtg-attendee-option">
                <input type="checkbox" value="${s.id}" ${((e==null?void 0:e.attendees)||[]).some(c=>c.id===s.id)?"checked":""}/>
                <img src="${s.avatar_url||E(s)}" class="av-xs" style="border-radius:50%"/>
                <span>${s.name}</span>
              </label>`).join("")}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="mm-cancel">Cancel</button>
        <button class="btn btn-primary" id="mm-submit">${o?"Save Changes":"Create Meeting"}</button>
      </div>
    </div>`,document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("active")),document.getElementById("mm-title").focus();const i=()=>{d.remove()};d.addEventListener("click",s=>{s.target===d&&i()}),document.getElementById("mm-close").addEventListener("click",i),document.getElementById("mm-cancel").addEventListener("click",i),document.getElementById("mm-submit").addEventListener("click",async()=>{var $,f;const s=document.getElementById("mm-title").value.trim(),c=document.getElementById("mm-start").value,u=document.getElementById("mm-end").value;if(!s||!c||!u){r("Title, start and end time are required","error");return}const m=[...document.querySelectorAll("#mm-attendees input:checked")].map(n=>parseInt(n.value)),g={title:s,description:document.getElementById("mm-desc").value.trim()||null,scheduled_start:c,scheduled_end:u,location:document.getElementById("mm-location").value.trim()||null,video_link:document.getElementById("mm-video").value.trim()||null,project_id:document.getElementById("mm-project").value||null,color:document.getElementById("mm-color").value,attendee_ids:m};try{o?(await v.patch(`/meetings/${e.id}`,g),r("Meeting updated","success")):(await v.post("/meetings",g),r("Meeting created","success")),i(),w(a)}catch(n){const b=((f=($=n==null?void 0:n.response)==null?void 0:$.data)==null?void 0:f.message)||(n==null?void 0:n.message)||"Failed";r(b,"error")}})}function I(a){return a.toISOString().slice(0,10)}export{w as renderMeetings};
