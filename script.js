// variáveis
let posts = [];
let deleteId = null;

// quando a página carregar
window.onload = function() {
    carregarPosts();
    
    // eventos dos botões
    document.getElementById('postForm').onsubmit = criarPost;
    document.getElementById('applyFilters').onclick = aplicarFiltros;
    document.getElementById('clearFilters').onclick = limparFiltros;
    document.getElementById('refreshBtn').onclick = carregarPosts;
    document.getElementById('exportBtn').onclick = exportarDados;
    document.getElementById('confirmDeleteBtn').onclick = confirmarDelete;
    
    // filtros em tempo real
    document.getElementById('filterAuthor').oninput = aplicarFiltros;
    document.getElementById('filterDate').onchange = aplicarFiltros;
    document.getElementById('filterTime').onchange = aplicarFiltros;
};

// funções principais
function carregarPosts() {
    fetch('http://localhost:3000/api/posts')
    .then(response => response.json())
    .then(data => {
        posts = data;
        mostrarPosts(posts);
        atualizarContador(posts.length);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao carregar posts');
    });
}

function criarPost(event) {
    event.preventDefault();
    
    const autor = document.getElementById('author').value;
    const assunto = document.getElementById('subject').value;
    const mensagem = document.getElementById('message').value;
    
    // validação simples
    if (!autor || !assunto || !mensagem) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const dadosPost = {
        author: autor,
        subject: assunto,
        message: mensagem
    };
    
    fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPost)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('postForm').reset();
        carregarPosts();
        alert('Post criado com sucesso!');
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao criar post');
    });
}

function curtirPost(id) {
    fetch(`http://localhost:3000/api/posts/${id}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        carregarPosts();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao curtir post');
    });
}

function prepararDelete(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    deleteId = id;
    
    document.getElementById('postPreview').innerHTML = `
        <strong>Autor:</strong> ${post.author}<br>
        <strong>Assunto:</strong> ${post.subject}<br>
        <strong>Mensagem:</strong> ${post.message}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

function confirmarDelete() {
    if (!deleteId) return;
    
    fetch(`http://localhost:3000/api/posts/${deleteId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        deleteId = null;
        carregarPosts();
        alert('Post excluído com sucesso!');
        
        // fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao excluir post');
    });
}

function aplicarFiltros() {
    const filtroAutor = document.getElementById('filterAuthor').value.toLowerCase();
    const filtroData = document.getElementById('filterDate').value;
    const filtroHora = document.getElementById('filterTime').value;
    
    let postsFiltrados = posts;
    
    if (filtroAutor) {
        postsFiltrados = postsFiltrados.filter(post => 
            post.author.toLowerCase().includes(filtroAutor)
        );
    }
    
    if (filtroData) {
        postsFiltrados = postsFiltrados.filter(post => {
            const dataPost = post.createdAt.split('T')[0];
            return dataPost === filtroData;
        });
    }
    
    if (filtroHora) {
        postsFiltrados = postsFiltrados.filter(post => {
            const horaPost = post.createdAt.split('T')[1].slice(0, 5);
            return horaPost === filtroHora;
        });
    }
    
    mostrarPosts(postsFiltrados);
    atualizarContador(postsFiltrados.length);
}

function limparFiltros() {
    document.getElementById('filterAuthor').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterTime').value = '';
    
    mostrarPosts(posts);
    atualizarContador(posts.length);
}

function exportarDados() {
    fetch('http://localhost:3000/api/export')
    .then(response => response.json())
    .then(data => {
        const texto = JSON.stringify(data, null, 2);
        const arquivo = new Blob([texto], { type: 'application/json' });
        const url = URL.createObjectURL(arquivo);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'posts.json';
        link.click();
        
        URL.revokeObjectURL(url);
        alert('Dados exportados!');
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao exportar dados');
    });
}

// funções de interface
function mostrarPosts(listaPosts) {
    const container = document.getElementById('postsContainer');
    
    if (!listaPosts || listaPosts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <h5>Nenhuma postagem encontrada</h5>
                <p>Seja o primeiro a postar algo!</p>
            </div>
        `;
        return;
    }
    
    // ordenar por data
    listaPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let html = '';
    for (let i = 0; i < listaPosts.length; i++) {
        html += criarHtmlPost(listaPosts[i]);
    }
    
    container.innerHTML = html;
}

function criarHtmlPost(post) {
    return `
        <div class="post-item">
            <div class="post-header">
                <span class="author-badge">${post.author}</span>
                <span class="datetime-badge">${formatarData(post.createdAt)}</span>
            </div>
            
            <div class="post-subject">
                <strong>${post.subject}</strong>
            </div>
            
            <div class="post-message">
                ${post.message}
            </div>
            
            <div class="post-actions">
                <button class="btn btn-sm ${post.liked ? 'btn-danger' : 'btn-outline-danger'}" 
                        onclick="curtirPost(${post.id})">
                    ${post.liked ? 'Curtido' : 'Curtir'}
                </button>
                
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="prepararDelete(${post.id})">
                    Excluir
                </button>
                
                <small class="text-muted">ID: #${post.id}</small>
            </div>
        </div>
    `;
}

function atualizarContador(total) {
    document.getElementById('postCount').textContent = total;
}

// funções auxiliares
function formatarData(data) {
    const date = new Date(data);
    return date.toLocaleString('pt-BR');
}
