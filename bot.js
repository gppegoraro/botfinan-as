const axios = require('axios'); // Para integração com a API Z-API
const moment = require('moment'); // Para lidar com datas

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

// Função para integração com Z-API
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

// Exemplo de uso
(async () => {
    const telefone = "5511999999999"; // Número do usuário
    const mensagem = listarCategorias(); // Exemplo: listar categorias
    const resposta = await enviarMensagem(telefone, mensagem);
    console.log(resposta);
})();
