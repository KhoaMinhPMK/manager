document.addEventListener('DOMContentLoaded', function() {
  // Thêm style cho notification
  addNotificationStyles();
});

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
  `;
  document.head.appendChild(style);
}
