# Hướng Dẫn Chạy Dự Án Monorepo (Web, Mobile, Backend Docker)

Dự án này sử dụng mô hình Monorepo (Turborepo + pnpm) kết hợp cả Backend Java (chạy Docker), Web Frontend (React) và Mobile (React Native CLI).

## 1. Khởi động Backend và Database (RẤT QUAN TRỌNG)

Bạn vừa gặp lỗi `failed to connect to the docker API` khi cố gắng chạy lệnh docker-compose. Nguyên nhân là do **Docker Desktop chưa được bật** trên máy tính của bạn.

**Cách khắc phục:**
1. Mở Start Menu của Windows.
2. Tìm và chạy ứng dụng **Docker Desktop**.
3. Chờ cho đến khi icon Docker ở góc phải màn hình (Taskbar) báo hiệu màu xanh lá (Engine Running).
4. Mở terminal tại thư mục gốc dự án (`d:\HUYNH-IT\ki_7\JAVA\docker_T`) và chạy lại lệnh sau để khởi động Backend và Database PostgreSQL:
   ```bash
   docker-compose up -d backend postgres
   ```
*(Lệnh này sẽ tải image và chạy ẩn ngầm, giữ terminal của bạn trống để làm việc khác).*

## 2. Cài đặt các thư viện (Dependencies)

Mở một Terminal/PowerShell mới và điều hướng đến chính xác thư mục chứa dự án (thư mục gốc `d:\HUYNH-IT\ki_7\JAVA\docker_T`).
Sau đó, hãy chắc chắn bạn đã cài `pnpm` trên máy, nếu chưa có thì chạy `npm install -g pnpm` trước. Cuối cùng, chạy lệnh cài đặt:
```bash
pnpm install
```

## 3. Khởi động Mobile App (React Native Bare)

> **Yêu cầu bắt buộc:** Máy bạn đã cài đặt Android Studio, SDK, các biến môi trường (`ANDROID_HOME`, `platform-tools`), và đã khởi động máy ảo Emulator (hoặc cắm máy thật).

1. Mở một terminal mới, khởi động server Metro:
   ```bash
   cd apps/mobile
   npm start
   ```

2. Mở một terminal thứ hai, tiến hành build ứng dụng và cài vào máy ảo/máy thật:
   ```bash
   cd apps/mobile
   npm run android
   ```
   *Quá trình này có thể tốn từ 5 - 15 phút cho lần chạy đầu tiên vì Gradle cần tải các thư viện native.*

## 4. Khởi động Web App (Tuỳ chọn)

Nếu bạn muốn chạy song song cả phần Web (đang nằm trong `apps/web`):
1. Chạy lệnh:
   ```bash
   cd apps/web
   npm run dev
   ```
2. Truy cập: `http://localhost:5173` (hoặc cổng mà Vite báo trên màn hình).

---
## Ghi chú về kết nối API:
Trong file `packages/api/index.ts`, IP đang được thiết lập là `10.0.2.2` (đây là IP để máy ảo Android có thể gọi xuống Localhost của Windows). 
- Nếu bạn cắm điện thoại thật vào máy để test, hãy đổi IP `10.0.2.2` thành IP Wi-Fi (LAN) hiện tại của máy tính bạn (ví dụ `192.168.1.45`).
