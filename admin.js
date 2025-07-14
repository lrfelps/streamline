// admin.js - Lógica para o Painel de Administração

document.addEventListener('DOMContentLoaded', () => {
    // Proteção de Rota e Permissão
    const loggedInUsername = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    if (!loggedInUsername || userRole !== 'admin') {
        alert('Acesso negado. Você precisa ser um administrador para ver esta página.');
        window.location.href = 'index.html'; // Redireciona para a home
        return;
    }

    const db = new PouchDB('brainwashing');
    const userListDiv = document.getElementById('userList');

    // Função para buscar e exibir usuários
    async function displayUsers() {
        if (!userListDiv) return;

        try {
            const result = await db.find({
                selector: { _id: { $regex: '^usuario_' } }
            });

            if (result.docs.length === 0) {
                userListDiv.innerHTML = '<p style="text-align: center;">Nenhum usuário encontrado.</p>';
                return;
            }

            // Limpa a lista antes de adicionar os itens
            userListDiv.innerHTML = '';

            result.docs.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'list-item';
                userItem.innerHTML = `
                    <div class="list-item-info">
                        <p>${user.username} (${user.email})</p>
                        <span>Papel: <strong class="status active">${user.role}</strong></span>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-danger" data-id="${user._id}">Excluir</button>
                    </div>
                `;
                userListDiv.appendChild(userItem);
            });

        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            userListDiv.innerHTML = '<p style="text-align: center; color: var(--color-error);">Erro ao carregar usuários.</p>';
        }
    }

    // Inicializa a exibição de usuários
    displayUsers();

    // Adicione aqui a lógica para cadastrar filmes e para os botões de excluir.
});