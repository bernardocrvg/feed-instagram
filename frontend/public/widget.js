let allPosts = [];
let currentPage = 1;
const postsPerPage = 6; // Você pode alterar quantos posts quer por página no feed completo

async function loadPosts() {
    try {
        // Busca o JSON que o GitHub Actions/Python gerou
        const response = await fetch('posts.json');
        allPosts = await response.json();
        
        renderLatestPosts();
        renderPaginatedFeed();
    } catch (error) {
        console.error("Erro ao carregar os posts:", error);
        document.getElementById('widget-latest').innerHTML = "<p>Nenhum post encontrado ou erro ao carregar.</p>";
    }
}

function createPostHTML(post) {
    // Monta o bloquinho visual de cada postagem
    // Se a legenda for muito grande, cortamos em 100 caracteres
    const shortCaption = post.caption.length > 100 ? post.caption.substring(0, 100) + "..." : post.caption;
    
    return `
        <div class="post-card">
            <a href="${post.permalink}" target="_blank">
                <img src="${post.media_url}" alt="Post">
            </a>
            <p class="caption">${shortCaption}</p>
        </div>
    `;
}

function renderLatestPosts() {
    const container = document.getElementById('widget-latest');
    // Pega apenas do índice 0 ao 5
    const latestPosts = allPosts.slice(0, 5);
    container.innerHTML = latestPosts.map(createPostHTML).join('');
}

function renderPaginatedFeed() {
    const container = document.getElementById('widget-feed');
    
    // Matemática da paginação
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = allPosts.slice(startIndex, endIndex);
    
    container.innerHTML = currentPosts.map(createPostHTML).join('');
    
    // Atualiza os botões (desabilita se não tiver para onde ir)
    document.getElementById('page-info').innerText = `Página ${currentPage}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = endIndex >= allPosts.length;
}

// Eventos de clique nos botões
document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedFeed();
    }
});

document.getElementById('btn-next').addEventListener('click', () => {
    if ((currentPage * postsPerPage) < allPosts.length) {
        currentPage++;
        renderPaginatedFeed();
    }
});

// Dá a partida!
loadPosts();