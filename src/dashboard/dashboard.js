document.addEventListener('DOMContentLoaded', function() {
  // Hiển thị ngày tháng hiện tại
  function updateDateTime() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('vi-VN', options);
  }
  
  // Lấy tên người dùng (ở đây sẽ thay thế bằng dữ liệu thực tế sau khi đăng nhập)
  function loadUserInfo() {
    // Lấy thông tin người dùng từ localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '../../index.html';
      return;
    }
    
    const user = JSON.parse(userData);
    document.getElementById('userName').textContent = user.full_name;
    
    // Nếu là admin, hiển thị liên kết tới trang quản trị
    if (user.role === 'admin' || user.role === 'manager') {
      addAdminLink();
    }
  }
  
  // Thêm liên kết quản trị
  function addAdminLink() {
    // Kiểm tra nếu đã có liên kết admin
    if (!document.querySelector('.admin-link')) {
      const dashboardContent = document.querySelector('.dashboard-content');
      
      // Tạo liên kết admin
      const adminLink = document.createElement('div');
      adminLink.className = 'admin-link';
      adminLink.innerHTML = `
        <a href="../../admin/create-user.html" class="admin-button">
          <i class="fas fa-user-plus"></i> Tạo tài khoản nhân viên mới
        </a>
      `;
      
      // Thêm vào đầu nội dung dashboard
      dashboardContent.insertBefore(adminLink, dashboardContent.firstChild);
      
      // Thêm CSS cho nút admin
      const style = document.createElement('style');
      style.textContent = `
        .admin-link {
          margin-bottom: 20px;
          text-align: right;
        }
        
        .admin-button {
          display: inline-flex;
          align-items: center;
          background-color: var(--primary-color);
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .admin-button i {
          margin-right: 8px;
        }
        
        .admin-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Khởi tạo ticker thông báo
  function initNewsTicker() {
    const ticker = document.getElementById('tickerContent');
    
    // Khi ticker đã di chuyển qua, clone và thêm lại nội dung để tạo hiệu ứng liên tục
    ticker.addEventListener('animationiteration', () => {
      // Có thể cập nhật thông báo mới ở đây nếu cần
    });
  }
  
  // Gọi các hàm khởi tạo
  updateDateTime();
  loadUserInfo();
  initNewsTicker();
  
  // Cập nhật thời gian mỗi phút
  setInterval(updateDateTime, 60000);
  
  // Xử lý sự kiện khi nhấn nút thêm task
  const addTaskBtn = document.querySelector('.tasks .btn-add');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
      alert('Chức năng thêm task đang được phát triển');
      // Ở đây sẽ mở modal form thêm task
    });
  }
  
  // Xử lý sự kiện khi nhấn nút thêm thành viên
  const addMemberBtn = document.querySelector('.team .btn-add');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', function() {
      alert('Chức năng thêm thành viên đang được phát triển');
      // Ở đây sẽ mở modal form thêm thành viên
    });
  }
});
