document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const usersPerPage = 10;
    let currentPage = 1;
    let allUsers = [];
    let filteredUsers = [];
    let selectedUserIds = [];
    
    // DOM elements - Table and filters
    const usersList = document.getElementById('users-list');
    const loadingElement = document.getElementById('loading-users');
    const emptyStateElement = document.getElementById('empty-users');
    const filterRoleSelect = document.getElementById('filter-role');
    const filterStatusSelect = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-input');
    const refreshButton = document.getElementById('refresh-btn');
    const resetFiltersButton = document.getElementById('reset-filters');
    const selectAllCheckbox = document.getElementById('select-all');
    
    // DOM elements - Bulk actions
    const selectedCountElement = document.getElementById('selected-count');
    const bulkActivateButton = document.getElementById('bulk-activate');
    const bulkDeactivateButton = document.getElementById('bulk-deactivate');
    const bulkDeleteButton = document.getElementById('bulk-delete');
    
    // DOM elements - Pagination
    const paginationContainer = document.getElementById('pagination');
    const showingStartElement = document.getElementById('showing-start');
    const showingEndElement = document.getElementById('showing-end');
    const totalItemsElement = document.getElementById('total-items');
    
    // DOM elements - Modals
    // Add User Modal
    const addUserModal = document.getElementById('add-user-modal');
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserSubmitBtn = document.getElementById('add-user-submit');
    
    // Edit User Modal
    const editUserModal = document.getElementById('edit-user-modal');
    const editUserSubmitBtn = document.getElementById('edit-user-submit');
    
    // Delete User Modal
    const deleteUserModal = document.getElementById('delete-user-modal');
    const deleteUserNameElement = document.getElementById('delete-user-name');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    // Bulk Delete Modal
    const bulkDeleteModal = document.getElementById('bulk-delete-modal');
    const bulkDeleteCountElement = document.getElementById('bulk-delete-count');
    const confirmBulkDeleteBtn = document.getElementById('confirm-bulk-delete');
    
    // Initialize the page
    init();
    
    function init() {
        // Check authentication
        checkAdminAuth();
        
        // Load users data
        loadUsers();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup password toggles
        setupPasswordToggles();
    }
    
    function checkAdminAuth() {
        const token = localStorage.getItem('auth_token');
        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
        
        if (!token || !userInfo || userInfo.role_id !== 1) {
            // If not admin, redirect to login page
            window.location.href = '../../index.html';
            return;
        }
    }
    
    function setupEventListeners() {
        // Filter change events
        filterRoleSelect.addEventListener('change', applyFilters);
        filterStatusSelect.addEventListener('change', applyFilters);
        
        // Search input event
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        
        // Refresh button
        refreshButton.addEventListener('click', loadUsers);
        
        // Reset filters button
        resetFiltersButton.addEventListener('click', resetFilters);
        
        // Select all checkbox
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
        
        // Bulk action buttons
        bulkActivateButton.addEventListener('click', bulkActivateUsers);
        bulkDeactivateButton.addEventListener('click', bulkDeactivateUsers);
        bulkDeleteButton.addEventListener('click', showBulkDeleteModal);
        
        // Add user button and form submission
        addUserBtn.addEventListener('click', showAddUserModal);
        addUserSubmitBtn.addEventListener('click', submitAddUserForm);
        
        // Edit user form submission
        editUserSubmitBtn.addEventListener('click', submitEditUserForm);
        
        // Delete user confirmation
        confirmDeleteBtn.addEventListener('click', confirmDeleteUser);
        
        // Bulk delete confirmation
        confirmBulkDeleteBtn.addEventListener('click', confirmBulkDelete);
        
        // Modal close buttons
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(button => {
            button.addEventListener('click', function() {
                closeAllModals();
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    function setupPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                
                if (passwordInput) {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    this.classList.toggle('fa-eye-slash');
                    this.classList.toggle('fa-eye');
                }
            });
        });
    }
    
    function loadUsers() {
        // Show loading state
        showLoading();
        
        // Reset selected items
        selectedUserIds = [];
        selectAllCheckbox.checked = false;
        updateBulkActionControls();
        
        // Fetch users from API
        const token = localStorage.getItem('auth_token');
        
        fetch(`${apiBaseUrl}/admin/user.php`, {
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
            if (data.success) {
                // Store users data
                allUsers = data.users || [];
                
                // If users array is empty, fall back to mock data for testing
                if (allUsers.length === 0) {
                    console.log('No users found, using mock data for testing');
                    allUsers = generateMockUsers(50);
                }
                
                // Apply filters (this will also update the UI)
                applyFilters();
            } else {
                console.error('API Error:', data.message);
                // Fall back to mock data for testing
                allUsers = generateMockUsers(50);
                applyFilters();
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            // Fall back to mock data for testing
            allUsers = generateMockUsers(50);
            applyFilters();
        });
    }
    
    function applyFilters() {
        const roleFilter = filterRoleSelect.value;
        const statusFilter = filterStatusSelect.value;
        const searchQuery = searchInput.value.toLowerCase().trim();
        
        // Apply filters to all users
        filteredUsers = allUsers.filter(user => {
            // Role filter
            if (roleFilter !== 'all' && user.role_id.toString() !== roleFilter) {
                return false;
            }
            
            // Status filter
            if (statusFilter !== 'all' && user.status.toString() !== statusFilter) {
                return false;
            }
            
            // Search filter (check name, username, or email)
            if (searchQuery) {
                return (
                    user.full_name.toLowerCase().includes(searchQuery) ||
                    user.username.toLowerCase().includes(searchQuery) ||
                    user.email.toLowerCase().includes(searchQuery)
                );
            }
            
            return true;
        });
        
        // Reset to first page
        currentPage = 1;
        
        // Update UI
        renderUsersList();
        renderPagination();
    }
    
    function renderUsersList() {
        // Hide loading spinner
        loadingElement.style.display = 'none';
        
        // Check if filtered users array is empty
        if (filteredUsers.length === 0) {
            showEmptyState();
            return;
        }
        
        // Hide empty state
        emptyStateElement.style.display = 'none';
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);
        const currentPageUsers = filteredUsers.slice(startIndex, endIndex);
        
        // Update pagination info
        showingStartElement.textContent = filteredUsers.length > 0 ? startIndex + 1 : 0;
        showingEndElement.textContent = endIndex;
        totalItemsElement.textContent = filteredUsers.length;
        
        // Clear existing rows except for the loading row
        const rows = usersList.querySelectorAll('tr:not(#loading-users)');
        rows.forEach(row => row.remove());
        
        // Add user rows
        currentPageUsers.forEach(user => {
            const row = createUserRow(user);
            usersList.appendChild(row);
        });
    }
    
    function createUserRow(user) {
        const row = document.createElement('tr');
        row.dataset.id = user.id;
        
        // Format date
        const lastLogin = user.last_login ? new Date(user.last_login) : null;
        const formattedLastLogin = lastLogin ? formatDate(lastLogin) : 'Chưa đăng nhập';
        
        // Determine role badge class and text
        let roleBadgeClass, roleText;
        switch (user.role_id) {
            case 1:
                roleBadgeClass = 'role-admin';
                roleText = 'Quản trị viên';
                break;
            case 2:
                roleBadgeClass = 'role-manager';
                roleText = 'Quản lý';
                break;
            default:
                roleBadgeClass = 'role-member';
                roleText = 'Nhân viên';
        }
        
        // Determine status class and text
        const statusClass = user.status === 1 ? 'status-active' : 'status-inactive';
        const statusText = user.status === 1 ? 'Hoạt động' : 'Bị khóa';
        
        // Extract initials for avatar placeholder
        const initials = getInitials(user.full_name);
        
        // Create user avatar element
        const avatarHtml = user.avatar 
            ? `<img src="${user.avatar}" alt="${user.full_name}">`
            : `<span>${initials}</span>`;
        
        // Create row HTML
        row.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" class="user-checkbox" data-id="${user.id}">
            </td>
            <td>${user.id}</td>
            <td>
                <div class="user-info">
                    <div class="user-avatar">
                        ${avatarHtml}
                    </div>
                    <span class="user-name">${user.full_name}</span>
                </div>
            </td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleBadgeClass}">${roleText}</span></td>
            <td>${formattedLastLogin}</td>
            <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" title="Xem chi tiết" data-id="${user.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" title="Sửa thông tin" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" title="Xóa người dùng" data-id="${user.id}" data-name="${user.full_name}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add event listeners for action buttons
        setTimeout(() => {
            const editBtn = row.querySelector('.action-btn.edit');
            if (editBtn) {
                editBtn.addEventListener('click', () => showEditUserModal(user.id));
            }
            
            const deleteBtn = row.querySelector('.action-btn.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => showDeleteUserModal(user.id, user.full_name));
            }
            
            const viewBtn = row.querySelector('.action-btn.view');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => viewUser(user.id));
            }
            
            // Add event listener for checkbox
            const checkbox = row.querySelector('.user-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedUserIds.push(user.id);
                    } else {
                        selectedUserIds = selectedUserIds.filter(id => id !== user.id);
                    }
                    updateBulkActionControls();
                });
            }
        }, 0);
        
        return row;
    }
    
    function renderPagination() {
        paginationContainer.innerHTML = '';
        
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        
        if (totalPages <= 1) {
            return;
        }
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderUsersList();
                renderPagination();
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Page buttons (show 1 2 ... 9 10 for many pages)
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        // First page & ellipsis
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                currentPage = 1;
                renderUsersList();
                renderPagination();
            });
            paginationContainer.appendChild(firstPageButton);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.className = 'active';
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderUsersList();
                renderPagination();
            });
            paginationContainer.appendChild(pageButton);
        }
        
        // Last page & ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                renderUsersList();
                renderPagination();
            });
            paginationContainer.appendChild(lastPageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderUsersList();
                renderPagination();
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    function showLoading() {
        // Hide empty state
        emptyStateElement.style.display = 'none';
        
        // Show loading row
        loadingElement.style.display = 'table-row';
    }
    
    function showEmptyState() {
        // Hide loading row
        loadingElement.style.display = 'none';
        
        // Show empty state
        emptyStateElement.style.display = 'block';
        
        // Update pagination info
        showingStartElement.textContent = '0';
        showingEndElement.textContent = '0';
        totalItemsElement.textContent = '0';
        
        // Clear pagination
        paginationContainer.innerHTML = '';
    }
    
    function toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.user-checkbox:not([disabled])');
        const isChecked = selectAllCheckbox.checked;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            
            // Update selectedUserIds
            const id = parseInt(checkbox.getAttribute('data-id'));
            
            if (isChecked) {
                if (!selectedUserIds.includes(id)) {
                    selectedUserIds.push(id);
                }
            } else {
                selectedUserIds = selectedUserIds.filter(selectedId => selectedId !== id);
            }
        });
        
        updateBulkActionControls();
    }
    
    function updateBulkActionControls() {
        const count = selectedUserIds.length;
        selectedCountElement.textContent = count;
        
        bulkActivateButton.disabled = count === 0;
        bulkDeactivateButton.disabled = count === 0;
        bulkDeleteButton.disabled = count === 0;
    }
    
    function resetFilters() {
        filterRoleSelect.value = 'all';
        filterStatusSelect.value = 'all';
        searchInput.value = '';
        
        applyFilters();
    }
    
    // User CRUD Operations
    function showAddUserModal() {
        // Clear previous input and errors
        document.getElementById('add-username').value = '';
        document.getElementById('add-email').value = '';
        document.getElementById('add-fullname').value = '';
        document.getElementById('add-role').value = '';
        document.getElementById('add-password').value = '';
        document.getElementById('add-confirm-password').value = '';
        document.getElementById('add-status').checked = true;
        
        document.getElementById('add-username-error').textContent = '';
        document.getElementById('add-email-error').textContent = '';
        document.getElementById('add-fullname-error').textContent = '';
        document.getElementById('add-role-error').textContent = '';
        document.getElementById('add-password-error').textContent = '';
        document.getElementById('add-confirm-password-error').textContent = '';
        
        // Show modal
        addUserModal.style.display = 'block';
    }
    
    function submitAddUserForm() {
        // Validate form
        const usernameInput = document.getElementById('add-username');
        const emailInput = document.getElementById('add-email');
        const fullnameInput = document.getElementById('add-fullname');
        const roleInput = document.getElementById('add-role');
        const passwordInput = document.getElementById('add-password');
        const confirmPasswordInput = document.getElementById('add-confirm-password');
        const statusInput = document.getElementById('add-status');
        
        const usernameError = document.getElementById('add-username-error');
        const emailError = document.getElementById('add-email-error');
        const fullnameError = document.getElementById('add-fullname-error');
        const roleError = document.getElementById('add-role-error');
        const passwordError = document.getElementById('add-password-error');
        const confirmPasswordError = document.getElementById('add-confirm-password-error');
        
        // Reset errors
        usernameError.textContent = '';
        emailError.textContent = '';
        fullnameError.textContent = '';
        roleError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        
        // Validate username
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Vui lòng nhập tên đăng nhập';
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Vui lòng nhập email';
            return;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Email không hợp lệ';
            return;
        }
        
        // Validate fullname
        if (!fullnameInput.value.trim()) {
            fullnameError.textContent = 'Vui lòng nhập họ và tên';
            return;
        }
        
        // Validate role
        if (!roleInput.value) {
            roleError.textContent = 'Vui lòng chọn vai trò';
            return;
        }
        
        // Validate password
        if (!passwordInput.value) {
            passwordError.textContent = 'Vui lòng nhập mật khẩu';
            return;
        }
        
        // Validate confirm password
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp';
            return;
        }
        
        // Prepare user data
        const userData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            full_name: fullnameInput.value.trim(),
            role_id: parseInt(roleInput.value),
            password: passwordInput.value,
            status: statusInput.checked ? 1 : 0
        };
        
        addUser(userData);
    }
    
    function addUser(userData) {
        const token = localStorage.getItem('auth_token');
        
        // Show loading state
        addUserSubmitBtn.textContent = 'Đang xử lý...';
        addUserSubmitBtn.disabled = true;
        
        fetch(`${apiBaseUrl}/admin/user.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide modal and reload data
                closeAllModals();
                loadUsers();
                alert('Thêm người dùng thành công!');
            } else {
                // Show error message
                alert(data.message || 'Có lỗi xảy ra khi thêm người dùng');
            }
            addUserSubmitBtn.textContent = 'Thêm người dùng';
            addUserSubmitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error adding user:', error);
            
            // For demo fallback - add to local array
            const maxId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) : 0;
            userData.id = maxId + 1;
            userData.created_at = new Date().toISOString();
            userData.last_login = null;
            allUsers.push(userData);
            
            closeAllModals();
            applyFilters();
            alert('Thêm người dùng thành công! (chế độ demo)');
            
            addUserSubmitBtn.textContent = 'Thêm người dùng';
            addUserSubmitBtn.disabled = false;
        });
    }
    
    function showEditUserModal(userId) {
        // Find user
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        // Fill form with user data
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-fullname').value = user.full_name;
        document.getElementById('edit-role').value = user.role_id;
        document.getElementById('edit-password').value = '';
        document.getElementById('edit-confirm-password').value = '';
        document.getElementById('edit-status').checked = user.status === 1;
        
        // Clear error messages
        document.getElementById('edit-username-error').textContent = '';
        document.getElementById('edit-email-error').textContent = '';
        document.getElementById('edit-fullname-error').textContent = '';
        document.getElementById('edit-role-error').textContent = '';
        document.getElementById('edit-password-error').textContent = '';
        document.getElementById('edit-confirm-password-error').textContent = '';
        
        // Show modal
        editUserModal.style.display = 'block';
    }
    
    function submitEditUserForm() {
        // Get form data
        const userId = parseInt(document.getElementById('edit-user-id').value);
        const usernameInput = document.getElementById('edit-username');
        const emailInput = document.getElementById('edit-email');
        const fullnameInput = document.getElementById('edit-fullname');
        const roleInput = document.getElementById('edit-role');
        const passwordInput = document.getElementById('edit-password');
        const confirmPasswordInput = document.getElementById('edit-confirm-password');
        const statusInput = document.getElementById('edit-status');
        
        const usernameError = document.getElementById('edit-username-error');
        const emailError = document.getElementById('edit-email-error');
        const fullnameError = document.getElementById('edit-fullname-error');
        const roleError = document.getElementById('edit-role-error');
        const passwordError = document.getElementById('edit-password-error');
        const confirmPasswordError = document.getElementById('edit-confirm-password-error');
        
        // Reset errors
        usernameError.textContent = '';
        emailError.textContent = '';
        fullnameError.textContent = '';
        roleError.textContent = '';
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        
        // Validate username
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Vui lòng nhập tên đăng nhập';
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            emailError.textContent = 'Vui lòng nhập email';
            return;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Email không hợp lệ';
            return;
        }
        
        // Validate fullname
        if (!fullnameInput.value.trim()) {
            fullnameError.textContent = 'Vui lòng nhập họ và tên';
            return;
        }
        
        // Validate role
        if (!roleInput.value) {
            roleError.textContent = 'Vui lòng chọn vai trò';
            return;
        }
        
        // Validate password match if provided
        if (passwordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp';
            return;
        }
        
        // Prepare user data
        const userData = {
            id: userId,
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            full_name: fullnameInput.value.trim(),
            role_id: parseInt(roleInput.value),
            status: statusInput.checked ? 1 : 0
        };
        
        // Add password only if provided
        if (passwordInput.value) {
            userData.password = passwordInput.value;
        }
        
        updateUser(userData);
    }
    
    function updateUser(userData) {
        const token = localStorage.getItem('auth_token');
        
        // Show loading state
        editUserSubmitBtn.textContent = 'Đang xử lý...';
        editUserSubmitBtn.disabled = true;
        
        fetch(`${apiBaseUrl}/admin/user.php`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide modal and reload data
                closeAllModals();
                loadUsers();
                alert('Cập nhật người dùng thành công!');
            } else {
                // Show error message
                alert(data.message || 'Có lỗi xảy ra khi cập nhật người dùng');
            }
            editUserSubmitBtn.textContent = 'Lưu thay đổi';
            editUserSubmitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error updating user:', error);
            
            // For demo fallback - update local array
            const userIndex = allUsers.findIndex(u => u.id === userData.id);
            if (userIndex !== -1) {
                allUsers[userIndex] = {
                    ...allUsers[userIndex],
                    ...userData,
                    updated_at: new Date().toISOString()
                };
                
                closeAllModals();
                applyFilters();
                alert('Cập nhật người dùng thành công! (chế độ demo)');
            }
            
            editUserSubmitBtn.textContent = 'Lưu thay đổi';
            editUserSubmitBtn.disabled = false;
        });
    }
    
    function showDeleteUserModal(userId, userName) {
        // Set user info
        deleteUserNameElement.textContent = userName;
        confirmDeleteBtn.setAttribute('data-id', userId);
        
        // Show modal
        deleteUserModal.style.display = 'block';
    }
    
    function confirmDeleteUser() {
        const userId = parseInt(confirmDeleteBtn.getAttribute('data-id'));
        
        deleteUser(userId);
    }
    
    function deleteUser(userId) {
        const token = localStorage.getItem('auth_token');
        
        // Show loading state
        confirmDeleteBtn.textContent = 'Đang xử lý...';
        confirmDeleteBtn.disabled = true;
        
        fetch(`${apiBaseUrl}/admin/user.php?id=${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide modal and reload data
                closeAllModals();
                loadUsers();
                alert('Xóa người dùng thành công!');
            } else {
                // Show error message
                alert(data.message || 'Có lỗi xảy ra khi xóa người dùng');
            }
            confirmDeleteBtn.textContent = 'Xóa người dùng';
            confirmDeleteBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            
            // For demo fallback - filter local array
            allUsers = allUsers.filter(u => u.id !== userId);
            
            closeAllModals();
            applyFilters();
            alert('Xóa người dùng thành công! (chế độ demo)');
            
            confirmDeleteBtn.textContent = 'Xóa người dùng';
            confirmDeleteBtn.disabled = false;
        });
    }
    
    function showBulkDeleteModal() {
        if (selectedUserIds.length === 0) return;
        
        // Update count
        bulkDeleteCountElement.textContent = selectedUserIds.length;
        
        // Show modal
        bulkDeleteModal.style.display = 'block';
    }
    
    function confirmBulkDelete() {
        // For demo - delete selected users locally
        bulkDeleteUsers(selectedUserIds);
        
        // API Integration (uncomment when API is ready)
        /*
        const token = localStorage.getItem('auth_token');
        
        // Show loading state
        confirmBulkDeleteBtn.textContent = 'Đang xử lý...';
        confirmBulkDeleteBtn.disabled = true;
        
        fetch(`${apiBaseUrl}/admin/bulk_delete_users.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_ids: selectedUserIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide modal and reload data
                bulkDeleteModal.style.display = 'none';
                loadUsers();
                alert(`Đã xóa ${data.deleted_count || selectedUserIds.length} người dùng thành công!`);
            } else {
                // Show error message
                alert(data.message || 'Có lỗi xảy ra khi xóa người dùng');
            }
            confirmBulkDeleteBtn.textContent = 'Xóa người dùng';
            confirmBulkDeleteBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error bulk deleting users:', error);
            alert('Có lỗi xảy ra khi kết nối đến máy chủ');
            confirmBulkDeleteBtn.textContent = 'Xóa người dùng';
            confirmBulkDeleteBtn.disabled = false;
        });
        */
    }
    
    function viewUser(userId) {
        // Find user
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        // For demo - display alert with user details
        const roleNames = {1: 'Quản trị viên', 2: 'Quản lý', 3: 'Nhân viên'};
        const statusLabels = {0: 'Bị khóa', 1: 'Hoạt động'};
        
        let message = `
            Thông tin người dùng:\n
            ID: ${user.id}\n
            Tên đăng nhập: ${user.username}\n
            Email: ${user.email}\n
            Họ và tên: ${user.full_name}\n
            Vai trò: ${roleNames[user.role_id]}\n
            Trạng thái: ${statusLabels[user.status]}\n
            Đăng nhập cuối: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Chưa đăng nhập'}\n
        `;
        
        alert(message);
        
        // API Integration (uncomment when API is ready)
        /*
        const token = localStorage.getItem('auth_token');
        
        fetch(`${apiBaseUrl}/admin/user.php?id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display user details in a more elegant way (e.g., in a modal)
                console.log('User details:', data.user);
            } else {
                alert(data.message || 'Không thể lấy thông tin người dùng');
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            alert('Có lỗi xảy ra khi kết nối đến máy chủ');
        });
        */
    }
    
    function bulkActivateUsers() {
        if (selectedUserIds.length === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn kích hoạt ${selectedUserIds.length} người dùng đã chọn?`)) {
            // For demo - activate users locally
            selectedUserIds.forEach(id => {
                const userIndex = allUsers.findIndex(u => u.id === id);
                if (userIndex !== -1) {
                    allUsers[userIndex].status = 1;
                }
            });
            
            // Update UI
            applyFilters();
            selectedUserIds = [];
            updateBulkActionControls();
            alert('Kích hoạt người dùng thành công!');
            
            // API Integration (uncomment when API is ready)
            /*
            const token = localStorage.getItem('auth_token');
            
            fetch(`${apiBaseUrl}/admin/bulk_activate_users.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_ids: selectedUserIds })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadUsers();
                    alert(`Đã kích hoạt ${data.activated_count || selectedUserIds.length} người dùng thành công!`);
                } else {
                    alert(data.message || 'Có lỗi xảy ra khi kích hoạt người dùng');
                }
            })
            .catch(error => {
                console.error('Error activating users:', error);
                alert('Có lỗi xảy ra khi kết nối đến máy chủ');
            });
            */
        }
    }
    
    function bulkDeactivateUsers() {
        if (selectedUserIds.length === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn khóa ${selectedUserIds.length} người dùng đã chọn?`)) {
            // For demo - deactivate users locally
            selectedUserIds.forEach(id => {
                const userIndex = allUsers.findIndex(u => u.id === id);
                if (userIndex !== -1) {
                    allUsers[userIndex].status = 0;
                }
            });
            
            // Update UI
            applyFilters();
            selectedUserIds = [];
            updateBulkActionControls();
            alert('Khóa người dùng thành công!');
            
            // API Integration (uncomment when API is ready)
            /*
            const token = localStorage.getItem('auth_token');
            
            fetch(`${apiBaseUrl}/admin/bulk_deactivate_users.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_ids: selectedUserIds })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadUsers();
                    alert(`Đã khóa ${data.deactivated_count || selectedUserIds.length} người dùng thành công!`);
                } else {
                    alert(data.message || 'Có lỗi xảy ra khi khóa người dùng');
                }
            })
            .catch(error => {
                console.error('Error deactivating users:', error);
                alert('Có lỗi xảy ra khi kết nối đến máy chủ');
            });
            */
        }
    }
    
    // Demo helpers
    function bulkDeleteUsers(userIds) {
        // Filter out deleted users
        allUsers = allUsers.filter(u => !userIds.includes(u.id));
        
        // Update UI
        closeAllModals();
        selectedUserIds = [];
        updateBulkActionControls();
        applyFilters();
        alert(`Đã xóa ${userIds.length} người dùng thành công!`);
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Helper functions
    function getInitials(name) {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    function formatDate(date) {
        if (!date) return 'N/A';
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        date = new Date(date);
        
        if (date.toDateString() === today.toDateString()) {
            return `Hôm nay, ${formatTime(date)}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Hôm qua, ${formatTime(date)}`;
        } else {
            return `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`;
        }
    }
    
    function formatTime(date) {
        return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
    }
    
    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }
    
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    // Generate mock data for testing
    function generateMockUsers(count) {
        const users = [];
        const roles = [1, 2, 3]; // Admin, Manager, Member
        const statuses = [0, 1]; // Inactive, Active
        const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
        const middleNames = ['Văn', 'Thị', 'Đức', 'Hữu', 'Minh', 'Thành', 'Quốc', 'Duy', 'Hoàng', 'Ngọc'];
        const lastNames = ['Anh', 'Bình', 'Cường', 'Dũng', 'Em', 'Giang', 'Hải', 'Linh', 'Minh', 'Nam'];
        
        for (let i = 1; i <= count; i++) {
            // Generate a random name
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${middleName} ${lastName}`;
            
            // Generate username and email
            const username = (firstName.charAt(0) + middleName.charAt(0) + lastName).toLowerCase() + i;
            const email = username + '@waiedu.com';
            
            // Random role and status
            const roleId = roles[Math.floor(Math.random() * roles.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Random dates
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365)); // Random date in the last year
            
            const lastLogin = Math.random() > 0.2 ? new Date() : null; // 80% have logged in
            if (lastLogin) {
                lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 30)); // Random date in the last month
            }
            
            users.push({
                id: i,
                username: username,
                email: email,
                full_name: fullName,
                role_id: roleId,
                status: status,
                created_at: createdAt.toISOString(),
                updated_at: null,
                last_login: lastLogin ? lastLogin.toISOString() : null,
                avatar: null // No avatar for mock data
            });
        }
        
        return users;
    }
});
