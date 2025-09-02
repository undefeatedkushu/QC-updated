// Enhanced Admin Authentication & Access Protection
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.adminData = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.startSessionTimer();
    }

    // Check if user is authenticated
    checkAuthentication() {
        const isAdmin = localStorage.getItem("isAdmin");
        const adminData = localStorage.getItem("adminData");
        const sessionStart = localStorage.getItem("sessionStart");

        if (isAdmin === "true" && adminData && sessionStart) {
            // Check if session is still valid
            const currentTime = new Date().getTime();
            const sessionStartTime = parseInt(sessionStart, 10);
            
            if (currentTime - sessionStartTime < this.sessionTimeout) {
                this.isAuthenticated = true;
                this.adminData = JSON.parse(adminData);
                this.updateSessionActivity();
                return true;
            } else {
                // Session expired
                this.logout('Session expired. Please login again.');
                return false;
            }
        } else {
            // Not authenticated, redirect to login
            this.redirectToLogin();
            return false;
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Activity tracking for session timeout
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => this.updateSessionActivity(), true);
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAuthentication();
            }
        });

        // Before page unload - clean up
        window.addEventListener('beforeunload', () => {
            this.updateSessionActivity();
        });
    }

    // Update session activity timestamp
    updateSessionActivity() {
        if (this.isAuthenticated) {
            localStorage.setItem("lastActivity", new Date().getTime().toString());
        }
    }

    // Start session timer
    startSessionTimer() {
        // Check session validity every 5 minutes
        setInterval(() => {
            if (this.isAuthenticated) {
                const lastActivity = localStorage.getItem("lastActivity");
                const currentTime = new Date().getTime();
                
                if (lastActivity) {
                    const timeSinceActivity = currentTime - parseInt(lastActivity, 10);
                    
                    // Show warning 5 minutes before timeout
                    if (timeSinceActivity > (this.sessionTimeout - 5 * 60 * 1000)) {
                        this.showSessionWarning();
                    }
                    
                    // Logout if session expired
                    if (timeSinceActivity > this.sessionTimeout) {
                        this.logout('Session expired due to inactivity.');
                    }
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    // Show session timeout warning
    showSessionWarning() {
        if (this.warningShown) return;
        
        this.warningShown = true;
        const warning = this.createWarningDialog();
        document.body.appendChild(warning);
        
        // Auto-remove warning after 1 minute
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
            this.warningShown = false;
        }, 60000);
    }

    // Create session warning dialog
    createWarningDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'session-warning-dialog';
        dialog.innerHTML = `
            <div class="session-warning-content">
                <div class="warning-icon">⚠️</div>
                <h3>Session Expiring Soon</h3>
                <p>Your session will expire in 5 minutes due to inactivity.</p>
                <div class="warning-actions">
                    <button class="btn-extend-session">Extend Session</button>
                    <button class="btn-logout-now">Logout Now</button>
                </div>
            </div>
        `;
        
        // Add styles
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        const content = dialog.querySelector('.session-warning-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-width: 400px;
        `;
        
        // Event listeners
        dialog.querySelector('.btn-extend-session').addEventListener('click', () => {
            this.updateSessionActivity();
            dialog.remove();
            this.warningShown = false;
        });
        
        dialog.querySelector('.btn-logout-now').addEventListener('click', () => {
            this.logout();
        });
        
        return dialog;
    }

    // Login method (for programmatic login)
    login(adminData = null) {
        const defaultAdminData = {
            id: 'admin_001',
            name: 'System Administrator',
            email: 'admin@quickcare.com',
            role: 'admin',
            lastLogin: new Date().toISOString()
        };
        
        this.adminData = adminData || defaultAdminData;
        this.isAuthenticated = true;
        
        // Store authentication data
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminData", JSON.stringify(this.adminData));
        localStorage.setItem("sessionStart", new Date().getTime().toString());
        localStorage.setItem("lastActivity", new Date().getTime().toString());
        
        // Show success message
        this.showNotification('Login successful! Welcome back.', 'success');
        
        return true;
    }

    // Enhanced logout method
logout(message = '') {
    // Clear authentication status and data
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminData');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('lastActivity');
    this.isAuthenticated = false;
    this.adminData = null;
    
    if (message) {
        alert(message);
    }
    
    // Redirect to index.html 
    window.location.href = 'index.html';
}


    // Clear cached application data
    clearCachedData() {
        // Clear specific application data (optional)
        const keysToRemove = [
            'doctors',
            'quickcare_hospitals',
            'appointments',
            'users'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Redirect to index.html
redirectToLogin() {
    window.location.href = 'index.html';
}

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    notification.remove();
                    style.remove();
                }, 300);
            }
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
            style.remove();
        });
    }

    // Get current admin data
    getAdminData() {
        return this.adminData;
    }

    // Check if current user has specific permission
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.adminData) return false;
        
        // For now, all admins have all permissions
        // This can be extended for role-based permissions
        return this.adminData.role === 'admin';
    }

    // Refresh authentication (extend session)
    refreshAuth() {
        if (this.isAuthenticated) {
            localStorage.setItem("sessionStart", new Date().getTime().toString());
            this.updateSessionActivity();
            return true;
        }
        return false;
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Create global auth instance
    window.adminAuth = new AdminAuth();
    
    // Check for logout message
    const logoutMessage = sessionStorage.getItem('logoutMessage');
    if (logoutMessage) {
        // Only show on login page
        if (window.location.pathname.includes('admin-signin.html')) {
            setTimeout(() => {
                window.adminAuth.showNotification(logoutMessage, 'info');
                sessionStorage.removeItem('logoutMessage');
            }, 100);
        }
    }
    
    // Add user info to header if authenticated
    if (window.adminAuth.isAuthenticated) {
        addUserInfoToHeader();
    }
});

// Helper function to add user info to header
function addUserInfoToHeader() {
    const adminData = window.adminAuth.getAdminData();
    if (!adminData) return;
    
    const header = document.querySelector('.admin-header .header-content');
    if (header) {
        const userInfo = document.createElement('div');
        userInfo.className = 'admin-user-info';
        userInfo.innerHTML = `
            <span class="user-name">Welcome, ${adminData.name}</span>
            <span class="user-role">${adminData.role}</span>
        `;
        
        userInfo.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-right: 1rem;
            font-size: 0.875rem;
        `;
        
        // Insert before logout button
        const logoutBtn = header.querySelector('#logoutBtn');
        if (logoutBtn) {
            header.insertBefore(userInfo, logoutBtn);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}
