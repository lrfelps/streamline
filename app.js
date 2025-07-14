document.addEventListener('DOMContentLoaded', async () => {
    //protecao
    const loggedInUsername = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    if (!loggedInUsername) {
        window.location.href = 'login.html';
        return;
    }

    const db = new PouchDB('brainwashing');
    let currentUserDoc = null;

    //busca no dom
    const navbar = document.getElementById('navbar');
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    const currentUsernameElem = document.getElementById('currentUsername');
    const logoutButton = document.getElementById('logoutButton');
    const adminLink = document.querySelector('a[href="admin.html"]');
    const userAvatar = document.getElementById('user-avatar');
    const navbarCategoriesGrid = document.getElementById('navbar-categories-grid');

    //modals
    const accountModal = document.getElementById('accountModal');
    const closeAccountBtn = document.getElementById('closeAccountBtn');
    const modalBody = document.getElementById('modalBody');
    const openContaBtn = document.getElementById('openContaModal');

    const iconModal = document.getElementById('iconModal');
    const closeIconBtn = document.getElementById('closeIconBtn');
    const iconGrid = document.getElementById('icon-grid');
    const saveIconBtn = document.getElementById('saveIconBtn');
    let selectedIconClass = '';

    const trailerModal = document.getElementById('trailerModal');
    const closeTrailerBtn = document.getElementById('closeTrailerBtn');
    const playerContainer = document.getElementById('youtube-player-container');

    //funcoes
    async function fetchCurrentUser() {
        try {
            const result = await db.find({ selector: { username: loggedInUsername } });
            if (result.docs.length > 0) {
                currentUserDoc = result.docs[0];
                updateUserAvatar(currentUserDoc.profileIcon);
            }
        } catch (e) { console.error("Erro ao buscar dados do usuário", e); }
    }
    
    function updateUserAvatar(iconClass) {
        if (userAvatar) {
            userAvatar.innerHTML = `<i class="${iconClass || 'fa-solid fa-user'}"></i>`;
        }
    }


    async function fetchAndDisplayMovies() {
        const popularGrid = document.getElementById('popular-grid');
        const recentGrid = document.getElementById('recent-grid');
        if (!popularGrid || !recentGrid) return;

        try {
            const result = await db.find({ selector: { type: 'movie' } });
            const movies = result.docs;

            popularGrid.innerHTML = '';
            recentGrid.innerHTML = '';

            movies.forEach(movie => createMovieCard(movie, popularGrid));

            [...movies].sort((a, b) => b._id.localeCompare(a._id)).slice(0, 6).forEach(movie => createMovieCard(movie, recentGrid));
            
        } catch (e) { console.error("Erro ao exibir filmes", e); }
    }

    //traz bg do filme
    function createMovieCard(movie, gridElement) {
        const movieCard = document.createElement('div');
        movieCard.className = 'bg-stone-800 rounded-lg overflow-hidden group cursor-pointer';
        movieCard.dataset.trailerId = movie.trailerId;

        movieCard.innerHTML = `
            <div class="relative aspect-[2/3]">
                <img src="${movie.posterUrl}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-white"><path d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 002.25 1.3l11.38-6.75a1.5 1.5 0 000-2.6L8.25 3.95A1.5 1.5 0 007.5 3.75z" /></svg>
                    </div>
                </div>
            </div>`;
        gridElement.appendChild(movieCard);
    }
    
    async function displayNavbarCategories() {
        if (!navbarCategoriesGrid) return;
        try {
            const result = await db.find({
                selector: { type: 'movie' },
                fields: ['category']
            });
            const uniqueCategories = [...new Set(result.docs.map(doc => doc.category).filter(Boolean))];
            
            navbarCategoriesGrid.innerHTML = '';
            uniqueCategories.forEach(category => {
                const categoryLink = document.createElement('a');
                categoryLink.href = `#`;
                categoryLink.className = 'text-white hover:text-purple-400';
                categoryLink.textContent = category;
                navbarCategoriesGrid.appendChild(categoryLink);
            });
        } catch(e) {
            console.error("Erro ao exibir categorias na navbar", e);
        }
    }
    
    // Funções dos Modais
    function openTrailerModal(videoId) {
        playerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        trailerModal.classList.add('is-visible');
    }

    function closeTrailerModal() {
        trailerModal.classList.remove('is-visible');
        playerContainer.innerHTML = ''; 
    }

    function openAccountModal() {
        modalBody.innerHTML = `
            <div class="flex flex-col items-center text-center">
                <div class="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-white text-5xl mb-4">
                    ${userAvatar.innerHTML}
                </div>
                <button id="changeAvatarBtn" class="bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-lg">Alterar Avatar</button>
            </div>`;
        accountModal.classList.add('is-visible');
        
        document.getElementById('changeAvatarBtn').addEventListener('click', () => {
            accountModal.classList.remove('is-visible');
            openIconModal();
        });
    }


    //icons perfil
    function openIconModal() {
        const icons = ["fa-user-astronaut", "fa-user-secret", "fa-user-ninja", "fa-user-tie", "fa-user-graduate", "fa-user-doctor", "fa-cat", "fa-dog", "fa-dragon", "fa-hippo", "fa-otter", "fa-ghost"];
        iconGrid.innerHTML = '';
        icons.forEach(iconClass => {
            iconGrid.innerHTML += `<div class="icon-option" data-icon="fa-solid ${iconClass}"><i class="fa-solid ${iconClass}"></i></div>`;
        });
        iconModal.classList.add('is-visible');
    }

    //logica para mostrar botao administrador
    currentUsernameElem.textContent = loggedInUsername;
    if (userRole !== 'admin') adminLink.style.display = 'none';

    window.addEventListener('scroll', () => navbar.classList.toggle('bg-stone-900', window.scrollY > 50));
    
    profileButton.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('hidden'); });
    window.addEventListener('click', () => profileDropdown.classList.add('hidden'));
    logoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    //listeners do modals do profile button
    openContaBtn.addEventListener('click', (e) => { e.preventDefault(); openAccountModal(); });
    closeAccountBtn.addEventListener('click', () => accountModal.classList.remove('is-visible'));

    closeIconBtn.addEventListener('click', () => iconModal.classList.remove('is-visible'));
    iconGrid.addEventListener('click', (e) => {
        const targetIcon = e.target.closest('.icon-option');
        if (targetIcon) {
            document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
            targetIcon.classList.add('selected');
            selectedIconClass = targetIcon.dataset.icon;
        }
    });
    saveIconBtn.addEventListener('click', async () => {
        if (selectedIconClass && currentUserDoc) {
            currentUserDoc.profileIcon = selectedIconClass;
            try {
                await db.put(currentUserDoc);
                updateUserAvatar(selectedIconClass);
                iconModal.classList.remove('is-visible');
            } catch (e) { alert("Erro ao salvar o avatar."); }
        }
    });
    
    //modal do trailer
    closeTrailerBtn.addEventListener('click', closeTrailerModal);
    trailerModal.addEventListener('click', (e) => { if (e.target === trailerModal) closeTrailerModal(); });
    document.getElementById('popular-grid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-trailer-id]');
        if(card) openTrailerModal(card.dataset.trailerId);
    });
    document.getElementById('recent-grid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-trailer-id]');
        if(card) openTrailerModal(card.dataset.trailerId);
    });

    //traz dados iniciais
    await fetchCurrentUser();
    await fetchAndDisplayMovies();
    await displayNavbarCategories();
});