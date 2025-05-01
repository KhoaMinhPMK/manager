-- Bảng người dùng (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'manager', 'developer', 'tester', 'designer', 'market_research', 'coder') NOT NULL DEFAULT 'developer',
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng dự án (projects)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('planning', 'in_progress', 'completed', 'on_hold') NOT NULL DEFAULT 'planning',
    progress INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng nhiệm vụ (tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    project_id INT NOT NULL,
    assignee_id INT,
    status ENUM('todo', 'in_progress', 'review', 'done') NOT NULL DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    progress INT DEFAULT 0,
    start_date DATE,
    due_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng phân công nhân sự cho dự án (user_project)
CREATE TABLE IF NOT EXISTS user_project (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role ENUM('project_manager', 'team_lead', 'member') NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Bảng nhận xét/bình luận (comments)
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu cho bảng users
-- Lưu ý: Mật khẩu đã được hash bằng password_hash() với giá trị "password123"
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@waiedu.site', 'admin'),
('manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', 'manager@waiedu.site', 'manager'),
('dev1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị B', 'dev1@waiedu.site', 'developer'),
('tester1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Văn C', 'tester@waiedu.site', 'tester'),
('designer1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm Thị D', 'designer1@waiedu.site', 'designer'),
('market1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hoàng Văn E', 'market1@waiedu.site', 'market_research'),
('coder1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Đỗ Thị F', 'coder1@waiedu.site', 'coder');

-- Thêm tài khoản admin mới
INSERT INTO users (username, password, full_name, email, role) VALUES
('superadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'superadmin@waiedu.site', 'admin');
-- Lưu ý: Mật khẩu là "password123"

-- Thêm dữ liệu mẫu cho bảng projects
INSERT INTO projects (name, description, start_date, deadline, status, progress, created_by) VALUES
('Hệ thống quản lý học tập WAIEDU', 'Xây dựng hệ thống quản lý học tập trực tuyến với các tính năng hiện đại', '2023-04-01', '2023-06-30', 'in_progress', 65, 1),
('Ứng dụng mobile WAIEDU', 'Phát triển ứng dụng di động cho hệ thống WAIEDU', '2023-03-15', '2023-05-15', 'in_progress', 80, 1);

-- Thêm dữ liệu mẫu cho bảng tasks
INSERT INTO tasks (title, description, project_id, assignee_id, status, priority, progress, start_date, due_date, created_by) VALUES
('Hoàn thiện giao diện người dùng', 'Thiết kế và xây dựng UI/UX cho trang dashboard', 1, 3, 'in_progress', 'high', 75, '2023-04-10', '2023-05-25', 2),
('Phát triển API backend', 'Xây dựng RESTful API cho hệ thống', 1, 3, 'in_progress', 'medium', 45, '2023-04-15', '2023-05-30', 2),
('Testing và QA', 'Kiểm thử toàn bộ hệ thống và đảm bảo chất lượng', 1, 4, 'todo', 'medium', 20, '2023-05-01', '2023-06-10', 2);

-- Thêm dữ liệu mẫu cho bảng user_project
INSERT INTO user_project (user_id, project_id, role) VALUES
(1, 1, 'project_manager'),
(2, 1, 'team_lead'),
(2, 2, 'project_manager'),
(3, 1, 'member'),
(3, 2, 'member'),
(4, 1, 'member');
