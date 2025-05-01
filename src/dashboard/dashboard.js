document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo các thành phần
  initDateTime();
  loadUserInfo();
  initNewsTicker();
  initModalHandlers();
  initTaskActions();
});

// Hiển thị ngày tháng hiện tại
function initDateTime() {
  updateDateTime();
  // Cập nhật thời gian mỗi phút
  setInterval(updateDateTime, 60000);
}

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

// Lấy tên người dùng và thông tin từ localStorage
function loadUserInfo() {
  // Lấy thông tin người dùng từ localStorage
  const userData = localStorage.getItem('user');
  if (!userData) {
    window.location.href = '../../index.html';
    return;
  }
  
  const user = JSON.parse(userData);
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = user.full_name;
  }
  
  // Thay avatar bằng icon từ Font Awesome
  const avatarContainer = document.querySelector('.user-avatar');
  if (avatarContainer) {
    const iconClass = user.avatar_icon || 'fa-user-circle';
    avatarContainer.innerHTML = `<i class="fas ${iconClass}"></i>`;
  }
  
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
      <a href="../../admin/team-members.html" class="admin-button">
        <i class="fas fa-users-cog"></i> Quản lý nhân sự
      </a>
      <a href="../../admin/create-user.html" class="admin-button" style="margin-left: 10px">
        <i class="fas fa-user-plus"></i> Tạo tài khoản nhân viên
      </a>
    `;
    
    // Thêm vào đầu nội dung dashboard
    dashboardContent.insertBefore(adminLink, dashboardContent.firstChild);
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

// Khởi tạo xử lý cho các modal
function initModalHandlers() {
  // Modal Add Task
  const addTaskBtn = document.querySelector('.tasks .btn-add');
  const addTaskModal = document.getElementById('addTaskModal');
  
  if (addTaskBtn && addTaskModal) {
    // Mở modal khi nhấn nút
    addTaskBtn.addEventListener('click', () => {
      addTaskModal.classList.add('show');
    });
    
    // Đóng modal khi nhấn nút đóng
    const closeButtons = addTaskModal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        addTaskModal.classList.remove('show');
      });
    });
    
    // Đóng modal khi nhấn bên ngoài
    addTaskModal.addEventListener('click', (e) => {
      if (e.target === addTaskModal) {
        addTaskModal.classList.remove('show');
      }
    });
    
    // Xử lý lưu task
    const saveTaskBtn = document.getElementById('saveTask');
    if (saveTaskBtn) {
      saveTaskBtn.addEventListener('click', saveTask);
    }
  }
}

// Hàm lưu task mới
function saveTask() {
  // Lấy giá trị từ form
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const assigneeSelect = document.getElementById('taskAssignee');
  const assigneeName = assigneeSelect.options[assigneeSelect.selectedIndex]?.text || '';
  const deadline = document.getElementById('taskDeadline').value;
  const prioritySelect = document.getElementById('taskPriority');
  const priority = prioritySelect.value;
  
  // Xác thực dữ liệu
  if (!title.trim()) {
    alert('Vui lòng nhập tiêu đề task');
    return;
  }
  
  // Demo: Thêm task vào giao diện (thực tế sẽ gọi API)
  // Chuyển đổi định dạng ngày từ yyyy-mm-dd sang dd/mm/yyyy
  const formattedDate = deadline ? formatDate(deadline) : 'Không có deadline';
  
  // Tạo HTML cho task mới
  const newTaskHTML = `
    <div class="task-item ${priority === 'urgent' ? 'urgent' : ''}">
      <div class="task-status"></div>
      <div class="task-info">
        <h4>${escapeHTML(title)}</h4>
        <div class="task-meta">
          <span class="due-date"><i class="far fa-clock"></i> ${formattedDate}</span>
          <span class="assignee"><i class="far fa-user"></i> ${escapeHTML(assigneeName)}</span>
        </div>
      </div>
      <div class="task-progress">
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
        <span>0%</span>
      </div>
    </div>
  `;
  
  // Thêm task vào danh sách
  const taskList = document.querySelector('.task-list');
  taskList.insertAdjacentHTML('afterbegin', newTaskHTML);
  
  // Đóng modal và reset form
  const addTaskModal = document.getElementById('addTaskModal');
  addTaskModal.classList.remove('show');
  document.getElementById('taskForm').reset();
  
  // Thông báo thành công
  showNotification('Task đã được thêm thành công!');
}

// Hiển thị thông báo
function showNotification(message) {
  // Tạo phần tử thông báo
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">${message}</div>
    <button class="notification-close">&times;</button>
  `;
  
  // Thêm vào body
  document.body.appendChild(notification);
  
  // Hiển thị thông báo
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
  
  // Xử lý đóng thông báo
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

// Khởi tạo xử lý cho các nút task
function initTaskActions() {
  // Xử lý cho các task item hiện tại
  const taskItems = document.querySelectorAll('.task-item');
  taskItems.forEach(item => {
    item.addEventListener('click', function() {
      // Có thể mở modal chi tiết task ở đây
      const taskTitle = this.querySelector('h4').textContent;
      showTaskDetail(taskTitle);
    });
  });
  
  // Xử lý thêm thành viên
  const addMemberBtn = document.querySelector('.team .btn-add');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', function() {
      window.location.href = '../../admin/team-members.html';
    });
  }
}

// Hiển thị chi tiết task
function showTaskDetail(taskTitle) {
  alert(`Đang mở chi tiết task: ${taskTitle}`);
  // Thực tế sẽ mở modal hoặc chuyển trang chi tiết task
}

// Tiện ích: Chuyển đổi định dạng ngày yyyy-mm-dd thành dd/mm/yyyy
function formatDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Tiện ích: Escape HTML để tránh XSS
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[tag]));
}
