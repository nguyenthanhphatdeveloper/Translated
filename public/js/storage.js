/**
 * Storage Manager
 * Quản lý LocalStorage cho user progress
 */

class StorageManager {
  constructor() {
    this.storageKey = 'vocabulary_progress';
    this.settingsKey = 'vocabulary_settings';
  }

  /**
   * Lấy progress của user
   */
  getProgress() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return this.initProgress();
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing progress:', error);
      return this.initProgress();
    }
  }

  /**
   * Lưu progress
   */
  saveProgress(progress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  /**
   * Khởi tạo progress mới
   */
  initProgress() {
    const progress = {
      words: {},
      stats: {
        totalWords: 0,
        learnedWords: 0,
        masteredWords: 0,
        currentLevel: 'A1',
        streak: 0,
        lastStudyDate: null,
        totalStudyTime: 0
      },
      settings: {
        dailyGoal: 20,
        preferredLevel: 'A1',
        enableAudio: true,
        enableNotifications: true
      }
    };
    this.saveProgress(progress);
    return progress;
  }

  /**
   * Lấy thông tin một từ
   */
  getWordProgress(wordId) {
    const progress = this.getProgress();
    return progress.words[wordId] || null;
  }

  /**
   * Cập nhật progress của một từ
   */
  updateWordProgress(wordId, wordData, status = 'learning') {
    const progress = this.getProgress();
    
    if (!progress.words[wordId]) {
      progress.words[wordId] = {
        word: wordData['Base Word'],
        level: wordData.Level,
        status: status,
        firstLearned: new Date().toISOString(),
        lastReviewed: new Date().toISOString(),
        nextReview: this.calculateNextReview(1), // +1 day
        reviewCount: 0,
        difficulty: 'medium',
        correctCount: 0,
        incorrectCount: 0,
        masteryScore: 0
      };
      progress.stats.learnedWords++;
    } else {
      progress.words[wordId].lastReviewed = new Date().toISOString();
      progress.words[wordId].status = status;
    }

    this.updateStats(progress);
    this.saveProgress(progress);
    return progress.words[wordId];
  }

  /**
   * Ghi nhận kết quả trả lời
   */
  recordAnswer(wordId, isCorrect) {
    const progress = this.getProgress();
    if (!progress.words[wordId]) return;

    const wordProgress = progress.words[wordId];
    if (isCorrect) {
      wordProgress.correctCount++;
    } else {
      wordProgress.incorrectCount++;
    }

    // Tính mastery score (0-1)
    const total = wordProgress.correctCount + wordProgress.incorrectCount;
    wordProgress.masteryScore = wordProgress.correctCount / total;

    // Cập nhật status
    if (wordProgress.masteryScore >= 0.8 && wordProgress.reviewCount >= 3) {
      wordProgress.status = 'mastered';
      progress.stats.masteredWords++;
    } else {
      wordProgress.status = 'learning';
    }

    this.saveProgress(progress);
  }

  /**
   * Đánh giá từ trong review (Spaced Repetition)
   */
  reviewWord(wordId, rating) {
    // rating: 'again' | 'hard' | 'good' | 'easy'
    const progress = this.getProgress();
    if (!progress.words[wordId]) return;

    const wordProgress = progress.words[wordId];
    wordProgress.reviewCount++;
    wordProgress.lastReviewed = new Date().toISOString();

    // Tính next review dựa trên rating
    const intervals = {
      'again': 1,    // 1 ngày
      'hard': 3,     // 3 ngày
      'good': 7,     // 7 ngày
      'easy': 14     // 14 ngày
    };

    const days = intervals[rating] || 7;
    wordProgress.nextReview = this.calculateNextReview(days);

    // Cập nhật difficulty
    if (rating === 'again' || rating === 'hard') {
      wordProgress.difficulty = 'hard';
    } else if (rating === 'easy') {
      wordProgress.difficulty = 'easy';
    }

    this.saveProgress(progress);
  }

  /**
   * Tính ngày review tiếp theo
   */
  calculateNextReview(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  /**
   * Lấy danh sách từ cần review hôm nay
   */
  getWordsToReview() {
    const progress = this.getProgress();
    const today = new Date().toISOString().split('T')[0];
    
    return Object.entries(progress.words)
      .filter(([id, word]) => {
        const nextReview = word.nextReview.split('T')[0];
        return nextReview <= today && word.status !== 'mastered';
      })
      .map(([id, word]) => ({ id, ...word }));
  }

  /**
   * Cập nhật stats tổng
   */
  updateStats(progress) {
    const words = Object.values(progress.words);
    progress.stats.learnedWords = words.length;
    progress.stats.masteredWords = words.filter(w => w.status === 'mastered').length;
    
    // Cập nhật streak
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = progress.stats.lastStudyDate;
    
    if (lastStudy === today) {
      // Đã học hôm nay, không cần update
    } else if (lastStudy === this.getYesterday()) {
      // Học liên tiếp
      progress.stats.streak++;
    } else {
      // Mất streak
      progress.stats.streak = 1;
    }
    
    progress.stats.lastStudyDate = today;
  }

  /**
   * Lấy ngày hôm qua
   */
  getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Lấy settings
   */
  getSettings() {
    const stored = localStorage.getItem(this.settingsKey);
    if (!stored) {
      return this.getProgress().settings;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      return this.getProgress().settings;
    }
  }

  /**
   * Lưu settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Reset progress (cẩn thận!)
   */
  resetProgress() {
    localStorage.removeItem(this.storageKey);
    return this.initProgress();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}

