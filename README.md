# T2 CRUD - Rede Social de Postagens

Sistema completo de CRUD para uma rede social simples, desenvolvido com **Node.js + Express** (backend) e **HTML + Bootstrap** (frontend).

## 📋 Funcionalidades

### ✅ Requisitos Implementados

1. **Base de Dados Local** - Armazenamento em arquivo JSON
   - ✅ Identificação única da postagem (ID interno)
   - ✅ Assunto da postagem
   - ✅ Mensagem completa
   - ✅ Data e hora de criação
   - ✅ Autor/Emissário
   - ✅ Status de curtida (liked/not liked)

2. **Operações CRUD**
   - ✅ **CREATE**: Formulário para criar postagens
   - ✅ **READ**: Listagem de todas as postagens
   - ✅ **UPDATE**: Sistema de curtir/descurtir
   - ✅ **DELETE**: Exclusão via método DELETE com confirmação

3. **Filtros e Busca**
   - ✅ Filtro por autor/emissário
   - ✅ Filtro por data
   - ✅ Filtro por hora
   - ✅ Filtros em tempo real

4. **Exportação**
   - ✅ Exportar base completa em JSON

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar Backend (Branch main)
```bash
# Desenvolvimento com auto-restart
npm run dev

# Produção
npm start
```

### 3. Acessar Frontend (Branch frontend)
```bash
# Mudar para branch frontend
git checkout frontend

# Abrir index.html no navegador
# Ou usar um servidor local como Live Server
```

## 🔧 Estrutura do Projeto

### Backend (Branch: main - após merge)
```
├── server.js          # Servidor Express principal
├── data.json          # Base de dados local
└── package.json       # Configurações e dependências
```

### Frontend (Branch: main - após merge)
```
├── index.html         # Página principal
├── style.css          # Estilos customizados
└── script.js          # JavaScript para interações
```

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/posts` | Lista todas as postagens |
| POST | `/api/posts` | Cria nova postagem |
| GET | `/api/posts/:id` | Busca postagem específica |
| PATCH | `/api/posts/:id/like` | Curtir/descurtir postagem |
| DELETE | `/api/posts/:id` | Exclui postagem |
| GET | `/api/export` | Exporta dados em JSON |

### Query Parameters (Filtros)
- `author`: Filtrar por autor
- `date`: Filtrar por data (YYYY-MM-DD)
- `time`: Filtrar por hora (HH:MM)

## 🎨 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para CORS
- **File System** - Para operações de arquivo

### Frontend
- **HTML5** - Estrutura da página
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Lógica de interface
- **Bootstrap Icons** - Ícones
- **Fetch API** - Comunicação com backend

## 💡 Características Técnicas

### Validações
- ✅ Validação de dados no backend
- ✅ Feedback visual no frontend
- ✅ Tratamento de erros robusto

### UX/UI
- ✅ Interface responsiva
- ✅ Animações CSS
- ✅ Feedback em tempo real
- ✅ Auto-refresh da listagem
- ✅ Modal de confirmação para exclusões

### Segurança
- ✅ Validação de entrada
- ✅ Escape de HTML para prevenir XSS
- ✅ Headers CORS configurados

## 🔄 Fluxo de Dados

1. **Criar Postagem**: Frontend → POST `/api/posts` → Salva em `data.json`
2. **Listar Posts**: Frontend → GET `/api/posts` → Lê de `data.json`
3. **Curtir Post**: Frontend → PATCH `/api/posts/:id/like` → Atualiza `data.json`
4. **Excluir Post**: Frontend → DELETE `/api/posts/:id` → Remove de `data.json`
5. **Exportar**: Frontend → GET `/api/export` → Retorna `data.json` completo

## 📄 Formato dos Dados

### Estrutura da Postagem
```json
{
  "id": 1,
  "author": "Nome do Autor",
  "subject": "Assunto da Postagem",
  "message": "Texto da mensagem completa",
  "createdAt": "2026-02-06T10:30:00.000Z",
  "liked": false
}
```

### Estrutura do Banco
```json
{
  "posts": [...],
  "lastId": 3,
  "meta": {
    "created": "2026-02-06T10:00:00.000Z",
    "lastModified": "2026-02-06T12:45:15.000Z",
    "totalPosts": 3
  }
}
```

## 🌟 Funcionalidades Extras

- **Auto-refresh** a cada 30 segundos
- **Filtros em tempo real** com debounce
- **Timestamps relativos** ("2h atrás", "agora")
- **Contador de posts** dinâmico
- **Sistema de alertas** com auto-dismiss
- **Loading states** visuais
- **Detecção de conexão** online/offline
- **Responsividade** completa para mobile

## 🚦 Status do Servidor

O servidor roda na porta **3000** por padrão. Acesse:
- 📊 Lista Posts: `http://localhost:3000/api/posts`
- 📥 Exportar: `http://localhost:3000/api/export`