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
        SELECT ut.*, u.role_id, u.id as admin_id
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
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);
        
        // If JSON couldn't be decoded, try getting data from $_POST
        if (!$input) {
            $input = $_POST;
        }
        
        // Check if request ID is provided
        if (!isset($input['id']) || !is_numeric($input['id'])) {
            $response['message'] = 'ID yêu cầu không hợp lệ';
            echo json_encode($response);
            exit();
        }
        
        $request_id = (int)$input['id'];
        $admin_id = $token_data['admin_id'];
        $reason = isset($input['reason']) ? trim($input['reason']) : 'Yêu cầu không hợp lệ';
        
        // Get password reset request
        $req_stmt = $pdo->prepare("
            SELECT * FROM password_reset_requests
            WHERE id = :id AND status = 'pending'
        ");
        $req_stmt->bindParam(':id', $request_id);
        $req_stmt->execute();
        
        if ($req_stmt->rowCount() === 0) {
            $response['message'] = 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý';
            echo json_encode($response);
            exit();
        }
        
        $request = $req_stmt->fetch();
        
        // Update request status
        $update_stmt = $pdo->prepare("
            UPDATE password_reset_requests
            SET 
                status = 'rejected',
                processed_by = :admin_id,
                processed_at = NOW(),
                admin_notes = :reason
            WHERE id = :id
        ");
        
        $update_stmt->bindParam(':admin_id', $admin_id);
        $update_stmt->bindParam(':reason', $reason);
        $update_stmt->bindParam(':id', $request_id);
        $update_stmt->execute();
        
        // Return success response
        $response['success'] = true;
        $response['message'] = 'Đã từ chối yêu cầu đặt lại mật khẩu';
        
        // In production, would email the user with rejection notification
        // sendRejectionEmail($request['email'], $request['full_name'], $reason);
        
    } else {
        $response['message'] = 'Phương thức không được phép';
    }
    
} catch (PDOException $e) {
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
