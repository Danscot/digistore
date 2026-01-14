// Fonction pour récupérer le token CSRF
function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    return csrfToken;
}

// Fonction pour gérer les requêtes API
async function apiRequest(url, method, data = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
    };

    if (requiresAuth) {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            headers['Authorization'] = `Token ${userData.token}`; // Si tu utilises un token d'authentification
        }
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Une erreur est survenue');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // Validation basique
        if (!username || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            // Appel à l'API de login
            const response = await apiRequest('/api/login/', 'POST', {
                username: username,
                password: password,
                remember: remember
            });

            // Stocker les données de l'utilisateur
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: response.username,
                token: response.token, // Si ton API retourne un token
                remember: remember
            }));

            // Redirection vers le tableau de bord
            window.location.href = '/dashboard/'; // Utilise une URL absolue pour éviter les problèmes
        } catch (error) {
            alert(`Erreur de connexion : ${error.message}`);
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            shopName: document.getElementById('shopName').value,
            category: document.getElementById('category').value,
            whatsapp: document.getElementById('whatsapp').value,
            username: document.getElementById('username').value,
            location: document.getElementById('location').value
        };

        // Validation basique
        if (!formData.shopName || !formData.category || !formData.whatsapp || !formData.username || !formData.location) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        // Validation du numéro WhatsApp
        const whatsappRegex = /^[0-9+\s()-]+$/;
        if (!whatsappRegex.test(formData.whatsapp)) {
            alert('Veuillez entrer un numéro WhatsApp valide');
            return;
        }

        try {
            // Appel à l'API d'inscription
            const response = await apiRequest('/api/signin/', 'POST', {
                shop_name: formData.shopName,
                category: formData.category,
                whatsapp: formData.whatsapp,
                username: formData.username,
                location: formData.location
            });

            // Stocker les données de l'utilisateur et de la boutique
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: response.username,
                token: response.token, // Si ton API retourne un token
            }));

            sessionStorage.setItem('currentShop', JSON.stringify({
                id: response.shop_id,
                name: formData.shopName,
                whatsapp: formData.whatsapp,
                location: formData.location,
                products: []
            }));

            // Redirection vers le tableau de bord
            window.location.href = '/dashboard/';
        } catch (error) {
            alert(`Erreur d'inscription : ${error.message}`);
        }
    });
}

// Logout Function
async function logout() {
    try {
        await apiRequest('/api/logout/', 'POST', {}, true);
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentShop');
        window.location.href = '/login/';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

// Vérification de l'authentification
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    const protectedPages = ['/dashboard/', '/shop/'];

    if (!currentUser && protectedPages.some(page => window.location.pathname.includes(page))) {
        window.location.href = '/login/';
    }
}

// Exécuter la vérification d'authentification sur les pages protégées
if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('shop')) {
    checkAuth();
}

// Ajouter un écouteur d'événement pour le bouton de déconnexion
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
