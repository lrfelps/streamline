document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    // 1. SELEÇÃO DE ELEMENTOS DO DOM
    // ===================================
    // Navbar
    const navbar = document.getElementById('navbar');
    
    // Dropdown de Perfil
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    const currentUsername = document.getElementById('currentUsername');
    const logoutButton = document.getElementById('logoutButton');
    
    // Modal
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const openContaBtn = document.getElementById('openContaModal');
    const openAjudaBtn = document.getElementById('openAjudaModal');


    // ===================================
    // 2. DADOS E ESTADO DA APLICAÇÃO
    // ===================================
    // Simulação de um usuário logado
    const loggedInUser = {
        name: 'Usuário' // Em um app real, isso viria do login
    };

    if (currentUsername && loggedInUser) {
        currentUsername.textContent = loggedInUser.name;
    }


    // ===================================
    // 3. LÓGICA DA NAVBAR (EFEITO DE SCROLL)
    // ===================================
    window.addEventListener('scroll', () => {
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('bg-stone-900', 'shadow-lg');
        } else if (navbar) {
            navbar.classList.remove('bg-stone-900', 'shadow-lg');
        }
    });


    // ===================================
    // 4. LÓGICA DO DROPDOWN DE PERFIL
    // ===================================
    if (profileButton && profileDropdown) {
        // Abrir/Fechar ao clicar no botão
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        // Fechar ao clicar fora
        window.addEventListener('click', (event) => {
            if (!profileDropdown.classList.contains('hidden')) {
                if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
                    profileDropdown.classList.add('hidden');
                }
            }
        });
    }


    // ===================================
    // 5. LÓGICA DO MODAL
    // ===================================
    const modalContent = {
        conta: {
            title: 'Gerenciar Conta',
            body: `
                <p>Aqui você pode alterar suas informações de perfil, como nome, e-mail e senha.</p>
                <div class="form-spacing" style="margin-top: var(--spacing-6);">
                    <div class="input-group">
                        <label for="userName">Nome</label>
                        <input type="text" id="userName" class="form-input" value="${loggedInUser.name}">
                    </div>
                    <div class="input-group">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" class="form-input" value="seu-email@exemplo.com">
                    </div>
                    <button class="btn-primary" style="margin-top: var(--spacing-4);">Salvar Alterações</button>
                </div>
            `
        },
        ajuda: {
            title: 'Central de Ajuda',
            body: `
                <p>Bem-vindo à nossa central de ajuda. Se você estiver com problemas, verifique as perguntas frequentes abaixo ou entre em contato com o suporte.</p>
                <h4 style="color: var(--color-text-label); margin-top: var(--spacing-4);">Como altero minha senha?</h4>
                <p>Você pode alterar sua senha na seção 'Gerenciar Conta'.</p>
                <h4 style="color: var(--color-text-label); margin-top: var(--spacing-4);">Contato do Suporte</h4>
                <p>Email: suporte@seusite.com</p>
            `
        }
    };

    function openModal(type) {
        const content = modalContent[type];
        if (content && modalOverlay) {
            modalTitle.textContent = content.title;
            modalBody.innerHTML = content.body;
            modalOverlay.classList.add('is-visible');
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('is-visible');
        }
    }

    // Eventos para ABRIR o modal
    if (openContaBtn) {
        openContaBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (profileDropdown) profileDropdown.classList.add('hidden');
            openModal('conta');
        });
    }

    if (openAjudaBtn) {
        openAjudaBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (profileDropdown) profileDropdown.classList.add('hidden');
            openModal('ajuda');
        });
    }

    // Eventos para FECHAR o modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
            closeModal();
        }
    });


    // ===================================
    // 6. LÓGICA DE LOGOUT
    // ===================================
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            window.location.href = 'index.html'; 
        });
    }

});