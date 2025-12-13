/**
 * Preferences Modal Component
 */

function initPreferencesModal() {
  // Tạo modal nếu chưa có
  if (!document.getElementById('preferences-modal')) {
    const modal = modalManager.createModal(
      'preferences-modal',
      '⚙️ Tùy chọn học tập',
      getPreferencesModalContent()
    );
  }
}

function getPreferencesModalContent() {
  return `
    <div class="space-y-6">
      <!-- Topics -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Topics yêu thích</label>
        <select id="modal-preferredTopics" multiple class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="Food & Drink">Food & Drink</option>
          <option value="Travel">Travel</option>
          <option value="Work">Work</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Technology">Technology</option>
          <option value="Sports">Sports</option>
          <option value="Entertainment">Entertainment</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Giữ Ctrl/Cmd để chọn nhiều</p>
      </div>

      <!-- Levels -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Levels yêu thích</label>
        <div class="flex flex-wrap gap-3">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="A1" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">A1</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="A2" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">A2</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="B1" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">B1</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="B2" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">B2</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="C1" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">C1</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="C2" class="mr-2 modal-level-checkbox"> 
            <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">C2</span>
          </label>
        </div>
      </div>

      <!-- Difficulty -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
        <select id="modal-difficulty" class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="easy">Dễ</option>
          <option value="medium">Vừa</option>
          <option value="hard">Khó</option>
          <option value="adaptive">Tự động (khuyến nghị)</option>
        </select>
      </div>

      <!-- Daily Goal -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Mục tiêu hàng ngày</label>
        <div class="flex items-center gap-2">
          <input type="number" id="modal-dailyGoal" min="10" max="200" class="w-24 px-3 py-2 border rounded-lg text-sm">
          <span class="text-sm text-gray-600">từ/ngày</span>
        </div>
      </div>

      <!-- Options -->
      <div class="space-y-3 border-t pt-4">
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" id="modal-showHints" class="mr-2">
          <span class="text-sm">Hiển thị gợi ý</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" id="modal-autoPlayAudio" class="mr-2">
          <span class="text-sm">Tự động phát audio</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" id="modal-showTranslation" class="mr-2">
          <span class="text-sm">Hiển thị bản dịch</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" id="modal-adaptiveLearning" class="mr-2">
          <span class="text-sm">Học tập thích ứng (tự động điều chỉnh độ khó)</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input type="checkbox" id="modal-focusWeakAreas" class="mr-2">
          <span class="text-sm">Tập trung vào điểm yếu</span>
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4 border-t">
        <button onclick="savePreferencesFromModal()" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <i class="fas fa-save mr-2"></i> Lưu
        </button>
        <button onclick="resetPreferencesFromModal()" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm">
          <i class="fas fa-undo mr-2"></i> Đặt lại
        </button>
      </div>

      <div id="modal-saveMessage" class="hidden text-green-600 text-sm text-center"></div>
    </div>
  `;
}

function openPreferencesModal() {
  if (typeof preferences === 'undefined') {
    console.error('Preferences not loaded');
    return;
  }

  initPreferencesModal();
  loadPreferencesToModal();
  modalManager.open('preferences-modal');
}

function loadPreferencesToModal() {
  if (typeof preferences === 'undefined') return;
  
  const prefs = preferences.preferences;

  // Topics
  const topicsSelect = document.getElementById('modal-preferredTopics');
  if (topicsSelect) {
    Array.from(topicsSelect.options).forEach(opt => {
      opt.selected = prefs.preferredTopics.includes(opt.value);
    });
  }

  // Levels
  document.querySelectorAll('.modal-level-checkbox').forEach(cb => {
    cb.checked = prefs.preferredLevels.includes(cb.value);
  });

  // Difficulty
  const difficultySelect = document.getElementById('modal-difficulty');
  if (difficultySelect) difficultySelect.value = prefs.difficulty;

  // Daily Goal
  const dailyGoalInput = document.getElementById('modal-dailyGoal');
  if (dailyGoalInput) dailyGoalInput.value = prefs.dailyGoal;

  // Options
  const showHints = document.getElementById('modal-showHints');
  if (showHints) showHints.checked = prefs.showHints;
  
  const autoPlayAudio = document.getElementById('modal-autoPlayAudio');
  if (autoPlayAudio) autoPlayAudio.checked = prefs.autoPlayAudio;
  
  const showTranslation = document.getElementById('modal-showTranslation');
  if (showTranslation) showTranslation.checked = prefs.showTranslation;
  
  const adaptiveLearning = document.getElementById('modal-adaptiveLearning');
  if (adaptiveLearning) adaptiveLearning.checked = prefs.adaptiveLearning;
  
  const focusWeakAreas = document.getElementById('modal-focusWeakAreas');
  if (focusWeakAreas) focusWeakAreas.checked = prefs.focusWeakAreas;
}

function savePreferencesFromModal() {
  if (typeof preferences === 'undefined') return;

  const topicsSelect = document.getElementById('modal-preferredTopics');
  const selectedTopics = Array.from(topicsSelect?.selectedOptions || []).map(opt => opt.value);
  
  const selectedLevels = Array.from(document.querySelectorAll('.modal-level-checkbox:checked')).map(cb => cb.value);

  const updates = {
    preferredTopics: selectedTopics,
    preferredLevels: selectedLevels,
    difficulty: document.getElementById('modal-difficulty')?.value || 'adaptive',
    dailyGoal: parseInt(document.getElementById('modal-dailyGoal')?.value || 50),
    showHints: document.getElementById('modal-showHints')?.checked || false,
    autoPlayAudio: document.getElementById('modal-autoPlayAudio')?.checked || false,
    showTranslation: document.getElementById('modal-showTranslation')?.checked || true,
    adaptiveLearning: document.getElementById('modal-adaptiveLearning')?.checked || true,
    focusWeakAreas: document.getElementById('modal-focusWeakAreas')?.checked || true
  };

  preferences.updatePreferences(updates);

  const msg = document.getElementById('modal-saveMessage');
  if (msg) {
    msg.textContent = '✓ Đã lưu tùy chọn!';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2000);
  }

  // Reload page để áp dụng changes (nếu cần)
  setTimeout(() => {
    if (window.location.pathname.includes('assessment') || window.location.pathname.includes('learn')) {
      window.location.reload();
    }
  }, 1000);
}

function resetPreferencesFromModal() {
  if (confirm('Bạn có chắc muốn đặt lại tất cả tùy chọn về mặc định?')) {
    if (typeof preferences !== 'undefined') {
      preferences.reset();
      loadPreferencesToModal();
      const msg = document.getElementById('modal-saveMessage');
      if (msg) {
        msg.textContent = '✓ Đã đặt lại mặc định!';
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 2000);
      }
    }
  }
}

