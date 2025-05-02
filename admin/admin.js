document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAdminAuth();
    
    // Initialize UI elements
    initSidebar();
    initDropdowns();
    initThemeToggle();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    initActivityChart();
    initRoleChart();
    
    // Initialize action buttons
    initActionButtons();
    
    // Setup logout functionality
    setupLogout();
});

// Authentication check
function checkAdminAuth() {
    const token = localStorage.getItem('auth_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    
    if (!token || !userInfo || userInfo.role_id !== 1) {
        // If not admin, redirect to login page
        window.location.href = '../index.html';
        return;
    }
    
    // Update UI with user info
    document.getElementById('admin-name').textContent = userInfo.full_name;
    document.getElementById('admin-role').textContent = userInfo.role_name;
    
    // Set avatar - always use the avatar from user info, which will be the default if none is set
    const avatarUrl = userInfo.avatar || 'https://manager.waiedu.site/assets/avt.png'; // Absolute URL for default avatar
    document.getElementById('admin-avatar').src = avatarUrl;
    document.getElementById('header-avatar').src = avatarUrl;
}

// Initialize sidebar
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
}

// Initialize dropdowns
function initDropdowns() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
            if (profileDropdown) profileDropdown.style.display = 'none';
        });
    }
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
            if (notificationDropdown) notificationDropdown.style.display = 'none';
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        if (notificationDropdown) notificationDropdown.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'none';
    });
}

// Toggle theme
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('admin-theme');
    
    // Set initial theme
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('admin-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('admin-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Load dashboard data from API
function loadDashboardData() {
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const token = localStorage.getItem('auth_token');
    
    // Log for debugging
    console.log('Fetching dashboard data...');
    console.log('Token:', token);
    
    // Fetch dashboard data
    fetch(`${apiBaseUrl}/admin.php?action=dashboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Dashboard data received:', data);
        
        // Update dashboard with real data
        if (data.success) {
            updateDashboardStats(data);
            updateRequestList(data.recent_requests || []);
            updateUserList(data.recent_users || []);
            
            // Update notification counts
            if (data.stats && data.stats.pending_requests) {
                updateRequestCount(data.stats.pending_requests);
            }
        } else {
            console.error('API Error:', data.message);
            updateDashboardWithMockData();
        }
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
        // For demo, update with mock data
        updateDashboardWithMockData();
    });
}

// Update dashboard with mock data for development/demo
function updateDashboardWithMockData() {
    // Mock statistics
    document.getElementById('user-count').textContent = '42';
    document.getElementById('project-count').textContent = '16';
    document.getElementById('task-count').textContent = '148';
    document.getElementById('pending-count').textContent = '5';
    document.getElementById('request-count').textContent = '5';
    
    // No need to update tables as they have default mock data
}

// Update dashboard stats with real data
function updateDashboardStats(data) {
    if (!data || !data.stats) return;
    
    const stats = data.stats;
    
    document.getElementById('user-count').textContent = stats.users || '0';
    document.getElementById('project-count').textContent = stats.projects || '0';
    document.getElementById('task-count').textContent = stats.tasks || '0';
    document.getElementById('pending-count').textContent = stats.pending_requests || '0';
    
    // Update request count badge too
    updateRequestCount(stats.pending_requests || 0);
}

// Update request count badge in sidebar and notification badge
function updateRequestCount(count) {
    // Update all request count badges
    const requestCountElements = document.querySelectorAll('#request-count');
    requestCountElements.forEach(element => {
        element.textContent = count;
        
        // Only show badge if there are pending requests
        if (count > 0) {
            element.style.display = 'inline-flex';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Update notification count badge
    const notificationCountElement = document.getElementById('notification-count');
    if (notificationCountElement) {
        notificationCountElement.textContent = count;
        
        // Only show badge if there are notifications
        if (count > 0) {
            notificationCountElement.style.display = 'inline-flex';
        } else {
            notificationCountElement.style.display = 'none';
        }
    }
}

// Update recent requests list
function updateRequestList(requests) {
    const requestsContainer = document.getElementById('recent-requests');
    const noRequestsRow = document.getElementById('no-requests');
    const loadingRow = document.getElementById('loading-requests');
    
    if (!requestsContainer) return;
    
    // Hide loading indicator
    if (loadingRow) loadingRow.style.display = 'none';
    
    // Clear existing content except for the empty state and loading rows
    const rows = requestsContainer.querySelectorAll('tr:not(.empty-state):not(#loading-requests)');
    rows.forEach(row => row.remove());
    
    // Show empty state if no requests
    if (!requests || !requests.length) {
        if (noRequestsRow) noRequestsRow.style.display = 'table-row';
        return;
    }
    
    // Hide empty state
    if (noRequestsRow) noRequestsRow.style.display = 'none';
    
    // Add animation class to table for smooth transitions
    requestsContainer.closest('table').classList.add('fade-in');
    
    // Add each request with a slight delay for nice animation effect
    requests.forEach((request, index) => {
        setTimeout(() => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(request.created_at);
            const formattedDate = formatDate(date);
            
            // Determine badge class based on request type
            const badgeClass = request.type === 'register' ? 'badge-register' : 'badge-password';
            const badgeText = request.type === 'register' ? 'Đăng ký' : 'Mật khẩu';
            
            // Determine status class
            const statusClass = 
                request.status === 'pending' ? 'status-pending' : 
                request.status === 'approved' ? 'status-approved' : 
                'status-rejected';
            
            const statusText = 
                request.status === 'pending' ? 'Chờ duyệt' : 
                request.status === 'approved' ? 'Đã duyệt' : 
                'Từ chối';
            
            // Create action buttons HTML based on status
            const actionsHtml = request.status === 'pending' ? 
                `<button class="btn-action approve" data-id="${request.id}" data-type="${request.type}" title="Duyệt yêu cầu"><i class="fas fa-check"></i></button>
                 <button class="btn-action reject" data-id="${request.id}" data-type="${request.type}" title="Từ chối yêu cầu"><i class="fas fa-times"></i></button>` : 
                `<button class="btn-action view" data-id="${request.id}" data-type="${request.type}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>`;
            
            // Create row HTML
            row.innerHTML = `
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td class="email-cell" title="${request.email}">${request.email}</td>
                <td>${formattedDate}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${actionsHtml}</td>
            `;
            
            // Add fade-in animation
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            row.style.transition = 'all 0.3s ease';
            
            requestsContainer.appendChild(row);
            
            // Trigger animation after a short delay
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 50);
            
        }, index * 100); // Stagger the animations by 100ms per row
    });
    
    // Re-initialize action buttons with a delay to ensure they're all added
    setTimeout(() => {
        initActionButtons();
    }, requests.length * 100 + 50);
}

// Update recent users list
function updateUserList(users) {
    const usersContainer = document.getElementById('recent-users');
    if (!usersContainer) return;
    
    // Clear existing content
    usersContainer.innerHTML = '';
    
    // If no users data was provided or array is empty
    if (!users || !users.length) {
        // Try to fetch users directly from API
        const token = localStorage.getItem('auth_token');
        const apiBaseUrl = 'https://manager.waiedu.site/api';
        
        fetch(`${apiBaseUrl}/admin.php?action=dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.recent_users && data.recent_users.length > 0) {
                // Render users from API call
                renderUserRows(data.recent_users);
            } else {
                // If still no users, fetch from the user API endpoint
                fetch(`${apiBaseUrl}/admin/user.php?limit=5`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(userData => {
                    if (userData.success && userData.users && userData.users.length > 0) {
                        renderUserRows(userData.users);
                    } else {
                        console.log('No users found or API returned no data');
                        usersContainer.innerHTML = '<tr><td colspan="5" class="text-center">Không tìm thấy người dùng nào</td></tr>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
        return;
    }
    
    // Render user rows with provided data
    renderUserRows(users);
    
    function renderUserRows(userArray) {
        // Add animation class to table for smooth transitions
        usersContainer.closest('table').classList.add('fade-in');
        
        // Add each user with a slight delay for nice animation effect
        userArray.forEach((user, index) => {
            setTimeout(() => {
                const row = document.createElement('tr');
                
                // Format date
                const date = new Date(user.created_at);
                const formattedDate = formatDate(date, true);
                
                // Determine status class
                const statusClass = user.status === 1 ? 'status-active' : 'status-inactive';
                const statusText = user.status === 1 ? 'Hoạt động' : 'Không hoạt động';
                
                // Use avatar from user data with fallback to default (absolute URL)
                const avatarUrl = user.avatar || 'https://manager.waiedu.site/assets/avt.png';
                
                // Create row HTML
                row.innerHTML = `
                    <td class="user-cell">
                        <div class="user-avatar-sm">
                            <img src="${avatarUrl}" alt="${user.full_name}">
                        </div>
                        <span>${user.full_name}</span>
                    </td>
                    <td>${user.role_name || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td>${formattedDate}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                `;
                
                // Add fade-in animation
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                row.style.transition = 'all 0.3s ease';
                
                usersContainer.appendChild(row);
                
                // Trigger animation after a short delay
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 50);
                
            }, index * 100); // Stagger the animations
        });
    }
}

// Initialize action buttons
function initActionButtons() {
    // Approve buttons
    document.querySelectorAll('.btn-action.approve').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            approveRequest(id, type);
        });
    });
    
    // Reject buttons
    document.querySelectorAll('.btn-action.reject').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            rejectRequest(id, type);
        });
    });
    
    // View buttons
    document.querySelectorAll('.btn-action.view').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            viewRequest(id, type);
        });
    });
}

// Format date helper
function formatDate(date, includeYear = false) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today or yesterday
    if (date.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
        return `Hôm nay, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (date.setHours(0,0,0,0) === yesterday.setHours(0,0,0,0)) {
        return `Hôm qua, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (includeYear) {
        // Format as DD/MM/YYYY
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } else {
        // Format as DD/MM
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
}

// Initialize activity chart
function initActivityChart() {
    const ctx = document.getElementById('activity-chart');
    if (!ctx) return;
    
    // Example data for the chart
    const data = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
            {
                label: 'Người dùng hoạt động',
                data: [28, 35, 42, 38, 45, 32, 18],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Công việc hoàn thành',
                data: [15, 20, 18, 25, 22, 17, 8],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    };
    
    new Chart(ctx, config);
    
    // Handle period change
    const periodSelect = document.getElementById('chart-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            // In a real app, this would fetch new data and update the chart
            console.log('Period changed to:', this.value);
        });
    }
}

// Initialize role distribution chart
function initRoleChart() {
    const ctx = document.getElementById('role-chart');
    if (!ctx) return;
    
    // Example data for the role distribution
    const data = {
        labels: ['Admin', 'Quản lý', 'Nhân viên', 'Khách'],
        datasets: [{
            data: [3, 8, 28, 5],
            backgroundColor: [
                '#2563eb', // primary
                '#10b981', // success
                '#f59e0b', // warning
                '#94a3b8'  // muted
            ],
            borderWidth: 0,
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            cutout: '70%'
        }
    };
    
    new Chart(ctx, config);
}

// Handle approve request
function approveRequest(id, type) {
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const token = localStorage.getItem('auth_token');
    const endpoint = type === 'register' ? 'admin/approve_registration.php' : 'admin/approve_password_reset.php';
    
    if (confirm(`Bạn có chắc chắn muốn duyệt yêu cầu này?`)) {
        fetch(`${apiBaseUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Yêu cầu đã được duyệt thành công!');
                loadDashboardData(); // Reload data
            } else {
                alert(data.message || 'Có lỗi xảy ra khi duyệt yêu cầu.');
            }
        })
        .catch(error => {
            console.error('Error approving request:', error);
            alert('Có lỗi xảy ra khi kết nối đến máy chủ.');
        });
    }
}

// Handle reject request
function rejectRequest(id, type) {
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const token = localStorage.getItem('auth_token');
    const endpoint = type === 'register' ? 'admin/reject_registration.php' : 'admin/reject_password_reset.php';
    
    const reason = prompt('Vui lòng nhập lý do từ chối:');
    if (reason === null) return; // User canceled
    
    fetch(`${apiBaseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id, reason: reason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Đã từ chối yêu cầu.');
            loadDashboardData(); // Reload data
        } else {
            alert(data.message || 'Có lỗi xảy ra khi từ chối yêu cầu.');
        }
    })
    .catch(error => {
        console.error('Error rejecting request:', error);
        alert('Có lỗi xảy ra khi kết nối đến máy chủ.');
    });
}

// View request details
function viewRequest(id, type) {
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const token = localStorage.getItem('auth_token');
    const endpoint = type === 'register' ? 'admin/registration_detail.php' : 'admin/password_reset_detail.php';
    
    fetch(`${apiBaseUrl}/${endpoint}?id=${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Format the details into a readable message
            let message = `Chi tiết yêu cầu:\n\n`;
            message += `Họ và tên: ${data.detail.full_name}\n`;
            message += `Email: ${data.detail.email}\n`;
            if (type === 'register') {
                message += `Tên đăng nhập: ${data.detail.desired_username}\n`;
                message += `Phòng ban: ${data.detail.department}\n`;
                message += `Chức vụ: ${data.detail.position}\n`;
            }
            message += `Số điện thoại: ${data.detail.phone}\n`;
            message += `CCCD/CMND: ${data.detail.national_id}\n`;
            message += `Trạng thái: ${data.detail.status === 'pending' ? 'Chờ duyệt' : data.detail.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}\n`;
            message += `Thời gian yêu cầu: ${new Date(data.detail.created_at).toLocaleString()}\n\n`;
            message += `Lý do: ${data.detail.reason}\n`;
            
            if (data.detail.admin_notes) {
                message += `\nGhi chú admin: ${data.detail.admin_notes}\n`;
            }
            
            alert(message);
        } else {
            alert(data.message || 'Không thể lấy chi tiết yêu cầu.');
        }
    })
    .catch(error => {
        console.error('Error fetching request details:', error);
        alert('Có lỗi xảy ra khi kết nối đến máy chủ.');
    });
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    
    const logoutAction = function() {
        // Clear authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        
        // Redirect to login page
        window.location.href = '../index.html';
    };
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutAction);
    }
    
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', logoutAction);
    }
}
