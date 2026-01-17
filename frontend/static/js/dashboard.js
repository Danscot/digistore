// Global state
let currentShop = null;
let products = [];
let editingProductId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsTableBody')) {
        fetchDashboardData();
        setupEventListeners();
    }
});

// ===============================
// CSRF TOKEN
// ===============================
function getCSRFToken() {
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfInput ? csrfInput.value : '';
}

// ===============================
// GENERIC API REQUEST
// ===============================
async function apiRequest(url, method, data = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
    };

    const options = {
        method: method,
        headers: headers,
        credentials: 'same-origin', // IMPORTANT for Django sessions
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
    }

    return result;
}

// Fetch dashboard data from Django API
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies for session auth
        });

        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        currentShop = data.shop || {};
        products = data.products || [];

        populateShopInfo();
        renderProducts();
        updateStats();
        setupShopLink();

    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        alert('Unable to load shop data. Please try again later.');
    }
}

// Update shop data from Django API

const updateForm = document.getElementById('updateForm');

if (updateForm) {

    updateForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const shop_name = document.getElementById("shop_name").value.trim()

        const location = document.getElementById("location").value.trim()

        const shop_cat = document.getElementById("shop_cat").value.trim()

        const wa_num = document.getElementById("wa_num").value.trim()

        if ( !shop_name || !location || !shop_cat || !wa_num ) {

           alert('Veuillez remplir tous les champs');
            return;
        }

        try {

            await apiRequest('/api/update_shop_infos/', 'POST', {

                shop_name:shop_name,
                location:location,
                shop_cat:shop_cat,
                wa_num:wa_num
            });
        } catch (error) {

            alert(error.message)
        }

    })
}

// Populate shop info in settings form
function populateShopInfo() {
    const shopNameInput = document.getElementById('settingsShopName');
    const categoryInput = document.getElementById('settingsCategory');
    const whatsappInput = document.getElementById('settingsWhatsapp');
    const locationInput = document.getElementById('settingsLocation');

    if (shopNameInput) shopNameInput.value = currentShop.name || '';
    if (categoryInput) categoryInput.value = currentShop.category || '';
    if (whatsappInput) whatsappInput.value = currentShop.wa_num || '';
    if (locationInput) locationInput.value = currentShop.location || '';
}

// Setup all event listeners
function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
            if (window.innerWidth <= 1024) closeMobileSidebar();
        });
    });

    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.contains('active') ? closeMobileSidebar() : openMobileSidebar();
        });
    }

    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', openAddProductModal);

    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalClose) modalClose.addEventListener('click', closeProductModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeProductModal);

    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', saveProduct);

    const shopSettingsForm = document.getElementById('shopSettingsForm');
    if (shopSettingsForm) shopSettingsForm.addEventListener('submit', saveShopSettings);
}

// Sidebar functions
function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileSidebarToggle');
    sidebar.classList.add('active');
    overlay.classList.add('active');
    toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileSidebarToggle');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Switch content sections
function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.querySelector(`[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const content = document.getElementById(`${section}-section`);
    if (content) content.classList.add('active');

    const titles = {
        'overview': { title: 'Dashboard Overview', subtitle: 'Manage your shop and products' },
        'products': { title: 'Products', subtitle: 'Add, edit, and manage your products' },
        'shop-settings': { title: 'Shop Settings', subtitle: 'Update your shop information' }
    };

    const sectionTitle = document.getElementById('sectionTitle');
    const sectionSubtitle = document.getElementById('sectionSubtitle');
    if (sectionTitle) sectionTitle.textContent = titles[section]?.title || '';
    if (sectionSubtitle) sectionSubtitle.textContent = titles[section]?.subtitle || '';

    if (section === 'products' && products.length === 0) {
        setTimeout(() => {
            if (confirm('You have no products yet. Add your first product?')) {
                openAddProductModal();
            }
        }, 300);
    }
}

// Update stats dynamically
function updateStats() {
    const totalProducts = document.getElementById('totalProducts');
    const totalCategories = document.getElementById('totalCategories');
    if (totalProducts) totalProducts.textContent = products.length;
    if (totalCategories) {
        const uniqueCategories = new Set(products.map(p => p.category));
        totalCategories.textContent = uniqueCategories.size;
    }
}

// Render products dynamically
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyProducts');
    if (!tbody || !emptyState) return;

    if (products.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = products.map((product, index) => `
        <tr>
            <td>${product.name}</td>
            <td><span class="product-category-tag">${product.category}</span></td>
            <td>${product.description}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProduct(${index})">Edit</button>
                    <button class="action-btn delete" onclick="deleteProduct(${index})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Modal functions
function openAddProductModal() {
    editingProductId = null;
    const modal = document.getElementById('productModal');
    if (!modal) return;
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function editProduct(index) {
    editingProductId = index;
    const product = products[index];
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = index;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;

    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function deleteProduct(index) {
    if (!products[index]) return;
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        renderProducts();
        updateStats();
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    editingProductId = null;
}

// Save product locally (later can send to API)
function saveProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        image: null
    };

    if (editingProductId !== null) {
        products[editingProductId] = productData;
    } else {
        products.push(productData);
    }

    renderProducts();
    updateStats();
    closeProductModal();
}

// Shop settings save locally (can be extended to API)
function saveShopSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    currentShop.shopName = formData.get('shopName');
    currentShop.category = formData.get('category');
    currentShop.whatsapp = formData.get('whatsapp');
    currentShop.location = formData.get('location');

    alert('Shop settings updated!');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout/'; // Change to your logout route
    }
}

// Copy shop link
function setupShopLink() {
    const shopId = currentShop.id;
    const shopUrl = `${window.location.origin}/shop/?id=${shopId}`;
    const shopLinkInput = document.getElementById('shopLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copySuccess = document.getElementById('copySuccess');

    if (shopLinkInput) shopLinkInput.value = shopUrl;

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            if (!shopLinkInput) return;
            shopLinkInput.select();
            document.execCommand('copy');
            if (copySuccess) copySuccess.classList.add('show');
            copyLinkBtn.innerHTML = `<span>Copied!</span>`;
            setTimeout(() => {
                if (copySuccess) copySuccess.classList.remove('show');
                copyLinkBtn.innerHTML = `<span>Copy Link</span>`;
            }, 2000);
        });
    }
}

// Save product via API
async function saveProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        // You can add image handling later
    };

    try {

        let response;

        if (editingProductId !== null) {
            // Editing an existing product
            const productId = products[editingProductId].id; // Assuming API returns `id` for each product

            response = await fetch(`/api/products/${productId}/`, {

                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

        } else {
            // Adding a new product
            response = await fetch('/api/products/', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });
        }

        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(errorData.detail || 'Failed to save product');
        }

        const savedProduct = await response.json();

        if (editingProductId !== null) {
            // Update product in local array
            products[editingProductId] = savedProduct;

        } else {
            
            products.push(savedProduct);
        }

        renderProducts();
        updateStats();
        closeProductModal();

        alert(editingProductId !== null ? 'Product updated!' : 'Product added!');

    } catch (err) {
        console.error('Error saving product:', err);
        alert('Error saving product: ' + err.message);
    }
}


// Expose for inline usage
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.closeProductModal = closeProductModal;
window.switchSection = switchSection;
