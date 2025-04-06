const express = require('express');
const app = express();

// Permitir que o servidor receba dados em JSON
app.use(express.json());

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

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
