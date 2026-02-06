// variáveis globais
let posts = [];
let currentDeleteId = null;
let deleteModal = null;

// inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // inicializar modal
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // event listeners
    setupEventListeners();
    
    // carregar posts iniciais
    loadPosts();
    
    // auto-refresh a cada 30 segundos
    setInterval(loadPosts, 30000);
}

function setupEventListeners() {
    // formulário de nova postagem
    document.getElementById('postForm').addEventListener('submit', handleSubmitPost);
    
    // botões de filtro
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // botões de ação
    document.getElementById('refreshBtn').addEventListener('click', loadPosts);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    
    // filtros em tempo real
    document.getElementById('filterAuthor').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('filterDate').addEventListener('change', applyFilters);
    document.getElementById('filterTime').addEventListener('change', applyFilters);
}

// funções principais

async function loadPosts() {
    try {
        showLoading(true);
        const response = await fetch('http://localhost:3000/api/posts');
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        posts = await response.json();
        displayPosts(posts);
        updatePostCount(posts.length);
        showAlert('Posts carregados com sucesso!', 'success', 3000);
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        showAlert('Erro ao carregar posts: ' + error.message, 'danger');
        displayNoPosts();
    } finally {
        showLoading(false);
    }
}

async function handleSubmitPost(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const postData = {
        author: document.getElementById('author').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    // validação
    if (!postData.author || !postData.subject || !postData.message) {
        showAlert('Preencha todos os campos!', 'danger');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const newPost = await response.json();
        
        // limpar formulário
        document.getElementById('postForm').reset();
        
        // recarregar posts
        await loadPosts();
        
        showAlert('Postagem criada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao criar post:', error);
        showAlert('Erro ao criar postagem: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

async function toggleLike(postId) {
    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const updatedPost = await response.json();
        
        // atualizar post local
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex] = updatedPost;
            displayPosts(posts);
        }
        
        showAlert(`Post ${updatedPost.liked ? 'curtido' : 'descurtido'}!`, 'info', 2000);
        
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        showAlert('Erro ao curtir post: ' + error.message, 'danger');
    }
}

function prepareDelete(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    currentDeleteId = postId;
    
    // mostrar preview no modal
    document.getElementById('postPreview').innerHTML = `
        <strong>Autor:</strong> ${post.author}<br>
        <strong>Assunto:</strong> ${post.subject}<br>
        <strong>Mensagem:</strong> ${post.message}<br>
        <small class="text-muted">Postado em: ${formatDateTime(post.createdAt)}</small>
    `;
    
    deleteModal.show();
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    try {
        showLoading(true);
        const response = await fetch(`http://localhost:3000/api/posts/${currentDeleteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        deleteModal.hide();
        currentDeleteId = null;
        
        // recarregar posts
        await loadPosts();
        
        showAlert('Postagem excluída com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        showAlert('Erro ao excluir postagem: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

function applyFilters() {
    const filterAuthor = document.getElementById('filterAuthor').value.toLowerCase().trim();
    const filterDate = document.getElementById('filterDate').value;
    const filterTime = document.getElementById('filterTime').value;
    
    let filteredPosts = [...posts];
    
    // filtro por autor
    if (filterAuthor) {
        filteredPosts = filteredPosts.filter(post => 
            post.author.toLowerCase().includes(filterAuthor)
        );
    }
    
    // filtro por data
    if (filterDate) {
        filteredPosts = filteredPosts.filter(post => {
            const postDate = new Date(post.createdAt).toISOString().split('T')[0];
            return postDate === filterDate;
        });
    }
    
    // filtro por hora
    if (filterTime) {
        filteredPosts = filteredPosts.filter(post => {
            const postTime = new Date(post.createdAt).toTimeString().slice(0, 5);
            return postTime === filterTime;
        });
    }
    
    displayPosts(filteredPosts);
    updatePostCount(filteredPosts.length);
    
    if (filteredPosts.length !== posts.length) {
        showAlert(`Filtro aplicado: ${filteredPosts.length} de ${posts.length} posts`, 'info', 3000);
    }
}

function clearFilters() {
    document.getElementById('filterAuthor').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterTime').value = '';
    
    displayPosts(posts);
    updatePostCount(posts.length);
    
    showAlert('Filtros removidos', 'info', 2000);
}

async function exportData() {
    try {
        showLoading(true);
        const response = await fetch('http://localhost:3000/api/export');
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // criar arquivo para download
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `posts-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showAlert('Dados exportados com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showAlert('Erro ao exportar dados: ' + error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// funções de UI

function displayPosts(postsArray) {
    const container = document.getElementById('postsContainer');
    
    if (!postsArray || postsArray.length === 0) {
        displayNoPosts();
        return;
    }
    
    // ordenar por data (mais recente primeiro)
    const sortedPosts = postsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = sortedPosts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    return `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div class="d-flex gap-2 flex-wrap">
                    <span class="author-badge">
                        <i class="bi bi-person me-1"></i>
                        ${escapeHtml(post.author)}
                    </span>
                    <span class="datetime-badge">
                        <i class="bi bi-clock me-1"></i>
                        ${formatDateTime(post.createdAt)}
                    </span>
                </div>
            </div>
            
            <div class="post-subject">
                <i class="bi bi-tag me-1"></i>
                ${escapeHtml(post.subject)}
            </div>
            
            <div class="post-message">
                ${escapeHtml(post.message)}
            </div>
            
            <div class="post-actions">
                <button class="btn btn-sm like-btn ${post.liked ? 'liked btn-danger' : 'btn-outline-danger'}" 
                        onclick="toggleLike(${post.id})">
                    <i class="bi ${post.liked ? 'bi-heart-fill' : 'bi-heart'} me-1"></i>
                    ${post.liked ? 'Curtido' : 'Curtir'}
                </button>
                
                <button class="btn btn-sm btn-outline-danger delete-btn" 
                        onclick="prepareDelete(${post.id})">
                    <i class="bi bi-trash me-1"></i>
                    Excluir
                </button>
                
                <small class="text-muted ms-auto">
                    ID: #${post.id}
                </small>
            </div>
        </div>
    `;
}

function displayNoPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `
        <div class="no-posts">
            <i class="bi bi-chat-square-text"></i>
            <h5>Nenhuma postagem encontrada</h5>
            <p class="text-muted">Seja o primeiro a postar algo!</p>
        </div>
    `;
}

function updatePostCount(count) {
    document.getElementById('postCount').textContent = count;
}

function showAlert(message, type = 'info', timeout = 5000) {
    const alertsContainer = document.getElementById('alerts');
    const alertId = 'alert_' + Date.now();
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" id="${alertId}" role="alert">
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
    
    if (timeout) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, timeout);
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'block';
        document.body.classList.add('loading');
    } else {
        spinner.style.display = 'none';
        document.body.classList.remove('loading');
    }
}

// funções auxiliares

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins === 0 ? 'Agora' : `${diffMins}min atrás`;
    } else if (diffHrs < 24) {
        return `${Math.floor(diffHrs)}h atrás`;
    } else {
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
