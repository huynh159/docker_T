# 📘 TÀI LIỆU HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG ĐỘC LẬP (IMPLEMENTATION GUIDE)

> **Dự án**: Fullstack Todo App (PostgreSQL + Spring Boot 3 + React/Nginx)  
> **Kiến trúc**: Phân tách Module Độc Lập (Decoupled Multi-Service via Docker External Network)  
> **Ngày cập nhật**: 25/09/2026  

---

## 📑 MỤC LỤC
1. [Bối Cảnh & Mục Tiêu Kỹ Thuật](#1-bối-cảnh--mục-tiêu-kỹ-thuật)
2. [Kiến Trúc Mạng & Cơ Chế Phân Giải DNS](#2-kiến-trúc-mạng--cơ-chế-phân-giải-dns)
3. [Cấu Trúc Thư Mục & Các File Cấu Hình](#3-cấu-trúc-thư-mục--các-file-cấu-hình)
4. [Chi Tiết Cấu Hình 3 Dịch Vụ](#4-chi-tiết-cấu-hình-3-dịch-vụ)
5. [Quy Trình Khởi Động & Vận Hành](#5-quy-trình-khởi-động--vận-hành)
6. [Quản Trị Cơ Sở Dữ Liệu (PostgreSQL & pgAdmin)](#6-quản-trị-cơ-sở-dữ-liệu-postgresql--pgadmin)
7. [Đồng Bộ Dự Án Trên Nhiều Máy Tính (Git Workflow)](#7-đồng-bộ-dự-án-trên-nhiều-máy-tính-git-workflow)
8. [Lộ Trình Mở Rộng Tiếp Theo (Spring Security & Spring AI)](#8-lộ-trình-mở-rộng-tiếp-theo-spring-security--spring-ai)

---

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Ban đầu, hệ thống được cấu hình trong một file `docker-compose.yml` đơn khối (Monolithic). Theo yêu cầu phân tách độc lập (Decoupling) nhằm phục vụ môi trường làm việc thực tế và triển khai độc lập (Independent Deployment), dự án đã được chuyển đổi:

*   **Tách rời vòng đời (Lifecycle Decoupling)**: Mỗi dịch vụ có thể bật, tắt, khởi động lại hoặc nâng cấp (rebuild) mà không làm gián đoạn hay sập các dịch vụ còn lại.
*   **Phân chia trách nhiệm rõ ràng**: Đội ngũ Backend, Frontend, Database có thể làm việc trên môi trường riêng của mình mà không cần khởi chạy toàn bộ mã nguồn nặng nề.
*   **Kết nối qua External Network**: Sử dụng một Docker Network chung do quản trị viên thiết lập từ trước (`external: true`) làm cầu nối cho cả 3 container.

---

## 2. KIẾN TRÚC MẠNG & CƠ CHẾ PHÂN GIẢI DNS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MÁY TÍNH CHỦ (HOST)                                    │
│                                                                                        │
│   Trình duyệt (Browser)                        pgAdmin / DBeaver                       │
│     │ http://localhost:3000                      │ localhost:5433                      │
│     ▼                                            ▼                                     │
│  ┌──────────────────────── miniapp-network (External Network) ──────────────────────┐  │
│  │                                                                                  │  │
│  │  ┌─────────────────────────┐                                                     │  │
│  │  │    miniapp-frontend     │  Port Host: 3000 -> Container: 80                   │  │
│  │  │     (Nginx + React)     │                                                     │  │
│  │  │                         │                                                     │  │
│  │  │  /api/*  (Proxy Pass)   │───┐                                                 │  │
│  │  └─────────────────────────┘   │                                                 │  │
│  │                                │ http://miniapp-backend:8080                     │  │
│  │                                ▼                                                 │  │
│  │  ┌─────────────────────────┐                                                     │  │
│  │  │    miniapp-backend      │  Port Host: 8080 -> Container: 8080                 │  │
│  │  │   (Spring Boot JAR)     │  Network Alias: miniapp-backend                     │  │
│  │  │                         │                                                     │  │
│  │  │  Spring Data JDBC       │───┐                                                 │  │
│  │  └─────────────────────────┘   │                                                 │  │
│  │                                │ jdbc:postgresql://postgres:5432/todo_db         │  │
│  │                                ▼                                                 │  │
│  │  ┌─────────────────────────┐                                                     │  │
│  │  │    miniapp-postgres     │  Port Host: 5433 -> Container: 5432                 │  │
│  │  │     (PostgreSQL 17)     │  Network Alias: postgres                            │  │
│  │  │                         │                                                     │  │
│  │  │  Healthcheck pg_isready │                                                     │  │
│  │  └────────────┬────────────┘                                                     │  │
│  │               │                                                                  │  │
│  └───────────────┼──────────────────────────────────────────────────────────────────┘  │
│                  ▼                                                                     │
│        ./postgres-data (Thư mục dữ liệu bền vững trên máy Host)                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Nguyên lý kết nối nội bộ (Docker Embedded DNS):
1. **Frontend -> Backend**: File cấu hình Nginx `frontend/nginx.conf` chuyển tiếp request `/api/` tới địa chỉ `http://miniapp-backend:8080/api/`. Docker DNS sẽ phân giải tên `miniapp-backend` thành địa chỉ IP nội bộ của container backend.
2. **Backend -> Database**: Backend đọc biến môi trường `DB_URL=jdbc:postgresql://postgres:5432/todo_db`. Nhờ cấu hình `aliases: - postgres` trong file của PostgreSQL, Docker nhận diện được tên miền `postgres` và chuyển hướng kết nối chính xác vào cổng nội bộ `5432`.

---

## 3. CẤU TRÚC THƯ MỤC & CÁC FILE CẤU HÌNH

```text
docker_T/
├── docker-compose.postgres.yml    # File compose quản lý riêng PostgreSQL
├── docker-compose.backend.yml     # File compose quản lý riêng Spring Boot
├── docker-compose.frontend.yml    # File compose quản lý riêng React + Nginx
├── docker-compose.yml             # (File gốc dùng chạy gộp nếu cần)
├── init.sql                       # Script khởi tạo cấu trúc bảng và dữ liệu mẫu
├── dump.sql                       # File sao lưu dữ liệu
├── postgres-data/                 # Thư mục bind mount chứa dữ liệu vật lý của DB
├── IMPLEMENT.md                   # Tài liệu hướng dẫn triển khai hệ thống (file này)
├── README.md                      # Tài liệu mô tả dự án ban đầu
├── .gitignore                     # Cấu hình bỏ qua thư mục dữ liệu và build
│
├── backend/                       # Source code ứng dụng Spring Boot
│   ├── src/                       # Mã nguồn Java REST API
│   ├── pom.xml                    # Quản lý thư viện Maven
│   └── Dockerfile                 # Đóng gói Multi-stage build cho Spring Boot
│
└── frontend/                      # Source code ứng dụng React
    ├── src/                       # Mã nguồn React UI
    ├── nginx.conf                 # Cấu hình Web Server Nginx & Reverse Proxy
    ├── package.json               # Quản lý dependencies JavaScript
    └── Dockerfile                 # Đóng gói Multi-stage build cho React + Nginx
```

---

## 4. CHI TIẾT CẤU HÌNH 3 DỊCH VỤ

### 4.1. Dịch Vụ 1: Database (`docker-compose.postgres.yml`)
*   **Image**: `postgres:17-alpine`
*   **Port Mapping**: `5433:5432` (Ánh xạ cổng `5433` máy host vào `5432` trong container để tránh xung đột nếu máy đã cài sẵn PostgreSQL local).
*   **Persistent Storage (Volume)**:
    *   `./postgres-data:/var/lib/postgresql/data`: Lưu trữ dữ liệu lâu dài.
    *   `./init.sql:/docker-entrypoint-initdb.d/init.sql`: Tự động nạp bảng và dữ liệu khởi tạo lần đầu.
*   **Network Alias**: `postgres` (Bảo đảm Backend truy cập được qua tên miền này).
*   **Healthcheck**: Giám sát dịch vụ sẵn sàng qua công cụ `pg_isready`.

### 4.2. Dịch Vụ 2: Backend API (`docker-compose.backend.yml`)
*   **Build Context**: Thư mục `./backend` (Multi-stage Dockerfile: JDK 21 Alpine đóng gói JAR và chạy trên JRE 21 nhẹ).
*   **Port Mapping**: `8080:8080`.
*   **Biến môi trường**:
    *   `DB_URL`: `jdbc:postgresql://postgres:5432/todo_db`
    *   `DB_USERNAME`: `todo_user`
    *   `DB_PASSWORD`: `"123456"`
*   **Network Alias**: `miniapp-backend` (Phục vụ Reverse Proxy từ Frontend).

### 4.3. Dịch Vụ 3: Frontend UI (`docker-compose.frontend.yml`)
*   **Build Context**: Thư mục `./frontend` (Multi-stage Dockerfile: Node 20 build Vite assets, chuyển sang Nginx Alpine phục vụ tĩnh).
*   **Port Mapping**: `3000:80` (Người dùng truy cập vào cổng 3000 máy host).
*   **Cơ chế Nginx**: Điều phối SPA routing (`try_files $uri $uri/ /index.html`) và chuyển tiếp `/api/` về container Backend.

---

## 5. QUY TRÌNH KHỞI ĐỘNG & VẬN HÀNH

Mở Terminal (PowerShell hoặc Bash) tại thư mục gốc của dự án (`docker_T`).

### Bước 5.1: Khởi tạo Network chung (Chỉ chạy 1 lần duy nhất)
```powershell
docker network create miniapp-network
```
*(Nếu mạng đã tồn tại từ trước, hệ thống sẽ thông báo và bạn có thể chuyển ngay sang bước tiếp theo).*

---

### Bước 5.2: Khởi động lần lượt các dịch vụ

#### 1. Khởi động PostgreSQL:
```powershell
docker compose -f docker-compose.postgres.yml up -d
```
> *Lưu ý: Chờ khoảng 5–10 giây để CSDL khởi động và nạp xong file `init.sql`.*

#### 2. Khởi động Spring Boot Backend:
```powershell
docker compose -f docker-compose.backend.yml up -d --build
```
> *Cờ `--build` đảm bảo Docker đóng gói lại source code Java mới nhất.*

#### 3. Khởi động React Frontend:
```powershell
docker compose -f docker-compose.frontend.yml up -d --build
```

Sau khi hoàn tất, mở trình duyệt web và truy cập: **`http://localhost:3000`**

---

### Bước 5.3: Bật / Tắt theo từng kịch bản làm việc

| Nhu cầu làm việc | Lệnh thực thi |
| :--- | :--- |
| **Chỉ làm việc với Database (SQL / pgAdmin)** | `docker compose -f docker-compose.postgres.yml up -d` |
| **Lập trình và test API Backend bằng Postman** | `docker compose -f docker-compose.postgres.yml up -d`<br>`docker compose -f docker-compose.backend.yml up -d` |
| **Sửa code Java và khởi động lại chỉ Backend** | `docker compose -f docker-compose.backend.yml up -d --build` |
| **Tắt riêng dịch vụ Frontend** | `docker compose -f docker-compose.frontend.yml down` |
| **Bật cả 3 dịch vụ cùng lúc bằng 1 lệnh ghép** | `docker compose -f docker-compose.postgres.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml up -d` |
| **Tắt toàn bộ hệ thống** | `docker compose -f docker-compose.postgres.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml down` |

---

## 6. QUẢN TRỊ CƠ SỞ DỮ LIỆU (POSTGRESQL & PGADMIN)

### 6.1. Xem dữ liệu nhanh qua Terminal
Truy vấn trực tiếp danh sách công việc trong bảng `todos`:
```powershell
docker exec -it miniapp-postgres psql -U todo_user -d todo_db -c "SELECT * FROM todos;"
```

Vào giao diện dòng lệnh `psql` tương tác:
```powershell
docker exec -it miniapp-postgres psql -U todo_user -d todo_db
```
*(Gõ `\dt` để liệt kê bảng, gõ `\q` để thoát).*

### 6.2. Kết nối từ phần mềm đồ họa (pgAdmin 4 / DBeaver)
*   **Host**: `localhost` (hoặc `127.0.0.1`)
*   **Port**: `5433` *(Quan trọng: Không dùng cổng mặc định 5432)*
*   **Database**: `todo_db`
*   **Username**: `todo_user`
*   **Password**: `123456`
*   **Đường dẫn xem bảng**: `Servers -> [Tên Server] -> Databases -> todo_db -> Schemas -> public -> Tables -> todos`.

---

## 7. ĐỒNG BỘ DỰ ÁN TRÊN NHIỀU MÁY TÍNH (GIT WORKFLOW)

Dự án đã được cấu hình [.gitignore](file:///d:/HUYNH-IT/ki_7/JAVA/docker_T/.gitignore) chuẩn: loại trừ thư mục lưu trữ CSDL `postgres-data/`, thư mục thư viện `node_modules/` và thư mục build `target/` để giữ repository luôn nhẹ và an toàn.

### Khi đẩy mã nguồn từ máy hiện tại (Máy 1):
```powershell
git add .
git commit -m "Tach docker compose thanh 3 service doc lap kem tai lieu IMPLEMENT.md"
git push origin main
```

### Khi chuyển sang máy khác (Máy 2):
1. **Kéo code về**:
   ```powershell
   git pull origin main
   ```
2. **Bật Docker Desktop** trên máy 2.
3. **Tạo mạng Docker** (chỉ cần làm lần đầu trên máy 2):
   ```powershell
   docker network create miniapp-network
   ```
4. **Khởi chạy hệ thống**:
   ```powershell
   docker compose -f docker-compose.postgres.yml up -d
   docker compose -f docker-compose.backend.yml up -d --build
   docker compose -f docker-compose.frontend.yml up -d --build
   ```

---

## 8. LỘ TRÌNH MỞ RỘNG TIẾP THEO (SPRING SECURITY & SPRING AI)

1. **Giai đoạn 1: Tích hợp Spring Security & JWT**
   *   Tạo bảng `users` (`id`, `username`, `password`, `role`).
   *   Cài đặt `BCryptPasswordEncoder` để mã hóa mật khẩu.
   *   Cấu hình `SecurityFilterChain` mở public `/api/auth/**`, bắt buộc JWT Token cho các endpoint còn lại.
2. **Giai đoạn 2: Tích hợp Spring AI Chatbot**
   *   Tích hợp Spring AI Starter (kết nối OpenAI / Google Gemini / Ollama).
   *   Tạo `AiService` nhận diện câu hỏi của người dùng và sinh câu trả lời.
3. **Giai đoạn 3: Phân Quyền & Lưu Ngữ Cảnh Hội Thoại**
   *   Chỉ cho phép user đã đăng nhập sử dụng tính năng AI.
   *   Lưu lịch sử hội thoại (`conversations`, `chat_messages`) theo từng `user_id` trong PostgreSQL.
