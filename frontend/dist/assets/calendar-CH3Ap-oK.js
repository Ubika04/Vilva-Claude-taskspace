const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-CxzuflVX.js","assets/main-DBvYfbKp.css"])))=>i.map(i=>d[i]);
import{a as $,_ as E}from"./main-CxzuflVX.js";import{i as T}from"./helpers-ByTbCZyC.js";const R=["January","February","March","April","May","June","July","August","September","October","November","December"],x=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],C={urgent:"#dc2626",high:"#d97706",medium:"#2563eb",low:"#64748b"};async function j(s){await h(s,new Date)}async function h(s,m){s.innerHTML='<div class="spinner-wrap"><div class="spinner"></div></div>';const n=m.getFullYear(),d=m.getMonth(),k=`${n}-${String(d+1).padStart(2,"0")}-01`,y=new Date(n,d+1,0).getDate(),b=`${n}-${String(d+1).padStart(2,"0")}-${String(y).padStart(2,"0")}`,[M,L,I]=await Promise.all([$.get("/my-tasks",{per_page:500}).catch(()=>({data:[]})),$.get(`/meetings?from=${k}&to=${b}`).catch(()=>({data:[]})),$.get("/dependencies/all").catch(()=>({blocked:[],blocking:[]}))]),o=(M.data||[]).filter(t=>t.due_date&&t.due_date>=k&&t.due_date<=b),_=L.data||[],O=new Set((I.blocked||[]).filter(t=>t.is_blocked).map(t=>t.id)),r={};o.forEach(t=>{r[t.due_date]||(r[t.due_date]=[]),r[t.due_date].push(t)});const p={};_.forEach(t=>{var c,i;const e=((c=t.scheduled_start)==null?void 0:c.split("T")[0])||((i=t.scheduled_start)==null?void 0:i.split(" ")[0]);e&&(p[e]||(p[e]=[]),p[e].push(t))});const A=new Date(n,d,1).getDay(),B=new Date().toISOString().split("T")[0];let u="";for(let t=0;t<A;t++)u+='<div class="cal-cell empty"></div>';for(let t=1;t<=y;t++){const e=`${n}-${String(d+1).padStart(2,"0")}-${String(t).padStart(2,"0")}`,c=r[e]||[],i=p[e]||[],D=e===B,v=c.length+i.length;u+=`
      <div class="cal-cell${D?" today":""}${v?" has-tasks":""}">
        <div class="cal-day-num${D?" today":""}">${t}</div>
        <div class="cal-tasks">
          ${i.slice(0,2).map(a=>{const l=new Date(a.scheduled_start).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"});return`<div class="cal-meeting-chip" data-meeting-id="${a.id}" title="${a.title} at ${l}">
              <span>📅</span>
              <span class="cal-chip-title">${l} ${a.title}</span>
            </div>`}).join("")}
          ${c.slice(0,3-Math.min(i.length,2)).map(a=>{const l=O.has(a.id);return`
            <div class="cal-task-chip${T(a.due_date,a.status)?" overdue":""}${l?" blocked":""}" data-task-id="${a.id}" title="${a.title}${l?" (BLOCKED)":""}">
              ${l?"<span>🔒</span>":`<span class="cal-dot" style="background:${C[a.priority]||"#94a3b8"}"></span>`}
              <span class="cal-chip-title">${a.title}</span>
            </div>`}).join("")}
          ${v>3?`<div class="cal-more">+${v-3} more</div>`:""}
        </div>
      </div>`}const f=o.length,w=o.filter(t=>t.status==="completed").length,S=o.filter(t=>T(t.due_date,t.status)).length,g=_.length;s.innerHTML=`
    <div class="page-header">
      <div class="page-header-left">
        <h1>Calendar</h1>
        <p>
          ${f} task${f!==1?"s":""} due
          ${g>0?` · ${g} meeting${g!==1?"s":""}`:""}
          ${S>0?`<span style="color:#dc2626;font-weight:600"> · ${S} overdue</span>`:""}
          ${w>0?`<span style="color:#16a34a"> · ${w} done</span>`:""}
        </p>
      </div>
    </div>
    <div class="cal-wrap">
      <div class="cal-nav">
        <button class="btn btn-ghost btn-sm" id="cal-prev">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 class="cal-month-title">${R[d]} ${n}</h2>
        <button class="btn btn-ghost btn-sm" id="cal-next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M9 18l6-6-6-6"/></svg>
        </button>
        <button class="btn btn-secondary btn-sm" id="cal-today" style="margin-left:8px">Today</button>
      </div>
      <div class="cal-grid">
        ${x.map(t=>`<div class="cal-day-header">${t}</div>`).join("")}
        ${u}
      </div>
    </div>`,document.getElementById("cal-prev").addEventListener("click",()=>h(s,new Date(n,d-1,1))),document.getElementById("cal-next").addEventListener("click",()=>h(s,new Date(n,d+1,1))),document.getElementById("cal-today").addEventListener("click",()=>h(s,new Date)),s.querySelectorAll(".cal-task-chip").forEach(t=>{t.addEventListener("click",()=>{E(()=>import("./main-CxzuflVX.js").then(e=>e.r),__vite__mapDeps([0,1])).then(e=>e.router.navigate(`/tasks/${t.dataset.taskId}`))})}),s.querySelectorAll(".cal-meeting-chip").forEach(t=>{t.addEventListener("click",()=>{E(()=>import("./main-CxzuflVX.js").then(e=>e.r),__vite__mapDeps([0,1])).then(e=>e.router.navigate("/meetings"))})})}export{j as renderCalendar};
