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
    
    if (!words || words.length === 0) {
      console.error('Vocabulary data is empty or not loaded');
      return res.status(500).json({ error: 'Vocabulary data not available' });
    }
    
    let pool = [...words];
    console.log(`[Random API] Starting with ${pool.length} words`);

    // Lọc theo level nếu có (hỗ trợ multiple levels: level=A1,A2,B1)
    if (req.query.level) {
      const levels = req.query.level.split(',').map(l => l.trim()).filter(Boolean);
      if (levels.length > 0) {
        const beforeCount = pool.length;
        
        // Với nhiều levels (>= 5) hoặc khi filter trả về 0, merge từ từng level
        const filteredPool = pool.filter(w => {
          const wordLevel = w.Level ? (typeof w.Level === 'string' ? w.Level.trim() : String(w.Level).trim()) : '';
          return wordLevel && levels.includes(wordLevel);
        });
        
        console.log(`[Random API] Direct filter result: ${filteredPool.length} words`);
        
        if (levels.length >= 5 || filteredPool.length === 0) {
          console.log(`[Random API] Multiple levels (${levels.length}) or empty result, merging from individual levels...`);
          const mergedPool = [];
          for (const singleLevel of levels) {
            const testPool = words.filter(w => {
              const wordLevel = w.Level ? (typeof w.Level === 'string' ? w.Level.trim() : String(w.Level).trim()) : '';
              return wordLevel === singleLevel;
            });
            if (testPool.length > 0) {
              console.log(`[Random API] Found ${testPool.length} words for level "${singleLevel}"`);
              mergedPool.push(...testPool);
            } else {
              console.warn(`[Random API] No words found for level "${singleLevel}"`);
            }
          }
          // Remove duplicates dựa trên Base Word
          const uniquePool = Array.from(new Map(mergedPool.map(w => [w['Base Word'], w])).values());
          console.log(`[Random API] Merged pool: ${uniquePool.length} unique words from ${levels.length} levels`);
          pool = uniquePool.length > 0 ? uniquePool : filteredPool; // Fallback về filtered nếu merge cũng rỗng
        } else {
          // Với ít levels và có kết quả, dùng filtered
          pool = filteredPool;
          console.log(`[Random API] Using filtered pool: ${pool.length} words`);
        }
      }
    }

    // Lọc theo độ dài Base Word
    const maxLen = clamp(parseInt(req.query.maxLen) || 0, 0, 50);
    if (maxLen > 0) {
      const beforeCount = pool.length;
      pool = pool.filter(w => (w['Base Word'] || '').length <= maxLen);
      console.log(`[Random API] After maxLen filter (${maxLen}): ${pool.length} words (was ${beforeCount})`);
    }

    // Lọc theo hasGuide / hasTranslate
    if (req.query.hasGuide === 'true') {
      const beforeCount = pool.length;
      pool = pool.filter(w => (w.Guideword || '').trim().length >= 2);
      console.log(`[Random API] After hasGuide filter: ${pool.length} words (was ${beforeCount})`);
    }
    if (req.query.hasTranslate === 'true') {
      const beforeCount = pool.length;
      pool = pool.filter(w => (w.Translate || '').trim().length >= 2);
      console.log(`[Random API] After hasTranslate filter: ${pool.length} words (was ${beforeCount})`);
    }

    // Lấy số lượng
    const count = clamp(parseInt(req.query.count) || 10, 1, 200);
    
    if (pool.length === 0) {
      console.warn(`[Random API] Pool is empty after filters. Query:`, req.query);
      return res.json([]);
    }

    // Shuffle và lấy random
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const randomWords = shuffled.slice(0, Math.min(count, shuffled.length));
    
    console.log(`[Random API] Returning ${randomWords.length} random words (requested ${count})`);

    const data = pickFields(randomWords, req.query.fields);

    res.json(data);
  } catch (error) {
    console.error('Error fetching random words:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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

