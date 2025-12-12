# 📖 Hướng Dẫn Sử Dụng Hệ Thống Học Từ Vựng

## 🚀 Bắt Đầu

### 1. Cài Đặt Dependencies
```bash
pnpm install
```

### 2. Chạy Server
```bash
pnpm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### 3. Truy Cập Các Trang

- **Home**: `http://localhost:3000/` - Trang chủ Cambridge Dictionary API
- **Học Từ**: `http://localhost:3000/learn` - Trang học từ vựng mới
- **API Vocabulary**: `http://localhost:3000/api/vocabulary/words` - API lấy danh sách từ

---

## 📚 Cấu Trúc Dự Án

```
En/
├── API/
│   ├── evp_merged.json                 # Dữ liệu từ vựng (116K+ từ với Translate)
│   └── English Grammar Profile Online.json
├── public/
│   ├── js/
│   │   ├── vocabulary.js              # Quản lý từ vựng
│   │   ├── storage.js                 # LocalStorage manager
│   │   └── spaced-repetition.js       # SRS algorithm
│   └── learn.html                     # Trang học từ
├── routes/
│   └── vocabulary.js                  # API routes cho từ vựng
├── data.js                            # Cambridge Dictionary API (existing)
├── index.js                           # Server entry
└── SYSTEM_DESIGN.md                   # Tài liệu thiết kế chi tiết
```

---

## 🎯 Tính Năng Đã Triển Khai

### ✅ Phase 1: Foundation
- [x] Load và parse dữ liệu từ evp_merged.json
- [x] API endpoints cơ bản (`/api/vocabulary/words`)
- [x] Trang học từ mới (`/learn`)
- [x] Tích hợp Cambridge Dictionary API
- [x] LocalStorage để lưu progress

### 🔄 Đang Phát Triển
- [ ] Practice Mode (Multiple Choice, Fill Blank, Matching)
- [ ] Quiz Generator
- [ ] Spaced Repetition Review Page
- [ ] Progress Dashboard

---

## 📡 API Endpoints

### Vocabulary API

#### GET `/api/vocabulary/words`
Lấy danh sách từ vựng với các filter

**Query Parameters:**
- `level` (optional): Lọc theo level (A1, A2, B1, B2, C1, C2)
- `topic` (optional): Lọc theo topic
- `pos` (optional): Lọc theo part of speech
- `search` (optional): Tìm kiếm từ
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số từ mỗi trang (default: 50)

**Example:**
```bash
GET /api/vocabulary/words?level=A1&limit=20&page=1
```

**Response:**
```json
{
  "data": [
    {
      "Base Word": "a",
      "Guideword": "NOT PARTICULAR",
      "Level": "A1",
      "Part of Speech": "determiner",
      "Topic": "",
      "Details": ""
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125000,
    "totalPages": 6250
  }
}
```

#### GET `/api/vocabulary/words/:id`
Lấy chi tiết một từ theo ID (index)

**Example:**
```bash
GET /api/vocabulary/words/0
```

#### GET `/api/vocabulary/stats`
Lấy thống kê tổng quan

**Response:**
```json
{
  "total": 125000,
  "byLevel": {
    "A1": 5000,
    "A2": 8000,
    ...
  },
  "byPartOfSpeech": {
    "noun": 30000,
    "verb": 25000,
    ...
  },
  "byTopic": {
    "shopping": 500,
    "travel": 300,
    ...
  }
}
```

#### GET `/api/vocabulary/random`
Lấy từ ngẫu nhiên

**Query Parameters:**
- `level` (optional): Lọc theo level
- `count` (optional): Số từ (default: 10)

**Example:**
```bash
GET /api/vocabulary/random?level=A1&count=5
```

#### GET `/api/vocabulary/topics`
Lấy danh sách tất cả topics

---

## 💾 LocalStorage Structure

Dữ liệu progress được lưu trong LocalStorage với key `vocabulary_progress`:

```javascript
{
  words: {
    "word_id": {
      word: "cook",
      level: "A1",
      status: "learning" | "mastered" | "review",
      firstLearned: "2024-01-15T10:00:00Z",
      lastReviewed: "2024-01-15T10:00:00Z",
      nextReview: "2024-01-16T10:00:00Z",
      reviewCount: 3,
      difficulty: "medium",
      correctCount: 5,
      incorrectCount: 2,
      masteryScore: 0.71
    }
  },
  stats: {
    totalWords: 125000,
    learnedWords: 150,
    masteredWords: 80,
    currentLevel: "A2",
    streak: 7,
    lastStudyDate: "2024-01-15",
    totalStudyTime: 3600
  },
  settings: {
    dailyGoal: 20,
    preferredLevel: "A1",
    enableAudio: true,
    enableNotifications: true
  }
}
```

---

## 🎨 Sử Dụng JavaScript Classes

### VocabularyManager
```javascript
const vm = new VocabularyManager();
await vm.loadVocabulary();
const a1Words = vm.filterByLevel('A1');
const searchResults = vm.search('cook');
```

### StorageManager
```javascript
const storage = new StorageManager();
const progress = storage.getProgress();
storage.updateWordProgress('word_id', wordData, 'learning');
storage.recordAnswer('word_id', true);
const wordsToReview = storage.getWordsToReview();
```

### SpacedRepetition
```javascript
const srs = new SpacedRepetition();
const nextReview = srs.calculateNextReview(7, 'good');
const reviewQueue = srs.prioritizeWords(words);
```

---

## 🔧 Development Tips

### 1. Test API Endpoints
Sử dụng Postman hoặc curl:
```bash
curl http://localhost:3000/api/vocabulary/words?level=A1&limit=5
```

### 2. Debug LocalStorage
Mở Browser Console:
```javascript
const storage = new StorageManager();
console.log(storage.getProgress());
```

### 3. Reset Progress
```javascript
const storage = new StorageManager();
storage.resetProgress(); // Cẩn thận! Xóa tất cả progress
```

---

## 📝 Next Steps

1. **Practice Mode**: Tạo các dạng bài tập
2. **Quiz Generator**: Tạo quiz tự động
3. **Review Page**: Trang ôn lại với SRS
4. **Progress Dashboard**: Thống kê và biểu đồ
5. **Mobile Responsive**: Tối ưu cho mobile

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module './routes/vocabulary'"
- Đảm bảo file `routes/vocabulary.js` tồn tại
- Kiểm tra đường dẫn trong `data.js`

### Lỗi: "Failed to load vocabulary data"
- Kiểm tra file `API/evp_merged.json` có tồn tại
- Kiểm tra quyền đọc file

### LocalStorage đầy
- Dữ liệu quá lớn (>5MB)
- Cân nhắc sử dụng IndexedDB thay vì LocalStorage
- Hoặc chỉ lưu progress của từ đã học, không lưu tất cả

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser
2. Server logs trong terminal
3. Network tab trong DevTools

---

**Happy Learning! 🎓**

