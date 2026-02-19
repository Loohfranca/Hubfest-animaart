/**
 * HubFest Authentication System (Powered by Supabase)
 */

const AUTH_CONFIG = {
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

    checkAlreadyLoggedIn();
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Entrando...";
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        const userData = {
            id: data.user.id,
            name: data.user.user_metadata.full_name || data.user.email.split('@')[0],
            email: data.user.email
        };

        loginUser(userData, remember);
    } catch (error) {
        alert('Erro ao entrar: ' + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Criando conta...";
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) throw error;

        alert('Conta criada com sucesso! Verifique seu e-mail para confirmar (se ativado no Supabase) ou faça login.');
        switchForm('login');
    } catch (error) {
        alert('Erro ao criar conta: ' + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function handleGoogleLogin() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (error) {
        alert('Erro no Google Login: ' + error.message);
    }
}

function loginUser(user, remember) {
    localStorage.setItem(AUTH_CONFIG.ACTIVE_USER_KEY, JSON.stringify(user));
    if (remember) {
        localStorage.setItem(AUTH_CONFIG.REMEMBER_KEY, 'true');
    } else {
        localStorage.removeItem(AUTH_CONFIG.REMEMBER_KEY);
    }
    window.location.href = '/';
}

async function logoutUser() {
    await supabase.auth.signOut();
    localStorage.removeItem(AUTH_CONFIG.ACTIVE_USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REMEMBER_KEY);
    window.location.href = '/login';
}

function checkAlreadyLoggedIn() {
    const activeUser = localStorage.getItem(AUTH_CONFIG.ACTIVE_USER_KEY);
    const remember = localStorage.getItem(AUTH_CONFIG.REMEMBER_KEY);
    const isLoginPage = window.location.pathname.includes('login');

    if (isLoginPage && activeUser && remember) {
        window.location.href = '/';
    }
}

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
