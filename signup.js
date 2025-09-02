document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupBtn = document.querySelector('.signup-btn');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePassword);
    });

    toggleConfirmPassword.addEventListener('click', () => {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword);
    });

    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        const icon = button.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }

    // Form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData(signupForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };
        
        // Show loading state
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Hide loading state
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
            
            // Simulate successful registration
            showNotification('Account created successfully! Please check your email for verification.', 'success');
            
            // Redirect to signin after success
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        }, 2000);
    });

    // Input validation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearError);
    });

    // Password confirmation validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    function validateForm() {
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput({ target: input }) && input.hasAttribute('required')) {
                isValid = false;
            }
        });
        
        if (!validatePasswordMatch()) {
            isValid = false;
        }
        
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function validateInput(e) {
        const input = e.target;
        const value = input.value.trim();
        let isValid = true;
        
        // Required field validation
        if (input.hasAttribute('required') && !value) {
            showInputError(input, 'This field is required');
            isValid = false;
        }
        
        // Specific field validations
        switch (input.type) {
            case 'email':
                if (value && !isValidEmail(value)) {
                    showInputError(input, 'Please enter a valid email address');
                    isValid = false;
                }
                break;
                
            case 'tel':
                if (value && !isValidPhone(value)) {
                    showInputError(input, 'Please enter a valid phone number');
                    isValid = false;
                }
                break;
                
            case 'password':
                if (input.id === 'password') {
                    if (value && value.length < 8) {
                        showInputError(input, 'Password must be at least 8 characters');
                        isValid = false;
                    }
                    if (value && !isStrongPassword(value)) {
                        showInputError(input, 'Password must contain uppercase, lowercase, number and special character');
                        isValid = false;
                    }
                }
                break;
                
            case 'text':
                if (input.id === 'firstName' || input.id === 'lastName') {
                    if (value && value.length < 2) {
                        showInputError(input, 'Name must be at least 2 characters');
                        isValid = false;
                    }
                }
                break;
        }
        
        return isValid;
    }

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showInputError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }
        
        return true;
    }

    function showInputError(input, message) {
        clearError({ target: input });
        
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
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

    // Validation helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    function isStrongPassword(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
        return strongRegex.test(password);
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
        
        // Add styles
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
        
        // Add animation styles
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
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                    style.remove();
                }
            }, 300);
        }, 5000);
    }
});
