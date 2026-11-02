let modalSequence = 0;

export function confirmAction(message, title = 'Confirmar acción', confirmText = 'Confirmar', variant = 'primary') {
  return new Promise(resolve => {
    const id = `indiar-confirm-${++modalSequence}`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title fs-5">${title}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cancelar"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-${variant} confirm-action">${confirmText}</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper);
    const element = wrapper.firstElementChild;
    element.querySelector('.modal-body').textContent = message;
    let accepted = false;
    element.querySelector('.confirm-action').addEventListener('click', () => {
      accepted = true;
      bootstrap.Modal.getInstance(element)?.hide();
    });
    element.addEventListener('hidden.bs.modal', () => {
      resolve(accepted);
      wrapper.remove();
    });
    document.body.classList.add('indiar-modal-open');
    element.addEventListener('hidden.bs.modal', () => {
      if (!document.querySelector('.modal.show')) document.body.classList.remove('indiar-modal-open');
    });
    bootstrap.Modal.getOrCreateInstance(element).show();
  });
}

export function showToast(message, variant = 'danger') {
  let container = document.querySelector('.indiar-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3 indiar-toast-container';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${variant} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>`;
  toast.querySelector('.toast-body').textContent = message;
  container.appendChild(toast);
  const instance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 3500 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove(), { once: true });
  instance.show();
}
