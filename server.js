const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const porta = 3000;
const arquivo = path.join(__dirname, 'data.json');

// middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// funções para carregar e salvar dados
function carregarDados() {
    try {
        const dados = fs.readFileSync(arquivo, 'utf8');
        return JSON.parse(dados);
    } catch (error) {
        // se arquivo não existe, criar dados iniciais
        const dadosIniciais = {
            posts: [],
            ultimoId: 0
        };
        salvarDados(dadosIniciais);
        return dadosIniciais;
    }
}

function salvarDados(dados) {
    try {
        fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar:', error);
        return false;
    }
}

// ROTAS DA API

// GET /api/posts - listar postagens
app.get('/api/posts', (req, res) => {
    const dados = carregarDados();
    let posts = dados.posts;
    
    // filtros simples
    const { author, date, time } = req.query;
    
    if (author) {
        posts = posts.filter(post => 
            post.author.toLowerCase().includes(author.toLowerCase())
        );
    }
    
    if (date) {
        posts = posts.filter(post => 
            post.createdAt.split('T')[0] === date
        );
    }
    
    if (time) {
        posts = posts.filter(post => 
            post.createdAt.split('T')[1].slice(0, 5) === time
        );
    }
    
    // ordenar por data
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(posts);
});

// POST /api/posts - criar postagem
app.post('/api/posts', (req, res) => {
    const { author, subject, message } = req.body;
    
    // validação básica
    if (!author || !subject || !message) {
        return res.status(400).json({
            error: 'Preencha todos os campos'
        });
    }
    
    const dados = carregarDados();
    
    // criar nova postagem
    const novaPostagem = {
        id: ++dados.ultimoId,
        author: author.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        liked: false
    };
    
    dados.posts.push(novaPostagem);
    
    if (salvarDados(dados)) {
        res.status(201).json(novaPostagem);
    } else {
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// GET /api/posts/:id - buscar postagem por id
app.get('/api/posts/:id', (req, res) => {
    const dados = carregarDados();
    const post = dados.posts.find(p => p.id == req.params.id);
    
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ error: 'Postagem não encontrada' });
    }
});

// PATCH /api/posts/:id/like - curtir postagem
app.patch('/api/posts/:id/like', (req, res) => {
    const dados = carregarDados();
    const post = dados.posts.find(p => p.id == req.params.id);
    
    if (!post) {
        return res.status(404).json({ error: 'Postagem não encontrada' });
    }
    
    post.liked = !post.liked;
    
    if (salvarDados(dados)) {
        res.json(post);
    } else {
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// DELETE /api/posts/:id - excluir postagem
app.delete('/api/posts/:id', (req, res) => {
    const dados = carregarDados();
    const index = dados.posts.findIndex(p => p.id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Postagem não encontrada' });
    }
    
    const postExcluido = dados.posts.splice(index, 1)[0];
    
    if (salvarDados(dados)) {
        res.json({ message: 'Postagem excluída', post: postExcluido });
    } else {
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// GET /api/export - exportar todos os dados em JSON
app.get('/api/export', async (req, res) => {
    try {
        const data = await loadData();
        
        // adicionar estatísticas
        const exportData = {
            ...data,
            statistics: {
                totalPosts: data.posts.length,
                likedPosts: data.posts.filter(p => p.liked).length,
                uniqueAuthors: [...new Set(data.posts.map(p => p.author))].length,
                exportedAt: new Date().toISOString()
            }
        };
        
        // headers para download
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


// middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe nesta API`
    });
});

// middleware para tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
    });
});

// iniciar servidor
app.listen(porta, () => {
    console.log('Base de dados inicializada');
    console.log(`Servidor rodando na porta ${porta}`);
});