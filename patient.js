
// Patient Portal JavaScript with Authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated before loading portal
    if (typeof AuthManager !== 'undefined') {
        if (!AuthManager.checkAuthAndRedirect('patient')) {
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
        if (user.type !== 'patient') {
            alert('Access denied. This page is for patients only.');
            window.location.href = 'index.html';
            return;
        }
    }
    
    // Initialize patient portal only if authenticated
    window.patientPortal = new PatientPortal();
});

class PatientPortal {
    constructor() {
        // Get current user info and update welcome message
        const currentUser = typeof AuthManager !== 'undefined' ? 
            AuthManager.getCurrentUser() : 
            JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            const welcomeName = document.querySelector('.patient-name');
            if (welcomeName) {
                welcomeName.textContent = currentUser.name || currentUser.email.split('@')[0];
            }
        }
        
        this.appointments = JSON.parse(localStorage.getItem('patient_appointments')) || [];
        this.doctors = JSON.parse(localStorage.getItem('doctors')) || [];
        this.filteredDoctors = [];
        
        this.initializeDemoData();
        this.initializeEventListeners();
        this.loadData();
    }

    initializeDemoData() {
        if (this.appointments.length === 0) {
            this.appointments = [
                {
                    id: '1',
                    date: '2025-09-05',
                    time: '10:15',
                    doctor: 'Dr. Rajesh Sharma',
                    hospital: 'Apollo Speciality',
                    specialty: 'Cardiology',
                    status: 'Confirmed'
                },
                {
                    id: '2',
                    date: '2025-09-08',
                    time: '14:00',
                    doctor: 'Dr. Priya Singh',
                    hospital: 'Fortis Healthcare',
                    specialty: 'Pediatrics',
                    status: 'Pending'
                }
            ];
            this.saveAppointments();
        }

        if (this.doctors.length === 0) {
            this.doctors = [
                {
                    id: '1',
                    name: 'Dr. Rajesh Sharma',
                    specialty: 'Cardiology',
                    hospital: 'Apollo Speciality',
                    city: 'Delhi',
                    experience: 12,
                    rating: 4.8,
                    fee: 500
                },
                {
                    id: '2',
                    name: 'Dr. Priya Singh',
                    specialty: 'Pediatrics',
                    hospital: 'Fortis Healthcare',
                    city: 'Mumbai',
                    experience: 8,
                    rating: 4.6,
                    fee: 400
                },
                {
                    id: '3',
                    name: 'Dr. Sunita Nair',
                    specialty: 'Dermatology',
                    hospital: 'Green Valley Hospital',
                    city: 'Mumbai',
                    experience: 10,
                    rating: 4.7,
                    fee: 450
                },
                {
                    id: '4',
                    name: 'Dr. Rohan Shah',
                    specialty: 'Orthopedics',
                    hospital: 'Metro Care Clinic',
                    city: 'Delhi',
                    experience: 15,
                    rating: 4.9,
                    fee: 600
                },
                {
                    id: '5',
                    name: 'Dr. Kavita Rao',
                    specialty: 'Neurology',
                    hospital: 'City General Hospital',
                    city: 'Bengaluru',
                    experience: 6,
                    rating: 4.5,
                    fee: 350
                }
            ];
            localStorage.setItem('doctors', JSON.stringify(this.doctors));
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

        // Search and filter functionality
        const doctorSearch = document.getElementById('doctorSearch');
        const cityFilter = document.getElementById('cityFilter');
        const specialtyFilter = document.getElementById('specialtyFilter');

        if (doctorSearch) {
            doctorSearch.addEventListener('input', () => this.filterDoctors());
        }
        if (cityFilter) {
            cityFilter.addEventListener('change', () => this.filterDoctors());
        }
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', () => this.filterDoctors());
        }

        // Booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmit();
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
                localStorage.removeItem('patient_appointments');
            }
            
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    loadData() {
        this.loadAppointments();
        this.loadDoctors();
        this.populateDoctorSelect();
    }

    loadAppointments() {
        const tableBody = document.querySelector('#appointmentsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.appointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        No appointments scheduled. <a href="#doctors" style="color: #667EEA;">Book your first appointment</a>
                    </td>
                </tr>
            `;
            return;
        }

        this.appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(appointment.date)}</td>
                <td>${appointment.time}</td>
                <td>
                    <div>
                        <strong>${appointment.doctor}</strong>
                        <br><small style="color: #666;">${appointment.specialty}</small>
                    </div>
                </td>
                <td>${appointment.hospital}</td>
                <td><span class="status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="patientPortal.viewAppointment('${appointment.id}')">
                        View
                    </button>
                    ${appointment.status === 'Pending' ? `
                        <button class="btn btn-small" style="background: #ef4444; color: white;" onclick="patientPortal.cancelAppointment('${appointment.id}')">
                            Cancel
                        </button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    loadDoctors() {
        this.filterDoctors();
    }

    filterDoctors() {
        const searchTerm = document.getElementById('doctorSearch')?.value.toLowerCase() || '';
        const cityFilter = document.getElementById('cityFilter')?.value || '';
        const specialtyFilter = document.getElementById('specialtyFilter')?.value || '';

        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = !searchTerm || 
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialty.toLowerCase().includes(searchTerm) ||
                doctor.hospital.toLowerCase().includes(searchTerm);

            const matchesCity = !cityFilter || doctor.city === cityFilter;
            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;

            return matchesSearch && matchesCity && matchesSpecialty;
        });

        this.renderDoctors();
    }

    renderDoctors() {
        const doctorsGrid = document.getElementById('doctorsGrid');
        if (!doctorsGrid) return;

        doctorsGrid.innerHTML = '';

        if (this.filteredDoctors.length === 0) {
            doctorsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        this.filteredDoctors.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';
            doctorCard.innerHTML = `
                <div class="doctor-header">
                    <div class="doctor-avatar">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <div class="doctor-info">
                        <h3>${doctor.name}</h3>
                        <p>${doctor.specialty}</p>
                    </div>
                </div>
                <div class="doctor-details">
                    <p><i class="fas fa-hospital"></i> ${doctor.hospital}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${doctor.city}</p>
                    <p><i class="fas fa-star"></i> ${doctor.rating}/5.0 • ${doctor.experience} years exp.</p>
                    <p><i class="fas fa-rupee-sign"></i> ₹${doctor.fee} consultation</p>
                </div>
                <button class="btn btn-book btn-small" style="width: 100%;" onclick="patientPortal.bookAppointment('${doctor.id}')">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
            `;
            doctorsGrid.appendChild(doctorCard);
        });
    }

    populateDoctorSelect() {
        const select = document.getElementById('modalDoctorSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Select Doctor</option>';
        this.doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.name} - ${doctor.specialty}`;
            select.appendChild(option);
        });
    }

    bookAppointment(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        const select = document.getElementById('modalDoctorSelect');
        select.value = doctorId;

        window.showBookingModal();
    }

    handleBookingSubmit() {
        const doctorId = document.getElementById('modalDoctorSelect').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const reason = document.getElementById('visitReason').value;

        if (!doctorId || !date || !time) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const doctor = this.doctors.find(d => d.id === doctorId);
        const newAppointment = {
            id: Date.now().toString(),
            date: date,
            time: time,
            doctor: doctor.name,
            hospital: doctor.hospital,
            specialty: doctor.specialty,
            status: 'Pending',
            reason: reason
        };

        this.appointments.push(newAppointment);
        this.saveAppointments();
        this.loadAppointments();

        window.closeBookingModal();
        this.showNotification('Appointment booked successfully!', 'success');
    }

    cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            this.appointments = this.appointments.filter(a => a.id !== appointmentId);
            this.saveAppointments();
            this.loadAppointments();
            this.showNotification('Appointment cancelled', 'success');
        }
    }

    viewAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            alert(`Appointment Details:\n\nDoctor: ${appointment.doctor}\nDate: ${this.formatDate(appointment.date)}\nTime: ${appointment.time}\nHospital: ${appointment.hospital}\nStatus: ${appointment.status}`);
        }
    }

    saveAppointments() {
        localStorage.setItem('patient_appointments', JSON.stringify(this.appointments));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
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
function showBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.add('show');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('show');
    document.getElementById('bookingForm').reset();
}
