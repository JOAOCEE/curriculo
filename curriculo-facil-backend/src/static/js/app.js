// Aplicativo principal do gerador de currículos
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do aplicativo
    console.log('Gerador de Currículos - Inicializado');
    
    // Configuração de eventos para botões principais
    setupEventListeners();
});

// Configuração de listeners de eventos
function setupEventListeners() {
    // Botões de criação de currículo na página inicial
    const createButtons = document.querySelectorAll('a[href="#"][contains(text(), "Criar Currículo")]');
    createButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirecionar para o editor de currículo
            window.location.href = 'editor.html';
        });
    });
    
    // Navegação suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Não processar links vazios ou que são apenas "#"
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}
