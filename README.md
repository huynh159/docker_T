# 🐳 DOCKER MINI APP - HUỚNG DẪN DOCKER COMPOSE CHO NGƯỜI MỚI HỌC

> **Hệ thống Fullstack Todo App với React (Nginx), Spring Boot và PostgreSQL được đóng gói hoàn toàn bằng Docker Compose.**

---

## 📌 PHẦN 1: GIỚI THIỆU PROJECT

Project **Docker Mini App** là một ứng dụng Todo App đầy đủ (Fullstack) giúp người mới bắt đầu học lập trình nắm vững cách kết nối và quản lý nhiều dịch vụ thông qua Docker:

*   **Frontend**: React (Vite) + Vanilla CSS, build thành static files và phục vụ bằng **Nginx** reverse proxy (chạy ở port `3000`).
*   **Backend**: Spring Boot (Java 21) REST API với **Spring Data JDBC** (chạy ở port `8080`).
*   **Database**: **PostgreSQL 17** lưu trữ dữ liệu các công việc (chạy ở port `5432`).
*   **Điều phối**: **Docker Compose** quản lý tự động cả 3 container, mạng nội bộ (`miniapp-network`) và volume lưu trữ (`miniapp-postgres-data`).

---

## 🏗️ PHẦN 2: KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MÁY TÍNH CỦA BẠN (HOST)                        │
│                                                                        │
│   Browser (Chrome / Firefox)                                           │
│       │                                                                │
│       │  http://localhost:3000                                          │
│       ▼                                                                │
│  ┌──────────────── miniapp-network (Docker Network) ─────────────┐    │
│  │                                                               │    │
│  │  ┌─────────────────────────┐                                  │    │
│  │  │    miniapp-frontend     │  Port mapping: 3000 -> 80        │    │
│  │  │    (Nginx + React)      │                                  │    │
│  │  │                         │                                  │    │
│  │  │  /        -> React SPA  │                                  │    │
│  │  │  /api/*   -> Proxy      │──────┐                           │    │
│  │  └─────────────────────────┘      │                           │    │
│  │                                   │ http://miniapp-backend:8080│    │
│  │                                   ▼                           │    │
│  │  ┌─────────────────────────┐                                  │    │
│  │  │    miniapp-backend      │  Port mapping: 8080 -> 8080      │    │
│  │  │    (Spring Boot JAR)    │                                  │    │
│  │  │                         │                                  │    │
│  │  │  REST Controllers       │                                  │    │
│  │  │  Spring Data JDBC       │──────┐                           │    │
│  │  └─────────────────────────┘      │                           │    │
│  │                                   │ jdbc:postgresql://postgres│    │
│  │                                   │ :5432/todo_db             │    │
│  │                                   ▼                           │    │
│  │  ┌─────────────────────────┐                                  │    │
│  │  │    miniapp-postgres     │  Port mapping: 5432 -> 5432      │    │
│  │  │    (PostgreSQL 17)      │                                  │    │
│  │  │                         │                                  │    │
│  │  │    Database: todo_db    │                                  │    │
│  │  │    Table: todos         │                                  │    │
│  │  └────────────┬────────────┘                                  │    │
│  │               │                                               │    │
│  └───────────────┼───────────────────────────────────────────────┘    │
│                  ▼                                                    │
│        ./postgres-data (Thư mục trên máy thật - Host Bind Mount)      │
│        -> Lưu trữ trực tiếp file dữ liệu database trên ổ đĩa máy      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 PHẦN 3: CÁC KHÁI NIỆM DOCKER CƠ BẢN (CHO NGƯỜI MỚI HỌC)

### 1. Docker là gì?
Docker là nền tảng ảo hóa mức container (containerization), giúp đóng gói ứng dụng cùng với tất cả môi trường, thư viện cần thiết vào một đơn vị duy nhất. Nhờ Docker, ứng dụng chạy giống hệt nhau trên máy dev, máy đồng nghiệp, hay server sản xuất mà không gặp lỗi "trên máy tôi vẫn chạy bình thường".

### 2. Docker Image là gì?
Image là **bản khuôn mẫu (template)** chứa code, môi trường thực thi, thư viện và cấu hình. Nó giống như **file ISO cài Windows** hay một bản thiết kế ngôi nhà. Image ở trạng thái read-only (chỉ đọc).

### 3. Docker Container là gì?
Container là **một phiên bản đang chạy (instance)** được tạo ra từ Docker Image. Nếu Image là file ISO thì Container chính là hệ điều hành đang chạy sau khi cài đặt. Container hoạt động cô lập hoàn toàn với máy tính chủ và các container khác.

### 4. Docker Network là gì?
Docker Network là **mạng ảo nội bộ** do Docker tạo ra để các container có thể giao tiếp với nhau. Nhờ tính năng Docker DNS tích hợp, các container trong cùng một network có thể gọi nhau bằng **tên service / container_name** (ví dụ: `postgres:5432` hoặc `miniapp-backend:8080`) thay vì dùng IP cố định.

### 5. Docker Volume là gì?
Mặc định, dữ liệu tạo ra bên trong Container sẽ bị mất sạch khi Container bị xóa. **Docker Volume** là giải pháp lưu trữ dữ liệu bền vững (persistent data) nằm bên ngoài container trên ổ đĩa của máy host. Khi mount Volume vào Container, dữ liệu database vẫn an toàn tuyệt đối kể cả khi container bị stop hay delete.

### 6. Docker Compose là gì?
Docker Compose là công cụ giúp định nghĩa và quản lý **nhiều container (multi-container application)** thông qua một file cấu hình duy nhất: `docker-compose.yml`.

---

## 🔄 PHẦN 4: SO SÁNH TRƯỚC VÀ SAU KHI DÙNG DOCKER COMPOSE

### ❌ TRƯỚC ĐÂY (Docker CLI thủ công):
Bạn phải gõ và ghi nhớ hàng loạt câu lệnh dài dòng theo đúng thứ tự:
```bash
# 1. Tạo network
docker network create miniapp-network

# 2. Tạo volume
docker volume create miniapp-postgres-data

# 3. Chạy PostgreSQL container
docker run -d --name miniapp-postgres --network miniapp-network -v miniapp-postgres-data:/var/lib/postgresql/data -e POSTGRES_DB=todo_db -e POSTGRES_USER=todo_user -e POSTGRES_PASSWORD=123456 -p 5432:5432 postgres:17-alpine

# 4. Build & Chạy Backend container
docker build -t miniapp-backend ./backend
docker run -d --name miniapp-backend --network miniapp-network -p 8080:8080 miniapp-backend

# 5. Build & Chạy Frontend container
docker build -t miniapp-frontend ./frontend
docker run -d --name miniapp-frontend --network miniapp-network -p 3000:80 miniapp-frontend
```
*Nhược điểm:* Rất tốn thời gian, dễ nhầm lẫn tên network, sai tham số, và phải tự quản lý thứ tự khởi động.

---

### ✅ SAU KHI DÙNG DOCKER COMPOSE:
Toàn bộ cấu hình trên được lưu vào `docker-compose.yml`. Bạn chỉ cần đúng **1 câu lệnh**:
```bash
docker compose up -d
```
Docker Compose sẽ tự động:
1. Tạo network & kết nối volume.
2. Tự build image cho `frontend` và `backend`.
3. Kiểm tra healthcheck của PostgreSQL cho tới khi **healthy** mới cho `backend` khởi động.
4. Quản lý toàn bộ 3 dịch vụ cùng một lúc.

> **Lưu ý:** Docker Compose KHÔNG thay thế Docker Engine. Compose là lớp công cụ điều phối nằm trên Docker Engine để quản lý ứng dụng tiện lợi hơn.

---

## 📄 PHẦN 5: GIẢI THÍCH CHI TIẾT FILE `docker-compose.yml`

File `docker-compose.yml` trong project:

```yaml
services:
  # ============================================
  # SERVICE 1: PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:17-alpine
    container_name: miniapp-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: todo_db
      POSTGRES_USER: todo_user
      POSTGRES_PASSWORD: "123456"
    volumes:
      - miniapp-postgres-data:/var/lib/postgresql/data
    networks:
      - miniapp-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U todo_user -d todo_db"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  # ============================================
  # SERVICE 2: Spring Boot Backend
  # ============================================
  backend:
    build:
      context: ./backend
    container_name: miniapp-backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/todo_db
      DB_USERNAME: todo_user
      DB_PASSWORD: "123456"
    networks:
      - miniapp-network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  # ============================================
  # SERVICE 3: React Frontend (Nginx)
  # ============================================
  frontend:
    build:
      context: ./frontend
    container_name: miniapp-frontend
    ports:
      - "3000:80"
    networks:
      - miniapp-network
    depends_on:
      - backend
    restart: unless-stopped

networks:
  miniapp-network:
    name: miniapp-network
    external: true

volumes:
  miniapp-postgres-data:
    name: miniapp-postgres-data
    external: true
```

### Giải thích các từ khóa (Directives):

*   **`services`**: Định nghĩa danh sách các container sẽ chạy trong hệ thống.
*   **`build`**: Chỉ định thư mục chứa `Dockerfile` để Compose tự động build image.
*   **`image`**: Tên Docker Image sẵn có trên Docker Hub (như `postgres:17-alpine`).
*   **`container_name`**: Đặt tên cố định cho Container khi khởi chạy.
*   **`ports`**: Cấu hình port mapping theo cú pháp `"HOST_PORT:CONTAINER_PORT"`.
*   **`environment`**: Các biến môi trường truyền vào bên trong container.
*   **`volumes`**: Mount volume từ máy host vào thư mục bên trong container.
*   **`networks`**: Khai báo container thuộc mạng nội bộ nào.
*   **`healthcheck`**: Kiểm tra container đã thực sự sẵn sàng hoạt động hay chưa (dùng `pg_isready` để kiểm tra kết nối DB).
*   **`depends_on`**: Kiểm soát thứ tự khởi động (`backend` chỉ chạy sau khi `postgres` đạt trạng thái `healthy`).
*   **`external: true`**: Cho Compose biết volume hoặc network này đã tồn tại sẵn, hãy tái sử dụng lại chứ **không được tạo mới hoặc xóa đi**.

---

## 🌐 PHẦN 6: GIẢI THÍCH KẾT NỐI MẠNG (NETWORKING & PROXY)

### 1. Tại sao Backend KHÔNG dùng `localhost:5432`?
Khi Backend chạy trong Docker Container, `localhost` đại diện cho **chính container Backend đó**. Bên trong Backend không cài PostgreSQL, nên gọi `localhost:5432` sẽ bị lỗi từ chối kết nối.
 Backend dùng service name của Compose: `jdbc:postgresql://postgres:5432/todo_db`. Docker DNS sẽ tự động dịch tên `postgres` thành IP nội bộ của container PostgreSQL.

### 2. Tại sao Frontend trên Browser KHÔNG gọi trực tiếp `http://miniapp-backend:8080`?
Browser chạy trên máy tính cá nhân của bạn (Windows host), **không nằm trong Docker network**. Máy tính cá nhân không hiểu tên miền nội bộ `miniapp-backend`.

Do đó, kiến trúc chuẩn là:
1. Browser gọi đường dẫn tương đối `/api/todos` về Nginx (port `3000`).
2. Nginx chạy bên trong container Frontend (nằm trong `miniapp-network`) sẽ đứng ra proxy request này tới `http://miniapp-backend:8080/api/todos`.
3. Backend xử lý xong trả kết quả cho Nginx, Nginx trả về cho Browser.

---

## 🚀 PHẦN 7: QUY TRÌNH CHẠY PROJECT BẰNG DOCKER COMPOSE

### Bước 1: Mở Terminal tại thư mục project
```bash
cd D:\HUYNH\test\docker-mini-app
```

### Bước 2: Kiểm tra cú pháp file docker-compose.yml
```bash
docker compose config
```

### Bước 3: Build toàn bộ Docker Image
```bash
docker compose build
```

### Bước 4: Khởi chạy toàn bộ hệ thống ở chế độ ngầm (detached mode)
```bash
docker compose up -d
```

### Bước 5: Kiểm tra trạng thái các container đang chạy
```bash
docker compose ps
```
*Kết quả hiển thị 3 service đang Up (trong đó postgres ở trạng thái healthy).*

### Bước 6: Truy cập ứng dụng trên Trình duyệt
*   **Giao diện Frontend**: [http://localhost:3000](http://localhost:3000)
*   **API Backend trực tiếp**: [http://localhost:8080/api/todos](http://localhost:8080/api/todos)
*   **API Hello Test**: [http://localhost:8080/api/hello](http://localhost:8080/api/hello)

---

## 🛠️ PHẦN 8: CÁC CÂU LỆNH DOCKER COMPOSE THƯỜNG DÙNG

| Câu lệnh | Công dụng |
|---|---|
| `docker compose up -d` | Tạo và khởi chạy toàn bộ container ở chế độ chạy ngầm |
| `docker compose down` | Dừng và xóa các container, network (vẫn GIỮ NGUYÊN volume dữ liệu) |
| `docker compose ps` | Liệt kê danh sách container đang quản lý bởi Compose |
| `docker compose logs -f` | Xem log trực tiếp thời gian thực của tất cả container |
| `docker compose logs backend` | Xem log riêng của service backend |
| `docker compose restart` | Khởi động lại tất cả các container |
| `docker compose stop` | Tạm dừng các container (không xóa container) |
| `docker compose start` | Tiếp tục chạy các container đang tạm dừng |
| `docker compose build` | Rebuild lại image khi có thay đổi code ở Frontend/Backend |

---

## ⚠️ PHẦN 9: PHÂN BIỆT `docker compose down` VÀ `docker compose down -v`

> [!CAUTION]
> **CỰC KỲ QUAN TRỌNG:**
> *   `docker compose down`: Chỉ dừng và xóa container + network. **Dữ liệu trong Database Volume VẪN CÒN NGUYÊN.**
> *   `docker compose down -v`: Dừng container VÀ XÓA LUÔN VOLUME DỮ LIỆU (`miniapp-postgres-data`). **TOÀN BỘ DỮ LIỆU DATABASE SẼ BỊ MẤT VĨNH VIỄN!**
>
> ❌ **KHÔNG BAO GIỜ** sử dụng flag `-v` ngoại trừ khi bạn muốn xóa sạch dữ liệu để làm lại từ đầu.

---

## 🔍 PHẦN 10: HƯỚNG DẪN DEBUG LỖI THƯỜNG GẶP

### 1. Frontend không mở được trên `http://localhost:3000`
*   **Kiểm tra**: Chạy `docker compose ps` xem container `miniapp-frontend` có đang `Up` không.
*   **Xem log**: `docker compose logs frontend`

### 2. Backend không chạy hoặc bị văng (Crash)
*   **Xem log**: `docker compose logs backend`
*   **Nguyên nhân thường gặp**: PostgreSQL chưa khởi động xong mà Backend đã kết nối. Hãy đảm bảo đã thêm `healthcheck` cho PostgreSQL trong `docker-compose.yml`.

### 3. API trả lỗi 502 Bad Gateway trên Frontend
*   **Nguyên nhân**: Nginx không kết nối được tới Backend.
*   **Kiểm tra**: Backend đã chạy thành công chưa (`docker compose logs backend`), và cấu hình `proxy_pass` trong `nginx.conf` đã khớp với tên container `miniapp-backend` chưa.

### 4. Database kết nối thất bại
*   **Kiểm tra**: Đảm bảo tên database, username, password trong `docker-compose.yml` trùng khớp với thông tin kết nối trong `application.properties`.

### 5. Dữ liệu không lưu khi khởi động lại
*   **Kiểm tra**: Đảm bảo `docker-compose.yml` đã mount volume `miniapp-postgres-data:/var/lib/postgresql/data` cho service `postgres`.
#   d o c k e r _ T  
 