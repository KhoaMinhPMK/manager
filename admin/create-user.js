document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra quyền admin
  checkAdminAuth();
  
  // Lấy form tạo người dùng
  const createUserForm = document.getElementById('createUserForm');
  
  // Xử lý khi submit form
  createUserForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ form
    const username = this.username.value;
    const password = this.password.value;
    const fullName = this.full_name.value;
    const email = this.email.value;
    const role = this.role.value;
    const department = this.department.value;
    
    // Xóa thông báo lỗi cũ
    clearErrors();
    
    // Validate form
    if (!validateForm(username, password, fullName, email)) {
      return;
    }
    
    // Hiển thị trạng thái đang xử lý
    const submitButton = document.querySelector('.btn-primary');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    
    // Gọi API đăng ký
    fetch('https://manager.waiedu.site/api/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
        full_name: fullName,
        email: email,
        role: role,
        department: department
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Tạo tài khoản thành công
        showNotification('success', 'Tạo tài khoản thành công!');
        
        // Reset form
        createUserForm.reset();
        
        // Cho phép nhấn nút tạo tài khoản tiếp
        submitButton.disabled = false;
        submitButton.textContent = 'Tạo tài khoản';
      } else {
        // Tạo tài khoản thất bại
        showNotification('error', data.message || 'Tạo tài khoản không thành công. Vui lòng thử lại.');
        submitButton.disabled = false;
        submitButton.textContent = 'Tạo tài khoản';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('error', 'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.');
      submitButton.disabled = false;
      submitButton.textContent = 'Tạo tài khoản';
    });
  });
  
  // Hàm validate form
  function validateForm(username, password, fullName, email) {
    let isValid = true;
    
    // Kiểm tra họ tên
    if (fullName.trim().length < 3) {
      showFieldError('full_name', 'Họ tên phải có ít nhất 3 ký tự');
      isValid = false;
    }
    
    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFieldError('email', 'Email không hợp lệ');
      isValid = false;
    }
    
    // Kiểm tra username
    if (username.trim().length < 4) {
      showFieldError('username', 'Tên đăng nhập phải có ít nhất 4 ký tự');
      isValid = false;
    }
    
    // Kiểm tra mật khẩu
    if (password.length < 6) {
      showFieldError('password', 'Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Hiển thị lỗi cho một trường cụ thể
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    // Thêm vào sau trường input
    if (field.parentNode.classList.contains('password-wrapper')) {
      field.parentNode.parentNode.appendChild(errorDiv);
    } else {
      field.parentNode.appendChild(errorDiv);
    }
    
    // Thêm class error cho trường input
    field.classList.add('input-error');
  }
  
  // Xóa tất cả thông báo lỗi
  function clearErrors() {
    // Xóa tất cả các thông báo lỗi
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    
    // Xóa class error cho các trường input
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  }
  
  // Xử lý hiển thị/ẩn mật khẩu
  const toggleBtn = document.querySelector('.toggle-password');
  toggleBtn.addEventListener('click', function() {
    const passwordField = this.previousElementSibling;
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
  });
});

// Kiểm tra quyền admin
function checkAdminAuth() {
  // Lấy thông tin người dùng từ localStorage
  const userData = localStorage.getItem('user');
  if (!userData) {
    // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    showAccessDenied('Bạn cần đăng nhập để truy cập trang này');
    return;
  }
  
  const user = JSON.parse(userData);
  // Kiểm tra quyền admin hoặc manager
  if (user.role !== 'admin' && user.role !== 'manager') {
    showAccessDenied('Bạn không có quyền truy cập trang này');
    return;
  }
  
  // Nếu là admin, hiển thị thông tin người dùng
  loadUserInfo(user);
}

// Hiển thị thông báo từ chối truy cập
function showAccessDenied(message) {
  const warning = document.createElement('div');
  warning.className = 'admin-auth-warning';
  warning.innerHTML = `
    <h2><i class="fas fa-exclamation-triangle"></i> Từ chối truy cập</h2>
    <p>${message}</p>
    <button class="btn-login" onclick="window.location.href='../index.html'">Đăng nhập</button>
  `;
  document.body.appendChild(warning);
}

// Hiển thị thông báo
function showNotification(type, message) {
  // Tạo notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  
  // Thêm vào body
  document.body.appendChild(notification);
  
  // Hiện notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Tự động ẩn sau 5 giây
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
  
  // Xử lý nút đóng notification
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

// Hàm tải thông tin người dùng admin
function loadUserInfo(user) {
  // Kiểm tra nếu header đã được tạo
  const adminHeader = document.getElementById('admin-header');
  if (adminHeader) {
    // Thêm HTML cho header
    adminHeader.innerHTML = `
      <div class="header-top">
        <div class="logo-container">
          <h2 class="logo">WAIEDU</h2>
        </div>
        <div class="user-info">
          <div class="date-info" id="currentDate"></div>
          <div class="user-greeting">
            <span>Xin chào,</span>
            <span class="user-name">${user.full_name}</span>
          </div>
          <div class="user-avatar">
            <img src="https://via.placeholder.com/40" alt="Avatar người dùng">
          </div>
        </div>
      </div>
    `;
    
    // Hiển thị ngày giờ hiện tại
    updateDateTime();
  }
}

// Hàm cập nhật ngày giờ
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const currentDateEl = document.getElementById('currentDate');
  if (currentDateEl) {
    currentDateEl.textContent = now.toLocaleDateString('vi-VN', options);
  }
}
