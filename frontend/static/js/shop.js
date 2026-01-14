// Sample products data
const sampleProducts = [
    {
        id: 1,
        name: "Classic White T-Shirt",
        description: "Premium quality cotton t-shirt, comfortable and breathable. Perfect for everyday wear.",
        category: "Clothing",
        image: null
    },
    {
        id: 2,
        name: "Denim Jeans",
        description: "Stylish denim jeans with perfect fit. Durable and trendy design for all occasions.",
        category: "Clothing",
        image: null
    },
    {
        id: 3,
        name: "Running Shoes",
        description: "Comfortable running shoes with excellent grip. Lightweight and ideal for sports.",
        category: "Footwear",
        image: null
    },
    {
        id: 4,
        name: "Leather Wallet",
        description: "Genuine leather wallet with multiple card slots. Elegant and practical design.",
        category: "Accessories",
        image: null
    },
    {
        id: 5,
        name: "Sunglasses",
        description: "UV protection sunglasses with modern frame. Stylish and protective eyewear.",
        category: "Accessories",
        image: null
    },
    {
        id: 6,
        name: "Sports Watch",
        description: "Digital sports watch with multiple features. Water-resistant and durable.",
        category: "Accessories",
        image: null
    }
];

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'fashion': 'Fashion & Clothing',
        'electronics': 'Electronics',
        'food': 'Food & Beverages',
        'beauty': 'Beauty & Cosmetics',
        'home': 'Home & Garden',
        'sports': 'Sports & Fitness',
        'books': 'Books & Stationery',
        'toys': 'Toys & Games',
        'jewelry': 'Jewelry & Accessories',
        'health': 'Health & Wellness',
        'automotive': 'Automotive',
        'arts': 'Arts & Crafts',
        'other': 'Other'
    };
    return categories[category] || category;
}

// Get icon for category
function getIconForCategory(category) {
    const icons = {
        'fashion': '👗',
        'electronics': '💻',
        'food': '🍎',
        'beauty': '💄',
        'home': '🏠',
        'sports': '⚽',
        'books': '📚',
        'toys': '🧸',
        'jewelry': '💍',
        'health': '💊',
        'automotive': '🚗',
        'arts': '🎨',
        'other': '🛍️'
    };
    return icons[category] || '🛍️';
}

// Load shop data
function loadShopData() {
    const shopId = getUrlParameter('id');
    
    // Sample shops data (should match shops.js)
    const shops = [
        {
            id: '1',
            name: "Fashion Hub",
            category: "fashion",
            owner: "johndoe",
            location: "Douala, Cameroon",
            whatsapp: "+237123456789",
            products: sampleProducts
        },
        {
            id: '2',
            name: "Tech World",
            category: "electronics",
            owner: "techguru",
            location: "Yaoundé, Cameroon",
            whatsapp: "+237987654321",
            products: []
        }
    ];
    
    // Try to get shop from sessionStorage first
    const storedShop = sessionStorage.getItem('currentShop');
    if (storedShop) {
        const newShop = JSON.parse(storedShop);
        if (newShop.id === shopId) {
            return {
                ...newShop,
                name: newShop.shopName,
                products: newShop.products || []
            };
        }
    }
    
    // Otherwise return from sample data
    return shops.find(shop => shop.id === shopId) || shops[0];
}

// Render shop info
function renderShopInfo(shop) {
    document.getElementById('shopName').textContent = shop.name;
    document.getElementById('shopCategory').textContent = getCategoryName(shop.category);
    document.getElementById('shopLocation').textContent = shop.location;
    document.getElementById('shopIcon').textContent = getIconForCategory(shop.category);
    document.getElementById('productCount').textContent = `${shop.products.length} Product${shop.products.length !== 1 ? 's' : ''}`;
    
    // Setup contact button
    const contactBtn = document.getElementById('contactOwnerBtn');
    contactBtn.addEventListener('click', () => {
        const message = `Hi! I found your shop "${shop.name}" on DigiStore. I'm interested in your products.`;
        const whatsappUrl = `https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
}

// Render products
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}">` : 
                    `<div class="product-placeholder">📦</div>`
                }
            </div>
            <div class="product-body">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <button class="contact-product-btn" onclick="contactAboutProduct('${product.name}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Contact for Price</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Contact about specific product
window.contactAboutProduct = function(productName) {
    const shop = window.currentShop;
    const message = `Hi! I'm interested in "${productName}" from your shop "${shop.name}". Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const shop = window.currentShop;
    
    let filtered = shop.products;
    
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    renderProducts(filtered);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const shop = loadShopData();
    window.currentShop = shop;
    
    renderShopInfo(shop);
    renderProducts(shop.products);
    
    // Add search listener
    document.getElementById('productSearch').addEventListener('input', searchProducts);
});
