# WAIEDU - Hệ thống Quản lý Dự án

Hệ thống quản lý dự án và nhân sự cho WAIEDU, giúp theo dõi các dự án, công việc và thành viên trong đội nhóm.

## Cấu trúc Dự án

```
├── index.html                # Trang đăng nhập
├── scripts.js                # JavaScript chung cho trang đăng nhập
├── styles.css                # CSS chung cho trang đăng nhập
├── admin/                    # Thư mục chứa trang quản trị
│   ├── admin.css             # CSS cho trang quản trị
│   ├── admin.js              # JS cho trang quản trị
│   ├── create-user.html      # Trang tạo người dùng mới
│   ├── create-user.js        # JS xử lý tạo người dùng
│   ├── team-members.html     # Trang quản lý thành viên
│   └── team-members.js       # JS xử lý quản lý thành viên
├── api/                      # API backend
│   ├── change-password.php   # API đổi mật khẩu
│   ├── login.php             # API đăng nhập
│   ├── register.php          # API đăng ký
│   └── reset-admin.php       # API reset mật khẩu admin
├── assets/                   # Tài nguyên (hình ảnh, biểu tượng)
│   ├── Logo.PNG              # Logo WAIEDU
│   └── images/               # Thư mục hình ảnh
│       └── avt_guide.png     # Hình ảnh hướng dẫn avatar
├── database/                 # Scripts cơ sở dữ liệu
│   ├── project_types.sql     # Loại dự án
│   ├── schema.sql            # Cấu trúc database
│   └── team_members.sql      # Dữ liệu thành viên
└── src/                      # Mã nguồn
    └── dashboard/            # Dashboard chính
        ├── dashboard.css     # CSS dashboard
        ├── dashboard.js      # JS dashboard
        └── index.html        # Trang dashboard
```

## TODO List - Các trang cần phát triển

### Các trang cần làm và hoàn thiện

1. **Trang Dự án (`src/dashboard/projects.html`)**
   - [ ] Tạo trang hiển thị tất cả dự án
   - [ ] Thêm bộ lọc theo trạng thái dự án
   - [ ] Thêm chức năng tìm kiếm dự án
   - [ ] Hiển thị tiến độ và thời gian còn lại
   - [ ] Liên kết người phụ trách cho mỗi dự án

2. **Trang Chi tiết Dự án (`src/dashboard/project-detail.html`)**
   - [ ] Tạo trang chi tiết dự án
   - [ ] Hiển thị thông tin dự án (mô tả, deadline, nhóm phụ trách)
   - [ ] Hiển thị danh sách công việc thuộc dự án
   - [ ] Thêm biểu đồ tiến độ dự án
   - [ ] Chức năng quản lý thành viên dự án

3. **Trang Công việc (`src/dashboard/tasks.html`)**
   - [ ] Tạo trang quản lý công việc
   - [ ] Hiển thị tất cả công việc thuộc các dự án
   - [ ] Bộ lọc theo dự án, người nhận việc, trạng thái
   - [ ] Chức năng sắp xếp công việc theo deadline
   - [ ] Giao diện Kanban cho công việc (To Do, In Progress, Done)

4. **Trang Chi tiết Công việc (`src/dashboard/task-detail.html`)**
   - [ ] Tạo trang chi tiết công việc
   - [ ] Hiển thị mô tả công việc, deadline, người phụ trách
   - [ ] Thêm tính năng comment và trao đổi về công việc
   - [ ] Chức năng cập nhật trạng thái công việc
   - [ ] Tính năng tải lên tệp đính kèm

5. **Trang Đội nhóm (`src/dashboard/team.html`)**
   - [ ] Tạo trang hiển thị thông tin đội nhóm
   - [ ] Hiển thị danh sách nhóm và thành viên
   - [ ] Thống kê công việc của từng thành viên
   - [ ] Biểu đồ hiệu suất làm việc
   - [ ] Chức năng lọc theo nhóm làm việc

6. **Trang Cài đặt (`src/dashboard/settings.html`)**
   - [ ] Tạo trang cài đặt tài khoản
   - [ ] Chức năng đổi mật khẩu
   - [ ] Cập nhật thông tin cá nhân
   - [ ] Tùy chỉnh giao diện và thông báo
   - [ ] Quản lý quyền truy cập

7. **Trang Quên mật khẩu (`forgot-password.html`)**
   - [ ] Tạo trang quên mật khẩu
   - [ ] Form nhập email để xác thực
   - [ ] Gửi email khôi phục mật khẩu
   - [ ] Trang đặt lại mật khẩu sau khi xác nhận

8. **Trang Dashboard Admin (`admin/dashboard.html`)**
   - [ ] Tạo trang tổng quan cho admin
   - [ ] Hiển thị thống kê người dùng, dự án, công việc
   - [ ] Biểu đồ hoạt động hệ thống
   - [ ] Thông báo và cảnh báo từ hệ thống

9. **Trang Quản lý Dự án Admin (`admin/projects.html`)**
   - [ ] Tạo trang quản lý dự án cho admin
   - [ ] Chức năng thêm, sửa, xóa dự án
   - [ ] Phân công dự án cho các nhóm
   - [ ] Theo dõi tiến độ tổng thể của các dự án

### Tính năng cần cải thiện trên các trang hiện có

1. **Trang Đăng nhập (`index.html`)**
   - [ ] Hoàn thiện liên kết "Quên mật khẩu"
   - [ ] Tăng cường xác thực và bảo mật
   - [ ] Thêm tùy chọn đăng nhập bằng Google/Microsoft

2. **Trang Dashboard (`src/dashboard/index.html`)**
   - [ ] Hoàn thiện các liên kết trong navigation
   - [ ] Tạo trang cho từng mục (Dự án, Công việc, Đội nhóm, Cài đặt)
   - [ ] Hoàn thiện các liên kết "Xem tất cả" 
   - [ ] Liên kết các footer (Trợ giúp, Chính sách, Điều khoản)

3. **Trang Quản lý Thành viên (`admin/team-members.html`)**
   - [ ] Hoàn thiện nút "Sửa" để mở modal chỉnh sửa thông tin
   - [ ] Hoàn thiện nút "Xóa" với xác nhận xóa thành viên
   - [ ] Lưu thay đổi vào database thông qua API

### API Backend cần triển khai

1. **API Dự án**
   - [ ] `api/projects/list.php` - Lấy danh sách dự án
   - [ ] `api/projects/detail.php` - Lấy chi tiết dự án
   - [ ] `api/projects/create.php` - Tạo dự án mới
   - [ ] `api/projects/update.php` - Cập nhật dự án
   - [ ] `api/projects/delete.php` - Xóa dự án

2. **API Công việc**
   - [ ] `api/tasks/list.php` - Lấy danh sách công việc
   - [ ] `api/tasks/detail.php` - Lấy chi tiết công việc
   - [ ] `api/tasks/create.php` - Tạo công việc mới
   - [ ] `api/tasks/update.php` - Cập nhật công việc
   - [ ] `api/tasks/delete.php` - Xóa công việc

3. **API Thành viên**
   - [ ] `api/members/list.php` - Lấy danh sách thành viên
   - [ ] `api/members/update.php` - Cập nhật thông tin thành viên
   - [ ] `api/members/delete.php` - Xóa thành viên

4. **API Quản lý tài khoản**
   - [ ] `api/forgot-password.php` - Quên mật khẩu
   - [ ] `api/reset-password.php` - Đặt lại mật khẩu
   - [ ] `api/profile-update.php` - Cập nhật thông tin cá nhân

## Công nghệ sử dụng

- Frontend: HTML5, CSS3, JavaScript, Font Awesome
- Backend: PHP
- Database: MySQL
- Xác thực: LocalStorage, Session

## Thành viên dự án

- **Team Design:**
  - Nguyễn Khả Ái (Team Lead) - Designer
  - Nguyễn Ngọc Mai Anh - Designer
  - Nguyễn Hải Yến - Designer

- **Team Code:**
  - Lê Minh Hoàng - Backend Developer
  - Phạm Quốc Huy - Backend Developer

- **Team Nghiên cứu thị trường:**
  - Nguyễn Hồng Thiên Ân (Team Lead) - Market Researcher
  - Trương Trung Kiên - Market Researcher

## Hướng dẫn triển khai

1. Clone repository
2. Cài đặt XAMPP hoặc môi trường PHP tương tự
3. Import database từ thư mục `database`
4. Đặt dự án trong thư mục `htdocs` của XAMPP
5. Truy cập `http://localhost/manager_web`
