const porta = 3003
const express = require('express')
const bancoDados = require('./bancoDados')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({extended:true}))

/*app.get('/produtos', (req, resp, next)=>{
    resp.send({nome: 'Notebook', preco: 3000})
})*/

app.get('/produtos', (req, resp)=>{ //função chain of responsability
    resp.send(bancoDados.getProdutos())
})

app.get('/produtos/:id', (req, resp)=>{ //buscar produto por id
    resp.send(bancoDados.getProduto(req.params.id))
})

/*app.post('/produtos2', (req, resp, next)=>{
    resp.send({nome: 'Notebook 2', preco: 6000})
})*/

app.post('/produtos', (req, resp)=>{
    const produto = bancoDados.salvarProduto({
        nome: req.body.nome, //pegando valor do corpo da requisição enviado pelo html
        preco: req.body.preco
    })
    //resp.send(`O ${produto} foi inserido com sucesso`)
    resp.send(produto) //se o produto foi inserido, aparceu isso. Converte esse objeto em string JSON!!!
})

app.put('/produto/:id', (req, resp)=>{
    const produto = bancoDados.salvarProduto({
        id: req.body.id,
        nome: req.body.nome,
        preco: req.body.preco
    })
}) //put serve para atualizar algo

app.delete('/produto/:id', (req, resp)=> {
    const produto = bancoDados.excluirProduto(req.params.id)
    resp.send(produto)
})

app.listen(porta, () => [
    console.log(`Sevidor agora executando na porta ${porta}`)
])

//npm i --save body-parser@1.18.2 -E  (BAIXAR ISSO PARA CONVERTER OS DADOS DO BODY DURANTE REQUISIÇÃO)



