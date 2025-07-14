// login.js

// ===================================
// 1. INICIALIZAÇÃO DO BANCO DE DADOS E REFERÊNCIAS GLOBAIS
// ===================================
const db = new PouchDB('brainwashing');

//mens global
const authMessageElement = document.getElementById('authMessage');

//elemento do form de login
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

//elemento do form de cadastro
const registerForm = document.getElementById('registerForm');
const regEmailInput = document.getElementById('regEmail'); 
const regUsernameInput = document.getElementById('regUsername');
const regPasswordInput = document.getElementById('regPassword');
const regConfirmPasswordInput = document.getElementById('regConfirmPassword'); 

//elementos de erros
const emailError = document.getElementById('emailError');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const adminSecretPasswordError = document.getElementById('adminSecretPasswordError'); // Adicionado: Elemento de erro para a senha secreta do admin

//alterna entre login e cadastro
const openRegisterFromLoginButton = document.getElementById('openRegisterFromLogin');
const openLoginFromRegisterButton = document.getElementById('openLoginFromRegister');

const logoutButton = document.getElementById('logoutButton');

// Adicionado: Elementos do interruptor de administrador e campo de senha secreta
const isAdminToggle = document.getElementById('isAdminToggle');
const adminSecretPasswordGroup = document.querySelector('.admin-secret-password-group');
const adminSecretPasswordInput = document.getElementById('adminSecretPassword');


// ===================================
// 2. FUNÇÕES AUXILIARES
// ===================================

// Função para exibir mensagem de erro específica de um campo
function showError(element, message) {
    if (element) {
        element.textContent = message;
    }
}

//clean erro
function clearError(element) {
    if (element) {
        element.textContent = '';
    }
}

//aviso global
function showAuthMessage(message, type) {
    if (authMessageElement) {
        authMessageElement.textContent = message;
        authMessageElement.className = `auth-message ${type}`; 
    }
}

//clean!
function clearAuthMessage() {
    if (authMessageElement) {
        authMessageElement.textContent = '';
        authMessageElement.className = 'auth-message'; // Volta para a classe base
    }
}

//validações de campo
function validateEmailField(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError(emailError, 'O e-mail é obrigatório.');
        return false;
    }
    if (!emailRegex.test(email)) {
        showError(emailError, 'Por favor, insira um e-mail válido.');
        return false;
    }
    clearError(emailError);
    return true;
}

function validateUsernameField(username) {
    if (!username) {
        showError(usernameError, 'O nome de usuário é obrigatório.');
        return false;
    }
    if (username.length < 3) {
        showError(usernameError, 'O nome de usuário deve ter pelo menos 3 caracteres.');
        return false;
    }
    clearError(usernameError);
    return true;
}

function validatePasswordField(password) {
    if (!password) {
        showError(passwordError, 'A senha é obrigatória.');
        return false;
    }
    if (password.length < 6) {
        showError(passwordError, 'A senha deve ter pelo menos 6 caracteres.');
        return false;
    }
    clearError(passwordError);
    return true;
}

function validateConfirmPasswordField(password, confirmPassword) {
    if (!confirmPassword) {
        showError(confirmPasswordError, 'Confirme a senha.');
        return false;
    }
    if (password !== confirmPassword) {
        showError(confirmPasswordError, 'As senhas não coincidem.');
        return false;
    }
    clearError(confirmPasswordError);
    return true;
}

//gera id sequencial
async function getNextUserId() {
    try {
        const allDocs = await db.allDocs({ include_docs: false });
        const userIds = allDocs.rows
            .map(row => row.id)
            .filter(id => id.startsWith('usuario_'))
            .map(id => parseInt(id.replace('usuario_', ''), 10))
            .filter(num => !isNaN(num));

        if (userIds.length === 0) {
            return 'usuario_1'; 
        }

        const maxId = Math.max(...userIds);
        return `usuario_${maxId + 1}`;

    } catch (err) {
        console.error("Erro ao gerar o próximo ID de usuário:", err);
        showAuthMessage('Erro interno ao gerar ID. Tente novamente.', 'error');
        // Fallback caso dê bigode
        return `usuario_${new Date().getTime()}`;
    }
}


// ===================================
// 3. LÓGICA PRINCIPAL (EXECUTADA APÓS O DOM CARREGAR)
// ===================================
document.addEventListener('DOMContentLoaded', async () => {

    // Lógica do Interruptor 'Sou Administrador'
    if (isAdminToggle && adminSecretPasswordGroup && adminSecretPasswordInput && adminSecretPasswordError) {
        isAdminToggle.addEventListener('change', function() {
            if (this.checked) {
                // Usa classList para controlar a visibilidade via CSS (para transições)
                adminSecretPasswordGroup.classList.add('is-visible'); 
                adminSecretPasswordInput.setAttribute('required', 'required'); 
            } else {
                // Usa classList para controlar a visibilidade via CSS
                adminSecretPasswordGroup.classList.remove('is-visible'); 
                adminSecretPasswordInput.removeAttribute('required'); 
                adminSecretPasswordInput.value = ''; 
                adminSecretPasswordError.textContent = ''; 
            }
        });

        // Garante que o estado inicial do campo de senha secreta esteja correto ao carregar a página
        // Se o checkbox NÃO estiver marcado ao carregar, o campo deve estar oculto.
        if (!isAdminToggle.checked) {
            adminSecretPasswordGroup.classList.remove('is-visible');
            adminSecretPasswordInput.removeAttribute('required');
        }
    }

    // Lógica para alternar entre formulários de Login e Cadastro
    if (openRegisterFromLoginButton && openLoginFromRegisterButton) {
        openRegisterFromLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginFormContainer').style.display = 'none';
            document.getElementById('registerFormContainer').style.display = 'block';
            clearAuthMessage();
            clearError(emailError);
            clearError(usernameError);
            clearError(passwordError);
            clearError(confirmPasswordError);
            clearError(adminSecretPasswordError); // Limpa erro da senha secreta ao alternar
            if (registerForm) registerForm.reset();
            // Garante que o campo adminSecretPassword esteja oculto ao mudar para o formulário de registro
            if (isAdminToggle) {
                isAdminToggle.checked = false;
                adminSecretPasswordGroup.classList.remove('is-visible');
                adminSecretPasswordInput.removeAttribute('required');
                adminSecretPasswordInput.value = '';
            }
        });

        openLoginFromRegisterButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginFormContainer').style.display = 'block';
            document.getElementById('registerFormContainer').style.display = 'none';
            clearAuthMessage();
            if (loginForm) loginForm.reset();
        });
    }

    //logica cad
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthMessage(); 

            const email = regEmailInput.value.trim();
            const username = regUsernameInput.value.trim();
            const password = regPasswordInput.value;
            const confirmPassword = regConfirmPasswordInput.value;

            // Limpa mensagens de erro anteriores para o campo da senha secreta
            if (adminSecretPasswordError) {
                adminSecretPasswordError.textContent = '';
            }

            // Validação da senha secreta de administrador (frontend)
            let isAdminValid = true;
            if (isAdminToggle && isAdminToggle.checked) {
                const secretPassword = adminSecretPasswordInput ? adminSecretPasswordInput.value : '';
                const requiredSecretPassword = "calabresinhafrita"; // A senha secreta esperada

                if (secretPassword !== requiredSecretPassword) {
                    showError(adminSecretPasswordError, 'Senha secreta incorreta.');
                    if (adminSecretPasswordInput) adminSecretPasswordInput.focus();
                    isAdminValid = false;
                }
            }

            // Executa todas as validações de campo
            const isEmailValid = validateEmailField(email);
            const isUsernameValid = validateUsernameField(username);
            const isPasswordValid = validatePasswordField(password);
            const isConfirmPasswordValid = validateConfirmPasswordField(password, confirmPassword);

            // Se alguma validação falhar (incluindo a do admin), para por aqui
            if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid || !isAdminValid) {
                showAuthMessage('Por favor, corrija os erros no formulário.', 'error');
                return;
            }

            try {
                // Busca unicidade de username
                const existingUsernameDoc = await db.find({
                    selector: { username: username }
                });
                if (existingUsernameDoc.docs.length > 0) {
                    showError(usernameError, 'Este nome de usuário já existe. Escolha outro.');
                    showAuthMessage('Nome de usuário já em uso.', 'error');
                    return;
                }
                // Busca unicidade de email
                const existingEmailDoc = await db.find({
                    selector: { email: email }
                });
                if (existingEmailDoc.docs.length > 0) {
                    showError(emailError, 'Este e-mail já está cadastrado.');
                    showAuthMessage('E-mail já em uso.', 'error');
                    return;
                }

                const newUserId = await getNextUserId();
                const userDoc = {
                    _id: newUserId,
                    email: email, // Adicionando o email
                    username: username,
                    password: password, // Lembre-se: Em um app real, a senha DEVE ser hashada!
                    isAdmin: isAdminToggle ? isAdminToggle.checked : false, // Salva o status de admin
                    createdAt: new Date().toISOString()
                };

                await db.put(userDoc);
                showAuthMessage(`Usuário '${username}' cadastrado com sucesso! Agora você pode fazer login.`, 'success');
                registerForm.reset(); 
                
                // Oculta o campo de senha secreta após o cadastro bem-sucedido
                if (isAdminToggle) {
                    isAdminToggle.checked = false; // Desmarca o toggle
                    adminSecretPasswordGroup.classList.remove('is-visible'); // Oculta o campo
                    adminSecretPasswordInput.removeAttribute('required');
                    adminSecretPasswordInput.value = '';
                    adminSecretPasswordError.textContent = '';
                }

                setTimeout(() => {
                    document.getElementById('loginFormContainer').style.display = 'block';
                    document.getElementById('registerFormContainer').style.display = 'none';
                    clearAuthMessage();
                }, 1200);

            } catch (err) {
                console.error('Erro ao cadastrar o usuário:', err);
                if (err.status === 409) {
                    showAuthMessage('Conflito: Usuário ou e-mail já existe.', 'error');
                } else {
                    showAuthMessage('Erro ao cadastrar o usuário. Tente novamente.', 'error');
                }
            }
        });
    }

    //logica login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthMessage(); 

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                showAuthMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }

            try {
                // Busca o usuário pelo nome de usuário
                const result = await db.find({
                    selector: { username: username },
                    limit: 1
                });

                if (result.docs.length > 0) {
                    const user = result.docs[0];
                    if (user.password === password) { // Lembre-se: Senha DEVE ser hashada!
                        localStorage.setItem('loggedInUser', user.username);
                        localStorage.setItem('isAdmin', user.isAdmin ? 'true' : 'false'); // Salva o status de admin no localStorage
                        showAuthMessage('Login bem-sucedido! Redirecionando...', 'success'); 
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        showAuthMessage('Senha incorreta.', 'error');
                    }
                } else {
                    showAuthMessage('Usuário não encontrado.', 'error');
                }
            } catch (err) {
                console.error('Erro ao tentar fazer login:', err);
                showAuthMessage('Ocorreu um erro ao fazer login.', 'error');
            }
        });
    }

    //logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('isAdmin'); // Remove o status de admin ao deslogar
            window.location.href = 'login.html';
        });
    }

    //inicia banco
    try {
        // Criar índice para 'username' para buscas de unicidade e login
        await db.createIndex({
            index: { fields: ['username'] }
        });
        // Criar índice para 'email' para buscas de unicidade no cadastro
        await db.createIndex({
            index: { fields: ['email'] }
        });

    } catch (err) {
        if (err.status !== 409) {
            console.error("Erro ao criar índice no banco de dados:", err);
            showAuthMessage('DEU RUIM', 'error');
        } else {
            console.log("Índices já existentes, pulando a criação.");
        }
    }

    const loggedInUsername = localStorage.getItem('loggedInUser');
    const onLoginPage = !!document.getElementById('loginFormContainer');

    //obriga a logar
    if (onLoginPage) {
        if (loggedInUsername) {
            window.location.href = 'index.html';
        }
    } else {
        if (!loggedInUsername) {
            window.location.href = 'login.html';
        } else {
            const currentUsernameElement = document.getElementById('currentUsername');
            if (currentUsernameElement) {
                currentUsernameElement.textContent = loggedInUsername;
            }
        }
    }
});