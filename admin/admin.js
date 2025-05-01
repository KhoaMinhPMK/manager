document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra quyền admin
  checkAdminAuth();
  
  // Thêm style cho notification
  addNotificationStyles();
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

// Thêm CSS cho các notification
function addNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: -350px;
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      transition: right 0.3s ease;
      z-index: 9999;
    }
    
    .notification.show {
      right: 20px;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
    }
    
    .notification-content i {
      font-size: 1.2rem;
      margin-right: 10px;
    }
    
    .notification.success .notification-content i {
      color: #28a745;
    }
    
    .notification.error .notification-content i {
      color: #dc3545;
    }
    
    .notification-close {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: #999;
    }
    
    .notification-close:hover {
      color: #333;
    }
    
    @media (max-width: 480px) {
      .notification {
        width: calc(100% - 40px);
        top: auto;
        bottom: -100px;
        right: 20px;
      }
      
      .notification.show {
        top: auto;
        bottom: 20px;
        right: 20px;
      }
    }

    /* Thiết lập cho avatar admin */
    .admin-header .user-avatar {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #4e5dfc;
      color: white;
      font-size: 1.5rem;
    }
  `;
  document.head.appendChild(style);
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
    // Xác định icon cho avatar
    const iconClass = user.avatar_icon || 'fa-user-shield';
    
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
            <i class="fas ${iconClass}"></i>
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
