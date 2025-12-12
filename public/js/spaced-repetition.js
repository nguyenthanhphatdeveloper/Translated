/**
 * Spaced Repetition System (SRS)
 * Thuật toán lặp lại ngắt quãng để tối ưu việc học từ
 */

class SpacedRepetition {
  constructor() {
    // Intervals (days) cho mỗi lần review
    this.intervals = {
      'again': 1,      // Chưa nhớ → ôn lại sau 1 ngày
      'hard': 3,       // Nhớ một chút → sau 3 ngày
      'good': 7,       // Nhớ tốt → sau 7 ngày
      'easy': 14       // Nhớ rất tốt → sau 14 ngày
    };

    // Ease factor (độ dễ nhớ)
    this.easeFactors = {
      'again': 0.8,    // Giảm độ dễ
      'hard': 0.9,
      'good': 1.0,     // Giữ nguyên
      'easy': 1.3      // Tăng độ dễ
    };
  }

  /**
   * Tính ngày review tiếp theo dựa trên rating
   */
  calculateNextReview(currentInterval, rating, easeFactor = 1.0) {
    const baseInterval = this.intervals[rating] || 7;
    const newInterval = Math.round(currentInterval * this.easeFactors[rating] * easeFactor);
    
    const date = new Date();
    date.setDate(date.getDate() + newInterval);
    return date.toISOString();
  }

  /**
   * Tính ease factor mới
   */
  updateEaseFactor(currentEase, rating) {
    const change = this.easeFactors[rating];
    const newEase = currentEase * change;
    
    // Giới hạn ease factor trong khoảng 1.3 - 2.5
    return Math.max(1.3, Math.min(2.5, newEase));
  }

  /**
   * Tính interval cho lần review đầu tiên
   */
  getInitialInterval(rating) {
    return this.intervals[rating] || 1;
  }

  /**
   * Kiểm tra từ có cần review không
   */
  needsReview(nextReviewDate) {
    const today = new Date();
    const reviewDate = new Date(nextReviewDate);
    return reviewDate <= today;
  }

  /**
   * Tính số từ cần review hôm nay
   */
  getReviewCount(words) {
    const today = new Date().toISOString().split('T')[0];
    return words.filter(word => {
      if (!word.nextReview) return false;
      const reviewDate = word.nextReview.split('T')[0];
      return reviewDate <= today;
    }).length;
  }

  /**
   * Sắp xếp từ theo độ ưu tiên review
   */
  prioritizeWords(words) {
    const today = new Date();
    
    return words
      .filter(word => word.nextReview)
      .map(word => {
        const reviewDate = new Date(word.nextReview);
        const daysOverdue = Math.floor((today - reviewDate) / (1000 * 60 * 60 * 24));
        
        return {
          ...word,
          daysOverdue: Math.max(0, daysOverdue),
          priority: this.calculatePriority(word, daysOverdue)
        };
      })
      .sort((a, b) => {
        // Ưu tiên từ quá hạn nhiều nhất
        if (b.daysOverdue !== a.daysOverdue) {
          return b.daysOverdue - a.daysOverdue;
        }
        // Sau đó ưu tiên theo mastery score thấp
        return a.masteryScore - b.masteryScore;
      });
  }

  /**
   * Tính điểm ưu tiên
   */
  calculatePriority(word, daysOverdue) {
    let priority = daysOverdue * 10; // Quá hạn càng lâu càng ưu tiên
    
    // Ưu tiên từ khó
    if (word.difficulty === 'hard') {
      priority += 5;
    }
    
    // Ưu tiên từ có mastery score thấp
    priority += (1 - word.masteryScore) * 3;
    
    return priority;
  }

  /**
   * Tính số từ cần học mỗi ngày để đạt mục tiêu
   */
  calculateDailyGoal(totalWords, targetDays) {
    return Math.ceil(totalWords / targetDays);
  }

  /**
   * Dự đoán số từ sẽ cần review trong tương lai
   */
  predictFutureReviews(words, daysAhead = 7) {
    const predictions = {};
    const today = new Date();
    
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      predictions[dateStr] = words.filter(word => {
        if (!word.nextReview) return false;
        const reviewDate = word.nextReview.split('T')[0];
        return reviewDate === dateStr;
      }).length;
    }
    
    return predictions;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpacedRepetition;
}

