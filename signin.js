document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const signinBtn = document.querySelector('.signin-btn');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePassword.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Form submission with authentication
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(signinForm);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Show loading state
        signinBtn.classList.add('loading');
        signinBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Hide loading state
            signinBtn.classList.remove('loading');
            signinBtn.disabled = false;
            
            if (email && password) {
                // Determine user type and set authentication
                let userType = 'patient'; // default
                let redirectUrl = 'patient.html';
                let userName = email.split('@')[0];
                
                if (email.includes('admin')) {
                    userType = 'admin';
                    redirectUrl = 'admin.html';
                } else if (email.includes('doctor') || email.includes('dr.')) {
                    userType = 'doctor';
                    redirectUrl = 'doctor.html';
                }
                
                // Set current user in localStorage using AuthManager
                if (typeof AuthManager !== 'undefined') {
                    AuthManager.setCurrentUser({
                        email: email,
                        name: userName,
                        type: userType,
                        loginTime: new Date().toISOString()
                    });
                } else {
                    // Fallback if AuthManager not loaded
                    localStorage.setItem('currentUser', JSON.stringify({
                        email: email,
                        name: userName,
                        type: userType,
                        loginTime: new Date().toISOString()
                    }));
                }
                
                showNotification('Sign in successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                showNotification('Please fill in all fields', 'error');
            }
        }, 1500);
    });

    // Input validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearError);
    });

    function validateInput(e) {
        const input = e.target;
        const value = input.value.trim();
        
        if (input.type === 'email') {
            if (!isValidEmail(value)) {
                showInputError(input, 'Please enter a valid email address');
            }
        }
        
        if (input.type === 'password') {
            if (value.length < 6) {
                showInputError(input, 'Password must be at least 6 characters');
            }
        }
    }

    function showInputError(input, message) {
        clearError({ target: input });
        
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e53e3e';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        
        input.parentNode.parentNode.appendChild(errorDiv);
    }

    function clearError(e) {
        const input = e.target;
        input.classList.remove('error');
        const errorMessage = input.parentNode.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                    style.remove();
                }
            }, 300);
        }, 3000);
    }
});
