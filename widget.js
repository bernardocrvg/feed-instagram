(async function() {
    // Procura a div onde o feed deve ser injetado
    const feedContainer = document.getElementById('instawix-feed');
    if (!feedContainer) return;

    // Lê as configurações definidas no HTML gerado
    const type = feedContainer.getAttribute('data-type') || 'fixed';
    const limit = parseInt(feedContainer.getAttribute('data-limit')) || 5;
    const perPage = parseInt(feedContainer.getAttribute('data-per-page')) || 12;

    let allPosts = [];
    let currentPage = 1;

    // Descobre dinamicamente a URL base do seu GitHub Pages para buscar o JSON
    const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
    const baseUrl = scriptTag ? scriptTag.src.replace('/widget.js', '') : '.';

    try {
        const res = await fetch(`${baseUrl}/posts.json`);
        allPosts = await res.json();
    } catch (e) {
        feedContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Erro ao carregar posts.</p>';
        return;
    }

    function render() {
        let postsToRender = [];
        let totalPages = 1;

        // Lógica de fatiamento idêntica ao FeedPreview.jsx
        if (type === 'fixed' || type === 'custom') {
            postsToRender = allPosts.slice(0, limit);
        } else if (type === 'paginated') {
            totalPages = Math.ceil(allPosts.length / perPage) || 1;
            const start = (currentPage - 1) * perPage;
            postsToRender = allPosts.slice(start, start + perPage);
        }

        // Monta o HTML interno
        let html = postsToRender.map(post => `
            <a href="${post.permalink}" target="_blank" rel="noopener noreferrer" class="instawix-post">
                <img src="${post.media_url}" alt="Post">
                <div class="instawix-overlay">
                    <p class="instawix-caption">${post.caption || ''}</p>
                </div>
            </a>
        `).join('');

        // Adiciona a paginação se necessário
        if (type === 'paginated' && totalPages > 1) {
            html += `
                <div class="instawix-nav">
                    <button class="instawix-btn instawix-prev" ${currentPage === 1 ? 'disabled' : ''} onclick="window.instawixChangePage(-1)">&lt; Anterior</button>
                    <span class="instawix-info">Página ${currentPage} de ${totalPages}</span>
                    <button class="instawix-btn instawix-next" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.instawixChangePage(1)">Próximo &gt;</button>
                </div>
            `;
        }

        feedContainer.innerHTML = html;
    }

    // Função global para os botões de paginação funcionarem no site externo
    window.instawixChangePage = function(dir) {
        currentPage += dir;
        render();
    };

    render(); // Dá a partida inicial
})();