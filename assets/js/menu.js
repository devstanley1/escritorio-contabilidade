document.addEventListener('DOMContentLoaded', () => {
    // === 1. TEMA CLARO/ESCURO ===
    const themeBtn = document.getElementById('themeToggleBtn');

    // Verifica a preferência salva ou usa 'light' como padrão
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeBtn) themeBtn.innerHTML = '<i class="ph ph-sun"></i>';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let theme = document.body.getAttribute('data-theme');
            if (theme === 'dark') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i class="ph ph-moon"></i>';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i class="ph ph-sun"></i>';
            }
        });
    }

    // === 2. MENU MOBILE ===
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    let overlay = document.getElementById('sidebarOverlay');

    // Cria overlay caso não exista no HTML
    if (!overlay && sidebar) {
        overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        if (sidebar) sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }

    // === 3. NAVEGAÇÃO DE ABAS (TABS & MENU) ===
    const tabBtns = document.querySelectorAll('.tab-btn, .menu-item[data-target]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return; // ignora botões sem alvo (como o botão de sair)

            // Fecha menu mobile após clique num item
            if (window.innerWidth <= 768 && btn.classList.contains('menu-item') && sidebar) {
                sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }

            // Esconde todos os conteúdos correspondentes aos botões dessa navegação
            tabContents.forEach(c => c.classList.remove('active'));
            // Remove active dos botões (menu e tabs)
            tabBtns.forEach(b => b.classList.remove('active'));

            // Ativa o conteúdo respectivo
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Adiciona a classe active a todos os botões (sejam tabs ou menu items) que apontam pro mesmo target
            const linkedBtns = document.querySelectorAll(`[data-target="${targetId}"]`);
            linkedBtns.forEach(lBtn => lBtn.classList.add('active'));
        });
    });
});
