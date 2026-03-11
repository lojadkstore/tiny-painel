// api/tiny.js — Vercel Serverless Function
// Faz o proxy entre o browser e a API do Tiny, resolvendo CORS

const ALLOWED_ENDPOINTS = [
  'pedidos.pesquisa.php',
  'pedido.obter.php',
  'contas.receber.pesquisa.php',
  'contas.pagar.pesquisa.php',
  'info.php',
];

export default async function handler(req, res) {
  // Handler de preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const TINY_TOKEN = process.env.TINY_TOKEN;
  if (!TINY_TOKEN) {
    return res.status(500).json({ erro: 'Token não configurado. Adicione TINY_TOKEN nas variáveis de ambiente da Vercel.' });
  }

  const { endpoint, params = {} } = req.body;
  if (!endpoint) {
    return res.status(400).json({ erro: 'Parâmetro "endpoint" obrigatório' });
  }

  // Valida endpoint contra lista de endpoints permitidos
  if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
    return res.status(400).json({ erro: 'Endpoint não permitido' });
  }

  // Remove token se vier do cliente (segurança)
  delete params.token;

  const body = new URLSearchParams({
    token: TINY_TOKEN,
    formato: 'JSON',
    ...params,
  });

  try {
    const response = await fetch(`https://api.tiny.com.br/api2/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();

    // CORS headers para o browser
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (err) {
    console.error('[tiny proxy error]', err.message);
    return res.status(500).json({ erro: 'Falha ao consultar Tiny ERP' });
  }
}

export const config = {
  api: { bodyParser: true },
};
