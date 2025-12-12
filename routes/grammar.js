/**
 * Grammar API Routes
 * Data source: API/English Grammar Profile Online.json
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let grammarData = null;

const loadGrammar = () => {
  if (grammarData) return grammarData;
  try {
    const filePath = path.join(__dirname, '../API/English Grammar Profile Online.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    grammarData = JSON.parse(raw);
    return grammarData;
  } catch (e) {
    console.error('Error loading grammar data:', e);
    return [];
  }
};

/**
 * GET /api/grammar/points
 * Query: level, super (SuperCategory), sub (SubCategory), search, page, limit
 */
router.get('/points', (req, res) => {
  try {
    const data = loadGrammar();
    let filtered = [...data];

    if (req.query.level) {
      filtered = filtered.filter(i => (i.Level || '').toString() === req.query.level);
    }

    if (req.query.super) {
      const s = req.query.super.toLowerCase();
      filtered = filtered.filter(i => (i.SuperCategory || '').toString().toLowerCase() === s);
    }

    if (req.query.sub) {
      const s = req.query.sub.toLowerCase();
      filtered = filtered.filter(i => (i.SubCategory || '').toString().toLowerCase() === s);
    }

    if (req.query.search) {
      const q = req.query.search.toLowerCase();
      filtered = filtered.filter(i => {
        const guide = (i['Guideword'] || '').toString().toLowerCase();
        const cando = (i['Can-do statement'] || '').toString().toLowerCase();
        return guide.includes(q) || cando.includes(q);
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      data: filtered.slice(start, end),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      }
    });
  } catch (e) {
    console.error('Error fetching grammar points:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/grammar/stats
 * Returns counts by level and super category
 */
router.get('/stats', (req, res) => {
  try {
    const data = loadGrammar();
    const stats = {
      total: data.length,
      byLevel: {},
      bySuperCategory: {}
    };

    data.forEach(i => {
      const level = i.Level || 'N/A';
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

      const sup = i.SuperCategory || 'Other';
      stats.bySuperCategory[sup] = (stats.bySuperCategory[sup] || 0) + 1;
    });

    res.json(stats);
  } catch (e) {
    console.error('Error fetching grammar stats:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

