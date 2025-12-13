/**
 * Adaptive Difficulty Manager
 * Tự động điều chỉnh độ khó dựa trên performance của người dùng
 */

class AdaptiveDifficulty {
  constructor(storageManager) {
    this.storage = storageManager;
    this.levelWeights = {
      'A1': 1,
      'A2': 2,
      'B1': 3,
      'B2': 4,
      'C1': 5,
      'C2': 6
    };
  }

  /**
   * Tính độ khó của một từ
   */
  calculateDifficulty(word) {
    const wordStats = this.storage.getProgress().words[word.id || word['Base Word']] || {};
    const totalAttempts = (wordStats.correctCount || 0) + (wordStats.incorrectCount || 0);
    
    // Base difficulty từ level
    let difficulty = this.getLevelDifficulty(word.Level || word.level || 'A1');
    
    // Điều chỉnh dựa trên accuracy
    if (totalAttempts >= 3) {
      const accuracy = (wordStats.correctCount || 0) / totalAttempts;
      
      if (accuracy > 0.8) {
        difficulty += 0.5; // Làm đúng nhiều → tăng độ khó
      } else if (accuracy < 0.5) {
        difficulty -= 0.5; // Làm sai nhiều → giảm độ khó
      }
    }
    
    // Điều chỉnh dựa trên số lần review
    if (wordStats.reviewCount > 5) {
      difficulty += 0.3; // Đã review nhiều → khó hơn
    } else if (wordStats.reviewCount === 0) {
      difficulty -= 0.2; // Chưa review → dễ hơn
    }
    
    // Điều chỉnh dựa trên thời gian (từ mới học gần đây → dễ hơn)
    if (wordStats.lastReviewed) {
      const daysSinceReview = (Date.now() - wordStats.lastReviewed) / (1000 * 60 * 60 * 24);
      if (daysSinceReview < 1) {
        difficulty -= 0.3; // Review hôm nay → dễ hơn
      } else if (daysSinceReview > 7) {
        difficulty += 0.3; // Lâu không review → khó hơn
      }
    }
    
    return Math.max(1, Math.min(10, difficulty)); // Clamp 1-10
  }

  /**
   * Lấy độ khó cơ bản từ level
   */
  getLevelDifficulty(level) {
    return this.levelWeights[level] || 3;
  }

  /**
   * Chọn từ với adaptive difficulty
   */
  selectWords(words, count = 12, strategy = 'balanced') {
    // Tính difficulty cho mỗi từ
    const wordsWithDifficulty = words.map(w => ({
      word: w,
      difficulty: this.calculateDifficulty(w),
      level: w.Level || w.level || 'A1'
    }));

    // Sắp xếp theo difficulty
    wordsWithDifficulty.sort((a, b) => a.difficulty - b.difficulty);

    let selected = [];

    if (strategy === 'easy') {
      // Chọn từ dễ nhất
      selected = wordsWithDifficulty.slice(0, count);
    } else if (strategy === 'hard') {
      // Chọn từ khó nhất
      selected = wordsWithDifficulty.slice(-count);
    } else if (strategy === 'balanced') {
      // Mix: 30% dễ, 50% vừa, 20% khó
      const easyCount = Math.floor(count * 0.3);
      const mediumCount = Math.floor(count * 0.5);
      const hardCount = count - easyCount - mediumCount;

      const total = wordsWithDifficulty.length;
      const easyEnd = Math.floor(total * 0.3);
      const mediumEnd = Math.floor(total * 0.8);

      selected = [
        ...wordsWithDifficulty.slice(0, easyEnd).slice(0, easyCount),
        ...wordsWithDifficulty.slice(easyEnd, mediumEnd).slice(0, mediumCount),
        ...wordsWithDifficulty.slice(mediumEnd).slice(0, hardCount)
      ];

      // Shuffle để không quá dễ đoán
      selected = this.shuffle(selected);
    } else if (strategy === 'adaptive') {
      // Chọn dựa trên performance gần đây
      const recentPerformance = this.getRecentPerformance();
      const targetDifficulty = this.calculateTargetDifficulty(recentPerformance);
      
      // Chọn từ gần target difficulty nhất
      selected = wordsWithDifficulty
        .map(w => ({
          ...w,
          diff: Math.abs(w.difficulty - targetDifficulty)
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, count);
    }

    return selected.map(w => w.word);
  }

  /**
   * Tính target difficulty dựa trên performance gần đây
   */
  calculateTargetDifficulty(recentPerformance) {
    const { accuracy, averageDifficulty } = recentPerformance;
    
    let target = averageDifficulty || 5;
    
    // Nếu accuracy cao (>80%) → tăng target difficulty
    if (accuracy > 0.8) {
      target += 1;
    }
    // Nếu accuracy thấp (<60%) → giảm target difficulty
    else if (accuracy < 0.6) {
      target -= 1;
    }
    
    return Math.max(3, Math.min(8, target)); // Clamp 3-8
  }

  /**
   * Lấy performance gần đây
   */
  getRecentPerformance() {
    const progress = this.storage.getProgress();
    const words = progress.words || {};
    
    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalDifficulty = 0;
    let count = 0;
    
    // Chỉ tính từ đã review trong 7 ngày qua
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    Object.values(words).forEach(wordData => {
      if (wordData.lastReviewed && wordData.lastReviewed > sevenDaysAgo) {
        const attempts = (wordData.correctCount || 0) + (wordData.incorrectCount || 0);
        if (attempts > 0) {
          totalCorrect += wordData.correctCount || 0;
          totalAttempts += attempts;
          // Ước tính difficulty từ level
          const level = wordData.level || 'A1';
          totalDifficulty += this.getLevelDifficulty(level);
          count++;
        }
      }
    });
    
    return {
      accuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0.5,
      averageDifficulty: count > 0 ? totalDifficulty / count : 5,
      totalAttempts
    };
  }

  /**
   * Shuffle array
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export
if (typeof window !== 'undefined') {
  window.AdaptiveDifficulty = AdaptiveDifficulty;
}

