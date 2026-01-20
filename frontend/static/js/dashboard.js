/* ===========================
   Helpers & State
=========================== */
const $ = id => document.getElementById(id);

const CATEGORY_CHOICES = [
    {value:'fashion', label:'Mode & Vêtements'},
    {value:'electronics', label:'Électronique'},
    {value:'food', label:'Alimentation & Boissons'},
    {value:'beauty', label:'Beauté & Cosmétiques'},
    {value:'home', label:'Maison & Jardin'},
    {value:'sports', label:'Sports & Fitness'},
    {value:'books', label:'Livres & Fournitures'},
    {value:'toys', label:'Jouets & Jeux'},
    {value:'jewelry', label:'Bijoux & Accessoires'},
    {value:'health', label:'Santé & Bien-être'},
    {value:'automotive', label:'Automobile'},
    {value:'arts', label:'Art & Artisanat'},
    {value:'other', label:'Autre'},
];

const state = {
    currentShop: null,
    products: [],
    editingIndex: null,
};

/* ===========================
   CSRF Token
=========================== */
function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

/* ===========================
   API Helper
=========================== */
async function apiRequest(url, method='GET', data=null) {
    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
    };
    if (data) options.body = JSON.stringify(data);

    console.log(data)

    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!res.ok) throw new Error(json?.detail || text || 'Request failed');
    return json;
}

/* ===========================
   Init
=========================== */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchDashboardData();
    populateCategoryChoices();
});

/* ===========================
   Dashboard Data
=========================== */
async function fetchDashboardData() {
    try {
        const data = await apiRequest('/api/dashboard/');
        state.currentShop = data.shop;
        state.products = data.products || [];

        populateShopInfo();
        renderProducts();
        updateStats();
        setupShopLink();

    } catch (err) {
        console.error(err);
        alert('Impossible de charger le tableau de bord');
    }
}

/* ===========================
   Shop Info
=========================== */
function populateShopInfo() {
    if (!state.currentShop) return;
    $('settingsShopName').value = state.currentShop.name || '';
    $('settingsCategory').value = state.currentShop.category || '';
    $('settingsWhatsapp').value = state.currentShop.wa_num || '';
    $('settingsLocation').value = state.currentShop.location || '';
}

/* ===========================
   Shop Info Update
=========================== */
$('shopSettingsForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
        shop_name: $('settingsShopName').value.trim(),
        shop_cat: $('settingsCategory').value.trim(),
        wa_num: $('settingsWhatsapp').value.trim(),
        location: $('settingsLocation').value.trim(),
    };
    if (Object.values(payload).some(v => !v)) return alert('Veuillez remplir tous les champs');

    try {
        await apiRequest('/api/update_shop_infos/', 'POST', payload);
        alert('Vos informations ont été mises à jour');
    } catch (err) { alert(err.message); }
});

/* ===========================
   Stats
=========================== */
function updateStats() {
    const totalProducts = $('totalProducts');
    if (totalProducts) totalProducts.textContent = state.products.length;
}

/* ===========================
   Render Products
=========================== */
function renderProducts() {
    const tbody = $('productsTableBody');
    const empty = $('emptyProducts');
    if (!tbody) return;

    if (state.products.length === 0) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = state.products.map((p,i)=>`
        <tr>
            <td>${p.name}</td>
            <td>${CATEGORY_CHOICES.find(c=>c.value===p.category)?.label||p.category}</td>
            <td>${p.description}</td>
            <td>
                <button class="btn btn-outline edit-btn" onclick="editProduct(${i})">✏️ Modifier</button>
                <button class="btn btn-danger delete-btn" onclick="deleteProduct(${i})">🗑️ Supprimer</button>
            </td>
        </tr>
    `).join('');
}

/* ===========================
   Product Modal
=========================== */
function populateCategoryChoices() {
    const select = $('productCategory');
    if (!select) return;
    select.innerHTML = CATEGORY_CHOICES.map(c=>`<option value="${c.value}">${c.label}</option>`).join('');
}

function openAddProductModal() {
    state.editingIndex = null;
    const form = $('productForm');
    form.reset();
    $('modalTitle').textContent = 'Ajouter un produit';
    $('productId').value = '';
    $('productPrice').value = '';
    if ($('productNegotiable')) $('productNegotiable').checked = false;
    $('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function editProduct(index) {
    state.editingIndex = index;
    const p = state.products[index];
    if (!p) return;
    $('modalTitle').textContent = 'Modifier le produit';
    $('productId').value = index;
    $('productName').value = p.name;
    $('productCategory').value = p.category;
    $('productDescription').value = p.description;
    $('productPrice').value = p.price;
    if ($('productNegotiable')) $('productNegotiable').checked = !!p.negotiable;
    $('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    $('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

/* ===========================
   Save Product (API)
=========================== */
$('productForm')?.addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
        name: $('productName').value.trim(),
        category: $('productCategory').value,
        description: $('productDescription').value.trim(),
        price: $('productPrice').value.trim() || "0 XAF",
        negotiable: $('productNegotiable')?.checked || false,
    };

    try {
        let saved;
        if (state.editingIndex !== null) {
            const id = state.products[state.editingIndex].id;
            saved = await apiRequest(`/api/products/${id}/`, 'PUT', payload);
            state.products[state.editingIndex] = saved;
        } else {
            saved = await apiRequest('/api/products/', 'POST', payload);
            state.products.push(saved);
        }
        renderProducts();
        updateStats();
        closeProductModal();
        alert(state.editingIndex !== null ? 'Produit mis à jour !' : 'Produit ajouté !');
    } catch(err){ alert(err.message); }
});

function deleteProduct(index) {
    if (!state.products[index]) return;
    const p = state.products[index];
    if (!confirm(`Supprimer "${p.name}" ?`)) return;

    apiRequest(`/api/products/${p.id}/`, 'DELETE')
        .then(()=> {
            state.products.splice(index,1);
            renderProducts();
            updateStats();
        })
        .catch(err=>alert(err.message));
}

/* ===========================
   Sidebar / Navigation
=========================== */
function setupEventListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            switchSection(item.dataset.section);
            closeMobileSidebar();
        });
    });

    $('mobileSidebarToggle')?.addEventListener('click', () => {
        $('sidebar')?.classList.toggle('active');
        $('sidebarOverlay')?.classList.toggle('active');
    });

    $('sidebarOverlay')?.addEventListener('click', closeMobileSidebar);
    $('logoutBtn')?.addEventListener('click', logout);

    $('addProductBtn')?.addEventListener('click', openAddProductModal);
    $('modalClose')?.addEventListener('click', closeProductModal);
    $('modalOverlay')?.addEventListener('click', closeProductModal);
}

/* ===========================
   Sections
=========================== */
function switchSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    $(section + '-section')?.classList.add('active');

    const titles = {
        'overview': { title: 'Aperçu du tableau de bord', subtitle: 'Gérez votre boutique et produits' },
        'products': { title: 'Produits', subtitle: 'Ajoutez et gérez vos produits' },
        'shop-settings': { title: 'Paramètres boutique', subtitle: 'Modifiez vos informations de boutique' }
    };
    $('sectionTitle').textContent = titles[section]?.title || '';
    $('sectionSubtitle').textContent = titles[section]?.subtitle || '';
}

/* ===========================
   Shop Link
=========================== */
function setupShopLink() {
    if (!state.currentShop?.id) return;
    const url = `${location.origin}/shop/${state.currentShop.id}`;
    $('shopLinkInput').value = url;
    $('copyLinkBtn')?.addEventListener('click', ()=>{
        $('shopLinkInput').select();
        document.execCommand('copy');
        $('copySuccess')?.classList.add('show');
        setTimeout(()=> $('copySuccess')?.classList.remove('show'),2000);
    });
}

/* ===========================
   Logout
=========================== */
function logout() {
    if (confirm('Se déconnecter ?')) location.href='/logout/';
}

/* ===========================
   Utilities
=========================== */
function closeMobileSidebar() {
    $('sidebar')?.classList.remove('active');
    $('sidebarOverlay')?.classList.remove('active');
}

/* ===========================
   Expose for inline
=========================== */
window.switchSection = switchSection;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
