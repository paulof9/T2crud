const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Função para carregar dados
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se arquivo não existe, criar estrutura inicial
        const initialData = {
            posts: [],
            lastId: 0,
            meta: {
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                totalPosts: 0
            }
        };
        await saveData(initialData);
        return initialData;
    }
}

// Função para salvar dados
async function saveData(data) {
    try {
        data.meta.lastModified = new Date().toISOString();
        data.meta.totalPosts = data.posts.length;
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// ROTAS DA API

// GET /api/posts - Listar todas as postagens
app.get('/api/posts', async (req, res) => {
    try {
        const data = await loadData();
        const { author, date, time } = req.query;
        
        let posts = data.posts;
        
        // Filtros opcionais
        if (author) {
            posts = posts.filter(post => 
                post.author.toLowerCase().includes(author.toLowerCase())
            );
        }
        
        if (date) {
            posts = posts.filter(post => 
                new Date(post.createdAt).toISOString().split('T')[0] === date
            );
        }
        
        if (time) {
            posts = posts.filter(post => 
                new Date(post.createdAt).toTimeString().slice(0, 5) === time
            );
        }
        
        // Ordenar por data (mais recente primeiro)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message 
        });
    }
});

// POST /api/posts - Criar nova postagem
app.post('/api/posts', async (req, res) => {
    try {
        const { author, subject, message } = req.body;
        
        // Validação
        if (!author || !subject || !message) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Autor, assunto e mensagem são obrigatórios'
            });
        }
        
        if (author.trim().length < 2) {
            return res.status(400).json({
                error: 'Autor inválido',
                message: 'Nome do autor deve ter pelo menos 2 caracteres'
            });
        }
        
        if (subject.trim().length < 3) {
            return res.status(400).json({
                error: 'Assunto inválido',
                message: 'Assunto deve ter pelo menos 3 caracteres'
            });
        }
        
        if (message.trim().length < 5) {
            return res.status(400).json({
                error: 'Mensagem inválida',
                message: 'Mensagem deve ter pelo menos 5 caracteres'
            });
        }
        
        const data = await loadData();
        
        // Criar nova postagem
        const newPost = {
            id: ++data.lastId,
            author: author.trim(),
            subject: subject.trim(),
            message: message.trim(),
            createdAt: new Date().toISOString(),
            liked: false
        };
        
        data.posts.push(newPost);
        
        // Salvar dados
        const saved = await saveData(data);
        if (!saved) {
            return res.status(500).json({
                error: 'Erro ao salvar',
                message: 'Não foi possível salvar a postagem'
            });
        }
        
        console.log(`Nova postagem criada: ID ${newPost.id} por ${newPost.author}`);
        res.status(201).json(newPost);
        
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/posts/:id - Buscar postagem específica
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID inválido',
                message: 'ID deve ser um número'
            });
        }
        
        const data = await loadData();
        const post = data.posts.find(p => p.id === postId);
        
        if (!post) {
            return res.status(404).json({
                error: 'Postagem não encontrada',
                message: `Nenhuma postagem com ID ${postId}`
            });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Erro ao buscar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// PATCH /api/posts/:id/like - Curtir/descurtir postagem
app.patch('/api/posts/:id/like', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID inválido',
                message: 'ID deve ser um número'
            });
        }
        
        const data = await loadData();
        const postIndex = data.posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.status(404).json({
                error: 'Postagem não encontrada',
                message: `Nenhuma postagem com ID ${postId}`
            });
        }
        
        // Alternar status de curtida
        data.posts[postIndex].liked = !data.posts[postIndex].liked;
        
        // Salvar dados
        const saved = await saveData(data);
        if (!saved) {
            return res.status(500).json({
                error: 'Erro ao salvar',
                message: 'Não foi possível atualizar a postagem'
            });
        }
        
        console.log(`Post ${postId} ${data.posts[postIndex].liked ? 'curtido' : 'descurtido'}`);
        res.json(data.posts[postIndex]);
        
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// DELETE /api/posts/:id - Excluir postagem
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID inválido',
                message: 'ID deve ser um número'
            });
        }
        
        const data = await loadData();
        const postIndex = data.posts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.status(404).json({
                error: 'Postagem não encontrada',
                message: `Nenhuma postagem com ID ${postId}`
            });
        }
        
        // Remover postagem
        const deletedPost = data.posts.splice(postIndex, 1)[0];
        
        // Salvar dados
        const saved = await saveData(data);
        if (!saved) {
            return res.status(500).json({
                error: 'Erro ao salvar',
                message: 'Não foi possível excluir a postagem'
            });
        }
        
        console.log(`Postagem excluída: ID ${postId} por ${deletedPost.author}`);
        res.json({ 
            message: 'Postagem excluída com sucesso',
            deletedPost 
        });
        
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// GET /api/export - Exportar todos os dados em JSON
app.get('/api/export', async (req, res) => {
    try {
        const data = await loadData();
        
        // Adicionar estatísticas
        const exportData = {
            ...data,
            statistics: {
                totalPosts: data.posts.length,
                likedPosts: data.posts.filter(p => p.liked).length,
                uniqueAuthors: [...new Set(data.posts.map(p => p.author))].length,
                exportedAt: new Date().toISOString()
            }
        };
        
        // Headers para download
        res.setHeader('Content-Disposition', `attachment; filename="posts-export-${new Date().toISOString().split('T')[0]}.json"`);
        res.setHeader('Content-Type', 'application/json');
        
        res.json(exportData);
        console.log('Dados exportados com sucesso');
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('./package.json').version
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe nesta API`
    });
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Verificar/criar arquivo de dados
        await loadData();
        console.log('✅ Base de dados inicializada');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
            console.log(`💾 Dados salvos em: ${DATA_FILE}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais para encerramento graceful
process.on('SIGTERM', () => {
    console.log('📦 Encerrando servidor graciosamente...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📦 Encerrando servidor graciosamente...');
    process.exit(0);
});

// Inicializar aplicação
startServer();