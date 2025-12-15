# 🚀 Ý tưởng Phát triển AI Writing Assistant

## 📋 Tổng quan
Tài liệu này đề xuất các tính năng mở rộng cho AI Writing Assistant để nâng cao trải nghiệm học viết tiếng Anh.

---

## 🎯 Phase 1: Core Enhancements (Ưu tiên cao)

### 1. **Lịch sử Bài viết (Writing History)**
**Mục đích**: Lưu và xem lại các bài viết đã sửa

**Tính năng**:
- Lưu tự động mỗi bài viết đã sửa vào `localStorage`
- Danh sách lịch sử với preview
- Tìm kiếm theo ngày, từ khóa
- Xem lại bài viết cũ và so sánh

**UI**:
```html
<!-- Sidebar hoặc tab mới -->
<div class="writing-history">
  <h3>Lịch sử bài viết</h3>
  <div class="history-list">
    <!-- Mỗi item: preview + date + actions -->
  </div>
</div>
```

**Lợi ích**:
- ✅ Theo dõi tiến độ
- ✅ Học từ lỗi cũ
- ✅ So sánh bài viết trước/sau

---

### 2. **So sánh Trước/Sau (Before/After Comparison)**
**Mục đích**: Xem rõ sự khác biệt giữa bản gốc và bản đã sửa

**Tính năng**:
- Side-by-side view (2 cột)
- Highlight các thay đổi
- Diff view với màu sắc
- Toggle giữa các view modes

**UI**:
```html
<div class="comparison-view">
  <div class="before-column">
    <h4>Bản gốc</h4>
    <div class="text-original">...</div>
  </div>
  <div class="after-column">
    <h4>Bản đã sửa</h4>
    <div class="text-corrected">...</div>
  </div>
</div>
```

**Lợi ích**:
- ✅ Dễ nhận biết thay đổi
- ✅ Học hiệu quả hơn
- ✅ Visual comparison

---

### 3. **Tích hợp TTS (Text-to-Speech)**
**Mục đích**: Nghe bản đã sửa để cải thiện phát âm

**Tính năng**:
- Nút "Nghe bản đã sửa" sau khi sửa xong
- Sử dụng Puter.js TTS (ElevenLabs) hoặc Web Speech API
- Highlight từ đang được đọc
- Tốc độ điều chỉnh được

**Implementation**:
```javascript
async function playCorrectedText() {
  const correctedText = document.getElementById('correctedText').textContent;
  // Sử dụng TTS từ assessment.html
  await generateAudio(correctedText);
}
```

**Lợi ích**:
- ✅ Cải thiện phát âm
- ✅ Nghe cách đọc đúng
- ✅ Kết hợp nghe + viết

---

### 4. **Đánh giá & Điểm số (Scoring System)**
**Mục đích**: Đánh giá chất lượng bài viết

**Tính năng**:
- Tính điểm dựa trên số lỗi
- Phân loại lỗi (ngữ pháp, chính tả, diễn đạt)
- Level đánh giá (A1-C2)
- Gợi ý cải thiện dựa trên điểm

**AI Prompt Enhancement**:
```javascript
const prompt = `... Trả về thêm:
{
  "score": 85,
  "level": "B1",
  "errorBreakdown": {
    "grammar": 3,
    "spelling": 1,
    "expression": 2
  },
  "feedback": "Bài viết tốt, cần cải thiện ngữ pháp..."
}`;
```

**Lợi ích**:
- ✅ Động lực học tập
- ✅ Theo dõi tiến độ
- ✅ Biết điểm yếu

---

## 🎨 Phase 2: Advanced Features (Ưu tiên trung bình)

### 5. **Chế độ Luyện tập theo Chủ đề (Topic-based Practice)**
**Mục đích**: Luyện viết theo chủ đề cụ thể

**Tính năng**:
- Chọn chủ đề (Daily Life, Travel, Work, etc.)
- AI đưa ra đề bài viết
- Gợi ý từ vựng liên quan
- Template câu mẫu

**UI**:
```html
<div class="topic-selector">
  <select id="topicSelect">
    <option value="daily-life">Daily Life</option>
    <option value="travel">Travel</option>
    <option value="work">Work</option>
  </select>
  <button onclick="generateWritingPrompt()">Tạo đề bài</button>
</div>
```

**Lợi ích**:
- ✅ Luyện tập có mục tiêu
- ✅ Mở rộng từ vựng theo chủ đề
- ✅ Chuẩn bị cho kỳ thi

---

### 6. **Tích hợp Từ vựng (Vocabulary Integration)**
**Mục đích**: Link từ vựng trong bài viết đến hệ thống học từ

**Tính năng**:
- Highlight các từ vựng có trong database
- Click vào từ → mở Word Detail Modal (từ learn.html)
- Gợi ý từ vựng nâng cao
- Thống kê từ vựng đã dùng

**Implementation**:
```javascript
function highlightVocabulary(text) {
  // Check từ trong vocabulary database
  // Highlight và thêm click handler
  // Link đến learn.html modal
}
```

**Lợi ích**:
- ✅ Học từ vựng trong ngữ cảnh
- ✅ Mở rộng vốn từ
- ✅ Tích hợp với hệ thống học từ

---

### 7. **Grammar Hints (Gợi ý Ngữ pháp)**
**Mục đích**: Gợi ý grammar points liên quan đến lỗi

**Tính năng**:
- Khi phát hiện lỗi ngữ pháp, link đến grammar point
- Hiển thị ví dụ từ grammar database
- Gợi ý ôn tập grammar points liên quan

**Implementation**:
```javascript
// Khi AI phát hiện lỗi "past simple"
// → Tìm grammar points về "past simple" trong grammar database
// → Hiển thị link và ví dụ
```

**Lợi ích**:
- ✅ Học grammar trong ngữ cảnh
- ✅ Link đến tài liệu grammar
- ✅ Học sâu hơn

---

### 8. **Export & Download**
**Mục đích**: Xuất bài viết ra file

**Tính năng**:
- Export PDF (bản gốc + bản sửa + lỗi)
- Export Word (.docx)
- Export Markdown
- In ấn

**Libraries**:
- `jsPDF` cho PDF
- `docx` cho Word
- `html2canvas` cho screenshot

**Lợi ích**:
- ✅ Lưu trữ bài viết
- ✅ Chia sẻ với giáo viên
- ✅ In ấn để học offline

---

## 📊 Phase 3: Analytics & Progress (Ưu tiên thấp)

### 9. **Progress Dashboard cho Writing**
**Mục đích**: Theo dõi tiến độ cải thiện kỹ năng viết

**Tính năng**:
- Biểu đồ số lỗi theo thời gian
- Phân tích loại lỗi thường gặp
- Streak (số ngày viết liên tiếp)
- Level progression

**Metrics**:
- Số bài viết đã viết
- Tỷ lệ lỗi giảm dần
- Từ vựng mới đã dùng
- Grammar points đã học

**Lợi ích**:
- ✅ Động lực học tập
- ✅ Theo dõi tiến độ
- ✅ Phát hiện điểm yếu

---

### 10. **Writing Challenges (Thử thách Viết)**
**Mục đích**: Tạo động lực qua thử thách

**Tính năng**:
- Daily challenge (viết về chủ đề trong ngày)
- Weekly goal (số bài viết trong tuần)
- Achievement badges
- Leaderboard (nếu có nhiều users)

**Lợi ích**:
- ✅ Tạo thói quen viết
- ✅ Động lực học tập
- ✅ Gamification

---

## 🔧 Technical Enhancements

### 11. **Cải thiện AI Prompt**
**Mục đích**: Tối ưu chất lượng phản hồi AI

**Cải thiện**:
- Prompt chi tiết hơn về loại lỗi
- Yêu cầu giải thích rõ ràng hơn
- Format response nhất quán
- Xử lý edge cases (bài viết dài, nhiều lỗi)

---

### 12. **Batch Processing**
**Mục đích**: Sửa nhiều đoạn văn cùng lúc

**Tính năng**:
- Upload file text
- Sửa từng đoạn
- Export tất cả kết quả

---

### 13. **Custom Settings**
**Mục đích**: Tùy chỉnh theo nhu cầu

**Settings**:
- Level target (A1-C2)
- Độ chi tiết feedback (ngắn/dài)
- Focus areas (grammar, vocabulary, expression)
- AI model preference

---

## 🎯 Khuyến nghị Triển khai

### **Phase 1 (Ngay - 1-2 tuần)**:
1. ✅ Lịch sử Bài viết
2. ✅ So sánh Trước/Sau
3. ✅ Tích hợp TTS
4. ✅ Đánh giá & Điểm số

### **Phase 2 (Sau 2-4 tuần)**:
5. ✅ Chế độ Luyện tập theo Chủ đề
6. ✅ Tích hợp Từ vựng
7. ✅ Grammar Hints
8. ✅ Export & Download

### **Phase 3 (Sau 1-2 tháng)**:
9. ✅ Progress Dashboard
10. ✅ Writing Challenges
11. ✅ Technical Enhancements

---

## 💡 Quick Wins (Dễ làm, Impact cao)

1. **Lịch sử Bài viết** - Dễ implement, giá trị cao
2. **So sánh Trước/Sau** - Visual, dễ hiểu
3. **TTS Integration** - Reuse code từ assessment.html
4. **Điểm số** - Động lực học tập

---

## 📝 Notes

- Tất cả tính năng nên lưu vào `localStorage` (dự án cá nhân)
- Có thể tích hợp với hệ thống hiện có (vocabulary, grammar)
- UI/UX nên nhất quán với các trang khác
- Performance: Cache AI responses, optimize prompts

---

Bạn muốn tôi implement tính năng nào trước? Tôi khuyến nghị bắt đầu với **Lịch sử Bài viết** và **So sánh Trước/Sau** vì dễ làm và có giá trị cao.

