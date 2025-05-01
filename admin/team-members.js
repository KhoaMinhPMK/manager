document.addEventListener('DOMContentLoaded', function() {
  // Kiểm tra quyền admin
  checkAdminAuth();
  
  // Khởi tạo các nút lọc team
  initTeamFilters();
  
  // Khởi tạo các nút hành động (sửa, xóa)
  initActionButtons();
});

// Hàm khởi tạo lọc team
function initTeamFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Loại bỏ trạng thái active từ tất cả các nút
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Thêm trạng thái active cho nút được nhấp
      this.classList.add('active');
      
      // Lấy team được chọn
      const selectedTeam = this.getAttribute('data-team');
      
      // Lọc danh sách thành viên
      filterMembers(selectedTeam);
    });
  });
}

// Hàm lọc thành viên theo team
function filterMembers(team) {
  const rows = document.querySelectorAll('#membersTableBody tr');
  
  rows.forEach(row => {
    if (team === 'all') {
      row.style.display = '';
    } else {
      if (row.classList.contains(`team-${team}`)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

// Khởi tạo các nút hành động
function initActionButtons() {
  // Nút sửa
  document.querySelectorAll('.btn-icon.edit').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const name = row.querySelector('.member-info span').textContent;
      editMember(name);
    });
  });
  
  // Nút xóa
  document.querySelectorAll('.btn-icon.delete').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const name = row.querySelector('.member-info span').textContent;
      deleteMember(name);
    });
  });
}

// Hàm sửa thông tin thành viên
function editMember(name) {
  // Trong phiên bản thực, sẽ chuyển đến trang chỉnh sửa hoặc mở modal
  alert(`Chỉnh sửa thông tin thành viên: ${name}`);
  // window.location.href = `edit-member.html?name=${encodeURIComponent(name)}`;
}

// Hàm xóa thành viên
function deleteMember(name) {
  if (confirm(`Bạn có chắc muốn xóa thành viên ${name}?`)) {
    // Trong phiên bản thực, sẽ gọi API để xóa
    alert(`Đã xóa thành viên: ${name}`);
  }
}
