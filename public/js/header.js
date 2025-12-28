/**
 * Unified Header Component
 * Replaces hardcoded navbars with a dynamic, categorized dropdown system
 */

const Header = {
    // Navigation Data Structure
    navData: [
        {
            title: 'Học tập',
            icon: 'fa-book-open',
            items: [
                { name: 'Học từ vựng', href: '/learn', icon: 'fa-graduation-cap' },
                { name: 'Combo 10 phút', href: '/combo', icon: 'fa-clock' },
                { name: 'Ngữ pháp', href: '/grammar', icon: 'fa-book' },
                { name: 'Phát âm IPA', href: '/ipa', icon: 'fa-volume-up' },
                { name: 'Quiz Mix', href: '/quiz-mix', icon: 'fa-random' }
            ]
        },
        {
            title: 'Luyện tập',
            icon: 'fa-dumbbell',
            items: [
                { name: 'Hội thoại AI', href: '/conversation-practice', icon: 'fa-comments' },
                { name: 'Voice Chat', href: '/voice-chat', icon: 'fa-microphone' },
                { name: 'Luyện Viết', href: '/writing-practice', icon: 'fa-pen-fancy' }
            ]
        },
        {
            title: 'Ôn tập',
            icon: 'fa-sync',
            items: [
                { name: 'Ôn từ đã học', href: '/review', icon: 'fa-redo' },
                { name: 'Ôn ngữ pháp', href: '/review-grammar', icon: 'fa-tasks' }
            ]
        },
        {
            title: 'Kiểm tra',
            icon: 'fa-clipboard-check',
            items: [
                { name: 'Test Level', href: '/assessment', icon: 'fa-chart-bar' }
            ]
        }
    ],

    init() {
        this.render();
        this.attachEvents();
        this.highlightActive();
    },

    render() {
        // Find existing nav to replace or create new one
        let nav = document.querySelector('nav');
        if (!nav) {
            nav = document.createElement('nav');
            document.body.prepend(nav);
        }

        nav.className = 'bg-white shadow-sm border-b sticky top-0 z-50';
        nav.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a href="/" class="flex items-center gap-2 text-xl font-bold text-purple-600 hover:text-purple-700 transition">
              <span class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <i class="fas fa-book text-purple-600 text-sm"></i>
              </span>
              <span>English Vocab</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-1 lg:space-x-4">
            ${this.renderDesktopNav()}
          </div>

          <!-- Utility Buttons (Right Actions) -->
          <div class="hidden md:flex items-center space-x-2 pl-4 border-l ml-4">
            <button onclick="if(typeof openPreferencesModal === 'function') openPreferencesModal()" 
              class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Tùy chọn">
              <i class="fas fa-cog text-lg"></i>
            </button>
            <button onclick="if(typeof openDashboardModal === 'function') openDashboardModal()" 
              class="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium">
              <i class="fas fa-chart-line text-lg"></i>
              <span>Tiến độ</span>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden">
            <button id="mobile-menu-btn" class="p-2 text-gray-600 hover:text-purple-600 focus:outline-none">
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div id="mobile-menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity opacity-0"></div>

      <!-- Mobile Menu Drawer -->
      <div id="mobile-menu-drawer" class="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-50 transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col">
        <div class="flex items-center justify-between p-4 border-b">
          <span class="font-bold text-lg text-gray-900">Menu</span>
          <button id="close-mobile-menu" class="p-2 text-gray-500 hover:text-red-500">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          ${this.renderMobileNav()}
          
          <div class="border-t pt-4 mt-4 space-y-2">
            <button onclick="if(typeof openDashboardModal === 'function') { openDashboardModal(); Header.closeMobileMenu(); }" 
              class="flex w-full items-center gap-3 px-4 py-3 text-gray-700 bg-purple-50 rounded-xl hover:bg-purple-100">
              <i class="fas fa-chart-line text-purple-600"></i>
              <span class="font-medium">Xem tiến độ</span>
            </button>
            <button onclick="if(typeof openPreferencesModal === 'function') { openPreferencesModal(); Header.closeMobileMenu(); }"
              class="flex w-full items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">
              <i class="fas fa-cog"></i>
              <span class="font-medium">Cài đặt / Tùy chọn</span>
            </button>
          </div>
        </div>
      </div>
    `;
    },

    renderDesktopNav() {
        return this.navData.map(group => `
      <div class="relative group">
        <button class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-md transition-colors group-hover:bg-purple-50">
          <i class="fas ${group.icon} opacity-60"></i>
          ${group.title}
          <i class="fas fa-chevron-down text-xs opacity-40 ml-1 transition-transform group-hover:rotate-180"></i>
        </button>
        
        <!-- Dropdown -->
        <div class="absolute left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
          <div class="bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 p-1.5 mt-2">
            ${group.items.map(item => `
              <a href="${item.href}" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors">
                <span class="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                  <i class="fas ${item.icon} text-xs"></i>
                </span>
                ${item.name}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    },

    renderMobileNav() {
        return this.navData.map(group => `
      <div class="mb-4">
        <h3 class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          ${group.title}
        </h3>
        <div class="space-y-1">
          ${group.items.map(item => `
            <a href="${item.href}" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-purple-50 transition-colors">
              <i class="fas ${item.icon} w-5 text-center text-gray-400"></i>
              <span class="font-medium">${item.name}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
    },

    attachEvents() {
        const btn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');

        if (btn) btn.onclick = () => this.openMobileMenu();
        if (closeBtn) closeBtn.onclick = () => this.closeMobileMenu();
        if (overlay) overlay.onclick = () => this.closeMobileMenu();
    },

    openMobileMenu() {
        const drawer = document.getElementById('mobile-menu-drawer');
        const overlay = document.getElementById('mobile-menu-overlay');

        overlay.classList.remove('hidden');
        // Force reflow for transition
        void overlay.offsetWidth;
        overlay.classList.remove('opacity-0');

        drawer.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    },

    closeMobileMenu() {
        const drawer = document.getElementById('mobile-menu-drawer');
        const overlay = document.getElementById('mobile-menu-overlay');

        drawer.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');

        setTimeout(() => {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    },

    highlightActive() {
        const currentPath = window.location.pathname;

        // Highlight desktop links
        document.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('text-purple-700', 'bg-purple-50');
                // If inside dropdown, highlight parent group
                const parentGroup = link.closest('.group');
                if (parentGroup) {
                    const parentBtn = parentGroup.querySelector('button');
                    if (parentBtn) parentBtn.classList.add('text-purple-700', 'bg-purple-50');
                }
            }
        });
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Header.init());
} else {
    Header.init();
}
