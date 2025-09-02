// Doctor Portal JavaScript with Authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated before loading portal
    if (typeof AuthManager !== 'undefined') {
        if (!AuthManager.checkAuthAndRedirect('doctor')) {
            return; // Stop execution if not authenticated
        }
    } else {
        // Fallback authentication check
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            alert('Please sign in to access this page');
            window.location.href = 'signin.html';
            return;
        }
        const user = JSON.parse(currentUser);
        if (user.type !== 'doctor') {
            alert('Access denied. This page is for doctors only.');
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Initialize doctor portal only if authenticated
    window.doctorPortal = new DoctorPortal();
});

class DoctorPortal {
    constructor() {
        // Get current user info and update welcome message
        const currentUser = typeof AuthManager !== 'undefined' ? 
            AuthManager.getCurrentUser() : 
            JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            const welcomeName = document.querySelector('.doctor-name');
            if (welcomeName) {
                welcomeName.textContent = currentUser.name || currentUser.email.split('@')[0];
            }
        }
        
        this.schedule = JSON.parse(localStorage.getItem('doctor_schedule')) || {};
        this.patients = JSON.parse(localStorage.getItem('doctor_patients')) || [];
        this.appointments = JSON.parse(localStorage.getItem('doctor_appointments')) || [];
        
        this.initializeDemoData();
        this.initializeEventListeners();
        this.loadData();
    }

    initializeDemoData() {
        if (this.patients.length === 0) {
            this.patients = [
                {
                    id: '1',
                    name: 'John Doe',
                    lastVisit: '2025-08-20',
                    nextAppointment: '2025-09-10',
                    condition: 'Hypertension',
                    phone: '+91-9876543210',
                    age: 45
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    lastVisit: '2025-08-25',
                    nextAppointment: '2025-09-05',
                    condition: 'Diabetes',
                    phone: '+91-9876543211',
                    age: 52
                },
                {
                    id: '3',
                    name: 'Mike Johnson',
                    lastVisit: '2025-08-30',
                    nextAppointment: '2025-09-08',
                    condition: 'Chest Pain',
                    phone: '+91-9876543212',
                    age: 38
                },
                {
                    id: '4',
                    name: 'Sarah Wilson',
                    lastVisit: '2025-08-15',
                    nextAppointment: '',
                    condition: 'Regular Checkup',
                    phone: '+91-9876543213',
                    age: 29
                }
            ];
            this.savePatients();
        }

        if (this.appointments.length === 0) {
            this.appointments = [
                {
                    id: '1',
                    patientName: 'John Doe',
                    date: '2025-09-01',
                    time: '10:30',
                    type: 'Follow-up',
                    status: 'Confirmed'
                },
                {
                    id: '2',
                    patientName: 'Jane Smith',
                    date: '2025-09-01',
                    time: '11:00',
                    type: 'Consultation',
                    status: 'Confirmed'
                },
                {
                    id: '3',
                    patientName: 'Mike Johnson',
                    date: '2025-09-01',
                    time: '14:30',
                    type: 'New Patient',
                    status: 'Pending'
                }
            ];
            this.saveAppointments();
        }

        // Initialize schedule for current date
        const today = new Date().toISOString().split('T')[0];
        if (!this.schedule[today]) {
            this.schedule[today] = this.generateTimeSlots('09:00', '17:00', 30);
            this.saveSchedule();
        }
    }

    initializeEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
        }

        // Logout button functionality
        const logoutBtns = document.querySelectorAll('.logout-btn, .mobile-menu a[href="index.html"]');
        logoutBtns.forEach(btn => {
            if (btn.textContent.includes('Logout')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        });

        // Schedule date picker
        const scheduleDatePicker = document.getElementById('scheduleDate');
        if (scheduleDatePicker) {
            scheduleDatePicker.value = new Date().toISOString().split('T')[0];
            scheduleDatePicker.addEventListener('change', () => {
                this.loadSchedule(scheduleDatePicker.value);
            });
        }

        // Patient search and filter
        const patientSearch = document.getElementById('patientSearch');
        const patientFilter = document.getElementById('patientFilter');

        if (patientSearch) {
            patientSearch.addEventListener('input', () => this.filterPatients());
        }
        if (patientFilter) {
            patientFilter.addEventListener('change', () => this.filterPatients());
        }

        // Availability form
        const availabilityForm = document.getElementById('availabilityForm');
        if (availabilityForm) {
            availabilityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAvailabilitySubmit();
            });
        }

        // Earnings period selector
        const earningsPeriod = document.getElementById('earningsPeriod');
        if (earningsPeriod) {
            earningsPeriod.addEventListener('change', () => {
                this.updateEarnings(earningsPeriod.value);
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav a[href^="#"]').forEach(anchor => {
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
    }

    // Proper logout function with authentication cleanup
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            if (typeof AuthManager !== 'undefined') {
                AuthManager.logout();
            } else {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('doctor_schedule');
                localStorage.removeItem('doctor_patients');
                localStorage.removeItem('doctor_appointments');
            }
            
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    loadData() {
        this.loadSchedule(new Date().toISOString().split('T')[0]);
        this.loadPatients();
        this.loadRecentPayments();
        this.updateStats();
    }

    generateTimeSlots(startTime, endTime, duration) {
        const slots = [];
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        while (start < end) {
            const timeString = start.toTimeString().slice(0, 5);
            slots.push({
                time: timeString,
                status: 'available',
                patient: null
            });
            start.setMinutes(start.getMinutes() + duration);
        }
        
        return slots;
    }

    loadSchedule(date) {
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (!timeSlotsContainer) return;

        const daySchedule = this.schedule[date] || [];
        
        if (daySchedule.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No schedule set for this date</h3>
                    <p>Click "Set Availability" to add time slots</p>
                </div>
            `;
            return;
        }

        timeSlotsContainer.innerHTML = '';
        
        daySchedule.forEach((slot, index) => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.status}`;
            slotElement.innerHTML = `
                <div class="time">${this.formatTime(slot.time)}</div>
                <div class="status">
                    ${slot.status === 'booked' ? slot.patient : 
                      slot.status === 'available' ? 'Available' : 'Unavailable'}
                </div>
            `;
            
            if (slot.status === 'available') {
                slotElement.addEventListener('click', () => {
                    this.toggleSlotAvailability(date, index);
                });
            }
            
            timeSlotsContainer.appendChild(slotElement);
        });
    }

    toggleSlotAvailability(date, slotIndex) {
        if (!this.schedule[date]) return;
        
        const slot = this.schedule[date][slotIndex];
        if (slot.status === 'available') {
            slot.status = 'unavailable';
        } else if (slot.status === 'unavailable') {
            slot.status = 'available';
        }
        
        this.saveSchedule();
        this.loadSchedule(date);
    }

    loadPatients() {
        this.filterPatients();
    }

    filterPatients() {
        const searchTerm = document.getElementById('patientSearch')?.value.toLowerCase() || '';
        const filter = document.getElementById('patientFilter')?.value || '';
        
        let filteredPatients = this.patients.filter(patient => {
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.condition.toLowerCase().includes(searchTerm);
            
            let matchesFilter = true;
            if (filter === 'recent') {
                const lastVisit = new Date(patient.lastVisit);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesFilter = lastVisit > monthAgo;
            } else if (filter === 'upcoming') {
                matchesFilter = patient.nextAppointment !== '';
            }
            
            return matchesSearch && matchesFilter;
        });

        this.renderPatients(filteredPatients);
    }

    renderPatients(patients) {
        const tableBody = document.querySelector('#patientsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (patients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                        No patients found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div>
                        <strong>${patient.name}</strong>
                        <br><small style="color: #666;">Age: ${patient.age} • ${patient.phone}</small>
                    </div>
                </td>
                <td>${this.formatDate(patient.lastVisit)}</td>
                <td>${patient.nextAppointment ? this.formatDate(patient.nextAppointment) : 'Not scheduled'}</td>
                <td>${patient.condition}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="doctorPortal.viewPatient('${patient.id}')">
                        View Details
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    loadRecentPayments() {
        const paymentsList = document.getElementById('paymentsList');
        if (!paymentsList) return;

        const recentPayments = [
            { patient: 'John Doe', date: '2025-09-01', amount: 500 },
            { patient: 'Jane Smith', date: '2025-08-30', amount: 500 },
            { patient: 'Mike Johnson', date: '2025-08-28', amount: 500 },
            { patient: 'Sarah Wilson', date: '2025-08-25', amount: 500 }
        ];

        paymentsList.innerHTML = '';
        
        recentPayments.forEach(payment => {
            const paymentItem = document.createElement('div');
            paymentItem.className = 'payment-item';
            paymentItem.innerHTML = `
                <div class="payment-details">
                    <h4>${payment.patient}</h4>
                    <p>Consultation - ${this.formatDate(payment.date)}</p>
                </div>
                <div class="payment-amount">₹${payment.amount}</div>
            `;
            paymentsList.appendChild(paymentItem);
        });
    }

    updateStats() {
        // These would typically come from a backend API
        const stats = {
            todayAppointments: this.appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
            totalPatients: this.patients.length,
            monthlyEarnings: '₹63,500',
            rating: '4.8'
        };

        const todayElement = document.getElementById('todayAppointments');
        const totalElement = document.getElementById('totalPatients');
        const earningsElement = document.getElementById('monthlyEarnings');
        const ratingElement = document.getElementById('rating');

        if (todayElement) todayElement.textContent = stats.todayAppointments;
        if (totalElement) totalElement.textContent = stats.totalPatients;
        if (earningsElement) earningsElement.textContent = stats.monthlyEarnings;
        if (ratingElement) ratingElement.textContent = stats.rating;
    }

    updateEarnings(period) {
        // This would typically fetch data from backend based on period
        const earningsData = {
            month: { consultations: 127, earnings: '₹63,500', average: '₹500' },
            quarter: { consultations: 380, earnings: '₹1,90,000', average: '₹500' },
            year: { consultations: 1520, earnings: '₹7,60,000', average: '₹500' }
        };

        const data = earningsData[period] || earningsData.month;
        
        const consultationElement = document.querySelector('.earnings-grid .earnings-card:nth-child(1) .earnings-number');
        const earningsNumberElement = document.querySelector('.earnings-grid .earnings-card:nth-child(2) .earnings-number');
        const averageElement = document.querySelector('.earnings-grid .earnings-card:nth-child(3) .earnings-number');

        if (consultationElement) consultationElement.textContent = data.consultations;
        if (earningsNumberElement) earningsNumberElement.textContent = data.earnings;
        if (averageElement) averageElement.textContent = data.average;
    }

    handleAvailabilitySubmit() {
        const date = document.getElementById('availabilityDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const duration = parseInt(document.getElementById('slotDuration').value);

        if (!date || !startTime || !endTime) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.schedule[date] = this.generateTimeSlots(startTime, endTime, duration);
        this.saveSchedule();
        
        // Reload schedule if viewing the same date
        const currentDate = document.getElementById('scheduleDate').value;
        if (currentDate === date) {
            this.loadSchedule(date);
        }

        window.closeAvailabilityModal();
        this.showNotification('Availability updated successfully!', 'success');
    }

    viewPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            alert(`Patient Details:\n\nName: ${patient.name}\nAge: ${patient.age}\nPhone: ${patient.phone}\nLast Visit: ${this.formatDate(patient.lastVisit)}\nCondition: ${patient.condition}\nNext Appointment: ${patient.nextAppointment ? this.formatDate(patient.nextAppointment) : 'Not scheduled'}`);
        }
    }

    // Utility functions
    saveSchedule() {
        localStorage.setItem('doctor_schedule', JSON.stringify(this.schedule));
    }

    savePatients() {
        localStorage.setItem('doctor_patients', JSON.stringify(this.patients));
    }

    saveAppointments() {
        localStorage.setItem('doctor_appointments', JSON.stringify(this.appointments));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatTime(timeString) {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    showNotification(message, type) {
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
}

// Modal functions
function showAvailabilityModal() {
    const modal = document.getElementById('availabilityModal');
    modal.classList.add('show');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('availabilityDate').min = today;
    document.getElementById('availabilityDate').value = today;
}

function closeAvailabilityModal() {
    const modal = document.getElementById('availabilityModal');
    modal.classList.remove('show');
    document.getElementById('availabilityForm').reset();
}
