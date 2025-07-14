const db = new PouchDB('brainwashing');

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');


    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-stone-900', 'shadow-lg');
        } else {
            navbar.classList.remove('bg-stone-900', 'shadow-lg');
        }
    });

    //perfil
    if (profileButton) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique feche o menu imediatamente
            profileDropdown.classList.toggle('hidden');
        });
    }

    // Fechar o dropdown se clicar fora dele
    window.addEventListener('click', (event) => {
        if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
            if (!profileButton.contains(event.target)) {
                profileDropdown.classList.add('hidden');
            }
        }
    });
});