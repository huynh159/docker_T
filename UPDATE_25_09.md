# 📅 NHẬT KÝ CẬP NHẬT: 25/09/2026

**Tài liệu mô tả chi tiết những thay đổi và cải tiến mới nhất trong lần cập nhật hôm nay:**

### 1. Nâng cấp bảo mật (Spring Security) & Xây dựng luồng Đăng nhập
- Tích hợp framework **Spring Security** vào hệ thống Backend để quản lý phiên và bảo vệ dữ liệu người dùng.
- Bổ sung các quy tắc xác thực an toàn, chặn đứng các truy cập trái phép vào các API quan trọng.
- Thêm giao diện **Đăng nhập (Login)** hoàn chỉnh ở phía Frontend.
- Hệ thống giờ đây có khả năng quản lý trạng thái đăng nhập, phân quyền và đảm bảo chỉ những tài khoản hợp lệ mới được truy cập dữ liệu cá nhân.

### 2. Tích hợp Trí tuệ Nhân tạo (Spring AI & Google Gemini)
- Backend đã được trang bị thư viện **Spring AI**, tạo nền tảng vững chắc để kết nối với các mô hình ngôn ngữ lớn (LLM).
- Ứng dụng đã gọi thành công **Google Gemini API** (mô hình `gemini-2.5-flash`) thông qua `AiChatService`, tạo ra tính năng Chatbot AI thông minh và hỏi đáp trực tiếp với trợ lý ảo.
- **Bảo mật API Key:** Rút kinh nghiệm từ việc đẩy nhầm key lên GitHub, API Key nay đã được chuyển từ khai báo cứng (`application.properties`) sang dùng biến môi trường (environment variables trong file `.env`). Điều này giúp mã nguồn an toàn 100% khi được công khai.

### 3. Tối ưu lại Docker Volume & Cấu trúc kết nối PostgreSQL
- **Chuyển đổi Volume:** Đã đổi từ việc dùng `Bind Mount` (lưu các file database vào thư mục vật lý `./postgres-data` trên máy tính) sang dùng **`Named Volume`** (`pg_data`). Named Volume là giải pháp chuẩn chỉnh trong Docker, giúp Docker tự động quy hoạch, cô lập không gian lưu trữ và dễ dàng theo dõi trực quan thông qua giao diện ứng dụng Docker Desktop.
- **Tối ưu Cấu hình Cổng (Port):** Thay đổi port giao tiếp từ bên ngoài máy host vào database thành `5434` (`5434:5432`). Mặc dù máy bên ngoài gọi vào qua cổng `5434`, nhưng ứng dụng Spring Boot Backend (chạy chung trong mạng lưới Docker `miniapp-network`) vẫn ngầm hiểu và kết nối qua tên miền `miniapp-postgres` ở port chuẩn `5432`. Cấu hình kết nối đã được đồng bộ chuẩn xác để hệ thống vận hành trơn tru.
