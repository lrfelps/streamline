let loggedInUser = null;

// Referências aos elementos da Página Principal
const accessRestrictedButtons = document.querySelectorAll('.access-restricted');
const loggedInInfo = document.getElementById('loggedInInfo');
const currentUsernameSpan = document.getElementById('currentUsername');
const logoutButton = document.getElementById('logoutButton');

// Referências que serão preenchidas APÓS o modal ser carregado dinamicamente
let loginModal, closeButton, modalMessageElement;
let loginFormContainer, registerFormContainer;
let openRegisterFromLoginBtn, openLoginFromRegisterBtn;
let loginForm, registerForm;

// Função para exibir mensagens no modal
function showModalMessage(msg, type = 'error') {
    if (modalMessageElement) {
        modalMessageElement.textContent = msg;
        modalMessageElement.style.color = type === 'success' ? 'green' : 'red';
    } else {
        console.error("Elemento 'modalMessageElement' não encontrado.");
    }
}

// Funções para controlar a visibilidade dos formulários no modal
function showLoginForm() {
    if (loginFormContainer && registerFormContainer) {
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        showModalMessage(''); // Limpa mensagens ao alternar
    }
}

function showRegisterForm() {
    if (loginFormContainer && registerFormContainer) {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        showModalMessage(''); // Limpa mensagens ao alternar
    }
}

// Funções para abrir e fechar o modal
function openModal() {
    if (loginModal) {
        loginModal.style.display = 'flex'; // Usar flex para centralizar
        showModalMessage(''); // Limpa mensagens anteriores
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        showLoginForm(); // Sempre mostra o formulário de login por padrão ao abrir o modal
    }
}

function closeModal() {
    if (loginModal) {
        loginModal.style.display = 'none';
    }
}

// --- Lógica de Verificação de Login e Logout ---

// Verifica o status de login ao carregar a página
async function checkLoginStatus() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        loggedInUser = storedUser;
        currentUsernameSpan.textContent = loggedInUser;
        loggedInInfo.style.display = 'block';
    } else {
        loggedInInfo.style.display = 'none';
    }
}

// Lógica de Logout
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    loggedInUser = null;
    checkLoginStatus(); // Atualiza a UI para mostrar que deslogou
    alert('Você foi desconectado.');
});

// --- Lógicas dos Formulários (Login e Cadastro) ---

// Lógica de Registro de Usuário
async function handleRegisterSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (!username || !password) {
        showModalMessage('Por favor, preencha todos os campos de registro.');
        return;
    }

    try {
        await db.get(username);
        showModalMessage('Usuário já existe. Escolha outro nome de usuário.');
    } catch (err) {
        if (err.name === 'not_found') {
            try {
                await db.put({
                    _id: username,
                    password: password 
                });
                showModalMessage('Usuário cadastrado com sucesso!', 'success');
                registerForm.reset();

                // Após o cadastro bem-sucedido, volta para o formulário de login
                setTimeout(() => {
                    showLoginForm(); 
                    if (document.getElementById('username')) {
                        document.getElementById('username').value = username; 
                    }
                }, 1500);

            } catch (putErr) {
                console.error('Erro ao cadastrar usuário:', putErr);
                showModalMessage('Erro ao cadastrar usuário. Tente novamente.');
            }
        } else {
            console.error('Erro ao buscar usuário para registro:', err);
            showModalMessage('Erro ao verificar usuário existente. Tente novamente.');
        }
    }
}

// Lógica de Login
async function handleLoginSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showModalMessage('Por favor, preencha todos os campos de login.');
        return;
    }

    try {
        const userDoc = await db.get(username);
        if (userDoc.password === password) {
            showModalMessage('Login bem-sucedido!', 'success');
            localStorage.setItem('loggedInUser', username);
            loggedInUser = username;
            currentUsernameSpan.textContent = loggedInUser;
            loggedInInfo.style.display = 'block';
            
            setTimeout(() => {
                closeModal();
                alert('Bem-vindo, ' + username + '!');
                
                // Implemente aqui o que acontece após o login:
                // Redirecionar, mostrar conteúdo oculto, etc.
            }, 1000); 

        } else {
            showModalMessage('Senha incorreta.');
        }
    } catch (err) {
        if (err.name === 'not_found') {
            showModalMessage('Usuário não encontrado.');
        } else {
            console.error('Erro ao fazer login:', err);
            showModalMessage('Erro ao tentar fazer login. Tente novamente.');
        }
    }
}

// --- Carregamento Dinâmico do Modal e Atribuição de Event Listeners ---

document.addEventListener('DOMContentLoaded', async () => {
    // Carrega o conteúdo do modal de login
    try {
        const response = await fetch('login.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modalHtml = await response.text();
        document.getElementById('modal-placeholder').innerHTML = modalHtml;

        // Agora que o modal está no DOM, obtemos as referências e anexamos os listeners
        loginModal = document.getElementById('loginModal');
        closeButton = loginModal.querySelector('.close-button');
        modalMessageElement = document.getElementById('modalMessage');

        loginFormContainer = document.getElementById('loginFormContainer');
        registerFormContainer = document.getElementById('registerFormContainer');

        openRegisterFromLoginBtn = document.getElementById('openRegisterFromLogin');
        openLoginFromRegisterBtn = document.getElementById('openLoginFromRegister');

        loginForm = document.getElementById('loginForm');
        registerForm = document.getElementById('registerForm');

        // Atribui os event listeners aos elementos do modal
        if (closeButton) closeButton.addEventListener('click', closeModal);
        if (openRegisterFromLoginBtn) openRegisterFromLoginBtn.addEventListener('click', showRegisterForm);
        if (openLoginFromRegisterBtn) openLoginFromRegisterBtn.addEventListener('click', showLoginForm);
        if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
        if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

        // Adiciona event listener para fechar o modal clicando fora dele
        window.addEventListener('click', (event) => {
            if (event.target == loginModal) {
                closeModal();
            }
        });

    } catch (error) {
        console.error('Erro ao carregar o modal de login:', error);
        // Exiba uma mensagem de erro na página principal se o modal não puder ser carregado
        const header = document.querySelector('.header');
        const errorMessage = document.createElement('p');
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Não foi possível carregar a funcionalidade de login. Por favor, tente novamente mais tarde.';
        if (header) header.after(errorMessage);
    }

    // Atribui listeners aos botões de acesso restrito (estes já existem no DOM)
    accessRestrictedButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!loggedInUser) {
                openModal(); // Apenas abre o modal, que mostrará o login por padrão
            } else {
                alert('Você já está logado como ' + loggedInUser + '! Acessando conteúdo...');
                // Lógica para acessar o conteúdo completo aqui
            }
        });
    });

    // Verifica o status de login ao carregar a página
    checkLoginStatus();
});
