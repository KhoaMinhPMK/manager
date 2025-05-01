-- Bảng phân loại dự án
CREATE TABLE IF NOT EXISTS project_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm bảng phân công theo phòng ban
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng phân công nhân sự vào phòng ban
CREATE TABLE IF NOT EXISTS user_department (
    user_id INT NOT NULL,
    department_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, department_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Thêm dữ liệu phòng ban
INSERT INTO departments (name, description) VALUES
('Phát triển phần mềm', 'Phát triển và bảo trì các sản phẩm phần mềm'),
('Thiết kế', 'Thiết kế giao diện và trải nghiệm người dùng'),
('Nghiên cứu thị trường', 'Phân tích thị trường và đối thủ cạnh tranh'),
('Kiểm thử', 'Đảm bảo chất lượng sản phẩm');

-- Thêm phân loại dự án
INSERT INTO project_categories (name, description) VALUES
('Web Application', 'Các ứng dụng web'),
('Mobile App', 'Ứng dụng di động'),
('Desktop Software', 'Phần mềm máy tính'),
('Research', 'Dự án nghiên cứu');
