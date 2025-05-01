# WAIEDU - Hệ thống Quản lý Dự án

Hệ thống quản lý dự án và nhân sự cho WAIEDU, giúp theo dõi các dự án, công việc và thành viên trong đội nhóm.

## Cấu trúc Dự án

```
├── index.html                # Trang đăng nhập
├── scripts.js                # JavaScript chung cho trang đăng nhập
├── styles.css                # CSS chung cho trang đăng nhập
├── forgot-password.html      # Trang quên mật khẩu
├── register.html             # Trang đăng ký người dùng mới
├── admin/                    # Thư mục chứa trang quản trị
│   ├── admin.css             # CSS cho trang quản trị
│   ├── admin.js              # JS cho trang quản trị
│   ├── create-user.html      # Trang tạo người dùng mới
│   ├── create-user.js        # JS xử lý tạo người dùng
│   ├── dashboard.html        # Trang tổng quan quản trị viên
│   ├── dashboard.js          # JS xử lý dashboard admin
│   ├── projects.html         # Trang quản lý dự án (admin)
│   ├── projects.js           # JS xử lý quản lý dự án (admin)
│   ├── team-members.html     # Trang quản lý thành viên
│   ├── team-members.js       # JS xử lý quản lý thành viên
│   ├── roles.html            # Trang quản lý vai trò người dùng
│   ├── roles.js              # JS xử lý quản lý vai trò
│   ├── reports.html          # Trang báo cáo và thống kê
│   └── reports.js            # JS xử lý báo cáo và thống kê
├── api/                      # API backend
│   ├── change-password.php   # API đổi mật khẩu
│   ├── login.php             # API đăng nhập
│   ├── register.php          # API đăng ký
│   ├── reset-admin.php       # API reset mật khẩu admin
│   ├── forgot-password.php   # API quên mật khẩu
│   ├── reset-password.php    # API đặt lại mật khẩu
│   ├── profile-update.php    # API cập nhật thông tin cá nhân
│   ├── projects/             # API liên quan đến dự án
│   │   ├── list.php          # Lấy danh sách dự án
│   │   ├── detail.php        # Lấy chi tiết dự án
│   │   ├── create.php        # Tạo dự án mới
│   │   ├── update.php        # Cập nhật dự án
│   │   └── delete.php        # Xóa dự án
│   ├── tasks/                # API liên quan đến công việc
│   │   ├── list.php          # Lấy danh sách công việc
│   │   ├── detail.php        # Lấy chi tiết công việc
│   │   ├── create.php        # Tạo công việc mới
│   │   ├── update.php        # Cập nhật công việc
│   │   └── delete.php        # Xóa công việc
│   ├── members/              # API liên quan đến thành viên
│   │   ├── list.php          # Lấy danh sách thành viên
│   │   ├── update.php        # Cập nhật thông tin thành viên
│   │   └── delete.php        # Xóa thành viên
│   ├── notifications/        # API liên quan đến thông báo
│   │   ├── list.php          # Lấy danh sách thông báo
│   │   ├── mark-read.php     # Đánh dấu đã đọc
│   │   └── create.php        # Tạo thông báo mới
│   ├── calendar/             # API liên quan đến lịch
│   │   ├── events.php        # Lấy danh sách sự kiện
│   │   ├── create-event.php  # Tạo sự kiện mới
│   │   └── update-event.php  # Cập nhật sự kiện
│   ├── reports/              # API báo cáo và thống kê
│   │   ├── project-stats.php # Thống kê dự án
│   │   ├── user-stats.php    # Thống kê người dùng
│   │   └── team-stats.php    # Thống kê nhóm
│   ├── files/                # API quản lý tệp
│   │   ├── upload.php        # Tải tệp lên
│   │   ├── download.php      # Tải tệp xuống
│   │   └── delete.php        # Xóa tệp
│   └── attendance/           # API quản lý chấm công
│       ├── check-in.php      # API chấm công vào
│       ├── check-out.php     # API chấm công ra
│       └── report.php        # Báo cáo chấm công
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
        ├── index.html        # Trang dashboard
        ├── projects.html     # Trang quản lý dự án
        ├── projects.js       # JS xử lý dự án
        ├── project-detail.html # Trang chi tiết dự án
        ├── project-detail.js # JS xử lý chi tiết dự án
        ├── tasks.html        # Trang quản lý công việc
        ├── tasks.js          # JS xử lý công việc
        ├── task-detail.html  # Trang chi tiết công việc
        ├── task-detail.js    # JS xử lý chi tiết công việc
        ├── team.html         # Trang quản lý đội nhóm
        ├── team.js           # JS xử lý đội nhóm
        ├── settings.html     # Trang cài đặt
        ├── settings.js       # JS xử lý cài đặt
        ├── calendar.html     # Trang lịch làm việc
        ├── calendar.js       # JS xử lý lịch
        ├── notifications.html # Trang thông báo
        ├── notifications.js  # JS xử lý thông báo
        ├── profile.html      # Trang hồ sơ cá nhân
        ├── profile.js        # JS xử lý hồ sơ
        ├── reports.html      # Trang báo cáo
        ├── reports.js        # JS xử lý báo cáo
        ├── attendance.html   # Trang chấm công
        ├── attendance.js     # JS xử lý chấm công
        ├── files.html        # Trang quản lý tệp
        ├── files.js          # JS xử lý tệp
        ├── help.html         # Trang trợ giúp
        └── help.js           # JS xử lý trợ giúp
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

10. **Trang Hồ sơ Cá nhân (`src/dashboard/profile.html`)**
    - [ ] Tạo trang hồ sơ cá nhân
    - [ ] Hiển thị và sửa thông tin cá nhân
    - [ ] Upload và thay đổi ảnh đại diện
    - [ ] Hiển thị lịch sử hoạt động
    - [ ] Hiển thị dự án và công việc đang tham gia

11. **Trang Lịch (`src/dashboard/calendar.html`)**
    - [ ] Tạo trang lịch làm việc
    - [ ] Hiển thị deadline dự án và công việc
    - [ ] Thêm sự kiện, cuộc họp
    - [ ] Chế độ xem: ngày, tuần, tháng
    - [ ] Thông báo nhắc nhở sự kiện

12. **Trang Thông báo (`src/dashboard/notifications.html`)**
    - [ ] Tạo trang quản lý thông báo
    - [ ] Hiển thị danh sách thông báo
    - [ ] Đánh dấu đã đọc/chưa đọc
    - [ ] Lọc thông báo theo loại
    - [ ] Cài đặt tùy chọn nhận thông báo

13. **Trang Báo cáo (`src/dashboard/reports.html`)**
    - [ ] Tạo trang báo cáo thống kê
    - [ ] Biểu đồ hiệu suất dự án
    - [ ] Báo cáo thời gian làm việc
    - [ ] Báo cáo tiến độ theo nhóm/cá nhân
    - [ ] Xuất báo cáo dưới dạng PDF

14. **Trang Chấm công (`src/dashboard/attendance.html`)**
    - [ ] Tạo trang chấm công
    - [ ] Chức năng chấm công vào/ra
    - [ ] Hiển thị lịch sử chấm công
    - [ ] Tính toán giờ làm việc
    - [ ] Báo cáo chấm công theo tháng

15. **Trang Quản lý Tệp (`src/dashboard/files.html`)**
    - [ ] Tạo trang quản lý tệp
    - [ ] Upload, tải xuống tệp
    - [ ] Phân loại tệp theo dự án/công việc
    - [ ] Chia sẻ tệp với thành viên
    - [ ] Kiểm soát phiên bản tệp

16. **Trang Trợ giúp (`src/dashboard/help.html`)**
    - [ ] Tạo trang trợ giúp
    - [ ] Hướng dẫn sử dụng hệ thống
    - [ ] FAQ - Các câu hỏi thường gặp
    - [ ] Form liên hệ hỗ trợ
    - [ ] Video hướng dẫn

17. **Trang Đăng ký (`register.html`)**
    - [ ] Tạo trang đăng ký tài khoản
    - [ ] Form nhập thông tin cá nhân
    - [ ] Xác thực email
    - [ ] Chọn vai trò trong hệ thống
    - [ ] Chấp nhận điều khoản sử dụng

18. **Trang Quản lý Vai trò (`admin/roles.html`)**
    - [ ] Tạo trang quản lý vai trò người dùng
    - [ ] Thêm, sửa, xóa vai trò
    - [ ] Phân quyền cho từng vai trò
    - [ ] Gán vai trò cho người dùng
    - [ ] Kiểm tra quyền hạn của từng vai trò

19. **Trang Báo cáo Admin (`admin/reports.html`)**
    - [ ] Tạo trang báo cáo cho admin
    - [ ] Thống kê tổng quan hệ thống
    - [ ] Báo cáo hiệu suất theo dự án/nhóm
    - [ ] Biểu đồ phân tích xu hướng
    - [ ] Xuất báo cáo dưới nhiều định dạng

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

4. **Trang Đăng ký (`register.html`)**
   - [ ] Thêm xác thực mạnh cho mật khẩu
   - [ ] Tích hợp reCAPTCHA chống bot
   - [ ] Xác thực email tự động
   - [ ] Hướng dẫn người dùng mới

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

5. **API Vai trò và Phân quyền**
   - [ ] `api/roles/list.php` - Lấy danh sách vai trò
   - [ ] `api/roles/create.php` - Tạo vai trò mới
   - [ ] `api/roles/update.php` - Cập nhật vai trò
   - [ ] `api/roles/delete.php` - Xóa vai trò
   - [ ] `api/roles/assign.php` - Gán vai trò cho người dùng
   - [ ] `api/permissions/check.php` - Kiểm tra quyền hạn

6. **API Thông báo**
   - [ ] `api/notifications/list.php` - Lấy danh sách thông báo
   - [ ] `api/notifications/mark-read.php` - Đánh dấu đã đọc
   - [ ] `api/notifications/create.php` - Tạo thông báo mới
   - [ ] `api/notifications/delete.php` - Xóa thông báo

7. **API Lịch và Sự kiện**
   - [ ] `api/calendar/events.php` - Lấy danh sách sự kiện
   - [ ] `api/calendar/create-event.php` - Tạo sự kiện mới
   - [ ] `api/calendar/update-event.php` - Cập nhật sự kiện
   - [ ] `api/calendar/delete-event.php` - Xóa sự kiện

8. **API Báo cáo và Thống kê**
   - [ ] `api/reports/project-stats.php` - Thống kê dự án
   - [ ] `api/reports/user-stats.php` - Thống kê người dùng
   - [ ] `api/reports/team-stats.php` - Thống kê nhóm
   - [ ] `api/reports/export.php` - Xuất báo cáo

9. **API Quản lý Tệp**
   - [ ] `api/files/upload.php` - Tải tệp lên
   - [ ] `api/files/download.php` - Tải tệp xuống
   - [ ] `api/files/list.php` - Danh sách tệp
   - [ ] `api/files/delete.php` - Xóa tệp
   - [ ] `api/files/share.php` - Chia sẻ tệp

10. **API Chấm công**
    - [ ] `api/attendance/check-in.php` - API chấm công vào
    - [ ] `api/attendance/check-out.php` - API chấm công ra
    - [ ] `api/attendance/list.php` - Danh sách chấm công
    - [ ] `api/attendance/report.php` - Báo cáo chấm công

11. **API Bình luận và Trao đổi**
    - [ ] `api/comments/list.php` - Lấy danh sách bình luận
    - [ ] `api/comments/create.php` - Tạo bình luận mới
    - [ ] `api/comments/update.php` - Cập nhật bình luận
    - [ ] `api/comments/delete.php` - Xóa bình luận

12. **API Dashboard**
    - [ ] `api/dashboard/summary.php` - Tổng quan dashboard
    - [ ] `api/dashboard/recent-activities.php` - Hoạt động gần đây
    - [ ] `api/dashboard/stats.php` - Thống kê nhanh

## Cơ sở dữ liệu

### Cấu trúc bảng

1. **users** - Thông tin người dùng
   - id, username, email, password, full_name, role_id, avatar, created_at, updated_at, last_login, status

2. **roles** - Vai trò người dùng
   - id, name, description, permissions, created_at, updated_at

3. **projects** - Thông tin dự án
   - id, name, description, status, start_date, end_date, manager_id, client_id, budget, priority, created_at, updated_at

4. **tasks** - Công việc trong dự án
   - id, project_id, name, description, status, priority, due_date, assigned_to, created_by, created_at, updated_at

5. **project_members** - Thành viên dự án
   - id, project_id, user_id, role, joined_at

6. **comments** - Bình luận về công việc
   - id, task_id, user_id, content, created_at, updated_at

7. **files** - Tệp đính kèm
   - id, name, path, size, type, uploaded_by, project_id, task_id, uploaded_at

8. **notifications** - Thông báo
   - id, user_id, type, content, is_read, related_id, created_at

9. **events** - Sự kiện lịch
   - id, title, description, start_time, end_time, location, created_by, project_id, created_at, updated_at

10. **attendance** - Chấm công
    - id, user_id, date, check_in, check_out, total_hours, status, note

11. **teams** - Nhóm làm việc
    - id, name, description, leader_id, created_at, updated_at

12. **team_members** - Thành viên nhóm
    - id, team_id, user_id, role, joined_at

## Công nghệ sử dụng

- Frontend: HTML5, CSS3, JavaScript, Font Awesome
- Backend: PHP
- Database: MySQL
- Xác thực: LocalStorage, Session
- Thư viện bổ sung: Chart.js (biểu đồ), FullCalendar (lịch), Dropzone.js (upload tệp)
- API: RESTful API
- Bảo mật: CSRF protection, XSS prevention, Input validation

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

## Hướng dẫn sử dụng

1. **Đăng nhập**
   - Truy cập trang chủ và đăng nhập bằng tài khoản được cấp
   - Nếu quên mật khẩu, sử dụng chức năng "Quên mật khẩu"

2. **Xem Dashboard**
   - Sau khi đăng nhập, bạn sẽ được chuyển hướng đến trang Dashboard
   - Dashboard hiển thị tổng quan về dự án, công việc và thông báo

3. **Quản lý Dự án**
   - Xem danh sách dự án tại `Dự án`
   - Tạo dự án mới bằng cách nhấn nút `Thêm dự án`
   - Xem chi tiết dự án bằng cách nhấn vào tên dự án

4. **Quản lý Công việc**
   - Xem danh sách công việc tại `Công việc`
   - Tạo công việc mới bằng cách nhấn nút `Thêm công việc`
   - Cập nhật trạng thái công việc bằng cách kéo thả trong giao diện Kanban

5. **Làm việc với Đội nhóm**
   - Xem thông tin đội nhóm tại `Đội nhóm`
   - Liên lạc với thành viên thông qua hệ thống bình luận
   - Theo dõi hiệu suất của đội nhóm tại trang `Báo cáo`

## Yêu cầu hệ thống

1. **Máy chủ**
   - PHP 7.4 trở lên
   - MySQL 5.7 trở lên
   - Apache hoặc Nginx

2. **Trình duyệt hỗ trợ**
   - Chrome (phiên bản mới nhất)
   - Firefox (phiên bản mới nhất)
   - Edge (phiên bản mới nhất)
   - Safari (phiên bản mới nhất)

3. **Thiết bị**
   - Hỗ trợ đầy đủ cho máy tính (responsive)
   - Tối ưu cho tablet và điện thoại di động
