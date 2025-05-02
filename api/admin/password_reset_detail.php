<?php
// Set headers for API response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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
    
    // Check if ID is provided
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        $response['message'] = 'Thiếu ID yêu cầu';
        echo json_encode($response);
        exit();
    }
    
    $request_id = $_GET['id'];
    
    // Get password reset request details
    $stmt = $pdo->prepare("
        SELECT r.*, u.full_name as processed_by_name
        FROM password_reset_requests r
        LEFT JOIN users u ON r.processed_by = u.id
        WHERE r.id = :id
    ");
    $stmt->bindParam(':id', $request_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        $response['message'] = 'Không tìm thấy yêu cầu với ID này';
        echo json_encode($response);
        exit();
    }
    
    $detail = $stmt->fetch();
    
    // Return success response
    $response['success'] = true;
    $response['message'] = 'Lấy chi tiết yêu cầu thành công';
    $response['detail'] = $detail;
    
} catch (PDOException $e) {
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
