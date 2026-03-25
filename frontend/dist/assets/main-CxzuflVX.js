const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/dashboard-BKpG-p4Y.js","assets/helpers-ByTbCZyC.js","assets/projects-D7w3Rnl6.js","assets/projects-8oxmbYM-.js","assets/milestones-CVvBUD-S.js","assets/modal-jGhccxZ4.js","assets/tasks-DNAIkEJT.js","assets/tasks-qIqnclG-.js","assets/kanban-NQJrWBTU.js","assets/sortable.esm-CIycMrXb.js","assets/reports-CsaXTVFZ.js","assets/milestones-B76eYeA7.js","assets/goals-DuwWBg4u.js","assets/dependencies-ebBhUk42.js","assets/calendar-CH3Ap-oK.js","assets/profile-B9n8tqZB.js","assets/admin-DiFmEgrB.js","assets/meetings-DcxmzlfX.js"])))=>i.map(i=>d[i]);
var ne=e=>{throw TypeError(e)};var ie=(e,t,s)=>t.has(e)||ne("Cannot "+s);var _=(e,t,s)=>(ie(e,t,"read from private field"),s?s.call(e):t.get(e)),W=(e,t,s)=>t.has(e)?ne("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),re=(e,t,s,a)=>(ie(e,t,"write to private field"),a?a.call(e,s):t.set(e,s),s);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(o){if(o.ep)return;o.ep=!0;const n=s(o);fetch(o.href,n)}})();const $e="modulepreload",Ie=function(e){return"/"+e},le={},m=function(t,s,a){let o=Promise.resolve();if(s&&s.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),r=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));o=Promise.allSettled(s.map(l=>{if(l=Ie(l),l in le)return;le[l]=!0;const c=l.endsWith(".css"),b=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${b}`))return;const h=document.createElement("link");if(h.rel=c?"stylesheet":$e,c||(h.as="script"),h.crossOrigin="",h.href=l,r&&h.setAttribute("nonce",r),document.head.appendChild(h),c)return new Promise((k,v)=>{h.addEventListener("load",k),h.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(i){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=i,window.dispatchEvent(r),!r.defaultPrevented)throw i}return o.then(i=>{for(const r of i||[])r.status==="rejected"&&n(r.reason);return t().catch(n)})};var T,E;class Me{constructor(){W(this,T,{});W(this,E,{})}set(t,s){_(this,T)[t]=s,(_(this,E)[t]||[]).forEach(a=>a(s))}get(t){return _(this,T)[t]}clear(){re(this,T,{})}subscribe(t,s){return _(this,E)[t]||(_(this,E)[t]=[]),_(this,E)[t].push(s),()=>{_(this,E)[t]=_(this,E)[t].filter(a=>a!==s)}}}T=new WeakMap,E=new WeakMap;const d=new Me,xe={"/dashboard":()=>m(()=>import("./dashboard-BKpG-p4Y.js"),__vite__mapDeps([0,1])).then(e=>e.renderDashboard),"/projects":()=>m(()=>import("./projects-D7w3Rnl6.js"),__vite__mapDeps([2,3,4,5,1])).then(e=>e.renderProjects),"/my-tasks":()=>m(()=>import("./tasks-DNAIkEJT.js"),__vite__mapDeps([6,7,5,1])).then(e=>e.renderMyTasks),"/kanban":()=>m(()=>import("./kanban-NQJrWBTU.js"),__vite__mapDeps([8,7,1,9])).then(e=>e.renderKanban),"/reports":()=>m(()=>import("./reports-CsaXTVFZ.js"),__vite__mapDeps([10,1])).then(e=>e.renderReports),"/milestones":()=>m(()=>import("./milestones-B76eYeA7.js"),__vite__mapDeps([11,4,3,1])).then(e=>e.renderMilestones),"/goals":()=>m(()=>import("./goals-DuwWBg4u.js"),__vite__mapDeps([12,5,1])).then(e=>e.renderGoals),"/dependencies":()=>m(()=>import("./dependencies-ebBhUk42.js"),__vite__mapDeps([13,1])).then(e=>e.renderDependencies),"/calendar":()=>m(()=>import("./calendar-CH3Ap-oK.js"),__vite__mapDeps([14,1])).then(e=>e.renderCalendar),"/profile":()=>m(()=>import("./profile-B9n8tqZB.js"),__vite__mapDeps([15,1])).then(e=>e.renderProfile),"/admin":()=>m(()=>import("./admin-DiFmEgrB.js"),__vite__mapDeps([16,1])).then(e=>e.renderAdmin),"/chat":()=>m(()=>import("./chat-AHOnebX_.js"),[]).then(e=>e.renderChat),"/work-sessions":()=>m(()=>Promise.resolve().then(()=>wt),void 0).then(e=>e.renderWorkSessions),"/meetings":()=>m(()=>import("./meetings-DcxmzlfX.js"),__vite__mapDeps([17,1])).then(e=>e.renderMeetings),"/schedule":()=>m(()=>import("./schedule-CKGcQ8QL.js"),[]).then(e=>e.renderMySchedule)};class Ce{constructor(){this.currentRoute=null,window.addEventListener("hashchange",()=>{this.navigate(location.hash.slice(1)||"/dashboard")})}async navigate(t){const s=document.getElementById("page-wrap"),a=document.getElementById("page-title");let o=xe[t];if(!o){const n=t.match(/^\/projects\/(\d+)\/kanban$/);n&&(o=()=>m(()=>import("./kanban-NQJrWBTU.js"),__vite__mapDeps([8,7,1,9])).then(l=>l.renderKanban(n[1])));const i=t.match(/^\/projects\/(\d+)$/);i&&(o=()=>m(()=>import("./projects-D7w3Rnl6.js"),__vite__mapDeps([2,3,4,5,1])).then(async l=>await l.renderProjectDetail(i[1])));const r=t.match(/^\/tasks\/(\d+)$/);r&&(o=()=>m(()=>import("./tasks-DNAIkEJT.js"),__vite__mapDeps([6,7,5,1])).then(l=>l.renderTaskDetail(r[1])))}if(!o){s.innerHTML='<div class="full-empty"><div class="full-empty-icon">🔍</div><h3>404 — Page not found</h3></div>';return}s.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';try{const n=await o();this.currentRoute=t,location.hash=t,document.querySelectorAll(".nav-link").forEach(r=>{const l=r.dataset.page;r.classList.toggle("active",t.startsWith("/"+l))});const i={"/dashboard":"Dashboard","/projects":"Projects","/my-tasks":"My Tasks","/reports":"Reports","/milestones":"Milestones","/goals":"Goals","/dependencies":"Dependencies","/calendar":"Calendar","/profile":"Profile Settings","/admin":"User Management","/chat":"Chat","/work-sessions":"Work Sessions","/meetings":"Meetings","/schedule":"My Schedule"};a&&(a.textContent=i[t]||"Vilva Taskspace"),await n(s)}catch(n){console.error("Router error:",n),s.innerHTML='<div class="full-empty"><div class="full-empty-icon">⚠️</div><h3>Failed to load page</h3><p>Check the console for details.</p></div>'}}}const P=new Ce,Pt=Object.freeze(Object.defineProperty({__proto__:null,router:P},Symbol.toStringTag,{value:"Module"}));function u(e,t="info",s=3500){const a=document.getElementById("toast-container");if(!a)return;const o={success:"✓",error:"✕",warning:"⚠",info:"ℹ"},n=document.createElement("div");n.className=`toast toast-${t}`,n.innerHTML=`<span class="toast-icon">${o[t]||"ℹ"}</span><span class="toast-msg">${e}</span>`,a.appendChild(n),requestAnimationFrame(()=>n.classList.add("show"));const i=()=>{n.classList.remove("show"),n.addEventListener("transitionend",()=>n.remove(),{once:!0})};setTimeout(i,s),n.addEventListener("click",i)}const ce="/api/v1";class Pe{async request(t,s,a=null,o={}){const n=d.get("token")||localStorage.getItem("vilva_token"),i={Accept:"application/json","Content-Type":"application/json",...n?{Authorization:`Bearer ${n}`}:{},...o.headers},r={method:t,headers:i};a&&t!=="GET"&&(a instanceof FormData?(delete i["Content-Type"],r.body=a):r.body=JSON.stringify(a));const l=a&&t==="GET"?`${ce}${s}?${new URLSearchParams(a)}`:`${ce}${s}`,c=await fetch(l,r);if(c.status===401){if(!["/me","/login","/register"].some(B=>s.endsWith(B))){localStorage.removeItem("vilva_token"),location.reload();return}const v=await c.json().catch(()=>({message:"Unauthenticated"}));throw new Error(v.message||"Unauthenticated")}if(c.status===204||c.headers.get("content-length")==="0")return null;const h=(c.headers.get("content-type")||"").includes("application/json")?await c.json():await c.text();if(!c.ok){const k=(h==null?void 0:h.message)||(h==null?void 0:h.error)||`HTTP ${c.status}`;throw u(k,"error"),new Error(k)}return h}get(t,s=null){return this.request("GET",t,s)}post(t,s=null){return this.request("POST",t,s)}put(t,s=null){return this.request("PUT",t,s)}patch(t,s=null){return this.request("PATCH",t,s)}delete(t){return this.request("DELETE",t)}upload(t,s){return this.request("POST",t,s)}}const p=new Pe,me=Object.freeze(Object.defineProperty({__proto__:null,api:p},Symbol.toStringTag,{value:"Module"})),pe=async(e,t)=>{const s=await p.post("/login",{email:e,password:t});return localStorage.setItem("vilva_token",s.token),d.set("token",s.token),d.set("user",s.user),s},he=async e=>{const t=await p.post("/register",e);return localStorage.setItem("vilva_token",t.token),d.set("token",t.token),d.set("user",t.user),t},Ae=()=>p.post("/logout"),De=()=>p.get("/me"),ve=Object.freeze(Object.defineProperty({__proto__:null,fetchCurrentUser:De,login:pe,logout:Ae,register:he},Symbol.toStringTag,{value:"Module"}));function je(){A()}function A(){document.getElementById("auth-form-slot").innerHTML=`
    <form id="login-form">
      <h2 class="auth-heading">Welcome back</h2>
      <p class="auth-sub">Sign in to your workspace</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-input" placeholder="••••••••" required autocomplete="current-password"/>
      </div>
      <div style="text-align:right;margin-bottom:6px">
        <a href="#" id="go-forgot" class="auth-forgot-link">Forgot password?</a>
      </div>
      <button type="submit" class="auth-btn" id="login-submit">
        Sign In
      </button>
      <p class="auth-switch">New to Vilva? <a href="#" id="go-register">Create an account</a></p>
    </form>`,document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("login-submit");t.textContent="Signing in…",t.disabled=!0;try{await pe(e.target.email.value,e.target.password.value),location.reload()}catch{t.textContent="Sign In",t.disabled=!1}}),document.getElementById("go-register").addEventListener("click",e=>{e.preventDefault(),Oe()}),document.getElementById("go-forgot").addEventListener("click",e=>{e.preventDefault(),qe()})}function Oe(){document.getElementById("auth-form-slot").innerHTML=`
    <form id="register-form">
      <h2 class="auth-heading">Create account</h2>
      <p class="auth-sub">Start managing your work today</p>
      <div class="form-group">
        <label class="form-label">Full name</label>
        <input type="text" name="name" class="form-input" placeholder="Jane Smith" required autocomplete="name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Work email</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-input" placeholder="Min. 8 characters" required autocomplete="new-password"/>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm password</label>
          <input type="password" name="password_confirmation" class="form-input" placeholder="Confirm" required autocomplete="new-password"/>
        </div>
      </div>
      <button type="submit" class="auth-btn" id="register-submit" style="margin-top:10px">
        Create Account
      </button>
      <p class="auth-switch">Already have an account? <a href="#" id="go-login">Sign in</a></p>
    </form>`,document.getElementById("register-form").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("register-submit");t.textContent="Creating account…",t.disabled=!0;const s=new FormData(e.target);try{await he(Object.fromEntries(s.entries())),location.reload()}catch{t.textContent="Create Account",t.disabled=!1}}),document.getElementById("go-login").addEventListener("click",e=>{e.preventDefault(),A()})}function qe(){document.getElementById("auth-form-slot").innerHTML=`
    <form id="forgot-form">
      <h2 class="auth-heading">Forgot password?</h2>
      <p class="auth-sub">Enter your email and we'll send you a 6-digit reset code</p>
      <div class="form-group">
        <label class="form-label">Email address</label>
        <input type="email" name="email" class="form-input" placeholder="you@company.com" required autocomplete="email"/>
      </div>
      <button type="submit" class="auth-btn" id="forgot-submit">
        Send Reset Code
      </button>
      <p class="auth-switch"><a href="#" id="go-login">Back to sign in</a></p>
    </form>`,document.getElementById("forgot-form").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("forgot-submit"),s=e.target.email.value.trim();t.textContent="Sending…",t.disabled=!0;try{const a=await p.post("/forgot-password",{email:s});a.reset_code?u(`Reset code: ${a.reset_code}`,"success"):u("Reset code sent to your email","success"),Re(s,a.reset_code||"")}catch(a){t.textContent="Send Reset Code",t.disabled=!1,u((a==null?void 0:a.message)||"Failed to send reset code","error")}}),document.getElementById("go-login").addEventListener("click",e=>{e.preventDefault(),A()})}function Re(e,t){document.getElementById("auth-form-slot").innerHTML=`
    <form id="reset-form">
      <h2 class="auth-heading">Reset password</h2>
      <p class="auth-sub">Enter the 6-digit code and your new password</p>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" value="${e}" readonly style="opacity:.7"/>
      </div>
      <div class="form-group">
        <label class="form-label">Reset Code</label>
        <input type="text" name="code" class="form-input" placeholder="6-digit code" required maxlength="6"
               value="${t}" style="letter-spacing:6px;font-size:18px;font-weight:700;text-align:center"/>
      </div>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" name="password" class="form-input" placeholder="Min. 8 characters" required autocomplete="new-password"/>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <input type="password" name="password_confirmation" class="form-input" placeholder="Confirm password" required autocomplete="new-password"/>
      </div>
      <button type="submit" class="auth-btn" id="reset-submit">
        Reset Password
      </button>
      <p class="auth-switch"><a href="#" id="go-login">Back to sign in</a></p>
    </form>`,document.getElementById("reset-form").addEventListener("submit",async s=>{s.preventDefault();const a=document.getElementById("reset-submit"),o=s.target.code.value.trim(),n=s.target.password.value,i=s.target.password_confirmation.value;if(n!==i){u("Passwords do not match","error");return}if(n.length<8){u("Password must be at least 8 characters","error");return}a.textContent="Resetting…",a.disabled=!0;try{const r=await p.post("/reset-password",{email:e,code:o,password:n,password_confirmation:i});u(r.message||"Password reset! You can now sign in.","success"),A()}catch(r){a.textContent="Reset Password",a.disabled=!1,u((r==null?void 0:r.message)||"Reset failed","error")}}),document.getElementById("go-login").addEventListener("click",s=>{s.preventDefault(),A()})}const ge=()=>p.get("/notifications/unread"),K=e=>p.post(`/notifications/${e}/read`),He=()=>p.post("/notifications/read-all"),Ne=Object.freeze(Object.defineProperty({__proto__:null,getUnread:ge,markAllRead:He,markRead:K},Symbol.toStringTag,{value:"Module"}));let G=0;async function Ve(){await x(),"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission(),setInterval(x,15e3)}async function x(){try{const e=await ge(),t=e.count||0,s=document.getElementById("notif-dot");s&&(t>0?(s.classList.remove("hidden"),s.textContent=t>99?"99+":t):s.classList.add("hidden")),!d.get("notificationsPaused")&&t>G&&"Notification"in window&&Notification.permission==="granted"&&(e.data||[]).slice(0,t-G).forEach(n=>{const i=typeof n.data=="string"?JSON.parse(n.data):n.data,r=new Notification("Vilva Taskspace",{body:i.message||"You have a new notification",icon:"/favicon.ico",tag:n.id});r.onclick=()=>{window.focus(),i.action_url&&(location.hash=i.action_url),r.close()}}),G=t,Fe(e.data||[])}catch{}}function Fe(e){const t=document.getElementById("notif-list");if(!t)return;if(e.length===0){t.innerHTML='<p class="notif-empty">No unread notifications</p>';return}const s={};e.forEach(o=>{const n=typeof o.data=="string"?JSON.parse(o.data):o.data,i=n.type||"other";s[i]||(s[i]=[]),s[i].push({...o,_data:n})});let a=`<div class="notif-tabs">
    <button class="notif-tab active" data-filter="all">All (${e.length})</button>
    ${Object.entries(s).map(([o,n])=>`<button class="notif-tab" data-filter="${o}">${de(o)} ${n.length}</button>`).join("")}
  </div>`;a+='<div class="notif-items">',a+=e.map(o=>{const n=typeof o.data=="string"?JSON.parse(o.data):o.data,i=n.type||"other";return`
      <div class="notif-item ${o.read_at?"":"unread"}" data-id="${o.id}" data-type="${i}">
        <div class="notif-icon-wrap notif-icon-${i}">${de(n.type)}</div>
        <div class="notif-content">
          ${n.title?`<p class="notif-title">${n.title}</p>`:""}
          <p class="notif-message">${n.message||""}</p>
          ${n.preview?`<p class="notif-preview">${Ue(n.preview,80)}</p>`:""}
          <div class="notif-meta">
            <span class="notif-time">${ze(o.created_at)}</span>
            ${n.project_name?`<span class="notif-project">${n.project_name}</span>`:""}
            ${n.sender_name?`<span class="notif-sender">from ${n.sender_name}</span>`:""}
          </div>
        </div>
        <div class="notif-actions">
          ${o.read_at?"":`<button class="notif-action-btn notif-mark-read" data-id="${o.id}" title="Mark read">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </button>`}
          <button class="notif-action-btn notif-dismiss" data-id="${o.id}" title="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>`}).join(""),a+="</div>",t.innerHTML=a,t.querySelectorAll(".notif-tab").forEach(o=>{o.addEventListener("click",()=>{t.querySelectorAll(".notif-tab").forEach(i=>i.classList.remove("active")),o.classList.add("active");const n=o.dataset.filter;t.querySelectorAll(".notif-item").forEach(i=>{i.style.display=n==="all"||i.dataset.type===n?"":"none"})})}),t.querySelectorAll(".notif-mark-read").forEach(o=>{o.addEventListener("click",async n=>{n.stopPropagation(),await K(o.dataset.id),o.closest(".notif-item").classList.remove("unread"),o.remove(),await x()})}),t.querySelectorAll(".notif-dismiss").forEach(o=>{o.addEventListener("click",async n=>{var i;n.stopPropagation();try{await p.delete(`/notifications/${o.dataset.id}`),(i=o.closest(".notif-item"))==null||i.remove(),await x()}catch{}})}),t.querySelectorAll(".notif-item").forEach(o=>{o.addEventListener("click",async()=>{var r;const n=e.find(l=>l.id===o.dataset.id),i=n?typeof n.data=="string"?JSON.parse(n.data):n.data:{};o.classList.contains("unread")&&(await K(o.dataset.id),o.classList.remove("unread"),i.action_url?location.hash=i.action_url:i.type==="chat_message"||i.type==="chat_mention"?location.hash="/chat":i.task_id?location.hash=`/tasks/${i.task_id}`:i.project_id&&(location.hash=`/projects/${i.project_id}`),(r=document.getElementById("notif-panel"))==null||r.classList.add("hidden"),await x())})})}function de(e){return{task_assigned:"📋",task_status_changed:"🔄",task_completed:"✅",task_overdue:"⏰",task_comment:"💬",task_mention:"@",user_mentioned:"@",chat_message:"💬",chat_mention:"📢",review_requested:"👁️",review_approved:"✅",review_rejected:"❌",project_member_added:"👥",project_member_removed:"👤",dependency_resolved:"🔗",schedule_conflict:"⚠️",work_session_reminder:"⏱️",deadline_approaching:"⚠️",comment_added:"💬",custom:"📣"}[e]||"🔔"}function ze(e){const t=Date.now()-new Date(e).getTime(),s=Math.floor(t/6e4);if(s<1)return"Just now";if(s<60)return`${s}m ago`;const a=Math.floor(s/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}function Ue(e,t){return e&&e.length>t?e.slice(0,t)+"...":e||""}const We=e=>p.post(`/tasks/${e}/timer/start`),Ge=e=>p.post(`/tasks/${e}/timer/pause`),Je=e=>p.post(`/tasks/${e}/timer/resume`),fe=(e,t)=>p.post(`/tasks/${e}/timer/stop`,{notes:t}),Ke=()=>p.get("/timer/active");let $=null,F=null,D=0,ee=null;async function be(){const e=await Ke().catch(()=>null);e&&e.id?(d.set("activeTimer",e),ee=e.task_id,F=new Date(e.start_time).getTime(),D=(e.paused_duration||0)*1e3,N(e.task||{id:e.task_id,title:"Task #"+e.task_id}),we(e.task_id)):(d.set("activeTimer",null),z())}function N(e){clearInterval($);const t=document.getElementById("sidebar-timer"),s=document.getElementById("sidebar-timer-name");t&&t.classList.remove("hidden"),s&&e&&(s.textContent=e.title||"Running…"),$=setInterval(()=>{const a=Date.now()-F-D,o=Qe(a),n=document.getElementById("sidebar-timer-clock");n&&(n.textContent=o);const i=document.getElementById("dash-timer-clock");i&&(i.textContent=o)},1e3)}function z(){clearInterval($),$=null,F=null,D=0,ee=null;const e=document.getElementById("sidebar-timer");e&&e.classList.add("hidden")}function we(e){const t=document.getElementById("sidebar-stop-btn");if(!t)return;const s=t.cloneNode(!0);t.parentNode.replaceChild(s,t),s.addEventListener("click",async()=>{s.disabled=!0,s.textContent="■ Stopping…";try{await fe(e),z(),d.set("activeTimer",null),u("Timer stopped","success"),M(e,!1)}catch(a){u((a==null?void 0:a.message)||"Could not stop timer","error"),s.disabled=!1,s.textContent="■ Stop Timer"}})}async function Ye(e,t,s=null){var a;if(!e||e==="undefined"||e==="null")return console.warn("[Timer] handleTimerAction called with invalid taskId:",e),!1;try{switch(t){case"start":{const o=d.get("activeTimer");if(o&&o.id&&o.task_id!==e)return u("Stop the current timer first","error"),!1;const n=await We(e);ee=e,F=new Date(n.start_time).getTime(),D=0,d.set("activeTimer",n),N({id:e,title:s||((a=n.task)==null?void 0:a.title)||"Task #"+e}),we(e),u("Timer started ▶","success"),M(e,!0);break}case"pause":{await Ge(e),clearInterval($),$=null,u("Timer paused ⏸","info"),M(e,!1);break}case"resume":{D=((await Je(e)).paused_duration||0)*1e3,N({id:e,title:s||"Task #"+e}),u("Timer resumed ▶","success"),M(e,!0);break}case"stop":{await fe(e),z(),d.set("activeTimer",null),u("Timer stopped ■","success"),M(e,!1);break}}return!0}catch(o){return u((o==null?void 0:o.message)||"Timer action failed","error"),!1}}function M(e,t){const s='<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',a='<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';document.querySelectorAll(`.kb-timer-btn[data-timer-task-id="${e}"]`).forEach(o=>{var n;o.classList.toggle("running",t),o.innerHTML=t?s:a,o.title=t?"Timer running":"Start timer",(n=o.closest(".kb-card"))==null||n.classList.toggle("timing",t)}),document.querySelectorAll(`.dash-timer-btn[data-timer-task-id="${e}"]`).forEach(o=>{o.textContent=t?"⏸":"▶",o.classList.toggle("running",t),o.title=t?"Pause timer":"Start timer"}),document.querySelectorAll(`.task-timer-btn[data-timer-task-id="${e}"]`).forEach(o=>{o.textContent=t?"⏸":"▶",o.classList.toggle("running",t)})}function Qe(e){const t=Math.max(0,Math.floor(e/1e3)),s=String(Math.floor(t/3600)).padStart(2,"0"),a=String(Math.floor(t%3600/60)).padStart(2,"0"),o=String(t%60).padStart(2,"0");return`${s}:${a}:${o}`}const At=Object.freeze(Object.defineProperty({__proto__:null,handleTimerAction:Ye,initTimer:be,startClock:N,stopClock:z},Symbol.toStringTag,{value:"Module"})),q=[{key:"available",label:"Available",icon:"🟢",color:"#16a34a",desc:"Open for anything"},{key:"collaboration",label:"Available for Collaboration",icon:"🤝",color:"#2563eb",desc:"Collaborating"},{key:"meeting",label:"In Meeting",icon:"📅",color:"#f59e0b",desc:"In a meeting"},{key:"deep_work",label:"Deep Work",icon:"🧠",color:"#6366f1",desc:"Focus mode on"},{key:"busy",label:"Busy",icon:"🔴",color:"#dc2626",desc:"Not available"},{key:"off",label:"Off",icon:"⚫",color:"#94a3b8",desc:"Offline"}];function Xe(){const e=localStorage.getItem("vilva_user_status")||"available";d.set("userStatus",e),Ze()}function te(e,t=!1){const s=q.find(a=>a.key===e);s&&(localStorage.setItem("vilva_user_status",e),d.set("userStatus",e),et(s),t||u(`Status: ${s.label}`,"info",2e3))}function Ze(){var a;const e=document.querySelector(".sidebar-footer");if(!e)return;(a=document.getElementById("status-widget"))==null||a.remove();const t=q.find(o=>o.key===(d.get("userStatus")||"available"))||q[0],s=document.createElement("div");s.id="status-widget",s.className="status-widget",s.innerHTML=`
    <button class="status-trigger" id="status-trigger" title="Set your status">
      <span class="status-dot" id="status-dot" style="background:${t.color}"></span>
      <span class="status-label" id="status-label">${t.label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:auto;opacity:.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <div class="status-dropdown hidden" id="status-dropdown">
      ${q.map(o=>`
        <button class="status-option ${o.key===t.key?"active":""}" data-status="${o.key}">
          <span class="status-opt-dot" style="background:${o.color}"></span>
          <div class="status-opt-info">
            <span class="status-opt-label">${o.icon} ${o.label}</span>
            <span class="status-opt-desc">${o.desc}</span>
          </div>
          ${o.key===t.key?`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${o.color}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`:""}
        </button>`).join("")}
    </div>`,e.insertBefore(s,e.firstChild),s.querySelector("#status-trigger").addEventListener("click",o=>{o.stopPropagation(),s.querySelector("#status-dropdown").classList.toggle("hidden")}),s.querySelectorAll(".status-option").forEach(o=>{o.addEventListener("click",n=>{n.stopPropagation(),te(o.dataset.status),s.querySelector("#status-dropdown").classList.add("hidden")})}),document.addEventListener("click",()=>{var o;(o=s.querySelector("#status-dropdown"))==null||o.classList.add("hidden")})}function et(e){var n,i;const t=document.getElementById("status-dot"),s=document.getElementById("status-label"),a=document.getElementById("status-dropdown");t&&(t.style.background=e.color),s&&(s.textContent=e.label),a&&a.querySelectorAll(".status-option").forEach(r=>{const l=r.dataset.status===e.key;r.classList.toggle("active",l);const c=r.querySelector("svg");l&&!c?r.insertAdjacentHTML("beforeend",`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${e.color}" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`):!l&&c&&c.remove()});const o=document.getElementById("sidebar-role");if(o){const r=d.get("user"),l=(r==null?void 0:r.role)||((i=(n=r==null?void 0:r.roles)==null?void 0:n[0])==null?void 0:i.name)||"Member";o.textContent=e.key==="deep_work"?"🧠 Focus Mode":e.key==="meeting"?"📅 In Meeting":l}}const C={work:50,shortBreak:10,longBreak:20,longAfter:4};let g=vt(),f="work",y=g.work*60,L=!1,j=null,V=0,R=null;function tt(){ot(),ut()}function st(){const e=document.getElementById("pomodoro-panel");if(!e)return;const t=e.classList.contains("hidden");e.classList.toggle("hidden",!t),t&&S()}function ot(){var t;(t=document.getElementById("pomodoro-panel"))==null||t.remove();const e=document.createElement("div");e.id="pomodoro-panel",e.className="pomodoro-panel hidden",e.innerHTML=`
    <div class="pom-header">
      <div class="pom-title">
        <span class="pom-tomato">🍅</span>
        <span>Pomodoro</span>
      </div>
      <button class="pom-close" id="pom-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Phase tabs -->
    <div class="pom-phases">
      <button class="pom-phase-btn active" data-phase="work">Focus</button>
      <button class="pom-phase-btn" data-phase="short">Short Break</button>
      <button class="pom-phase-btn" data-phase="long">Long Break</button>
    </div>

    <!-- Ring + time -->
    <div class="pom-ring-wrap">
      <svg class="pom-ring-svg" viewBox="0 0 160 160">
        <circle class="pom-ring-bg" cx="80" cy="80" r="68"/>
        <circle class="pom-ring-progress" id="pom-ring" cx="80" cy="80" r="68"
          transform="rotate(-90 80 80)"/>
      </svg>
      <div class="pom-time-center">
        <div class="pom-time-display" id="pom-time">50:00</div>
        <div class="pom-phase-label" id="pom-phase-label">Focus Time</div>
      </div>
    </div>

    <!-- Session dots -->
    <div class="pom-sessions" id="pom-sessions"></div>

    <!-- Controls -->
    <div class="pom-controls">
      <button class="pom-btn-secondary" id="pom-reset" title="Reset">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
      <button class="pom-btn-primary" id="pom-start">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" id="pom-play-icon"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span id="pom-start-label">Start</span>
      </button>
      <button class="pom-btn-secondary" id="pom-skip" title="Skip">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
        </svg>
      </button>
    </div>

    <!-- Presets -->
    <div class="pom-presets">
      <button class="pom-preset-btn ${g.work===50?"active":""}" data-preset="pomodoro" title="50 min work / 10 min break">🍅 Standard (50/10)</button>
      <button class="pom-preset-btn ${g.work===25?"active":""}" data-preset="deep" title="25 min deep work / 5 min break">🧠 Deep Work (25/5)</button>
    </div>

    <!-- Settings -->
    <details class="pom-settings">
      <summary>Settings</summary>
      <div class="pom-settings-body">
        <div class="pom-setting-row">
          <label>Focus (min)</label>
          <input type="number" id="pom-cfg-work" class="pom-cfg-input" value="${g.work}" min="1" max="120"/>
        </div>
        <div class="pom-setting-row">
          <label>Short break (min)</label>
          <input type="number" id="pom-cfg-short" class="pom-cfg-input" value="${g.shortBreak}" min="1" max="60"/>
        </div>
        <div class="pom-setting-row">
          <label>Long break (min)</label>
          <input type="number" id="pom-cfg-long" class="pom-cfg-input" value="${g.longBreak}" min="1" max="60"/>
        </div>
        <button class="btn btn-primary btn-sm" id="pom-save-cfg" style="width:100%;margin-top:8px">Save</button>
      </div>
    </details>`,document.getElementById("app").appendChild(e),at(e),S()}function at(e){e.querySelector("#pom-close").addEventListener("click",()=>{e.classList.add("hidden")}),e.querySelectorAll(".pom-phase-btn").forEach(t=>{t.addEventListener("click",()=>{L||(ct(t.dataset.phase),e.querySelectorAll(".pom-phase-btn").forEach(s=>s.classList.toggle("active",s===t)))})}),e.querySelector("#pom-start").addEventListener("click",()=>{L?se():nt()}),e.querySelector("#pom-reset").addEventListener("click",()=>{it()}),e.querySelector("#pom-skip").addEventListener("click",()=>{ke()}),e.querySelectorAll(".pom-preset-btn").forEach(t=>{t.addEventListener("click",()=>{if(L)return;const a={pomodoro:{work:50,shortBreak:10,longBreak:20},deep:{work:25,shortBreak:5,longBreak:15}}[t.dataset.preset];if(!a)return;g={...g,...a},ue(g),y=I(f),S();const o=e.querySelector("#pom-cfg-work"),n=e.querySelector("#pom-cfg-short"),i=e.querySelector("#pom-cfg-long");o&&(o.value=a.work),n&&(n.value=a.shortBreak),i&&(i.value=a.longBreak),e.querySelectorAll(".pom-preset-btn").forEach(r=>r.classList.toggle("active",r===t)),u(`${t.textContent.trim()} preset applied`,"success")})}),e.querySelector("#pom-save-cfg").addEventListener("click",()=>{const t=parseInt(e.querySelector("#pom-cfg-work").value)||C.work,s=parseInt(e.querySelector("#pom-cfg-short").value)||C.shortBreak,a=parseInt(e.querySelector("#pom-cfg-long").value)||C.longBreak;g={...g,work:t,shortBreak:s,longBreak:a},ue(g),L||(y=I(f),S()),u("Pomodoro settings saved","success")})}function nt(){L=!0,f==="work"&&(R=d.get("userStatus")||"available",te("deep_work",!0),d.set("notificationsPaused",!0),ae(!0)),j=setInterval(rt,1e3),oe(),S()}function se(){L=!1,clearInterval(j),j=null,oe(),f==="work"&&(d.set("notificationsPaused",!1),ae(!1))}function it(){se(),y=I(f),S()}function rt(){y--,S(),dt(),y<=0&&lt()}function lt(){clearInterval(j),j=null,L=!1;const e=f==="work"?"🎉 Focus session complete! Time for a break.":"⚡ Break over! Ready to focus?";mt(f==="work"?"🍅 Pomodoro Complete!":"☕ Break Complete!",e),u(e,"success"),f==="work"&&(V++,d.set("notificationsPaused",!1),ae(!1),R&&R!=="deep_work"&&te(R,!0)),ke(),ye(),oe()}function ke(){se(),f==="work"?f=V>0&&V%g.longAfter===0?"long":"short":f="work",y=I(f);const e=document.getElementById("pomodoro-panel");e&&e.querySelectorAll(".pom-phase-btn").forEach(t=>t.classList.toggle("active",t.dataset.phase===f)),S()}function ct(e){f=e,y=I(e),S()}function S(){const e=document.getElementById("pomodoro-panel");if(!e)return;const t=I(f),s=y/t,a=2*Math.PI*68,o=e.querySelector("#pom-ring");o&&(o.style.strokeDasharray=a,o.style.strokeDashoffset=a*(1-s),o.style.stroke=pt(f));const n=e.querySelector("#pom-time");n&&(n.textContent=_e(y));const i=e.querySelector("#pom-phase-label");i&&(i.textContent=ht(f)),ye()}function ye(){const e=document.getElementById("pom-sessions");if(!e)return;const t=Array.from({length:g.longAfter},(s,a)=>`<span class="pom-session-dot ${a<V%g.longAfter?"filled":""}"></span>`).join("");e.innerHTML=t}function oe(){const e=document.getElementById("pom-start"),t=document.getElementById("pom-start-label"),s=document.getElementById("pom-play-icon");e&&(L?(t.textContent="Pause",e.classList.add("paused"),s.innerHTML='<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'):(t.textContent="Start",e.classList.remove("paused"),s.innerHTML='<polygon points="5 3 19 12 5 21 5 3"/>'))}function dt(){const e=document.getElementById("pom-topbar-clock");e&&(e.textContent=_e(y),e.classList.toggle("hidden",!L))}function ae(e){const t=document.getElementById("pomodoro-btn");t&&t.classList.toggle("active",e);const s=document.getElementById("pom-topbar-clock");s&&s.classList.toggle("hidden",!e)}async function ut(){"Notification"in window&&Notification.permission==="default"&&await Notification.requestPermission()}function mt(e,t){"Notification"in window&&Notification.permission==="granted"&&new Notification(e,{body:t,icon:"/favicon.ico",badge:"/favicon.ico"})}function I(e){return({work:g.work,short:g.shortBreak,long:g.longBreak}[e]||g.work)*60}function pt(e){return{work:"#6366f1",short:"#16a34a",long:"#0ea5e9"}[e]||"#6366f1"}function ht(e){return{work:"Focus Time",short:"Short Break",long:"Long Break"}[e]||"Focus"}function _e(e){const t=String(Math.floor(e/60)).padStart(2,"0"),s=String(e%60).padStart(2,"0");return`${t}:${s}`}function vt(){try{const e=JSON.parse(localStorage.getItem("vilva_pom_config")||"{}");return{...C,...e}}catch{return{...C}}}function ue(e){localStorage.setItem("vilva_pom_config",JSON.stringify(e))}let H=null;async function gt(e){e.innerHTML=`
    <div class="ws-page">
      <div class="ws-top-row">
        <div class="ws-clock-card" id="ws-clock-card">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
        <div class="ws-summary-card" id="ws-summary-card">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
      <div class="ws-team-section" id="ws-team-section"></div>
      <div class="ws-history-section">
        <div class="ws-history-head">
          <h3>Work History</h3>
          <div class="ws-history-filters">
            <input type="date" id="ws-from" class="form-input form-input-sm" />
            <input type="date" id="ws-to" class="form-input form-input-sm" />
            <button class="btn btn-sm btn-secondary" id="ws-filter-btn">Filter</button>
          </div>
        </div>
        <div id="ws-history-list">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;const t=new Date,s=new Date(t);s.setDate(s.getDate()-7),document.getElementById("ws-from").value=s.toISOString().split("T")[0],document.getElementById("ws-to").value=t.toISOString().split("T")[0],document.getElementById("ws-filter-btn").addEventListener("click",X),await Promise.all([Y(),Se(),X(),bt()])}async function Y(){const e=document.getElementById("ws-clock-card");try{const s=(await p.get("/work-sessions/active")).session;s?(d.set("workSession",s),Le(e,s)):(d.set("workSession",null),Ee(e))}catch{e.innerHTML='<p class="text-muted">Failed to load session</p>'}}function Ee(e){e.innerHTML=`
    <div class="ws-clock-idle">
      <div class="ws-clock-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path stroke-linecap="round" d="M12 6v6l4 2"/>
        </svg>
      </div>
      <h3>Not Clocked In</h3>
      <p class="text-muted">Start your work session to begin tracking time</p>
      <button class="btn btn-primary btn-lg" id="ws-clock-in-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
        Clock In
      </button>
    </div>`,document.getElementById("ws-clock-in-btn").addEventListener("click",async()=>{try{const t=await p.post("/work-sessions/clock-in");u("Clocked in!","success"),d.set("workSession",t.session),Le(e,t.session),U(t.session)}catch(t){u(t.message||"Failed to clock in","error")}})}function Le(e,t){var a,o,n,i;const s=t.status==="on_break";e.innerHTML=`
    <div class="ws-clock-active ${s?"on-break":""}">
      <div class="ws-status-badge ${s?"break":"active"}">
        ${s?"On Break":"Working"}
      </div>
      <div class="ws-timer-display" id="ws-timer-display">
        ${O(t.elapsed_minutes||0)}
      </div>
      <div class="ws-clock-info">
        <span>Clocked in: ${new Date(t.clock_in).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
        ${t.break_minutes>0?`<span>Breaks: ${t.break_minutes}m</span>`:""}
      </div>
      <div class="ws-clock-actions">
        ${s?'<button class="btn btn-secondary" id="ws-end-break-btn">End Break</button>':'<button class="btn btn-secondary" id="ws-break-btn">Take Break</button>'}
        <button class="btn btn-danger" id="ws-clock-out-btn">Clock Out</button>
      </div>
      ${(a=t.breaks)!=null&&a.length?`
        <div class="ws-breaks-list">
          <h4>Breaks Today</h4>
          ${t.breaks.map(r=>`
            <div class="ws-break-item">
              <span>${r.reason||"Break"}</span>
              <span>${new Date(r.start_time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} — ${r.end_time?new Date(r.end_time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"now"}</span>
              <span>${r.duration}m</span>
            </div>
          `).join("")}
        </div>
      `:""}
    </div>`,ft(t),s?(o=document.getElementById("ws-end-break-btn"))==null||o.addEventListener("click",async()=>{try{await p.post("/work-sessions/break/end"),u("Break ended","success"),Y()}catch(r){u(r.message,"error")}}):(n=document.getElementById("ws-break-btn"))==null||n.addEventListener("click",async()=>{const r=prompt("Break reason (optional):","Lunch");try{await p.post("/work-sessions/break/start",{reason:r||null}),u("Break started","success"),Y()}catch(l){u(l.message,"error")}}),(i=document.getElementById("ws-clock-out-btn"))==null||i.addEventListener("click",async()=>{if(confirm("Are you sure you want to clock out?"))try{const r=await p.post("/work-sessions/clock-out");u(`Clocked out! Total: ${O(r.session.total_minutes)}`,"success"),d.set("workSession",null),Q(),Ee(e),U(null),Se(),X()}catch(r){u(r.message,"error")}})}function ft(e){Q();const t=new Date(e.clock_in).getTime(),s=e.break_minutes||0;H=setInterval(()=>{const a=document.getElementById("ws-timer-display");if(!a)return Q();const o=Date.now(),n=Math.floor((o-t)/6e4)-s;a.textContent=O(Math.max(0,n))},1e3)}function Q(){H&&(clearInterval(H),H=null)}async function Se(){var a;const e=document.getElementById("ws-summary-card"),t=new Date,s=new Date(t);s.setDate(s.getDate()-7);try{const o=await p.get("/work-sessions/summary",{from:s.toISOString().split("T")[0],to:t.toISOString().split("T")[0]});e.innerHTML=`
      <h3>This Week</h3>
      <div class="ws-stats-grid">
        <div class="ws-stat">
          <span class="ws-stat-value">${o.total_hours}h</span>
          <span class="ws-stat-label">Total Hours</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${o.session_count}</span>
          <span class="ws-stat-label">Sessions</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${Math.round(o.avg_session_min/60*10)/10}h</span>
          <span class="ws-stat-label">Avg Session</span>
        </div>
        <div class="ws-stat">
          <span class="ws-stat-value">${Math.round(o.total_breaks/60*10)/10}h</span>
          <span class="ws-stat-label">Break Time</span>
        </div>
      </div>
      ${(a=o.daily)!=null&&a.length?`
        <div class="ws-daily-chart">
          ${o.daily.map(n=>{const i=o.total_minutes>0?Math.round(n.total_minutes/480*100):0;return`
              <div class="ws-daily-bar-wrap">
                <div class="ws-daily-bar" style="height:${Math.min(i,100)}%"></div>
                <span class="ws-daily-label">${new Date(n.date).toLocaleDateString([],{weekday:"short"})}</span>
                <span class="ws-daily-hours">${Math.round(n.total_minutes/60*10)/10}h</span>
              </div>`}).join("")}
        </div>
      `:""}`}catch{e.innerHTML='<p class="text-muted">Could not load summary</p>'}}async function X(){var a,o;const e=document.getElementById("ws-history-list"),t=(a=document.getElementById("ws-from"))==null?void 0:a.value,s=(o=document.getElementById("ws-to"))==null?void 0:o.value;try{const i=(await p.get("/work-sessions/history",{from:t,to:s,per_page:20})).data||[];if(!i.length){e.innerHTML='<p class="text-muted" style="padding:16px">No work sessions in this period</p>';return}e.innerHTML=`
      <table class="ws-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Breaks</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${i.map(r=>`
            <tr>
              <td>${new Date(r.clock_in).toLocaleDateString()}</td>
              <td>${new Date(r.clock_in).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</td>
              <td>${r.clock_out?new Date(r.clock_out).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"}</td>
              <td>${r.break_minutes||0}m</td>
              <td><strong>${r.total_minutes?O(r.total_minutes):"—"}</strong></td>
              <td><span class="ws-status-pill ${r.status}">${r.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>`}catch{e.innerHTML='<p class="text-muted">Failed to load history</p>'}}async function bt(){const e=document.getElementById("ws-team-section");try{const s=(await p.get("/work-sessions/team")).sessions||[];if(!s.length){e.innerHTML="";return}e.innerHTML=`
      <div class="ws-team-card">
        <h3>Team Activity <span class="ws-team-count">${s.length} online</span></h3>
        <div class="ws-team-list">
          ${s.map(a=>{var o,n,i;return`
            <div class="ws-team-member">
              <img src="${((o=a.user)==null?void 0:o.avatar_url)||`https://ui-avatars.com/api/?name=${encodeURIComponent(((n=a.user)==null?void 0:n.name)||"?")}&size=32&background=6366f1&color=fff`}" class="ws-team-avatar" />
              <div class="ws-team-info">
                <span class="ws-team-name">${((i=a.user)==null?void 0:i.name)||"Unknown"}</span>
                <span class="ws-team-detail">${a.status==="on_break"?"On Break":O(a.elapsed_minutes)} worked</span>
              </div>
              <span class="ws-team-status-dot ${a.status}"></span>
            </div>
          `}).join("")}
        </div>
      </div>`}catch{e.innerHTML=""}}function U(e){const t=document.getElementById("sidebar-work-status");t&&(e?(t.classList.remove("hidden"),t.innerHTML=`
      <span class="ws-sidebar-dot ${e.status}"></span>
      <span>${e.status==="on_break"?"On Break":"Working"}</span>`):t.classList.add("hidden"))}async function Be(){try{const e=await p.get("/work-sessions/active");e.session&&(d.set("workSession",e.session),U(e.session))}catch{}}function O(e){const t=Math.floor(e/60),s=e%60;return t>0?`${t}h ${s}m`:`${s}m`}const wt=Object.freeze(Object.defineProperty({__proto__:null,initWorkSession:Be,renderWorkSessions:gt,updateSidebarWorkStatus:U},Symbol.toStringTag,{value:"Module"})),kt=[{page:"dashboard",label:"Dashboard",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'},{page:"my-tasks",label:"My Tasks",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',hasPill:!0},{page:"projects",label:"Projects",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>'},{page:"milestones",label:"Milestones",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>'},{page:"goals",label:"Goals",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'},{page:"dependencies",label:"Dependencies",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"/></svg>'},{page:"calendar",label:"Calendar",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>'},{page:"reports",label:"Reports",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>'},{page:"chat",label:"Chat",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>'},{page:"work-sessions",label:"Work Log",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>'},{page:"meetings",label:"Meetings",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'},{page:"schedule",label:"Schedule",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>'},{page:"profile",label:"My Profile",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'},{page:"admin",label:"User Mgmt",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'}],yt='<svg width="16" height="16" viewBox="0 0 30 30" fill="none"><path d="M8 15l5.5 5.5L22 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',_t=`
  <div class="topbar-search">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>
    <input id="global-search" type="search" placeholder="Search tasks, projects…"/>
  </div>
  <button class="topbar-btn pom-topbar-btn" id="pomodoro-btn" title="Pomodoro Timer"><span>🍅</span><span class="pom-topbar-clock hidden" id="pom-topbar-clock">50:00</span></button>
  <button class="btn btn-ghost btn-sm ai-task-btn" id="ai-task-btn" title="Create task with AI"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> ✨ AI Task</button>
  <button class="btn btn-primary btn-sm" id="create-task-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg> New Task</button>
  <button class="topbar-btn" id="notif-btn" title="Notifications"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span class="notif-dot hidden" id="notif-dot"></span></button>`,Et=`
  <div id="theme-panel" class="theme-panel hidden">
    <div class="theme-panel-title">Accent Colour</div>
    <div class="theme-swatch-row">
      <div class="theme-swatch active" data-theme="" style="background:#6366f1" title="Violet"></div>
      <div class="theme-swatch" data-theme="rose" style="background:#e11d48" title="Rose"></div>
      <div class="theme-swatch" data-theme="emerald" style="background:#059669" title="Emerald"></div>
      <div class="theme-swatch" data-theme="sky" style="background:#0284c7" title="Sky"></div>
      <div class="theme-swatch" data-theme="amber" style="background:#d97706" title="Amber"></div>
      <div class="theme-swatch" data-theme="slate" style="background:#475569" title="Slate"></div>
      <div class="theme-swatch" data-theme="teal" style="background:#0d9488" title="Teal"></div>
      <div class="theme-swatch" data-theme="pink" style="background:#d946ef" title="Pink"></div>
      <div class="theme-swatch" data-theme="crimson" style="background:#dc2626" title="Crimson"></div>
    </div>
    <div class="theme-section-label">Mode</div>
    <div class="theme-mode-row">
      <button class="theme-mode-btn active" data-mode="light">☀ Light</button>
      <button class="theme-mode-btn" data-mode="dark">🌙 Dark</button>
    </div>
  </div>`;function Te(){return"default"}function Lt(e){const t=document.getElementById("main-view");t.innerHTML=St(),t.dataset.layout="default"}function St(){return`
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand"><div class="logo-box">${yt}</div> Vilva</div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Overview</div>
        ${w("dashboard")}${w("my-tasks")}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Work</div>
        ${w("projects")}${w("milestones")}${w("goals")}${w("dependencies")}${w("calendar")}${w("reports")}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Collaborate</div>
        ${w("chat")}${w("meetings")}${w("work-sessions")}${w("schedule")}
        <div class="sidebar-divider"></div>
        <div class="nav-section-label">Account</div>
        ${w("profile")}${w("admin")}
      </nav>
      <div id="sidebar-work-status" class="sidebar-work-status hidden"></div>
      <div id="sidebar-timer" class="sidebar-timer hidden">
        <div class="sidebar-timer-label">Timer Running</div>
        <div class="sidebar-timer-name" id="sidebar-timer-name">—</div>
        <div class="sidebar-timer-clock" id="sidebar-timer-clock">00:00:00</div>
        <button class="sidebar-timer-stop" id="sidebar-stop-btn">■ Stop Timer</button>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user" title="Profile" style="cursor:pointer">
          <img id="sidebar-avatar" src="" alt=""/>
          <div class="sidebar-user-info"><span class="sidebar-user-name" id="sidebar-name">Loading…</span><span class="sidebar-user-role" id="sidebar-role">Member</span></div>
        </div>
        <div style="position:relative">
          <button class="sidebar-theme-btn" id="theme-picker-btn" title="Theme">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 2a10 10 0 010 20c-2.5 0-4-1.5-4-3.5 0-1 .5-2 .5-3S8 13 8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>
          </button>
          ${Et}
        </div>
        <button class="sidebar-logout" id="logout-btn" title="Sign out"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
      </div>
    </aside>
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-left"><span class="topbar-title" id="page-title">Dashboard</span></div>
        <div class="topbar-right">${_t}</div>
      </header>
      <div class="page-wrap" id="page-wrap"></div>
    </div>`}function w(e){const t=kt.find(a=>a.page===e);if(!t)return"";const s=["nav-link"];return t.page==="dashboard"&&s.push("active"),t.admin&&s.push("hidden"),`<a href="#/${t.page}" class="${s.join(" ")}" data-page="${t.page}" ${t.admin?'id="nav-admin"':""}>
    ${t.icon} ${t.label}
    ${t.hasPill?'<span class="nav-pill hidden" id="my-tasks-count">0</span>':""}
  </a>`}async function Bt(){const e=localStorage.getItem("vilva_token");if(e)try{const{fetchCurrentUser:t}=await m(async()=>{const{fetchCurrentUser:a}=await Promise.resolve().then(()=>ve);return{fetchCurrentUser:a}},void 0),s=await t();d.set("user",s),d.set("token",e),Tt(),P.navigate(location.hash.slice(1)||"/dashboard"),Ve(),be(),tt(),Xe(),Be()}catch{localStorage.removeItem("vilva_token"),Z()}else Z()}function Z(){document.getElementById("auth-view").classList.remove("hidden"),document.getElementById("main-view").classList.add("hidden"),je()}function Tt(){var a,o,n,i,r;document.getElementById("auth-view").classList.add("hidden");const e=document.getElementById("main-view");e.classList.remove("hidden");const t=Te();Lt(),e.classList.add("layout-"+t);const s=d.get("user");if(s){document.getElementById("sidebar-name").textContent=s.name;const l=s.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=32&background=6366f1&color=fff&bold=true`;document.getElementById("sidebar-avatar").src=l;const c=document.getElementById("sidebar-role"),b=s.role||((o=(a=s.roles)==null?void 0:a[0])==null?void 0:o.name)||"Member";c&&(c.textContent=b),(b.toLowerCase()==="admin"||(s.roles||[]).some(k=>(k.name||k)==="admin"))&&((n=document.getElementById("nav-admin"))==null||n.classList.remove("hidden"))}document.getElementById("sidebar-user").addEventListener("click",()=>{P.navigate("/profile")}),document.querySelectorAll(".nav-link, .tn-link, .mn-link").forEach(l=>{l.addEventListener("click",c=>{c.preventDefault(),document.querySelectorAll(".nav-link, .tn-link, .mn-link").forEach(b=>b.classList.remove("active")),l.classList.add("active"),P.navigate("/"+l.dataset.page)})}),document.getElementById("logout-btn").addEventListener("click",async()=>{const{logout:l}=await m(async()=>{const{logout:c}=await Promise.resolve().then(()=>ve);return{logout:c}},void 0);await l(),localStorage.removeItem("vilva_token"),d.clear(),Z()}),Mt(),xt(),(i=document.getElementById("pomodoro-btn"))==null||i.addEventListener("click",()=>{st()}),(r=document.getElementById("ai-task-btn"))==null||r.addEventListener("click",()=>{$t()}),document.getElementById("create-task-btn").addEventListener("click",async()=>{const l=document.getElementById("page-wrap"),{openNewTaskModal:c}=await m(async()=>{const{openNewTaskModal:b}=await import("./tasks-DNAIkEJT.js");return{openNewTaskModal:b}},__vite__mapDeps([6,7,5,1]));c(l,null)}),document.getElementById("notif-btn").addEventListener("click",()=>{document.getElementById("notif-panel").classList.toggle("hidden")}),document.getElementById("mark-all-read-btn").addEventListener("click",async()=>{const{markAllRead:l}=await m(async()=>{const{markAllRead:c}=await Promise.resolve().then(()=>Ne);return{markAllRead:c}},void 0);await l(),document.getElementById("notif-dot").classList.add("hidden"),document.getElementById("notif-list").innerHTML='<p style="padding:16px;color:#94a3b8;text-align:center;font-size:13px">No unread notifications</p>'})}async function $t(){const{openModal:e,closeModal:t}=await m(async()=>{const{openModal:a,closeModal:o}=await import("./modal-jGhccxZ4.js");return{openModal:a,closeModal:o}},[]);e({title:"✨ Create Task with AI",body:`
      <div class="ai-modal-body">
        <p class="ai-modal-hint">Describe your task in natural language and AI will fill in the details for you.</p>
        <div class="ai-examples">
          <span class="ai-example-chip" data-ex="Fix the login bug on the dashboard, high priority, by this Friday">Fix login bug, high priority by Friday</span>
          <span class="ai-example-chip" data-ex="Write API documentation for the new endpoints, medium priority, takes about 3 hours">Write API docs, ~3 hours</span>
          <span class="ai-example-chip" data-ex="Review pull requests from the team, urgent, due today">Review PRs, urgent today</span>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label class="form-label">Task Description</label>
          <textarea id="ai-prompt-input" class="form-input form-textarea" rows="3"
            placeholder="e.g. Fix the login bug on the dashboard by Friday, high priority…"
            style="resize:vertical"></textarea>
        </div>
        <div id="ai-result" class="ai-result hidden">
          <div class="ai-result-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            AI parsed your task
          </div>
          <div class="ai-result-fields" id="ai-result-fields"></div>
        </div>
        <div id="ai-error" class="ai-error hidden"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0">
          <button type="button" class="btn btn-ghost" id="ai-cancel">Cancel</button>
          <button type="button" class="btn btn-secondary" id="ai-parse-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Parse with AI
          </button>
          <button type="button" class="btn btn-primary hidden" id="ai-create-btn">
            Create Task →
          </button>
        </div>
      </div>`});let s=null;document.querySelectorAll(".ai-example-chip").forEach(a=>{a.addEventListener("click",()=>{document.getElementById("ai-prompt-input").value=a.dataset.ex})}),document.getElementById("ai-cancel").addEventListener("click",t),document.getElementById("ai-parse-btn").addEventListener("click",async()=>{var r;const a=document.getElementById("ai-prompt-input").value.trim();if(!a)return;const o=document.getElementById("ai-parse-btn"),n=document.getElementById("ai-error"),i=document.getElementById("ai-result");o.disabled=!0,o.textContent="Parsing…",n.classList.add("hidden"),i.classList.add("hidden");try{const{api:l}=await m(async()=>{const{api:h}=await Promise.resolve().then(()=>me);return{api:h}},void 0);s=await l.post("/ai/parse-task",{prompt:a});const c=document.getElementById("ai-result-fields"),b={low:"#64748b",medium:"#2563eb",high:"#d97706",urgent:"#dc2626"};c.innerHTML=`
        <div class="ai-field"><span class="ai-field-label">Title</span><span class="ai-field-val">${s.title}</span></div>
        ${s.description?`<div class="ai-field"><span class="ai-field-label">Description</span><span class="ai-field-val">${s.description}</span></div>`:""}
        <div class="ai-field">
          <span class="ai-field-label">Priority</span>
          <span class="ai-field-val" style="color:${b[s.priority]||"#64748b"};font-weight:700;text-transform:capitalize">${s.priority}</span>
        </div>
        <div class="ai-field"><span class="ai-field-label">Status</span><span class="ai-field-val" style="text-transform:capitalize">${(r=s.status)==null?void 0:r.replace("_"," ")}</span></div>
        ${s.due_date?`<div class="ai-field"><span class="ai-field-label">Due Date</span><span class="ai-field-val">📅 ${s.due_date}</span></div>`:""}
        ${s.estimated_minutes?`<div class="ai-field"><span class="ai-field-label">Estimate</span><span class="ai-field-val">⏱ ${Math.round(s.estimated_minutes/60*10)/10}h</span></div>`:""}`,i.classList.remove("hidden"),document.getElementById("ai-create-btn").classList.remove("hidden")}catch(l){n.textContent=(l==null?void 0:l.message)||"Failed to parse task. Check your ANTHROPIC_API_KEY.",n.classList.remove("hidden")}finally{o.disabled=!1,o.textContent="Parse with AI"}}),document.getElementById("ai-create-btn").addEventListener("click",async()=>{if(!s)return;t(),await new Promise(n=>setTimeout(n,100));const a=document.getElementById("page-wrap"),{openNewTaskModal:o}=await m(async()=>{const{openNewTaskModal:n}=await import("./tasks-DNAIkEJT.js");return{openNewTaskModal:n}},__vite__mapDeps([6,7,5,1]));o(a,null,s)})}const It=["","rose","emerald","sky","amber","slate","teal","pink","crimson"];function J(e,t){It.forEach(s=>{s&&document.body.classList.remove("theme-"+s)}),document.body.classList.remove("dark"),e&&document.body.classList.add("theme-"+e),t==="dark"&&document.body.classList.add("dark")}function Mt(){const e=document.getElementById("theme-picker-btn"),t=document.getElementById("theme-panel");if(!e||!t)return;const s=localStorage.getItem("vilva_theme")||"",a=localStorage.getItem("vilva_mode")||"light";J(s,a);const o=(i,r)=>{t.querySelectorAll(".theme-swatch").forEach(l=>l.classList.toggle("active",l.dataset.theme===i)),t.querySelectorAll(".theme-mode-btn").forEach(l=>l.classList.toggle("active",l.dataset.mode===r))};o(s,a),e.addEventListener("click",i=>{i.stopPropagation(),t.classList.toggle("hidden")}),document.addEventListener("click",i=>{!t.contains(i.target)&&i.target!==e&&t.classList.add("hidden")}),t.querySelectorAll(".theme-swatch").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.theme,l=localStorage.getItem("vilva_mode")||"light";localStorage.setItem("vilva_theme",r),J(r,l),o(r,l)})}),t.querySelectorAll(".theme-mode-btn").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.mode,l=localStorage.getItem("vilva_theme")||"";localStorage.setItem("vilva_mode",r),J(l,r),o(l,r)})}),t.querySelectorAll(".layout-btn").forEach(i=>{i.addEventListener("click",()=>{i.dataset.layout})});const n=Te();t.querySelectorAll(".layout-btn").forEach(i=>i.classList.toggle("active",(i.dataset.layout||"default")===n))}function xt(){const e=document.getElementById("global-search"),t=document.querySelector(".topbar-search");if(!e||!t)return;let s=null,a=null;const o=()=>{a==null||a.remove(),a=null};e.addEventListener("input",()=>{clearTimeout(s);const i=e.value.trim();if(i.length<2){o();return}s=setTimeout(async()=>{try{const{api:r}=await m(async()=>{const{api:c}=await Promise.resolve().then(()=>me);return{api:c}},void 0),l=await r.get("/search",{q:i});n(l,t,e)}catch{}},280)}),e.addEventListener("keydown",i=>{i.key==="Escape"&&(o(),e.blur())}),document.addEventListener("mousedown",i=>{t.contains(i.target)||o()});function n(i,r,l){o();const c=i.tasks||[],b=i.projects||[];if(!c.length&&!b.length)return;const h={backlog:"#94a3b8",todo:"#3b82f6",in_progress:"#f59e0b",review:"#8b5cf6",completed:"#10b981"},k={urgent:"#dc2626",high:"#d97706",medium:"#2563eb",low:"#64748b"};a=document.createElement("div"),a.className="search-dropdown",a.innerHTML=`
      ${b.length?`
        <div class="search-dd-group">Projects</div>
        ${b.map(v=>`
          <div class="search-dd-item" data-nav="/projects/${v.id}">
            <span class="search-dd-dot" style="background:${v.color||"#6366f1"}"></span>
            <span class="search-dd-name">${v.name}</span>
          </div>`).join("")}`:""}
      ${c.length?`
        <div class="search-dd-group">Tasks</div>
        ${c.map(v=>{var B;return`
          <div class="search-dd-item" data-nav="/tasks/${v.id}">
            <span class="search-dd-dot" style="background:${k[v.priority]||"#94a3b8"}"></span>
            <span class="search-dd-name">${v.title}</span>
            ${v.project?`<span class="search-dd-proj" style="color:${v.project.color}">${v.project.name}</span>`:""}
            <span class="search-dd-status" style="color:${h[v.status]||"#94a3b8"}">${(B=v.status)==null?void 0:B.replace("_"," ")}</span>
          </div>`}).join("")}`:""}`,r.style.position="relative",r.appendChild(a),a.querySelectorAll("[data-nav]").forEach(v=>{v.addEventListener("mousedown",B=>{B.preventDefault(),P.navigate(v.dataset.nav),l.value="",o()})})}}Bt();export{m as _,p as a,d as b,me as c,Pt as r,u as s,At as t};
