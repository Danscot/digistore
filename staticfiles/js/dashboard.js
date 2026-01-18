// ===============================
// GLOBAL STATE
// ===============================
const state = {
    currentShop: null,
    products: [],
    editingIndex: null,
};

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('productsTableBody')) return;

    fetchDashboardData();
    bindUIEvents();
});

// ===============================
// HELPERS
// ===============================
const $ = id => document.getElementById(id);

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
    };

    if (data) options.body = JSON.stringify(data);

    const res = await fetch(url, options);
    const json = await res.json();

    if (!res.ok) throw new Error(json.detail || json.message || 'Request failed');
    return json;
}

// ===============================
// DASHBOARD DATA
// ===============================
async function fetchDashboardData() {
    try {
        const data = await apiRequest('/api/dashboard/');
        state.currentShop = data.shop || {};
        state.products = data.products || [];

        populateShopInfo();
        renderProducts();
        updateStats();
        setupShopLink();
    } catch (err) {
        console.error(err);
        alert('Unable to load dashboard');
    }
}

// ===============================
// SHOP SETTINGS
// ===============================
function populateShopInfo() {
    if (!state.currentShop) return;

    $('settingsShopName').value = state.currentShop.name || '';
    $('settingsCategory').value = state.currentShop.category || '';
    $('settingsWhatsapp').value = state.currentShop.wa_num || '';
    $('settingsLocation').value = state.currentShop.location || '';
}

$('updateForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
        shop_name: $('shop_name').value.trim(),
        location: $('location').value.trim(),
        shop_cat: $('shop_cat').value.trim(),
        wa_num: $('wa_num').value.trim(),
    };

    if (Object.values(payload).some(v => !v)) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {

        console.log(f`payloads: ${payload}`)

        await apiRequest('/api/update_shop_infos/', 'POST', payload);

        alert('Shop infos updated');

    } catch (err) {
        alert(err.message);
    }
});

// ===============================
// PRODUCTS
// ===============================
function renderProducts() {
    const tbody = $('productsTableBody');
    const empty = $('emptyProducts');

    if (!tbody) return;

    if (!state.products.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    tbody.innerHTML = state.products.map((p, i) => `
        <tr>
            <td>${p.name}</td>
            <td><span class="product-category-tag">${p.category}</span></td>
            <td>${p.description}</td>
            <td>
                <button class="action-btn edit" data-edit="${i}">Edit</button>
                <button class="action-btn delete" data-delete="${i}">Delete</button>
            </td>
        </tr>
    `).join('');
}

$('productsTableBody')?.addEventListener('click', e => {
    const edit = e.target.dataset.edit;
    const del = e.target.dataset.delete;

    if (edit !== undefined) openEditProduct(edit);
    if (del !== undefined) deleteProduct(del);
});

function openAddProductModal() {
    state.editingIndex = null;
    $('productForm').reset();
    $('modalTitle').textContent = 'Add Product';
    openModal();
}

function openEditProduct(index) {
    const p = state.products[index];
    if (!p) return;

    state.editingIndex = index;

    $('modalTitle').textContent = 'Edit Product';
    $('productName').value = p.name;
    $('productCategory').value = p.category;
    $('productDescription').value = p.description;

    openModal();
}

async function saveProduct(e) {
    e.preventDefault();

    const data = {
        name: $('productName').value,
        category: $('productCategory').value,
        description: $('productDescription').value,
    };

    try {
        let saved;

        if (state.editingIndex !== null) {
            const id = state.products[state.editingIndex].id;
            saved = await apiRequest(`/api/products/${id}/`, 'PUT', data);
            state.products[state.editingIndex] = saved;
        } else {
            saved = await apiRequest('/api/products/', 'POST', data);
            state.products.push(saved);
        }

        renderProducts();
        updateStats();
        closeModal();
        alert('Product saved');
    } catch (err) {
        alert(err.message);
    }
}

function deleteProduct(index) {
    if (!confirm('Delete this product?')) return;
    state.products.splice(index, 1);
    renderProducts();
    updateStats();
}

// ===============================
// MODAL
// ===============================
function openModal() {
    $('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    $('productModal').classList.remove('active');
    document.body.style.overflow = '';
    state.editingIndex = null;
}

// ===============================
// STATS
// ===============================
function updateStats() {
    $('totalProducts').textContent = state.products.length;
    $('totalCategories').textContent =
        new Set(state.products.map(p => p.category)).size;
}

// ===============================
// NAV + UI
// ===============================
function bindUIEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () =>
            switchSection(item.dataset.section)
        );
    });

    $('addProductBtn')?.addEventListener('click', openAddProductModal);
    $('modalClose')?.addEventListener('click', closeModal);
    $('modalOverlay')?.addEventListener('click', closeModal);
    $('productForm')?.addEventListener('submit', saveProduct);
    $('logoutBtn')?.addEventListener('click', logout);
}

// ===============================
// SECTIONS
// ===============================
function switchSection(section) {
    document.querySelectorAll('.content-section').forEach(s =>
        s.classList.toggle('active', s.id === `${section}-section`)
    );
}

// ===============================
// SHOP LINK
// ===============================
function setupShopLink() {
    if (!state.currentShop?.id) return;

    const url = `${location.origin}/shop/?id=${state.currentShop.id}`;
    $('shopLinkInput').value = url;

    $('copyLinkBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(url);
        $('copySuccess')?.classList.add('show');
        setTimeout(() => $('copySuccess')?.classList.remove('show'), 1500);
    });
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    if (confirm('Logout?')) location.href = '/logout/';
}
