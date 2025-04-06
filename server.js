const express = require('express');
const axios = require('axios');
const app = express();

// Permitir que o servidor receba dados em JSON
app.use(express.json());

// Configurações da Z-API
const ZAPI_BASE_URL = 'https://api.z-api.io/instance/3DB5A3F06AFC7061997CFE2787F59778';
const ZAPI_TOKEN = '93A5749A4C531C89C65C7B95';

// Rota principal para o caminho "/"
app.get('/', (req, res) => {
    res.send('Servidor funcionando corretamente!');
});

// Webhook para receber mensagens
app.post('/webhook/receber', (req, res) => {
    console.log('Mensagem recebida:', req.body);
    res.send('Mensagem recebida com sucesso!');
});

// Webhook para status de mensagens
app.post('/webhook/status', (req, res) => {
    console.log('Status da mensagem:', req.body);
    res.send('Status recebido!');
});

// Webhook para eventos de conexão
app.post('/webhook/conectar', (req, res) => {
    console.log('Conexão estabelecida:', req.body);
    res.send('Conexão recebida!');
});

// Rota para enviar mensagens pelo WhatsApp usando Z-API
app.post('/enviar-mensagem', async (req, res) => {
    const { numero, mensagem } = req.body;

    try {
        const response = await axios.post(
            `${ZAPI_BASE_URL}/send-message`,
            {
                phone: numero,
                message: mensagem,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ZAPI_TOKEN}`,
                },
            }
        );

        res.status(200).json({
            status: 'sucesso',
            data: response.data,
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.message);
        res.status(500).json({
            status: 'erro',
            mensagem: 'Falha ao enviar mensagem',
        });
    }
});

// Webhook para receber mensagens do WhatsApp via Z-API
app.post('/webhook/zapi', (req, res) => {
    console.log('Mensagem recebida da Z-API:', req.body);
    res.send('Webhook recebido com sucesso!');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
