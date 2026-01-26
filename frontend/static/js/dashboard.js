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
async function apiRequest(url, method='GET', body=null, isForm=false) {
    const options = {
        method,
        credentials: 'include',
        headers: isForm ? {'X-CSRFToken': getCSRFToken()} : {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
    };

    if (body) options.body = isForm ? body : JSON.stringify(body);

    const res = await fetch(url, options);
    const text = await res.text();

    let json;
    try { json = JSON.parse(text); } catch { json = null; }

    if (!res.ok) throw new Error(json?.detail || text || 'Erreur serveur');
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
        Swal.fire({
            title: 'Erreur',
            text: 'Impossible de charger le tableau de bord',
            icon: 'error',
            confirmButtonText: 'OK'
        });
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
    if (Object.values(payload).some(v => !v)) {
        Swal.fire({
            title: 'Erreur',
            text: 'Veuillez remplir tous les champs',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        await apiRequest('/api/update_shop_infos/', 'POST', payload);
        Swal.fire({
            title: 'Succès',
            text: 'Vos informations ont été mises à jour',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (err) {
        Swal.fire({
            title: 'Erreur',
            text: err.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
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
function truncate(text, max = 60) {
    return text.length > max ? text.slice(0, max) + '…' : text;
}

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
            <td>${CATEGORY_CHOICES.find(c => c.value === p.category)?.label || p.category}</td>
            <td>${truncate(p.description)}</td>
            <td>
                <button class="btn btn-outline" onclick="editProduct(${i})">✏️</button>
                <button class="btn btn-danger" onclick="deleteProduct(${i})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

/* ===========================
   Product Modal
=========================== */
function populateCategoryChoices() {
    $('productCategory').innerHTML = CATEGORY_CHOICES
        .map(c => `<option value="${c.value}">${c.label}</option>`)
        .join('');
}

function openAddProductModal() {
    state.editingIndex = null;
    $('productForm').reset();
    $('modalTitle').textContent = 'Ajouter un produit';
    $('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function editProduct(index) {
    const p = state.products[index];
    if (!p) return;

    state.editingIndex = index;
    $('modalTitle').textContent = 'Modifier le produit';
    $('productName').value = p.name;
    $('productCategory').value = p.category;
    $('productDescription').value = p.description;
    $('productPrice').value = p.price;
    $('productModal').classList.add('active');
}

function closeProductModal() {
    $('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

/* ===========================
   Save Product (Supports API & Optional Image)
=========================== */
$('productForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', $('productName').value.trim());
    formData.append('category', $('productCategory').value);
    formData.append('description', $('productDescription').value.trim());
    formData.append('price', $('productPrice').value);

    const image = $('productImage').files[0];
    if (image) formData.append('image', image);

    try {
        let saved;
        if (state.editingIndex !== null) {
            const id = state.products[state.editingIndex].id;
            saved = await apiRequest(`/api/products/${id}/`, 'PUT', formData, true);
            state.products[state.editingIndex] = { ...state.products[state.editingIndex], ...saved };
        } else {
            saved = await apiRequest('/api/products/', 'POST', formData, true);
            state.products.push(saved);
        }

        renderProducts();
        updateStats();
        closeProductModal();
        Swal.fire({
            title: 'Succès',
            text: 'Produit enregistré',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (err) {
        Swal.fire({
            title: 'Erreur',
            text: err.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});

/* ===========================
   Delete Product
=========================== */
async function deleteProduct(index) {
    const p = state.products[index];
    if (!p) return;

    const result = await Swal.fire({
        title: 'Confirmer',
        text: `Supprimer "${p.name}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
        await apiRequest(`/api/products/${p.id}/`, 'DELETE');
        state.products.splice(index, 1);
        renderProducts();
        updateStats();
        Swal.fire({
            title: 'Succès',
            text: 'Produit supprimé',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (err) {
        Swal.fire({
            title: 'Erreur',
            text: err.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
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
    Swal.fire({
        title: 'Confirmer',
        text: 'Se déconnecter ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, se déconnecter',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) location.href='/logout/';
    });
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
