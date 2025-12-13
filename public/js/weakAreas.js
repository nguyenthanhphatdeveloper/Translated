/**
 * Weak Areas Analyzer
 * Phân tích và phát hiện điểm yếu của người dùng
 */

class WeakAreasAnalyzer {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Phân tích điểm yếu tổng thể
   */
  analyzeWeakAreas() {
    const stats = this.storage.getProgress();
    const weakWords = [];
    const wordStats = stats.words || {};

    // Thu thập từ có accuracy thấp
    Object.entries(wordStats).forEach(([wordId, wordData]) => {
      const totalAttempts = (wordData.correctCount || 0) + (wordData.incorrectCount || 0);
      if (totalAttempts < 3) return; // Bỏ qua từ chưa đủ dữ liệu

      const accuracy = (wordData.correctCount || 0) / totalAttempts;
      if (accuracy < 0.6) {
        weakWords.push({
          wordId,
          word: wordData.word || wordId,
          accuracy: Math.round(accuracy * 100),
          totalAttempts,
          correctCount: wordData.correctCount || 0,
          incorrectCount: wordData.incorrectCount || 0,
          topic: wordData.topic || 'Unknown',
          level: wordData.level || 'Unknown',
          pos: wordData.pos || 'Unknown',
          lastReviewed: wordData.lastReviewed || null
        });
      }
    });

    // Nhóm theo topic
    const weakTopics = {};
    weakWords.forEach(w => {
      const topic = w.topic;
      if (!weakTopics[topic]) {
        weakTopics[topic] = {
          topic,
          count: 0,
          words: [],
          averageAccuracy: 0
        };
      }
      weakTopics[topic].count++;
      weakTopics[topic].words.push(w);
    });

    // Tính average accuracy cho mỗi topic
    Object.values(weakTopics).forEach(topic => {
      const totalAccuracy = topic.words.reduce((sum, w) => sum + w.accuracy, 0);
      topic.averageAccuracy = Math.round(totalAccuracy / topic.words.length);
      // Sắp xếp từ theo accuracy (thấp nhất trước)
      topic.words.sort((a, b) => a.accuracy - b.accuracy);
    });

    // Nhóm theo level
    const weakLevels = {};
    weakWords.forEach(w => {
      const level = w.level;
      if (!weakLevels[level]) {
        weakLevels[level] = {
          level,
          count: 0,
          words: [],
          averageAccuracy: 0
        };
      }
      weakLevels[level].count++;
      weakLevels[level].words.push(w);
    });

    // Tính average accuracy cho mỗi level
    Object.values(weakLevels).forEach(level => {
      const totalAccuracy = level.words.reduce((sum, w) => sum + w.accuracy, 0);
      level.averageAccuracy = Math.round(totalAccuracy / level.words.length);
      level.words.sort((a, b) => a.accuracy - b.accuracy);
    });

    // Nhóm theo part of speech
    const weakPOS = {};
    weakWords.forEach(w => {
      const pos = w.pos;
      if (!weakPOS[pos]) {
        weakPOS[pos] = {
          pos,
          count: 0,
          words: [],
          averageAccuracy: 0
        };
      }
      weakPOS[pos].count++;
      weakPOS[pos].words.push(w);
    });

    Object.values(weakPOS).forEach(pos => {
      const totalAccuracy = pos.words.reduce((sum, w) => sum + w.accuracy, 0);
      pos.averageAccuracy = Math.round(totalAccuracy / pos.words.length);
      pos.words.sort((a, b) => a.accuracy - b.accuracy);
    });

    // Tạo recommendations
    const recommendations = this.generateRecommendations(weakTopics, weakLevels, weakPOS);

    return {
      totalWeakWords: weakWords.length,
      weakTopics: Object.values(weakTopics)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      weakLevels: Object.values(weakLevels)
        .sort((a, b) => b.count - a.count),
      weakPOS: Object.values(weakPOS)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recommendations,
      summary: {
        weakestTopic: weakTopics[Object.keys(weakTopics).sort((a, b) => 
          weakTopics[b].count - weakTopics[a].count
        )[0]],
        weakestLevel: weakLevels[Object.keys(weakLevels).sort((a, b) => 
          weakLevels[b].count - weakLevels[a].count
        )[0]],
        overallAccuracy: this.calculateOverallAccuracy(stats)
      }
    };
  }

  /**
   * Tạo recommendations dựa trên điểm yếu
   */
  generateRecommendations(weakTopics, weakLevels, weakPOS) {
    const recommendations = [];

    // Top 3 topics cần cải thiện
    const topWeakTopics = Object.values(weakTopics)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    topWeakTopics.forEach(topic => {
      recommendations.push({
        type: 'topic',
        priority: 'high',
        title: `Cải thiện "${topic.topic}"`,
        message: `Bạn có ${topic.count} từ cần cải thiện về "${topic.topic}" (độ chính xác: ${topic.averageAccuracy}%)`,
        action: `Ôn tập ${topic.count} từ về ${topic.topic}`,
        wordIds: topic.words.map(w => w.wordId),
        icon: '📚'
      });
    });

    // Level cần tập trung
    const weakestLevel = Object.values(weakLevels)
      .sort((a, b) => b.count - a.count)[0];

    if (weakestLevel && weakestLevel.count > 5) {
      recommendations.push({
        type: 'level',
        priority: 'medium',
        title: `Tập trung vào Level ${weakestLevel.level}`,
        message: `Bạn gặp khó khăn với ${weakestLevel.count} từ ở level ${weakestLevel.level} (độ chính xác: ${weakestLevel.averageAccuracy}%)`,
        action: `Làm thêm bài tập level ${weakestLevel.level}`,
        wordIds: weakestLevel.words.map(w => w.wordId),
        icon: '🎯'
      });
    }

    // Part of Speech
    const weakestPOS = Object.values(weakPOS)
      .sort((a, b) => b.count - a.count)[0];

    if (weakestPOS && weakestPOS.count > 3) {
      recommendations.push({
        type: 'pos',
        priority: 'low',
        title: `Cải thiện ${weakestPOS.pos}`,
        message: `Bạn cần cải thiện ${weakestPOS.count} từ loại ${weakestPOS.pos} (độ chính xác: ${weakestPOS.averageAccuracy}%)`,
        action: `Ôn tập từ loại ${weakestPOS.pos}`,
        wordIds: weakestPOS.words.map(w => w.wordId),
        icon: '📝'
      });
    }

    return recommendations;
  }

  /**
   * Tính overall accuracy
   */
  calculateOverallAccuracy(stats) {
    const wordStats = stats.words || {};
    let totalCorrect = 0;
    let totalAttempts = 0;

    Object.values(wordStats).forEach(wordData => {
      totalCorrect += wordData.correctCount || 0;
      totalAttempts += (wordData.correctCount || 0) + (wordData.incorrectCount || 0);
    });

    if (totalAttempts === 0) return 0;
    return Math.round((totalCorrect / totalAttempts) * 100);
  }

  /**
   * Lấy danh sách từ yếu để ôn tập
   */
  getWeakWordsForReview(count = 20) {
    const analysis = this.analyzeWeakAreas();
    const weakWords = [];

    // Lấy từ yếu nhất từ mỗi topic
    analysis.weakTopics.slice(0, 5).forEach(topic => {
      weakWords.push(...topic.words.slice(0, Math.ceil(count / 5)));
    });

    // Sắp xếp theo accuracy (thấp nhất trước)
    weakWords.sort((a, b) => a.accuracy - b.accuracy);

    return weakWords.slice(0, count).map(w => w.wordId);
  }
}

// Export
if (typeof window !== 'undefined') {
  window.WeakAreasAnalyzer = WeakAreasAnalyzer;
}

