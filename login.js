
const usersDB = new PouchDB('brainwashing');

// --- Elementos de Autenticação (Login/Cadastro) ---
const authMessageElement = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const registerForm = document.getElementById('registerForm');
const regUsernameInput = document.getElementById('regUsername');
const regPasswordInput = document.getElementById('regPassword');
const openRegisterFromLoginButton = document.getElementById('openRegisterFromLogin');
const openLoginFromRegisterButton = document.getElementById('openLoginFromRegister');

// --- Event Listeners para alternar entre Login e Cadastro ---
if (openRegisterFromLoginButton && openLoginFromRegisterButton) {
    openRegisterFromLoginButton.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que o link '#' mude a URL
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('registerFormContainer').style.display = 'block';
    });

    openLoginFromRegisterButton.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que o link '#' mude a URL
        document.getElementById('loginFormContainer').style.display = 'block';
        document.getElementById('registerFormContainer').style.display = 'none';
    });
}


// --- CORREÇÃO: A FUNÇÃO QUE FALTAVA ---
/**
 * Gera o próximo ID sequencial para um novo usuário (ex: usuario_2, usuario_3).
 * @returns {Promise<string>} O próximo ID de usuário.
 */
async function getNextUserId() {
    try {
        const allDocs = await usersDB.allDocs({ include_docs: false });
        const userIds = allDocs.rows
            .map(row => row.id)
            .filter(id => id.startsWith('usuario_'))
            .map(id => parseInt(id.replace('usuario_', ''), 10))
            .filter(num => !isNaN(num));

        if (userIds.length === 0) {
            return 'usuario_2';
        }

        const maxId = Math.max(...userIds);
        return `usuario_${maxId + 1}`;

    } catch (err) {
        console.error("Erro ao gerar o próximo ID de usuário:", err);
        // Fallback caso dê bigode
        return `usuario_${new Date().getTime()}`;
    }
}


// --- Lógica de Cadastro de Usuário ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = regUsernameInput.value.trim();
        const password = regPasswordInput.value;

        if (!username || !password) {
            authMessageElement.textContent = 'Por favor, preencha todos os campos.';
            authMessageElement.style.color = 'red';
            return;
        }

        try {
            const existingUser = await usersDB.find({
                selector: { username: username }
            });

            if (existingUser.docs.length > 0) {
                authMessageElement.textContent = 'Erro: Este nome de usuário já existe. Escolha outro.';
                authMessageElement.style.color = 'red';
                return;
            }

            const newUserId = await getNextUserId();

            const userDoc = {
                _id: newUserId,
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            };

            await usersDB.put(userDoc);
            authMessageElement.textContent = `Usuário '${username}' cadastrado com sucesso! Agora você pode fazer login.`;
            authMessageElement.style.color = 'green';
            registerForm.reset();

            setTimeout(() => {
                document.getElementById('loginFormContainer').style.display = 'block';
                document.getElementById('registerFormContainer').style.display = 'none';
            }, 2000);

        } catch (err) {
            console.error('Erro ao cadastrar o usuário:', err);
            authMessageElement.textContent = 'Erro ao cadastrar o usuário. Tente novamente.';
            authMessageElement.style.color = 'red';
        }
    });
}

// --- Lógica de Login de Usuário ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            authMessageElement.textContent = 'Por favor, preencha todos os campos.';
            authMessageElement.style.color = 'red';
            return;
        }

        try {
            const result = await usersDB.find({
                selector: { username: username },
                limit: 1
            });

            if (result.docs.length > 0) {
                const user = result.docs[0];
                if (user.password === password) {
                    localStorage.setItem('loggedInUser', user.username);
                    window.location.href = 'index.html';
                } else {
                    authMessageElement.textContent = 'Senha incorreta.';
                    authMessageElement.style.color = 'red';
                }
            } else {
                authMessageElement.textContent = 'Usuário não encontrado.';
                authMessageElement.style.color = 'red';
            }
        } catch (err) {
            console.error('Erro ao tentar fazer login:', err);
            authMessageElement.textContent = 'Ocorreu um erro ao fazer login.';
            authMessageElement.style.color = 'red';
        }
    });
}

// --- Lógica de Logout ---
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
}

// --- Lógica de Inicialização e Proteção de Página ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await usersDB.createIndex({
            index: { fields: ['username'] }
        });
    } catch (err) {
        console.error("Erro ao criar índice no banco de dados:", err);
    }

    const loggedInUser = localStorage.getItem('loggedInUser');
    const onLoginPage = !!loginForm;

    if (onLoginPage) {
        if (loggedInUser) {
            window.location.href = 'index.html';
        }
    } else {
        if (!loggedInUser) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('currentUsername').textContent = loggedInUser;
            document.getElementById('loggedInInfo').style.display = 'block';
        }
    }
});