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
        SELECT ut.*, u.role_id, u.username
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
    
    // Check if user is admin (either by role_id = 1 or username = 'admin')
    if ($token_data['role_id'] !== 1 && $token_data['username'] !== 'admin') {
        $response['message'] = 'Không đủ quyền truy cập';
        echo json_encode($response);
        exit();
    }
    
    // Get system statistics
    $stats = array();
    
    // Count users
    $user_stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE status = 1");
    $stats['users'] = $user_stmt->fetch()['count'];
    
    // Count projects (if projects table exists)
    try {
        $project_stmt = $pdo->query("SELECT COUNT(*) as count FROM projects");
        $stats['projects'] = $project_stmt->fetch()['count'];
    } catch (PDOException $e) {
        $stats['projects'] = 0; // Table might not exist yet
    }
    
    // Count tasks (if tasks table exists)
    try {
        $task_stmt = $pdo->query("SELECT COUNT(*) as count FROM tasks");
        $stats['tasks'] = $task_stmt->fetch()['count'];
    } catch (PDOException $e) {
        $stats['tasks'] = 0; // Table might not exist yet
    }
    
    // Count pending registration and password reset requests
    try {
        $pending_reg_stmt = $pdo->query("SELECT COUNT(*) as count FROM registration_requests WHERE status = 'pending'");
        $reg_count = $pending_reg_stmt->fetch()['count'];
    } catch (PDOException $e) {
        $reg_count = 0; // Table might not exist yet
    }
    
    try {
        $pending_pwd_stmt = $pdo->query("SELECT COUNT(*) as count FROM password_reset_requests WHERE status = 'pending'");
        $pwd_count = $pending_pwd_stmt->fetch()['count'];
    } catch (PDOException $e) {
        $pwd_count = 0; // Table might not exist yet
    }
    
    $stats['pending_requests'] = $reg_count + $pwd_count;
    
    $response['stats'] = $stats;
    
    // Get recent registration and password reset requests
    $requests = array();
    
    // Registration requests
    try {
        $reg_stmt = $pdo->query("
            SELECT 
                id, 
                full_name, 
                email, 
                'register' as type, 
                status, 
                created_at 
            FROM 
                registration_requests 
            ORDER BY 
                created_at DESC 
            LIMIT 5
        ");
        
        while ($row = $reg_stmt->fetch()) {
            $requests[] = $row;
        }
    } catch (PDOException $e) {
        // Table might not exist yet
    }
    
    // Password reset requests
    try {
        $pwd_stmt = $pdo->query("
            SELECT 
                id, 
                full_name, 
                email, 
                'password' as type, 
                status, 
                created_at 
            FROM 
                password_reset_requests 
            ORDER BY 
                created_at DESC 
            LIMIT 5
        ");
        
        while ($row = $pwd_stmt->fetch()) {
            $requests[] = $row;
        }
    } catch (PDOException $e) {
        // Table might not exist yet
    }
    
    // Sort by created_at
    if (!empty($requests)) {
        usort($requests, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        // Limit to 5 most recent
        $requests = array_slice($requests, 0, 5);
    }
    
    $response['recent_requests'] = $requests;
    
    // Get recent users
    $users_stmt = $pdo->query("
        SELECT 
            u.id, 
            u.username, 
            u.email, 
            u.full_name, 
            u.avatar, 
            u.created_at, 
            u.status,
            r.name as role_name
        FROM 
            users u
        JOIN 
            roles r ON u.role_id = r.id
        ORDER BY 
            u.created_at DESC 
        LIMIT 5
    ");
    
    $users = array();
    while ($row = $users_stmt->fetch()) {
        // Set default avatar if none exists - using absolute URL
        $row['avatar'] = $row['avatar'] ? $row['avatar'] : 'https://manager.waiedu.site/assets/avt.png';
        $users[] = $row;
    }
    
    $response['recent_users'] = $users;
    
    $response['success'] = true;
    
} catch (PDOException $e) {
    $response['message'] = 'Lỗi kết nối cơ sở dữ liệu: ' . $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
