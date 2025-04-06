const express = require('express');
const axios = require('axios');
const moment = require('moment');
const app = express();

// Permitir que o servidor receba dados em JSON
app.use(express.json());

// Configurações da Z-API
const ZAPI_BASE_URL = 'https://api.z-api.io/instances/3DB5A3F06AFC7061997CFE2787F59778/token/93A5749A4C531C89C65C7B95/send-message';
const ZAPI_TOKEN = '93A5749A4C531C89C65C7B95';

// Estrutura inicial de dados
let categorias = ["Alimentação", "Transporte", "Lazer", "Educação", "Saúde", "Moradia", "Investimentos", "Cartões de Crédito"];
let receitas = [];
let despesas = [];

// Funções principais
function listarCategorias() {
    return `Categorias disponíveis:\n${categorias.join("\n")}`;
}

function adicionarReceita(descricao, valor, categoria) {
    receitas.push({ descricao, valor, categoria });
    return `Receita adicionada: ${descricao} - R$${valor} (${categoria})`;
}

function listarReceitas() {
    if (receitas.length === 0) return "Nenhuma receita registrada.";
    return receitas.map(r => `${r.descricao} - R$${r.valor} (${r.categoria})`).join("\n");
}

function listarDespesas() {
    if (despesas.length === 0) return "Nenhuma despesa registrada.";
    return despesas.map(d => `${d.descricao} - R$${d.valor} (${d.categoria})`).join("\n");
}

// Rota principal para o caminho "/"
app.get('/', (req, res) => {
    res.send('Servidor funcionando corretamente!');
});

// Webhook para receber mensagens
app.post('/webhook/receber', async (req, res) => {
    const mensagemRecebida = req.body.message; // Mensagem enviada pelo usuário
    const telefone = req.body.phone; // Número do usuário

    console.log(`Mensagem recebida de ${telefone}: ${mensagemRecebida}`);

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

    try {
        const response = await axios.post(
            `${ZAPI_BASE_URL}`,
            {
                phone: telefone,
                message: resposta,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ZAPI_TOKEN}`,
                },
            }
        );

        console.log(`Mensagem enviada para ${telefone}: ${resposta}`);
        res.status(200).send('Mensagem processada e resposta enviada!');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.message);
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
