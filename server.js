/**
 * StartRH – Servidor Backend
 * Node.js + Express
 * Protege a API Key e gerencia autenticação de recrutadores.
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────
// ⚠️  Coloque suas credenciais em variáveis de ambiente no servidor!
//     Nunca suba este arquivo com valores reais no Git.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-COLOQUE-SUA-KEY-AQUI';

// Lista de recrutadores autorizados  { usuario: senha }
// Troque por bcrypt + banco de dados em produção.
const USUARIOS = {
  'recrutador1': 'senha123',
  'recrutador2': 'startrh2024',
  'admin':       'admin@startrh'
};

// Sessões simples em memória (use express-session + Redis em produção)
const sessoes = new Map();

function gerarToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de autenticação para rotas protegidas
function autenticar(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token || !sessoes.has(token)) {
    return res.status(401).json({ erro: 'Não autorizado. Faça login.' });
  }
  req.usuario = sessoes.get(token);
  next();
}

// ── ROTAS ─────────────────────────────────────────────────────────────────────

// Login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
  }
  if (USUARIOS[usuario] && USUARIOS[usuario] === senha) {
    const token = gerarToken();
    sessoes.set(token, usuario);
    // Expirar token em 8 horas
    setTimeout(() => sessoes.delete(token), 8 * 60 * 60 * 1000);
    return res.json({ token, usuario });
  }
  return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
});

// Logout
app.post('/api/logout', autenticar, (req, res) => {
  const token = req.headers['x-auth-token'];
  sessoes.delete(token);
  res.json({ ok: true });
});

// Verificar sessão
app.get('/api/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

// Proxy para a Anthropic API (mantém a key segura no servidor)
app.post('/api/formatar', autenticar, async (req, res) => {
  const { messages, system, max_tokens } = req.body;

  try {
    const resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            ANTHROPIC_API_KEY,
        'anthropic-version':    '2023-06-01',
        'anthropic-beta':       'pdfs-2024-09-25'
      },
      body: JSON.stringify({
        model:      'claude-opus-4-5',
        max_tokens: max_tokens || 4096,
        system,
        messages
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro Anthropic:', dados);
      return res.status(resposta.status).json({ erro: dados.error?.message || 'Erro na API.' });
    }

    res.json(dados);

  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// SPA fallback — qualquer rota retorna o app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  StartRH rodando em http://localhost:${PORT}`);
  console.log(`📋  Recrutadores configurados: ${Object.keys(USUARIOS).join(', ')}`);
  console.log(`🔑  API Key: ${ANTHROPIC_API_KEY.slice(0, 12)}...\n`);
});
