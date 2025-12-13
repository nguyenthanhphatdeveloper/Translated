/**
 * Dashboard Modal Component
 */

function initDashboardModal() {
  if (!document.getElementById('dashboard-modal')) {
    const modal = modalManager.createModal(
      'dashboard-modal',
      '📊 Bảng tiến độ',
      getDashboardModalContent()
    );
  }
}

function getDashboardModalContent() {
  return `
    <div class="space-y-6">
      <!-- Overall Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-purple-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-600 mb-1">🔥 Streak</div>
          <div class="text-2xl font-bold text-purple-600" id="modal-streak">0</div>
          <div class="text-xs text-gray-500">ngày</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-600 mb-1">📚 Đã học</div>
          <div class="text-2xl font-bold text-blue-600" id="modal-learnedWords">0</div>
          <div class="text-xs text-gray-500">từ</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-600 mb-1">✅ Chính xác</div>
          <div class="text-2xl font-bold text-green-600" id="modal-accuracy">0%</div>
          <div class="text-xs text-gray-500">tổng thể</div>
        </div>
        <div class="bg-yellow-50 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-600 mb-1">🎯 Master</div>
          <div class="text-2xl font-bold text-yellow-600" id="modal-masteredWords">0</div>
          <div class="text-xs text-gray-500">từ</div>
        </div>
      </div>

      <!-- Weekly Chart -->
      <div class="border rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">📈 Tiến độ 7 ngày qua</h3>
        <div class="grid grid-cols-7 gap-1" id="modal-weeklyChart">
          <div class="text-center text-xs text-gray-500">Đang tải...</div>
        </div>
      </div>

      <!-- Weak Areas -->
      <div class="border rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">📚 Điểm yếu</h3>
        <div id="modal-weakAreas" class="space-y-2">
          <div class="text-gray-500 text-center text-sm py-2">Đang tải...</div>
        </div>
      </div>

      <!-- Insights -->
      <div class="border rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">💡 Insights</h3>
        <div id="modal-insights" class="space-y-2">
          <div class="text-gray-500 text-center text-sm py-2">Đang tải...</div>
        </div>
      </div>
    </div>
  `;
}

function openDashboardModal() {
  if (typeof storage === 'undefined' || typeof dashboard === 'undefined') {
    console.error('Dashboard dependencies not loaded');
    return;
  }

  initDashboardModal();
  loadDashboardToModal();
  modalManager.open('dashboard-modal');
}

function loadDashboardToModal() {
  if (typeof dashboard === 'undefined' || typeof weakAreas === 'undefined') return;

  // Load overall stats
  const stats = dashboard.getOverallStats();
  const streakEl = document.getElementById('modal-streak');
  const learnedEl = document.getElementById('modal-learnedWords');
  const accuracyEl = document.getElementById('modal-accuracy');
  const masteredEl = document.getElementById('modal-masteredWords');

  if (streakEl) streakEl.textContent = stats.streak;
  if (learnedEl) learnedEl.textContent = stats.learnedWords;
  if (accuracyEl) accuracyEl.textContent = stats.overallAccuracy + '%';
  if (masteredEl) masteredEl.textContent = stats.masteredWords;

  // Load weekly chart
  const weekly = dashboard.getWeeklyStats();
  const chartContainer = document.getElementById('modal-weeklyChart');
  if (chartContainer) {
    const maxWords = Math.max(...weekly.days.map(d => d.wordsLearned), 1);
    
    chartContainer.innerHTML = weekly.days.map(day => {
      const date = new Date(day.date);
      const label = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      const height = maxWords > 0 ? (day.wordsLearned / maxWords) * 100 : 0;
      
      return `
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">${label}</div>
          <div class="bg-gray-200 rounded h-20 flex items-end justify-center relative">
            <div class="bg-purple-600 rounded-t w-full transition-all" style="height: ${height}%"></div>
          </div>
          <div class="text-xs text-gray-700 mt-1">${day.wordsLearned}</div>
        </div>
      `;
    }).join('');
  }

  // Load weak areas
  const analysis = weakAreas.analyzeWeakAreas();
  const weakAreasContainer = document.getElementById('modal-weakAreas');
  if (weakAreasContainer) {
    if (analysis.weakTopics.length === 0) {
      weakAreasContainer.innerHTML = '<div class="text-gray-500 text-center text-sm py-2">Bạn chưa có điểm yếu nào. Tiếp tục phát huy! 🎉</div>';
    } else {
      weakAreasContainer.innerHTML = analysis.weakTopics.slice(0, 3).map(topic => `
        <div class="border rounded p-2 text-sm">
          <div class="flex justify-between items-center mb-1">
            <span class="font-medium">${topic.topic}</span>
            <span class="text-xs text-gray-600">${topic.count} từ</span>
          </div>
          <div class="text-xs text-gray-600 mb-1">Độ chính xác: ${topic.averageAccuracy}%</div>
          <div class="bg-gray-200 rounded-full h-1.5">
            <div class="bg-red-500 h-1.5 rounded-full" style="width: ${100 - topic.averageAccuracy}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Load insights
  const insights = dashboard.getInsights();
  const insightsContainer = document.getElementById('modal-insights');
  if (insightsContainer) {
    if (insights.length === 0) {
      insightsContainer.innerHTML = '<div class="text-gray-500 text-center text-sm py-2">Chưa có insights. Hãy học thêm để xem phân tích!</div>';
    } else {
      insightsContainer.innerHTML = insights.slice(0, 3).map(insight => `
        <div class="border-l-4 ${insight.type === 'success' ? 'border-green-500' : insight.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'} bg-gray-50 p-3 rounded text-sm">
          <div class="flex items-start">
            <span class="text-lg mr-2">${insight.icon}</span>
            <div>
              <div class="font-medium text-gray-900">${insight.title}</div>
              <div class="text-xs text-gray-600 mt-0.5">${insight.message}</div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

