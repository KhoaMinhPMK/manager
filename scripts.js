document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo form đăng nhập
  initLoginForm();
  
  // Kiểm tra nếu đã lưu thông tin đăng nhập
  checkRememberedLogin();
});

// Khởi tạo form đăng nhập
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const pwdField = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password');
  
  // Xử lý sự kiện submit form
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Lấy dữ liệu đăng nhập
    const username = this.username.value;
    const password = this.password.value;
    const remember = document.getElementById('remember').checked;
    
    // Kiểm tra dữ liệu đầu vào
    if (!validateLoginForm(username, password)) {
      return;
    }
    
    // Hiển thị loader hoặc disable nút đăng nhập
    const loginButton = document.querySelector('.btn-login');
    loginButton.disabled = true;
    
    // Gọi API đăng nhập
    loginUser(username, password, remember, loginButton);
  });
  
  // Xử lý nút hiện/ẩn mật khẩu
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const type = pwdField.type === 'password' ? 'text' : 'password';
      pwdField.type = type;
      
      // Thay đổi icon
      const icon = toggleBtn.querySelector('i');
      icon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    });
  }
}

// Kiểm tra form đăng nhập
function validateLoginForm(username, password) {
  let isValid = true;
  
  // Xóa thông báo lỗi cũ
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  
  // Kiểm tra username
  if (!username.trim()) {
    document.getElementById('username').classList.add('input-error');
    showMessage('error', 'Vui lòng nhập tên đăng nhập');
    isValid = false;
  }
  
  // Kiểm tra password
  if (!password) {
    document.getElementById('password').classList.add('input-error');
    showMessage('error', 'Vui lòng nhập mật khẩu');
    isValid = false;
  }
  
  return isValid;
}

// Xử lý đăng nhập
function loginUser(username, password, remember, loginButton) {
  // Gọi API đăng nhập
  fetch('https://manager.waiedu.site/api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Đăng nhập thành công
      handleSuccessfulLogin(data, remember);
    } else {
      // Đăng nhập thất bại
      handleFailedLogin(data, loginButton);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('error', 'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.');
    loginButton.disabled = false;
  });
}

// Xử lý đăng nhập thành công
function handleSuccessfulLogin(data, remember) {
  // Lưu thông tin người dùng vào localStorage
  localStorage.setItem('user', JSON.stringify(data.data));
  
  // Nếu chọn ghi nhớ đăng nhập, lưu thêm vào localStorage
  if (remember) {
    localStorage.setItem('rememberLogin', JSON.stringify({
      username: document.getElementById('username').value,
      timestamp: new Date().getTime()
    }));
  } else {
    localStorage.removeItem('rememberLogin');
  }
  
  // Thông báo thành công
  showMessage('success', 'Đăng nhập thành công! Đang chuyển hướng...');
  
  // Chuyển hướng đến trang dashboard
  setTimeout(function() {
    window.location.href = '/src/dashboard/index.html';
  }, 1000);
}

// Xử lý đăng nhập thất bại
function handleFailedLogin(data, loginButton) {
  showMessage('error', data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
  loginButton.disabled = false;
}

// Kiểm tra ghi nhớ đăng nhập
function checkRememberedLogin() {
  const rememberedLogin = localStorage.getItem('rememberLogin');
  
  if (rememberedLogin) {
    try {
      const loginData = JSON.parse(rememberedLogin);
      const currentTime = new Date().getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 ngày tính bằng mili giây
      
      // Kiểm tra xem thông tin đăng nhập có quá 30 ngày không
      if (loginData.timestamp && (currentTime - loginData.timestamp) < thirtyDays) {
        // Tự động điền tên đăng nhập
        document.getElementById('username').value = loginData.username;
        // Đánh dấu checkbox ghi nhớ đăng nhập
        document.getElementById('remember').checked = true;
      } else {
        // Xóa thông tin ghi nhớ nếu đã quá hạn
        localStorage.removeItem('rememberLogin');
      }
    } catch (error) {
      console.error('Error parsing remembered login:', error);
      localStorage.removeItem('rememberLogin');
    }
  }
}

// Hàm hiển thị thông báo
function showMessage(type, message) {
  // Kiểm tra xem đã có message container chưa
  let messageContainer = document.querySelector('.message-container');
  
  if (!messageContainer) {
    // Tạo message container nếu chưa có
    messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    document.querySelector('.login-card').appendChild(messageContainer);
  }
  
  // Tạo message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Thêm message vào container
  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageElement);
  
  // Tự động ẩn message sau 3 giây
  setTimeout(() => {
    messageElement.classList.add('hide');
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }, 3000);
}