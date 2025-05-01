<?php
// Cấu hình header cho CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Kết nối database
$servername = "localhost";
$username = "u531045590_manager";
$password = "Strongpass123@#";
$dbname = "u531045590_manager";

$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(array("message" => "Lỗi kết nối database"));
    exit;
}

// Lấy dữ liệu từ request
$data = json_decode(file_get_contents("php://input"));

// Kiểm tra dữ liệu đầu vào
if (!empty($data->username) && !empty($data->password) && !empty($data->full_name) && !empty($data->email)) {
    // Sanitize dữ liệu đầu vào
    $username = mysqli_real_escape_string($conn, $data->username);
    $password = mysqli_real_escape_string($conn, $data->password);
    $full_name = mysqli_real_escape_string($conn, $data->full_name);
    $email = mysqli_real_escape_string($conn, $data->email);
    $role = !empty($data->role) ? mysqli_real_escape_string($conn, $data->role) : 'developer';
    
    // Kiểm tra username và email đã tồn tại chưa
    $check_sql = "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ss", $username, $email);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if($check_result->num_rows > 0) {
        // Username hoặc email đã tồn tại
        http_response_code(409); // Conflict
        echo json_encode(array(
            "success" => false,
            "message" => "Tên đăng nhập hoặc email đã được sử dụng"
        ));
    } else {
        // Hash mật khẩu
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Thêm người dùng mới
        $sql = "INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $username, $password_hash, $full_name, $email, $role);
        
        if($stmt->execute()) {
            // Đăng ký thành công
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Đăng ký thành công",
                "data" => array(
                    "id" => $stmt->insert_id,
                    "username" => $username,
                    "full_name" => $full_name,
                    "email" => $email,
                    "role" => $role
                )
            ));
        } else {
            // Lỗi khi thêm người dùng
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Đăng ký không thành công: " . $stmt->error
            ));
        }
        
        $stmt->close();
    }
    
    $check_stmt->close();
} else {
    // Dữ liệu đầu vào không hợp lệ
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Vui lòng điền đầy đủ thông tin đăng ký"
    ));
}

$conn->close();
?>
