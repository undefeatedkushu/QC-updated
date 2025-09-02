// Enhanced Hospital Management System
class HospitalManager {
    constructor() {
        this.hospitals = JSON.parse(localStorage.getItem('quickcare_hospitals')) || [];
        this.currentEditId = null;
        this.filteredHospitals = [];
        
        // Initialize the system
        this.initializeSampleData();
        this.initializeEventListeners();
        this.loadHospitals();
        this.updateStats();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        const addForm = document.getElementById('addHospitalForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddHospital();
            });
        }

        // Search functionality
        const search = document.getElementById('hospitalSearch');
        if (search) {
            search.addEventListener('input', () => this.filterHospitals());
        }

        // Filter by type
        const filterType = document.getElementById('filterType');
        if (filterType) {
            filterType.addEventListener('change', () => this.filterHospitals());
        }

        // Filter by verification
        const filterVerification = document.getElementById('filterVerification');
        if (filterVerification) {
            filterVerification.addEventListener('change', () => this.filterHospitals());
        }

        // Filter by city
        const filterCity = document.getElementById('filterCity');
        if (filterCity) {
            filterCity.addEventListener('change', () => this.filterHospitals());
        }

        // Clear form button
        const clearBtn = document.querySelector('.btn.clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.resetForm());
        }
    }

    // Initialize sample hospitals data
    initializeSampleData() {
        if (!Array.isArray(this.hospitals)) this.hospitals = [];
        
        if (this.hospitals.length === 0) {
            const sampleHospitals = [
                {
                    id: '1',
                    name: 'City General Hospital',
                    type: 'Government',
                    city: 'delhi',
                    verified: true,
                    address: '123 Main Street, Central Delhi',
                    phone: '+91-11-2345-6789',
                    email: 'admin@citygeneral.com',
                    capacity: 500,
                    description: 'Leading government hospital providing comprehensive healthcare services',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Metro Care Clinic',
                    type: 'Private',
                    city: 'delhi',
                    verified: true,
                    address: '456 Business District, New Delhi',
                    phone: '+91-11-9876-5432',
                    email: 'info@metrocare.com',
                    capacity: 200,
                    description: 'Premium private healthcare facility with modern equipment',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Green Valley Multi-speciality',
                    type: 'Multi-specialty',
                    city: 'mumbai',
                    verified: false,
                    address: '789 Medical Complex, Mumbai',
                    phone: '+91-22-1234-5678',
                    email: 'contact@greenvalley.com',
                    capacity: 300,
                    description: 'Multi-specialty hospital offering various medical services',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '4',
                    name: 'Apollo Speciality Hospital',
                    type: 'Private',
                    city: 'chennai',
                    verified: true,
                    address: '321 Medical Avenue, Chennai',
                    phone: '+91-44-8765-4321',
                    email: 'admin@apollo.com',
                    capacity: 800,
                    description: 'Renowned specialty hospital with advanced medical technology',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '5',
                    name: 'Fortis Healthcare',
                    type: 'Private',
                    city: 'mumbai',
                    verified: true,
                    address: '654 Healthcare Boulevard, Mumbai',
                    phone: '+91-22-5555-6666',
                    email: 'info@fortis.com',
                    capacity: 400,
                    description: 'Leading private healthcare provider with multiple specialties',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '6',
                    name: 'National Health Center',
                    type: 'Government',
                    city: 'bengaluru',
                    verified: false,
                    address: '987 Government Complex, Bengaluru',
                    phone: '+91-80-7777-8888',
                    email: 'contact@nhc.gov.in',
                    capacity: 600,
                    description: 'Government health center providing affordable healthcare services',
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.hospitals = sampleHospitals;
            this.saveHospitals();
        }
    }

    // Handle form submission
    handleAddHospital() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        if (this.currentEditId) {
            this.updateHospital(this.currentEditId, formData);
        } else {
            this.addHospital(formData);
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
            name: getValue('hospitalName'),
            type: getValue('hospitalType'),
            city: getValue('hospitalCity'),
            verified: getValue('hospitalVerified') === 'true',
            address: getValue('hospitalAddress'),
            phone: getValue('hospitalPhone'),
            email: getValue('hospitalEmail'),
            capacity: parseInt(getValue('hospitalCapacity'), 10) || 0,
            description: getValue('hospitalDescription')
        };
    }

    // Validate form data
    validateForm(data) {
        this.clearErrors();
        let isValid = true;

        // Name validation
        if (!data.name) {
            this.showError('hospitalName', 'Hospital name is required');
            isValid = false;
        } else if (!this.currentEditId && this.hospitals.some(h => h.name.toLowerCase() === data.name.toLowerCase())) {
            this.showError('hospitalName', 'A hospital with this name already exists');
            isValid = false;
        }

        // Type validation
        if (!data.type) {
            this.showError('hospitalType', 'Please select hospital type');
            isValid = false;
        }

        // City validation
        if (!data.city) {
            this.showError('hospitalCity', 'Please select a city');
            isValid = false;
        }

        // Email validation (if provided)
        if (data.email && !this.isValidEmail(data.email)) {
            this.showError('hospitalEmail', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation (if provided)
        if (data.phone && !this.isValidPhone(data.phone)) {
            this.showError('hospitalPhone', 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation helper
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
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

    // Add new hospital
    addHospital(hospitalData) {
        const newHospital = {
            id: Date.now().toString(),
            ...hospitalData,
            createdAt: new Date().toISOString()
        };

        this.hospitals.push(newHospital);
        this.saveHospitals();
        this.loadHospitals();
        this.updateStats();
        this.showMessage('Hospital added successfully!', 'success');
    }

    // Update existing hospital
    updateHospital(id, updatedData) {
        const index = this.hospitals.findIndex(hospital => hospital.id === id);
        
        if (index !== -1) {
            this.hospitals[index] = {
                ...this.hospitals[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveHospitals();
            this.loadHospitals();
            this.updateStats();
            this.showMessage('Hospital updated successfully!', 'success');
        }
    }

    // Edit hospital (populate form)
    editHospital(id) {
        const hospital = this.hospitals.find(h => h.id === id);
        if (!hospital) return;

        // Populate form fields
        document.getElementById('hospitalName').value = hospital.name;
        document.getElementById('hospitalType').value = hospital.type;
        document.getElementById('hospitalCity').value = hospital.city;
        document.getElementById('hospitalVerified').value = hospital.verified.toString();
        document.getElementById('hospitalAddress').value = hospital.address || '';
        document.getElementById('hospitalPhone').value = hospital.phone || '';
        document.getElementById('hospitalEmail').value = hospital.email || '';
        document.getElementById('hospitalCapacity').value = hospital.capacity || '';
        document.getElementById('hospitalDescription').value = hospital.description || '';

        this.currentEditId = id;
        
        // Update button text
        const addBtn = document.querySelector('.btn.add');
        if (addBtn) {
            addBtn.textContent = 'Update Hospital';
            addBtn.innerHTML = '<i class="fas fa-save"></i> Update Hospital';
        }

        // Scroll to form
        document.querySelector('.hospital-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Remove hospital
    removeHospital(id) {
        const hospital = this.hospitals.find(h => h.id === id);
        if (!hospital) return;

        if (confirm(`Are you sure you want to remove ${hospital.name}?`)) {
            this.hospitals = this.hospitals.filter(h => h.id !== id);
            this.saveHospitals();
            this.loadHospitals();
            this.updateStats();
            this.showMessage('Hospital removed successfully!', 'success');
        }
    }

    // Load and display hospitals
    loadHospitals() {
        const tableBody = document.getElementById('hospitalListBody');
        if (!tableBody) return;

        const hospitalsToShow = this.filteredHospitals.length > 0 ? this.filteredHospitals : this.hospitals;

        if (hospitalsToShow.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-hospital-alt"></i>
                        <h3>No hospitals found</h3>
                        <p>Add your first hospital to get started or adjust your search criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = hospitalsToShow.map(hospital => `
            <tr>
                <td>
                    <div>
                        <strong>${this.escapeHtml(hospital.name)}</strong>
                        <br>
                        <small style="color: #718096;">${this.escapeHtml(hospital.address || 'No address provided')}</small>
                    </div>
                </td>
                <td>
                    <span style="text-transform: capitalize;">
                        ${hospital.type}
                    </span>
                </td>
                <td style="text-transform: capitalize;">${hospital.city}</td>
                <td>${hospital.capacity ? hospital.capacity + ' beds' : 'Not specified'}</td>
                <td>
                    ${hospital.phone ? `<div><i class="fas fa-phone"></i> ${hospital.phone}</div>` : ''}
                    ${hospital.email ? `<div><i class="fas fa-envelope"></i> ${hospital.email}</div>` : ''}
                </td>
                <td>
                    <span class="status-badge status-${hospital.verified ? 'verified' : 'pending'}">
                        ${hospital.verified ? 'Verified ✓' : 'Pending ⏳'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="hospitalManager.editHospital('${hospital.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-remove" onclick="hospitalManager.removeHospital('${hospital.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Filter hospitals based on search and filters
    filterHospitals() {
        const searchTerm = document.getElementById('hospitalSearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('filterType')?.value || '';
        const verificationFilter = document.getElementById('filterVerification')?.value || '';
        const cityFilter = document.getElementById('filterCity')?.value || '';

        this.filteredHospitals = this.hospitals.filter(hospital => {
            const matchesSearch = !searchTerm || 
                hospital.name.toLowerCase().includes(searchTerm) ||
                hospital.type.toLowerCase().includes(searchTerm) ||
                hospital.city.toLowerCase().includes(searchTerm) ||
                (hospital.address && hospital.address.toLowerCase().includes(searchTerm));

            const matchesType = !typeFilter || hospital.type === typeFilter;
            const matchesVerification = !verificationFilter || hospital.verified.toString() === verificationFilter;
            const matchesCity = !cityFilter || hospital.city === cityFilter;

            return matchesSearch && matchesType && matchesVerification && matchesCity;
        });

        this.loadHospitals();
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('addHospitalForm');
        if (form) {
            form.reset();
            this.clearErrors();
            this.currentEditId = null;
            
            const addBtn = document.querySelector('.btn.add');
            if (addBtn) {
                addBtn.textContent = 'Add Hospital';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Hospital';
            }
        }
    }

    // Update statistics
    updateStats() {
        const totalElement = document.getElementById('totalHospitals');
        const verifiedElement = document.getElementById('verifiedHospitals');
        const pendingElement = document.getElementById('pendingHospitals');

        if (totalElement) {
            totalElement.textContent = this.hospitals.length;
        }

        if (verifiedElement) {
            const verifiedCount = this.hospitals.filter(h => h.verified).length;
            verifiedElement.textContent = verifiedCount;
        }

        if (pendingElement) {
            const pendingCount = this.hospitals.filter(h => !h.verified).length;
            pendingElement.textContent = pendingCount;
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

    // Save hospitals to localStorage
    saveHospitals() {
        localStorage.setItem('quickcare_hospitals', JSON.stringify(this.hospitals));
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize hospital management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hospitalManager = new HospitalManager();
});
