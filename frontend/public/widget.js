let allPosts = [];
let currentPage = 1;
const postsPerPage = 10; // Exibe 10 posts para formar 2 linhas perfeitas de 5

async function loadPosts() {
    try {
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
    // Estrutura idêntica ao FeedPreview.jsx (Overlay, Hover, Zoom)
    return `
        <a href="${post.permalink}" target="_blank" rel="noopener noreferrer" class="post-card group">
            <img src="${post.media_url}" alt="Post do Instagram" class="post-image">
            <div class="post-overlay">
                <p class="post-caption">${post.caption}</p>
            </div>
        </a>
    `;
}

function renderLatestPosts() {
    const container = document.getElementById('widget-latest');
    const latestPosts = allPosts.slice(0, 5); // Exatamente 5 posts
    container.innerHTML = latestPosts.map(createPostHTML).join('');
}

function renderPaginatedFeed() {
    const container = document.getElementById('widget-feed');
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = allPosts.slice(startIndex, endIndex);
    
    container.innerHTML = currentPosts.map(createPostHTML).join('');
    
    const totalPages = Math.ceil(allPosts.length / postsPerPage) || 1;
    
    document.getElementById('page-info').innerText = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
}

document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedFeed();
    }
});

document.getElementById('btn-next').addEventListener('click', () => {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPaginatedFeed();
    }
});

loadPosts();
