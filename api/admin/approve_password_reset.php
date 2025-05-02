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
    
    // Verify authentication
    $auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!$auth_header || strpos($auth_header, 'Bearer ') !== 0) {
        $response['message'] = 'Không tìm thấy token xác thực';
        echo json_encode($response);
        exit();
    }
    
    $token = substr($auth_header, 7); // Remove "Bearer " prefix
    
    // Verify token in database
    $token_stmt = $pdo->prepare("
        SELECT ut.*, u.role_id 
        FROM user_tokens ut
        JOIN users u ON ut.user_id = u.id
        WHERE ut.token = :token AND ut.expires_at > NOW()
    ");
    $token_stmt->bindParam(':token', $token);
    $token_stmt->execute();
    
    if ($token_stmt->rowCount() === 0) {
        $response['message'] = 'Token không hợp lệ hoặc đã hết hạn';
        echo json_encode($response);
        exit();
    }
    
    $token_data = $token_stmt->fetch();
    
    // Check if user is admin (role_id = 1)
    if ($token_data['role_id'] !== 1) {
        $response['message'] = 'Không đủ quyền truy cập';
        echo json_encode($response);
        exit();
    }
    
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $response['message'] = 'Phương thức không được phép';
        echo json_encode($response);
        exit();
    }
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // If JSON couldn't be decoded, try getting data from $_POST
    if (!$input) {
        $input = $_POST;
    }
    
    // Check if ID is provided
    if (!isset($input['id']) || empty($input['id'])) {
        $response['message'] = 'Thiếu ID yêu cầu';
        echo json_encode($response);
        exit();
    }
    
    $request_id = $input['id'];
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Get password reset request details
    $request_stmt = $pdo->prepare("
        SELECT * FROM password_reset_requests 
        WHERE id = :id AND status = 'pending'
    ");
    $request_stmt->bindParam(':id', $request_id);
    $request_stmt->execute();
    
    if ($request_stmt->rowCount() === 0) {
        $response['message'] = 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý';
        $pdo->rollBack();
        echo json_encode($response);
        exit();
    }
    
    $request = $request_stmt->fetch();
    
    // Check if email exists in users table
    $user_check_stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email AND status = 1");
    $user_check_stmt->bindParam(':email', $request['email']);
    $user_check_stmt->execute();
    
    if ($user_check_stmt->rowCount() === 0) {
        $response['message'] = 'Không tìm thấy tài khoản với email này hoặc tài khoản đã bị khóa';
        $pdo->rollBack();
        echo json_encode($response);
        exit();
    }
    
    $user = $user_check_stmt->fetch();
    $user_id = $user['id'];
    
    // Generate a random reset token
    $reset_token = bin2hex(random_bytes(32));
    
    // Token expires after 24 hours
    $token_expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Update password reset request
    $update_stmt = $pdo->prepare("
        UPDATE password_reset_requests 
        SET 
            status = 'approved', 
            processed_by = :processed_by, 
            processed_at = NOW(),
            token = :token,
            token_expires_at = :token_expires,
            admin_notes = 'Yêu cầu đã được phê duyệt bởi admin'
        WHERE id = :id
    ");
    
    $update_stmt->bindParam(':processed_by', $token_data['user_id']);
    $update_stmt->bindParam(':token', $reset_token);
    $update_stmt->bindParam(':token_expires', $token_expires);
    $update_stmt->bindParam(':id', $request_id);
    
    if (!$update_stmt->execute()) {
        $response['message'] = 'Có lỗi xảy ra khi cập nhật yêu cầu';
        $pdo->rollBack();
        echo json_encode($response);
        exit();
    }
    
    // Commit the transaction
    $pdo->commit();
    
    // Create reset URL
    $reset_url = 'https://manager.waiedu.site/reset-password.html?token=' . $reset_token;
    
    // TODO: Send email to user with reset link
    // sendResetEmail($request['email'], $request['full_name'], $reset_url);
    
    // Return success response
    $response['success'] = true;
    $response['message'] = 'Yêu cầu đặt lại mật khẩu đã được duyệt thành công';
    $response['reset_token'] = $reset_token;
    $response['reset_url'] = $reset_url;
    
} catch (PDOException $e) {
    // Roll back the transaction if something failed
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
