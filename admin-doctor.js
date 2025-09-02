// Enhanced Admin Doctor Management System
class DoctorManager {
    constructor() {
        this.doctors = JSON.parse(localStorage.getItem('doctors')) || [];
        this.currentEditId = null;
        this.filteredDoctors = [];
        
        // Initialize the system
        this.initializeSampleDoctors();
        this.initializeEventListeners();
        this.loadDoctors();
        this.updateStats();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        const addForm = document.getElementById('addDoctorForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddDoctor();
            });
        }

        // Search and filter functionality
        const search = document.getElementById('doctorSearch');
        if (search) {
            search.addEventListener('input', () => this.filterDoctors());
        }

        const filterSpecialty = document.getElementById('filterSpecialty');
        if (filterSpecialty) {
            filterSpecialty.addEventListener('change', () => this.filterDoctors());
        }

        const filterCity = document.getElementById('filterCity');
        if (filterCity) {
            filterCity.addEventListener('change', () => this.filterDoctors());
        }

        // Clear form button
        const clearBtn = document.querySelector('.btn.clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.resetForm());
        }
    }

    // Initialize sample doctors data
    initializeSampleDoctors() {
        if (!Array.isArray(this.doctors)) this.doctors = [];
        
        if (this.doctors.length === 0) {
            const sampleDoctors = [
                {
                    id: '1',
                    name: 'Dr. Rajesh Sharma',
                    email: 'dr.rajesh@apollo.com',
                    specialty: 'cardiology',
                    experience: 12,
                    hospital: 'apollo',
                    city: 'delhi',
                    qualification: 'MBBS, MD, DM Cardiology',
                    availability: 'available',
                    bio: 'Senior Cardiologist with 12+ years of experience in interventional cardiology',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Dr. Priya Singh',
                    email: 'dr.priya@fortis.com',
                    specialty: 'pediatrics',
                    experience: 8,
                    hospital: 'fortis',
                    city: 'mumbai',
                    qualification: 'MBBS, DCH, DNB Pediatrics',
                    availability: 'busy',
                    bio: 'Pediatric specialist with expertise in child healthcare and vaccination',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Dr. Sunita Nair',
                    email: 'dr.sunita@greenvalley.com',
                    specialty: 'dermatology',
                    experience: 10,
                    hospital: 'green_valley',
                    city: 'mumbai',
                    qualification: 'MBBS, MD Dermatology',
                    availability: 'available',
                    bio: 'Dermatologist specializing in skin diseases and cosmetic dermatology',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '4',
                    name: 'Dr. Rohan Shah',
                    email: 'dr.rohan@metrocare.com',
                    specialty: 'orthopedics',
                    experience: 15,
                    hospital: 'metro_care',
                    city: 'delhi',
                    qualification: 'MBBS, MS Orthopedics',
                    availability: 'on_leave',
                    bio: 'Orthopedic surgeon specialized in joint replacement and sports injuries',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '5',
                    name: 'Dr. Kavita Rao',
                    email: 'dr.kavita@citygeneral.com',
                    specialty: 'general',
                    experience: 6,
                    hospital: 'city_general',
                    city: 'bengaluru',
                    qualification: 'MBBS, MD General Medicine',
                    availability: 'available',
                    bio: 'General physician with expertise in internal medicine and chronic care',
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.doctors = sampleDoctors;
            this.saveDoctors();
        }
    }

    // Handle form submission
    handleAddDoctor() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.currentEditId) {
            this.updateDoctor(this.currentEditId, formData);
        } else {
            this.addDoctor(formData);
        }

        this.resetForm();
    }

    // Get form data
    getFormData() {
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : '';
        };

        return {
            name: getValue('doctorName'),
            email: getValue('doctorEmail'),
            specialty: getValue('doctorSpecialty'),
            experience: parseInt(getValue('doctorExperience'), 10) || 0,
            hospital: getValue('doctorHospital'),
            city: getValue('doctorCity'),
            qualification: getValue('doctorQualification'),
            availability: getValue('doctorAvailability'),
            bio: getValue('doctorBio')
        };
    }

    // Validate form data
    validateForm(data) {
        this.clearErrors();
        let isValid = true;

        // Name validation
        if (!data.name) {
            this.showError('doctorName', 'Doctor name is required');
            isValid = false;
        }

        // Email validation
        if (!data.email) {
            this.showError('doctorEmail', 'Email address is required');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showError('doctorEmail', 'Please enter a valid email address');
            isValid = false;
        } else if (!this.currentEditId && this.doctors.some(d => d.email.toLowerCase() === data.email.toLowerCase())) {
            this.showError('doctorEmail', 'A doctor with this email already exists');
            isValid = false;
        }

        // Specialty validation
        if (!data.specialty) {
            this.showError('doctorSpecialty', 'Please select a specialty');
            isValid = false;
        }

        // Experience validation
        if (isNaN(data.experience) || data.experience < 0) {
            this.showError('doctorExperience', 'Please enter valid years of experience');
            isValid = false;
        }

        // Hospital validation
        if (!data.hospital) {
            this.showError('doctorHospital', 'Please select a hospital');
            isValid = false;
        }

        // City validation
        if (!data.city) {
            this.showError('doctorCity', 'Please select a city');
            isValid = false;
        }

        // Qualification validation
        if (!data.qualification) {
            this.showError('doctorQualification', 'Qualification is required');
            isValid = false;
        }

        // Availability validation
        if (!data.availability) {
            this.showError('doctorAvailability', 'Please select availability status');
            isValid = false;
        }

        return isValid;
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show form error
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message after the field
        field.parentNode.appendChild(errorDiv);
    }

    // Clear all form errors
    clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    // Add new doctor
    addDoctor(doctorData) {
        const newDoctor = {
            id: Date.now().toString(),
            ...doctorData,
            createdAt: new Date().toISOString()
        };

        this.doctors.push(newDoctor);
        this.saveDoctors();
        this.loadDoctors();
        this.updateStats();
        this.showMessage('Doctor added successfully!', 'success');
    }

    // Update existing doctor
    updateDoctor(id, updatedData) {
        const index = this.doctors.findIndex(doctor => doctor.id === id);
        
        if (index !== -1) {
            this.doctors[index] = {
                ...this.doctors[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveDoctors();
            this.loadDoctors();
            this.updateStats();
            this.showMessage('Doctor updated successfully!', 'success');
        }
    }

    // Edit doctor (populate form)
    editDoctor(id) {
        const doctor = this.doctors.find(d => d.id === id);
        if (!doctor) return;

        // Populate form fields
        document.getElementById('doctorName').value = doctor.name;
        document.getElementById('doctorEmail').value = doctor.email;
        document.getElementById('doctorSpecialty').value = doctor.specialty;
        document.getElementById('doctorExperience').value = doctor.experience;
        document.getElementById('doctorHospital').value = doctor.hospital;
        document.getElementById('doctorCity').value = doctor.city;
        document.getElementById('doctorQualification').value = doctor.qualification;
        document.getElementById('doctorAvailability').value = doctor.availability;
        document.getElementById('doctorBio').value = doctor.bio || '';

        this.currentEditId = id;
        
        // Update button text
        const addBtn = document.querySelector('.btn.add');
        if (addBtn) {
            addBtn.textContent = 'Update Doctor';
            addBtn.innerHTML = '<i class="fas fa-save"></i> Update Doctor';
        }

        // Scroll to form
        document.querySelector('.doctor-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete doctor
    deleteDoctor(id) {
        const doctor = this.doctors.find(d => d.id === id);
        if (!doctor) return;

        if (confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
            this.doctors = this.doctors.filter(d => d.id !== id);
            this.saveDoctors();
            this.loadDoctors();
            this.updateStats();
            this.showMessage('Doctor deleted successfully!', 'success');
        }
    }

    // Load and display doctors
    loadDoctors() {
        const tableBody = document.getElementById('doctorListBody');
        if (!tableBody) return;

        const doctorsToShow = this.filteredDoctors.length > 0 ? this.filteredDoctors : this.doctors;

        if (doctorsToShow.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-user-md"></i>
                        <h3>No doctors found</h3>
                        <p>Add your first doctor to get started or adjust your search criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = doctorsToShow.map(doctor => `
            <tr>
                <td>
                    <div>
                        <strong>${this.escapeHtml(doctor.name)}</strong>
                        <br>
                        <small style="color: #718096;">${this.escapeHtml(doctor.email)}</small>
                    </div>
                </td>
                <td>
                    <span style="text-transform: capitalize;">
                        ${this.formatSpecialty(doctor.specialty)}
                    </span>
                </td>
                <td>${this.formatHospital(doctor.hospital)}</td>
                <td style="text-transform: capitalize;">${doctor.city}</td>
                <td>${doctor.experience} years</td>
                <td>
                    <span class="status-badge status-${doctor.availability}">
                        ${this.formatAvailability(doctor.availability)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="doctorManager.editDoctor('${doctor.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="doctorManager.deleteDoctor('${doctor.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Filter doctors based on search and filters
    filterDoctors() {
        const searchTerm = document.getElementById('doctorSearch')?.value.toLowerCase() || '';
        const specialtyFilter = document.getElementById('filterSpecialty')?.value || '';
        const cityFilter = document.getElementById('filterCity')?.value || '';

        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = !searchTerm || 
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.email.toLowerCase().includes(searchTerm) ||
                doctor.qualification.toLowerCase().includes(searchTerm);

            const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter;
            const matchesCity = !cityFilter || doctor.city === cityFilter;

            return matchesSearch && matchesSpecialty && matchesCity;
        });

        this.loadDoctors();
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('addDoctorForm');
        if (form) {
            form.reset();
            this.clearErrors();
            this.currentEditId = null;
            
            const addBtn = document.querySelector('.btn.add');
            if (addBtn) {
                addBtn.textContent = 'Add Doctor';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Doctor';
            }
        }
    }

    // Update statistics
    updateStats() {
        const totalElement = document.getElementById('totalDoctors');
        const availableElement = document.getElementById('availableDoctors');

        if (totalElement) {
            totalElement.textContent = this.doctors.length;
        }

        if (availableElement) {
            const availableCount = this.doctors.filter(d => d.availability === 'available').length;
            availableElement.textContent = availableCount;
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        container.innerHTML = '';
        container.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Save doctors to localStorage
    saveDoctors() {
        localStorage.setItem('doctors', JSON.stringify(this.doctors));
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatSpecialty(specialty) {
        const specialties = {
            'cardiology': 'Cardiology',
            'dermatology': 'Dermatology',
            'pediatrics': 'Pediatrics',
            'orthopedics': 'Orthopedics',
            'neurology': 'Neurology',
            'general': 'General Medicine',
            'ent': 'ENT',
            'psychiatry': 'Psychiatry',
            'oncology': 'Oncology',
            'radiology': 'Radiology'
        };
        return specialties[specialty] || specialty;
    }

    formatHospital(hospital) {
        const hospitals = {
            'city_general': 'City General Hospital',
            'metro_care': 'Metro Care Clinic',
            'green_valley': 'Green Valley Hospital',
            'apollo': 'Apollo Speciality',
            'fortis': 'Fortis Healthcare',
            'max_super': 'Max Super Specialty'
        };
        return hospitals[hospital] || hospital;
    }

    formatAvailability(availability) {
        const statuses = {
            'available': 'Available',
            'busy': 'Busy',
            'on_leave': 'On Leave'
        };
        return statuses[availability] || availability;
    }
}

// Initialize doctor management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doctorManager = new DoctorManager();
});
