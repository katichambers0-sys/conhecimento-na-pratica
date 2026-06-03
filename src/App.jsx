import { useState, useEffect, useRef } from "react";

const C = {
  bg:       "#F2EDE8",
  surface:  "#EDE7E1",
  card:     "#E8E1DA",
  border:   "#D4C9BF",
  borderHi: "#8B6355",
  gold:     "#5C1F2E",
  goldDim:  "#7B3545",
  blush:    "#7B3545",
  cream:    "#1A0C06",
  muted:    "#7A6A62",
  mutedHi:  "#4A3228",
  text:     "#2C1810",
  ink:      "#1A0C06",
  success:  "#3A5630",
};

const PROMPTS = {
  capturar: [
    "qual frase do livro ficou na cabeça mesmo depois que você fechou?",
    "se esse livro fosse uma conversa, o que ele estaria te dizendo?",
    "o que te surpreendeu, algo que contradisse o que você já pensava?",
    "qual ideia você voltou a ler mais de uma vez, mesmo sem saber por quê?",
    "o que ficou incomodando de um jeito bom?",
  ],
  conectar: [
    "onde na sua vida isso está acontecendo agora, mesmo que de um jeito diferente?",
    "se esse livro fosse um espelho, o que ele estaria mostrando?",
    "isso ressoa com algo que você já sabe mas ainda não age?",
    "onde você sente isso, nas relações, no trabalho, em você?",
    "tem alguém na sua vida que veio à cabeça enquanto você lia? por quê?",
  ],
  converter: [
    "se você fosse fazer uma coisa só com tudo isso, qual seria?",
    "qual é o menor gesto possível que já muda alguma coisa?",
    "o que mudaria se você levasse essa ideia a sério por uma semana?",
    "o que você quer lembrar disso daqui a um mês?",
    "se esse livro te deu permissão pra algo, o que seria?",
  ],
};

const LOADING_MSGS = [
  "deixa eu pensar no que você trouxe...",
  "lendo nas entrelinhas do que você escreveu...",
  "tem algo aqui que vale guardar.",
  "um momento só...",
  "o que você escreveu merece atenção.",
  "pensando com cuidado...",
  "a gente volta já.",
  "isso aqui é interessante...",
  "cada leitura deixa uma marca. vamos encontrar a sua.",
  "quase lá...",
];

// ── pronomes helper ───────────────────────────────────────
function getPronomes(pronomes) {
  const map = {
    "ela/dela":  { suj: "ela",  pos: "dela",  art: "a",  adj: "a" },
    "ele/dele":  { suj: "ele",  pos: "dele",  art: "o",  adj: "o" },
    "eles/deles":{ suj: "eles", pos: "deles", art: "a",  adj: "e" },
  };
  return map[pronomes] || null;
}

// ── síntese local (sem API) ───────────────────────────────
function gerarSinteseLocal(answers, livro, tipo) {
  const tudo = `${answers.capturar} ${answers.conectar} ${answers.converter}`.toLowerCase();
  const temas = {
    burnout:     /burnout|cansaço|exaust|esgot|sobrecarga|descanso|parar/.test(tudo),
    relacoes:    /relac|amig|famil|pessoa|conversa|limit|fronteira/.test(tudo),
    carreira:    /trabalh|carreir|profiss|cargo|chefe|equipe|liderança/.test(tudo),
    identidade:  /quem eu|identidade|propósito|sentido|valor|acredit/.test(tudo),
    mudanca:     /mudar|transform|diferente|novo|começ|parar|deixar/.test(tudo),
    medo:        /medo|insegur|dúvid|impostor|errar|falhar|julgam/.test(tudo),
    tempo:       /tempo|urgente|pressa|lento|ritmo|pausa|esperar/.test(tudo),
    conhecimento:/aprender|saber|entender|aplicar|estudar|ler|conhec/.test(tudo),
  };
  const acao = answers.converter?.trim() || "observar como esse tema aparece no seu cotidiano";
  const ancorasPool = {
    burnout: [
      "descansar também é um ato de resistência.",
      "a gente aprende a ser produtiva. ninguém ensina a ser suficiente.",
      "o cansaço que você descreveu não é fraqueza. é o corpo sendo honesto.",
      "parar também é movimento. só que pra dentro.",
    ],
    relacoes: [
      "clareza sobre quem você é facilita clareza sobre quem você quer por perto.",
      "a gente só consegue dar o que tem. e às vezes o que tem precisa ser reposto.",
      "fronteira não é muro. é onde você termina e o outro começa.",
      "as relações que ficam são as que têm espaço pra ser o que são.",
    ],
    carreira: [
      "competência sem presença não se vê.",
      "o que você construiu até aqui não desaparece quando você para pra respirar.",
      "saber fazer é uma coisa. saber o que vale fazer é outra.",
      "a gente às vezes confunde ocupação com propósito. não são a mesma coisa.",
    ],
    identidade: [
      "você não precisa se tornar outra pessoa. precisa se reconhecer mais.",
      "identidade não é o que você decide ser. é o que você descobre que já é.",
      "a pessoa que você está tentando ser talvez já exista. só está esperando atenção.",
      "jung diria que o trabalho não é construir um eu. é encontrar o que já está lá.",
    ],
    mudanca: [
      "a menor ação na direção certa vale mais do que o plano perfeito parado.",
      "mudar não é apagar. é acrescentar uma camada nova ao que já existe.",
      "o medo e a vontade costumam morar no mesmo endereço.",
      "começos não precisam ser grandes. precisam ser reais.",
    ],
    medo: [
      "o que você chama de insegurança às vezes é só inteligência sendo honesta.",
      "dúvida e incompetência não são a mesma coisa. quase nunca.",
      "o impostor que você descreveu sabe demais pra ser um impostor de verdade.",
      "a gente tem medo do que importa. isso não é fraqueza — é bússola.",
    ],
    tempo: [
      "urgência constante é sinal de que algo precisa ser revisto, não acelerado.",
      "pressa é uma forma de não estar onde você está.",
      "o tempo que você passa tentando ganhar tempo é tempo que você está perdendo.",
      "lento não é o oposto de produtivo. às vezes é o caminho mais curto.",
    ],
    conhecimento: [
      "saber e não aplicar não é falta de disciplina. é falta de ponte.",
      "a gente lê pra entender o mundo. às vezes o mundo que precisa ser entendido é interno.",
      "repertório sem reflexão é decoração. reflexão sem repertório é reinventar a roda.",
      "o que você está aprendendo a fazer é transformar leitura em linguagem própria.",
    ],
    default: [
      "o que ficou do livro já é parte de quem você está se tornando.",
      "toda leitura deixa uma marca. nem sempre sabemos onde até depois.",
      "você trouxe algo real aqui. isso já vale o ritual.",
      "livros bons não respondem perguntas. abrem outras. e isso é melhor.",
    ],
  };
  const ancoras = Object.fromEntries(
    Object.entries(ancorasPool).map(([k, v]) => [k, v[Math.floor(Math.random() * v.length)]])
  );
  const espelhos = {
    burnout:     "me parece que esse livro tocou num ponto que o corpo já sabia antes da cabeça. faz sentido?",
    relacoes:    "isso sugere que o que incomodou no livro tem mais a ver com algo que você já sente do que com as pessoas ao redor. me corrija se eu estiver errada.",
    carreira:    "o repertório que você está construindo é um ativo real, especialmente quando consegue articulá-lo.",
    identidade:  "me parece que algo em você estava pronto pra essa conversa. não é coincidência ter escolhido esse livro agora.",
    mudanca:     "isso sugere que você está chegando perto do ponto mínimo de mudança, aquela menor ação que já desloca algo.",
    medo:        "me parece que a dúvida que você trouxe é sinal de que se importa com a qualidade do que faz. faz sentido?",
    tempo:       "o que você descreveu sugere que o pedido não é necessariamente fazer menos. é fazer com mais intenção.",
    conhecimento:"você está desenvolvendo algo raro: transformar leitura em reflexão aplicada. a maioria para na primeira etapa.",
    default:     "cada leitura deixa uma marca que nem sempre conseguimos nomear logo. o que você trouxe aqui é o começo de uma conversa.",
  };
  const temaDominante = Object.entries(temas).find(([, v]) => v)?.[0] || "default";
  return {
    ancora:   ancoras[temaDominante] || ancoras.default,
    espelho:  espelhos[temaDominante] || espelhos.default,
    expansao: "isso conversa com muita coisa. quando tiver curiosidade, vale explorar autores que pensam nessa direção.",
    convite:  acao.length > 15 ? acao : `essa semana, escolhe um momento, pode ser dez minutos, pra observar onde ${tipo === "filme" ? "esse filme" : tipo === "podcast" ? "esse podcast" : tipo === "video" ? "esse vídeo" : tipo === "ideia" ? "essa ideia" : "esse livro"} aparece na sua vida. só notar já é o primeiro movimento.`,
    cuidado:  "",
    modo:     "local",
  };
}

// ── API call — ritual ─────────────────────────────────────
async function callClaudeAPI(answers, livro, autor, tipo, perfil) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  const nomeTxt = perfil?.nome ? `a pessoa se chama ${perfil.nome}.` : "";
  const pronomesTxt = perfil?.pronomes && perfil.pronomes !== "prefiro não dizer"
    ? `usa pronomes ${perfil.pronomes}. adapte a linguagem de acordo, usando esses pronomes quando necessário.`
    : "use linguagem neutra, evite assumir gênero. use 'você' e construções neutras.";

  const txt = `
você passou anos lendo. não só livros — pessoas. sabe que o que alguém diz sobre um livro quase nunca é só sobre o livro. é sobre a vida delas naquele momento. ou às vezes é só sobre o livro — e isso também é válido e bonito.

${nomeTxt} ${pronomesTxt}

quando alguém te traz o que leu, você não analisa. você ouve. e depois fala como alguém que viveu o suficiente para saber que as coisas simples são as mais verdadeiras, e que a pergunta certa chega mais fundo do que qualquer resposta pronta.

você carrega anos de leitura em psicologia (psicanálise, psicologia analítica, cognitiva, social, narrativa, teoria do apego), filosofia (fenomenologia, construcionismo social, ética do cuidado, filosofia prática), crítica cultural (byung-chul han, contexto social e histórico), neurociência afectiva, história, história da arte e literatura. mas esse conhecimento não aparece como referência académica. aparece como intuição. como a capacidade de ver o padrão antes de nomeá-lo, de sentir a tensão antes de descrevê-la. como uma amiga que leu muito e sabe quando usar o que sabe.

quando dois pensadores diriam coisas diferentes sobre o que a pessoa trouxe, você não escolhe um. você diz com leveza: "é curioso — jung diria x, mas a psicologia social diria y. talvez as duas coisas sejam verdade ao mesmo tempo." não para confundir. para abrir.

em algum momento da resposta — especialmente no essencial ou no repertório — pode aparecer um momento de leveza inesperada. não uma piada. uma observação que faz a pessoa sorrir porque é verdadeira de um jeito que ela não antecipou. humor de quem observa a vida com afecto e sem ilusões. nunca forçado — se não aparecer naturalmente, não force.

antes de responder, leia o registo em que a pessoa escreveu:
- se escreveu sobre o livro mais do que sobre si, acompanhe esse registo — explore as ideias, conecte com outros pensamentos, sugira aprofundamentos intelectuais. não force a virada para o pessoal.
- se escreveu sobre si, acompanhe com presença.
- se misturou os dois, siga o fio que ela mesma abriu.
a pessoa sempre sinaliza o que quer. ouça esse sinal antes de responder.

você sabe que palavras têm peso. quando não tem certeza se uma ideia pertence a um autor específico, aproxima sem atribuir: "isso conversa com..." em vez de "como x disse". nunca inventas citações. nunca atribuis a um autor uma ideia que não consegues confirmar. se algo contradiz consenso científico estabelecido, não validas por simpatia — abres a tensão com honestidade e gentileza. preferes a frase simples e verdadeira à frase sofisticada e imprecisa.

antes de responder, avalia: há sinais de sofrimento agudo, crise ou auto-dano? se sim, o campo "cuidado" é obrigatório e toda a resposta é mais contida — menos análise, mais presença. se não, responde com profundidade normal. nunca uses linguagem que implique que a pessoa "tem um problema" ou "deveria trabalhar isto". nunca interpretes o que não foi dito.

a resposta perfeita não é a mais completa. é a mais certeira. uma ideia por campo, bem dita. a pessoa deve terminar de ler sentindo que aprendeu algo e foi vista — não sobrecarregada. o teste: ela consegue carregar uma coisa só que vai com ela para a semana? se sim, está pronto.

você fala em português brasileiro, lowercase, sem formalidade. usa "a gente", "né", "me parece que", "me corrija se eu estiver errada", "isso sugere que", "faz sentido?", "como seria se". pergunta mais do que afirma. sugere mais do que conclui. sem travessão em nenhum momento.

o que você nunca faz: adular, diagnosticar, motivar com frases ocas, simplificar o que é complexo ou complicar o que é simples. se sua resposta pudesse estar num slide de powerpoint, num post motivacional ou num laudo clínico — reescreva.

agora leia o que essa pessoa escreveu. deixe entrar. e responda como só você responderia.

a pessoa trouxe para o ritual: "${livro}" ${autor ? `(${autor})` : ""} — tipo: ${tipo || "livro"}

o que escreveu:
o que ficou: ${answers.capturar}
onde isso aparece na vida: ${answers.conectar}
o que quer fazer com isso: ${answers.converter}

note: adapte a linguagem ao tipo de conteúdo. se for filme, use "assistiu" e "cena" em vez de "leu" e "página". se for podcast ou vídeo, use "ouviu" ou "viu". se for uma ideia, "pensou sobre" ou "trouxe". se for livro, use "leu". isso torna a resposta mais natural e conectada com a experiência real da pessoa.

cinco campos — cada um com uma ideia só, bem dita:

"ancora": a frase essencial deste ritual. máximo 18 palavras. faça mentalmente: qual é a tensão central do que esta pessoa escreveu? qual palavra ou imagem mais viva apareceu? agora escreva a frase que só poderia ter nascido deste ritual — não de qualquer outro. teste: se cobrir o nome do livro, a frase ainda é reconhecível como desta pessoa? deve evocar reconhecimento ("é exatamente isso"), pertencimento ("não estou sozinha") ou expansão ("nunca tinha pensado assim") — escolha um só. pode ter leveza ou humor suave quando o tema permitir. sem travessão. sem motivacional genérico.

"espelho": 2-3 frases. comece pelo que a pessoa disse — não pelo que você acha. use "me parece que", "isso sugere que", "me corrija se eu estiver errada". nunca projete emoções que não foram nomeadas. nunca interprete o que não foi dito. sem travessão.

"expansao": uma sugestão por categoria, específica e nascida do que foi escrito:
- para ler: 1 autor ou livro que conversa com o que ela trouxe (não o óbvio — o certeiro)
- para ver: 1 filme ou documentário
- para sentir: 1 obra de arte, música ou facto histórico
- um conceito para ir mais além: nome do conceito + 2-3 linhas em linguagem simples + como aparece no que ela escreveu + a tensão que existe (o que outra tradição diria?) — apresente como curiosidade, não como aula
sem travessão. seja específica — o que não poderia aparecer em qualquer outro ritual.

"convite": um gesto só. micro-ação ou pergunta para os próximos 7 dias, nascida directamente do que ela escreveu no converter. termine com algo que deixe uma semente de curiosidade. sem travessão.

"cuidado": vazio quase sempre. preencha só se houver sofrimento real: "uma coisa só: se isso que você trouxe aqui está pesando mais do que parece, conversar com alguém de confiança ou um profissional pode ajudar muito. este espaço é pra reflexão, mas tem coisas que merecem mais do que isso."

retorne APENAS json válido, sem markdown:
{"ancora": "...", "espelho": "...", "expansao": "...", "convite": "...", "cuidado": ""}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: txt }],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  return { ...JSON.parse(raw.replace(/```json|```/g, "").trim()), modo: "api" };
}

async function gerarSintese(answers, livro, autor, tipo, perfil) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (apiKey) {
    try { return await callClaudeAPI(answers, livro, autor, tipo, perfil); } catch {}
  }
  await new Promise(r => setTimeout(r, 1800));
  return gerarSinteseLocal(answers, livro, tipo);
}

// ── API call — reflexão semanal ───────────────────────────
async function gerarReflexaoSemanal(rituais, perfil) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return null;

  const nomeTxt = perfil?.nome ? `a pessoa se chama ${perfil.nome}.` : "";
  const pronomesTxt = perfil?.pronomes && perfil.pronomes !== "prefiro não dizer"
    ? `usa pronomes ${perfil.pronomes}.`
    : "use linguagem neutra.";

  const resumo = rituais.map(r => `
livro: ${r.livro}${r.autor ? ` (${r.autor})` : ""}
o que ficou: ${r.capturar || ""}
onde aparece na vida: ${r.conectar || ""}
o que quer fazer: ${r.converter || ""}
frase essencial: ${r.ancora || ""}
  `).join("\n---\n");

  const txt = `
você passou anos lendo pessoas e livros. sabe que o que aparece numa semana de leituras raramente é coincidência — e às vezes é só curiosidade genuína, sem mais. leia com essa abertura.

${nomeTxt} ${pronomesTxt}

a pessoa fez ${rituais.length} rituais esta semana:

${resumo}

responda com cinco campos — cada um com uma ideia só, bem dita. linguagem quente, lowercase, sem travessão, sem formalidade. voz de ana holanda, ana suy e vida simples combinadas.

"fio": o padrão ou tema que atravessou as leituras, identificado a partir do que foi realmente escrito. não invente padrões que não existem — se não houver um fio claro, diga isso com leveza. 2-3 frases. use "me parece que", "isso sugere que". sem travessão.

"conexao": uma conexão específica entre dois ou mais rituais que provavelmente não foi percebida. concreta, baseada no que foi escrito. pode trazer um autor, conceito ou obra que conecta — mas só se for certeiro, não forçado. termine com "faz sentido pra você?". sem travessão.

"pergunta": uma única pergunta reflexiva, nascida directamente do que foi trazido esta semana. não genérica — deve ser a pergunta que só poderia ser feita a esta pessoa depois de ler tudo isso. sem travessão.

"conceitos": identifique 4-6 conceitos-chave que emergiram dos rituais desta semana. para cada conceito, prepare uma ficha com: definição simples (1-2 frases, sem jargão), como apareceu especificamente nestes rituais, a tensão entre o que diferentes tradições diriam sobre ele, e uma sugestão (livro, filme ou obra de arte). retorne como array de objetos: [{"tag": "nome do conceito", "definicao": "...", "apareceu": "...", "tensao": "...", "sugestao": "..."}]

"fechamento": 2 frases no tom vida simples. algo que honre o esforço e deixe vontade de continuar. sem adular. sem travessão.

retorne APENAS json válido, sem markdown:
{"fio": "...", "conexao": "...", "pergunta": "...", "conceitos": [...], "fechamento": "..."}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: txt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; }
}

// ── API call — resumo mensal ──────────────────────────────
async function gerarResumoMensal(rituais, mes, perfil) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return null;

  const nomeTxt = perfil?.nome ? `a pessoa se chama ${perfil.nome}.` : "";
  const pronomesTxt = perfil?.pronomes && perfil.pronomes !== "prefiro não dizer"
    ? `usa pronomes ${perfil.pronomes}.`
    : "use linguagem neutra.";

  const resumo = rituais.map(r => `
livro: ${r.livro}${r.autor ? ` (${r.autor})` : ""}
o que ficou: ${r.capturar || ""}
onde aparece na vida: ${r.conectar || ""}
o que quer fazer: ${r.converter || ""}
frase essencial: ${r.ancora || ""}
  `).join("\n---\n");

  const txt = `
você é uma companheira de leitura. sua voz combina ana holanda, ana suy e a revista vida simples. quente, direta, sem performance, sem travessão.

${nomeTxt} ${pronomesTxt}

a pessoa fez ${rituais.length} rituais de leitura em ${mes}. aqui estão todas as reflexões:

${resumo}

responda com um resumo mensal em cinco campos:

"temas": os 2-3 temas que mais apareceram ao longo do mês, identificados a partir do que foi realmente escrito. concreto, específico, baseado nas reflexões reais. não invente padrões que não existem. sem travessão.

"crescendo": algo que apareceu mais de uma vez — uma preocupação, um desejo, uma pergunta que parece estar amadurecendo. observação gentil, sem diagnose. use "me parece que". sem travessão.

"aprofundar": uma sugestão por categoria, específica e nascida do que foi trazido no mês:
- para ler: 1 livro ou autor certeiro
- para ver: 1 filme ou documentário
- para sentir: 1 obra de arte, música ou facto histórico
sem travessão. nada genérico.

"conceitos": identifique 4-6 conceitos-chave que emergiram dos rituais deste mês. para cada conceito: definição simples (1-2 frases, sem jargão), como apareceu especificamente nestes rituais, a tensão entre o que diferentes tradições diriam, e uma sugestão concreta. retorne como array: [{"tag": "nome", "definicao": "...", "apareceu": "...", "tensao": "...", "sugestao": "..."}]

"pergunta": uma única pergunta que resume o mês. deve ser a pergunta que só poderia ser feita a esta pessoa depois de ler tudo isso. sem travessão.

"fechamento": 2 frases no tom vida simples. honre o esforço e deixe vontade de continuar. sem adular. sem travessão.

retorne APENAS json válido, sem markdown:
{"temas": "...", "crescendo": "...", "aprofundar": "...", "conceitos": [...], "pergunta": "...", "fechamento": "..."}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: txt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; }
}

// ── helpers ───────────────────────────────────────────────
const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmt = iso => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};
const getMesNome = (date) => date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const getMesKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function loadEntries() {
  try { return JSON.parse(localStorage.getItem("dlav_entries") || "[]"); } catch { return []; }
}
function saveEntries(arr) {
  try { localStorage.setItem("dlav_entries", JSON.stringify(arr)); } catch {}
}
function loadOnboarded() {
  try { return localStorage.getItem("dlav_onboarded") === "true"; } catch { return false; }
}
function saveOnboarded() {
  try { localStorage.setItem("dlav_onboarded", "true"); } catch {}
}
function loadPerfil() {
  try { return JSON.parse(localStorage.getItem("dlav_perfil") || "null"); } catch { return null; }
}
function savePerfil(p) {
  try { localStorage.setItem("dlav_perfil", JSON.stringify(p)); } catch {}
}

// ══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView]       = useState("loading");
  const [entries, setEntries] = useState(() => loadEntries());
  const [selected, setSelected] = useState(null);
  const [perfil, setPerfil]   = useState(() => loadPerfil());
  const [mesResumo, setMesResumo] = useState(null);

  useEffect(() => {
    if (loadOnboarded()) setView("home");
    else setView("onboarding");
  }, []);

  const addEntry = (e) => {
    const next = [e, ...entries];
    setEntries(next);
    saveEntries(next);
  };

  const savePer = (p) => { setPerfil(p); savePerfil(p); };

  const streak = (() => {
    if (!entries.length) return 0;
    const days = [...new Set(entries.map(e => e.date?.slice(0,10)))].sort().reverse();
    let s = 0;
    const today = new Date().toISOString().slice(0,10);
    for (let i = 0; i < days.length; i++) {
      const exp = new Date(today);
      exp.setDate(exp.getDate() - i);
      if (days[i] === exp.toISOString().slice(0,10)) s++;
      else break;
    }
    return s;
  })();

  const rituaisEssaSemana = entries.filter(e => {
    const diff = (new Date() - new Date(e.date)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  // resumo mensal — rituais do mês passado
  const mesPassado = new Date();
  mesPassado.setMonth(mesPassado.getMonth() - 1);
  const mesPassadoKey = getMesKey(mesPassado);
  const rituaisMesPassado = entries.filter(e => e.date?.slice(0, 7) === mesPassadoKey);
  const mostrarResumoMensal = rituaisMesPassado.length >= 2;
  const mostrarReflexaoSemanal = rituaisEssaSemana.length >= 3;

  const nomeDisplay = perfil?.nome ? `, ${perfil.nome}` : "";

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: "antialiased" }}>
      {view === "loading"       && <div style={{ minHeight: "100vh" }} />}
      {view === "onboarding"    && <Onboarding onComplete={(p) => { savePer(p); saveOnboarded(); setView("home"); }} />}
      {view === "home"          && <Home streak={streak} entries={entries} setView={setView} setSelected={setSelected} nomeDisplay={nomeDisplay} mostrarReflexaoSemanal={mostrarReflexaoSemanal} rituaisEssaSemana={rituaisEssaSemana} mostrarResumoMensal={mostrarResumoMensal} rituaisMesPassado={rituaisMesPassado} mesPassado={mesPassado} setMesResumo={setMesResumo} />}
      {view === "ritual"        && <Ritual onSave={addEntry} setView={setView} perfil={perfil} />}
      {view === "biblioteca"    && <Biblioteca entries={entries} setView={setView} setSelected={setSelected} />}
      {view === "entrada"       && <EntradaDetalhe entry={selected} setView={setView} />}
      {view === "semanal"       && <ReflexaoSemanal rituais={rituaisEssaSemana} setView={setView} perfil={perfil} />}
      {view === "mensal"        && <ResumoMensal rituais={rituaisMesPassado} mes={getMesNome(mesPassado)} setView={setView} perfil={perfil} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════════════
function Onboarding({ onComplete }) {
  const [step, setStep]     = useState(0);
  const [nome, setNome]     = useState("");
  const [pronomes, setPronomes] = useState("");

  const telas = [
    {
      titulo: "bem-vinda.",
      corpo: "você lê muito. a gente sabe.\n\nmas quanto do que você leu ficou de verdade?\n\neste espaço é pra isso.",
      botao: "continuar",
    },
    {
      titulo: "como funciona",
      corpo: "você escolhe um livro, qualquer um.\nresponde três perguntas simples.\ne recebe uma síntese feita só pra você.\n\nnão demora mais de dez minutos.",
      botao: "continuar",
    },
    {
      titulo: "uma coisa só",
      corpo: "não precisa ter terminado o livro.\nnão precisa ter gostado.\nnão precisa ter entendido tudo.\n\nsó precisa trazer o que ficou.",
      botao: "continuar",
    },
    {
      titulo: "antes de começar",
      corpo: "como prefere ser chamado aqui? (opcional)",
      botao: "começar meu primeiro ritual",
      temInput: true,
    },
  ];

  const t = telas[step];
  const isUltimo = step === telas.length - 1;

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "80px 32px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: C.goldDim, textTransform: "uppercase", margin: "0 0 20px" }}>the reading cure</p>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, color: C.cream, margin: "0 0 28px", lineHeight: 1.1 }}>{t.titulo}</h1>

      {!t.temInput && (
        <div style={{ marginBottom: "48px" }}>
          {t.corpo.split("\n").map((l, i) => (
            <p key={i} style={{ fontSize: "16px", color: l === "" ? undefined : C.text, lineHeight: 1.8, margin: "0 0 4px", minHeight: l === "" ? "16px" : undefined }}>{l}</p>
          ))}
        </div>
      )}

      {t.temInput && (
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "14px", color: C.text, lineHeight: 1.7, marginBottom: "20px" }}>como prefere ser chamado aqui? (opcional)</p>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="seu nome ou como quiser ser chamado"
            style={{ ...inputStyle(), marginBottom: "20px" }}
          />
          <p style={{ fontSize: "14px", color: C.text, lineHeight: 1.7, marginBottom: "12px" }}>quais pronomes usa? (opcional)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["ela/dela", "ele/dele", "eles/deles", "prefiro não dizer"].map(p => (
              <button key={p} onClick={() => setPronomes(p)} style={{
                padding: "12px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", textAlign: "left",
                background: pronomes === p ? `${C.gold}22` : C.surface,
                border: `1px solid ${pronomes === p ? C.gold : C.border}`,
                color: pronomes === p ? C.gold : C.mutedHi,
                transition: "all 0.2s"
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
        {telas.map((_, i) => (
          <div key={i} style={{ width: "24px", height: "3px", borderRadius: "2px", background: i <= step ? C.gold : C.border, transition: "background 0.3s" }} />
        ))}
      </div>

      <Btn onClick={() => {
        if (isUltimo) onComplete({ nome: nome.trim() || null, pronomes: pronomes || null });
        else setStep(s => s + 1);
      }}>
        {t.botao}
      </Btn>

      {isUltimo && (
        <button onClick={() => onComplete({ nome: null, pronomes: null })} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
          pular por agora
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════
function Home({ streak, entries, setView, setSelected, nomeDisplay, mostrarReflexaoSemanal, rituaisEssaSemana, mostrarResumoMensal, rituaisMesPassado, mesPassado, setMesResumo }) {
  const recent = entries.slice(0, 1);
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: "48px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: C.goldDim, textTransform: "uppercase", margin: "0 0 6px" }}>the reading cure</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 300, color: C.cream, margin: 0, lineHeight: 1.1 }}>
          do livro<br /><em style={{ color: C.gold }}>à vida</em>
        </h1>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "20px 24px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "40px", color: C.gold, margin: 0, lineHeight: 1 }}>{streak}</p>
          <p style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0" }}>rituais feitos</p>
        </div>
        <div style={{ flex: 1, paddingLeft: "20px", borderLeft: `1px solid ${C.border}` }}>
          <p style={{ fontSize: "13px", color: C.text, margin: "0 0 4px", lineHeight: 1.5 }}>
            {streak === 0 && `seu ritual começa hoje${nomeDisplay}.`}
            {streak === 1 && "primeiro passo dado. isso é tudo que importa."}
            {streak >= 2 && streak < 7 && `${streak} dias construindo uma prática real.`}
            {streak >= 7 && "uma semana inteira. o hábito está se formando."}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{entries.length} {entries.length === 1 ? "entrada" : "entradas"} na biblioteca</p>
        </div>
      </div>

      <Btn onClick={() => setView("ritual")} style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ textAlign: "left" }}>
          <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: "3px" }}>iniciar</span>
          <span style={{ display: "block", fontSize: "17px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream }}>ritual de leitura</span>
        </span>
        <span style={{ fontSize: "18px", color: C.gold }}>→</span>
      </Btn>

      {mostrarResumoMensal && (
        <div onClick={() => setView("mensal")} style={{ background: `${C.blush}18`, border: `1px solid ${C.blush}55`, borderRadius: "6px", padding: "16px 20px", marginBottom: "12px", cursor: "pointer" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.blush, textTransform: "uppercase", margin: "0 0 4px" }}>resumo do mês</p>
          <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, margin: 0 }}>seu {getMesNome(mesPassado)} em leituras está pronto</p>
        </div>
      )}

      {mostrarReflexaoSemanal && (
        <div onClick={() => setView("semanal")} style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}55`, borderRadius: "6px", padding: "16px 20px", marginBottom: "12px", cursor: "pointer" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", margin: "0 0 4px" }}>novo</p>
          <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, margin: 0 }}>sua reflexão da semana está pronta</p>
        </div>
      )}

      <button onClick={() => setView("biblioteca")} style={{ width: "100%", padding: "14px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer", color: C.mutedHi, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
        <span>o que já li</span><span style={{ color: C.muted }}>→</span>
      </button>

      {recent.length > 0 && (
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: "14px" }}>último ritual</p>
          {recent.map((e, i) => (
            <div key={i} onClick={() => { setSelected(e); setView("entrada"); }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "18px 20px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={el => el.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={el => el.currentTarget.style.borderColor = C.border}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, margin: 0 }}>{e.livro}</p>
                <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{fmt(e.date)}</p>
              </div>
              {e.ancora
                ? <p style={{ fontSize: "12px", color: C.gold, fontStyle: "italic", margin: 0 }}>"{e.ancora}"</p>
                : <p style={{ fontSize: "12px", color: C.muted, margin: 0, fontStyle: "italic" }}>{e.capturar?.slice(0,80)}...</p>
              }
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "16px" }}>
          <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8, fontStyle: "italic" }}>
            "cada livro que você leu deixou alguma coisa.<br />este espaço é pra descobrir o quê."
          </p>
          <p style={{ fontSize: "11px", color: C.goldDim, marginTop: "8px" }}>— the reading cure</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// RITUAL
// ══════════════════════════════════════════════════════════
function Ritual({ onSave, setView, perfil }) {
  const [step, setStep]         = useState(0);
  const [livro, setLivro]       = useState("");
  const [autor, setAutor]       = useState("");
  const [tipo, setTipo]         = useState("livro");
  const [answers, setAnswers]   = useState({ capturar: "", conectar: "", converter: "" });
  const [prompts]               = useState({
    capturar: randomPick(PROMPTS.capturar),
    conectar: randomPick(PROMPTS.conectar),
    converter: randomPick(PROMPTS.converter),
  });
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [loadingMsg]            = useState(randomPick(LOADING_MSGS));
  const [feedback, setFeedback] = useState(null);
  const taRef = useRef();

  useEffect(() => { taRef.current?.focus(); }, [step]);

  const keys  = ["capturar","conectar","converter"];
  const tipoLabel = tipo === "filme" ? "o filme" : tipo === "podcast" ? "o podcast" : tipo === "video" ? "o vídeo" : tipo === "ideia" ? "essa ideia" : "o livro";
  const descs = [
    `o que ficou depois que você terminou ${tipoLabel}`,
    "onde essa ideia vive na sua vida agora",
    "o que você vai fazer com isso essa semana",
  ];

  const canNext = () => {
    if (step === 0) return livro.trim().length > 0;
    return answers[keys[step-1]]?.trim().length > 10;
  };

  const next = async () => {
    if (step < 3) { setStep(s => s + 1); return; }
    setStep(4);
    try {
      const r = await gerarSintese(answers, livro, autor, tipo, perfil);
      setResult(r);
      setStep(5);
      onSave({ livro, autor, tipo, ...answers, ancora: r.ancora, espelho: r.espelho, expansao: r.expansao, convite: r.convite, cuidado: r.cuidado, date: new Date().toISOString() });
    } catch {
      setError("algo deu errado. suas reflexões foram salvas.");
      onSave({ livro, autor, tipo, ...answers, date: new Date().toISOString() });
      setStep(5);
    }
  };

  const tiposConteudo = [
    { id: "livro", label: "📖 livro", placeholder: "ex: a sociedade do cansaço", autorLabel: "autor (opcional)", autorPlaceholder: "ex: byung-chul han" },
    { id: "filme", label: "🎬 filme", placeholder: "ex: boyhood", autorLabel: "diretor (opcional)", autorPlaceholder: "ex: richard linklater" },
    { id: "podcast", label: "🎙️ podcast", placeholder: "ex: huberman lab", autorLabel: "episódio ou host (opcional)", autorPlaceholder: "ex: ep. sobre sono" },
    { id: "video", label: "▶️ vídeo", placeholder: "ex: palestra de brené brown", autorLabel: "canal ou autor (opcional)", autorPlaceholder: "ex: ted talks" },
    { id: "ideia", label: "💡 uma ideia", placeholder: "ex: sobre o valor do silêncio", autorLabel: "origem (opcional)", autorPlaceholder: "ex: conversa com uma amiga" },
  ];

  if (step === 0) return (
    <Screen title="por onde começamos?" subtitle="o ritual" onBack={() => setView("home")}>
      <p style={{ fontSize: "13px", color: C.muted, marginBottom: "20px", lineHeight: 1.7 }}>pode ser um livro, filme, podcast, vídeo — ou simplesmente uma ideia que ficou.</p>

      <Field label="o que você quer trazer?">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
          {tiposConteudo.map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              padding: "8px 14px", borderRadius: "20px", cursor: "pointer",
              fontSize: "12px", transition: "all 0.2s",
              background: tipo === t.id ? C.gold : C.surface,
              border: `1px solid ${tipo === t.id ? C.gold : C.border}`,
              color: tipo === t.id ? C.bg : C.mutedHi,
            }}>{t.label}</button>
          ))}
        </div>
      </Field>

      {tipo && (() => {
        const t = tiposConteudo.find(t => t.id === tipo);
        return (
          <>
            <Field label="título" required>
              <input ref={taRef} value={livro} onChange={e => setLivro(e.target.value)}
                placeholder={t.placeholder} style={inputStyle()}
                onKeyDown={e => e.key === "Enter" && canNext() && next()} />
            </Field>
            <Field label={t.autorLabel}>
              <input value={autor} onChange={e => setAutor(e.target.value)}
                placeholder={t.autorPlaceholder} style={inputStyle()} />
            </Field>
          </>
        );
      })()}

      <Btn onClick={next} disabled={!canNext()} style={{ marginTop: "8px" }}>começar →</Btn>
    </Screen>
  );

  if (step >= 1 && step <= 3) {
    const k = keys[step-1];
    return (
      <Screen title={k} subtitle={`movimento 0${step} de 03`} onBack={() => setStep(s => s-1)} progress={step/3}>
        <p style={{ fontSize: "11px", color: C.muted, marginBottom: "12px" }}>{descs[step-1]}</p>
        <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}22`, borderRadius: "4px", padding: "14px 16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: C.text, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>{prompts[k]}</p>
        </div>
        <textarea ref={taRef} value={answers[k]} onChange={e => setAnswers(a => ({ ...a, [k]: e.target.value }))}
          placeholder="sem pressa. não tem resposta certa."
          rows={5} style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.8 }} />
        <p style={{ fontSize: "11px", color: C.muted, margin: "8px 0 24px" }}>{answers[k]?.length || 0} caracteres</p>
        <Btn onClick={next} disabled={!canNext()}>{step < 3 ? "próximo →" : "gerar síntese →"}</Btn>
      </Screen>
    );
  }

  if (step === 4) return (
    <Screen title="" subtitle="">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${C.gold}44`, borderTopColor: C.gold, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "15px", color: C.text, fontStyle: "italic" }}>{loadingMsg}</p>
      </div>
    </Screen>
  );

  if (step === 5) return (
    <Screen title={livro} subtitle={`sua voz ${tipo === "filme" ? "nesse filme" : tipo === "podcast" ? "nesse podcast" : tipo === "video" ? "nesse vídeo" : tipo === "ideia" ? "nessa ideia" : "nessa leitura"}`} onBack={() => setView("home")} backLabel="voltar ao início">
      {error && <p style={{ fontSize: "12px", color: C.blush, marginBottom: "16px" }}>{error}</p>}
      {result?.ancora && (
        <div style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}44`, borderRadius: "6px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: "12px" }}>o essencial</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", color: C.gold, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>"{result.ancora}"</p>
        </div>
      )}
      {result?.espelho   && <ResultBlock label="entrelinhas" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{result.espelho}</p></ResultBlock>}
      {result?.expansao  && <ResultBlock label="repertório" color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{result.expansao}</p></ResultBlock>}
      {result?.convite   && <ResultBlock label="conhecimento na prática" color={C.success}><p style={{ fontSize: "14px", color: C.cream, lineHeight: 1.7, margin: 0 }}>{result.convite}</p></ResultBlock>}
      {result?.cuidado   && <div style={{ background: `${C.blush}11`, border: `1px solid ${C.blush}33`, borderRadius: "6px", padding: "16px 18px", marginBottom: "14px" }}><p style={{ fontSize: "12px", color: C.mutedHi, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{result.cuidado}</p></div>}
      {result?.modo === "local" && <p style={{ fontSize: "10px", color: C.muted, textAlign: "center", marginTop: "4px", fontStyle: "italic" }}>síntese gerada localmente · versão beta</p>}

      <div style={{ marginTop: "28px", borderTop: `1px solid ${C.border}`, paddingTop: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase", marginBottom: "14px" }}>suas reflexões</p>
        {keys.map((k, i) => (
          <div key={k} style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", color: C.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>0{i+1} {k}</p>
            <p style={{ fontSize: "12px", color: C.mutedHi, lineHeight: 1.7, margin: 0 }}>{answers[k]}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "16px 20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", color: C.muted, marginBottom: "12px" }}>essa síntese ressoou com você?</p>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setFeedback(n)} style={{
              flex: 1, padding: "10px", borderRadius: "4px", cursor: "pointer", fontSize: "18px",
              background: feedback === n ? `${C.gold}33` : C.surface,
              border: `1px solid ${feedback === n ? C.gold : C.border}`,
              transition: "all 0.2s"
            }}>
              {n === 1 ? "😐" : n === 2 ? "🙂" : "✨"}
            </button>
          ))}
        </div>
        {feedback && (
          <p style={{ fontSize: "11px", color: C.goldDim, marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
            {feedback === 1 ? "obrigada por dizer. isso ajuda a melhorar." : feedback === 2 ? "fico feliz que algo ficou." : "que bom. isso é exatamente o que queremos."}
          </p>
        )}
      </div>
      <Btn onClick={() => setView("home")}>guardar e ir ✓</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// REFLEXÃO SEMANAL
// ══════════════════════════════════════════════════════════
function ReflexaoSemanal({ rituais, setView, perfil }) {
  const [reflexao, setReflexao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const livros = rituais.map(r => r.livro).join(", ");
  const ancoras = rituais.filter(r => r.ancora).map(r => `"${r.ancora}"`);

  useEffect(() => {
    gerarReflexaoSemanal(rituais, perfil).then(r => { setReflexao(r); setCarregando(false); });
  }, []);

  if (carregando) return (
    <Screen title="" subtitle="">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${C.gold}44`, borderTopColor: C.gold, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "15px", color: C.text, fontStyle: "italic" }}>olhando pra sua semana inteira...</p>
      </div>
    </Screen>
  );

  return (
    <Screen title="sua semana em leituras" subtitle={`${rituais.length} rituais`} onBack={() => setView("home")}>
      <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}33`, borderRadius: "6px", padding: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.goldDim, textTransform: "uppercase", marginBottom: "10px" }}>o que passou por aqui</p>
        <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: "0 0 12px" }}>{livros}</p>
        {ancoras.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
            {ancoras.map((a, i) => <p key={i} style={{ fontSize: "12px", color: C.gold, fontStyle: "italic", margin: "0 0 4px" }}>{a}</p>)}
          </div>
        )}
      </div>
      {reflexao ? (
        <>
          <ResultBlock label="o fio que atravessou tudo" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{reflexao.fio}</p></ResultBlock>
          <ResultBlock label="uma conexão que apareceu" color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{reflexao.conexao}</p></ResultBlock>
          {reflexao.conceitos && <MapaConceitos conceitos={reflexao.conceitos} />}
          <ResultBlock label="uma pergunta pra levar" color={C.success}><p style={{ fontSize: "15px", color: C.cream, lineHeight: 1.7, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>{reflexao.pergunta}</p></ResultBlock>
          <div style={{ textAlign: "center", padding: "16px 0" }}><p style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.8 }}>{reflexao.fechamento}</p></div>
        </>
      ) : (
        <ResultBlock label="esta semana" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>você leu {rituais.length} livros essa semana. o que você está tentando entender?</p></ResultBlock>
      )}
      <Btn onClick={() => setView("home")}>voltar</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// RESUMO MENSAL
// ══════════════════════════════════════════════════════════
function ResumoMensal({ rituais, mes, setView, perfil }) {
  const [resumo, setResumo]     = useState(null);
  const [carregando, setCarregando] = useState(true);
  const livros = [...new Set(rituais.map(r => r.livro))].join(", ");

  useEffect(() => {
    gerarResumoMensal(rituais, mes, perfil).then(r => { setResumo(r); setCarregando(false); });
  }, []);

  if (carregando) return (
    <Screen title="" subtitle="">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${C.blush}44`, borderTopColor: C.blush, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "15px", color: C.text, fontStyle: "italic" }}>olhando pro seu mês inteiro...</p>
      </div>
    </Screen>
  );

  return (
    <Screen title={mes} subtitle={`${rituais.length} rituais`} onBack={() => setView("home")}>
      <div style={{ background: `${C.blush}11`, border: `1px solid ${C.blush}33`, borderRadius: "6px", padding: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.blush, textTransform: "uppercase", marginBottom: "8px" }}>livros do mês</p>
        <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0 }}>{livros}</p>
      </div>

      {resumo ? (
        <>
          <ResultBlock label="os temas do mês" color={C.gold}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.temas}</p></ResultBlock>
          <ResultBlock label="o que está crescendo" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.crescendo}</p></ResultBlock>
          <ResultBlock label="para ir mais além" color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.aprofundar}</p></ResultBlock>
          {resumo.conceitos && <MapaConceitos conceitos={resumo.conceitos} />}
          <ResultBlock label="a pergunta do mês" color={C.success}><p style={{ fontSize: "16px", color: C.cream, lineHeight: 1.7, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>{resumo.pergunta}</p></ResultBlock>
          <div style={{ textAlign: "center", padding: "16px 0" }}><p style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.8 }}>{resumo.fechamento}</p></div>
        </>
      ) : (
        <ResultBlock label="este mês" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>você fez {rituais.length} rituais esse mês. isso já é muito.</p></ResultBlock>
      )}
      <Btn onClick={() => setView("home")}>voltar</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// BIBLIOTECA
// ══════════════════════════════════════════════════════════
function Biblioteca({ entries, setView, setSelected }) {
  const [search, setSearch] = useState("");
  const filtered = entries.filter(e =>
    [e.livro, e.autor, e.ancora].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Screen title="o que já li" subtitle={`${entries.length} rituais`} onBack={() => setView("home")}>
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: "14px", color: C.muted, fontStyle: "italic" }}>sua biblioteca está esperando o primeiro livro.</p>
          <button onClick={() => setView("ritual")} style={{ ...btnBase(), marginTop: "20px", padding: "12px 24px" }}>iniciar primeiro ritual →</button>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="buscar por livro, autor ou frase..."
            style={{ ...inputStyle(), marginBottom: "20px" }} />
          {filtered.map((e, i) => (
            <div key={i} onClick={() => { setSelected(e); setView("entrada"); }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "16px 18px", marginBottom: "10px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={el => el.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={el => el.currentTarget.style.borderColor = C.border}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, margin: 0 }}>{e.livro}</p>
                <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>{fmt(e.date)}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                {e.tipo && e.tipo !== "livro" && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: `${C.gold}22`, color: C.goldDim, border: `1px solid ${C.gold}33` }}>{e.tipo}</span>}
                {e.ancora && <p style={{ fontSize: "12px", color: C.gold, fontStyle: "italic", margin: 0 }}>"{e.ancora}"</p>}
              </div>
            </div>
          ))}
        </>
      )}
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// ENTRADA DETALHE
// ══════════════════════════════════════════════════════════
function EntradaDetalhe({ entry, setView }) {
  if (!entry) return null;
  return (
    <Screen title={entry.livro} subtitle={entry.autor || fmt(entry.date)} onBack={() => setView("biblioteca")}>
      {entry.autor && <p style={{ fontSize: "11px", color: C.muted, marginBottom: "16px" }}>{fmt(entry.date)}</p>}
      {entry.ancora && (
        <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}33`, borderRadius: "6px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.goldDim, textTransform: "uppercase", marginBottom: "8px" }}>o essencial</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", color: C.gold, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>"{entry.ancora}"</p>
        </div>
      )}
      {entry.espelho   && <ResultBlock label="entrelinhas" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{entry.espelho}</p></ResultBlock>}
      {entry.expansao  && <ResultBlock label="repertório" color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{entry.expansao}</p></ResultBlock>}
      {entry.convite   && <ResultBlock label="conhecimento na prática" color={C.success}><p style={{ fontSize: "13px", color: C.cream, lineHeight: 1.7, margin: 0 }}>{entry.convite}</p></ResultBlock>}
      {entry.cuidado   && <div style={{ background: `${C.blush}11`, border: `1px solid ${C.blush}33`, borderRadius: "6px", padding: "16px 18px", marginBottom: "14px" }}><p style={{ fontSize: "12px", color: C.mutedHi, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{entry.cuidado}</p></div>}
      <div style={{ marginTop: "24px", borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
        {["capturar","conectar","converter"].map((k, i) => entry[k] && (
          <div key={k} style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "10px", color: C.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>0{i+1} {k}</p>
            <p style={{ fontSize: "13px", color: C.mutedHi, lineHeight: 1.8, margin: 0 }}>{entry[k]}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}


// ══════════════════════════════════════════════════════════
// MAPA DE CONCEITOS — TAGS A3
// ══════════════════════════════════════════════════════════
function MapaConceitos({ conceitos }) {
  const [aberto, setAberto] = useState(null);
  if (!conceitos || conceitos.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.goldDim, textTransform: "uppercase", marginBottom: "12px" }}>conceitos da semana</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {conceitos.map((c, i) => (
          <button key={i} onClick={() => setAberto(aberto === i ? null : i)} style={{
            padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
            fontSize: "12px", fontWeight: 500, transition: "all 0.2s",
            background: aberto === i ? C.gold : C.surface,
            border: `1px solid ${aberto === i ? C.gold : C.border}`,
            color: aberto === i ? C.bg : C.mutedHi,
          }}>
            {c.tag}
          </button>
        ))}
      </div>

      {aberto !== null && conceitos[aberto] && (
        <div style={{
          background: C.card, border: `1px solid ${C.gold}44`,
          borderLeft: `3px solid ${C.gold}`,
          borderRadius: "6px", padding: "20px",
          animation: "fadeIn 0.2s ease"
        }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, fontWeight: 400, margin: "0 0 12px" }}>
            {conceitos[aberto].tag}
          </p>

          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>o que é</p>
            <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0 }}>{conceitos[aberto].definicao}</p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>como apareceu nos seus rituais</p>
            <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0 }}>{conceitos[aberto].apareceu}</p>
          </div>

          {conceitos[aberto].tensao && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>a conversa que existe</p>
              <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{conceitos[aberto].tensao}</p>
            </div>
          )}

          {conceitos[aberto].sugestao && (
            <div style={{ background: `${C.gold}11`, borderRadius: "4px", padding: "10px 14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "4px" }}>para ir mais além</p>
              <p style={{ fontSize: "12px", color: C.text, lineHeight: 1.6, margin: 0 }}>{conceitos[aberto].sugestao}</p>
            </div>
          )}

          <button onClick={() => setAberto(null)} style={{
            background: "none", border: "none", color: C.muted,
            fontSize: "11px", cursor: "pointer", marginTop: "14px", padding: 0
          }}>fechar ↑</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════
function Screen({ title, subtitle, children, onBack, backLabel, progress }) {
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        {onBack ? <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "12px", padding: 0 }}>← {backLabel || "voltar"}</button> : <div />}
        {progress !== undefined && (
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3].map(n => <div key={n} style={{ width: "24px", height: "3px", borderRadius: "2px", background: n <= progress * 3 ? C.gold : C.border, transition: "background 0.3s" }} />)}
          </div>
        )}
      </div>
      {(title || subtitle) && (
        <div style={{ marginBottom: "28px" }}>
          {subtitle && <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", margin: "0 0 6px" }}>{subtitle}</p>}
          {title && <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, color: C.cream, margin: 0 }}>{title}</h2>}
        </div>
      )}
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
        {label}{required && <span style={{ color: C.gold }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ResultBlock({ label, color, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: "4px", padding: "16px 18px", marginBottom: "14px" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.15em", color, textTransform: "uppercase", marginBottom: "10px" }}>{label}</p>
      {children}
    </div>
  );
}

function btnBase() {
  return { background: `linear-gradient(135deg, ${C.gold}33, ${C.gold}18)`, border: `1px solid ${C.gold}55`, borderRadius: "4px", color: C.gold, fontSize: "13px", fontWeight: 600, cursor: "pointer" };
}

function Btn({ onClick, disabled, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...btnBase(), width: "100%", padding: "15px 24px",
      opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      ...style
    }}>
      {children}
    </button>
  );
}

function inputStyle() {
  return {
    width: "100%", padding: "12px 14px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: "4px", color: C.ink, fontSize: "14px", outline: "none",
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s"
  };
}
