Hướng phát triển tiếp để tối ưu và tận dụng API/dữ liệu
1) Caching & Hiệu năng
Thêm server-side cache cho /api/vocabulary/words và /api/dictionary/* (LRU + TTL ngắn), đặc biệt khi quiz/matching gọi nhiều.
Preload nhẹ (prefetch) audio/IPA cho 3–5 mục đầu ở các chế độ có nghe (IPA, Typing, Sentence Fill-in).
Gzip/Brotli cho JSON lớn; nếu deploy production, bật compression middleware.

2) Chất lượng dữ liệu
Chuẩn hóa nghĩa/guideword: cắt ngắn, bỏ ngoặc dư, lowercase so sánh.
Đồng bộ Translate/Guideword theo level khi random: ưu tiên theo level đã chọn để bộ câu đồng nhất độ khó.
Loại bỏ outlier (từ quá dài hoặc nghĩa trống) sớm ở backend /api/vocabulary/random.

3) API & lọc
Bổ sung tham số fields (chọn trường trả về) cho /api/vocabulary/words để giảm payload khi chỉ cần Base Word/Translate.
Thêm filter hasAudio, hasGuide, hasTranslate, maxLen cho /api/vocabulary/random giúp các chế độ (matching, fill-in, typing) lấy dữ liệu phù hợp ngay từ backend.

4) Ổn định TTS
Thêm fallback TTS provider (hoặc retry) khi Puter/ElevenLabs lỗi.
Cache audio URL theo text + voice để tái sử dụng giữa các trang.

5) Matching & luyện tập
Cho phép chọn số cặp (4/6/8) và “ẩn nghĩa” (chỉ guideword hoặc chỉ translate).
Case-insensitive drag-drop (đã gần đúng, nhưng có thể nới: trim + lower).
Thêm nút “Bộ mới”/“Làm lại” đã có; bổ sung thống kê mini: số sai, số đúng, thời gian.

6) Sentence Fill-in
Chấp nhận biến thể (số nhiều, thì quá khứ) bằng danh sách inflections đơn giản (cook/cooks/cooked).
Thêm toggle: dùng câu gốc vs câu có blank; hiển thị gợi ý level/pos.

7) Assessment/Quiz-mix
Giới hạn độ dài câu hỏi và nghĩa để tránh tràn UI; cắt ngắn kèm tooltip.
Chế độ adaptive: nếu user đúng nhiều ở level hiện tại, tự nâng level ở request tiếp theo.

8) UX & truy cập nhanh
Command palette: mở nhanh chế độ Matching/IPA/Assessment với tham số level (vd /match A2).
Thêm phím tắt: Enter để phát audio, Tab để chuyển ô nhập, Esc để đóng feedback.

9) Logging & quan sát
Ghi log lỗi API (Cambridge/TTS) nhẹ (client) + console report, giúp debug nhanh.
Đếm số lần fallback random để biết khi nào dữ liệu queue/học bị thiếu.

10) Triển khai / sản xuất
Kiểm tra CORS & timeout cho /api/dictionary/* (Cambridge có thể chậm).
Thêm rate-limit nhẹ cho API công khai nếu share ra ngoài.
Nếu muốn bắt đầu ngay, tôi đề xuất thứ tự ưu tiên:
1) Thêm filter backend cho /api/vocabulary/random: level, hasGuide/hasTranslate, maxLen, limit.
2) Cache server-side ngắn hạn cho /api/dictionary/* và /api/vocabulary/words.
3) Nới lỏng kiểm tra biến thể từ ở Sentence Fill-in (singular/plural/past).