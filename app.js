const db = new PouchDB('brainwashing');



document.addEventListener('userLoggedIn', (event) => {
    // Quando o auth.js diz que o usuário fez login
    console.log(`Evento userLoggedIn recebido para: ${event.detail.username}`);
    showMainAppContent(); // Mostra o app principal
});

document.addEventListener('userAlreadyLoggedIn', (event) => {
    // Quando o auth.js diz que o usuário já estava logado na inicialização
    console.log(`Evento userAlreadyLoggedIn recebido para: ${event.detail.username}`);
    showMainAppContent(); // Mostra o app principal
});