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
    
    // Get registration request details
    $request_stmt = $pdo->prepare("
        SELECT * FROM registration_requests 
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
    
    // Generate a random password
    $random_password = generateRandomPassword();
    $hashed_password = password_hash($random_password, PASSWORD_DEFAULT);
    
    // Check if email/username already exists
    $check_stmt = $pdo->prepare("
        SELECT id FROM users 
        WHERE email = :email OR username = :username
    ");
    $check_stmt->bindParam(':email', $request['email']);
    $check_stmt->bindParam(':username', $request['desired_username']);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        $response['message'] = 'Email hoặc tên đăng nhập đã tồn tại';
        $pdo->rollBack();
        echo json_encode($response);
        exit();
    }
    
    // Insert new user
    $insert_stmt = $pdo->prepare("
        INSERT INTO users 
        (username, email, password, full_name, role_id, status, created_at) 
        VALUES 
        (:username, :email, :password, :full_name, 3, 1, NOW())
    ");
    
    $insert_stmt->bindParam(':username', $request['desired_username']);
    $insert_stmt->bindParam(':email', $request['email']);
    $insert_stmt->bindParam(':password', $hashed_password);
    $insert_stmt->bindParam(':full_name', $request['full_name']);
    $insert_stmt->execute();
    
    $user_id = $pdo->lastInsertId();
    
    // Update registration request status
    $update_stmt = $pdo->prepare("
        UPDATE registration_requests 
        SET 
            status = 'approved', 
            processed_by = :processed_by, 
            processed_at = NOW(),
            admin_notes = CONCAT('Đã tạo tài khoản với ID: ', :user_id)
        WHERE id = :id
    ");
    
    $update_stmt->bindParam(':processed_by', $token_data['user_id']);
    $update_stmt->bindParam(':user_id', $user_id);
    $update_stmt->bindParam(':id', $request_id);
    $update_stmt->execute();
    
    // Commit transaction
    $pdo->commit();
    
    // TODO: Send email to user with their login credentials
    // sendApprovalEmail($request['email'], $request['desired_username'], $random_password);
    
    // Return success response
    $response['success'] = true;
    $response['message'] = 'Đã duyệt yêu cầu và tạo tài khoản thành công';
    $response['user_id'] = $user_id;
    $response['password'] = $random_password; // In production, do not return the password, only for testing
    
} catch (PDOException $e) {
    // Roll back the transaction if something failed
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);

// Function to generate a random password
function generateRandomPassword($length = 12) {
    $lowercase = 'abcdefghijklmnopqrstuvwxyz';
    $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $numbers = '0123456789';
    $special = '!@#$%^&*()_-+=<>?';
    
    $all = $lowercase . $uppercase . $numbers . $special;
    
    $password = '';
    
    // Make sure we have at least one of each character type
    $password .= $lowercase[rand(0, strlen($lowercase) - 1)];
    $password .= $uppercase[rand(0, strlen($uppercase) - 1)];
    $password .= $numbers[rand(0, strlen($numbers) - 1)];
    $password .= $special[rand(0, strlen($special) - 1)];
    
    // Fill the rest of the password
    for ($i = 4; $i < $length; $i++) {
        $password .= $all[rand(0, strlen($all) - 1)];
    }
    
    // Shuffle the password to mix character types
    return str_shuffle($password);
}
?>
