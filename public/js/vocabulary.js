/**
 * Vocabulary Manager
 * Quản lý từ vựng từ evp_merged.json
 */

class VocabularyManager {
  constructor() {
    this.words = [];
    this.loaded = false;
  }

  /**
   * Load dữ liệu từ vựng từ API
   */
  async loadVocabulary() {
    if (this.loaded) return this.words;

    try {
      const response = await fetch('/api/vocabulary/words');
      const data = await response.json();
      this.words = data;
      this.loaded = true;
      return this.words;
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      return [];
    }
  }

  /**
   * Lọc từ theo level
   */
  filterByLevel(level) {
    return this.words.filter(word => word.Level === level);
  }

  /**
   * Lọc từ theo topic
   */
  filterByTopic(topic) {
    return this.words.filter(word => 
      word.Topic && word.Topic.toLowerCase().includes(topic.toLowerCase())
    );
  }

  /**
   * Lọc từ theo part of speech
   */
  filterByPartOfSpeech(pos) {
    return this.words.filter(word => 
      word['Part of Speech'] && 
      word['Part of Speech'].toLowerCase() === pos.toLowerCase()
    );
  }

  /**
   * Tìm kiếm từ
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.words.filter(word => 
      word['Base Word'].toLowerCase().includes(lowerQuery) ||
      (word.Guideword && word.Guideword.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Lấy từ ngẫu nhiên
   */
  getRandomWords(count = 10, level = null) {
    let pool = level ? this.filterByLevel(level) : this.words;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Lấy từ theo ID (index)
   */
  getWordById(id) {
    return this.words[id] || null;
  }

  /**
   * Lấy thống kê theo level
   */
  getStatsByLevel() {
    const stats = {
      A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0
    };

    this.words.forEach(word => {
      if (stats.hasOwnProperty(word.Level)) {
        stats[word.Level]++;
      }
    });

    return stats;
  }

  /**
   * Lấy danh sách topics
   */
  getTopics() {
    const topics = new Set();
    this.words.forEach(word => {
      if (word.Topic && word.Topic.trim()) {
        topics.add(word.Topic);
      }
    });
    return Array.from(topics).sort();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VocabularyManager;
}

