# Hướng dẫn sử dụng Puter.js TTS

## Tổng quan

Puter.js là một SDK JavaScript cho phép sử dụng các dịch vụ AI (bao gồm TTS) mà **không cần API key từ developer**. Puter.js hoạt động theo mô hình **"User-Pays"**, nghĩa là người dùng cuối tự trả phí cho việc sử dụng.

## Cách sử dụng

### 1. Không cần API key (Mặc định)

Puter.js đã được tích hợp sẵn trong `assessment.html`:

```html
<script src="https://js.puter.com/v2/"></script>
```

Bạn có thể sử dụng TTS ngay lập tức mà không cần cấu hình gì thêm.

### 2. Nếu gặp lỗi Authentication

Nếu bạn gặp lỗi liên quan đến authentication, có thể cần:

#### Option A: Đăng nhập Puter.com (Khuyến nghị)

1. Truy cập https://puter.com
2. Tạo tài khoản miễn phí hoặc đăng nhập
3. Puter.js sẽ tự động sử dụng session của bạn

#### Option B: Sử dụng TTS provider khác

Nếu không muốn đăng nhập, bạn có thể thay đổi provider trong code:

```javascript
// Thay đổi từ elevenlabs sang provider khác
const audioResult = await puterClient.ai.txt2speech(text, {
  provider: 'openai', // hoặc 'google', 'azure', etc.
  voice: 'alloy', // voice tương ứng với provider
  model: 'tts-1'
});
```

### 3. Các Provider TTS có sẵn

Puter.js hỗ trợ nhiều TTS provider:

- **ElevenLabs**: `provider: 'elevenlabs'` (hiện tại đang dùng)
- **OpenAI**: `provider: 'openai'`
- **Google**: `provider: 'google'`
- **Azure**: `provider: 'azure'`

### 4. Kiểm tra lỗi

Nếu TTS không hoạt động:

1. Mở Console (F12) để xem chi tiết lỗi
2. Kiểm tra status indicator ở trên cùng trang
3. Xem tooltip trên button TTS để biết thêm thông tin

### 5. Troubleshooting

**Lỗi: "TTS không khả dụng"**
- Kiểm tra xem Puter.js đã load chưa (xem Console)
- Thử refresh trang

**Lỗi: "Authentication required"**
- Đăng nhập tại https://puter.com
- Hoặc thay đổi provider (xem Option B)

**Lỗi: "Rate limit exceeded"**
- Bạn đã vượt quá giới hạn sử dụng miễn phí
- Đợi một lúc rồi thử lại
- Hoặc nâng cấp tài khoản Puter.com

## Tài liệu tham khảo

- Puter.js Docs: https://docs.puter.com
- Puter Developer: https://developer.puter.com
- Puter.com: https://puter.com

## Lưu ý

- Puter.js là dịch vụ miễn phí cho developer, nhưng người dùng có thể phải trả phí cho việc sử dụng
- Một số provider (như ElevenLabs) có thể yêu cầu authentication
- Luôn kiểm tra Console để xem chi tiết lỗi

