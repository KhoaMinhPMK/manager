<?php
// Cấu hình header cho CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Kích hoạt chế độ debug (chỉ dùng trong môi trường phát triển)
$debug_mode = true;

// Kết nối database với thông tin thực tế
$servername = "localhost";
$username = "u531045590_manager";
$password = "Strongpass123@#";
$dbname = "u531045590_manager";

$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(array("success" => false, "message" => "Lỗi kết nối database"));
    exit;
}

// Lấy dữ liệu từ request
$data = json_decode(file_get_contents("php://input"));

// Kiểm tra dữ liệu đầu vào
if (!empty($data->username) && !empty($data->password)) {
    // Sanitize dữ liệu đầu vào
    $username = mysqli_real_escape_string($conn, $data->username);
    $password = mysqli_real_escape_string($conn, $data->password);
    
    // Query để kiểm tra người dùng
    $sql = "SELECT id, username, password, full_name, role FROM users WHERE username = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Debug thông tin
        $debug_info = array();
        if ($debug_mode) {
            $debug_info = array(
                "input_password" => $password,
                "stored_hash" => $user["password"],
                "verify_result" => password_verify($password, $user["password"]) ? "true" : "false"
            );
        }
        
        // Kiểm tra xem có phải là tài khoản admin với mật khẩu mặc định không
        $is_admin_default = ($username === 'admin' && $password === 'password123');
        $is_superadmin_default = ($username === 'superadmin' && $password === 'password123');
        
        // Kiểm tra mật khẩu thông thường hoặc trường hợp đặc biệt cho admin/superadmin
        if (password_verify($password, $user["password"]) || $is_admin_default || $is_superadmin_default) {
            // Nếu là admin hoặc superadmin với mật khẩu mặc định, cập nhật hash mới
            if ($is_admin_default || $is_superadmin_default) {
                $new_hash = password_hash($password, PASSWORD_DEFAULT);
                $update_sql = "UPDATE users SET password = ? WHERE username = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("ss", $new_hash, $username);
                $update_stmt->execute();
                $update_stmt->close();
            }
            
            // Sử dụng Font Awesome icon thay cho ảnh avatar
            $avatar_icon = "fa-user-circle";
            if($user["role"] === "admin") {
                $avatar_icon = "fa-user-shield";
            } else if($user["role"] === "manager") {
                $avatar_icon = "fa-user-tie";
            } else if($user["role"] === "designer") {
                $avatar_icon = "fa-paint-brush";
            } else if($user["role"] === "coder" || $user["role"] === "developer") {
                $avatar_icon = "fa-code";
            } else if($user["role"] === "market_research") {
                $avatar_icon = "fa-chart-line";
            }
            
            // Đăng nhập thành công
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Đăng nhập thành công",
                "data" => array(
                    "id" => $user["id"],
                    "username" => $user["username"],
                    "full_name" => $user["full_name"],
                    "role" => $user["role"],
                    "avatar_icon" => $avatar_icon
                ),
                "debug" => $debug_info
            ));
        } else {
            // Mật khẩu không đúng
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Tên đăng nhập hoặc mật khẩu không chính xác",
                "debug" => $debug_info
            ));
        }
    } else {
        // Không tìm thấy tài khoản
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Tên đăng nhập hoặc mật khẩu không chính xác"
        ));
    }
    
    $stmt->close();
} else {
    // Dữ liệu đầu vào không hợp lệ
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Vui lòng nhập đầy đủ thông tin đăng nhập"
    ));
}

$conn->close();
?>




