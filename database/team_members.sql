-- Thêm dữ liệu người dùng cho các thành viên dự án
-- Mật khẩu là "password123" được hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Thêm thông tin liên hệ và sinh nhật
ALTER TABLE users 
ADD COLUMN phone VARCHAR(15) NULL,
ADD COLUMN birthday DATE NULL,
ADD COLUMN school VARCHAR(150) NULL,
ADD COLUMN class VARCHAR(100) NULL;

-- Thêm team_leader field để đánh dấu trưởng nhóm
ALTER TABLE users
ADD COLUMN team_leader BOOLEAN DEFAULT 0;

-- Thêm các thành viên mới
INSERT INTO users (username, password, full_name, email, role, phone, birthday, school, class, team_leader) VALUES
-- Admin và Nghiên cứu thị trường
('thienan', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Hồng Thiên Ân', 'nhthienan701@gmail.com', 'admin', '0914310148', '2006-10-10', 'Bách Khoa (BKU)', 'Khoa học dữ liệu', 0),
('khoa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Khoa', 'khoa@waiedu.site', 'admin', NULL, NULL, NULL, NULL, 0),

-- Team Code
('minhhoang', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Minh Hoàng', 'minhhoanghsftg@gmail.com', 'coder', '0857856350', '2006-12-13', 'Trường Đại học Công nghệ thông tin - VNUHCM', 'KHMT2024.2 / Khoa học máy tính', 0),
('quochuy', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm Quốc Huy', 'huy.phamcs@hcmut.edu.vn', 'coder', '0902716951', '2006-11-13', 'Trường Đại học Bách khoa - ĐHQG TP.HCM', 'Khoa học máy tính', 0),

-- Team Design
('khaai', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Khả Ái', 'kaai333777@gmail.com', 'designer', '0356420423', '2006-03-23', 'Đại học Văn Lang', 'Kiến trúc', 1),
('maianh', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Ngọc Mai Anh', 'anhngocmai212008@gmail.com', 'designer', '0939841883', '2008-02-08', 'THPT NGUYỄN HỮU HUÂN', '11A3', 0),
('haiyen', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Hải Yến', 'haiyen24108@gmail.com', 'designer', '0906997690', '2008-10-24', 'THPT Nguyễn Hữu Huân', '11A4', 0),

-- Team Nghiên cứu thị trường
('trungkien', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trương Trung Kiên', 'trungkien28112006@gmail.com', 'market_research', '0846203900', '2006-11-28', 'UEH-ISB', 'Kinh tế quốc tế', 0);

-- Tạo bảng nhóm làm việc
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tạo bảng phân công thành viên vào nhóm
CREATE TABLE IF NOT EXISTS team_members (
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Thêm các nhóm làm việc
INSERT INTO teams (name, description) VALUES
('Code', 'Nhóm phát triển backend, fullstack và AI'),
('Design', 'Nhóm thiết kế giao diện người dùng'),
('Market Research', 'Nhóm nghiên cứu thị trường');

-- Cập nhật leader cho các nhóm
UPDATE teams SET leader_id = (SELECT id FROM users WHERE username = 'khaai') WHERE name = 'Design';
UPDATE teams SET leader_id = (SELECT id FROM users WHERE username = 'thienan') WHERE name = 'Market Research';
-- Chưa có thông tin leader team code

-- Phân công thành viên vào nhóm
INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'minhhoang' AND t.name = 'Code';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'quochuy' AND t.name = 'Code';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'khaai' AND t.name = 'Design';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'maianh' AND t.name = 'Design';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'haiyen' AND t.name = 'Design';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'thienan' AND t.name = 'Market Research';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'khoa' AND t.name = 'Market Research';

INSERT INTO team_members (user_id, team_id)
SELECT u.id, t.id 
FROM users u, teams t 
WHERE u.username = 'trungkien' AND t.name = 'Market Research';
