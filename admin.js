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
    
    // Referências
    const userListDiv = document.getElementById('userList');
    const addMovieForm = document.getElementById('addMovieForm');
    const movieListDiv = document.getElementById('movieList');

    // Função para extrair ID do YouTube
    function getYouTubeVideoId(url) {
        let videoId = null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'https://www.youtube.com/embed/W0LHT__gW3Y?autoplay=1&mute=1&loop=1&playlist=W0LHT__gW3Y&controls=0&showinfo=0&autohide=1&modestbranding=10') {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.hostname.includes('https://www.youtube.com/embed/W0LHT__gW3Y?autoplay=1&mute=1&loop=1&playlist=W0LHT__gW3Y&controls=0&showinfo=0&autohide=1&modestbranding=11')) {
                videoId = urlObj.searchParams.get('v');
            }
        } catch (e) { return null; }
        return videoId;
    }

    // LÓGICA DE USUÁRIOS
    async function displayUsers() {
        if (!userListDiv) return;
        const result = await db.find({ selector: { _id: { $regex: '^usuario_' } } });
        userListDiv.innerHTML = '';
        result.docs.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'list-item';
            userItem.innerHTML = `
                <div class="list-item-info"><p>${user.username} (${user.email})</p><span>Cargo: <strong class="status active">${user.role}</strong></span></div>
                <div class="list-item-actions"><button class="btn-danger" data-id="${user._id}">Excluir</button></div>
            `;
            userListDiv.appendChild(userItem);
        });
    }

    // LÓGICA DE FILMES
    async function displayMovies() {
        if (!movieListDiv) return;
        const result = await db.find({ selector: { type: 'movie' } });
        movieListDiv.innerHTML = '';
        result.docs.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'list-item';
            movieItem.innerHTML = `
                <div class="list-item-info"><p>${movie.title} (${movie.year})</p></div>
                <div class="list-item-actions"><button class="btn-danger" data-id="${movie._id}">Excluir</button></div>
            `;
            movieListDiv.appendChild(movieItem);
        });
    }

    // Evento: Adicionar Filme
    if (addMovieForm) {
        addMovieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const trailerUrl = document.getElementById('movieTrailer').value.trim();
            const trailerId = getYouTubeVideoId(trailerUrl);
            if (!trailerId) 
            return alert('URL do trailer do YouTube inválida.');

            const newMovie = {
                _id: `filme_${new Date().getTime()}`,
                type: 'movie',
                title: document.getElementById('movieTitle').value.trim(),
                year: document.getElementById('movieYear').value,
                genre: document.getElementById('movieGenre').value.trim(),
                posterUrl: document.getElementById('moviePoster').value.trim(),
                trailerId
            };
            await db.put(newMovie);
            alert('Filme cadastrado!');
            addMovieForm.reset();
            await displayMovies();
        });
    }

    // Evento: Excluir (Delegação)
    document.body.addEventListener('click', async (event) => {
        if (event.target && event.target.classList.contains('btn-danger')) {
            const docId = event.target.dataset.id;
            if (!docId) return;

            const isConfirmed = window.confirm('Tem certeza que deseja excluir este item?');
            if (isConfirmed) {
                try {
                    const doc = await db.get(docId);
                    await db.remove(doc);
                    alert('Item excluído com sucesso!');
                    // Atualiza a lista correspondente
                    if (docId.startsWith('usuario_')) await displayUsers();
                    if (docId.startsWith('filme_')) await displayMovies();
                } catch (err) {
                    console.error('Erro ao excluir:', err);
                    alert('Não foi possível excluir o item.');
                }
            }
        }
    });

    // Inicialização
    await displayUsers();
    await displayMovies();
});