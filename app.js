document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // 1. ROTA PROTEGIDA E DADOS DO USUÁRIO
    // ===================================
    const loggedInUsername = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    // Se não há usuário logado, redireciona para a página de login
    if (!loggedInUsername) {
        window.location.href = 'login.html';
        return; // Para a execução do script
    }

    // ===================================
    // 2. SELEÇÃO DE ELEMENTOS DO DOM
    // ===================================
    const navbar = document.getElementById('navbar');
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    const currentUsername = document.getElementById('currentUsername');
    const logoutButton = document.getElementById('logoutButton');
    const adminLink = document.querySelector('a[href="admin.html"]');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const openContaBtn = document.getElementById('openContaModal');
    const openAjudaBtn = document.getElementById('openAjudaModal');

    // ===================================
    // 3. ATUALIZAÇÃO DA INTERFACE
    // ===================================

    // Define o nome do usuário no dropdown
    if (currentUsername) {
        currentUsername.textContent = loggedInUsername;
    }

    // Esconde o link 'Administrador' se o usuário não for admin
    if (adminLink && userRole !== 'admin') {
        adminLink.style.display = 'none';
    }
    
    // ===================================
    // 4. EVENTOS E LÓGICA DA PÁGINA
    // ===================================

    // Efeito de scroll na Navbar
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('bg-stone-900', window.scrollY > 50);
            navbar.classList.toggle('shadow-lg', window.scrollY > 50);
        }
    });

    // Lógica do Dropdown de Perfil
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        window.addEventListener('click', () => {
            if (!profileDropdown.classList.contains('hidden')) {
                profileDropdown.classList.add('hidden');
            }
        });
    }
    
    // Conteúdo dinâmico para os modais
    const modalContent = {
        conta: {
            title: 'Gerenciar Conta',
            body: `<p>Olá, <strong>${loggedInUsername}</strong>! Aqui você poderá gerenciar suas informações no futuro.</p>`
        },
        ajuda: {
            title: 'Central de Ajuda',
            body: '<p>Bem-vindo à nossa Central de Ajuda. Para suporte, contate o administrador.</p>'
        }
    };

    // Funções e eventos do Modal
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

    if(openContaBtn) openContaBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('conta'); profileDropdown.classList.add('hidden'); });
    if(openAjudaBtn) openAjudaBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('ajuda'); profileDropdown.classList.add('hidden'); });
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });


    // Lógica de Logout (Corrigida)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Limpa os dados do usuário do armazenamento
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            
            // Redireciona para a página de login
            window.location.href = 'login.html';
        });
    }
});