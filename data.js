const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
const axiosRetryModule = require("axios-retry");
const axiosRetry = axiosRetryModule.default || axiosRetryModule;
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const app = express();
const cors = require("cors");
const logger = require("./utils/logger");

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const TRANSLATE_TTL = 1000 * 60 * 60; // 1h cache
const EXAMPLE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24h for examples (ít thay đổi)

// Cache cleanup: xóa cache cũ mỗi 1 giờ
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of cache.entries()) {
    const ttl = key.includes('example') ? EXAMPLE_CACHE_TTL : CACHE_TTL;
    if (now - value.timestamp > ttl) {
      cache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.info(`Cache cleanup: removed ${cleaned} expired entries`, { cleaned, cacheSize: cache.size });
  }
}, 1000 * 60 * 60); // Run every hour

const httpClient = axios.create({
  timeout: 10000, 
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

// Request Retry Logic: tự động retry khi network lỗi hoặc rate limit
axiosRetry(httpClient, {
  retries: 2, // Retry tối đa 2 lần
  retryDelay: axiosRetryModule.exponentialDelay, // Exponential backoff: 100ms, 200ms, 400ms
  retryCondition: (error) => {
    // Retry khi:
    // 1. Network error hoặc timeout
    // 2. Rate limit (429)
    // 3. Server error (5xx)
    return axiosRetryModule.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || 
           (error.response?.status >= 500 && error.response?.status < 600);
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`Retrying request (attempt ${retryCount + 1}/3)`, {
      url: requestConfig.url,
      method: requestConfig.method,
      status: error.response?.status,
      message: error.message
    });
  }
});

const getCacheKey = (url) => `cache_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
};

// Simple translation cache key
const translateCacheKey = (text, source, target) =>
  `translate_${source}_${target}_${text.trim().slice(0,200)}`;

// Normalize entry để lấy base word từ phrasal verbs
const normalizeEntryForWiki = (entry) => {
  if (!entry) return entry;
  
  // Loại bỏ các pattern như "sth", "sb", "sth/sb"
  let normalized = entry
    .replace(/\s+(?:sth|sb|sth\/sb)\b/gi, '')
    .replace(/\b(?:sth|sb|sth\/sb)\s+/gi, '')
    .trim();
  
  // Nếu là phrasal verb (có khoảng trắng), lấy từ đầu tiên
  if (normalized.includes(' ')) {
    const parts = normalized.split(/\s+/);
    // Thử lấy từ đầu tiên (thường là động từ chính)
    normalized = parts[0];
  }
  
  return normalized;
};

const fetchVerbs = async (wiki) => {
  const cacheKey = getCacheKey(wiki);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await httpClient.get(wiki);
    const $$ = cheerio.load(response.data);
    const verbs = [];

    $$(".inflection-table tr td").each((index, cell) => {
      const cellElement = $$(cell);
      const cellText = cellElement.text().trim();

      if (!cellText) return;

      const pElement = cellElement.find("p");
      if (pElement.length > 0) {
        const pText = pElement.text().trim();
        const parts = pText
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p);

        if (parts.length >= 2) {
          const type = parts[0];
          const text = parts[1];

          if (type && text) {
            verbs.push({ id: verbs.length, type, text });
          }
        } else {
          const htmlContent = pElement.html();
          if (htmlContent && htmlContent.includes("<br>")) {
            const htmlParts = htmlContent.split("<br>");
            if (htmlParts.length >= 2) {
              const type =
                $$(htmlParts[0]).text().trim() ||
                htmlParts[0].replace(/<[^>]*>/g, "").trim();
              const textPart = htmlParts[1];
              const text =
                $$(textPart).text().trim() ||
                textPart.replace(/<[^>]*>/g, "").trim();

              if (type && text) {
                verbs.push({ id: verbs.length, type, text });
              }
            }
          }
        }
      }
    });

    setCache(cacheKey, verbs);
    return verbs;
  } catch (error) {
    // Chỉ log warning cho các lỗi không phải 404 (404 là bình thường khi từ không có trên wiktionary)
    const is404 = error.response?.status === 404 || error.message?.includes('404') || error.code === 'ENOTFOUND';
    if (!is404) {
      console.warn(`Failed to fetch verbs from ${wiki}:`, error.message);
    }
    return [];
  }
};

// ============================================
// Phase 1: Quick Wins - Performance & Monitoring
// ============================================

// 1. Response Compression (giảm 60-80% kích thước response)
app.use(compression({ level: 6 }));

// 2. Performance Monitoring (log slow endpoints > 1s)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow endpoint detected`, {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }
  });
  next();
});

// 3. Response Headers (cache control)
app.use((req, res, next) => {
  // Cache static JSON responses (vocabulary API)
  if (req.path.startsWith('/api/vocabulary/')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5 phút
  }
  // No cache cho dynamic responses (dictionary API)
  if (req.path.startsWith('/api/dictionary/')) {
    res.set('Cache-Control', 'no-cache');
  }
  // No cache cho grammar API (có thể thay đổi)
  if (req.path.startsWith('/api/grammar/')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});

// Standard middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// ============================================
// Phase 3: Security - Rate Limiting
// ============================================

// General API Rate Limiter: 1000 requests per 15 minutes (tăng cao cho dự án cá nhân)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // 1000 requests per window (đủ cho 1 user sử dụng thoải mái)
  message: {
    error: 'Too many requests',
    message: 'Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many requests',
      message: 'Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 minutes'
    });
  }
});

// Dictionary API Rate Limiter: 200 requests per 15 minutes (tăng cao cho dự án cá nhân)
const dictionaryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // 200 requests per window (đủ cho 1 user tra từ nhiều)
  message: {
    error: 'Too many dictionary requests',
    message: 'Bạn đã tra từ quá nhiều lần. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Dictionary API rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      word: req.params.entry
    });
    res.status(429).json({
      error: 'Too many dictionary requests',
      message: 'Bạn đã tra từ quá nhiều lần. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 minutes'
    });
  }
});

// Áp dụng rate limiting
app.use('/api/', apiLimiter); // General API rate limit
app.use('/api/dictionary/', dictionaryLimiter); // Dictionary API có rate limit riêng (stricter)

// 4. Health Check Endpoint
app.get("/health", (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cache: {
      size: cache.size,
      maxSize: 1000
    }
  });
});

// Import vocabulary routes
const vocabularyRoutes = require("./routes/vocabulary");
const grammarRoutes = require("./routes/grammar");
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/grammar", grammarRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Serve learn page
app.get("/learn", (req, res) => {
  res.sendFile(__dirname + "/public/learn.html");
});

// Serve practice page
app.get("/practice", (req, res) => {
  res.sendFile(__dirname + "/public/practice.html");
});

// Serve review page
app.get("/review", (req, res) => {
  res.sendFile(__dirname + "/public/review.html");
});

// Serve progress page
app.get("/progress", (req, res) => {
  res.sendFile(__dirname + "/public/progress.html");
});

// Serve IPA practice page
app.get("/ipa", (req, res) => {
  res.sendFile(__dirname + "/public/ipa.html");
});

// Serve Grammar page
app.get("/grammar", (req, res) => {
  res.sendFile(__dirname + "/public/grammar.html");
});

// Serve Preferences page
app.get("/preferences", (req, res) => {
  res.sendFile(__dirname + "/public/preferences.html");
});

// Serve Dashboard page
app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

// Serve Assessment (level test) page
app.get("/assessment", (req, res) => {
  res.sendFile(__dirname + "/public/assessment.html");
});

// Serve Combo lesson page
app.get("/combo", (req, res) => {
  res.sendFile(__dirname + "/public/combo.html");
});

// Serve Grammar SRS review page
app.get("/review-grammar", (req, res) => {
  res.sendFile(__dirname + "/public/review-grammar.html");
});

// Serve Mixed Quiz page
app.get("/quiz-mix", (req, res) => {
  res.sendFile(__dirname + "/public/quiz-mix.html");
});


// Serve Combo Lesson page
app.get("/combo", (req, res) => {
  res.sendFile(__dirname + "/public/combo.html");
});

// Serve Grammar Review (SRS) page
app.get("/grammar-review", (req, res) => {
  res.sendFile(__dirname + "/public/grammar-review.html");
});

// Serve Mixed Quiz page
app.get("/quiz-mix", (req, res) => {
  res.sendFile(__dirname + "/public/quiz-mix.html");
});

// Serve Writing Practice page
app.get("/writing-practice", (req, res) => {
  res.sendFile(__dirname + "/public/writing-practice.html");
});

// Allow slash in entry (e.g., "know of sth/sb") by using wildcard
app.get("/api/dictionary/:language/:entry(*)", async (req, res, next) => {
  try {
    const entry = req.params.entry;
    const slugLanguage = req.params.language;
    let language, nation = "us";

    if (slugLanguage === "en") {
      language = "english";
    } else if (slugLanguage === "uk") {
      language = "english";
      nation = "uk";
    } else if (slugLanguage === "en-tw") {
      language = "english-chinese-traditional";
    } else if (slugLanguage === "en-cn") {
      language = "english-chinese-simplified";
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const url = `https://dictionary.cambridge.org/${nation}/dictionary/${language}/${entry}`;
    
    // Normalize entry để thử fetch base word nếu phrasal verb không tìm thấy
    const normalizedEntry = normalizeEntryForWiki(entry);
    const wiki = `https://simple.wiktionary.org/wiki/${normalizedEntry}`;
    
    const mainCacheKey = getCacheKey(url);
    const cachedResult = getFromCache(mainCacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    const [dictionaryResponse, verbs] = await Promise.allSettled([
      httpClient.get(url),
      fetchVerbs(wiki)
    ]);

    if (dictionaryResponse.status === 'rejected' || dictionaryResponse.value.status !== 200) {
      return res.status(404).json({ error: "word not found" });
    }

    const $ = cheerio.load(dictionaryResponse.value.data);
    const siteurl = "https://dictionary.cambridge.org";

    const word = $(".hw.dhw").first().text();
    
    if (!word) {
      return res.status(404).json({ error: "word not found" });
    }

    const posElements = $(".pos.dpos");
    const pos = [...new Set(posElements.map((i, el) => $(el).text()).get())];

    // Phonetics audios
    const audio = [];
    $(".pos-header.dpos-h").each((i, s) => {
      const posNode = $(s).find(".dpos-g").first();
      if (!posNode.length) return;
      
      const p = posNode.text();
      $(s).find(".dpron-i").each((j, node) => {
        const $node = $(node);
        const lang = $node.find(".region.dreg").text();
        const audioSrc = $node.find("audio source").attr("src");
        const pron = $node.find(".pron.dpron").text();
        
        if (audioSrc && pron) {
          audio.push({ pos: p, lang: lang, url: siteurl + audioSrc, pron: pron });
        }
      });
    });

    // definition & example
    const definition = $(".def-block.ddef_block").map((index, element) => {
      const $element = $(element);
      const pos = $element.closest(".pr.entry-body__el").find(".pos.dpos").first().text();
      const source = $element.closest(".pr.dictionary").attr("data-id");
      const text = $element.find(".def.ddef_d.db").text();
      const translation = $element.find(".def-body.ddef_b > span.trans.dtrans").text();
      
      const example = $element.find(".def-body.ddef_b > .examp.dexamp").map((i, ex) => {
        const $ex = $(ex);
        return {
          id: i,
          text: $ex.find(".eg.deg").text(),
          translation: $ex.find(".trans.dtrans").text(),
        };
      }).get();

      return {
        id: index,
        pos: pos,
        source: source,
        text: text,
        translation: translation,
        example: example,
      };
    }).get();

    // api response
    const result = {
      word: word,
      pos: pos,
      verbs: verbs.status === 'fulfilled' ? verbs.value : [],
      pronunciation: audio,
      definition: definition,
    };

    setCache(mainCacheKey, result);
    
    setCache(mainCacheKey, result);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Dictionary API Error', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Batch API endpoint cho examples (performance optimization)
app.get("/api/examples/batch", async (req, res) => {
  try {
    const words = req.query.words ? req.query.words.split(',') : [];
    if (words.length === 0 || words.length > 50) {
      return res.status(400).json({ error: "Invalid words parameter (1-50 words)" });
    }

    // Fetch examples parallel
    const examplePromises = words.map(async (word) => {
      const cacheKey = `example_${word.toLowerCase().trim()}`;
      const cached = getFromCache(cacheKey);
      if (cached) {
        return { word, example: cached };
      }

      try {
        const dictRes = await httpClient.get(
          `https://dictionary.cambridge.org/us/dictionary/english/${encodeURIComponent(word)}`
        );
        const $ = cheerio.load(dictRes.data);
        const defs = $(".def-block.ddef_block");
        
        let example = null;
        defs.each((i, def) => {
          if (example) return false; // Break loop
          const examples = $(def).find(".examp.dexamp");
          examples.each((j, ex) => {
            const text = $(ex).find(".eg.deg").text().trim();
            const translation = $(ex).find(".trans.dtrans").text().trim();
            if (text && text.toLowerCase().includes(word.toLowerCase())) {
              example = { sentence: text, translation };
              return false; // Break
            }
          });
        });

        if (example) {
          setCache(cacheKey, example);
        }
        return { word, example };
      } catch (error) {
        return { word, example: null, error: error.message };
      }
    });

    const results = await Promise.allSettled(examplePromises);
    const examples = results.map((r, i) => 
      r.status === 'fulfilled' ? r.value : { word: words[i], example: null }
    );

    res.json({ examples });
  } catch (error) {
    console.error('Batch Examples API Error:', error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
