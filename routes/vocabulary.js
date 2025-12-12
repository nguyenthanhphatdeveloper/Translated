/**
 * Vocabulary API Routes
 * Endpoints để quản lý từ vựng
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load dữ liệu từ vựng (cache in-memory)
let vocabularyData = null;

const loadVocabularyData = () => {
  if (vocabularyData) return vocabularyData;
  
  try {
    const filePath = path.join(__dirname, '../API/evp_merged.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    vocabularyData = JSON.parse(rawData);
    return vocabularyData;
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    return [];
  }
};

// Helpers
const clamp = (num, min, max) => Math.max(min, Math.min(max, num));

// Parse fields=Base Word,Translate
function pickFields(items, fieldsParam) {
  if (!fieldsParam) return items;
  const fields = fieldsParam
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);
  if (!fields.length) return items;
  return items.map(it => {
    const obj = {};
    fields.forEach(f => {
      if (Object.prototype.hasOwnProperty.call(it, f)) {
        obj[f] = it[f];
      }
    });
    return obj;
  });
}

/**
 * GET /api/vocabulary/words
 * Lấy tất cả từ vựng hoặc lọc theo query params
 */
router.get('/words', (req, res) => {
  try {
    const words = loadVocabularyData();
    let filtered = [...words];

    // Lọc theo level
    if (req.query.level) {
      filtered = filtered.filter(w => w.Level === req.query.level);
    }

    // Lọc theo topic
    if (req.query.topic) {
      filtered = filtered.filter(w => 
        w.Topic && w.Topic.toLowerCase().includes(req.query.topic.toLowerCase())
      );
    }

    // Lọc theo part of speech
    if (req.query.pos) {
      filtered = filtered.filter(w => 
        w['Part of Speech'] && 
        w['Part of Speech'].toLowerCase() === req.query.pos.toLowerCase()
      );
    }

    // Tìm kiếm
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filtered = filtered.filter(w => {
        const base = (w['Base Word'] || '').toString().toLowerCase();
        const guide = (w.Guideword || '').toString().toLowerCase();
        return base.includes(searchTerm) || guide.includes(searchTerm);
      });
    }

    // Lọc theo độ dài Base Word (data quality)
    const maxLen = clamp(parseInt(req.query.maxLen) || 0, 0, 50);
    if (maxLen > 0) {
      filtered = filtered.filter(w => (w['Base Word'] || '').length <= maxLen);
    }

    // Lọc theo hasGuide / hasTranslate
    if (req.query.hasGuide === 'true') {
      filtered = filtered.filter(w => (w.Guideword || '').trim().length >= 2);
    }
    if (req.query.hasTranslate === 'true') {
      filtered = filtered.filter(w => (w.Translate || '').trim().length >= 2);
    }

    // Pagination
    const page = clamp(parseInt(req.query.page) || 1, 1, 10000);
    const limit = clamp(parseInt(req.query.limit) || 50, 1, 200);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginated = filtered.slice(startIndex, endIndex);

    // Fields projection
    const data = pickFields(paginated, req.query.fields);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/vocabulary/words/:id
 * Lấy chi tiết một từ
 */
router.get('/words/:id', (req, res) => {
  try {
    const words = loadVocabularyData();
    const id = parseInt(req.params.id);
    
    if (id < 0 || id >= words.length) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(words[id]);
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/vocabulary/stats
 * Lấy thống kê từ vựng
 */
router.get('/stats', (req, res) => {
  try {
    const words = loadVocabularyData();
    
    const stats = {
      total: words.length,
      byLevel: {},
      byPartOfSpeech: {},
      byTopic: {}
    };

    words.forEach(word => {
      // Thống kê theo level
      stats.byLevel[word.Level] = (stats.byLevel[word.Level] || 0) + 1;

      // Thống kê theo part of speech
      const pos = word['Part of Speech'] || 'unknown';
      stats.byPartOfSpeech[pos] = (stats.byPartOfSpeech[pos] || 0) + 1;

      // Thống kê theo topic
      if (word.Topic && word.Topic.trim()) {
        stats.byTopic[word.Topic] = (stats.byTopic[word.Topic] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/vocabulary/random
 * Lấy từ ngẫu nhiên
 */
router.get('/random', (req, res) => {
  try {
    const words = loadVocabularyData();
    let pool = [...words];

    // Lọc theo level nếu có
    if (req.query.level) {
      pool = pool.filter(w => w.Level === req.query.level);
    }

    // Lọc theo độ dài Base Word
    const maxLen = clamp(parseInt(req.query.maxLen) || 0, 0, 50);
    if (maxLen > 0) {
      pool = pool.filter(w => (w['Base Word'] || '').length <= maxLen);
    }

    // Lọc theo hasGuide / hasTranslate
    if (req.query.hasGuide === 'true') {
      pool = pool.filter(w => (w.Guideword || '').trim().length >= 2);
    }
    if (req.query.hasTranslate === 'true') {
      pool = pool.filter(w => (w.Translate || '').trim().length >= 2);
    }

    // Lấy số lượng
    const count = clamp(parseInt(req.query.count) || 10, 1, 200);
    
    // Shuffle và lấy random
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const randomWords = shuffled.slice(0, Math.min(count, shuffled.length));

    const data = pickFields(randomWords, req.query.fields);

    res.json(data);
  } catch (error) {
    console.error('Error fetching random words:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/vocabulary/topics
 * Lấy danh sách topics (có thể lọc theo level)
 * Response: { data: [{ topic, count }], totalTopics }
 */
router.get('/topics', (req, res) => {
  try {
    const words = loadVocabularyData();
    const filterLevel = req.query.level;
    const topicCounts = {};

    words.forEach(word => {
      if (filterLevel && word.Level !== filterLevel) return;
      if (word.Topic && word.Topic.trim()) {
        topicCounts[word.Topic] = (topicCounts[word.Topic] || 0) + 1;
      }
    });

    const data = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));

    res.json({
      data,
      totalTopics: data.length,
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

