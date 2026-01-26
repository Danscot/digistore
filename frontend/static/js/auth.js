// ===============================
// CSRF TOKEN
// ===============================
function getCSRFToken() {
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfInput ? csrfInput.value : '';
}

// ===============================
// GENERIC API REQUEST
// ===============================
async function apiRequest(url, method, data = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
    };

    const options = {
        method: method,
        headers: headers,
        credentials: 'same-origin', // IMPORTANT for Django sessions
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
    }

    return result;
}

// ===============================
// LOGIN HANDLER
// ===============================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            Swal.fire({
                title: 'Erreur',
                text: 'Veuillez remplir tous les champs',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            await apiRequest('/api/login/', 'POST', {
                username: username,
                password: password,
            });
            window.location.href = '/dashboard/';
        } catch (error) {
            Swal.fire({
                title: 'Erreur',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
}

// ===============================
// SIGNUP HANDLER
// ===============================
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            shop_name: document.getElementById('shopName').value.trim(),
            shop_category: document.getElementById('category').value,
            wa_num: document.getElementById('whatsapp').value.trim(),
            username: document.getElementById('username').value.trim(),
            location: document.getElementById('location').value.trim(),
            password: document.getElementById('password1').value,
            password_2: document.getElementById('password2').value,
        };

        for (const key in data) {
            if (!data[key]) {
                Swal.fire({
                    title: 'Erreur',
                    text: 'Veuillez remplir tous les champs',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

        if (data.password !== data.password_2) {
            Swal.fire({
                title: 'Erreur',
                text: 'Les mots de passe ne correspondent pas',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            await apiRequest('/api/signin/', 'POST', data);
            Swal.fire({
                title: 'Succès',
                text: 'Compte créé avec succès !',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/dashboard/';
            });
        } catch (error) {
            Swal.fire({
                title: 'Erreur',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
}

// ===============================
// LOGOUT
// ===============================
async function logout() {
    Swal.fire({
        title: 'Déconnexion',
        text: 'Voulez-vous vraiment vous déconnecter ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, déconnecter',
        cancelButtonText: 'Annuler'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await apiRequest('/api/logout/', 'POST');
                window.location.href = '/login/';
            } catch (error) {
                Swal.fire({
                    title: 'Erreur',
                    text: 'Erreur lors de la déconnexion',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// ===============================
// PAGE PROTECTION
// ===============================
function checkAuth() {
    fetch('/api/check-auth/', {
        credentials: 'same-origin',
    }).then(res => {
        if (res.status === 401) {
            Swal.fire({
                title: 'Session expirée',
                text: 'Veuillez vous reconnecter',
                icon: 'warning',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/login/';
            });
        }
    });
}

if (
    window.location.pathname.includes('dashboard') ||
    window.location.pathname.includes('shop')
) {
    checkAuth();
}
