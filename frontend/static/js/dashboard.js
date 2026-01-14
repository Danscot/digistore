// Global state
let currentShop = null;
let products = [];
let editingProductId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadShopData();
    setupEventListeners();
    updateStats();
    renderProducts();
    setupShopLink();
});

// Load shop data
function loadShopData() {
    const shopData = sessionStorage.getItem('currentShop');
    if (shopData) {
        currentShop = JSON.parse(shopData);
        products = currentShop.products || [];
    } else {
        // Sample data for demo
        currentShop = {
            shopName: "My Shop",
            category: "fashion",
            whatsapp: "+237123456789",
            location: "Douala, Cameroon",
            username: "shopowner"
        };
        products = [];
    }
    
    // Populate settings form
    document.getElementById('settingsShopName').value = currentShop.shopName || currentShop.name || '';
    document.getElementById('settingsCategory').value = currentShop.category || '';
    document.getElementById('settingsWhatsapp').value = currentShop.whatsapp || '';
    document.getElementById('settingsLocation').value = currentShop.location || '';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
            
            // Close mobile sidebar after clicking
            if (window.innerWidth <= 1024) {
                closeMobileSidebar();
            }
        });
    });
    
    // Mobile sidebar toggle
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            const isActive = sidebar.classList.contains('active');
            if (isActive) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }
    
    // Sidebar overlay click
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', openAddProductModal);
    
    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeProductModal);
    document.getElementById('modalOverlay').addEventListener('click', closeProductModal);
    
    // Product form
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    
    // Shop settings form
    document.getElementById('shopSettingsForm').addEventListener('submit', saveShopSettings);
}

// Open mobile sidebar
function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileSidebarToggle');
    
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close mobile sidebar
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileSidebarToggle');
    
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Switch sections
window.switchSection = function(section) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update header
    const titles = {
        'overview': { title: 'Dashboard Overview', subtitle: 'Manage your shop and products' },
        'products': { title: 'Products', subtitle: 'Add, edit, and manage your products' },
        'shop-settings': { title: 'Shop Settings', subtitle: 'Update your shop information' }
    };
    
    const titleInfo = titles[section];
    document.getElementById('sectionTitle').textContent = titleInfo.title;
    document.getElementById('sectionSubtitle').textContent = titleInfo.subtitle;
    
    // If products section, maybe trigger add modal
    if (section === 'products' && products.length === 0) {
        setTimeout(() => {
            const shouldAdd = confirm('You have no products yet. Would you like to add your first product?');
            if (shouldAdd) {
                openAddProductModal();
            }
        }, 500);
    }
};

// Update stats
function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    
    const uniqueCategories = new Set(products.map(p => p.category));
    document.getElementById('totalCategories').textContent = uniqueCategories.size;
}

// Render products
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyProducts');
    
    if (products.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = products.map((product, index) => `
        <tr>
            <td class="product-name-cell">${product.name}</td>
            <td><span class="product-category-tag">${product.category}</span></td>
            <td class="product-description-cell">${product.description}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProduct(${index})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${index})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Open add product modal
function openAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Edit product
window.editProduct = function(index) {
    editingProductId = index;
    const product = products[index];
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = index;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Delete product
window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        saveToStorage();
        renderProducts();
        updateStats();
    }
};

// Close product modal
window.closeProductModal = function() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    editingProductId = null;
};

// Save product
function saveProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        description: formData.get('description'),
        image: null // Handle image upload with Django
    };
    
    if (editingProductId !== null) {
        // Update existing product
        products[editingProductId] = productData;
    } else {
        // Add new product
        products.push(productData);
    }
    
    saveToStorage();
    renderProducts();
    updateStats();
    closeProductModal();
}

// Save shop settings
function saveShopSettings(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    currentShop.shopName = formData.get('shopName');
    currentShop.category = formData.get('category');
    currentShop.whatsapp = formData.get('whatsapp');
    currentShop.location = formData.get('location');
    
    saveToStorage();
    
    alert('Shop settings updated successfully!');
}

// Save to storage
function saveToStorage() {
    currentShop.products = products;
    sessionStorage.setItem('currentShop', JSON.stringify(currentShop));
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Setup shop link
function setupShopLink() {
    const shopId = currentShop.id || '1';
    const shopUrl = `${window.location.origin}/shop.html?id=${shopId}`;
    const shopLinkInput = document.getElementById('shopLinkInput');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copySuccess = document.getElementById('copySuccess');
    
    if (shopLinkInput) {
        shopLinkInput.value = shopUrl;
    }
    
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            // Copy to clipboard
            shopLinkInput.select();
            document.execCommand('copy');
            
            // Show success message
            copySuccess.classList.add('show');
            copyLinkBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
            `;
            
            // Reset after 2 seconds
            setTimeout(() => {
                copySuccess.classList.remove('show');
                copyLinkBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy Link</span>
                `;
            }, 2000);
        });
    }
}
