# Phase 1 Implementation Plan - Nơi tích hợp tính năng

## 📋 Tổng quan Phase 1

1. **AI Grammar Tutor** - Giải đáp thắc mắc ngữ pháp
2. **AI Vocabulary Explanation** - Giải thích từ vựng chi tiết  
3. **Cloud Progress Sync** - Đồng bộ progress đám mây

---

## 1. 🤖 AI Grammar Tutor

### ✅ **Đề xuất: Tích hợp vào `grammar.html` + Tạo button "Hỏi AI"**

**Lý do:**
- ✅ `grammar.html` đã có danh sách grammar points
- ✅ Người dùng đang xem grammar → muốn hỏi ngay
- ✅ Không cần tạo page mới, tận dụng UI hiện có
- ✅ Context-aware: biết người dùng đang xem grammar nào

### Cách triển khai:

#### A. Thêm button "Hỏi AI" vào mỗi grammar card
```javascript
// Trong grammar.html, thêm button vào mỗi grammar item
<div class="grammar-card">
  <h3>${item.Guideword}</h3>
  <p>${item['Can-do statement']}</p>
  <button onclick="askAIAboutGrammar('${item.Guideword}', '${item.Level}')" 
    class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
    <i class="fas fa-robot mr-1"></i>Hỏi AI về grammar này
  </button>
</div>
```

#### B. Tạo modal "AI Grammar Tutor"
```javascript
// Modal hiển thị khi click "Hỏi AI"
<div id="grammarAIModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
  <div class="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto m-4">
    <div class="sticky top-0 bg-white border-b p-4">
      <h2 class="text-xl font-bold">AI Grammar Tutor</h2>
      <p class="text-sm text-gray-600">Hỏi về: <strong id="grammarTopic"></strong></p>
    </div>
    <div class="p-4">
      <!-- Chat interface -->
      <div id="grammarChatMessages" class="space-y-4 mb-4"></div>
      <div class="flex gap-2">
        <input type="text" id="grammarQuestionInput" 
          placeholder="Ví dụ: Khi nào dùng present perfect?" 
          class="flex-1 px-4 py-2 border rounded-lg">
        <button onclick="sendGrammarQuestion()" 
          class="px-4 py-2 bg-purple-600 text-white rounded-lg">
          Gửi
        </button>
      </div>
    </div>
  </div>
</div>
```

#### C. Function hỏi AI
```javascript
async function askAIAboutGrammar(guideword, level) {
  // Mở modal
  document.getElementById('grammarAIModal').classList.remove('hidden');
  document.getElementById('grammarTopic').textContent = guideword;
  
  // Hiển thị welcome message
  addChatMessage('assistant', 
    `Xin chào! Tôi sẽ giúp bạn hiểu về "${guideword}" (Level ${level}). 
    Hãy đặt câu hỏi bất kỳ!`);
}

async function sendGrammarQuestion() {
  const question = document.getElementById('grammarQuestionInput').value;
  if (!question.trim()) return;
  
  // Hiển thị câu hỏi của user
  addChatMessage('user', question);
  document.getElementById('grammarQuestionInput').value = '';
  
  // Hiển thị loading
  const loadingId = addChatMessage('assistant', 'Đang suy nghĩ...', true);
  
  // Gọi AI
  const puterClient = checkPuterAvailable();
  if (!puterClient) {
    updateChatMessage(loadingId, 'Puter.js không khả dụng. Vui lòng đăng nhập Puter.com');
    return;
  }
  
  try {
    const response = await puterClient.ai.chat(
      `Bạn là giáo viên tiếng Anh chuyên nghiệp. Giải thích ngắn gọn, dễ hiểu bằng tiếng Việt:
      
      Grammar point: ${document.getElementById('grammarTopic').textContent}
      Level: ${level}
      Câu hỏi: ${question}
      
      Yêu cầu:
      - Giải thích rõ ràng, có ví dụ
      - So sánh với các cấu trúc tương tự nếu có
      - Đưa ra bài tập ngắn để luyện tập`,
      { model: "gpt-5-nano" }
    );
    
    updateChatMessage(loadingId, response);
  } catch (error) {
    updateChatMessage(loadingId, 'Lỗi: ' + error.message);
  }
}
```

### 📍 Vị trí tích hợp:
- **File**: `public/grammar.html`
- **Vị trí**: Thêm button vào mỗi grammar card (dòng ~100-150)
- **Modal**: Thêm modal mới vào cuối file (trước `</body>`)

---

## 2. 📚 AI Vocabulary Explanation

### ✅ **Đề xuất: Tích hợp vào `learn.html` - Word Detail Modal**

**Lý do:**
- ✅ `learn.html` đã có word detail modal
- ✅ Người dùng đang xem từ → muốn giải thích chi tiết ngay
- ✅ Không cần tạo page mới
- ✅ Context-aware: biết từ nào đang xem

### Cách triển khai:

#### A. Thêm tab "AI Giải thích" vào Word Detail Modal
```javascript
// Trong learn.html, cập nhật showWordDetail()
let html = `
  <div class="border-b mb-4">
    <div class="flex gap-2">
      <button onclick="showWordTab('details')" 
        class="px-4 py-2 border-b-2 border-purple-600 text-purple-600">
        Chi tiết
      </button>
      <button onclick="showWordTab('ai')" 
        class="px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-purple-600">
        <i class="fas fa-robot mr-1"></i>AI Giải thích
      </button>
    </div>
  </div>
  
  <div id="wordDetailsTab" class="word-tab">
    <!-- Existing word details -->
  </div>
  
  <div id="wordAITab" class="word-tab hidden">
    <div id="aiExplanationContent">
      <button onclick="loadAIExplanation('${word}', '${wordData.Level}')" 
        class="px-4 py-2 bg-purple-600 text-white rounded-lg">
        <i class="fas fa-robot mr-1"></i>Xem giải thích từ AI
      </button>
    </div>
  </div>
`;
```

#### B. Function load AI explanation
```javascript
async function loadAIExplanation(word, level) {
  const contentDiv = document.getElementById('aiExplanationContent');
  contentDiv.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
  
  const puterClient = checkPuterAvailable();
  if (!puterClient) {
    contentDiv.innerHTML = '<p class="text-red-500">Puter.js không khả dụng. Vui lòng đăng nhập Puter.com</p>';
    return;
  }
  
  try {
    const response = await puterClient.ai.chat(
      `Giải thích từ vựng "${word}" cho người học level ${level}:
      
      1. Nghĩa tiếng Việt
      2. Cách phát âm (IPA)
      3. Từ loại (noun/verb/adjective...)
      4. Cách sử dụng với ví dụ
      5. Từ đồng nghĩa/trái nghĩa
      6. Collocations (từ thường đi kèm)
      7. Bài tập ngắn
      
      Trả về format dễ đọc, có emoji để dễ nhớ.`,
      { model: "gpt-5-nano" }
    );
    
    // Format response với markdown-like styling
    contentDiv.innerHTML = formatAIResponse(response);
  } catch (error) {
    contentDiv.innerHTML = `<p class="text-red-500">Lỗi: ${error.message}</p>`;
  }
}

function formatAIResponse(text) {
  // Convert markdown-like text to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^/, '<p class="mb-3">')
    .replace(/$/, '</p>');
}
```

### 📍 Vị trí tích hợp:
- **File**: `public/learn.html`
- **Vị trí**: Cập nhật function `showWordDetail()` (dòng ~358)
- **Modal**: Word Detail Modal đã có sẵn (dòng ~141)

---

## 3. ☁️ Cloud Progress Sync

### ✅ **Đề xuất: Tích hợp vào `storage.js` + Preferences Modal**

**Lý do:**
- ✅ `storage.js` quản lý tất cả progress
- ✅ Preferences modal đã có UI để settings
- ✅ Tự động sync, người dùng không cần làm gì
- ✅ Fallback về localStorage nếu Puter.js không có

### Cách triển khai:

#### A. Tạo `public/js/cloudSync.js` - Module mới
```javascript
// public/js/cloudSync.js
class CloudSync {
  constructor() {
    this.puterClient = this.checkPuterAvailable();
    this.syncEnabled = this.loadSyncPreference();
  }
  
  checkPuterAvailable() {
    if (typeof Puter !== 'undefined' && Puter.kv) return Puter;
    if (typeof puter !== 'undefined' && puter.kv) return puter;
    if (typeof window.puter !== 'undefined' && window.puter.kv) return window.puter;
    return null;
  }
  
  loadSyncPreference() {
    try {
      const saved = localStorage.getItem('cloud_sync_enabled');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  }
  
  async saveProgress(progress) {
    // Always save to localStorage first (fast)
    localStorage.setItem('user_progress', JSON.stringify(progress));
    
    // Then sync to cloud if enabled
    if (this.syncEnabled && this.puterClient) {
      try {
        await this.puterClient.kv.set('user_progress', progress);
        console.log('✅ Progress synced to cloud');
      } catch (error) {
        console.warn('⚠️ Cloud sync failed:', error);
        // Continue with localStorage only
      }
    }
  }
  
  async loadProgress() {
    // Try cloud first if enabled
    if (this.syncEnabled && this.puterClient) {
      try {
        const cloudProgress = await this.puterClient.kv.get('user_progress');
        if (cloudProgress) {
          // Merge with localStorage (cloud takes priority)
          localStorage.setItem('user_progress', JSON.stringify(cloudProgress));
          return cloudProgress;
        }
      } catch (error) {
        console.warn('⚠️ Cloud load failed:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const local = localStorage.getItem('user_progress');
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }
  
  async enableSync() {
    this.syncEnabled = true;
    localStorage.setItem('cloud_sync_enabled', 'true');
    
    // Sync existing data
    const progress = JSON.parse(localStorage.getItem('user_progress') || '{}');
    await this.saveProgress(progress);
  }
  
  async disableSync() {
    this.syncEnabled = false;
    localStorage.setItem('cloud_sync_enabled', 'false');
  }
}

// Export singleton
const cloudSync = new CloudSync();
```

#### B. Cập nhật `public/js/storage.js`
```javascript
// Thêm vào đầu file
import { cloudSync } from './cloudSync.js'; // Hoặc load script tag

// Cập nhật saveProgress()
saveProgress(progress) {
  // Existing localStorage save
  localStorage.setItem(this.progressKey, JSON.stringify(progress));
  
  // Cloud sync
  cloudSync.saveProgress(progress);
}

// Cập nhật loadProgress()
loadProgress() {
  // Try cloud first
  const cloudData = cloudSync.loadProgress();
  if (cloudData) return cloudData;
  
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(this.progressKey);
    return raw ? JSON.parse(raw) : { words: {}, stats: {} };
  } catch {
    return { words: {}, stats: {} };
  }
}
```

#### C. Thêm toggle vào Preferences Modal
```javascript
// Trong public/js/preferencesModal.js hoặc preferences.html
function getPreferencesContent() {
  return `
    <!-- Existing preferences -->
    
    <div class="border-t pt-4 mt-4">
      <h3 class="font-semibold mb-3">Đồng bộ đám mây</h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-700">Đồng bộ progress lên đám mây</p>
          <p class="text-xs text-gray-500">Truy cập progress từ mọi thiết bị</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="cloudSyncToggle" 
            ${cloudSync.syncEnabled ? 'checked' : ''}
            onchange="toggleCloudSync(this.checked)"
            class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>
      ${!cloudSync.puterClient ? 
        '<p class="text-xs text-yellow-600 mt-2"><i class="fas fa-exclamation-triangle"></i> Cần đăng nhập Puter.com để sử dụng</p>' : 
        '<p class="text-xs text-green-600 mt-2"><i class="fas fa-check-circle"></i> Đã kết nối Puter.com</p>'
      }
    </div>
  `;
}

async function toggleCloudSync(enabled) {
  if (enabled) {
    await cloudSync.enableSync();
  } else {
    await cloudSync.disableSync();
  }
}
```

### 📍 Vị trí tích hợp:
- **File mới**: `public/js/cloudSync.js`
- **File cập nhật**: `public/js/storage.js`
- **File cập nhật**: `public/js/preferencesModal.js` hoặc `public/preferences.html`

---

## 📊 Tổng kết Implementation Plan

| Tính năng | File tích hợp | Loại thay đổi | Độ khó | Thời gian ước tính |
|-----------|---------------|---------------|--------|-------------------|
| **AI Grammar Tutor** | `grammar.html` | Thêm button + Modal | ⭐⭐ Dễ | 2-3 giờ |
| **AI Vocabulary Explanation** | `learn.html` | Thêm tab vào Modal | ⭐⭐ Dễ | 1-2 giờ |
| **Cloud Progress Sync** | `storage.js` + `preferencesModal.js` | Module mới + Integration | ⭐⭐⭐ Trung bình | 3-4 giờ |

---1. 🤖 AI Grammar Tutor
📍 Tích hợp vào: grammar.html (không cần tạo page mới)
Lý do:
Đã có danh sách grammar points
Người dùng đang xem grammar → hỏi ngay
Context-aware: biết grammar nào đang xem
Cách làm:
Thêm button "Hỏi AI" vào mỗi grammar card
Tạo modal chat interface
AI giải thích dựa trên grammar point đang xem

## 🎯 Thứ tự triển khai đề xuất

### Step 1: AI Vocabulary Explanation (Dễ nhất, impact cao)
- ✅ Tích hợp vào word detail modal
- ✅ Người dùng thấy ngay khi xem từ
- ✅ Không cần thay đổi nhiều code

### Step 2: AI Grammar Tutor (Dễ, impact cao)
- ✅ Thêm button vào grammar cards
- ✅ Modal chat interface
- ✅ Context-aware với grammar đang xem

### Step 3: Cloud Progress Sync (Trung bình, foundation)
- ✅ Tạo module cloudSync.js
- ✅ Tích hợp vào storage.js
- ✅ Thêm toggle vào preferences
- ✅ Tự động sync khi có thay đổi

---

## 🔧 Technical Notes

### Error Handling
- Luôn có fallback về localStorage
- Hiển thị thông báo rõ ràng nếu Puter.js không khả dụng
- Cache AI responses để giảm API calls

### User Experience
- Loading states cho mọi AI calls
- Error messages thân thiện
- Tự động retry nếu sync fail

### Performance
- Lazy load AI explanations (chỉ khi user click)
- Cache AI responses trong localStorage
- Debounce sync operations

---

## 📝 Next Steps

1. ✅ Review plan này với team/user
2. ✅ Bắt đầu với AI Vocabulary Explanation
3. ✅ Test từng tính năng trước khi chuyển sang tính năng tiếp theo
4. ✅ Document API usage và error handling

