/* ===========================
   Helpers
=========================== */
const $ = id => document.getElementById(id);

const shopData = JSON.parse($('shop-data').textContent);
const productsData = JSON.parse($('products-data').textContent);
const metaData = JSON.parse($('meta-data').textContent);

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
   Render Shop Info
=========================== */
function renderShopInfo() {
    $('shopName').textContent = shopData.name;
    $('shopCategory').textContent = CATEGORY_NAMES[shopData.category];
    $('shopLocation').textContent = shopData.location;
    $('shopIcon').textContent = CATEGORY_ICONS[shopData.category];
    $('productCount').textContent = `${metaData.length} Produits`;

    $('contactOwnerBtn')?.addEventListener('click', () => {
        const msg = `Bonjour 👋 Je suis intéressé par votre boutique "${shopData.name}" sur DigiStore.`;
        const wa = shopData.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
    });
}

/* ===========================
   Render Products
=========================== */
function renderProducts(products) {
    const grid = $('productsGrid');
    const empty = $('noProducts');

    if (!products.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-image">
                ${p.image
                    ? `<img src="${p.image}" alt="${p.name}">`
                    : `<div class="product-placeholder">📦</div>`
                }
            </div>

            <div class="product-body">
                <span class="product-category">
                    ${CATEGORY_NAMES[p.category]}
                </span>
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <div class="product-price">
                    ${p.price.toLocaleString()} 
                </div>

                <button class="contact-product-btn" data-name="${p.name}">
                    💬 Contacter
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.contact-product-btn').forEach(btn => {
        btn.onclick = () => contactAboutProduct(btn.dataset.name);
    });
}

/* ===========================
   Contact Product
=========================== */
function contactAboutProduct(productName) {
    const msg = `Bonjour 👋 Je suis intéressé par le produit "${productName}" de votre boutique "${shopData.name}".`;
    const wa = shopData.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ===========================
   Search
=========================== */
function setupSearch() {
    $('productSearch')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = productsData.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
        renderProducts(filtered);
    });
}

/* ===========================
   Init
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    renderShopInfo();
    renderProducts(productsData);
    setupSearch();
});
