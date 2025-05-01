<?php
// Cấu hình header cho CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Kết nối database với thông tin thực tế
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
if (!empty($data->user_id) && !empty($data->current_password) && !empty($data->new_password)) {
    // Lấy thông tin user hiện tại
    $user_id = mysqli_real_escape_string($conn, $data->user_id);
    $current_password = mysqli_real_escape_string($conn, $data->current_password);
    $new_password = mysqli_real_escape_string($conn, $data->new_password);
    
    // Kiểm tra mật khẩu hiện tại
    $sql = "SELECT password FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Kiểm tra mật khẩu hiện tại
        if (password_verify($current_password, $user["password"])) {
            // Mật khẩu đúng, cập nhật mật khẩu mới
            $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);
            
            $update_sql = "UPDATE users SET password = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param("si", $new_password_hash, $user_id);
            
            if($update_stmt->execute()) {
                // Cập nhật thành công
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Mật khẩu đã được cập nhật thành công"
                ));
            } else {
                // Lỗi cập nhật
                http_response_code(500);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Không thể cập nhật mật khẩu"
                ));
            }
            
            $update_stmt->close();
        } else {
            // Mật khẩu hiện tại không đúng
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Mật khẩu hiện tại không chính xác"
            ));
        }
    } else {
        // Không tìm thấy người dùng
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Không tìm thấy người dùng"
        ));
    }
    
    $stmt->close();
} else {
    // Dữ liệu đầu vào không đủ
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Dữ liệu không đầy đủ để thay đổi mật khẩu"
    ));
}

$conn->close();
?>
