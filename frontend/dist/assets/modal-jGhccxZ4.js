function c({title:l,subtitle:d="",body:n,footer:o="",wide:a=!1}){const m=document.getElementById("modal-box");m.className=`modal-box${a?" modal-lg":""}`,document.getElementById("modal-head").innerHTML=`
    <div class="modal-head-text">
      <h3>${l}</h3>
      ${d?`<p>${d}</p>`:""}
    </div>
    <button class="modal-close-btn" id="modal-close-x">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>`,document.getElementById("modal-body").innerHTML=n;const e=document.getElementById("modal-foot");o?(e.innerHTML=o,e.classList.remove("hidden")):(e.innerHTML="",e.classList.add("hidden")),document.getElementById("modal-overlay").classList.remove("hidden"),document.getElementById("modal-close-x").addEventListener("click",t),document.getElementById("modal-overlay").addEventListener("click",s=>{s.target.id==="modal-overlay"&&t()})}function t(){document.getElementById("modal-overlay").classList.add("hidden")}export{t as closeModal,c as openModal};
