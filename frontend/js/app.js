// Global state
let currentUser = null;
let authToken = null;
let allInventoryItems = [];
let allLocations = [];
let currentEditingItemId = null;

const API_URL = 'http://localhost:5000/api';

// === Auth Functions ===
function switchAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-of-type(1)').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-of-type(2)').classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.error;
            errorDiv.classList.add('show');
            return;
        }

        currentUser = data.user;
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.classList.add('show');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm_password = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('register-error');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirm_password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.error;
            errorDiv.classList.add('show');
            return;
        }

        currentUser = data.user;
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        errorDiv.textContent = 'Registration failed. Please try again.';
        errorDiv.classList.add('show');
    }
}

function handleLogout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('dashboard-container').style.display = 'none';
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.querySelector('.tab-btn:nth-of-type(1)').classList.add('active');
    document.querySelector('.tab-btn:nth-of-type(2)').classList.remove('active');
}

// === Navigation ===
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    if (page === 'dashboard') {
        loadDashboard();
    } else if (page === 'inventory') {
        loadInventory();
    } else if (page === 'locations') {
        loadLocations();
    } else if (page === 'reports') {
        loadReports();
    }
}

// === Dashboard ===
function showDashboard() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';
    document.getElementById('current-user').textContent = currentUser.username;

    loadDashboard();
}

async function loadDashboard() {
    try {
        const summaryRes = await fetch(`${API_URL}/reports/summary`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const summary = await summaryRes.json();

        document.getElementById('metric-total-items').textContent = summary.total_items;
        document.getElementById('metric-total-qty').textContent = summary.total_quantity;
        document.getElementById('metric-low-stock').textContent = summary.low_stock_count;
        document.getElementById('metric-expiring').textContent = summary.expiring_count;

        // Load low stock items
        const lowStockRes = await fetch(`${API_URL}/inventory/alerts/low-stock`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const lowStockItems = await lowStockRes.json();
        const lowStockDiv = document.getElementById('low-stock-list');
        lowStockDiv.innerHTML = lowStockItems.slice(0, 5).map(item => `
            <div class="item-row">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">${item.quantity} ${item.unit_of_measure}</span>
            </div>
        `).join('');

        // Load expiring items
        const expiringRes = await fetch(`${API_URL}/inventory/alerts/expiring?days=30`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const expiringItems = await expiringRes.json();
        const expiringDiv = document.getElementById('expiring-list');
        expiringDiv.innerHTML = expiringItems.slice(0, 5).map(item => `
            <div class="item-row">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">${new Date(item.expiration_date).toLocaleDateString()}</span>
            </div>
        `).join('');
    } catch (error) {
        showToast('Failed to load dashboard', 'error');
    }
}

// === Inventory ===
async function loadInventory() {
    try {
        const res = await fetch(`${API_URL}/inventory`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        allInventoryItems = await res.json();

        // Populate type filter
        const types = [...new Set(allInventoryItems.map(item => item.item_type))];
        const typeFilter = document.getElementById('filter-type');
        typeFilter.innerHTML = '<option value="">All Types</option>' + 
            types.map(type => `<option value="${type}">${type}</option>`).join('');

        displayInventory(allInventoryItems);

        // Load locations for modal
        const locRes = await fetch(`${API_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        allLocations = await locRes.json();
        const locSelect = document.getElementById('item-location');
        locSelect.innerHTML = '<option value="">Select Location</option>' +
            allLocations.map(loc => `<option value="${loc.id}">${loc.name}</option>`).join('');
    } catch (error) {
        showToast('Failed to load inventory', 'error');
    }
}

function displayInventory(items) {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.item_type}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_of_measure}</td>
            <td>${item.location_name || '-'}</td>
            <td>${item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-small" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterInventory() {
    const search = document.getElementById('search-items').value.toLowerCase();
    const type = document.getElementById('filter-type').value;

    let filtered = allInventoryItems;

    if (type) {
        filtered = filtered.filter(item => item.item_type === type);
    }

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.manufacturer.toLowerCase().includes(search) ||
            item.catalog_number.toLowerCase().includes(search)
        );
    }

    displayInventory(filtered);
}

function showAddItemModal() {
    currentEditingItemId = null;
    document.getElementById('modal-title').textContent = 'Add Inventory Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-modal').classList.add('active');
}

async function editItem(itemId) {
    try {
        const res = await fetch(`${API_URL}/inventory/${itemId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const item = await res.json();

        currentEditingItemId = itemId;
        document.getElementById('modal-title').textContent = 'Edit Inventory Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-type').value = item.item_type;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-unit').value = item.unit_of_measure;
        document.getElementById('item-manufacturer').value = item.manufacturer || '';
        document.getElementById('item-catalog').value = item.catalog_number || '';
        document.getElementById('item-min').value = item.min_threshold || '';
        document.getElementById('item-max').value = item.max_threshold || '';
        document.getElementById('item-expiration').value = item.expiration_date || '';
        document.getElementById('item-location').value = item.location_id || '';
        document.getElementById('item-description').value = item.description || '';

        document.getElementById('item-modal').classList.add('active');
    } catch (error) {
        showToast('Failed to load item', 'error');
    }
}

async function saveItem(event) {
    event.preventDefault();

    const itemData = {
        name: document.getElementById('item-name').value,
        item_type: document.getElementById('item-type').value,
        quantity: parseInt(document.getElementById('item-quantity').value),
        unit_of_measure: document.getElementById('item-unit').value,
        manufacturer: document.getElementById('item-manufacturer').value,
        catalog_number: document.getElementById('item-catalog').value,
        min_threshold: document.getElementById('item-min').value ? parseInt(document.getElementById('item-min').value) : null,
        max_threshold: document.getElementById('item-max').value ? parseInt(document.getElementById('item-max').value) : null,
        expiration_date: document.getElementById('item-expiration').value,
        location_id: document.getElementById('item-location').value || null,
        description: document.getElementById('item-description').value
    };

    try {
        const method = currentEditingItemId ? 'PUT' : 'POST';
        const url = currentEditingItemId ? 
            `${API_URL}/inventory/${currentEditingItemId}` : 
            `${API_URL}/inventory`;

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(itemData)
        });

        if (!res.ok) throw new Error('Failed to save item');

        showToast(currentEditingItemId ? 'Item updated' : 'Item created', 'success');
        document.getElementById('item-modal').classList.remove('active');

        loadInventory();
    } catch (error) {
        showToast('Failed to save item', 'error');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const res = await fetch(`${API_URL}/inventory/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to delete item');

        showToast('Item deleted', 'success');
        loadInventory();
    } catch (error) {
        showToast('Failed to delete item', 'error');
    }
}

// === Locations ===
async function loadLocations() {
    try {
        const res = await fetch(`${API_URL}/locations`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        allLocations = await res.json();

        const grid = document.getElementById('locations-grid');
        grid.innerHTML = allLocations.map(loc => `
            <div class="location-card">
                <h4>${loc.name}</h4>
                ${loc.building ? `<div class="location-detail"><strong>Building:</strong> ${loc.building}</div>` : ''}
                ${loc.floor ? `<div class="location-detail"><strong>Floor:</strong> ${loc.floor}</div>` : ''}
                ${loc.room ? `<div class="location-detail"><strong>Room:</strong> ${loc.room}</div>` : ''}
                ${loc.cabinet ? `<div class="location-detail"><strong>Cabinet:</strong> ${loc.cabinet}</div>` : ''}
                ${loc.shelf ? `<div class="location-detail"><strong>Shelf:</strong> ${loc.shelf}</div>` : ''}
                ${loc.temperature_requirement ? `<div class="location-detail"><strong>Temperature:</strong> ${loc.temperature_requirement}</div>` : ''}
                <div class="location-detail"><strong>Items:</strong> ${loc.item_count}</div>
                <div class="location-card-actions">
                    <button class="btn btn-small" onclick="editLocation(${loc.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteLocation(${loc.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showToast('Failed to load locations', 'error');
    }
}

function showAddLocationModal() {
    document.getElementById('location-form').reset();
    document.getElementById('location-modal').classList.add('active');
}

async function editLocation(locationId) {
    // Implement edit location
}

async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
        const res = await fetch(`${API_URL}/locations/${locationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to delete location');

        showToast('Location deleted', 'success');
        loadLocations();
    } catch (error) {
        showToast('Failed to delete location', 'error');
    }
}

async function saveLocation(event) {
    event.preventDefault();

    const locationData = {
        name: document.getElementById('loc-name').value,
        building: document.getElementById('loc-building').value,
        floor: document.getElementById('loc-floor').value,
        room: document.getElementById('loc-room').value,
        cabinet: document.getElementById('loc-cabinet').value,
        shelf: document.getElementById('loc-shelf').value,
        temperature_requirement: document.getElementById('loc-temp').value,
        description: document.getElementById('loc-description').value
    };

    try {
        const res = await fetch(`${API_URL}/locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(locationData)
        });

        if (!res.ok) throw new Error('Failed to save location');

        showToast('Location created', 'success');
        document.getElementById('location-modal').classList.remove('active');

        loadLocations();
    } catch (error) {
        showToast('Failed to save location', 'error');
    }
}

// === Reports ===
async function loadReports() {
    try {
        // Load type report
        const typeRes = await fetch(`${API_URL}/reports/by-type`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const typeData = await typeRes.json();

        const typeDiv = document.getElementById('type-report');
        typeDiv.innerHTML = typeData.map(report => `
            <div class="report-row">
                <div>
                    <div class="report-label">${report.type}</div>
                    <div style="font-size: 12px; color: #999;">Items: ${report.count}, Qty: ${report.quantity}</div>
                </div>
                <div class="report-value">\$${(report.value || 0).toFixed(2)}</div>
            </div>
        `).join('');

        // Load location utilization
        const locRes = await fetch(`${API_URL}/reports/location-utilization`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const locData = await locRes.json();

        const locDiv = document.getElementById('location-report');
        locDiv.innerHTML = locData.map(report => `
            <div class="report-row">
                <div>
                    <div class="report-label">${report.location}</div>
                    <div style="font-size: 12px; color: #999;">Items: ${report.item_count}</div>
                </div>
                <div class="report-value">${report.total_quantity}</div>
            </div>
        `).join('');
    } catch (error) {
        showToast('Failed to load reports', 'error');
    }
}

// === Utils ===
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === Initialize ===
function initializeApp() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);
