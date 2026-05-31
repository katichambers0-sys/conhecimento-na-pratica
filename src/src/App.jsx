import { useState, useEffect, useRef } from "react";

const C = {
  bg:       "#0E0C0A",
  surface:  "#151210",
  card:     "#1C1815",
  border:   "#2C2520",
  borderHi: "#3D342C",
  gold:     "#C8A96D",
  goldDim:  "#8A7048",
  blush:    "#C4786E",
  cream:    "#EDE4D3",
  muted:    "#7A7068",
  mutedHi:  "#9A8E82",
  text:     "#D8CFBE",
  ink:      "#F2EAD8",
  success:  "#7A9E7E",
};

const PROMPTS = {
  capturar: [
    "qual frase do livro ficou ecoando na sua cabeça depois que você fechou?",
    "se você tivesse que explicar o livro para uma amiga em 3 frases, quais seriam?",
    "o que te surpreendeu — algo que contradisse o que você já pensava?",
    "qual ideia você sublinhou mais de uma vez, ou voltou para reler?",
    "o que ficou incomodando — de um jeito bom ou ruim?",
  ],
  conectar: [
    "onde essa ideia aparece na sua vida agora? no trabalho, nas relações, em você?",
    "se esse conceito fosse um espelho, o que ele estaria refletindo da sua situação atual?",
    "quem na sua vida mais precisaria ouvir isso — e por quê?",
    "onde você já viu isso acontecer antes — e o que foi diferente?",
    "se você soubesse disso há 2 anos, o que teria feito diferente?",
  ],
  converter: [
    "qual é a menor ação possível que você pode fazer essa semana com isso?",
    "o que você vai parar de fazer, começar a fazer, ou fazer diferente?",
    "escreva uma frase que você vai carregar com você essa semana.",
    "se você fosse compartilhar apenas uma coisa desse livro com alguém amanhã, o que seria?",
    "qual hábito, conversa ou decisão essa leitura está pedindo de você?",
  ],
};

function gerarSinteseLocal(answers, livro) {
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
  const ancoras = {
    burnout:     "descansar também é um ato de resistência.",
    relacoes:    "clareza sobre quem você é facilita clareza sobre quem você quer por perto.",
    carreira:    "competência sem presença não se vê — e você tem as duas.",
    identidade:  "você não precisa se tornar outra pessoa. precisa se reconhecer mais.",
    mudanca:     "a menor ação na direção certa vale mais do que o plano perfeito parado.",
    medo:        "o que você chama de insegurança às vezes é só inteligência sendo honesta.",
    tempo:       "urgência constante é sinal de que algo precisa ser revisto, não acelerado.",
    conhecimento:"saber e não aplicar não é falta de disciplina — é falta de ponte.",
    default:     "o que ficou do livro já é parte de quem você está se tornando.",
  };
  const insights = {
    burnout:     "esse livro tocou num ponto que o seu corpo provavelmente já sabia antes da sua cabeça. a sensação de exaustão costuma preceder a consciência dela — e o fato de você ter ressonado com isso é informação importante sobre o seu momento atual.",
    relacoes:    "leituras que falam de relações geralmente falam de nós mesmas. o que incomodou ou ressoou nesse livro provavelmente tem mais a ver com algo que você já sente do que com as pessoas ao redor.",
    carreira:    "o repertório que você está construindo com essas leituras é um ativo profissional real — especialmente quando você consegue articulá-lo. a maioria das pessoas lê mas não conecta. você está aprendendo a conectar.",
    identidade:  "livros que mexem com identidade costumam aparecer na hora certa. não é coincidência você ter escolhido esse agora. algo em você estava pronto para essa conversa.",
    mudanca:     "a vontade de mudar é fácil. o difícil é identificar o ponto mínimo de mudança — a menor ação que já desloca algo. parece que você está chegando perto disso.",
    medo:        "a síndrome do impostor quase sempre atinge as pessoas mais capacitadas — não as menos. o fato de você questionar é sinal de que você se importa com a qualidade do que faz.",
    tempo:       "nossa relação com o tempo revela muito sobre nossa relação com nós mesmas. o que esse livro está te pedindo não é necessariamente fazer menos — é fazer com mais intenção.",
    conhecimento:"você está desenvolvendo uma habilidade rara: transformar leitura em reflexão aplicada. a maioria das pessoas não passa da primeira etapa. você já está na terceira.",
    default:     "cada leitura deixa uma marca que nem sempre conseguimos nomear imediatamente. o que você capturou aqui é o começo de uma conversa que vai continuar — nos próximos livros, nas próximas semanas.",
  };
  const temaDominante = Object.entries(temas).find(([, v]) => v)?.[0] || "default";
  return {
    ancora:  ancoras[temaDominante] || ancoras.default,
    insight: insights[temaDominante] || insights.default,
    acao:    acao.length > 15 ? acao : `essa semana, escolhe um momento — pode ser 10 minutos — para observar onde "${livro}" aparece na sua vida.`,
    modo: "local",
  };
}
async function callClaudeAPI(answers, livro) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  const txt = `Você é um guia de leitura aplicada com base em psicologia e desenvolvimento humano.

A usuária leu "${livro}" e fez estas reflexões:
CAPTURAR (o que ficou): ${answers.capturar}
CONECTAR (com a vida dela): ${answers.conectar}
CONVERTER (em ação): ${answers.converter}

Gere uma síntese com:
1. Uma frase-âncora (máx 20 palavras)
2. Um insight psicológico breve (2-3 frases)
3. Uma micro-ação para os próximos 7 dias

Tom: quente, inteligente, português brasileiro, lowercase.
Retorne APENAS JSON válido: {"ancora": "...", "insight": "...", "acao": "..."}`;

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
      max_tokens: 1000,
      messages: [{ role: "user", content: txt }],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  return { ...JSON.parse(raw.replace(/```json|```/g, "").trim()), modo: "api" };
}

async function gerarSintese(answers, livro) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (apiKey) {
    try { return await callClaudeAPI(answers, livro); } catch {}
  }
  await new Promise(r => setTimeout(r, 1800));
  return gerarSinteseLocal(answers, livro);
}

const randomPick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmt = iso => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

function loadEntries() {
  try { return JSON.parse(localStorage.getItem("dlav_entries") || "[]"); }
  catch { return []; }
}
function saveEntries(arr) {
  try { localStorage.setItem("dlav_entries", JSON.stringify(arr)); } catch {}
}

export default function App() {
  const [view, setView]         = useState("home");
  const [entries, setEntries]   = useState(() => loadEntries());
  const [selected, setSelected] = useState(null);

  const addEntry = (e) => {
    const next = [e, ...entries];
    setEntries(next);
    saveEntries(next);
  };

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

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text }}>
      {view === "home"        && <Home        streak={streak} entries={entries} setView={setView} setSelected={setSelected} />}
      {view === "ritual"      && <Ritual      onSave={addEntry} setView={setView} />}
      {view === "biblioteca"  && <Biblioteca  entries={entries} setView={setView} setSelected={setSelected} />}
      {view === "entrada"     && <EntradaDetalhe entry={selected} setView={setView} />}
    </div>
  );
}

function Home({ streak, entries, setView, setSelected }) {
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
          <p style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0" }}>dias seguidos</p>
        </div>
        <div style={{ flex: 1, paddingLeft: "20px", borderLeft: `1px solid ${C.border}` }}>
          <p style={{ fontSize: "13px", color: C.text, margin: "0 0 4px", lineHeight: 1.5 }}>
            {streak === 0 && "seu ritual começa hoje."}
            {streak === 1 && "primeiro passo dado. isso é tudo que importa."}
            {streak >= 2 && streak < 7 && `${streak} dias construindo uma prática real.`}
            {streak >= 7 && "uma semana inteira. o hábito está se formando."}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{entries.length} {entries.length === 1 ? "entrada" : "entradas"} na biblioteca</p>
        </div>
      </div>
      <Btn onClick={() => setView("ritual")} style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ textAlign: "left" }}>
          <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: "3px" }}>iniciar</span>
          <span style={{ display: "block", fontSize: "17px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream }}>ritual de leitura</span>
        </span>
        <span style={{ fontSize: "18px", color: C.gold }}>→</span>
      </Btn>
      <button onClick={() => setView("biblioteca")} style={{ width: "100%", padding: "14px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer", color: C.mutedHi, fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
        <span>minha biblioteca</span><span style={{ color: C.muted }}>→</span>
      </button>
      {recent.length > 0 && (
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.muted, textTransform: "uppercase", marginBottom: "14px" }}>último ritual</p>
          {recent.map((e, i) => (
            <div key={i} onClick={() => { setSelected(e); setView("entrada"); }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "18px 20px", cursor: "pointer" }}>
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
          <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.8, fontStyle: "italic" }}>"você não tem problema de leitura.<br />você tem problema de ponte."</p>
          <p style={{ fontSize: "11px", color: C.goldDim, marginTop: "8px" }}>— the reading cure</p>
        </div>
      )}
    </div>
  );
}
efunction Ritual({ onSave, setView }) {
  const [step, setStep]       = useState(0);
  const [livro, setLivro]     = useState("");
  const [autor, setAutor]     = useState("");
  const [answers, setAnswers] = useState({ capturar: "", conectar: "", converter: "" });
  const [prompts]             = useState({
    capturar: randomPick(PROMPTS.capturar),
    conectar: randomPick(PROMPTS.conectar),
    converter: randomPick(PROMPTS.converter),
  });
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const taRef = useRef();

  useEffect(() => { taRef.current?.focus(); }, [step]);

  const keys  = ["capturar","conectar","converter"];
  const descs = ["o que ficou depois que você fechou o livro","onde essa ideia vive na sua vida agora","o que você vai fazer com isso essa semana"];

  const canNext = () => {
    if (step === 0) return livro.trim().length > 0;
    return answers[keys[step-1]]?.trim().length > 10;
  };

  const next = async () => {
    if (step < 3) { setStep(s => s + 1); return; }
    setStep(4);
    try {
      const r = await gerarSintese(answers, livro);
      setResult(r);
      setStep(5);
      onSave({ livro, autor, ...answers, ancora: r.ancora, insight: r.insight, acao: r.acao, date: new Date().toISOString() });
    } catch {
      setError("algo deu errado. suas reflexões foram salvas.");
      onSave({ livro, autor, ...answers, date: new Date().toISOString() });
      setStep(5);
    }
  };

  if (step === 0) return (
    <Screen title="qual livro?" subtitle="o ritual começa aqui" onBack={() => setView("home")}>
      <p style={{ fontSize: "13px", color: C.muted, marginBottom: "28px", lineHeight: 1.7 }}>não precisa ter terminado. pode ser um capítulo, uma ideia, uma página que ficou.</p>
      <Field label="título do livro" required>
        <input ref={taRef} value={livro} onChange={e => setLivro(e.target.value)} placeholder="ex: a sociedade do cansaço" style={inputStyle()} onKeyDown={e => e.key === "Enter" && canNext() && next()} />
      </Field>
      <Field label="autor (opcional)">
        <input value={autor} onChange={e => setAutor(e.target.value)} placeholder="ex: byung-chul han" style={inputStyle()} />
      </Field>
      <Btn onClick={next} disabled={!canNext()}>começar →</Btn>
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
        <textarea ref={taRef} value={answers[k]} onChange={e => setAnswers(a => ({ ...a, [k]: e.target.value }))} placeholder="escreva livremente. não há resposta errada." rows={5} style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.8 }} />
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
        <p style={{ fontSize: "16px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, marginBottom: "8px" }}>tecendo sua síntese...</p>
        <p style={{ fontSize: "12px", color: C.muted }}>conectando o que você leu com quem você é</p>
      </div>
    </Screen>
  );

  if (step === 5) return (
    <Screen title={livro} subtitle="síntese do ritual" onBack={() => setView("home")} backLabel="voltar ao início">
      {error && <p style={{ fontSize: "12px", color: C.blush, marginBottom: "16px" }}>{error}</p>}
      {result?.ancora && (
        <div style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}44`, borderRadius: "6px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: "12px" }}>frase-âncora</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", color: C.gold, fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>"{result.ancora}"</p>
        </div>
      )}
      {result?.insight && <ResultBlock label="o que essa leitura revela" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{result.insight}</p></ResultBlock>}
      {result?.acao && <ResultBlock label="sua ação para os próximos 7 dias" color={C.success}><p style={{ fontSize: "14px", color: C.cream, lineHeight: 1.7, margin: 0 }}>{result.acao}</p></ResultBlock>}
      {result?.modo === "local" && <p style={{ fontSize: "10px", color: C.muted, textAlign: "center", marginTop: "4px", fontStyle: "italic" }}>síntese gerada localmente · versão beta</p>}
      <div style={{ marginTop: "28px", borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase", marginBottom: "14px" }}>suas reflexões</p>
        {keys.map((k, i) => (
          <div key={k} style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", color: C.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>0{i+1} {k}</p>
            <p style={{ fontSize: "12px", color: C.mutedHi, lineHeight: 1.7, margin: 0 }}>{answers[k]}</p>
          </div>
        ))}
      </div>
      <Btn onClick={() => setView("home")} style={{ marginTop: "24px" }}>concluir ✓</Btn>
    </Screen>
  );
}

function Biblioteca({ entries, setView, setSelected }) {
  const [search, setSearch] = useState("");
  const filtered = entries.filter(e => [e.livro, e.autor, e.ancora].some(v => v?.toLowerCase().includes(search.toLowerCase())));
  return (
    <Screen title="minha biblioteca" subtitle={`${entries.length} rituais`} onBack={() => setView("home")}>
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: "14px", color: C.muted, fontStyle: "italic" }}>sua biblioteca está esperando o primeiro livro.</p>
          <button onClick={() => setView("ritual")} style={{ ...btnBase(), marginTop: "20px", padding: "12px 24px" }}>iniciar primeiro ritual →</button>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="buscar por livro, autor ou frase-âncora..." style={{ ...inputStyle(), marginBottom: "20px" }} />
          {filtered.map((e, i) => (
            <div key={i} onClick={() => { setSelected(e); setView("entrada"); }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "16px 18px", marginBottom: "10px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <p style={{ fontSize: "14px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream, margin: 0 }}>{e.livro}</p>
                <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>{fmt(e.date)}</p>
              </div>
              {e.ancora && <p style={{ fontSize: "12px", color: C.gold, fontStyle: "italic", margin: "6px 0 0" }}>"{e.ancora}"</p>}
            </div>
          ))}
        </>
      )}
    </Screen>
  );
}

function EntradaDetalhe({ entry, setView }) {
  if (!entry) return null;
  return (
    <Screen title={entry.livro} subtitle={entry.autor || fmt(entry.date)} onBack={() => setView("biblioteca")}>
      {entry.ancora && (
        <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}33`, borderRadius: "6px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", color: C.gold, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>"{entry.ancora}"</p>
        </div>
      )}
      {entry.insight && <ResultBlock label="insight" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{entry.insight}</p></ResultBlock>}
      {entry.acao && <ResultBlock label="ação da semana" color={C.success}><p style={{ fontSize: "13px", color: C.cream, lineHeight: 1.7, margin: 0 }}>{entry.acao}</p></ResultBlock>}
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

function Screen({ title, subtitle, children, onBack, backLabel, progress }) {
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        {onBack ? <button onClick={onBack} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "12px", padding: 0 }}>← {backLabel || "voltar"}</button> : <div />}
        {progress !== undefined && (
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3].map(n => <div key={n} style={{ width: "24px", height: "3px", borderRadius: "2px", background: n <= progress * 3 ? C.gold : C.border }} />)}
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
    <button onClick={onClick} disabled={disabled} style={{ ...btnBase(), width: "100%", padding: "15px 24px", opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      {children}
    </button>
  );
}

function inputStyle() {
  return { width: "100%", padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", color: C.ink, fontSize: "14px", outline: "none", fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: "border-box" };
}
