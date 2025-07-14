// app.js - Versão Final Corrigida
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUsername = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    if (!loggedInUsername) {
        window.location.href = 'login.html';
        return;
    }

    const navbar = document.getElementById('navbar');
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    const currentUsernameElem = document.getElementById('currentUsername');
    const logoutButton = document.getElementById('logoutButton');
    const adminLink = document.querySelector('a[href="admin.html"]');

    // Elementos do Modal
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const openContaBtn = document.getElementById('openContaModal');
    const openAjudaBtn = document.getElementById('openAjudaModal');

    // Atualiza UI
    if (currentUsernameElem) {
        currentUsernameElem.textContent = loggedInUsername;
    }
    if (adminLink && userRole !== 'admin') {
        adminLink.style.display = 'none';
    }

    // Efeito de scroll
    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('bg-stone-900', window.scrollY > 50);
        }
    });

    // Dropdown de Perfil
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

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        });
    }

    // Lógica do Modal
    function openModal(title, body) {
        if (modalOverlay) {
            modalTitle.textContent = title;
            modalBody.innerHTML = body;
            modalOverlay.classList.add('is-visible');
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('is-visible');
        }
    }

    if(openContaBtn) {
        openContaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('Gerenciar Conta', `<p>Olá, <strong>${loggedInUsername}</strong>. Esta função será implementada no futuro.</p>`);
        });
    }

    if(openAjudaBtn) { // Este botão não estava no seu HTML final, mas a lógica está aqui caso adicione.
        openAjudaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('Central de Ajuda', '<p>Para obter ajuda, entre em contato com o suporte.</p>');
        });
    }

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
});