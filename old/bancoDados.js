const sequence = {
    _id: 1, //underscore antes de atributo significa que ele tem o get e set vinculado (aula de orientação a objetos)
    get id() {
        return this._id++ //a cada cadastro novo, ele pega o último id cadastrado e soma mais um pra gerar o id do atual
    }
}

const produtos = {}

//CRUD: cadastras, consultar, atualizar e deletar

function getProduto(id){
    return produtos[id] || {} //retorna o produto ou, se o item pesquisado não existir, retorna produto vazio
}

function getProdutos(){
    return Object.values(produtos) //retorna todos os elementos/valores daquele objeto
}

function salvarProduto(produto){
    if(!produto.id){ //verificando se o produto tem id. Se não tem id, salva como novo produto...
        produto.id = sequence.id
    }
    produtos[produto.id] = produto //se o produto já tem id, salva como edição/atualização dos dados daquele produto
    return produto //retorna produto para mostrar que foi inserido com sucesso
}

function excluirProduto(id){
    const produto = produtos[id]
    delete produtos[id]
    return produto
}

module.exports = {salvarProduto, getProduto, getProdutos, excluirProduto} //exportando as funções para o servidor