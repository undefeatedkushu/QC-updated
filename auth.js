// auth.js - Authentication helper functions
class AuthManager {
    static isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static getUserType() {
        const user = this.getCurrentUser();
        return user ? user.type : null;
    }

    static setCurrentUser(userInfo) {
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('patient_appointments');
        localStorage.removeItem('doctor_schedule');
    }

    static redirectToSignIn() {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
    }

    static checkAuthAndRedirect(requiredType) {
        if (!this.isLoggedIn()) {
            this.redirectToSignIn();
            return false;
        }
        
        const userType = this.getUserType();
        if (requiredType && userType !== requiredType) {
            alert(`Access denied. This page is for ${requiredType}s only.`);
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
}
