// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    endpoints: {
        posts: '/posts',
        export: '/export'
    }
};

// Função para construir URLs da API
function getApiUrl(endpoint) {
    return API_CONFIG.baseURL + API_CONFIG.endpoints[endpoint];
}

// Configuração de headers padrão
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};