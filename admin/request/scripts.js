document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const apiBaseUrl = 'https://manager.waiedu.site/api';
    const requestsPerPage = 10;
    let currentPage = 1;
    let allRequests = [];
    let filteredRequests = [];
    let selectedRequestIds = [];
    
    // DOM elements
    const requestsList = document.getElementById('requests-list');
    const loadingElement = document.getElementById('loading-requests');
    const emptyStateElement = document.getElementById('empty-requests');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterStatusSelect = document.getElementById('filter-status');
    const filterDateSelect = document.getElementById('filter-date');
    const searchInput = document.getElementById('search-input');
    const refreshButton = document.getElementById('refresh-btn');
    const resetFiltersButton = document.getElementById('reset-filters');
    const selectAllCheckbox = document.getElementById('select-all');
    const bulkActionSelect = document.getElementById('bulk-action');
    const applyBulkActionButton = document.getElementById('apply-bulk-action');
    const paginationContainer = document.getElementById('pagination');
    const showingStartElement = document.getElementById('showing-start');
    const showingEndElement = document.getElementById('showing-end');
    const totalItemsElement = document.getElementById('total-items');
    
    // Modals
    const requestDetailModal = document.getElementById('request-detail-modal');
    const requestDetailContent = document.getElementById('request-detail-content');
    const requestDetailActions = document.getElementById('request-detail-actions');
    const rejectModal = document.getElementById('reject-modal');
    const rejectReasonTextarea = document.getElementById('reject-reason');
    const rejectReasonError = document.getElementById('reject-reason-error');
    const confirmRejectButton = document.getElementById('confirm-reject');
    const bulkRejectModal = document.getElementById('bulk-reject-modal');
    const bulkRejectCount = document.getElementById('bulk-reject-count');
    const bulkRejectReasonTextarea = document.getElementById('bulk-reject-reason');
    const bulkRejectReasonError = document.getElementById('bulk-reject-reason-error');
    const confirmBulkRejectButton = document.getElementById('confirm-bulk-reject');
    
    // Store the current request being processed
    let currentRequestId = null;
    let currentRequestType = null;
    
    // Initialize the page
    init();
    
    function init() {
        // Check authentication
        checkAdminAuth();
        
        // Load requests data
        loadRequests();
        
        // Setup event listeners
        setupEventListeners();
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
        filterTypeSelect.addEventListener('change', applyFilters);
        filterStatusSelect.addEventListener('change', applyFilters);
        filterDateSelect.addEventListener('change', applyFilters);
        
        // Search input event
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        
        // Refresh button
        refreshButton.addEventListener('click', loadRequests);
        
        // Reset filters button
        resetFiltersButton.addEventListener('click', resetFilters);
        
        // Select all checkbox
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
        
        // Bulk action controls
        bulkActionSelect.addEventListener('change', checkBulkAction);
        applyBulkActionButton.addEventListener('click', applyBulkAction);
        
        // Modal close buttons
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
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
        
        // Reject confirmation
        confirmRejectButton.addEventListener('click', confirmReject);
        
        // Bulk reject confirmation
        confirmBulkRejectButton.addEventListener('click', confirmBulkReject);
    }
    
    function loadRequests() {
        // Show loading state
        showLoading();
        
        // Reset selected items
        selectedRequestIds = [];
        selectAllCheckbox.checked = false;
        updateBulkActionControls();
        
        // Fetch data from API
        const token = localStorage.getItem('auth_token');
        
        fetch(`${apiBaseUrl}/admin/request.php`, {
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
                // Store all requests
                allRequests = data.requests || [];
                
                // Apply filters (this will also update the UI)
                applyFilters();
                
                // Update pending request count in sidebar
                updatePendingRequestCount(data.pending_count || 0);
            } else {
                console.error('API Error:', data.message);
                showEmptyState();
            }
        })
        .catch(error => {
            console.error('Error fetching requests:', error);
            showEmptyState();
        });
    }
    
    function applyFilters() {
        const typeFilter = filterTypeSelect.value;
        const statusFilter = filterStatusSelect.value;
        const dateFilter = filterDateSelect.value;
        const searchQuery = searchInput.value.toLowerCase().trim();
        
        // Apply filters to all requests
        filteredRequests = allRequests.filter(request => {
            // Type filter
            if (typeFilter !== 'all' && request.type !== typeFilter) {
                return false;
            }
            
            // Status filter
            if (statusFilter !== 'all' && request.status !== statusFilter) {
                return false;
            }
            
            // Date filter
            if (dateFilter !== 'all') {
                const requestDate = new Date(request.created_at);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (dateFilter === 'today') {
                    // Check if request was created today
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (!(requestDate >= today && requestDate < tomorrow)) {
                        return false;
                    }
                } else if (dateFilter === 'week') {
                    // Check if request was created this week
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week
                    if (!(requestDate >= startOfWeek && requestDate < endOfWeek)) {
                        return false;
                    }
                } else if (dateFilter === 'month') {
                    // Check if request was created this month
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    if (!(requestDate >= startOfMonth && requestDate <= endOfMonth)) {
                        return false;
                    }
                }
            }
            
            // Search filter (check email, name, or ID)
            if (searchQuery) {
                return (
                    request.email.toLowerCase().includes(searchQuery) ||
                    request.full_name.toLowerCase().includes(searchQuery) ||
                    request.id.toString().includes(searchQuery)
                );
            }
            
            return true;
        });
        
        // Reset to first page
        currentPage = 1;
        
        // Update UI
        renderRequestsList();
        renderPagination();
    }
    
    function renderRequestsList() {
        // Hide loading spinner
        loadingElement.style.display = 'none';
        
        // Check if filtered requests array is empty
        if (filteredRequests.length === 0) {
            showEmptyState();
            return;
        }
        
        // Hide empty state
        emptyStateElement.style.display = 'none';
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * requestsPerPage;
        const endIndex = Math.min(startIndex + requestsPerPage, filteredRequests.length);
        const currentPageRequests = filteredRequests.slice(startIndex, endIndex);
        
        // Update pagination info
        showingStartElement.textContent = filteredRequests.length > 0 ? startIndex + 1 : 0;
        showingEndElement.textContent = endIndex;
        totalItemsElement.textContent = filteredRequests.length;
        
        // Clear existing rows except for the loading row
        const rows = requestsList.querySelectorAll('tr:not(#loading-requests)');
        rows.forEach(row => row.remove());
        
        // Add request rows
        currentPageRequests.forEach((request, index) => {
            const row = createRequestRow(request, startIndex + index);
            requestsList.appendChild(row);
        });
    }
    
    function createRequestRow(request, index) {
        const row = document.createElement('tr');
        row.dataset.id = request.id;
        row.dataset.type = request.type;
        
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
            `<button class="action-btn view" data-id="${request.id}" data-type="${request.type}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
             <button class="action-btn approve" data-id="${request.id}" data-type="${request.type}" title="Duyệt yêu cầu"><i class="fas fa-check"></i></button>
             <button class="action-btn reject" data-id="${request.id}" data-type="${request.type}" title="Từ chối yêu cầu"><i class="fas fa-times"></i></button>` : 
            `<button class="action-btn view" data-id="${request.id}" data-type="${request.type}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>`;
        
        // Create row HTML
        row.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" class="request-checkbox" data-id="${request.id}" data-type="${request.type}" ${request.status !== 'pending' ? 'disabled' : ''}>
            </td>
            <td>${request.id}</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
            <td>${request.full_name}</td>
            <td>${request.email}</td>
            <td>${formattedDate}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    ${actionsHtml}
                </div>
            </td>
        `;
        
        // Add event listeners for action buttons
        setTimeout(() => {
            const viewBtn = row.querySelector('.action-btn.view');
            if (viewBtn) {
                viewBtn.addEventListener('click', () => viewRequest(request.id, request.type));
            }
            
            const approveBtn = row.querySelector('.action-btn.approve');
            if (approveBtn) {
                approveBtn.addEventListener('click', () => approveRequest(request.id, request.type));
            }
            
            const rejectBtn = row.querySelector('.action-btn.reject');
            if (rejectBtn) {
                rejectBtn.addEventListener('click', () => showRejectModal(request.id, request.type));
            }
            
            // Add event listener for checkbox
            const checkbox = row.querySelector('.request-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        selectedRequestIds.push(request.id);
                    } else {
                        selectedRequestIds = selectedRequestIds.filter(id => id !== request.id);
                    }
                    updateBulkActionControls();
                });
            }
        }, 0);
        
        return row;
    }
    
    function renderPagination() {
        paginationContainer.innerHTML = '';
        
        const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
        
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
                renderRequestsList();
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
        
        if (startPage > 1) {
            // First page button
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                currentPage = 1;
                renderRequestsList();
                renderPagination();
            });
            paginationContainer.appendChild(firstPageButton);
            
            if (startPage > 2) {
                // Ellipsis after first page
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
                renderRequestsList();
                renderPagination();
            });
            paginationContainer.appendChild(pageButton);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                // Ellipsis before last page
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationContainer.appendChild(ellipsis);
            }
            
            // Last page button
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                renderRequestsList();
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
                renderRequestsList();
                renderPagination();
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    function viewRequest(id, type) {
        // Fetch request details from API
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
                // Store current request info
                currentRequestId = id;
                currentRequestType = type;
                
                // Populate the modal content
                const detail = data.detail;
                let detailHTML = `
                    <div class="detail-grid">
                        <div class="detail-group">
                            <span class="detail-label">Loại yêu cầu</span>
                            <span class="detail-value">${type === 'register' ? 'Đăng ký tài khoản' : 'Đặt lại mật khẩu'}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Trạng thái</span>
                            <span class="detail-value">
                                <span class="status-${detail.status}">
                                    ${detail.status === 'pending' ? 'Chờ duyệt' : 
                                      detail.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                </span>
                            </span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Họ và tên</span>
                            <span class="detail-value">${detail.full_name}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${detail.email}</span>
                        </div>
                `;
                
                // Add type-specific fields
                if (type === 'register') {
                    detailHTML += `
                        <div class="detail-group">
                            <span class="detail-label">Tên đăng nhập mong muốn</span>
                            <span class="detail-value">${detail.desired_username}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Phòng ban</span>
                            <span class="detail-value">${detail.department}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Chức vụ</span>
                            <span class="detail-value">${detail.position}</span>
                        </div>
                    `;
                }
                
                detailHTML += `
                        <div class="detail-group">
                            <span class="detail-label">Số điện thoại</span>
                            <span class="detail-value">${detail.phone}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">CCCD/CMND</span>
                            <span class="detail-value">${detail.national_id}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Thời gian yêu cầu</span>
                            <span class="detail-value">${new Date(detail.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Lý do</span>
                        <div class="detail-value">${detail.reason}</div>
                    </div>
                `;
                
                // Add admin notes if available
                if (detail.admin_notes) {
                    detailHTML += `
                        <div class="detail-group">
                            <span class="detail-label">Ghi chú của admin</span>
                            <div class="detail-value">${detail.admin_notes}</div>
                        </div>
                    `;
                }
                
                // Add processed info if available
                if (detail.processed_at) {
                    detailHTML += `
                        <div class="detail-group">
                            <span class="detail-label">Xử lý bởi</span>
                            <span class="detail-value">${detail.processed_by_name || 'N/A'}</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Thời gian xử lý</span>
                            <span class="detail-value">${new Date(detail.processed_at).toLocaleString('vi-VN')}</span>
                        </div>
                    `;
                }
                
                requestDetailContent.innerHTML = detailHTML;
                
                // Set the action buttons based on status
                let actionsHTML = '';
                if (detail.status === 'pending') {
                    actionsHTML = `
                        <button class="secondary-button close-modal-btn">Đóng</button>
                        <button class="danger-button" id="detail-reject-btn">Từ chối</button>
                        <button class="apply-button" id="detail-approve-btn">Duyệt yêu cầu</button>
                    `;
                } else {
                    actionsHTML = `
                        <button class="secondary-button close-modal-btn">Đóng</button>
                    `;
                }
                
                requestDetailActions.innerHTML = actionsHTML;
                
                // Add event listeners for action buttons
                const detailApproveBtn = document.getElementById('detail-approve-btn');
                if (detailApproveBtn) {
                    detailApproveBtn.addEventListener('click', () => {
                        requestDetailModal.style.display = 'none';
                        approveRequest(currentRequestId, currentRequestType);
                    });
                }
                
                const detailRejectBtn = document.getElementById('detail-reject-btn');
                if (detailRejectBtn) {
                    detailRejectBtn.addEventListener('click', () => {
                        requestDetailModal.style.display = 'none';
                        showRejectModal(currentRequestId, currentRequestType);
                    });
                }
                
                // Show the modal
                requestDetailModal.style.display = 'block';
            } else {
                alert(data.message || 'Không thể lấy chi tiết yêu cầu.');
            }
        })
        .catch(error => {
            console.error('Error fetching request details:', error);
            alert('Có lỗi xảy ra khi kết nối đến máy chủ.');
        });
    }
    
    function approveRequest(id, type) {
        if (confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
            const token = localStorage.getItem('auth_token');
            const endpoint = type === 'register' ? 'admin/approve_registration.php' : 'admin/approve_password_reset.php';
            
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
                    loadRequests(); // Reload all requests
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
    
    function showRejectModal(id, type) {
        // Store current request info
        currentRequestId = id;
        currentRequestType = type;
        
        // Clear previous input and errors
        rejectReasonTextarea.value = '';
        rejectReasonError.textContent = '';
        
        // Show the modal
        rejectModal.style.display = 'block';
    }
    
    function confirmReject() {
        const reason = rejectReasonTextarea.value.trim();
        
        // Validate reason
        if (!reason) {
            rejectReasonError.textContent = 'Vui lòng nhập lý do từ chối.';
            return;
        }
        
        // Clear error message
        rejectReasonError.textContent = '';
        
        // Send rejection request
        const token = localStorage.getItem('auth_token');
        const endpoint = currentRequestType === 'register' ? 'admin/reject_registration.php' : 'admin/reject_password_reset.php';
        
        fetch(`${apiBaseUrl}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: currentRequestId,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Đã từ chối yêu cầu.');
                rejectModal.style.display = 'none';
                loadRequests(); // Reload all requests
            } else {
                rejectReasonError.textContent = data.message || 'Có lỗi xảy ra khi từ chối yêu cầu.';
            }
        })
        .catch(error => {
            console.error('Error rejecting request:', error);
            rejectReasonError.textContent = 'Có lỗi xảy ra khi kết nối đến máy chủ.';
        });
    }
    
    function toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.request-checkbox:not([disabled])');
        const isChecked = selectAllCheckbox.checked;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            
            // Update selectedRequestIds
            const id = checkbox.getAttribute('data-id');
            if (isChecked) {
                if (!selectedRequestIds.includes(id)) {
                    selectedRequestIds.push(id);
                }
            } else {
                selectedRequestIds = selectedRequestIds.filter(selectedId => selectedId !== id);
            }
        });
        
        updateBulkActionControls();
    }
    
    function updateBulkActionControls() {
        if (selectedRequestIds.length > 0) {
            bulkActionSelect.disabled = false;
            applyBulkActionButton.disabled = bulkActionSelect.value === '';
        } else {
            bulkActionSelect.disabled = true;
            applyBulkActionButton.disabled = true;
        }
    }
    
    function checkBulkAction() {
        applyBulkActionButton.disabled = bulkActionSelect.value === '';
    }
    
    function applyBulkAction() {
        const action = bulkActionSelect.value;
        
        if (!action || selectedRequestIds.length === 0) {
            return;
        }
        
        if (action === 'approve') {
            if (confirm(`Bạn có chắc chắn muốn duyệt ${selectedRequestIds.length} yêu cầu đã chọn?`)) {
                bulkApprove();
            }
        } else if (action === 'reject') {
            showBulkRejectModal();
        }
    }
    
    function bulkApprove() {
        const token = localStorage.getItem('auth_token');
        
        fetch(`${apiBaseUrl}/admin/bulk_approve.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_ids: selectedRequestIds
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Đã duyệt thành công ${data.approved_count || 0} yêu cầu.`);
                loadRequests(); // Reload all requests
            } else {
                alert(data.message || 'Có lỗi xảy ra khi duyệt các yêu cầu.');
            }
        })
        .catch(error => {
            console.error('Error bulk approving requests:', error);
            alert('Có lỗi xảy ra khi kết nối đến máy chủ.');
        });
    }
    
    function showBulkRejectModal() {
        // Update the count
        bulkRejectCount.textContent = selectedRequestIds.length;
        
        // Clear previous input and errors
        bulkRejectReasonTextarea.value = '';
        bulkRejectReasonError.textContent = '';
        
        // Show the modal
        bulkRejectModal.style.display = 'block';
    }
    
    function confirmBulkReject() {
        const reason = bulkRejectReasonTextarea.value.trim();
        
        // Validate reason
        if (!reason) {
            bulkRejectReasonError.textContent = 'Vui lòng nhập lý do từ chối.';
            return;
        }
        
        // Clear error message
        bulkRejectReasonError.textContent = '';
        
        // Send bulk rejection request
        const token = localStorage.getItem('auth_token');
        
        fetch(`${apiBaseUrl}/admin/bulk_reject.php`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request_ids: selectedRequestIds,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Đã từ chối thành công ${data.rejected_count || 0} yêu cầu.`);
                bulkRejectModal.style.display = 'none';
                loadRequests(); // Reload all requests
            } else {
                bulkRejectReasonError.textContent = data.message || 'Có lỗi xảy ra khi từ chối các yêu cầu.';
            }
        })
        .catch(error => {
            console.error('Error bulk rejecting requests:', error);
            bulkRejectReasonError.textContent = 'Có lỗi xảy ra khi kết nối đến máy chủ.';
        });
    }
    
    function resetFilters() {
        filterTypeSelect.value = 'all';
        filterStatusSelect.value = 'all';
        filterDateSelect.value = 'all';
        searchInput.value = '';
        
        applyFilters();
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
    
    function updatePendingRequestCount(count) {
        const requestCountElement = document.getElementById('request-count');
        if (requestCountElement) {
            requestCountElement.textContent = count;
            
            // If no pending requests, hide the badge
            requestCountElement.style.display = count > 0 ? 'inline' : 'none';
        }
    }
    
    function formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return `Hôm nay, ${formatTime(date)}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Hôm qua, ${formatTime(date)}`;
        } else {
            return `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}, ${formatTime(date)}`;
        }
    }
    
    function formatTime(date) {
        return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }
    
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    // Debounce function to limit how often a function can be called
    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
});
