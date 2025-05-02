<?php
// Set headers for API response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Database connection parameters
$host = 'localhost'; 
$db_name = 'u531045590_manager';
$username = 'u531045590_manager';
$password = 'Strongpass123@#';
$charset = 'utf8mb4';

// Initialize response array
$response = array();
$response['success'] = false;

try {
    // Create database connection
    $dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);
        
        // If JSON couldn't be decoded, try getting data from $_POST
        if (!$input) {
            $input = $_POST;
        }
        
        // Validate required fields
        $required_fields = ['fullname', 'email', 'phone', 'cccd', 'reason'];
        $missing_fields = [];
        
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                $missing_fields[] = $field;
            }
        }
        
        if (!empty($missing_fields)) {
            $response['message'] = 'Vui lòng điền đầy đủ thông tin bắt buộc';
            $response['missing_fields'] = $missing_fields;
            echo json_encode($response);
            exit();
        }
        
        // Clean and validate input data
        $full_name = trim($input['fullname']);
        $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
        $phone = preg_replace('/[^0-9]/', '', $input['phone']);
        $national_id = preg_replace('/[^0-9]/', '', $input['cccd']);
        $reason = trim($input['reason']);
        
        // Input validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response['message'] = 'Địa chỉ email không hợp lệ';
            echo json_encode($response);
            exit();
        }
        
        if (strlen($phone) < 10 || strlen($phone) > 11) {
            $response['message'] = 'Số điện thoại không hợp lệ';
            echo json_encode($response);
            exit();
        }
        
        if (strlen($national_id) < 9 || strlen($national_id) > 12) {
            $response['message'] = 'Số CCCD/CMND không hợp lệ';
            echo json_encode($response);
            exit();
        }
        
        if (strlen($reason) < 20) {
            $response['message'] = 'Vui lòng nhập lý do chi tiết hơn (ít nhất 20 ký tự)';
            echo json_encode($response);
            exit();
        }
        
        // Check if email exists in the users table
        $check_stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $check_stmt->bindParam(':email', $email);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() === 0) {
            $response['message'] = 'Email này không tồn tại trong hệ thống';
            echo json_encode($response);
            exit();
        }
        
        // Check for existing pending request
        $pending_stmt = $pdo->prepare("SELECT id FROM password_reset_requests WHERE email = :email AND status = 'pending'");
        $pending_stmt->bindParam(':email', $email);
        $pending_stmt->execute();
        
        if ($pending_stmt->rowCount() > 0) {
            $response['message'] = 'Đã có yêu cầu đang chờ xử lý cho email này. Vui lòng chờ quản trị viên xét duyệt.';
            echo json_encode($response);
            exit();
        }
        
        // Capture request metadata
        $ip_address = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        
        // Insert request into database
        $insert_stmt = $pdo->prepare("
            INSERT INTO password_reset_requests 
            (full_name, email, phone, national_id, reason, ip_address, user_agent, status) 
            VALUES 
            (:full_name, :email, :phone, :national_id, :reason, :ip_address, :user_agent, 'pending')
        ");
        
        $insert_stmt->bindParam(':full_name', $full_name);
        $insert_stmt->bindParam(':email', $email);
        $insert_stmt->bindParam(':phone', $phone);
        $insert_stmt->bindParam(':national_id', $national_id);
        $insert_stmt->bindParam(':reason', $reason);
        $insert_stmt->bindParam(':ip_address', $ip_address);
        $insert_stmt->bindParam(':user_agent', $user_agent);
        
        if ($insert_stmt->execute()) {
            $request_id = $pdo->lastInsertId();
            
            // Optional: Send notification to admin about new request
            // sendAdminNotification($email, $full_name, $request_id);
            
            $response['success'] = true;
            $response['message'] = 'Yêu cầu đặt lại mật khẩu đã được gửi thành công và đang chờ xét duyệt';
            $response['request_id'] = $request_id;
        } else {
            $response['message'] = 'Có lỗi xảy ra khi xử lý yêu cầu của bạn';
        }
        
    } else {
        $response['message'] = 'Phương thức không được phép';
    }
} catch (PDOException $e) {
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
