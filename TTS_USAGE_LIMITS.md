# Giới hạn sử dụng TTS - Dự án cá nhân

## Tổng quan

Dự án sử dụng hệ thống TTS 2 tầng với **fallback tự động**, đảm bảo bạn luôn có TTS sử dụng được.

## 1. Web Speech API (Fallback - Miễn phí hoàn toàn)

### ✅ **KHÔNG GIỚI HẠN**

- **Số lần sử dụng/ngày**: **KHÔNG GIỚI HẠN** (∞)
- **Số lần sử dụng/tháng**: **KHÔNG GIỚI HẠN** (∞)
- **Chi phí**: **MIỄN PHÍ 100%**
- **Yêu cầu**: Không cần API key, không cần đăng nhập
- **Hoạt động**: Trực tiếp trên trình duyệt của bạn

### Đặc điểm:
- ✅ Hoàn toàn miễn phí, không giới hạn
- ✅ Không cần đăng ký tài khoản
- ✅ Không cần API key
- ✅ Tự động fallback khi Puter.js lỗi
- ⚠️ Chất lượng giọng nói phụ thuộc vào trình duyệt (thường thấp hơn ElevenLabs)

## 2. Puter.js + ElevenLabs (Primary - Chất lượng cao)

### ⚠️ **CÓ THỂ CÓ GIỚI HẠN** (Tùy tài khoản Puter.com)

Puter.js hoạt động theo mô hình "User-Pays", giới hạn phụ thuộc vào:
- Tài khoản Puter.com của bạn (free tier hoặc paid)
- Giới hạn của ElevenLabs (qua Puter.js)

### Ước tính (cần xác nhận từ Puter.com):
- **Free tier**: Có thể có giới hạn ~10,000-50,000 ký tự/tháng
- **Paid tier**: Giới hạn cao hơn hoặc không giới hạn

### Đặc điểm:
- ✅ Chất lượng giọng nói cao (ElevenLabs)
- ✅ Giọng nữ tiếng Anh tự nhiên
- ⚠️ Có thể cần đăng nhập Puter.com
- ⚠️ Có thể có giới hạn sử dụng (tùy tài khoản)

## 3. Hệ thống Fallback Tự động

### Cách hoạt động:

```
1. Thử Puter.js (ElevenLabs) trước
   ↓
2. Nếu Puter.js lỗi/giới hạn → Tự động chuyển sang Web Speech API
   ↓
3. Web Speech API: KHÔNG GIỚI HẠN, luôn hoạt động
```

### Kết quả:

**Bạn có thể sử dụng TTS KHÔNG GIỚI HẠN mỗi ngày** vì:
- Web Speech API không có giới hạn
- Tự động fallback khi Puter.js hết giới hạn
- Hoàn toàn miễn phí cho dự án cá nhân

## 4. Ước tính sử dụng thực tế

### Ví dụ với dự án hiện tại:

**Trang Assessment (Sentence Fill-in)**:
- 12 câu hỏi/bộ
- Mỗi câu có thể phát audio ~1-2 lần
- = **~12-24 lần phát audio/bộ**

**Nếu bạn làm 10 bộ/ngày**:
- = **~120-240 lần phát audio/ngày**
- = **~3,600-7,200 lần/tháng**

### Với Web Speech API:
- ✅ **Tất cả đều miễn phí, không giới hạn**
- ✅ Có thể sử dụng bao nhiêu cũng được

### Với Puter.js (nếu có giới hạn):
- ⚠️ Có thể hết giới hạn sau một số lần sử dụng
- ✅ **Tự động fallback sang Web Speech API**
- ✅ Vẫn tiếp tục sử dụng được bình thường

## 5. Khuyến nghị cho dự án cá nhân

### ✅ **Sử dụng Web Speech API làm chính** (Khuyến nghị)

Vì dự án cá nhân:
- Không cần chất lượng quá cao
- Cần sử dụng không giới hạn
- Không muốn phụ thuộc vào dịch vụ bên ngoài

### Cách chuyển sang Web Speech API làm chính:

Trong `assessment.html`, bạn có thể:
1. Bỏ qua Puter.js hoàn toàn
2. Chỉ sử dụng Web Speech API
3. Hoặc giữ nguyên (tự động fallback)

## 6. Kết luận

### ✅ **Bạn có thể sử dụng TTS KHÔNG GIỚI HẠN mỗi ngày**

**Lý do:**
1. Web Speech API: **KHÔNG GIỚI HẠN** (hoàn toàn miễn phí)
2. Hệ thống tự động fallback khi Puter.js hết giới hạn
3. Phù hợp cho dự án cá nhân

**Không cần lo lắng về giới hạn sử dụng!** 🎉

