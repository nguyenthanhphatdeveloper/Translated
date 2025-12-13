/**
 * Shared Header Component
 * Tự động inject header với modal buttons vào tất cả các trang
 */

function initSharedHeader() {
  // Tìm tất cả nav elements
  const navs = document.querySelectorAll('nav');
  
  navs.forEach(nav => {
    // Kiểm tra xem đã có modal buttons chưa
    if (nav.querySelector('.modal-buttons')) return;
    
    // Tìm navigation links container
    const linksContainer = nav.querySelector('div.flex.items-center.space-x-4, div.flex.items-center');
    if (!linksContainer) return;
    
    // Tạo modal buttons container
    const modalButtons = document.createElement('div');
    modalButtons.className = 'border-l pl-4 ml-2 flex items-center gap-2 modal-buttons';
    modalButtons.innerHTML = `
      <button onclick="openPreferencesModal()" class="text-gray-700 hover:text-purple-600 flex items-center gap-1 transition-colors" title="Tùy chọn học tập">
        <i class="fas fa-cog"></i>
        <span class="hidden md:inline text-sm">Tùy chọn</span>
      </button>
      <button onclick="openDashboardModal()" class="text-gray-700 hover:text-purple-600 flex items-center gap-1 transition-colors" title="Bảng tiến độ">
        <i class="fas fa-chart-line"></i>
        <span class="hidden md:inline text-sm">Tiến độ</span>
      </button>
    `;
    
    // Thêm vào links container
    linksContainer.appendChild(modalButtons);
  });
}

// Auto-init khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSharedHeader);
} else {
  initSharedHeader();
}

