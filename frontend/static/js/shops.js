// Sample shops data (you'll replace this with Django backend data)
const sampleShops = [
    {
        id: 1,
        name: "Fashion Hub",
        category: "fashion",
        owner: "johndoe",
        location: "Douala, Cameroon",
        whatsapp: "+237123456789",
        products: 24,
        icon: "👗"
    },
    {
        id: 2,
        name: "Tech World",
        category: "electronics",
        owner: "techguru",
        location: "Yaoundé, Cameroon",
        whatsapp: "+237987654321",
        products: 18,
        icon: "💻"
    },
    {
        id: 3,
        name: "Beauty Corner",
        category: "beauty",
        owner: "beautyqueen",
        location: "Douala, Cameroon",
        whatsapp: "+237555555555",
        products: 32,
        icon: "💄"
    },
    {
        id: 4,
        name: "Fresh Foods",
        category: "food",
        owner: "freshmarket",
        location: "Limbe, Cameroon",
        whatsapp: "+237444444444",
        products: 45,
        icon: "🍎"
    },
    {
        id: 5,
        name: "Home Decor Plus",
        category: "home",
        owner: "homedecor",
        location: "Bafoussam, Cameroon",
        whatsapp: "+237333333333",
        products: 28,
        icon: "🏠"
    },
    {
        id: 6,
        name: "Sports Arena",
        category: "sports",
        owner: "sportspro",
        location: "Douala, Cameroon",
        whatsapp: "+237222222222",
        products: 15,
        icon: "⚽"
    }
];

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

// Render shops
function renderShops(shops) {
    const shopsGrid = document.getElementById('shopsGrid');
    const shopsCount = document.getElementById('shopsCount');
    const noResults = document.getElementById('noResults');
    
    if (shops.length === 0) {
        shopsGrid.innerHTML = '';
        noResults.style.display = 'block';
        shopsCount.textContent = '0 shops found';
        return;
    }
    
    noResults.style.display = 'none';
    shopsCount.textContent = `${shops.length} shop${shops.length !== 1 ? 's' : ''} found`;
    
    shopsGrid.innerHTML = shops.map(shop => `

        <a href="shop" class="shop-card">

            <div class="shop-card-header">

                <div class="shop-icon">${shop.icon}</div>

            </div>

            <div class="shop-card-body">

                <h3 class="shop-name">${shop.name}</h3>

                <span class="shop-category">${getCategoryName(shop.category)}</span>

                <div class="shop-meta">

                    <div class="shop-meta-item">

                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">

                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>

                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${shop.location}</span>
                    </div>
                    <div class="shop-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>${shop.products} Products</span>
                    </div>
                </div>
            </div>
            <div class="shop-card-footer">

                <button class="view-shop-btn">
                    <span>View Shop</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </a>
    `).join('');
}

// Filter shops
function filterShops() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = sampleShops;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm) ||
            shop.category.toLowerCase().includes(searchTerm) ||
            shop.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(shop => shop.category === categoryFilter);
    }
    
    renderShops(filtered);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Load shops from sessionStorage or use sample data
    const storedShop = sessionStorage.getItem('currentShop');
    let allShops = [...sampleShops];
    
    if (storedShop) {
        const newShop = JSON.parse(storedShop);
        // Add the newly created shop if it doesn't exist
        if (!allShops.find(shop => shop.id === newShop.id)) {
            allShops.unshift({
                id: newShop.id,
                name: newShop.shopName,
                category: newShop.category,
                owner: newShop.username,
                location: newShop.location,
                whatsapp: newShop.whatsapp,
                products: newShop.products?.length || 0,
                icon: getIconForCategory(newShop.category)
            });
        }
    }
    
    // Update the sampleShops array
    sampleShops.length = 0;
    sampleShops.push(...allShops);
    
    // Initial render
    renderShops(sampleShops);
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', filterShops);
    document.getElementById('categoryFilter').addEventListener('change', filterShops);
});

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
