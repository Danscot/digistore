/* ===========================
   Helpers
=========================== */
const $ = id => document.getElementById(id);

const shopData = JSON.parse($('shop-data').textContent);
const productsData = JSON.parse($('products-data').textContent);
const metaData = JSON.parse($('meta-data').textContent);

function truncate(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength
        ? text.slice(0, maxLength) + '…'
        : text;
}

/* ===========================
   Categories & Icons
=========================== */
const CATEGORY_NAMES = {
    fashion: 'Mode & Vêtements',
    digital:'Produit digital',
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
    digital: '👾',
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

    grid.innerHTML = products.map(p => {
        const mainImage = p.images?.[0] || null;
        const thumbnails = p.images?.slice(1) || [];

        return `
        <div class="product-card">
            <div class="product-image">
                ${mainImage
                    ? `<img src="${mainImage}" alt="${p.name}">`
                    : `<div class="product-placeholder">📦</div>`
                }
                ${thumbnails.length
                    ? `<div class="product-thumbnails">
                        ${thumbnails.map(img => `<img src="${img}" alt="${p.name}" class="thumb">`).join('')}
                      </div>`
                    : ''
                }
            </div>

            <div class="product-body">
                <span class="product-category">${CATEGORY_NAMES[p.category]}</span>
                <h3 class="product-name">${truncate(p.name, 20)}</h3>
                <p class="product-description">${truncate(p.description, 100)}</p>
                <div class="product-price">${p.price.toLocaleString()} FCFA</div>

                <div class='btn'>
                    <button class="view-product-btn" data-id="${p.id}">📦 Voir le produit</button>
                    <button class="contact-product-btn" data-name="${p.name}">💬 Contacter</button>
                </div>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.contact-product-btn').forEach(btn => {
        btn.onclick = () => contactAboutProduct(btn.dataset.name);
    });

    document.querySelectorAll('.view-product-btn').forEach(btn => {
        btn.onclick = () => viewProduct(btn.dataset.id);
    });
}

/* ===========================
   Contact Product
=========================== */
function contactAboutProduct(productName) {
    const msg = `Bonjour 👋 Je suis intéressé par le produit "${productName}" de votre boutique "${shopData.name}".`;
    const wa = shopData.whatsapp.replace(/[^0-9]/g, '');
    Swal.fire({
        title: 'Redirection vers WhatsApp',
        text: `Vous allez être redirigé vers WhatsApp pour contacter le vendeur.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continuer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
        }
    });
}

/* ===========================
   View Product Details
=========================== */
function viewProduct(id) {
    const shop = shopData.id;
    Swal.fire({
        title: 'Voir le produit',
        text: 'Vous allez être redirigé vers la page du produit.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Continuer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            window.open(`/view_prod/${shop}/${id}/`, '_blank');
        }
    });
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

document.querySelectorAll('.product-card').forEach(card => {
    const mainImg = card.querySelector('.product-image img');
    const thumbs = card.querySelectorAll('.product-thumbnails .thumb');

    thumbs.forEach(t => {
        t.addEventListener('click', () => {
            mainImg.src = t.src;
        });
    });
});
