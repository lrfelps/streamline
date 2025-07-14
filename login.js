document.addEventListener('DOMContentLoaded', async () => {
    // Se o usuário já está logado, redireciona para a página principal
    if (localStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
        return;
    }

    const db = new PouchDB('brainwashing');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const openRegisterFromLoginButton = document.getElementById('openRegisterFromLogin');
    const openLoginFromRegisterButton = document.getElementById('openLoginFromRegister');
    const isAdminToggle = document.getElementById('isAdminToggle');
    const adminSecretPasswordGroup = document.querySelector('.admin-secret-password-group');
    const adminSecretPasswordInput = document.getElementById('adminSecretPassword');

    //troca login pra cad
    if (openRegisterFromLoginButton && openLoginFromRegisterButton) {
        openRegisterFromLoginButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginFormContainer').style.display = 'none';
            document.getElementById('registerFormContainer').style.display = 'block';
        });
        openLoginFromRegisterButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginFormContainer').style.display = 'block';
            document.getElementById('registerFormContainer').style.display = 'none';
        });
    }

    //esconde senha
    if (isAdminToggle && adminSecretPasswordGroup) {
        isAdminToggle.addEventListener('change', function () {
            adminSecretPasswordGroup.classList.toggle('is-visible', this.checked);
            adminSecretPasswordInput.required = this.checked;
        });
    }

    //logica login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const result = await db.find({ selector: { username: username }, limit: 1 });
                if (result.docs.length > 0) {
                    const user = result.docs[0];
                    if (user.password === password) {
                        localStorage.setItem('loggedInUser', user.username);
                        localStorage.setItem('userRole', user.role || 'user');
                        window.location.href = 'index.html';
                    } else {
                        alert('Senha incorreta.');
                    }
                } else {
                    alert('Usuário não encontrado.');
                }
            } catch (err) {
                console.error('Erro ao fazer login:', err);
                alert('Ocorreu um erro no login.');
            }
        });
    }

    // Lógica de Cadastro Completa
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value.trim();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const isAdmin = isAdminToggle.checked;
            const adminSecret = adminSecretPasswordInput.value;

            // Validações
            if (!email || !username || !password) { return alert('Por favor, preencha os campos obrigatórios.'); }
            if (password !== confirmPassword) { return alert('As senhas não coincidem.'); }
            if (password.length < 6) { return alert('A senha deve ter no mínimo 6 caracteres.'); }

            let userRole = 'user';
            if (isAdmin) {
                if (adminSecret !== "calabresinhafrita") {
                    return alert('Senha secreta de administrador incorreta!');
                }
                userRole = 'admin';
            }

            try {
                const existingUser = await db.find({ selector: { $or: [{ username: username }, { email: email }] } });
                if (existingUser.docs.length > 0) {
                    return alert('Nome de usuário ou e-mail já cadastrado.');
                }

                const newUser = {
                    _id: `usuario_${new Date().getTime()}`,
                    username, email, password, role: userRole, createdAt: new Date().toISOString()
                };

                await db.put(newUser);
                alert(`Usuário '${username}' cadastrado com sucesso!`);
                registerForm.reset();
                adminSecretPasswordGroup.classList.remove('is-visible');
                document.getElementById('loginFormContainer').style.display = 'block';
                document.getElementById('registerFormContainer').style.display = 'none';
            } catch (err) {
                console.error('Erro ao cadastrar usuário:', err);
                alert('Ocorreu um erro durante o cadastro.');
            }
        });
    }

    // Inicializa Índices do Banco
    try {
        await db.createIndex({ index: { fields: ['username'] } });
        await db.createIndex({ index: { fields: ['email'] } });
    } catch (err) {
        if (err.name !== 'conflict') console.error("Erro ao criar índice:", err);
    }
});