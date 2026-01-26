/* ===========================
   Helpers
=========================== */
const $ = id => document.getElementById(id);

/* ===========================
   Global Data
=========================== */
let allShops = [];

if (typeof SHOPS_DATA !== "undefined" && Array.isArray(SHOPS_DATA)) {
    allShops = SHOPS_DATA;
} else {
    console.error("SHOPS_DATA missing or invalid");
    Swal.fire({
        title: 'Erreur',
        text: 'Données des boutiques manquantes ou invalides',
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

/* ===========================
   Categories & Icons
=========================== */
const CATEGORY_NAMES = {
    fashion: 'Mode & Vêtements',
    electronics: 'Électronique',
    food: 'Alimentation & Boissons',
    beauty: 'Beauté & Cosmétiques',
    home: 'Maison & Jardin',
    sports: 'Sports & Fitness',
    books: 'Livres & Fournitures',
    toys: 'Jouets & Jeux',
    jewelry: 'Bijoux & Accessoires',
    health: 'Santé & Bien-être',
    automotive: 'Automobile',
    arts: 'Art & Artisanat',
    other: 'Autre',
};

const CATEGORY_ICONS = {
    fashion: '👗',
    electronics: '💻',
    food: '🍎',
    beauty: '💄',
    home: '🏠',
    sports: '⚽',
    books: '📚',
    toys: '🧸',
    jewelry: '💍',
    health: '💊',
    automotive: '🚗',
    arts: '🎨',
    other: '🛍️',
};

/* ===========================
   Render Shops
=========================== */
function renderShops(shops) {
    const grid = $('shopsGrid');
    const count = $('shopsCount');
    const empty = $('noResults');

    if (!shops.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        count.textContent = '0 boutique trouvée';
        return;
    }

    empty.style.display = 'none';
    count.textContent = `${shops.length} boutique${shops.length > 1 ? 's' : ''} trouvée${shops.length > 1 ? 's' : ''}`;

    grid.innerHTML = shops.map(shop => `
        <a href="/shop/${shop.shop_id}/" class="shop-card">
            <div class="shop-card-header">
                <div class="shop-icon">
                    ${CATEGORY_ICONS[shop.shop_category] || '🛍️'}
                </div>
            </div>

            <div class="shop-card-body">
                <h3 class="shop-name">${shop.shop_name}</h3>
                <span class="shop-category">
                    ${CATEGORY_NAMES[shop.shop_category] || shop.shop_category}
                </span>

                <div class="shop-meta">
                    <div class="shop-meta-item">
                        📍 <span>${shop.location}</span>
                    </div>
                    <div class="shop-meta-item">
                        📦 <span>${shop.product_count} produit${shop.product_count > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            <div class="shop-card-footer">
                <button class="view-shop-btn">
                    Voir la boutique →
                </button>
            </div>
        </a>
    `).join('');
}

/* ===========================
   Filters
=========================== */
function filterShops() {
    const search = $('searchInput').value.toLowerCase();
    const category = $('categoryFilter').value;

    let filtered = [...allShops];

    if (search) {
        filtered = filtered.filter(shop =>
            shop.shop_name.toLowerCase().includes(search) ||
            shop.location.toLowerCase().includes(search)
        );
    }

    if (category) {
        filtered = filtered.filter(shop => shop.shop_category === category);
    }

    renderShops(filtered);
}

/* ===========================
   Populate Category Filter
=========================== */
function populateCategoryFilter() {
    const filter = $('categoryFilter');
    if (!filter) return;

    filter.innerHTML = `
        <option value="">Toutes les catégories</option>
        ${Object.entries(CATEGORY_NAMES).map(([value, label]) =>
            `<option value="${value}">${label}</option>`
        ).join('')}
    `;
}

/* ===========================
   Init
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    populateCategoryFilter();
    renderShops(allShops);

    $('searchInput')?.addEventListener('input', filterShops);
    $('categoryFilter')?.addEventListener('change', filterShops);
});
