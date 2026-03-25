import{a as m,s as p,b as E}from"./main-CxzuflVX.js";let v=null,$=null,w=null;async function A(t){t.innerHTML=`
    <div class="chat-layout">
      <div class="chat-sidebar" id="chat-sidebar">
        <div class="chat-sidebar-head">
          <h3>Channels</h3>
        </div>
        <div class="chat-channel-list" id="chat-channel-list">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
      <div class="chat-main" id="chat-main">
        <div class="chat-empty-state">
          <div class="chat-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p>Select a channel to start chatting</p>
        </div>
      </div>
    </div>`,await C()}async function C(){try{const t=await m.get("/chat/channels"),e=document.getElementById("chat-channel-list");if(!e)return;if(!t||t.length===0){e.innerHTML='<p class="chat-no-channels">No channels yet. Create a project to get started!</p>';return}e.innerHTML=t.map(a=>{var c,s;return`
      <div class="chat-channel-item ${a.id===v?"active":""}" data-channel-id="${a.id}">
        <div class="chat-channel-info">
          <span class="chat-channel-dot" style="background:${((c=a.project)==null?void 0:c.color)||"#6366f1"}"></span>
          <span class="chat-channel-name">${h(a.name)}</span>
        </div>
        <div class="chat-channel-meta">
          ${a.unread_count>0?`<span class="chat-unread-badge">${a.unread_count}</span>`:""}
          ${a.latest_message?`<span class="chat-last-time">${R(a.latest_message.created_at)}</span>`:""}
        </div>
        ${a.latest_message?`<div class="chat-channel-preview">${h(((s=a.latest_message.user)==null?void 0:s.name)||"")}: ${h(a.latest_message.body)}</div>`:""}
      </div>
    `}).join(""),e.querySelectorAll(".chat-channel-item").forEach(a=>{a.addEventListener("click",()=>M(parseInt(a.dataset.channelId)))})}catch(t){console.error("Failed to load channels:",t)}}async function M(t){var a,c;v=t,_(),document.querySelectorAll(".chat-channel-item").forEach(s=>{s.classList.toggle("active",parseInt(s.dataset.channelId)===t)});const e=document.getElementById("chat-main");e.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';try{const[s,r]=await Promise.all([m.get(`/chat/channels/${t}`),m.get(`/chat/channels/${t}/messages`)]),i=r.data||[];w=i.length>0?i[0].id:null,e.innerHTML=`
      <div class="chat-header">
        <div class="chat-header-info">
          <h3># ${h(s.name)}</h3>
          <span class="chat-header-members">${((a=s.members)==null?void 0:a.length)||0} members</span>
        </div>
        <div class="chat-header-actions">
          <button class="btn btn-ghost btn-sm" id="chat-members-btn" title="Members">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" id="chat-pins-btn" title="Pinned messages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${T(i.reverse())}
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrap">
          <textarea class="chat-input" id="chat-input" placeholder="Type a message..." rows="1"></textarea>
          <button class="chat-send-btn" id="chat-send-btn" title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>`;const o=document.getElementById("chat-messages");o.scrollTop=o.scrollHeight;const d=document.getElementById("chat-input"),l=document.getElementById("chat-send-btn"),n=async()=>{const g=d.value.trim();if(!g)return;const x=/@(\w+)/g,y=[];let f;for(;(f=x.exec(g))!==null;)y.push(f[1]);d.value="",d.style.height="auto";try{const L=await m.post(`/chat/channels/${t}/messages`,{body:g,mentions:y.length>0?y:null});S(L)}catch{p("Failed to send message","error")}};l.addEventListener("click",n),d.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),n())}),d.addEventListener("input",()=>{d.style.height="auto",d.style.height=Math.min(d.scrollHeight,120)+"px"}),(c=document.getElementById("chat-members-btn"))==null||c.addEventListener("click",()=>{H(s.members)}),B(t),q(t);const u=document.querySelector(`.chat-channel-item[data-channel-id="${t}"]`),b=u==null?void 0:u.querySelector(".chat-unread-badge");b&&b.remove()}catch{e.innerHTML='<div class="chat-empty-state"><p>Failed to load channel</p></div>'}}function T(t){var s,r,i,o,d,l;if(!t.length)return'<div class="chat-no-messages">No messages yet. Say hello!</div>';const e=E.get("user");let a="",c="";for(const n of t){const u=new Date(n.created_at).toLocaleDateString();u!==c&&(a+=`<div class="chat-date-divider"><span>${u}</span></div>`,c=u);const b=n.user_id===(e==null?void 0:e.id);if(n.type==="system"){a+=`<div class="chat-msg-system">${h(n.body)}</div>`;continue}const x=((s=n.user)==null?void 0:s.avatar_url)||((r=n.user)==null?void 0:r.avatar)||`https://ui-avatars.com/api/?name=${encodeURIComponent(((i=n.user)==null?void 0:i.name)||"?")}&size=32&background=6366f1&color=fff`,y=(o=n.reactions)!=null&&o.length?j(n.reactions,e==null?void 0:e.id):"",f=((d=n.replies)==null?void 0:d.length)||0;a+=`
      <div class="chat-msg ${b?"chat-msg-own":""}" data-msg-id="${n.id}">
        ${b?"":`<img class="chat-msg-avatar" src="${x}" alt="" />`}
        <div class="chat-msg-content">
          <div class="chat-msg-header">
            <span class="chat-msg-name">${h(((l=n.user)==null?void 0:l.name)||"Unknown")}</span>
            <span class="chat-msg-time">${I(n.created_at)}</span>
            ${n.edited_at?'<span class="chat-msg-edited">(edited)</span>':""}
          </div>
          <div class="chat-msg-body">${k(n.body)}</div>
          ${y}
          ${f>0?`<div class="chat-msg-thread"><span>${f} ${f===1?"reply":"replies"}</span></div>`:""}
          <div class="chat-msg-actions">
            <button class="chat-action-btn" data-action="react" data-msg-id="${n.id}" title="React">😊</button>
            <button class="chat-action-btn" data-action="reply" data-msg-id="${n.id}" title="Reply">↩</button>
            ${b?`<button class="chat-action-btn" data-action="edit" data-msg-id="${n.id}" title="Edit">✏️</button>`:""}
            <button class="chat-action-btn" data-action="pin" data-msg-id="${n.id}" title="Pin">📌</button>
          </div>
        </div>
      </div>`}return a}function j(t,e){const a={};for(const c of t)a[c.emoji]||(a[c.emoji]={count:0,users:[],hasOwn:!1}),a[c.emoji].count++,a[c.emoji].users.push(c.user_id),c.user_id===e&&(a[c.emoji].hasOwn=!0);return'<div class="chat-reactions">'+Object.entries(a).map(([c,s])=>`<span class="chat-reaction ${s.hasOwn?"own":""}" data-emoji="${c}">${c} ${s.count}</span>`).join("")+"</div>"}function B(t){const e=document.getElementById("chat-messages");e&&e.addEventListener("click",async a=>{const c=a.target.closest(".chat-action-btn");if(!c)return;const s=c.dataset.action,r=c.dataset.msgId;if(s==="react"){const i=["👍","❤️","😂","🎉","🤔","👀"],o=i[Math.floor(Math.random()*i.length)];try{await m.post(`/chat/messages/${r}/react`,{emoji:o}),M(t)}catch{}}if(s==="pin")try{const i=await m.post(`/chat/messages/${r}/pin`);p(i.is_pinned?"Message pinned":"Message unpinned","success")}catch{}if(s==="reply"){const i=document.getElementById("chat-input");i&&(i.focus(),i.placeholder="Replying to message...",i.dataset.replyTo=r)}if(s==="edit"){const i=e.querySelector(`.chat-msg[data-msg-id="${r}"]`),o=i==null?void 0:i.querySelector(".chat-msg-body");if(!o)return;const d=o.textContent;o.innerHTML=`<textarea class="chat-edit-input">${h(d)}</textarea>
        <div class="chat-edit-actions">
          <button class="btn btn-sm btn-ghost chat-edit-cancel">Cancel</button>
          <button class="btn btn-sm btn-primary chat-edit-save">Save</button>
        </div>`,o.querySelector(".chat-edit-cancel").addEventListener("click",()=>{o.innerHTML=k(d)}),o.querySelector(".chat-edit-save").addEventListener("click",async()=>{const l=o.querySelector(".chat-edit-input").value.trim();if(l)try{await m.put(`/chat/messages/${r}`,{body:l}),o.innerHTML=k(l),p("Message edited","success")}catch{}})}})}function S(t){var o,d,l,n;const e=document.getElementById("chat-messages");if(!e)return;const a=e.querySelector(".chat-no-messages");a&&a.remove();const c=E.get("user"),s=t.user_id===(c==null?void 0:c.id),r=((o=t.user)==null?void 0:o.avatar_url)||((d=t.user)==null?void 0:d.avatar)||`https://ui-avatars.com/api/?name=${encodeURIComponent(((l=t.user)==null?void 0:l.name)||"?")}&size=32&background=6366f1&color=fff`,i=document.createElement("div");i.className=`chat-msg ${s?"chat-msg-own":""}`,i.dataset.msgId=t.id,i.innerHTML=`
    ${s?"":`<img class="chat-msg-avatar" src="${r}" alt="" />`}
    <div class="chat-msg-content">
      <div class="chat-msg-header">
        <span class="chat-msg-name">${h(((n=t.user)==null?void 0:n.name)||"You")}</span>
        <span class="chat-msg-time">${I(t.created_at||new Date().toISOString())}</span>
      </div>
      <div class="chat-msg-body">${k(t.body)}</div>
      <div class="chat-msg-actions">
        <button class="chat-action-btn" data-action="react" data-msg-id="${t.id}" title="React">😊</button>
        <button class="chat-action-btn" data-action="reply" data-msg-id="${t.id}" title="Reply">↩</button>
        ${s?`<button class="chat-action-btn" data-action="edit" data-msg-id="${t.id}" title="Edit">✏️</button>`:""}
        <button class="chat-action-btn" data-action="pin" data-msg-id="${t.id}" title="Pin">📌</button>
      </div>
    </div>`,e.appendChild(i),e.scrollTop=e.scrollHeight,w=t.id}function H(t){var c;let e=document.querySelector(".chat-members-popup");if(e){e.remove();return}const a=document.createElement("div");a.className="chat-members-popup",a.innerHTML=`
    <div class="chat-members-head">
      <h4>Channel Members (${t.length})</h4>
      <button class="btn btn-ghost btn-sm chat-members-close">&times;</button>
    </div>
    <div class="chat-members-list">
      ${t.map(s=>`
        <div class="chat-member-item" style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            <img src="${s.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=28&background=6366f1&color=fff`}" class="chat-member-avatar" />
            <span class="chat-member-name">${h(s.name)}</span>
            ${s.role==="admin"?'<span class="chat-member-role">Admin</span>':""}
          </div>
          <button class="btn btn-ghost btn-sm chat-remove-member-btn" data-member-id="${s.id}" title="Remove member" style="color:var(--red,#dc2626);padding:2px 6px;font-size:16px;line-height:1">&times;</button>
        </div>
      `).join("")}
    </div>
    <button class="btn btn-primary btn-sm" id="chat-add-member-btn" style="width:100%;margin-top:10px">
      + Add Members
    </button>`,document.getElementById("chat-main").appendChild(a),a.querySelector(".chat-members-close").addEventListener("click",()=>a.remove()),a.querySelectorAll(".chat-remove-member-btn").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.memberId;if(confirm("Remove this member from the channel?"))try{await m.delete(`/chat/channels/${v}/members/${r}`),p("Member removed","success"),M(v)}catch{p("Failed to remove member","error")}})}),(c=document.getElementById("chat-add-member-btn"))==null||c.addEventListener("click",async()=>{try{const s=await m.get("/users/search?per_page=50"),r=Array.isArray(s)?s:s.data||[],i=t.map(n=>n.id),o=r.filter(n=>!i.includes(n.id));if(o.length===0){p("No more users to add","info");return}const d=a.querySelector(".chat-members-list");d.innerHTML=`
        <div style="margin-bottom:8px;font-size:13px;color:var(--text2,#64748b)">Select users to add:</div>
        ${o.map(n=>`
          <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;cursor:pointer;font-size:13px;border-radius:4px" class="chat-add-member-opt">
            <input type="checkbox" value="${n.id}" class="chat-add-member-cb"/>
            <img src="${n.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(n.name)}&size=24&background=6366f1&color=fff`}" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
            ${h(n.name)}
          </label>
        `).join("")}`;const l=document.getElementById("chat-add-member-btn");l.textContent="Confirm Add",l.onclick=async()=>{const n=[...a.querySelectorAll(".chat-add-member-cb:checked")].map(u=>parseInt(u.value));if(n.length===0){p("Select at least one user","error");return}try{await m.post(`/chat/channels/${v}/members`,{user_ids:n}),p(`${n.length} member(s) added`,"success"),M(v)}catch{p("Failed to add members","error")}}}catch{p("Failed to load users","error")}})}function q(t){$=setInterval(async()=>{var e;if(v!==t)return _();try{const c=(await m.get(`/chat/channels/${t}/messages`,{per_page:10})).data||[];if(c.length>0&&c[0].id!==w){const s=[];for(const r of c){if(r.id===w)break;r.user_id!==((e=E.get("user"))==null?void 0:e.id)&&s.unshift(r)}s.forEach(r=>S(r))}}catch{}},5e3)}function _(){$&&(clearInterval($),$=null)}function k(t){let e=h(t);return e=e.replace(/@(\w+)/g,'<span class="chat-mention">@$1</span>'),e=e.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>'),e=e.replace(/\n/g,"<br>"),e}function I(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function R(t){const e=(Date.now()-new Date(t).getTime())/1e3;return e<60?"now":e<3600?Math.floor(e/60)+"m":e<86400?Math.floor(e/3600)+"h":Math.floor(e/86400)+"d"}function h(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}export{A as renderChat};
