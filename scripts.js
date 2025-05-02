document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-btn');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const togglePassword = document.querySelector('.toggle-password');
    
    // Toggle password visibility
    if(togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Validation functions
    function validateUsername() {
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Vui lòng nhập tên đăng nhập hoặc email';
            return false;
        }
        usernameError.textContent = '';
        return true;
    }
    
    function validatePassword() {
        if (!passwordInput.value) {
            passwordError.textContent = 'Vui lòng nhập mật khẩu';
            return false;
        }
        passwordError.textContent = '';
        return true;
    }
    
    // Add validation on input events
    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);
    
    // Handle login button click
    if(loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isUsernameValid = validateUsername();
            const isPasswordValid = validatePassword();
            
            if (isUsernameValid && isPasswordValid) {
                // For demo purposes - in real application, would send to server
                login(usernameInput.value, passwordInput.value);
            }
        });
    }
    
    // Login function
    function login(username, password) {
        // Show loading state
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        loginButton.disabled = true;
        
        // Updated API endpoint
        const apiBaseUrl = 'https://manager.waiedu.site/api';
        
        // For debugging - log the login attempt
        console.log('Attempting login with username:', username);
        
        fetch(`${apiBaseUrl}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => {
            console.log('Login response status:', response.status);
            return response.json(); // Always parse the JSON regardless of status
        })
        .then(data => {
            console.log('Response data:', data);
            
            if (!data.success) {
                // Login failed - show error message
                throw new Error(data.message || 'Đăng nhập thất bại');
            }
            
            // Login successful
            console.log('Login successful, user info:', data.user);
            
            // Store token and user info
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_info', JSON.stringify(data.user));
            
            // Check if user has admin role
            if (data.user && data.user.role_id === 1) {
                console.log('Admin user detected, redirecting to admin dashboard');
                window.location.href = window.location.origin + '/admin/admin.html';
            } else {
                console.log('Regular user detected, redirecting to user dashboard');
                window.location.href = 'src/dashboard/index.html';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            
            // Show error message
            passwordError.textContent = error.message || 'Tên đăng nhập hoặc mật khẩu không chính xác';
            loginButton.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
            loginButton.disabled = false;
        });
    }
    
    // Add "Enter" key support for login
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (document.activeElement === passwordInput || document.activeElement === usernameInput)) {
            loginButton.click();
        }
    });
});
