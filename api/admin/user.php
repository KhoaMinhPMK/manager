<?php
// Set headers for API response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

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
    
    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all users or single user by ID
            if (isset($_GET['id'])) {
                $user_id = $_GET['id'];
                getUserById($pdo, $user_id);
            } else {
                getAllUsers($pdo);
            }
            break;
            
        case 'POST':
            // Create new user
            createUser($pdo);
            break;
            
        case 'PUT':
            // Update existing user
            updateUser($pdo);
            break;
            
        case 'DELETE':
            // Delete user
            if (!isset($_GET['id'])) {
                $response['message'] = 'Missing user ID';
                echo json_encode($response);
                exit();
            }
            $user_id = $_GET['id'];
            deleteUser($pdo, $user_id);
            break;
            
        default:
            $response['message'] = 'Method not allowed';
            echo json_encode($response);
            break;
    }
    
} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
    echo json_encode($response);
}

// Get all users
function getAllUsers($pdo) {
    global $response;
    
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.name as role_name,
               u.avatar, u.created_at, u.updated_at, u.last_login, u.status
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.id ASC
    ");
    $stmt->execute();
    
    $users = array();
    while ($row = $stmt->fetch()) {
        // Set default avatar if none exists - using absolute URL
        if (empty($row['avatar'])) {
            $row['avatar'] = 'https://manager.waiedu.site/assets/avt.png';
        }
        
        // Convert status to integer for consistency
        $row['status'] = (int)$row['status'];
        $row['role_id'] = (int)$row['role_id'];
        
        $users[] = $row;
    }
    
    $response['success'] = true;
    $response['message'] = 'Users retrieved successfully';
    $response['users'] = $users;
    echo json_encode($response);
}

// Get user by ID
function getUserById($pdo, $user_id) {
    global $response;
    
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.name as role_name,
               u.avatar, u.created_at, u.updated_at, u.last_login, u.status
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = :user_id
    ");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        $response['message'] = 'User not found';
        echo json_encode($response);
        exit();
    }
    
    $user = $stmt->fetch();
    
    // Set default avatar if none exists - using absolute URL
    if (empty($user['avatar'])) {
        $user['avatar'] = 'https://manager.waiedu.site/assets/avt.png';
    }
    
    // Convert status to integer for consistency
    $user['status'] = (int)$user['status'];
    $user['role_id'] = (int)$user['role_id'];
    
    $response['success'] = true;
    $response['message'] = 'User retrieved successfully';
    $response['user'] = $user;
    echo json_encode($response);
}

// Create new user
function createUser($pdo) {
    global $response;
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['username', 'email', 'full_name', 'role_id', 'password'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            $response['message'] = "Missing required field: $field";
            echo json_encode($response);
            exit();
        }
    }
    
    // Check if username or email already exists
    $check_stmt = $pdo->prepare("
        SELECT id FROM users WHERE username = :username OR email = :email
    ");
    $check_stmt->bindParam(':username', $input['username']);
    $check_stmt->bindParam(':email', $input['email']);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        $existing = $check_stmt->fetch();
        $response['message'] = 'Tên đăng nhập hoặc email đã tồn tại';
        echo json_encode($response);
        exit();
    }
    
    // Hash password
    $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
    
    // Set status to 1 if not provided
    $status = isset($input['status']) ? $input['status'] : 1;
    
    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users 
        (username, email, password, full_name, role_id, status, created_at) 
        VALUES 
        (:username, :email, :password, :full_name, :role_id, :status, NOW())
    ");
    
    $stmt->bindParam(':username', $input['username']);
    $stmt->bindParam(':email', $input['email']);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':full_name', $input['full_name']);
    $stmt->bindParam(':role_id', $input['role_id']);
    $stmt->bindParam(':status', $status);
    
    if ($stmt->execute()) {
        $user_id = $pdo->lastInsertId();
        $response['success'] = true;
        $response['message'] = 'Thêm người dùng thành công';
        $response['user_id'] = $user_id;
        echo json_encode($response);
    } else {
        $response['message'] = 'Error creating user';
        echo json_encode($response);
    }
}

// Update existing user
function updateUser($pdo) {
    global $response;
    
    // Get PUT data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if ID is provided
    if (!isset($input['id'])) {
        $response['message'] = 'Missing user ID';
        echo json_encode($response);
        exit();
    }
    
    // Check if user exists
    $check_stmt = $pdo->prepare("SELECT id FROM users WHERE id = :id");
    $check_stmt->bindParam(':id', $input['id']);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        $response['message'] = 'User not found';
        echo json_encode($response);
        exit();
    }
    
    // Check if username or email already exists (for another user)
    if (isset($input['username']) || isset($input['email'])) {
        $check_stmt = $pdo->prepare("
            SELECT id FROM users 
            WHERE (username = :username OR email = :email) AND id != :id
        ");
        $check_stmt->bindParam(':id', $input['id']);
        $check_stmt->bindValue(':username', $input['username'] ?? '');
        $check_stmt->bindValue(':email', $input['email'] ?? '');
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            $response['message'] = 'Tên đăng nhập hoặc email đã tồn tại';
            echo json_encode($response);
            exit();
        }
    }
    
    // Build update query
    $query = "UPDATE users SET updated_at = NOW()";
    $params = array();
    
    // Add fields to update
    $updatable_fields = [
        'username', 'email', 'full_name', 'role_id', 'status', 'avatar'
    ];
    
    foreach ($updatable_fields as $field) {
        if (isset($input[$field])) {
            $query .= ", $field = :$field";
            $params[$field] = $input[$field];
        }
    }
    
    // Handle password separately (only if provided)
    if (isset($input['password']) && !empty($input['password'])) {
        $query .= ", password = :password";
        $params['password'] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    // Complete query
    $query .= " WHERE id = :id";
    $params['id'] = $input['id'];
    
    // Execute update
    $stmt = $pdo->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Cập nhật thông tin người dùng thành công';
        echo json_encode($response);
    } else {
        $response['message'] = 'Error updating user';
        echo json_encode($response);
    }
}

// Delete user
function deleteUser($pdo, $user_id) {
    global $response;
    
    // Check if user exists
    $check_stmt = $pdo->prepare("SELECT id FROM users WHERE id = :id");
    $check_stmt->bindParam(':id', $user_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        $response['message'] = 'User not found';
        echo json_encode($response);
        exit();
    }
    
    // Delete user tokens first to maintain referential integrity
    $token_stmt = $pdo->prepare("DELETE FROM user_tokens WHERE user_id = :user_id");
    $token_stmt->bindParam(':user_id', $user_id);
    $token_stmt->execute();
    
    // Delete user
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->bindParam(':id', $user_id);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Xóa người dùng thành công';
        echo json_encode($response);
    } else {
        $response['message'] = 'Error deleting user';
        echo json_encode($response);
    }
}
?>
