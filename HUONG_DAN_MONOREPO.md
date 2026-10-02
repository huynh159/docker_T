# Hướng Dẫn Cấu Trúc Monorepo Mới

Dự án vừa được chuyển đổi sang cấu trúc **Monorepo** sử dụng **Turborepo** và **pnpm workspaces**. Việc này giúp quản lý tập trung nhiều ứng dụng (Web, Mobile) và các gói dùng chung (Shared Packages) trong cùng một kho chứa mã nguồn (repository).

## 1. Cấu trúc thư mục mới thêm vào

Dưới đây là các phần mới được thêm vào dự án:

- **`apps/`**: Chứa các ứng dụng dành cho người dùng cuối (End-user applications).
  - `apps/web/`: Ứng dụng Web Frontend (React/Vite). Thay thế cho thư mục `frontend/` cũ.
  - `apps/mobile/`: Ứng dụng Mobile (React Native Bare Workflow).
- **`packages/`**: Chứa các thư viện/gói mã nguồn dùng chung giữa các ứng dụng.
  - `packages/api/`: Các hàm gọi API, services dùng chung cho cả Web và Mobile.
  - `packages/core/` (nếu có): Các hằng số (constants), hàm tiện ích (utils) hoặc giao diện (types) dùng chung.
- **`turbo.json`**: Cấu hình của Turborepo, định nghĩa cách các task (`build`, `dev`, `lint`) phụ thuộc và thực thi.
- **`pnpm-workspace.yaml`**: Định nghĩa các workspace của pnpm (bao gồm `apps/*` và `packages/*`).

## 2. Lợi ích của Monorepo

- **Tái sử dụng mã nguồn (Code Sharing):** Không cần copy/paste code (như gọi API, logic xử lý) giữa Web và Mobile. Cả hai đều có thể import từ `packages/api`.
- **Quản lý thư viện tập trung:** Các thư viện (`node_modules`) được quản lý chung bởi pnpm, tiết kiệm ổ cứng và đồng nhất version.
- **Build cực nhanh với Turborepo:** Turbo sử dụng cơ chế caching giúp bỏ qua việc build lại những module không có sự thay đổi.

## 3. Các lệnh cơ bản

Yêu cầu cài đặt `pnpm` trên toàn cục: `npm install -g pnpm`.

Tại thư mục gốc của dự án (`d:\HUYNH-IT\ki_7\JAVA\docker_T`), bạn có thể sử dụng các lệnh sau:

### Cài đặt tất cả thư viện (Dependencies)
```bash
pnpm install
```

### Chạy chế độ phát triển (Dev) cho tất cả ứng dụng (Web)
```bash
pnpm dev
```
*(Lệnh này sẽ gọi script `dev` được cấu hình trong `turbo.json`, thường sẽ khởi chạy ứng dụng Web).*

### Chạy một ứng dụng cụ thể
- **Web**: 
  ```bash
  cd apps/web
  pnpm dev
  ```
- **Mobile** (Cần thiết lập Android Studio/Emulator trước):
  ```bash
  cd apps/mobile
  pnpm start       # Chạy Metro Bundler
  # Mở terminal khác:
  pnpm android     # Cài đặt app vào thiết bị/máy ảo
  ```

### Build toàn bộ dự án
```bash
pnpm build
```

---
*Ghi chú: Để biết thêm chi tiết về cách chạy Backend (Docker) và cấu hình IP kết nối API cho Mobile, vui lòng tham khảo file `RUN_GUIDE.md`.*
