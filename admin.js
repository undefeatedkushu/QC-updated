// Enhanced demo data with status formatting
const demoHospitals = [
    { name: "City General Hospital", type: "Government", city: "Delhi", verified: true },
    { name: "Metro Care Clinic", type: "Private", city: "Delhi", verified: true },
    { name: "Green Valley Hospital", type: "Private", city: "Mumbai", verified: false },
    { name: "Apollo Speciality", type: "Private", city: "Chennai", verified: true },
    { name: "Fortis Healthcare", type: "Private", city: "Mumbai", verified: true },
    { name: "Max Super Specialty", type: "Private", city: "Delhi", verified: true }
];

const demoDoctors = [
    { name: "Dr. A. Verma", specialty: "Cardiology", hospital: "City General Hospital", fee: "₹300", status: "Available" },
    { name: "Dr. P. Singh", specialty: "Cardiology", hospital: "Metro Care Clinic", fee: "₹600", status: "Available" },
    { name: "Dr. S. Nair", specialty: "Dermatology", hospital: "Green Valley Hospital", fee: "₹500", status: "Busy" },
    { name: "Dr. K. Rao", specialty: "General Medicine", hospital: "City General Hospital", fee: "₹200", status: "Available" },
    { name: "Dr. M. Iyer", specialty: "ENT", hospital: "Apollo Speciality", fee: "₹400", status: "On Leave" },
    { name: "Dr. V. Sharma", specialty: "Orthopedics", hospital: "Fortis Healthcare", fee: "₹700", status: "Available" }
];

const demoAppointments = [
    { time: "10:15 AM", patient: "Riya Sharma", doctor: "Dr. A. Verma", hospital: "City General Hospital", fee: "₹300" },
    { time: "10:45 AM", patient: "Arjun Patel", doctor: "Dr. P. Singh", hospital: "Metro Care Clinic", fee: "₹600" },
    { time: "11:30 AM", patient: "Meera Desai", doctor: "Dr. S. Nair", hospital: "Green Valley Hospital", fee: "₹500" },
    { time: "12:15 PM", patient: "Suresh Kumar", doctor: "Dr. K. Rao", hospital: "City General Hospital", fee: "₹200" },
    { time: "02:00 PM", patient: "Priya Iyer", doctor: "Dr. M. Iyer", hospital: "Apollo Speciality", fee: "₹400" },
    { time: "03:30 PM", patient: "Raj Malhotra", doctor: "Dr. V. Sharma", hospital: "Fortis Healthcare", fee: "₹700" }
];

const demoUsers = [
    { name: "Riya Sharma", email: "riya@example.com", role: "patient" },
    { name: "Arjun Patel", email: "arjun@example.com", role: "patient" },
    { name: "Meera Desai", email: "meera@example.com", role: "patient" },
    { name: "Dr. A. Verma", email: "dr.verma@example.com", role: "doctor" },
    { name: "Dr. P. Singh", email: "dr.singh@example.com", role: "doctor" },
    { name: "Admin User", email: "admin@example.com", role: "admin" }
];

function formatStatus(status, type = 'default') {
    const statusClasses = {
        'Available': 'status-available',
        'Busy': 'status-busy',
        'On Leave': 'status-on-leave',
        'true': 'status-verified',
        'false': 'status-pending'
    };
    
    const statusText = {
        'true': 'Verified ✓',
        'false': 'Pending ⏳'
    };
    
    const className = statusClasses[status] || 'status-default';
    const displayText = statusText[status] || status;
    
    return `<span class="${className}">${displayText}</span>`;
}

function fillTable(tbodyId, rows) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const table = tbody.closest('table');
    const thead = table.querySelector('thead tr');

    // Clear existing body
    tbody.innerHTML = "";

    if (rows.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        const colSpan = thead.querySelectorAll('th').length;
        td.setAttribute("colspan", colSpan);
        td.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #718096;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <div>No data available</div>
            </div>
        `;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    // Fill rows with enhanced formatting
    rows.forEach(rowData => {
        const tr = document.createElement("tr");
        Object.entries(rowData).forEach(([key, value]) => {
            const td = document.createElement("td");
            
            // Format specific columns
            if (key === 'verified') {
                td.innerHTML = formatStatus(value.toString());
            } else if (key === 'status') {
                td.innerHTML = formatStatus(value);
            } else {
                td.textContent = value;
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Enhanced counter animation
function animateCounter(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentValue = 0;
    const increment = finalValue / 30;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            element.textContent = finalValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentValue);
        }
    }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
    // Add loading animation
    document.body.classList.add('loading');
    
    setTimeout(() => {
        // Populate demo data tables
        fillTable("hospitalTable", demoHospitals);
        fillTable("doctorTable", demoDoctors);
        fillTable("appointmentTable", demoAppointments);

        // Animate counters
        animateCounter("hospitalCount", demoHospitals.length);
        animateCounter("doctorCount", demoDoctors.length);
        animateCounter("appointmentsToday", demoAppointments.length);
        animateCounter("totalUsers", demoUsers.length);
        
        // Remove loading animation
        document.body.classList.remove('loading');
    }, 1000);
});
