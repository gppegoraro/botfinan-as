const express = require('express');
const axios = require('axios');
const moment = require('moment');

const app = express();
app.use(express.json());

// Estrutura inicial de dados
let categorias = ["Alimentação", "Transporte", "Lazer", "Educação", "Saúde", "Moradia", "Investimentos", "Cartões de Crédito"];
let receitas = [];
let despesas = [];
let cartoes = [];
let contaVencimentos = [];

// Funções principais
function adicionarCategoria(nome) {
    categorias.push(nome);
    return `Categoria adicionada: ${nome}`;
}

function apagarCategoria(nome) {
    categorias = categorias.filter(categoria => categoria !== nome);
    return `Categoria apagada: ${nome}`;
}

function listarCategorias() {
    return `Categorias disponíveis:\n${categorias.join("\n")}`;
}

function adicionarReceita(descricao, valor, categoria) {
    receitas.push({ descricao, valor, categoria });
    return `Receita adicionada: ${descricao} - R$${valor} (${categoria})`;
}

function apagarReceita(descricao) {
    receitas = receitas.filter(receita => receita.descricao !== descricao);
    return `Receita apagada: ${descricao}`;
}

function listarReceitas() {
    if (receitas.length === 0) return "Nenhuma receita registrada.";
    return receitas.map(r => `${r.descricao} - R$${r.valor} (${r.categoria})`).join("\n");
}

function adicionarDespesa(descricao, valor, categoria) {
    despesas.push({ descricao, valor, categoria });
    return `Despesa adicionada: ${descricao} - R$${valor} (${categoria})`;
}

function apagarDespesa(descricao) {
    despesas = despesas.filter(despesa => despesa.descricao !== descricao);
    return `Despesa apagada: ${descricao}`;
}

function listarDespesas() {
    if (despesas.length === 0) return "Nenhuma despesa registrada.";
    return despesas.map(d => `${d.descricao} - R$${d.valor} (${d.categoria})`).join("\n");
}

function adicionarCartao(nome, banco, limite) {
    cartoes.push({ nome, banco, limite, despesas: [] });
    return `Cartão adicionado: ${nome} (${banco}) - Limite: R$${limite}`;
}

function listarCartoes() {
    if (cartoes.length === 0) return "Nenhum cartão registrado.";
    return cartoes.map(c => `${c.nome} (${c.banco}) - Limite: R$${c.limite}`).join("\n");
}

function adicionarDespesaCartao(cartaoNome, descricao, valor) {
    const cartao = cartoes.find(c => c.nome === cartaoNome);
    if (!cartao) return "Cartão não encontrado.";
    cartao.despesas.push({ descricao, valor });
    return `Despesa adicionada ao cartão ${cartaoNome}: ${descricao} - R$${valor}`;
}

function listarDespesasPorCartao(cartaoNome) {
    const cartao = cartoes.find(c => c.nome === cartaoNome);
    if (!cartao) return "Cartão não encontrado.";
    if (cartao.despesas.length === 0) return `Nenhuma despesa registrada no cartão ${cartaoNome}.`;
    return cartao.despesas.map(d => `${d.descricao} - R$${d.valor}`).join("\n");
}

function adicionarVencimento(descricao, data) {
    contaVencimentos.push({ descricao, data });
    return `Conta adicionada: ${descricao} - Vencimento: ${moment(data).format("DD/MM/YYYY")}`;
}

function listarVencimentos() {
    if (contaVencimentos.length === 0) return "Nenhuma conta registrada.";
    return contaVencimentos.map(c => `${c.descricao} - Vencimento: ${moment(c.data).format("DD/MM/YYYY")}`).join("\n");
}

function verificarVencimentos() {
    const hoje = moment();
    const vencimentosHoje = contaVencimentos.filter(c => moment(c.data).isSame(hoje, 'day'));
    if (vencimentosHoje.length === 0) return "Nenhuma conta vencendo hoje.";
    return vencimentosHoje.map(c => `${c.descricao} - Vence hoje!`).join("\n");
}

// Função para enviar mensagens
async function enviarMensagem(telefone, mensagem) {
    try {
        const response = await axios.post('https://api.z-api.io/instances/{instance_id}/token/{token}/send-message', {
            phone: telefone,
            message: mensagem
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error.message);
        return "Erro ao enviar mensagem.";
    }
}

// Rota para receber mensagens via webhook da Z-API
app.post('/webhook', async (req, res) => {
    const mensagemRecebida = req.body.message; // Mensagem enviada pelo usuário
    const telefone = req.body.phone; // Número do usuário

    console.log(`Mensagem recebida de ${telefone}: ${mensagemRecebida}`);

    // Processar a mensagem recebida e criar uma resposta
    let resposta;
    if (mensagemRecebida.toLowerCase() === 'categorias') {
        resposta = listarCategorias();
    } else if (mensagemRecebida.toLowerCase().startsWith('adicionar receita')) {
        const [_, descricao, valor, categoria] = mensagemRecebida.split(';');
        resposta = adicionarReceita(descricao.trim(), parseFloat(valor.trim()), categoria.trim());
    } else if (mensagemRecebida.toLowerCase() === 'listar receitas') {
        resposta = listarReceitas();
    } else if (mensagemRecebida.toLowerCase() === 'listar despesas') {
        resposta = listarDespesas();
    } else {
        resposta = "Comando não reconhecido. Tente enviar: 'categorias', 'listar receitas' ou 'adicionar receita;descricao;valor;categoria'.";
    }

    // Enviar a resposta de volta para o usuário
    await enviarMensagem(telefone, resposta);

    res.sendStatus(200); // Responder à Z-API que a mensagem foi processada
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
