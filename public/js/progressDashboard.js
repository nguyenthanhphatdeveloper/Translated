/**
 * Progress Dashboard Manager
 * Quản lý và hiển thị tiến độ học tập
 */

class ProgressDashboard {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Lấy thống kê theo ngày
   */
  getDailyStats(date = new Date()) {
    const dateStr = this.formatDate(date);
    const progress = this.storage.getProgress();
    const daily = progress.daily || {};
    const dayData = daily[dateStr] || {};

    return {
      date: dateStr,
      wordsLearned: dayData.wordsLearned || 0,
      wordsReviewed: dayData.wordsReviewed || 0,
      correctCount: dayData.correctCount || 0,
      incorrectCount: dayData.incorrectCount || 0,
      accuracy: dayData.accuracy || 0,
      timeSpent: dayData.timeSpent || 0, // minutes
      sessions: dayData.sessions || 0
    };
  }

  /**
   * Lấy thống kê theo tuần
   */
  getWeeklyStats() {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      week.push(this.getDailyStats(date));
    }

    const totalWords = week.reduce((sum, d) => sum + d.wordsLearned, 0);
    const totalReviewed = week.reduce((sum, d) => sum + d.wordsReviewed, 0);
    const totalCorrect = week.reduce((sum, d) => sum + d.correctCount, 0);
    const totalAttempts = week.reduce((sum, d) => sum + d.correctCount + d.incorrectCount, 0);
    const totalTime = week.reduce((sum, d) => sum + d.timeSpent, 0);

    return {
      days: week,
      totalWords,
      totalReviewed,
      averageAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      totalTime,
      averageTimePerDay: Math.round(totalTime / 7),
      streak: this.calculateStreak()
    };
  }

  /**
   * Tính streak (số ngày liên tiếp học)
   */
  calculateStreak() {
    const progress = this.storage.getProgress();
    const daily = progress.daily || {};
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      const dayData = daily[dateStr];
      if (dayData && (dayData.wordsLearned > 0 || dayData.wordsReviewed > 0)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Lấy tổng quan thống kê
   */
  getOverallStats() {
    const progress = this.storage.getProgress();
    const stats = progress.stats || {};
    const words = progress.words || {};

    // Tính accuracy tổng thể
    let totalCorrect = 0;
    let totalAttempts = 0;
    Object.values(words).forEach(wordData => {
      totalCorrect += wordData.correctCount || 0;
      totalAttempts += (wordData.correctCount || 0) + (wordData.incorrectCount || 0);
    });

    // Tính số từ đã học (có ít nhất 1 attempt)
    const learnedWords = Object.values(words).filter(w => 
      (w.correctCount || 0) + (w.incorrectCount || 0) > 0
    ).length;

    // Tính số từ đã master (accuracy > 80% và review >= 3 lần)
    const masteredWords = Object.values(words).filter(w => {
      const attempts = (w.correctCount || 0) + (w.incorrectCount || 0);
      if (attempts < 3) return false;
      const accuracy = (w.correctCount || 0) / attempts;
      return accuracy >= 0.8;
    }).length;

    return {
      totalWords: stats.totalWords || 0,
      learnedWords,
      masteredWords,
      overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      totalAttempts,
      streak: this.calculateStreak()
    };
  }

  /**
   * Lấy insights (phân tích thông minh)
   */
  getInsights() {
    const insights = [];
    const weekly = this.getWeeklyStats();
    const overall = this.getOverallStats();

    // Insight về streak
    if (overall.streak >= 7) {
      insights.push({
        type: 'success',
        icon: '🔥',
        title: 'Streak tuyệt vời!',
        message: `Bạn đã học liên tiếp ${overall.streak} ngày. Tiếp tục phát huy!`
      });
    } else if (overall.streak === 0) {
      insights.push({
        type: 'warning',
        icon: '💪',
        title: 'Bắt đầu học ngay!',
        message: 'Hãy bắt đầu streak học tập của bạn hôm nay!'
      });
    }

    // Insight về accuracy
    if (overall.overallAccuracy >= 80) {
      insights.push({
        type: 'success',
        icon: '⭐',
        title: 'Độ chính xác cao!',
        message: `Bạn đang làm rất tốt với ${overall.overallAccuracy}% độ chính xác.`
      });
    } else if (overall.overallAccuracy < 60) {
      insights.push({
        type: 'info',
        icon: '📚',
        title: 'Cần cải thiện',
        message: `Độ chính xác ${overall.overallAccuracy}%. Hãy ôn tập lại các từ đã học.`
      });
    }

    // Insight về thời gian học
    if (weekly.averageTimePerDay >= 30) {
      insights.push({
        type: 'success',
        icon: '⏱️',
        title: 'Thời gian học tốt!',
        message: `Bạn dành trung bình ${weekly.averageTimePerDay} phút/ngày để học.`
      });
    }

    // Insight về từ đã master
    if (overall.masteredWords >= 100) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Thành tích ấn tượng!',
        message: `Bạn đã master ${overall.masteredWords} từ. Xuất sắc!`
      });
    }

    return insights;
  }

  /**
   * Format date thành YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Cập nhật daily stats
   */
  updateDailyStats(date, updates) {
    const dateStr = this.formatDate(date);
    const progress = this.storage.getProgress();
    
    if (!progress.daily) progress.daily = {};
    if (!progress.daily[dateStr]) {
      progress.daily[dateStr] = {
        wordsLearned: 0,
        wordsReviewed: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        timeSpent: 0,
        sessions: 0
      };
    }

    Object.assign(progress.daily[dateStr], updates);
    
    // Tính lại accuracy
    const dayData = progress.daily[dateStr];
    const totalAttempts = dayData.correctCount + dayData.incorrectCount;
    if (totalAttempts > 0) {
      dayData.accuracy = Math.round((dayData.correctCount / totalAttempts) * 100);
    }

    this.storage.saveProgress(progress);
  }

  /**
   * Ghi nhận session học tập
   */
  recordSession(date, wordsLearned, wordsReviewed, correctCount, incorrectCount, timeSpent) {
    const dateStr = this.formatDate(date);
    const progress = this.storage.getProgress();
    
    if (!progress.daily) progress.daily = {};
    if (!progress.daily[dateStr]) {
      progress.daily[dateStr] = {
        wordsLearned: 0,
        wordsReviewed: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        timeSpent: 0,
        sessions: 0
      };
    }

    const dayData = progress.daily[dateStr];
    dayData.wordsLearned += wordsLearned;
    dayData.wordsReviewed += wordsReviewed;
    dayData.correctCount += correctCount;
    dayData.incorrectCount += incorrectCount;
    dayData.timeSpent += timeSpent;
    dayData.sessions += 1;

    // Tính lại accuracy
    const totalAttempts = dayData.correctCount + dayData.incorrectCount;
    if (totalAttempts > 0) {
      dayData.accuracy = Math.round((dayData.correctCount / totalAttempts) * 100);
    }

    this.storage.saveProgress(progress);
  }
}

// Export
if (typeof window !== 'undefined') {
  window.ProgressDashboard = ProgressDashboard;
}

