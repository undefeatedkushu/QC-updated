document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                mobileMenu.classList.add('show');
                mobileMenuBtn.classList.add('active');
            } else {
                mobileMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // Close mobile menu when clicking on links
    mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            isMenuOpen = false;
            mobileMenu.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            if (isMenuOpen) {
                isMenuOpen = false;
                mobileMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
});

// Portal access functions with authentication check
function checkPatientAccess() {
    if (typeof AuthManager !== 'undefined') {
        if (AuthManager.isLoggedIn() && AuthManager.getUserType() === 'patient') {
            window.location.href = 'patient.html';
        } else {
            window.location.href = 'signin.html';
        }
    } else {
        // Fallback - redirect to signin
        window.location.href = 'signin.html';
    }
}

function checkDoctorAccess() {
    if (typeof AuthManager !== 'undefined') {
        if (AuthManager.isLoggedIn() && AuthManager.getUserType() === 'doctor') {
            window.location.href = 'doctor.html';
        } else {
            window.location.href = 'signin.html';
        }
    } else {
        // Fallback - redirect to signin
        window.location.href = 'signin.html';
    }
}
