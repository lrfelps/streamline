// admin.js - Versão Final
document.addEventListener('DOMContentLoaded', async () => {
    // Proteção de Rota e Permissão
    const loggedInUsername = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    if (!loggedInUsername || userRole !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador para ver esta página.');
        window.location.href = 'index.html';
        return;
    }

    const db = new PouchDB('brainwashing');
    
    // Referências do DOM
    const userListDiv = document.getElementById('userList');
    const addMovieForm = document.getElementById('addMovieForm');
    const movieListDiv = document.getElementById('movieList');
    const categoryList = document.getElementById('category-list');
    const editUrlModal = document.getElementById('editUrlModal');
    const editUrlForm = document.getElementById('editUrlForm');
    const closeModalBtn = editUrlModal.querySelector('.close-modal-btn');

    // Função para extrair ID do YouTube
    function getYouTubeVideoId(url) {
        let videoId = null;
        try {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                videoId = match[2];
            } else if (url.includes("googleusercontent.com/youtube.com/")) {
                const parts = url.split('/');
                videoId = parts[parts.length - 1];
            }
        } catch (e) { return null; }
        return videoId;
    }

    // LÓGICA DE USUÁRIOS
    async function displayUsers() {
        if (!userListDiv) return;
        try {
            const result = await db.find({ selector: { _id: { $regex: '^usuario_' } } });
            userListDiv.innerHTML = '';
            result.docs.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'list-item';
                userItem.innerHTML = `
                    <div class="list-item-info"><p>${user.username} (${user.email})</p><span>Cargo: <strong class="status active">${user.role}</strong></span></div>
                    <div class="list-item-actions"><button class="btn-danger btn-delete" data-id="${user._id}">Excluir</button></div>
                `;
                userListDiv.appendChild(userItem);
            });
        } catch (err) {
            console.error("Erro ao exibir usuários:", err);
            userListDiv.innerHTML = `<p class="text-center text-red-500">Não foi possível carregar os usuários.</p>`;
        }
    }

    // LÓGICA DE FILMES
    async function displayMovies() {
        if (!movieListDiv) return;
        try {
            const result = await db.find({ selector: { type: 'movie' } });
            movieListDiv.innerHTML = '';
            result.docs.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.className = 'list-item';
                movieItem.innerHTML = `
                    <div class="list-item-info"><p>${movie.title} (${movie.year})</p></div>
                    <div class="list-item-actions">
                        <button class="btn-warning btn-edit-url" data-id="${movie._id}">Editar URL</button>
                        <button class="btn-danger btn-delete" data-id="${movie._id}">Excluir</button>
                    </div>
                `;
                movieListDiv.appendChild(movieItem);
            });
        } catch (err) {
            console.error("Erro ao exibir filmes:", err);
        }
    }

    // LÓGICA DE CATEGORIAS
    async function populateCategoryDatalist() {
        if (!categoryList) return;
        const result = await db.find({ selector: { type: 'movie' }, fields: ['category'] });
        const uniqueCategories = [...new Set(result.docs.map(doc => doc.category).filter(Boolean))];
        
        categoryList.innerHTML = '';
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            categoryList.appendChild(option);
        });
    }

    // Lógica do Modal de Edição
    async function openEditModal(movieId) {
        try {
            const movieDoc = await db.get(movieId);
            document.getElementById('editMovieId').value = movieDoc._id;
            document.getElementById('editPosterUrl').value = movieDoc.posterUrl;
            document.getElementById('editTrailerUrl').value = movieDoc.trailerId ? `youtube.com/watch?v=${movieDoc.trailerId}` : '';
            editUrlModal.style.display = 'flex';
        } catch (err) {
            console.error("Erro ao abrir modal de edição:", err);
            alert("Não foi possível carregar os dados do filme para edição.");
        }
    }

    function closeEditModal() {
        editUrlModal.style.display = 'none';
    }

    if (editUrlForm) {
        editUrlForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const movieId = document.getElementById('editMovieId').value;
            const newPosterUrl = document.getElementById('editPosterUrl').value.trim();
            const newTrailerUrl = document.getElementById('editTrailerUrl').value.trim();
            const newTrailerId = getYouTubeVideoId(newTrailerUrl);

            if (!newTrailerId) {
                return alert("A nova URL do trailer do YouTube é inválida.");
            }
            
            try {
                const doc = await db.get(movieId);
                doc.posterUrl = newPosterUrl;
                doc.trailerId = newTrailerId;
                await db.put(doc);
                alert("URLs do filme atualizadas com sucesso!");
                closeEditModal();
            } catch (err) {
                console.error("Erro ao salvar alterações:", err);
                alert("Não foi possível salvar as alterações.");
            }
        });
    }

    // Evento: Adicionar Filme
    if (addMovieForm) {
        addMovieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const trailerUrl = document.getElementById('movieTrailer').value.trim();
            const trailerId = getYouTubeVideoId(trailerUrl);
            if (!trailerId) return alert('URL do trailer do YouTube inválida.');

            const newMovie = {
                _id: `filme_${new Date().getTime()}`,
                type: 'movie',
                title: document.getElementById('movieTitle').value.trim(),
                year: document.getElementById('movieYear').value,
                category: document.getElementById('movieCategory').value.trim(),
                posterUrl: document.getElementById('moviePoster').value.trim(),
                trailerId
            };
            await db.put(newMovie);
            alert('Filme cadastrado!');
            addMovieForm.reset();
            await displayMovies();
            await populateCategoryDatalist();
        });
    }

    // Evento de Delegação para botões de Excluir e Editar
    document.body.addEventListener('click', async (event) => {
        const target = event.target;
        const docId = target.dataset.id;

        if (!docId) return;

        // Ação de Excluir
        if (target.classList.contains('btn-delete')) {
            const isConfirmed = window.confirm('Tem certeza que deseja excluir este item?');
            if (isConfirmed) {
                try {
                    const doc = await db.get(docId);
                    await db.remove(doc);
                    alert('Item excluído com sucesso!');
                    if (docId.startsWith('usuario_')) await displayUsers();
                    if (docId.startsWith('filme_')) {
                        await displayMovies();
                        await populateCategoryDatalist();
                    }
                } catch (err) { console.error('Erro ao excluir:', err); }
            }
        }
        // Ação de Editar
        else if (target.classList.contains('btn-edit-url')) {
            openEditModal(docId);
        }
    });
    
    // Listeners para fechar o modal
    closeModalBtn.addEventListener('click', closeEditModal);
    editUrlModal.addEventListener('click', (e) => {
        if (e.target === editUrlModal) closeEditModal();
    });

    // Inicialização
    await displayUsers();
    await displayMovies();
    await populateCategoryDatalist();
});