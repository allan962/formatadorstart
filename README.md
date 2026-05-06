# StartRH — Formatador de CV (Site)

Sistema web completo com autenticação para recrutadores da StartRH.

---

## Estrutura do projeto

```
startrh-site/
├── public/
│   └── index.html      ← Frontend completo (login + formatador)
├── server/
│   └── index.js        ← Backend Node.js (protege a API Key)
├── package.json
└── README.md
```

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz (ou configure no painel da hospedagem):

```
ANTHROPIC_API_KEY=sk-ant-SUA-CHAVE-AQUI
PORT=3000
```

### 3. Adicionar recrutadores autorizados

Edite o arquivo `server/index.js`, seção `USUARIOS`:

```js
const USUARIOS = {
  'recrutador1': 'senha123',
  'recrutador2': 'startrh2024',
  'admin':       'admin@startrh'
};
```

> Em produção, use bcrypt + banco de dados (PostgreSQL, MongoDB, etc.)

### 4. Rodar o servidor

**Desenvolvimento:**
```bash
npm run dev    # com nodemon (reinicia ao salvar)
```

**Produção:**
```bash
npm start
```

Acesse: `http://localhost:3000`

---

## Deploy gratuito (Render.com)

1. Faça upload do projeto no GitHub
2. Acesse [render.com](https://render.com) → **New Web Service**
3. Conecte o repositório
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Em **Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave
6. Clique em **Deploy** → URL pública gerada automaticamente ✅

---

## Funcionalidades

| Feature | Descrição |
|---|---|
| 🔐 Login | Autenticação com usuário e senha |
| 📄 StartRH Padrão | Formatação de CV padrão |
| ♿ StartRH PCD | Formatação com dados de laudo médico |
| 👔 StartExec | Formatação executiva (C-level / diretoria) |
| 📥 Download | CV exportado como HTML pronto para impressão |
| 🔒 API Key segura | Nunca exposta ao navegador do usuário |

---

## Segurança (produção)

- [ ] Trocar lista de usuários por banco de dados com bcrypt
- [ ] Usar `express-session` com Redis para sessões persistentes
- [ ] Adicionar HTTPS (Render/Railway já fornece automaticamente)
- [ ] Rate limiting na rota `/api/formatar`
- [ ] Logs de auditoria (quem formatou qual CV)
