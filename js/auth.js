/**
 * HubFest Authentication System
 * Handles Login, Signup, and Session Management
 */

const AUTH_CONFIG = {
    USER_KEY: 'hubfest_users',
    ACTIVE_USER_KEY: 'hubfest_active_user',
    REMEMBER_KEY: 'hubfest_remember_me'
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Check if already logged in
    checkAlreadyLoggedIn();
});

function switchForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const desc = document.getElementById('auth-description');

    if (type === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        desc.innerText = 'Crie sua conta gratuita agora';
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        desc.innerText = 'Acesse sua conta para gerenciar seus eventos';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    const users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        loginUser(user, remember);
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const users = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY) || '[]');

    if (users.find(u => u.email === email)) {
        alert('Este e-mail já está cadastrado!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // Em produção, NUNCA salvar senha pura
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(users));

    alert('Conta criada com sucesso! Faça login.');
    switchForm('login');
}

function handleGoogleLogin() {
    // Simulação de Google Login Profissional para Demonstração
    const btn = document.querySelector('.google-btn');
    const originalContent = btn.innerHTML;

    btn.innerHTML = '<i data-feather="loader" class="loader"></i> Aguarde...';
    btn.disabled = true;
    feather.replace();

    // Simula o tempo de resposta do Google (1.5 segundos)
    setTimeout(() => {
        const user = {
            id: 'google_demo_123',
            name: 'Usuário Google Demo',
            email: 'demo@gmail.com',
            provider: 'google'
        };

        loginUser(user, true);
    }, 1500);
}

function loginUser(user, remember) {
    localStorage.setItem(AUTH_CONFIG.ACTIVE_USER_KEY, JSON.stringify(user));
    if (remember) {
        localStorage.setItem(AUTH_CONFIG.REMEMBER_KEY, 'true');
    } else {
        localStorage.removeItem(AUTH_CONFIG.REMEMBER_KEY);
    }

    // Sucesso - Ir para Dashboard
    window.location.href = 'index.html';
}

function logoutUser() {
    localStorage.removeItem(AUTH_CONFIG.ACTIVE_USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REMEMBER_KEY);
    window.location.href = 'login.html';
}

function checkAlreadyLoggedIn() {
    const activeUser = localStorage.getItem(AUTH_CONFIG.ACTIVE_USER_KEY);
    const remember = localStorage.getItem(AUTH_CONFIG.REMEMBER_KEY);

    // Se estiver na página de login e já tiver login com "Lembrar", vai pro index
    const isLoginPage = window.location.pathname.includes('login');
    if (isLoginPage && activeUser && remember) {
        window.location.href = 'index.html';
    }
}

function toggleForgotPassword() {
    alert('Funcionalidade de recuperação de senha: Um e-mail seria enviado em um sistema real.');
}
