import { useState, useEffect, useRef } from "react";

// ─── Datas fuso SP ─────────────────────────────────────────────────────────────
function nowSP() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
}
function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}
function today()      { return fmtDate(nowSP()); }
function yesterday()  { const d=nowSP(); d.setDate(d.getDate()-1); return fmtDate(d); }
function weekStart()  { const d=nowSP(); d.setDate(d.getDate()-(d.getDay()===0?6:d.getDay()-1)); return fmtDate(d); }
function monthStart() { const d=nowSP(); return `01/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; }
function offsetDate(n){ const d=nowSP(); d.setDate(d.getDate()+n); return fmtDate(d); }

// ─── Chamar API Tiny via serverless function ──────────────────────────────────
async function tinyCall(endpoint, params = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("/api/tiny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, params }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    const data = await res.json();
    return data?.retorno ?? data;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError") throw new Error("Tempo limite de requisição excedido");
    throw e;
  }
}

// ─── Intent parser ─────────────────────────────────────────────────────────────
function parseIntent(msg) {
  const m = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

  const numMatch = m.match(/(?:pedido[s]?\s*#?|#\s*)(\d{3,})/);
  if (numMatch) {
    const numero = parseInt(numMatch[1], 10);
    if (numero > 0 && numero < 1000000000) return { type:"order_detail", numero: String(numero) };
  }

  if (/pedido|vend[ei]|vendas|faturei|faturamento|quanto vendi/.test(m)) {
    if (/hoje/.test(m))    return { type:"orders", dI:today(),      dF:today() };
    if (/ontem/.test(m))   return { type:"orders", dI:yesterday(),  dF:yesterday() };
    if (/semana/.test(m))  return { type:"orders", dI:weekStart(),  dF:today() };
    if (/mes|mês/.test(m)) return { type:"orders", dI:monthStart(), dF:today() };
    const nDias = m.match(/ultimos?\s+(\d+)\s+dias?/)?.[1];
    if (nDias) return { type:"orders", dI:offsetDate(-parseInt(nDias)+1), dF:today() };
    if (/pendente|aberto|nao faturado/.test(m)) return { type:"orders", situacao:"aberto",    dI:offsetDate(-30), dF:today() };
    if (/cancelado/.test(m))                   return { type:"orders", situacao:"cancelado", dI:offsetDate(-30), dF:today() };
    if (/enviado|rastreio/.test(m))            return { type:"orders", situacao:"enviado",   dI:offsetDate(-30), dF:today() };
    return { type:"orders", dI:today(), dF:today() };
  }
  if (/receber|cobranca|inadimpl|a receber/.test(m)) {
    if (/semana/.test(m))           return { type:"receivable", dI:weekStart(),  dF:offsetDate(7) };
    if (/mes|mês/.test(m))          return { type:"receivable", dI:monthStart(), dF:today() };
    if (/vencid|atrasad/.test(m))   return { type:"receivable", dI:offsetDate(-90), dF:offsetDate(-1) };
    return { type:"receivable", dI:weekStart(), dF:offsetDate(7) };
  }
  if (/pagar|despesa|fornecedor|a pagar/.test(m)) {
    if (/vencid|atrasad/.test(m))   return { type:"payable", dI:offsetDate(-90), dF:offsetDate(-1) };
    if (/semana/.test(m))           return { type:"payable", dI:today(),         dF:offsetDate(7) };
    return { type:"payable", dI:today(), dF:offsetDate(30) };
  }
  if (/produto|estoque|sku/.test(m)) return { type:"product", query:msg };
  if (/dashboard|resumo|gerencial|visao|painel/.test(m)) return { type:"dashboard" };
  if (/conexao|conta|token|status|api|info/.test(m)) return { type:"info" };
  return { type:"unknown" };
}

// ─── Executar intenção ─────────────────────────────────────────────────────────
async function executeIntent(intent) {
  switch(intent.type) {
    case "orders": {
      const p = { pagina:1, sort:"DESC" };
      if (intent.dI) p.dataInicial = intent.dI;
      if (intent.dF) p.dataFinal   = intent.dF;
      if (intent.situacao) p.situacao = intent.situacao;
      const retorno = await tinyCall("pedidos.pesquisa.php", p);
      const pedidos = retorno?.pedidos ?? [];
      const total = pedidos.reduce((s,x)=>s+parseFloat(x?.pedido?.valor||0),0);
      const porSit = {};
      pedidos.forEach(x=>{ const s=x?.pedido?.situacao||"?"; porSit[s]=(porSit[s]||0)+1; });
      return { type:"orders", pedidos, total, porSit, periodo:`${intent.dI||""}${intent.dF&&intent.dI!==intent.dF?" → "+intent.dF:""}` };
    }
    case "order_detail": {
      const retorno = await tinyCall("pedido.obter.php", { numero: intent.numero });
      return { type:"order_detail", pedido: retorno?.pedido };
    }
    case "receivable": {
      const p = { pagina:1 };
      if (intent.dI) p.dataInicial = intent.dI;
      if (intent.dF) p.dataFinal   = intent.dF;
      if (intent.situacao) p.situacao = intent.situacao;
      const retorno = await tinyCall("contas.receber.pesquisa.php", p);
      const contas = retorno?.contasReceber ?? retorno?.contas ?? [];
      const total = contas.reduce((s,c)=>s+parseFloat(c?.conta?.valor||0),0);
      const vencidas = contas.filter(c=>{
        const v=c?.conta?.vencimento; if(!v)return false;
        const parts=v.split("/"); if(parts.length!==3)return false;
        const [d,mo,y]=parts; const dt=new Date(parseInt(y),parseInt(mo)-1,parseInt(d));
        return !isNaN(dt.getTime())&&dt<nowSP();
      }).length;
      return { type:"receivable", contas, total, vencidas };
    }
    case "payable": {
      const p = { pagina:1 };
      if (intent.dI) p.dataInicial = intent.dI;
      if (intent.dF) p.dataFinal   = intent.dF;
      if (intent.situacao) p.situacao = intent.situacao;
      const retorno = await tinyCall("contas.pagar.pesquisa.php", p);
      const contas = retorno?.contasPagar ?? retorno?.contas ?? [];
      const total = contas.reduce((s,c)=>s+parseFloat(c?.conta?.valor||0),0);
      return { type:"payable", contas, total };
    }
    case "info": {
      const retorno = await tinyCall("info.php", {});
      return { type:"info", data: retorno };
    }
    case "dashboard": {
      const results = await Promise.allSettled([
        tinyCall("pedidos.pesquisa.php",        { dataInicial:today(),     dataFinal:today(),       pagina:1, sort:"DESC" }),
        tinyCall("contas.receber.pesquisa.php", { dataInicial:weekStart(), dataFinal:offsetDate(7), pagina:1 }),
        tinyCall("contas.pagar.pesquisa.php",   { dataInicial:today(),     dataFinal:offsetDate(7), pagina:1 }),
      ]);
      const pR  = results[0].status === "fulfilled" ? results[0].value : null;
      const rR  = results[1].status === "fulfilled" ? results[1].value : null;
      const pgR = results[2].status === "fulfilled" ? results[2].value : null;
      return {
        type:"dashboard",
        pedidos: pR?.pedidos ?? [],
        receber: rR?.contasReceber ?? rR?.contas ?? [],
        pagar:   pgR?.contasPagar  ?? pgR?.contas ?? [],
      };
    }
    default: return { type:"unknown" };
  }
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────
const fmt = v => `R$ ${parseFloat(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const sitColor = s => {
  if (!s) return "#6b7280";
  const l = s.toLowerCase();
  if (l.includes("cancel"))  return "#ef4444";
  if (l.includes("aberto")||l.includes("pendente")) return "#f59e0b";
  if (l.includes("faturado")||l.includes("aprovado")) return "#10b981";
  if (l.includes("enviado")||l.includes("entregue")) return "#3b82f6";
  return "#8b5cf6";
};

function Badge({label, color}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{label}</span>;
}
function Stat({label, value, color="#e2e8f0", sub}) {
  return (
    <div style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"12px 14px"}}>
      <div style={{color:"#4a6a8a",fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{label}</div>
      <div style={{color,fontWeight:700,fontSize:20}}>{value}</div>
      {sub && <div style={{color:"#4a6a8a",fontSize:11,marginTop:3}}>{sub}</div>}
    </div>
  );
}
function Row({k,v,vc="#cbd5e1"}) {
  return (
    <div style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #0d1f3566"}}>
      <span style={{color:"#4a6a8a",minWidth:95,fontSize:12,flexShrink:0}}>{k}</span>
      <span style={{color:vc,fontSize:12,wordBreak:"break-word"}}>{v||"—"}</span>
    </div>
  );
}
function WarnBox({msg,level="warn"}) {
  const c = level==="err" ? "#ef4444" : "#f59e0b";
  return <div style={{background:c+"15",border:`1px solid ${c}33`,borderRadius:6,padding:"8px 13px",color:c,fontSize:12,marginTop:7}}>⚠ {msg}</div>;
}
function RichText({text}) {
  return (
    <div style={{lineHeight:1.65,color:"#94a3b8",fontSize:13}}>
      {text.split("\n").map((line,i)=>(
        <div key={i} style={{marginBottom:2}}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((p,j)=>
            p.startsWith("**")&&p.endsWith("**")
              ? <strong key={j} style={{color:"#e2e8f0"}}>{p.slice(2,-2)}</strong>
              : <span key={j}>{p}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Result blocks ─────────────────────────────────────────────────────────────
function ResultBlock({result}) {
  if (!result) return null;

  if (result.type === "orders") {
    const {pedidos,total,porSit,periodo} = result;
    const semRastreio = pedidos.filter(p=>{ const pd=p?.pedido??p; return !pd.codigo_rastreamento&&(pd.situacao||"").toLowerCase().includes("enviado"); }).length;
    const emAberto = pedidos.filter(p=>{ const s=(p?.pedido??p).situacao?.toLowerCase()||""; return s.includes("aberto")||s.includes("pendente"); }).length;
    return (
      <div style={{marginTop:10}}>
        {periodo && <div style={{color:"#4a6a8a",fontSize:11,marginBottom:8}}>Período: {periodo}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:12}}>
          <Stat label="Pedidos" value={pedidos.length} color="#38bdf8" />
          <Stat label="Total" value={fmt(total)} color="#34d399" />
          {Object.entries(porSit).map(([s,n])=><Stat key={s} label={s} value={n} color={sitColor(s)} />)}
        </div>
        {pedidos.length === 0
          ? <div style={{color:"#4a6a8a",padding:"12px 0",fontSize:13}}>Nenhum pedido encontrado.</div>
          : <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {pedidos.slice(0,50).map((p,i)=>{
                const pd=p?.pedido??p;
                return (
                  <div key={i} style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:7,padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:"7px 16px",alignItems:"center"}}>
                    <span style={{color:"#38bdf8",fontWeight:700,fontSize:13,minWidth:60}}>#{pd.numero}</span>
                    <span style={{color:"#cbd5e1",flex:1,minWidth:120,fontSize:13}}>{pd.nome||"—"}</span>
                    <span style={{color:"#34d399",fontWeight:700,fontSize:13}}>{fmt(pd.valor)}</span>
                    <Badge label={pd.situacao||"—"} color={sitColor(pd.situacao)} />
                    <span style={{color:"#4a6a8a",fontSize:11}}>{pd.data_pedido||""}</span>
                    {pd.nome_vendedor&&<span style={{color:"#64748b",fontSize:11}}>👤 {pd.nome_vendedor}</span>}
                    {pd.codigo_rastreamento&&<span style={{color:"#a78bfa",fontSize:11}}>🚚 {pd.codigo_rastreamento}</span>}
                  </div>
                );
              })}
            </div>
        }
        {semRastreio>0&&<WarnBox msg={`${semRastreio} pedido(s) enviado(s) sem rastreio`} />}
        {emAberto>0&&<WarnBox msg={`${emAberto} pedido(s) em aberto`} level="err" />}
      </div>
    );
  }

  if (result.type === "order_detail") {
    const p = result.pedido;
    if (!p) return <div style={{color:"#ef4444",fontSize:13,marginTop:8}}>Pedido não encontrado.</div>;
    const itens = p.itens ?? [];
    return (
      <div style={{marginTop:10}}>
        <div style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"14px 16px",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{color:"#38bdf8",fontWeight:700,fontSize:15}}>#{p.numero}</span>
            <Badge label={p.situacao||"—"} color={sitColor(p.situacao)} />
          </div>
          <Row k="Cliente"  v={p.nome} />
          <Row k="Data"     v={p.data_pedido} />
          <Row k="Valor"    v={fmt(p.valor)} vc="#34d399" />
          <Row k="Vendedor" v={p.nome_vendedor} />
          {p.codigo_rastreamento&&<Row k="Rastreio" v={p.codigo_rastreamento} vc="#a78bfa" />}
          {p.observacoes&&<Row k="Obs" v={p.observacoes} />}
        </div>
        {itens.length>0&&(
          <div style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"12px 16px"}}>
            <div style={{color:"#4a6a8a",fontSize:10,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Itens</div>
            {itens.map((it,i)=>{
              const item=it?.item??it;
              return (
                <div key={i} style={{display:"flex",gap:12,padding:"6px 0",borderBottom:"1px solid #1a335422",alignItems:"center"}}>
                  <span style={{color:"#4a6a8a",width:22,fontSize:12}}>{i+1}.</span>
                  <span style={{color:"#cbd5e1",flex:1,fontSize:13}}>{item.descricao||item.nome||"?"}</span>
                  <span style={{color:"#64748b",fontSize:12}}>{item.quantidade}×</span>
                  <span style={{color:"#34d399",fontWeight:600,fontSize:13}}>{fmt(item.valor)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (result.type === "receivable" || result.type === "payable") {
    const isRec = result.type==="receivable";
    const {contas,total,vencidas} = result;
    return (
      <div style={{marginTop:10}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:12}}>
          <Stat label="Títulos" value={contas.length} />
          <Stat label="Total" value={fmt(total)} color={isRec?"#34d399":"#f87171"} />
          {isRec&&vencidas>0&&<Stat label="⚠ Vencidas" value={vencidas} color="#f87171" />}
        </div>
        {contas.length===0
          ? <div style={{color:"#4a6a8a",fontSize:13}}>Nenhum título encontrado.</div>
          : contas.slice(0,30).map((c,i)=>{
              const ct=c?.conta??c;
              const isVenc=(()=>{ const v=ct.vencimento; if(!v)return false; const parts=v.split("/"); if(parts.length!==3)return false; const [d,mo,y]=parts; const dt=new Date(parseInt(y),parseInt(mo)-1,parseInt(d)); return !isNaN(dt.getTime())&&dt<nowSP(); })();
              return (
                <div key={i} style={{background:"#0d1f35",border:`1px solid ${isVenc?"#7f1d1d44":"#1a3354"}`,borderRadius:7,padding:"9px 13px",marginBottom:5,display:"flex",flexWrap:"wrap",gap:"8px 16px",alignItems:"center"}}>
                  <span style={{color:isRec?"#34d399":"#f87171",fontWeight:700,fontSize:13}}>{fmt(ct.valor)}</span>
                  <span style={{color:"#cbd5e1",flex:1,minWidth:100,fontSize:13}}>{ct.nome||ct.cliente||ct.fornecedor||"—"}</span>
                  <span style={{color:isVenc?"#f87171":"#64748b",fontSize:11}}>Venc: {ct.vencimento||"—"}{isVenc?" ⚠":""}</span>
                  <span style={{color:"#4a6a8a",fontSize:11}}>{ct.situacao||"—"}</span>
                </div>
              );
            })
        }
      </div>
    );
  }

  if (result.type === "dashboard") {
    const {pedidos,receber,pagar} = result;
    const tPed=pedidos.reduce((s,p)=>s+parseFloat(p?.pedido?.valor||0),0);
    const tRec=receber.reduce((s,c)=>s+parseFloat(c?.conta?.valor||0),0);
    const tPag=pagar.reduce((s,c)=>s+parseFloat(c?.conta?.valor||0),0);
    const semRastreio=pedidos.filter(p=>!p?.pedido?.codigo_rastreamento&&(p?.pedido?.situacao||"").toLowerCase().includes("enviado")).length;
    const recVenc=receber.filter(c=>{ const v=c?.conta?.vencimento; if(!v)return false; const parts=v.split("/"); if(parts.length!==3)return false; const [d,mo,y]=parts; const dt=new Date(parseInt(y),parseInt(mo)-1,parseInt(d)); return !isNaN(dt.getTime())&&dt<nowSP(); }).length;
    return (
      <div style={{marginTop:10}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
          <Stat label="Pedidos Hoje"     value={pedidos.length} color="#38bdf8" sub={fmt(tPed)} />
          <Stat label="A Receber (sem.)" value={receber.length} color="#34d399" sub={fmt(tRec)} />
          <Stat label="A Pagar (7 dias)" value={pagar.length}   color="#f87171" sub={fmt(tPag)} />
        </div>
        {semRastreio>0&&<WarnBox msg={`${semRastreio} pedido(s) enviado(s) sem rastreio`} />}
        {recVenc>0&&<WarnBox msg={`${recVenc} título(s) a receber vencido(s)`} level="err" />}
        <div style={{color:"#4a6a8a",fontSize:10,marginTop:8}}>
          Atualizado {new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}
        </div>
      </div>
    );
  }

  if (result.type === "info") {
    return (
      <div style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"14px 16px",marginTop:10}}>
        <div style={{color:"#38bdf8",fontWeight:700,marginBottom:8,fontSize:13}}>🔌 INFO DA CONTA</div>
        <pre style={{color:"#94a3b8",margin:0,overflowX:"auto",fontSize:11,lineHeight:1.5}}>{JSON.stringify(result.data,null,2)}</pre>
      </div>
    );
  }

  return null;
}

// ─── Quick actions ─────────────────────────────────────────────────────────────
const QUICK = [
  {icon:"📦", label:"Hoje",        msg:"pedidos de hoje"},
  {icon:"📋", label:"Pendentes",   msg:"pedidos pendentes"},
  {icon:"📅", label:"Semana",      msg:"pedidos desta semana"},
  {icon:"💰", label:"A Receber",   msg:"contas a receber esta semana"},
  {icon:"💳", label:"A Pagar",     msg:"contas a pagar"},
  {icon:"📊", label:"Dashboard",   msg:"resumo gerencial"},
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role:"assistant",
      text:`Olá! Sou seu **Copiloto Tiny ERP** ⚡\n\nDigite o que precisa ou use os atalhos abaixo.\nHoje é **${today()}** (fuso: America/Sao_Paulo)`,
      result:null
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function send(msg) {
    if (!msg.trim()||loading) return;
    setMessages(prev=>[...prev,{role:"user",text:msg,result:null}]);
    setInput("");
    setLoading(true);
    try {
      const intent = parseIntent(msg);
      if (intent.type==="unknown") {
        setMessages(prev=>[...prev,{role:"assistant",text:'Não reconheci o comando. Exemplos:\n- **"pedidos de hoje"**\n- **"contas a receber vencidas"**\n- **"pedido 12345"**\n- **"resumo gerencial"**',result:null}]);
        setLoading(false);
        return;
      }
      const result = await executeIntent(intent);
      let summary = "";
      if (result.type==="orders")       summary = result.pedidos.length===0 ? "Nenhum pedido encontrado." : `**${result.pedidos.length} pedido(s)** — total **${fmt(result.total)}**`;
      else if (result.type==="order_detail") summary = result.pedido ? `Pedido **#${result.pedido.numero}** — ${result.pedido.nome||""} — **${fmt(result.pedido.valor)}**` : "Pedido não encontrado.";
      else if (result.type==="receivable")   summary = `**${result.contas.length} título(s)** a receber — **${fmt(result.total)}**${result.vencidas?`\n⚠ **${result.vencidas} vencido(s)**`:""}`;
      else if (result.type==="payable")      summary = `**${result.contas.length} título(s)** a pagar — **${fmt(result.total)}**`;
      else if (result.type==="dashboard")    summary = `Dashboard de **${today()}** carregado.`;
      else if (result.type==="info")         summary = "Dados da conta retornados abaixo.";
      setMessages(prev=>[...prev,{role:"assistant",text:summary,result}]);
    } catch(e) {
      setMessages(prev=>[...prev,{role:"assistant",text:`❌ Erro: **${e.message}**\n\nVerifique se a variável **TINY_TOKEN** está configurada na Vercel.`,result:null}]);
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"#060e1a",display:"flex",flexDirection:"column",fontFamily:"'IBM Plex Mono',monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .qbtn:hover{background:#0d1f35!important;border-color:#38bdf8!important;color:#38bdf8!important}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#060e1a} ::-webkit-scrollbar-thumb{background:#1a3354;border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{background:"#08111f",borderBottom:"2px solid #0e2540",padding:"13px 20px",display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
        <div style={{width:38,height:38,borderRadius:9,background:"linear-gradient(135deg,#0ea5e9,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 0 20px #0ea5e944"}}>⚡</div>
        <div>
          <div style={{color:"#e2e8f0",fontWeight:700,fontSize:14,letterSpacing:"0.07em"}}>TINY ERP AGENT</div>
          <div style={{color:"#2563eb",fontSize:9,letterSpacing:"0.17em",marginTop:1}}>COPILOTO OPERACIONAL · {today()}</div>
        </div>
        <div style={{marginLeft:"auto",background:"#0d1f35",border:"1px solid #1a3354",borderRadius:6,padding:"5px 12px",display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
          <span style={{color:"#22c55e",fontSize:10,letterSpacing:"0.08em"}}>ONLINE</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{background:"#08111f",borderBottom:"1px solid #0e2540",padding:"8px 16px",display:"flex",gap:6,overflowX:"auto",flexShrink:0}}>
        {QUICK.map((q,i)=>(
          <button key={i} className="qbtn" onClick={()=>send(q.msg)}
            style={{background:"transparent",border:"1px solid #1a3354",borderRadius:5,color:"#64748b",fontSize:11,padding:"5px 13px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",transition:"all .15s"}}>
            {q.icon} {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:16}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:9,flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-start",animation:"fadein .25s ease"}}>
            <div style={{width:28,height:28,borderRadius:6,background:m.role==="user"?"#1d4ed8":"#0369a1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginTop:2}}>
              {m.role==="user"?"U":"⚡"}
            </div>
            <div style={{maxWidth:"90%",minWidth:0}}>
              <div style={{background:m.role==="user"?"#0f1f3d":"#0d1f35",border:`1px solid ${m.role==="user"?"#1d4ed833":"#1a3354"}`,borderRadius:8,padding:"10px 14px"}}>
                <RichText text={m.text}/>
              </div>
              {m.result&&<ResultBlock result={m.result}/>}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:9,alignItems:"center",animation:"fadein .2s"}}>
            <div style={{width:28,height:28,borderRadius:6,background:"#0369a1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⚡</div>
            <div style={{background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:14,height:14,border:"2px solid #0ea5e9",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              <span style={{color:"#38bdf8",fontSize:13}}>Consultando Tiny ERP...</span>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{background:"#08111f",borderTop:"2px solid #0e2540",padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,background:"#0d1f35",border:"1px solid #1a3354",borderRadius:8,padding:"6px 6px 6px 14px"}}>
          <input
            value={input}
            maxLength={500}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(input); }}}
            placeholder='"pedidos de hoje" · "contas vencidas" · "pedido 15421"'
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#e2e8f0",fontSize:13,fontFamily:"inherit"}}
          />
          <button onClick={()=>send(input)} disabled={loading||!input.trim()}
            style={{background:loading||!input.trim()?"#0d1f35":"linear-gradient(135deg,#0ea5e9,#2563eb)",border:`1px solid ${loading||!input.trim()?"#1a3354":"transparent"}`,borderRadius:6,color:loading||!input.trim()?"#334155":"#fff",padding:"7px 18px",cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all .15s"}}>
            ENVIAR ↵
          </button>
        </div>
        <div style={{color:"#0e2540",fontSize:9,textAlign:"center",marginTop:4,letterSpacing:"0.1em"}}>
          TINY API · VERCEL SERVERLESS · FUSO: AMERICA/SAO_PAULO
        </div>
      </div>
    </div>
  );
}
