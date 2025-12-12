# 🎓 Hệ Thống Học và Luyện Từ Vựng Tiếng Anh

## 📊 Phân Tích Dữ Liệu

### Cấu trúc dữ liệu từ `evp_merged.json`:
- **Base Word**: Từ gốc cần học
- **Guideword**: Từ khóa hướng dẫn (context)
- **Level**: Cấp độ CEFR (A1, A2, B1, B2, C1, C2)
- **Part of Speech**: Loại từ (noun, verb, phrase, determiner, etc.)
- **Topic**: Chủ đề (shopping, travel, etc.) - có thể rỗng
- **Translate**: Nghĩa tiếng Việt - đã có sẵn

### Thống kê:
- Tổng số từ: ~116,000+ entries
- Phân bố theo level: A1 → C2
- Đa dạng về loại từ và chủ đề

---

## 🏗️ Kiến Trúc Hệ Thống

### 1. **Backend API** (Node.js/Express)
```
/api/vocabulary/
  ├── GET    /words                    # Lấy danh sách từ theo filter
  ├── GET    /words/:id                # Chi tiết một từ
  ├── GET    /words/level/:level       # Lọc theo level (A1-C2)
  ├── GET    /words/topic/:topic       # Lọc theo chủ đề
  ├── POST   /study/session            # Bắt đầu session học
  ├── POST   /study/answer             # Nộp câu trả lời
  ├── GET    /study/progress           # Tiến độ học tập
  ├── GET    /study/review             # Từ cần ôn lại (spaced repetition)
  └── GET    /quiz/generate            # Tạo quiz ngẫu nhiên
```

### 2. **Frontend** (HTML/CSS/JavaScript)
```
/ (Home)
  ├── /learn          # Trang học từ mới
  ├── /practice       # Trang luyện tập
  ├── /quiz           # Trang làm quiz
  ├── /progress       # Trang theo dõi tiến độ
  └── /review         # Trang ôn lại từ
```

---

## 🎯 Tính Năng Chính

### 1. **Học Từ Mới (Learn)**
- Hiển thị từ theo level (A1 → C2)
- Tích hợp với Cambridge Dictionary API để lấy:
  - Định nghĩa chi tiết
  - Phát âm (audio)
  - Ví dụ sử dụng
  - Dạng từ (verbs conjugation)
- Đánh dấu từ đã học
- Lọc theo chủ đề (Topic)

### 2. **Luyện Tập (Practice)**
#### 2.1. Multiple Choice (Trắc nghiệm)
- Hiển thị từ → chọn nghĩa đúng
- Hiển thị nghĩa → chọn từ đúng
- 4 lựa chọn, 1 đáp án đúng

#### 2.2. Fill in the Blank (Điền từ)
- Câu có chỗ trống → điền từ phù hợp
- Sử dụng ví dụ từ Cambridge Dictionary

#### 2.3. Matching (Nối từ với nghĩa)
- Kéo thả hoặc click để nối

#### 2.4. Listening (Nghe và chọn)
- Phát audio từ Cambridge Dictionary
- Chọn từ đúng hoặc điền từ

### 3. **Quiz Mode**
- Tạo quiz ngẫu nhiên từ từ đã học
- Nhiều dạng câu hỏi hỗn hợp
- Tính điểm và hiển thị kết quả

### 4. **Spaced Repetition System (SRS)**
- Thuật toán lặp lại ngắt quãng:
  - Lần 1: Sau 1 ngày
  - Lần 2: Sau 3 ngày
  - Lần 3: Sau 7 ngày
  - Lần 4: Sau 14 ngày
  - Lần 5: Sau 30 ngày
- Đánh giá độ khó (Easy/Medium/Hard)
- Tự động điều chỉnh lịch ôn tập

### 5. **Theo Dõi Tiến Độ (Progress)**
- Thống kê theo level:
  - Số từ đã học
  - Số từ đã thuộc
  - Tỷ lệ thành công
- Biểu đồ tiến độ theo thời gian
- Streak (chuỗi ngày học liên tiếp)
- Thành tích và badge

### 6. **Tìm Kiếm và Lọc**
- Tìm kiếm từ vựng
- Lọc theo:
  - Level (A1-C2)
  - Part of Speech
  - Topic
  - Trạng thái (đã học/chưa học)

---

## 💾 Cấu Trúc Dữ Liệu

### User Progress (LocalStorage/IndexedDB)
```javascript
{
  userId: "user_123",
  words: {
    "word_id": {
      word: "cook",
      level: "A1",
      status: "learning" | "mastered" | "review",
      lastReviewed: "2024-01-15",
      nextReview: "2024-01-16",
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
    totalStudyTime: 3600 // seconds
  },
  settings: {
    dailyGoal: 20,
    preferredLevel: "A2",
    enableAudio: true
  }
}
```

### Quiz Session
```javascript
{
  sessionId: "quiz_123",
  questions: [
    {
      id: 1,
      type: "multiple_choice",
      word: "cook",
      question: "What does 'cook' mean?",
      options: ["nấu ăn", "ăn", "uống", "ngủ"],
      correctAnswer: 0,
      userAnswer: null,
      isCorrect: null
    }
  ],
  score: 0,
  totalQuestions: 10,
  startTime: "2024-01-15T10:00:00Z",
  endTime: null
}
```

---

## 🎨 UI/UX Design

### Color Scheme (theo Level)
- A1: 🟢 Green (#10B981)
- A2: 🔵 Blue (#3B82F6)
- B1: 🟡 Yellow (#F59E0B)
- B2: 🟠 Orange (#F97316)
- C1: 🔴 Red (#EF4444)
- C2: 🟣 Purple (#8B5CF6)

### Components
1. **Word Card**: Hiển thị từ, nghĩa, ví dụ, audio
2. **Progress Bar**: Tiến độ học tập
3. **Quiz Card**: Câu hỏi và đáp án
4. **Stats Dashboard**: Thống kê tổng quan
5. **Review Queue**: Danh sách từ cần ôn

---

## 🔄 Luồng Học Tập

### Flow 1: Học Từ Mới
```
1. User chọn level (A1-C2)
2. Hệ thống hiển thị danh sách từ chưa học
3. User click vào từ → Xem chi tiết từ Cambridge API
4. User đánh dấu "Đã học" → Lưu vào progress
5. Từ được thêm vào review queue với nextReview = +1 ngày
```

### Flow 2: Luyện Tập
```
1. User chọn dạng bài tập (Multiple Choice/Fill Blank/Matching)
2. Hệ thống tạo câu hỏi từ từ đã học
3. User trả lời
4. Hiển thị kết quả + giải thích
5. Cập nhật masteryScore và review schedule
```

### Flow 3: Spaced Repetition Review
```
1. Hệ thống kiểm tra từ có nextReview <= hôm nay
2. Hiển thị từ cần ôn
3. User tự đánh giá: "Chưa nhớ" / "Nhớ một chút" / "Nhớ rõ"
4. Cập nhật nextReview dựa trên đánh giá:
   - Chưa nhớ: +1 ngày
   - Nhớ một chút: +3 ngày
   - Nhớ rõ: +7 ngày
5. Tăng reviewCount
```

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js + Express**: API server
- **File System**: Đọc JSON files (có thể migrate sang DB sau)
- **LocalStorage/IndexedDB**: Lưu progress của user

### Frontend
- **Vanilla JavaScript**: Không cần framework phức tạp
- **Tailwind CSS**: Styling (đã có trong project)
- **Chart.js**: Vẽ biểu đồ tiến độ
- **Howler.js**: Phát audio từ Cambridge Dictionary

### Tích Hợp
- **Cambridge Dictionary API**: Lấy chi tiết từ (đã có sẵn)
- **Local JSON**: Đọc từ vựng từ evp_merged.json

---

## 📁 Cấu Trúc Thư Mục Đề Xuất

```
En/
├── API/
│   ├── evp_merged.json                 # Dữ liệu từ vựng (với Translate)
│   └── English Grammar Profile Online.json
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── vocabulary.js               # Quản lý từ vựng
│   │   ├── practice.js                 # Logic luyện tập
│   │   ├── quiz.js                     # Logic quiz
│   │   ├── progress.js                 # Theo dõi tiến độ
│   │   ├── spaced-repetition.js        # SRS algorithm
│   │   └── storage.js                  # LocalStorage wrapper
│   └── assets/
├── routes/
│   ├── vocabulary.js                   # API routes cho từ vựng
│   ├── study.js                        # API routes cho học tập
│   └── quiz.js                         # API routes cho quiz
├── utils/
│   ├── data-loader.js                  # Load và parse JSON
│   ├── srs-algorithm.js                # Spaced repetition logic
│   └── quiz-generator.js               # Tạo câu hỏi
├── views/
│   ├── index.html                      # Home page
│   ├── learn.html                      # Trang học từ
│   ├── practice.html                   # Trang luyện tập
│   ├── quiz.html                       # Trang quiz
│   ├── progress.html                   # Trang tiến độ
│   └── review.html                     # Trang ôn lại
├── data.js                              # Existing Cambridge API
├── index.js                             # Server entry
└── package.json
```

---

## 🚀 Roadmap Phát Triển

### Phase 1: Foundation (Week 1)
- [x] Load và parse dữ liệu từ evp_merged.json
- [ ] Tạo API endpoints cơ bản
- [ ] Xây dựng trang học từ mới (Learn)
- [ ] Tích hợp Cambridge Dictionary API
- [ ] LocalStorage để lưu progress

### Phase 2: Practice & Quiz (Week 2)
- [ ] Implement Multiple Choice
- [ ] Implement Fill in the Blank
- [ ] Implement Matching
- [ ] Tạo Quiz Generator
- [ ] Trang Quiz với tính điểm

### Phase 3: Spaced Repetition (Week 3)
- [ ] Implement SRS algorithm
- [ ] Trang Review với queue
- [ ] Tự động điều chỉnh lịch ôn tập
- [ ] Đánh giá độ khó

### Phase 4: Progress & Stats (Week 4)
- [ ] Dashboard thống kê
- [ ] Biểu đồ tiến độ
- [ ] Streak tracking
- [ ] Badge system

### Phase 5: Polish & Optimization (Week 5)
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing

---

## 💡 Tính Năng Nâng Cao (Future)

1. **Social Features**
   - Leaderboard
   - Chia sẻ thành tích
   - Study groups

2. **AI Integration**
   - Personalized learning path
   - Adaptive difficulty
   - Smart word suggestions

3. **Gamification**
   - XP system
   - Achievements
   - Daily challenges

4. **Export/Import**
   - Export word lists
   - Import từ Anki/Quizlet
   - Backup progress

5. **Mobile App**
   - React Native hoặc PWA
   - Offline mode
   - Push notifications

---

## 📝 Notes

- Dữ liệu hiện tại là static JSON, có thể migrate sang database (MongoDB/PostgreSQL) khi scale
- Cambridge Dictionary API có rate limit, cần cache kỹ
- LocalStorage có giới hạn ~5-10MB, cân nhắc IndexedDB cho dữ liệu lớn
- Có thể thêm authentication nếu muốn sync giữa devices

