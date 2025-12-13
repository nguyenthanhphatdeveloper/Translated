/**
 * Learning Preferences Manager
 * Quản lý sở thích và tùy chọn học tập của người dùng
 */

class LearningPreferences {
  constructor() {
    this.storageKey = 'learning_preferences';
    this.defaultPreferences = {
      // Topics yêu thích
      preferredTopics: [],
      
      // Levels yêu thích
      preferredLevels: ['A1', 'A2', 'B1', 'B2'],
      
      // Chế độ học ưa thích
      preferredModes: ['sentence-fill', 'matching', 'ipa'],
      
      // Mục tiêu hàng ngày
      dailyGoal: 50, // từ/ngày
      
      // Thời gian học ưa thích
      studyTime: 'anytime', // morning, afternoon, evening, anytime
      
      // Độ khó
      difficulty: 'adaptive', // easy, medium, hard, adaptive
      
      // Tùy chọn hiển thị
      showHints: true,
      autoPlayAudio: false,
      showTranslation: true,
      
      // Thông báo
      enableNotifications: false,
      reminderTime: '18:00',
      
      // Cá nhân hóa
      adaptiveLearning: true,
      focusWeakAreas: true,
      
      // Cập nhật lần cuối
      lastUpdated: Date.now()
    };
    
    this.preferences = this.loadPreferences();
  }

  /**
   * Load preferences từ localStorage
   */
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge với default để đảm bảo có tất cả fields
        return { ...this.defaultPreferences, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e);
    }
    return { ...this.defaultPreferences };
  }

  /**
   * Lưu preferences vào localStorage
   */
  savePreferences() {
    try {
      this.preferences.lastUpdated = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      return true;
    } catch (e) {
      console.error('Failed to save preferences:', e);
      return false;
    }
  }

  /**
   * Cập nhật preference
   */
  updatePreference(key, value) {
    if (key in this.preferences) {
      this.preferences[key] = value;
      this.savePreferences();
      return true;
    }
    return false;
  }

  /**
   * Cập nhật nhiều preferences cùng lúc
   */
  updatePreferences(updates) {
    Object.assign(this.preferences, updates);
    this.savePreferences();
    return true;
  }

  /**
   * Reset về mặc định
   */
  reset() {
    this.preferences = { ...this.defaultPreferences };
    this.savePreferences();
  }

  /**
   * Lọc từ vựng theo preferences
   */
  filterWords(words) {
    if (!words || words.length === 0) return [];
    
    let filtered = [...words];

    // Lọc theo topics (nếu có)
    if (this.preferences.preferredTopics.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(w => 
        w.Topic && this.preferences.preferredTopics.includes(w.Topic)
      );
      // Fallback: nếu filter quá strict (mất >90%), bỏ qua filter này
      if (filtered.length < beforeCount * 0.1 && beforeCount > 10) {
        console.warn('Topics filter too strict, skipping');
        filtered = [...words];
      }
    }

    // Lọc theo levels (nếu có)
    if (this.preferences.preferredLevels.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(w => 
        w.Level && this.preferences.preferredLevels.includes(w.Level)
      );
      // Fallback: nếu filter quá strict (mất >90%), bỏ qua filter này
      if (filtered.length < beforeCount * 0.1 && beforeCount > 10) {
        console.warn('Levels filter too strict, skipping');
        // Không fallback về words gốc nếu đã filter topics, chỉ bỏ filter levels
        if (this.preferences.preferredTopics.length > 0) {
          // Giữ lại filtered từ topics
        } else {
          filtered = [...words];
        }
      }
    }

    return filtered.length > 0 ? filtered : words; // Fallback cuối cùng
  }

  /**
   * Sắp xếp từ theo difficulty preference
   */
  sortByDifficulty(words) {
    const sorted = [...words];
    
    if (this.preferences.difficulty === 'easy') {
      // Sắp xếp từ dễ đến khó (A1 -> C2)
      const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
      sorted.sort((a, b) => {
        const aLevel = levelOrder[a.Level] || 99;
        const bLevel = levelOrder[b.Level] || 99;
        return aLevel - bLevel;
      });
    } else if (this.preferences.difficulty === 'hard') {
      // Sắp xếp từ khó đến dễ (C2 -> A1)
      const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
      sorted.sort((a, b) => {
        const aLevel = levelOrder[a.Level] || 99;
        const bLevel = levelOrder[b.Level] || 99;
        return bLevel - aLevel;
      });
    }
    // 'adaptive' và 'medium' không sắp xếp, giữ nguyên

    return sorted;
  }

  /**
   * Kiểm tra xem có nên hiển thị hint không
   */
  shouldShowHint() {
    return this.preferences.showHints;
  }

  /**
   * Kiểm tra xem có nên tự động phát audio không
   */
  shouldAutoPlayAudio() {
    return this.preferences.autoPlayAudio;
  }

  /**
   * Lấy mục tiêu hàng ngày
   */
  getDailyGoal() {
    return this.preferences.dailyGoal;
  }

  /**
   * Kiểm tra xem có bật adaptive learning không
   */
  isAdaptiveLearningEnabled() {
    return this.preferences.adaptiveLearning;
  }

  /**
   * Kiểm tra xem có focus vào weak areas không
   */
  shouldFocusWeakAreas() {
    return this.preferences.focusWeakAreas;
  }
}

// Export để sử dụng global
if (typeof window !== 'undefined') {
  window.LearningPreferences = LearningPreferences;
}

