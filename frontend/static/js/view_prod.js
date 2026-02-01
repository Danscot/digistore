/* ===========================
   Helpers
=========================== */
const $ = id => document.getElementById(id);

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function getIconForCategory(category) {
    const icons = {
        'digital': '👾',
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

/* ===========================
   API Helper
=========================== */
async function apiRequest(url, method='GET') {
    const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!res.ok) throw new Error(json?.detail || text || 'Server error');
    return json;
}

/* ===========================
   Load Product Data
=========================== */
async function loadProductData() {

    // Get current URL path
    const path = window.location.pathname; 

    // Split by "/"
    const parts = path.split("/").filter(Boolean); 

    const shopId = parts[1];

    const productId = parts[2];

    console.log(parts)

    // const shopId = getUrlParameter('shopId');

    // const productId = getUrlParameter('productId');
    
    if (!shopId) {

       alert('Invalid  shop');

        window.location.href = '/shops/';

        return;
    }

    try {
        // Fetch shop data with products
        const shopData = await apiRequest(`/api/shop/${shopId}/`);
        
        // Find the specific product
        const product = shopData.products.find(p => p.id == productId);
        
        if (!product) {
            alert('Product not found');
            window.location.href = `/shop/${shopId}/`;
            return;
        }

        return { shop: shopData.shop, product, allProducts: shopData.products };

    } catch (err) {

        console.error(err);
        //alert('Unable to load product details');
        //window.location.href = '/shops/';
    }
}

/* ===========================
   Render Product Details
=========================== */
function renderProductDetail(shop, product) {
    // Update breadcrumb
    $('shopBreadcrumb').textContent = shop.name;
    $('shopBreadcrumb').href = `/shop/${shop.id}/`;
    $('productBreadcrumb').textContent = product.name;
    
    // Update product info
    $('productName').textContent = product.name;
    $('productDescription').textContent = product.description;
    $('detailCategory').textContent = product.category;
    
    // Update product image
    const mainImage = $('mainProductImage');
    if (product.image && product.image.length > 0) {
        mainImage.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
    }
    
    // Update shop info
    const shopIcon = getIconForCategory(shop.category);
    $('shopMiniIcon').textContent = shopIcon;
    $('shopMiniName').textContent = shop.name;
    $('shopLocation').textContent = shop.location;
    $('visitShopLink').href = `/shop/${shop.id}/`;
    
    // Setup contact button
    const contactBtn = $('contactSellerBtn');
    contactBtn.addEventListener('click', () => {
        const message = `Hi! I'm interested in "${product.name}" from your shop "${shop.name}". Can you provide the price and more details?`;
        const whatsappUrl = `https://wa.me/${shop.wa_num.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
}

/* ===========================
   Render Related Products
=========================== */
function renderRelatedProducts(shop, currentProduct, allProducts) {
    const relatedGrid = $('relatedProductsGrid');
    const noRelated = $('noRelated');
    
    // Get other products from same shop (excluding current product)
    const relatedProducts = allProducts.filter(p => p.id != currentProduct.id);
    
    if (relatedProducts.length === 0) {
        relatedGrid.innerHTML = '';
        noRelated.style.display = 'block';
        return;
    }
    
    noRelated.style.display = 'none';
    
    // Show max 3 related products
    const displayProducts = relatedProducts.slice(0, 3);
    
    relatedGrid.innerHTML = displayProducts.map(product => `
        <a href="/view_prod/${shop.id}/${product.id}/" class="related-product-card">
            <div class="related-product-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}">` : 
                    `<div class="related-product-placeholder">📦</div>`
                }
            </div>
            <div class="related-product-body">
                <span class="related-product-category">${product.category}</span>
                <h3 class="related-product-name">${product.name}</h3>
                <p class="related-product-description">${product.description}</p>
            </div>
        </a>
    `).join('');
}

/* ===========================
   Initialize Page
=========================== */
document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadProductData();
    if (data) {
        renderProductDetail(data.shop, data.product);
        renderRelatedProducts(data.shop, data.product, data.allProducts);
    }
});