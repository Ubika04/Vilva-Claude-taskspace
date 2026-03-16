export function openModal({ title, subtitle = '', body, footer = '', wide = false }) {
  const box = document.getElementById('modal-box');
  box.className = `modal-box${wide ? ' modal-lg' : ''}`;

  document.getElementById('modal-head').innerHTML = `
    <div class="modal-head-text">
      <h3>${title}</h3>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    <button class="modal-close-btn" id="modal-close-x">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>`;

  document.getElementById('modal-body').innerHTML = body;

  const foot = document.getElementById('modal-foot');
  if (footer) {
    foot.innerHTML = footer;
    foot.classList.remove('hidden');
  } else {
    foot.innerHTML = '';
    foot.classList.add('hidden');
  }

  document.getElementById('modal-overlay').classList.remove('hidden');

  document.getElementById('modal-close-x').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}
