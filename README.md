# ⚡ Tiny ERP Agent — Painel Operacional

Painel de gestão conectado ao Tiny ERP via linguagem natural.
Deploy em 5 minutos na Vercel, sem servidor, sem manutenção.

---

## 🚀 Deploy na Vercel (5 minutos)

### Passo 1 — Crie uma conta gratuita
Acesse [vercel.com](https://vercel.com) e crie uma conta (pode usar Google ou GitHub).

### Passo 2 — Instale a CLI da Vercel
```bash
npm install -g vercel
```

### Passo 3 — Entre na pasta do projeto
```bash
cd tiny-painel
npm install
```

### Passo 4 — Faça o deploy
```bash
vercel
```

Responda as perguntas:
- `Set up and deploy?` → **Y**
- `Which scope?` → escolha sua conta
- `Link to existing project?` → **N**
- `Project name?` → **tiny-painel** (ou o nome que quiser)
- `Directory?` → **./** (enter)
- `Override settings?` → **N**

### Passo 5 — Configure o token do Tiny (OBRIGATÓRIO)
```bash
vercel env add TINY_TOKEN
```
Cole o valor do seu token Tiny ERP (encontrado em: Tiny > Configurações > API)

Depois faça o deploy de produção:
```bash
vercel --prod
```

Sua URL será algo como: `https://tiny-painel.vercel.app` ✅

---

## 🔄 Atualizar o painel

Sempre que quiser atualizar:
```bash
vercel --prod
```

---

## 🔒 Segurança

- O token do Tiny fica **somente no servidor** (variável de ambiente da Vercel)
- O browser nunca tem acesso ao token
- Apenas a serverless function `/api/tiny.js` faz as chamadas à API

---

## 💬 Comandos disponíveis

| Comando | Ação |
|---|---|
| "pedidos de hoje" | Lista pedidos do dia |
| "pedidos desta semana" | Lista pedidos da semana |
| "pedidos pendentes" | Pedidos em aberto |
| "pedido 12345" | Detalhe de um pedido |
| "contas a receber" | Títulos a receber |
| "contas vencidas" | Títulos vencidos |
| "contas a pagar" | Títulos a pagar |
| "resumo gerencial" | Dashboard completo |
