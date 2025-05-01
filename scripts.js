document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Lấy dữ liệu đăng nhập
  const username = this.username.value;
  const password = this.password.value;
  
  // Hiển thị loader hoặc disable nút đăng nhập
  const loginButton = document.querySelector('.btn-login');
  loginButton.disabled = true;
  loginButton.textContent = 'Đang đăng nhập...';
  
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
      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(data.data));
      
      // Thông báo thành công
      showMessage('success', 'Đăng nhập thành công! Đang chuyển hướng...');
      
      // Chuyển hướng đến trang dashboard
      setTimeout(function() {
        window.location.href = '/src/dashboard/index.html';
      }, 1000);
    } else {
      // Đăng nhập thất bại
      showMessage('error', data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      loginButton.disabled = false;
      loginButton.textContent = 'Đăng nhập';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('error', 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    loginButton.disabled = false;
    loginButton.textContent = 'Đăng nhập';
  });
});

const pwdField = document.getElementById('password');
const toggleBtn = document.querySelector('.toggle-password');
toggleBtn.addEventListener('click', () => {
  pwdField.type = pwdField.type === 'password' ? 'text' : 'password';
});

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