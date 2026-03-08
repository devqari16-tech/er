
// Login Functionality
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');

// Set valid credentials
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validate credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      loginScreen.style.display = 'none';
      dashboard.style.display = 'flex';
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      alert('Invalid username or password. Please try again.');
      document.getElementById('password').value = '';
    }
  });
}

// Check if already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'flex';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  });
}

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all nav items
    navItems.forEach(nav => nav.classList.remove('active'));
    
    // Add active class to clicked item
    item.classList.add('active');
    
    // Hide all sections
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const sectionId = item.getAttribute('data-section') + 'Section';
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      
      // Update page title
      const sectionName = item.querySelector('span').textContent;
      pageTitle.textContent = sectionName;
    }
  });
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

// Sample Data Generation
function generateBookingsData() {
  const bookings = [
    { id: 10234, client: 'John Doe', service: 'Full Detailing', vehicle: 'BMW M3', date: 'Jan 15, 2025', time: '09:00 AM', status: 'completed', amount: 299 },
    { id: 10235, client: 'Sarah Smith', service: 'Exterior Detail', vehicle: 'Tesla Model 3', date: 'Jan 15, 2025', time: '11:00 AM', status: 'in-progress', amount: 149 },
    { id: 10236, client: 'Mike Johnson', service: 'Ceramic Coating', vehicle: 'Mercedes C-Class', date: 'Jan 16, 2025', time: '02:00 PM', status: 'pending', amount: 599 },
    { id: 10237, client: 'Emily Davis', service: 'Interior Detail', vehicle: 'Honda Accord', date: 'Jan 16, 2025', time: '10:00 AM', status: 'pending', amount: 129 },
    { id: 10238, client: 'David Wilson', service: 'Full Detailing', vehicle: 'Audi A4', date: 'Jan 17, 2025', time: '01:00 PM', status: 'pending', amount: 299 },
    { id: 10239, client: 'Lisa Anderson', service: 'Paint Protection', vehicle: 'Porsche 911', date: 'Jan 14, 2025', time: '03:00 PM', status: 'completed', amount: 799 },
    { id: 10240, client: 'Robert Taylor', service: 'Engine Bay', vehicle: 'Ford Mustang', date: 'Jan 14, 2025', time: '12:00 PM', status: 'completed', amount: 99 },
    { id: 10241, client: 'Jennifer White', service: 'Headlight Resto', vehicle: 'Toyota Camry', date: 'Jan 13, 2025', time: '04:00 PM', status: 'cancelled', amount: 79 },
  ];

  const tbody = document.getElementById('bookingsTable');
  if (tbody) {
    tbody.innerHTML = bookings.map(booking => `
      <tr>
        <td><input type="checkbox"></td>
        <td>#${booking.id}</td>
        <td>
          <div class="client-info">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(booking.client)}&background=D4AF37&color=0A1128" alt="${booking.client}">
            <span>${booking.client}</span>
          </div>
        </td>
        <td>${booking.service}</td>
        <td>${booking.vehicle}</td>
        <td>${booking.date} • ${booking.time}</td>
        <td><span class="status-badge ${booking.status}">${booking.status.replace('-', ' ')}</span></td>
        <td>$${booking.amount}</td>
        <td>
          <button class="action-btn"><i class="fas fa-eye"></i></button>
          <button class="action-btn"><i class="fas fa-edit"></i></button>
          <button class="action-btn"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  }
}

// Generate more client cards
function generateClientsData() {
  const clients = [
    { name: 'Michael Chen', email: 'michael@email.com', phone: '(647) 555-0123', visits: 24, spent: 3580, vip: true },
    { name: 'Sarah Thompson', email: 'sarah@email.com', phone: '(647) 555-0124', visits: 18, spent: 2890, vip: true },
    { name: 'David Martinez', email: 'david@email.com', phone: '(647) 555-0125', visits: 12, spent: 1950, vip: false },
    { name: 'Emma Wilson', email: 'emma@email.com', phone: '(647) 555-0126', visits: 8, spent: 1200, vip: false },
    { name: 'James Brown', email: 'james@email.com', phone: '(647) 555-0127', visits: 15, spent: 2300, vip: true },
    { name: 'Olivia Taylor', email: 'olivia@email.com', phone: '(647) 555-0128', visits: 6, spent: 890, vip: false },
  ];

  const grid = document.querySelector('.clients-grid');
  if (grid) {
    grid.innerHTML = clients.map(client => `
      <div class="client-card">
        <div class="client-avatar">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=D4AF37&color=0A1128" alt="${client.name}">
          ${client.vip ? '<span class="client-badge vip">VIP</span>' : ''}
        </div>
        <h4>${client.name}</h4>
        <p>${client.email}</p>
        <p class="client-phone">${client.phone}</p>
        <div class="client-stats">
          <div class="client-stat">
            <span>Total Visits</span>
            <strong>${client.visits}</strong>
          </div>
          <div class="client-stat">
            <span>Total Spent</span>
            <strong>$${client.spent.toLocaleString()}</strong>
          </div>
        </div>
        <div class="client-actions">
          <button class="btn-outline"><i class="fas fa-eye"></i> View</button>
          <button class="btn-outline"><i class="fas fa-edit"></i> Edit</button>
        </div>
      </div>
    `).join('');
  }
}

// Generate services management
function generateServicesData() {
  const services = [
    { name: 'Exterior Detailing', description: 'Complete exterior transformation with hand wash, clay bar treatment, and premium protection.', price: 149, duration: '2-3 hours', bookings: 280, active: true },
    { name: 'Full Detailing Package', description: 'Complete interior and exterior transformation for the ultimate showroom finish.', price: 299, duration: '4-6 hours', bookings: 340, active: true },
    { name: 'Interior Detailing', description: 'Deep cleaning and conditioning for a fresh, luxurious cabin experience.', price: 129, duration: '2-3 hours', bookings: 240, active: true },
    { name: 'Paint Protection', description: 'Advanced ceramic coating and PPF to preserve your vehicles pristine finish.', price: 599, duration: '4-5 hours', bookings: 180, active: true },
    { name: 'Engine Bay Cleaning', description: 'Professional cleaning and protection for optimal engine appearance.', price: 99, duration: '1-2 hours', bookings: 120, active: true },
    { name: 'Headlight Restoration', description: 'Restore clarity and brightness for improved visibility and aesthetics.', price: 79, duration: '1 hour', bookings: 95, active: true },
  ];

  const grid = document.querySelector('.services-grid-manage');
  if (grid) {
    grid.innerHTML = services.map(service => `
      <div class="service-manage-card">
        <div class="service-manage-header">
          <h4>${service.name}</h4>
          <div class="service-actions">
            <button class="action-btn"><i class="fas fa-edit"></i></button>
            <button class="action-btn"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <p class="service-description">${service.description}</p>
        <div class="service-details">
          <div class="detail-item">
            <span>Price:</span>
            <strong>$${service.price}</strong>
          </div>
          <div class="detail-item">
            <span>Duration:</span>
            <strong>${service.duration}</strong>
          </div>
          <div class="detail-item">
            <span>Bookings:</span>
            <strong>${service.bookings} this month</strong>
          </div>
        </div>
        <button class="btn-toggle ${service.active ? 'active' : ''}">${service.active ? 'Active' : 'Inactive'}</button>
      </div>
    `).join('');
  }
}

// Initialize data on load
document.addEventListener('DOMContentLoaded', () => {
  generateBookingsData();
  generateClientsData();
  generateServicesData();
});

// Simple chart placeholder (you can integrate Chart.js or similar library)
const revenueChart = document.getElementById('revenueChart');
if (revenueChart) {
  const ctx = revenueChart.getContext('2d');
  ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.fillRect(0, 0, revenueChart.width, revenueChart.height);
  ctx.fillStyle = '#D4AF37';
  ctx.font = '20px Montserrat';
  ctx.textAlign = 'center';
  ctx.fillText('Revenue Chart Placeholder', revenueChart.width / 2, revenueChart.height / 2);
  ctx.font = '14px Montserrat';
  ctx.fillStyle = '#CCCCCC';
  ctx.fillText('Integrate Chart.js for live data visualization', revenueChart.width / 2, revenueChart.height / 2 + 30);
}

// Form submission handlers
const settingsForm = document.querySelector('.settings-form');
if (settingsForm) {
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  });
}

console.log('Dashboard initialized successfully!');
