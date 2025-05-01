<?php
// Cấu hình header cho CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Đây là một API đặc biệt để reset tài khoản admin/superadmin
// Chỉ nên sử dụng trong môi trường phát triển hoặc với token bảo mật

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

// Kiểm tra secret token (đây là biện pháp bảo mật đơn giản)
if (!empty($data->secret) && $data->secret === "waiedu_reset_2023") {
    // Hash mật khẩu mới (password123)
    $default_password = "password123";
    $hashed_password = password_hash($default_password, PASSWORD_DEFAULT);
    
    // Cập nhật mật khẩu cho tài khoản admin và superadmin
    $sql = "UPDATE users SET password = ? WHERE username IN ('admin', 'superadmin')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $hashed_password);
    
    if ($stmt->execute()) {
        echo json_encode(array(
            "success" => true,
            "message" => "Mật khẩu admin đã được reset thành công",
            "default_password" => $default_password
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Lỗi khi reset mật khẩu: " . $stmt->error
        ));
    }
    
    $stmt->close();
} else {
    http_response_code(403);
    echo json_encode(array(
        "success" => false,
        "message" => "Không có quyền truy cập"
    ));
}

$conn->close();
?>
