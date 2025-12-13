/**
 * Modal Components
 * Reusable modal system cho Preferences và Dashboard
 */

class ModalManager {
  constructor() {
    this.activeModal = null;
  }

  /**
   * Tạo modal container
   */
  createModal(id, title, content) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 z-50 hidden';
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50" onclick="modalManager.close('${id}')"></div>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-xl font-bold text-gray-900">${title}</h2>
            <button onclick="modalManager.close('${id}')" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="overflow-y-auto flex-1 p-4">
            ${content}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  /**
   * Mở modal
   */
  open(id) {
    const modal = document.getElementById(id);
    if (modal) {
      this.closeAll();
      modal.classList.remove('hidden');
      this.activeModal = id;
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
  }

  /**
   * Đóng modal
   */
  close(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('hidden');
      if (this.activeModal === id) {
        this.activeModal = null;
      }
      document.body.style.overflow = ''; // Restore scroll
    }
  }

  /**
   * Đóng tất cả modals
   */
  closeAll() {
    document.querySelectorAll('[id$="-modal"]').forEach(modal => {
      modal.classList.add('hidden');
    });
    this.activeModal = null;
    document.body.style.overflow = '';
  }
}

// Global instance
const modalManager = new ModalManager();

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modalManager.closeAll();
  }
});

