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
  livro: {
    capturar: [
      "qual frase ficou na cabeça mesmo depois que você fechou o livro?",
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
  },
  filme: {
    capturar: [
      "qual cena ficou na cabeça mesmo depois que as luzes acenderam?",
      "se esse filme fosse uma conversa, o que ele estaria te dizendo?",
      "o que te surpreendeu, algo que contradisse o que você esperava ver?",
      "qual personagem ou momento você ainda está digerindo?",
      "o que ficou incomodando de um jeito bom?",
    ],
    conectar: [
      "onde na sua vida isso está acontecendo agora, mesmo que de um jeito diferente?",
      "se esse filme fosse um espelho, o que ele estaria mostrando?",
      "algum personagem te lembrou alguém, ou você mesma em algum momento?",
      "onde você sente isso, nas relações, no trabalho, em você?",
      "tem algo nesse filme que você gostaria de mostrar pra alguém específico? por quê?",
    ],
    converter: [
      "se você fosse levar uma coisa desse filme pra sua vida, qual seria?",
      "qual é o menor gesto possível que nasce do que você viu?",
      "o que mudaria se você levasse essa ideia a sério por uma semana?",
      "o que você quer lembrar desse filme daqui a um mês?",
      "se esse filme te deu permissão pra algo, o que seria?",
    ],
  },
  podcast: {
    capturar: [
      "qual ideia desse episódio você ainda está digerindo?",
      "se esse podcast fosse uma conversa, o que ele estaria te dizendo?",
      "o que te surpreendeu, algo que contradisse o que você já pensava?",
      "qual momento você pausou pra pensar, mesmo sem perceber por quê?",
      "o que ficou ecoando depois que você tirou o fone?",
    ],
    conectar: [
      "onde na sua vida isso está acontecendo agora, mesmo que de um jeito diferente?",
      "se esse episódio fosse um espelho, o que ele estaria mostrando?",
      "isso ressoa com algo que você já sabe mas ainda não age?",
      "onde você sente isso, nas relações, no trabalho, em você?",
      "tem alguém na sua vida que precisaria ouvir esse episódio? por quê?",
    ],
    converter: [
      "se você fosse fazer uma coisa só com o que ouviu, qual seria?",
      "qual é o menor gesto possível que nasce do que você ouviu?",
      "o que mudaria se você levasse essa ideia a sério por uma semana?",
      "o que você quer lembrar desse episódio daqui a um mês?",
      "se esse podcast te deu permissão pra algo, o que seria?",
    ],
  },
  video: {
    capturar: [
      "qual ideia desse vídeo você ainda está digerindo?",
      "se esse vídeo fosse uma conversa, o que ele estaria te dizendo?",
      "o que te surpreendeu, algo que contradisse o que você já pensava?",
      "qual momento você voltou a assistir, mesmo sem saber por quê?",
      "o que ficou incomodando de um jeito bom?",
    ],
    conectar: [
      "onde na sua vida isso está acontecendo agora, mesmo que de um jeito diferente?",
      "se esse vídeo fosse um espelho, o que ele estaria mostrando?",
      "isso ressoa com algo que você já sabe mas ainda não age?",
      "onde você sente isso, nas relações, no trabalho, em você?",
      "tem alguém na sua vida que veio à cabeça enquanto você assistia? por quê?",
    ],
    converter: [
      "se você fosse fazer uma coisa só com o que viu, qual seria?",
      "qual é o menor gesto possível que nasce do que você assistiu?",
      "o que mudaria se você levasse essa ideia a sério por uma semana?",
      "o que você quer lembrar desse vídeo daqui a um mês?",
      "se esse vídeo te deu permissão pra algo, o que seria?",
    ],
  },
  ideia: {
    capturar: [
      "de onde essa ideia veio, e por que ficou?",
      "se essa ideia fosse uma pergunta, qual seria?",
      "o que nessa ideia contradisse algo que você já pensava?",
      "qual parte dessa ideia você ainda está tentando entender?",
      "o que essa ideia está incomodando de um jeito bom?",
    ],
    conectar: [
      "onde na sua vida essa ideia está aparecendo agora?",
      "se essa ideia fosse um espelho, o que ela estaria mostrando?",
      "isso ressoa com algo que você já sabe mas ainda não nomeou?",
      "onde você sente essa ideia, nas relações, no trabalho, em você?",
      "tem alguém na sua vida com quem você queria compartilhar isso? por quê?",
    ],
    converter: [
      "se você fosse fazer uma coisa só com essa ideia, qual seria?",
      "qual é o menor gesto possível que nasce dela?",
      "o que mudaria se você levasse essa ideia a sério por uma semana?",
      "o que você quer lembrar dessa ideia daqui a um mês?",
      "se essa ideia te deu permissão pra algo, o que seria?",
    ],
  },
};

// helper para pegar prompts pelo tipo
function getPrompts(tipo) {
  return PROMPTS[tipo] || PROMPTS.livro;
}

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
function gerarSinteseLocal(answers, livro, tipo, lang) {
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
      "a gente tem medo do que importa. isso não é fraqueza, é bússola.",
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
  const expansaoPool = {
    burnout: "isso me faz pensar em algo que byung-chul han escreveu sobre o nosso tempo, que o cansaço moderno não vem de fora, mas de dentro. a gente se explora antes que alguém precise fazer isso por nós. se quiser ir mais fundo, aqui vão algumas ideias. para ler: A Sociedade do Cansaço, do próprio han, denso mas vale cada página. para ver: o documentário The Social Dilemma (Netflix) mostra como os sistemas ao redor de nós foram desenhados para nos esgotar. tem um conceito que aparece muito quando a gente pensa nisso: o sujeito de desempenho. jung chamaria de inflação do ego, a sensação de que nunca é suficiente. os dois, curiosamente, apontam para a mesma saída: parar de se medir.",
    relacoes: "tem algo aqui que conversa com uma das perguntas mais antigas da filosofia: o que é amar de verdade? bell hooks passou a vida inteira tentando responder isso. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Tudo Sobre o Amor, da bell hooks, amor como prática, não sentimento. para ver: Marriage Story (2019), um filme sobre o fim de um amor que ensina mais sobre o começo do que qualquer comédia romântica. tem um conceito interessante aqui: teoria do apego. bowlby mostrou que os padrões de como amamos em adultos têm raízes em como fomos cuidados. winnicott completaria: o que a gente mais precisa é de alguém que simplesmente esteja lá.",
    carreira: "a gente raramente fala sobre isso mas existe uma diferença enorme entre estar ocupada e estar fazendo algo que importa. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Deep Work, de Cal Newport, sobre como recuperar a capacidade de fazer trabalho que realmente vale a pena. para ver: o documentário Abstract: The Art of Design (Netflix) mostra pessoas que encontraram o ponto de encontro entre talento e propósito. tem um conceito japonês chamado ikigai, a interseção entre o que você ama, o que você faz bem, o que o mundo precisa e pelo que pode ser reconhecida. vale a pena desenhar o seu.",
    identidade: "isso me faz pensar em algo que chimamanda ngozi adichie disse uma vez: que a história única é perigosa. a gente se torna a versão mais limitada de si mesma quando deixa de questionar quem é. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Sejamos Todos Feministas, da chimamanda, curto, direto e transforma a forma de ver o mundo. para ver: Moonlight (2016), um dos filmes mais belos sobre identidade que já foram feitos. tem uma tensão interessante aqui: jung diria que o trabalho é tornar-se quem você é. gergen, da psicologia social, diria que você se torna em relação. talvez as duas coisas sejam verdade ao mesmo tempo.",
    mudanca: "a gente tende a subestimar o poder das coisas pequenas. james clear passou anos estudando isso e chegou a uma conclusão simples: mudança real não acontece de uma vez. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Hábitos Atômicos, do james clear, prático e honesto sobre como a mudança funciona de verdade. para ver: Everything Everywhere All at Once (2022), um filme caótico e lindo sobre as escolhas que fazemos. vygotsky tinha um conceito chamado zona de desenvolvimento proximal, a distância entre o que você consegue sozinha e o que consegue com apoio. às vezes mudar precisa de companhia.",
    medo: "a gente confunde muito medo com incompetência. brené brown passou anos pesquisando isso e descobriu algo contraintuitivo: as pessoas mais corajosas são as que mais sentem medo. se quiser ir mais fundo, aqui vão algumas ideias. para ler: A Coragem de Ser Imperfeito, da brené brown, sobre vulnerabilidade como força, não fraqueza. para ver: a talk TED The Power of Vulnerability, da própria brené, 20 minutos que mudam a perspectiva. tem um conceito que aparece muito aqui: síndrome do impostor. pesquisas mostram que afeta desproporcionalmente pessoas competentes. a ironia não passa despercebida.",
    tempo: "oliver burkeman escreveu um livro inteiro sobre isso, que uma vida humana tem, em média, quatro mil semanas. não é muito. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Quatro Mil Semanas, do oliver burkeman, uma das leituras mais honestas sobre tempo que existem. para ver: About Time (2013), um filme sobre o que fazemos com o tempo que temos. william james já dizia que a experiência é aquilo a que prestamos atenção. o que você está escolhendo notar?",
    conhecimento: "isso me faz pensar em algo que a gente raramente admite: que saber algo e aplicar algo são habilidades completamente diferentes. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Como Ler um Livro, de mortimer adler, sim, existe um livro sobre isso, e é surpreendentemente útil. para ver: Most Likely to Succeed (2015), um documentário sobre como aprendemos de verdade. mezirow chamava de aprendizagem transformativa o conhecimento que muda como você vê o mundo, não só o que você sabe. parece que você está nesse território.",
    default: "tem algo aqui que vale explorar mais. as ideias que ficam depois de uma leitura raramente são acidente, costumam apontar para algo que já estava dentro de você esperando nome. se quiser ir mais fundo, aqui vão algumas ideias. para ler: Figuras de Pensamento, de maria popova, sobre como ideias se conectam através do tempo e das pessoas. para ver: o documentário Abstract: The Art of Design (Netflix), sobre como criatividade e pensamento se encontram. tem um conceito chamado transferência de aprendizagem: a capacidade de levar o que aprendemos num contexto para outro completamente diferente. é exatamente o que este ritual está a treinar.",
  };

  return {
    ancora:   ancoras[temaDominante] || ancoras.default,
    espelho:  espelhos[temaDominante] || espelhos.default,
    expansao: expansaoPool[temaDominante] || expansaoPool.default,
    convite:  acao.length > 15 ? acao : `essa semana, escolhe um momento, pode ser dez minutos, pra observar onde ${tipo === "filme" ? "esse filme" : tipo === "podcast" ? "esse podcast" : tipo === "video" ? "esse vídeo" : tipo === "ideia" ? "essa ideia" : "esse livro"} aparece na sua vida. só notar já é o primeiro movimento.`,
    cuidado:  "",
    modo:     "local",
  };
}

// ── API call, ritual ─────────────────────────────────────
async function callClaudeAPI(answers, livro, autor, tipo, perfil, lang) {
  const apiKey = import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_ANTHROPIC_KEY;
  const nomeTxt = perfil?.nome ? `a pessoa se chama ${perfil.nome}.` : "";
  const pronomesTxt = perfil?.pronomes && perfil.pronomes !== "prefiro não dizer"
    ? `usa pronomes ${perfil.pronomes}. adapte a linguagem de acordo, usando esses pronomes quando necessário.`
    : "use linguagem neutra, evite assumir gênero. use 'você' e construções neutras.";

  const txt = `
você passou anos lendo. não só livros, pessoas. sabe que o que alguém diz sobre um livro quase nunca é só sobre o livro. é sobre a vida delas naquele momento. ou às vezes é só sobre o livro, e isso também é válido e bonito.

${nomeTxt} ${pronomesTxt}

quando alguém te traz o que leu, você não analisa. você ouve. e depois fala como alguém que viveu o suficiente para saber que as coisas simples são as mais verdadeiras, e que a pergunta certa chega mais fundo do que qualquer resposta pronta.

você carrega anos de leitura em psicologia (psicanálise, psicologia analítica, cognitiva, social, narrativa, teoria do apego), filosofia (fenomenologia, construcionismo social, ética do cuidado, filosofia prática), crítica cultural (byung-chul han, contexto social e histórico), neurociência afectiva, história, história da arte e literatura. mas esse conhecimento não aparece como referência académica. aparece como intuição. como a capacidade de ver o padrão antes de nomeá-lo, de sentir a tensão antes de descrevê-la. como uma amiga que leu muito e sabe quando usar o que sabe.

quando dois pensadores diriam coisas diferentes sobre o que a pessoa trouxe, você não escolhe um. você diz com leveza: "é curioso, jung diria x, mas a psicologia social diria y. talvez as duas coisas sejam verdade ao mesmo tempo." não para confundir. para abrir.

em algum momento da resposta, especialmente no essencial ou no repertório, pode aparecer um momento de leveza inesperada. não uma piada. uma observação que faz a pessoa sorrir porque é verdadeira de um jeito que ela não antecipou. humor de quem observa a vida com afecto e sem ilusões. nunca forçado, se não aparecer naturalmente, não force.

antes de responder, leia o registo em que a pessoa escreveu:
- se escreveu sobre o livro mais do que sobre si, acompanhe esse registo, explore as ideias, conecte com outros pensamentos, sugira aprofundamentos intelectuais. não force a virada para o pessoal.
- se escreveu sobre si, acompanhe com presença.
- se misturou os dois, siga o fio que ela mesma abriu.
a pessoa sempre sinaliza o que quer. ouça esse sinal antes de responder.

você sabe que palavras têm peso. quando não tem certeza se uma ideia pertence a um autor específico, aproxima sem atribuir: "isso conversa com..." em vez de "como x disse". nunca inventas citações. nunca atribuis a um autor uma ideia que não consegues confirmar. se algo contradiz consenso científico estabelecido, não validas por simpatia, abres a tensão com honestidade e gentileza. preferes a frase simples e verdadeira à frase sofisticada e imprecisa.

antes de responder, avalia: há sinais de sofrimento agudo, crise ou auto-dano? se sim, o campo "cuidado" é obrigatório e toda a resposta é mais contida, menos análise, mais presença. se não, responde com profundidade normal. nunca uses linguagem que implique que a pessoa "tem um problema" ou "deveria trabalhar isto". nunca interpretes o que não foi dito.

a resposta perfeita não é a mais completa. é a mais certeira. uma ideia por campo, bem dita. a pessoa deve terminar de ler sentindo que aprendeu algo e foi vista, não sobrecarregada. o teste: ela consegue carregar uma coisa só que vai com ela para a semana? se sim, está pronto.

você fala em português brasileiro, lowercase, sem formalidade. usa "a gente", "né", "me parece que", "me corrija se eu estiver errada", "isso sugere que", "faz sentido?", "como seria se". pergunta mais do que afirma. sugere mais do que conclui. sem travessão em nenhum momento.

o que você nunca faz: adular, diagnosticar, motivar com frases ocas, simplificar o que é complexo ou complicar o que é simples. se sua resposta pudesse estar num slide de powerpoint, num post motivacional ou num laudo clínico, reescreva.

agora leia o que essa pessoa escreveu. deixe entrar. e responda como só você responderia.

a pessoa trouxe para o ritual: "${livro}" ${autor ? `(${autor})` : ""}, tipo: ${tipo || "livro"}

o que escreveu:
o que ficou: ${answers.capturar}
onde isso aparece na vida: ${answers.conectar}
o que quer fazer com isso: ${answers.converter}

note: responda SEMPRE em ${lang === "en" ? "english" : "português brasileiro"}. adapte a linguagem ao tipo de conteúdo. se for filme, use "assistiu" e "cena" em vez de "leu" e "página". se for podcast ou vídeo, use "ouviu" ou "viu". se for uma ideia, "pensou sobre" ou "trouxe". se for livro, use "leu". isso torna a resposta mais natural e conectada com a experiência real da pessoa.

cinco campos, cada um com uma ideia só, bem dita:

"ancora": a frase essencial deste ritual. máximo 18 palavras. faça mentalmente: qual é a tensão central do que esta pessoa escreveu? qual palavra ou imagem mais viva apareceu? agora escreva a frase que só poderia ter nascido deste ritual, não de qualquer outro. teste: se cobrir o nome do livro, a frase ainda é reconhecível como desta pessoa? deve evocar reconhecimento ("é exatamente isso"), pertencimento ("não estou sozinha") ou expansão ("nunca tinha pensado assim"), escolha um só. pode ter leveza ou humor suave quando o tema permitir. sem travessão. sem motivacional genérico.

"espelho": duas partes distintas, separadas por uma linha em branco no texto:

parte 1, "o que você trouxe": uma síntese organizada e concisa do que a pessoa escreveu nos três movimentos. não interprete ainda. apenas organize e devolva com clareza, como um espelho limpo. 2-3 frases. comece com "você trouxe..." ou "o que ficou foi...". isso cria um momento de reconhecimento, a pessoa vê o próprio pensamento organizado e sente que foi ouvida.

parte 2, "o que eu notei": agora sim a reflexão. o que aparece nas entrelinhas, a tensão, a observação com os frameworks. use "me parece que", "isso sugere que", "me corrija se eu estiver errada". nunca projete emoções que não foram nomeadas. 2-3 frases.

sem travessão em nenhuma das partes.

"expansao": o repertório tem três partes, escreva em texto corrido, não em lista, com voz quente e conversacional no estilo de ana holanda e ana suy.

parte 1, abertura conversacional (1-2 frases): uma observação sobre o tema que a pessoa trouxe, como quem está a continuar uma conversa. algo que crie uma ponte entre o que ela escreveu e o que vem a seguir. use "isso me faz pensar em...", "tem algo aqui que conversa com...", "a gente raramente fala sobre isso mas...". sem travessão.

parte 2, sugestões de aprofundamento: introduza com algo como "se quiser ir mais fundo, aqui vão algumas ideias..." e depois, em texto corrido e natural: 1 livro ou autor certeiro (não o óbvio), 1 filme ou documentário, 1 obra de arte, música ou facto histórico que ressoe com o tema. para cada sugestão, uma frase curta dizendo por que conecta com o que ela trouxe especificamente. sem travessão.

parte 3, conceito para expandir o pensamento (opcional, só se houver um que ilumine genuinamente): nome do conceito + 1-2 frases em linguagem simples + a tensão que existe entre tradições diferentes sobre ele. apresente como curiosidade, não como aula. algo como "tem um conceito que aparece muito quando a gente pensa nisso...". sem travessão.

tudo junto deve soar como uma amiga muito lúcida que acaba de dizer "ah, isso me lembra...", não como uma lista de recursos. específico ao que foi escrito, não genérico.

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

async function gerarSintese(answers, livro, autor, tipo, perfil, lang) {
  const apiKey = import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_ANTHROPIC_KEY;
  if (apiKey) {
    try {
      const r = await callClaudeAPI(answers, livro, autor, tipo, perfil);
      if (r && r.ancora && r.espelho) return r;
    } catch (e) { console.error('API call failed:', e?.message); }
  }
  await new Promise(r => setTimeout(r, 1800));
  return gerarSinteseLocal(answers, livro, tipo, lang || "pt");
}

// ── API call, reflexão semanal ───────────────────────────
async function gerarReflexaoSemanal(rituais, perfil, lang) {
  const apiKey = import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_ANTHROPIC_KEY;
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

  const langInstS = lang === "en" ? "respond in english. warm, direct, thoughtful." : "responda em português brasileiro. voz quente, lowercase.";
  const txt = `
${langInstS} ${nomeTxt} ${pronomesTxt} sem travessão.

você passou anos lendo pessoas. sabe que o que aparece numa semana raramente é coincidência.

a pessoa fez ${rituais.length} rituais esta semana:

${resumo}

responda com cinco campos, cada um com uma ideia só, bem dita. linguagem quente, lowercase, sem travessão, sem formalidade. voz de ana holanda, ana suy e vida simples combinadas.

"fio": o padrão ou tema que atravessou as leituras, identificado a partir do que foi realmente escrito. não invente padrões que não existem, se não houver um fio claro, diga isso com leveza. 2-3 frases. use "me parece que", "isso sugere que". sem travessão.

"conexao": uma conexão específica entre dois ou mais rituais que provavelmente não foi percebida. concreta, baseada no que foi escrito. pode trazer um autor, conceito ou obra que conecta, mas só se for certeiro, não forçado. termine com "faz sentido pra você?". sem travessão.

"pergunta": uma única pergunta reflexiva, nascida directamente do que foi trazido esta semana. não genérica, deve ser a pergunta que só poderia ser feita a esta pessoa depois de ler tudo isso. sem travessão.

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

// ── API call, resumo mensal ──────────────────────────────
async function gerarResumoMensal(rituais, mes, perfil, lang) {
  const apiKey = import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_ANTHROPIC_KEY;
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

  const langInstM = lang === "en" ? "respond in english. warm, direct voice." : "responda em português brasileiro. voz quente, lowercase.";
  const txt = `
${langInstM} ${nomeTxt} ${pronomesTxt}. sem travessão.

a pessoa fez ${rituais.length} rituais em ${mes}:

${resumo}

responda com um resumo mensal em cinco campos:

"temas": os 2-3 temas que mais apareceram ao longo do mês, identificados a partir do que foi realmente escrito. concreto, específico, baseado nas reflexões reais. não invente padrões que não existem. sem travessão.

"crescendo": algo que apareceu mais de uma vez, uma preocupação, um desejo, uma pergunta que parece estar amadurecendo. observação gentil, sem diagnose. use "me parece que". sem travessão.

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
function loadLang() { try { return localStorage.getItem("dlav_lang") || "pt"; } catch { return "pt"; } }
function saveLang(l) { try { localStorage.setItem("dlav_lang", l); } catch {} }

// ── translations ──────────────────────────────────────────
const UI = {
  pt: {
    startLabel: "iniciar", startRitual: "ritual de leitura",
    repertoire: "repertório", lastRitual: "último ritual",
    ritualsDone: "rituais feitos",
    weeklyNew: "novo", weeklyReady: "sua reflexão da semana está pronta",
    monthlyLabel: "resumo do mês", monthlyReady: (m) => `seu ${m} em reflexões está pronto`,
    back: "voltar", backToStart: "voltar ao início",
    typeQuestion: "o que você quer trazer?", titleLabel: "título",
    generate: "gerar síntese →", next: "próximo →", save: "guardar e ir ✓",
    essential: "o essencial", entrelinhas: "entrelinhas", reperLabel: "repertório",
    practice: "conhecimento na prática", yourReflections: "suas reflexões",
    resonated: "essa síntese ressoou com você?",
    feedbackMeh: "obrigada por dizer. isso ajuda a melhorar.",
    feedbackOk: "fico feliz que algo ficou.",
    feedbackGreat: "que bom. isso é exatamente o que queremos.",
    journalTitle: "se quiseres continuar...",
    journalSub: "perguntas para o caderno ou uma conversa",
    searchPlaceholder: "buscar no repertório...",
    emptyRepo: "seu repertório está esperando a primeira entrada.",
    startFirst: "começar agora →",
    streakMsg: (n) => n === 0 ? "seu ritual começa hoje." : n === 1 ? "primeiro passo dado. isso é tudo que importa." : n < 7 ? `${n} dias construindo uma prática real.` : "uma semana inteira. o hábito está se formando.",
    milestones: { 1: "primeiro ritual. bem-vinda.", 3: "três rituais. o hábito está a começar.", 7: "uma semana de prática. isso não é pouco.", 10: "dez rituais. já tens um arquivo vivo do teu pensamento.", 21: "21 rituais. a neurociência diz que é aqui que o hábito se instala.", 50: "cinquenta rituais. isso é uma prática real." },
    streakBroken: "voltaste. isso é o que importa.",
    encourage: ["pode ser uma palavra, uma frase solta, uma sensação. não precisa fazer sentido.", "não tem resposta certa. o que vier primeiro costuma ser o mais verdadeiro.", "pequeno conta. não precisa ser uma transformação de vida."],
    placeholder: "escreve aqui. pode ser bagunçado.",
    chars: "caracteres",
    movements: ["capturar", "conectar", "converter"],
    movOf: "movimento", movOf3: "de 03",
    loadingMsgs: ["deixa eu pensar no que você trouxe...", "lendo nas entrelinhas...", "tem algo aqui que vale guardar.", "um momento só...", "pensando com cuidado...", "a gente volta já.", "cada escolha deixa uma marca. vamos encontrar a sua.", "quase lá..."],
    weekTitle: "sua semana em reflexões", weekWhat: "o que passou por aqui",
    weekThread: "o fio que atravessou tudo", weekConnection: "uma conexão que apareceu",
    weekConcepts: "conceitos da semana", weekQuestion: "uma pergunta pra levar",
    monthWhat: "conteúdos do mês", monthThemes: "os temas do mês",
    monthGrowing: "o que está crescendo", monthDeeper: "para ir mais além",
    monthConcepts: "conceitos do mês", monthQuestion: "a pergunta do mês",
    conceptWhat: "o que é", conceptAppeared: "como apareceu nas suas reflexões",
    conceptTension: "a conversa que existe", conceptDeeper: "para ir mais além", conceptClose: "fechar ↑",
    loadingWeek: "olhando pra sua semana inteira...", loadingMonth: "olhando pro seu mês inteiro...",
    weekFallback: (n) => `você fez ${n} rituais essa semana. o que você está tentando entender?`,
    monthFallback: (n) => `você fez ${n} rituais esse mês. isso já é muito.`,
    langLabel: "idioma",
    onboardLangQ: "em que língua preferes usar o app?",
    onboardLangs: ["🇧🇷 português", "🇬🇧 english"],
    onboardSkip: "pular por agora",
    movementDescs: (tipo) => [
      `o que ficou depois que você terminou ${tipo==="filme"?"o filme":tipo==="podcast"?"o podcast":tipo==="video"?"o vídeo":tipo==="ideia"?"essa ideia":"o livro"}`,
      "onde essa ideia vive na sua vida agora",
      "o que você vai fazer com isso essa semana",
    ],
    subtitleRitual: (tipo) => `sua voz ${tipo==="filme"?"nesse filme":tipo==="podcast"?"nesse podcast":tipo==="video"?"nesse vídeo":tipo==="ideia"?"nessa ideia":"nessa leitura"}`,
    tipos: [
      {id:"livro",label:"📖 livro",placeholder:"ex: a sociedade do cansaço",autorLabel:"autor (opcional)",autorPlaceholder:"ex: byung-chul han"},
      {id:"filme",label:"🎬 filme",placeholder:"ex: boyhood",autorLabel:"diretor (opcional)",autorPlaceholder:"ex: richard linklater"},
      {id:"podcast",label:"🎙️ podcast",placeholder:"ex: huberman lab",autorLabel:"episódio ou host (opcional)",autorPlaceholder:"ex: ep. sobre sono"},
      {id:"video",label:"▶️ vídeo",placeholder:"ex: palestra de brené brown",autorLabel:"canal ou autor (opcional)",autorPlaceholder:"ex: ted talks"},
      {id:"ideia",label:"💡 uma ideia",placeholder:"ex: sobre o valor do silêncio",autorLabel:"origem (opcional)",autorPlaceholder:"ex: conversa com uma amiga"},
    ],
  },
  en: {
    startLabel: "start", startRitual: "reading ritual",
    repertoire: "library", lastRitual: "last ritual",
    ritualsDone: "rituals done",
    weeklyNew: "new", weeklyReady: "your weekly reflection is ready",
    monthlyLabel: "monthly review", monthlyReady: (m) => `your ${m} review is ready`,
    back: "back", backToStart: "back to home",
    typeQuestion: "what are you bringing?", titleLabel: "title",
    generate: "generate synthesis →", next: "next →", save: "save and go ✓",
    essential: "the essential", entrelinhas: "between the lines", reperLabel: "expand",
    practice: "knowledge in practice", yourReflections: "your reflections",
    resonated: "did this synthesis resonate?",
    feedbackMeh: "thank you for saying so. it helps us improve.",
    feedbackOk: "glad something landed.",
    feedbackGreat: "wonderful. that's exactly what we're here for.",
    journalTitle: "if you want to keep going...",
    journalSub: "questions for your journal or a conversation",
    searchPlaceholder: "search your library...",
    emptyRepo: "your library is waiting for the first entry.",
    startFirst: "start now →",
    streakMsg: (n) => n === 0 ? "your ritual starts today." : n === 1 ? "first step taken. that's everything." : n < 7 ? `${n} days building a real practice.` : "a full week. the habit is forming.",
    milestones: { 1: "first ritual. welcome.", 3: "three rituals. the habit is starting.", 7: "one week of practice. that's not nothing.", 10: "ten rituals. you already have a living archive of your thinking.", 21: "21 rituals. neuroscience says this is where habits truly install.", 50: "fifty rituals. this is a real practice." },
    streakBroken: "you came back. that's what matters.",
    encourage: ["one word, a loose thought, a feeling. it doesn't have to make sense.", "there's no right answer. what comes first is usually what's most true.", "small counts. it doesn't have to be a life transformation."],
    placeholder: "write here. messy is fine.",
    chars: "characters",
    movements: ["capture", "connect", "convert"],
    movOf: "movement", movOf3: "of 03",
    loadingMsgs: ["let me sit with what you shared...", "reading between the lines...", "there's something worth keeping here.", "just a moment...", "thinking carefully...", "every choice leaves a mark. let's find yours.", "almost there..."],
    weekTitle: "your week in reflections", weekWhat: "what came through",
    weekThread: "the thread that ran through it all", weekConnection: "a connection that emerged",
    weekConcepts: "concepts of the week", weekQuestion: "a question to carry",
    monthWhat: "content this month", monthThemes: "themes of the month",
    monthGrowing: "what's growing", monthDeeper: "go deeper",
    monthConcepts: "concepts of the month", monthQuestion: "the question of the month",
    conceptWhat: "what it is", conceptAppeared: "how it appeared in your rituals",
    conceptTension: "the conversation that exists", conceptDeeper: "go further", conceptClose: "close ↑",
    loadingWeek: "looking at your whole week...", loadingMonth: "looking at your whole month...",
    weekFallback: (n) => `you did ${n} rituals this week. what are you trying to understand?`,
    monthFallback: (n) => `you did ${n} rituals this month. that's already a lot.`,
    langLabel: "language",
    onboardLangQ: "which language would you like to use?",
    onboardLangs: ["🇧🇷 português", "🇬🇧 english"],
    onboardSkip: "skip for now",
    movementDescs: (tipo) => [
      `what stayed after you finished ${tipo==="filme"?"the film":tipo==="podcast"?"the podcast":tipo==="video"?"the video":tipo==="ideia"?"that idea":"the book"}`,
      "where does this idea live in your life right now",
      "what will you do with this in the next week",
    ],
    subtitleRitual: (tipo) => `your voice on ${tipo==="filme"?"this film":tipo==="podcast"?"this podcast":tipo==="video"?"this video":tipo==="ideia"?"this idea":"this read"}`,
    tipos: [
      {id:"livro",label:"📖 book",placeholder:"e.g. the courage to be disliked",autorLabel:"author (optional)",autorPlaceholder:"e.g. ichiro kishimi"},
      {id:"filme",label:"🎬 film",placeholder:"e.g. boyhood",autorLabel:"director (optional)",autorPlaceholder:"e.g. richard linklater"},
      {id:"podcast",label:"🎙️ podcast",placeholder:"e.g. on being",autorLabel:"episode or host (optional)",autorPlaceholder:"e.g. ep. on grief"},
      {id:"video",label:"▶️ video",placeholder:"e.g. brené brown ted talk",autorLabel:"channel or author (optional)",autorPlaceholder:"e.g. ted talks"},
      {id:"ideia",label:"💡 an idea",placeholder:"e.g. on the value of silence",autorLabel:"source (optional)",autorPlaceholder:"e.g. conversation with a friend"},
    ],
  },
};

// ── EN prompts by tipo ────────────────────────────────────
const PROMPTS_EN = {
  livro: {
    capturar: ["what phrase stayed in your head even after you closed the book?","if this book were a conversation, what would it be saying to you?","what surprised you, something that contradicted what you already thought?","which idea did you go back and read more than once?","what kept nagging at you in a good way?"],
    conectar: ["where in your life is this happening right now?","if this book were a mirror, what would it be showing?","does this resonate with something you already know but don't yet act on?","where do you feel this, in relationships, at work, in yourself?","did anyone come to mind while you were reading? why?"],
    converter: ["if you were going to do one thing with all of this, what would it be?","what's the smallest possible gesture that would already change something?","what would change if you took this idea seriously for a week?","what do you want to remember from this a month from now?","if this book gave you permission for something, what would it be?"],
  },
  filme: {
    capturar: ["what scene stayed in your head even after the lights came on?","if this film were a conversation, what would it be saying to you?","what surprised you, something you didn't expect to see?","which character or moment are you still sitting with?","what kept nagging at you in a good way?"],
    conectar: ["where in your life is this happening right now?","if this film were a mirror, what would it be showing?","did any character remind you of someone, or of yourself?","where do you feel this, in relationships, at work, in yourself?","is there something in this film you'd want to show someone specific? why?"],
    converter: ["if you were going to take one thing from this film into your life?","what's the smallest possible gesture that comes from what you saw?","what would change if you took this idea seriously for a week?","what do you want to remember from this film a month from now?","if this film gave you permission for something, what would it be?"],
  },
  podcast: {
    capturar: ["which idea from this episode are you still digesting?","if this podcast were a conversation, what would it be saying?","what surprised you, something that contradicted what you thought?","which moment made you pause, even without knowing why?","what kept echoing after you took out your earphones?"],
    conectar: ["where in your life is this happening right now?","if this episode were a mirror, what would it be showing?","does this resonate with something you already know but don't act on?","where do you feel this, in relationships, at work, in yourself?","is there someone who needs to hear this episode? why?"],
    converter: ["if you were going to do one thing with what you heard?","what's the smallest possible gesture from what you heard?","what would change if you took this seriously for a week?","what do you want to remember from this episode?","if this podcast gave you permission for something, what would it be?"],
  },
  video: {
    capturar: ["which idea from this video are you still digesting?","if this video were a conversation, what would it be saying?","what surprised you?","which moment did you replay, even without knowing why?","what kept nagging at you in a good way?"],
    conectar: ["where in your life is this happening right now?","if this video were a mirror, what would it be showing?","does this resonate with something you already know?","where do you feel this?","did anyone come to mind while you were watching? why?"],
    converter: ["if you were going to do one thing with what you saw?","what's the smallest possible gesture?","what would change if you took this seriously for a week?","what do you want to remember?","if this video gave you permission for something, what would it be?"],
  },
  ideia: {
    capturar: ["where did this idea come from, and why did it stay?","if this idea were a question, what would it be?","what in this idea contradicted something you already thought?","which part are you still trying to understand?","what is this idea nagging at you about in a good way?"],
    conectar: ["where in your life is this idea showing up right now?","if this idea were a mirror, what would it be showing?","does this resonate with something you haven't named yet?","where do you feel this idea?","is there someone you'd want to share this with? why?"],
    converter: ["if you were going to do one thing with this idea?","what's the smallest possible gesture?","what would change if you took this seriously for a week?","what do you want to remember?","if this idea gave you permission for something, what would it be?"],
  },
};

// ══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView]       = useState("loading");
  const [entries, setEntries] = useState(() => loadEntries());
  const [selected, setSelected] = useState(null);
  const [perfil, setPerfil]   = useState(() => loadPerfil());
  const [lang, setLang]       = useState(() => loadLang());

  useEffect(() => {
    if (loadOnboarded()) setView("home");
    else setView("onboarding");
  }, []);

  const ui = UI[lang] || UI.pt;
  const addEntry = (e) => { const next = [e, ...entries]; setEntries(next); saveEntries(next); };
  const savePer = (p) => { setPerfil(p); savePerfil(p); };
  const changeLang = (l) => { setLang(l); saveLang(l); };

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

  // resumo mensal, rituais do mês passado
  const mesPassado = new Date();
  mesPassado.setMonth(mesPassado.getMonth() - 1);
  const mesPassadoKey = getMesKey(mesPassado);
  const rituaisMesPassado = entries.filter(e => e.date?.slice(0, 7) === mesPassadoKey);
  const mostrarResumoMensal = rituaisMesPassado.length >= 2;
  const mostrarReflexaoSemanal = rituaisEssaSemana.length >= 3;
  const nomeDisplay = perfil?.nome ? `, ${perfil.nome}` : "";
  const milestone = ui.milestones[entries.length];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: C.text, WebkitFontSmoothing: "antialiased" }}>
      {view === "loading"       && <div style={{ minHeight: "100vh" }} />}
      {view === "onboarding"    && <Onboarding ui={ui} lang={lang} onComplete={(p, l) => { savePer(p); if(l) changeLang(l); saveOnboarded(); setView("home"); }} />}
      {view === "home"          && <Home ui={ui} lang={lang} streak={streak} entries={entries} setView={setView} setSelected={setSelected} nomeDisplay={nomeDisplay} mostrarReflexaoSemanal={mostrarReflexaoSemanal} rituaisEssaSemana={rituaisEssaSemana} mostrarResumoMensal={mostrarResumoMensal} rituaisMesPassado={rituaisMesPassado} mesPassado={mesPassado} milestone={milestone} />}
      {view === "ritual"        && <Ritual ui={ui} lang={lang} onSave={addEntry} setView={setView} perfil={perfil} totalEntries={entries.length} />}
      {view === "biblioteca"    && <Biblioteca ui={ui} lang={lang} entries={entries} setView={setView} setSelected={setSelected} />}
      {view === "entrada"       && <EntradaDetalhe ui={ui} lang={lang} entry={selected} setView={setView} />}
      {view === "semanal"       && <ReflexaoSemanal ui={ui} lang={lang} rituais={rituaisEssaSemana} setView={setView} perfil={perfil} />}
      {view === "mensal"        && <ResumoMensal ui={ui} lang={lang} rituais={rituaisMesPassado} mes={getMesNome(mesPassado)} setView={setView} perfil={perfil} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════════════
function Onboarding({ ui, lang: initLang, onComplete }) {
  const [step, setStep]     = useState(0);
  const [nome, setNome]     = useState("");
  const [pronomes, setPronomes] = useState("");
  const [selLang, setSelLang] = useState(initLang || "pt");
  const uiO = UI[selLang] || UI.pt;

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
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 400, fontStyle: "italic", color: C.gold, margin: "0 0 20px", letterSpacing: "0.05em" }}>lumière</p>
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
          <p style={{ fontSize: "13px", color: C.muted, marginBottom: "10px" }}>{uiO.onboardLangQ}</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {["pt","en"].map((l, i) => (
              <button key={l} onClick={() => setSelLang(l)} style={{ flex: 1, padding: "10px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", background: selLang===l ? `${C.gold}22` : C.surface, border: `1px solid ${selLang===l ? C.gold : C.border}`, color: selLang===l ? C.gold : C.mutedHi, transition: "all 0.2s" }}>{(UI[selLang]||UI.pt).onboardLangs[i]}</button>
            ))}
          </div>
          <p style={{ fontSize: "14px", color: C.text, lineHeight: 1.7, marginBottom: "20px" }}>{uiO.bodies?.[3] || "como prefere ser chamado aqui? (opcional)"}</p>
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
        if (isUltimo) onComplete({ nome: nome.trim() || null, pronomes: pronomes || null }, selLang);
        else setStep(s => s + 1);
      }}>
        {t.botao}
      </Btn>

      {isUltimo && (
        <button onClick={() => onComplete({ nome: null, pronomes: null }, selLang)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
          {uiO.onboardSkip}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════
function Home({ ui, lang, streak, entries, setView, setSelected, nomeDisplay, mostrarReflexaoSemanal, rituaisEssaSemana, mostrarResumoMensal, rituaisMesPassado, mesPassado, milestone }) {
  const recent = entries.slice(0, 1);
  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: "48px" }}>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "26px", fontWeight: 400, fontStyle: "italic", color: C.gold, margin: "0 0 4px", letterSpacing: "0.03em" }}>lumière</p>
        <p style={{ fontSize: "12px", color: C.muted, letterSpacing: "0.15em", margin: 0 }}>do consumo à clareza</p>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "20px 24px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "40px", color: C.gold, margin: 0, lineHeight: 1 }}>{streak}</p>
          <p style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0" }}>rituais feitos</p>
        </div>
        <div style={{ flex: 1, paddingLeft: "20px", borderLeft: `1px solid ${C.border}` }}>
          <p style={{ fontSize: "13px", color: C.text, margin: "0 0 4px", lineHeight: 1.5 }}>
            {ui.streakMsg(streak)}{streak === 0 && nomeDisplay}
          </p>
          <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>{entries.length} {lang === "en" ? (entries.length === 1 ? "entry" : "entries") : (entries.length === 1 ? "entrada" : "entradas")}</p>
        </div>
      </div>

      <Btn onClick={() => setView("ritual")} style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ textAlign: "left" }}>
          <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.2em", color: C.goldDim, textTransform: "uppercase", marginBottom: "3px" }}>iniciar</span>
          <span style={{ display: "block", fontSize: "17px", fontFamily: "'Cormorant Garamond', Georgia, serif", color: C.cream }}>ritual de leitura</span>
        </span>
        <span style={{ fontSize: "18px", color: C.gold }}>→</span>
      </Btn>

      {milestone && (
        <div style={{ background: `${C.success}18`, border: `1px solid ${C.success}44`, borderRadius: "6px", padding: "14px 18px", marginBottom: "12px" }}>
          <p style={{ fontSize: "13px", color: C.success, margin: 0 }}>✦ {milestone}</p>
        </div>
      )}

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
        <span>repertório</span><span style={{ color: C.muted }}>→</span>
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
          <p style={{ fontSize: "11px", color: C.goldDim, marginTop: "8px" }}>— lumière</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// RITUAL
// ══════════════════════════════════════════════════════════
function Ritual({ ui, lang, onSave, setView, perfil, totalEntries }) {
  const [step, setStep]         = useState(0);
  const [livro, setLivro]       = useState("");
  const [autor, setAutor]       = useState("");
  const [tipo, setTipo]         = useState("livro");
  const [answers, setAnswers]   = useState({ capturar: "", conectar: "", converter: "" });
  const [prompts]               = useState(() => {
    const pool = lang === "en" ? (PROMPTS_EN[tipo] || PROMPTS_EN.livro) : (PROMPTS[tipo] || PROMPTS.livro);
    return { capturar: randomPick(pool.capturar), conectar: randomPick(pool.conectar), converter: randomPick(pool.converter) };
  });
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [loadingMsg]            = useState(randomPick(ui.loadingMsgs || LOADING_MSGS));
  const [feedback, setFeedback] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const taRef = useRef();

  useEffect(() => { taRef.current?.focus(); }, [step]);

  const keys  = ["capturar","conectar","converter"];
  const movDescs = ui.movementDescs ? ui.movementDescs(tipo) : [
    `o que ficou depois que você terminou ${tipo==="filme"?"o filme":tipo==="podcast"?"o podcast":tipo==="video"?"o vídeo":tipo==="ideia"?"essa ideia":"o livro"}`,
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
      const r = await gerarSintese(answers, livro, autor, tipo, perfil, lang);
      setResult(r);
      setStep(5);
      const newTotal = totalEntries + 1;
      if ([1,3,7,10,21,50].includes(newTotal)) setCelebrating(true);
      onSave({ livro, autor, tipo, lang, ...answers, ancora: r.ancora, espelho: r.espelho, expansao: r.expansao, convite: r.convite, cuidado: r.cuidado, journaling: r.journaling, date: new Date().toISOString() });
    } catch {
      onSave({ livro, autor, tipo, lang, ...answers, date: new Date().toISOString() });
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
      <p style={{ fontSize: "13px", color: C.muted, marginBottom: "20px", lineHeight: 1.7 }}>pode ser um livro, filme, podcast, vídeo, ou simplesmente uma ideia que ficou.</p>

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
        <p style={{ fontSize: "11px", color: C.muted, marginBottom: "12px" }}>{movDescs[step-1]}</p>
        <div style={{ background: `${C.gold}11`, border: `1px solid ${C.gold}22`, borderRadius: "4px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: C.text, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>{prompts[k]}</p>
        </div>
        <p style={{ fontSize: "12px", color: C.goldDim, marginBottom: "12px", fontStyle: "italic" }}>
          {step === 1 && "pode ser uma palavra, uma frase solta, uma sensação. não precisa fazer sentido."}
          {step === 2 && "não tem resposta certa. o que vier primeiro costuma ser o mais verdadeiro."}
          {step === 3 && "pequeno conta. não precisa ser uma transformação de vida."}
        </p>
        <textarea ref={taRef} value={answers[k]} onChange={e => setAnswers(a => ({ ...a, [k]: e.target.value }))}
          placeholder="escreve aqui. pode ser bagunçado."
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

      {result?.journaling?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <button onClick={() => setShowJournal(!showJournal)} style={{ width: "100%", padding: "12px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.mutedHi, fontSize: "13px" }}>
            <span>{ui.journalTitle || "se quiseres continuar..."}</span>
            <span>{showJournal ? "↑" : "+"}</span>
          </button>
          {showJournal && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: "16px 18px" }}>
              <p style={{ fontSize: "11px", color: C.muted, marginBottom: "12px" }}>{ui.journalSub || "perguntas para o caderno ou uma conversa"}</p>
              {result.journaling.map((q, i) => (
                <div key={i} style={{ marginBottom: "10px", paddingLeft: "12px", borderLeft: `2px solid ${C.gold}44` }}>
                  <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{q}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {celebrating && (
        <div style={{ background: `${C.success}18`, border: `1px solid ${C.success}44`, borderRadius: "6px", padding: "14px 18px", marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", color: C.success, margin: 0 }}>✦ {ui.milestones?.[totalEntries + 1] || ""}</p>
        </div>
      )}


      <div style={{ marginTop: "28px", borderTop: `1px solid ${C.border}`, paddingTop: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.muted, textTransform: "uppercase", marginBottom: "14px" }}>suas reflexões</p>
        {["capturar","conectar","converter"].map((k, i) => (
          <div key={k} style={{ marginBottom: "14px" }}>
            <p style={{ fontSize: "10px", color: C.goldDim, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>0{i+1} {ui.movements?.[i] || k}</p>
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
      <Btn onClick={() => setView("home")}>{ui.save || "guardar e ir ✓"}</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// REFLEXÃO SEMANAL
// ══════════════════════════════════════════════════════════
function ReflexaoSemanal({ ui, lang, rituais, setView, perfil }) {
  const [reflexao, setReflexao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const livros = rituais.map(r => r.livro).join(", ");
  const ancoras = rituais.filter(r => r.ancora).map(r => `"${r.ancora}"`);

  useEffect(() => {
    gerarReflexaoSemanal(rituais, perfil, lang).then(r => { setReflexao(r); setCarregando(false); });
  }, []);

  if (carregando) return (
    <Screen title="" subtitle="">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${C.gold}44`, borderTopColor: C.gold, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "15px", color: C.text, fontStyle: "italic" }}>{ui.loadingWeek || "olhando pra sua semana inteira..."}</p>
      </div>
    </Screen>
  );

  return (
    <Screen title={ui.weekTitle || "sua semana em reflexões"} subtitle={`${rituais.length} rituais`} onBack={() => setView("home")}>
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
          <ResultBlock label={ui.weekThread || "o fio que atravessou tudo"} color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{reflexao.fio}</p></ResultBlock>
          <ResultBlock label={ui.weekConnection || "uma conexão que apareceu"} color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{reflexao.conexao}</p></ResultBlock>
          {reflexao.conceitos && <MapaConceitos conceitos={reflexao.conceitos} ui={ui} />}
          <ResultBlock label={ui.weekQuestion || "uma pergunta pra levar"} color={C.success}><p style={{ fontSize: "15px", color: C.cream, lineHeight: 1.7, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>{reflexao.pergunta}</p></ResultBlock>
          <div style={{ textAlign: "center", padding: "16px 0" }}><p style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.8 }}>{reflexao.fechamento}</p></div>
        </>
      ) : (
        <ResultBlock label="esta semana" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{ui.weekFallback ? ui.weekFallback(rituais.length) : `você fez ${rituais.length} rituais essa semana.`}</p></ResultBlock>
      )}
      <Btn onClick={() => setView("home")}>voltar</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// RESUMO MENSAL
// ══════════════════════════════════════════════════════════
function ResumoMensal({ ui, lang, rituais, mes, setView, perfil }) {
  const [resumo, setResumo]     = useState(null);
  const [carregando, setCarregando] = useState(true);
  const livros = [...new Set(rituais.map(r => r.livro))].join(", ");

  useEffect(() => {
    gerarResumoMensal(rituais, mes, perfil, lang).then(r => { setResumo(r); setCarregando(false); });
  }, []);

  if (carregando) return (
    <Screen title="" subtitle="">
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${C.blush}44`, borderTopColor: C.blush, margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "15px", color: C.text, fontStyle: "italic" }}>{ui.loadingMonth || "olhando pro seu mês inteiro..."}</p>
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
          <ResultBlock label={ui.monthThemes || "os temas do mês"} color={C.gold}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.temas}</p></ResultBlock>
          <ResultBlock label={ui.monthGrowing || "o que está crescendo"} color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.crescendo}</p></ResultBlock>
          <ResultBlock label={ui.monthDeeper || "para ir mais além"} color={C.goldDim}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{resumo.aprofundar}</p></ResultBlock>
          {resumo.conceitos && <MapaConceitos conceitos={resumo.conceitos} ui={ui} />}
          <ResultBlock label={ui.monthQuestion || "a pergunta do mês"} color={C.success}><p style={{ fontSize: "16px", color: C.cream, lineHeight: 1.7, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>{resumo.pergunta}</p></ResultBlock>
          <div style={{ textAlign: "center", padding: "16px 0" }}><p style={{ fontSize: "12px", color: C.muted, fontStyle: "italic", lineHeight: 1.8 }}>{resumo.fechamento}</p></div>
        </>
      ) : (
        <ResultBlock label="este mês" color={C.blush}><p style={{ fontSize: "13px", color: C.text, lineHeight: 1.8, margin: 0 }}>{ui.monthFallback ? ui.monthFallback(rituais.length) : `você fez ${rituais.length} rituais esse mês.`}</p></ResultBlock>
      )}
      <Btn onClick={() => setView("home")}>voltar</Btn>
    </Screen>
  );
}

// ══════════════════════════════════════════════════════════
// BIBLIOTECA
// ══════════════════════════════════════════════════════════
function Biblioteca({ ui, lang, entries, setView, setSelected }) {
  const [search, setSearch] = useState("");
  const filtered = entries.filter(e =>
    [e.livro, e.autor, e.ancora].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <Screen title="repertório" subtitle={`${entries.length} ${entries.length === 1 ? "entrada" : "entradas"}`} onBack={() => setView("home")}>
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: "14px", color: C.muted, fontStyle: "italic" }}>sua biblioteca está esperando o primeiro livro.</p>
          <button onClick={() => setView("ritual")} style={{ ...btnBase(), marginTop: "20px", padding: "12px 24px" }}>iniciar primeiro ritual →</button>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="buscar no repertório..."
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
function EntradaDetalhe({ ui, lang, entry, setView }) {
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
// MAPA DE CONCEITOS, TAGS A3
// ══════════════════════════════════════════════════════════
function MapaConceitos({ conceitos, ui }) {
  const [aberto, setAberto] = useState(null);
  if (!conceitos || conceitos.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: C.goldDim, textTransform: "uppercase", marginBottom: "12px" }}>{ui?.weekConcepts || "conceitos"}</p>
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
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>{ui?.conceptWhat || "o que é"}</p>
            <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0 }}>{conceitos[aberto].definicao}</p>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>{ui?.conceptAppeared || "como apareceu nos seus rituais"}</p>
            <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0 }}>{conceitos[aberto].apareceu}</p>
          </div>

          {conceitos[aberto].tensao && (
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "6px" }}>{ui?.conceptTension || "a conversa que existe"}</p>
              <p style={{ fontSize: "13px", color: C.text, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{conceitos[aberto].tensao}</p>
            </div>
          )}

          {conceitos[aberto].sugestao && (
            <div style={{ background: `${C.gold}11`, borderRadius: "4px", padding: "10px 14px" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.goldDim, textTransform: "uppercase", marginBottom: "4px" }}>{ui?.conceptDeeper || "para ir mais além"}</p>
              <p style={{ fontSize: "12px", color: C.text, lineHeight: 1.6, margin: 0 }}>{conceitos[aberto].sugestao}</p>
            </div>
          )}

          <button onClick={() => setAberto(null)} style={{
            background: "none", border: "none", color: C.muted,
            fontSize: "11px", cursor: "pointer", marginTop: "14px", padding: 0
          }}>{ui?.conceptClose || "fechar ↑"}</button>
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
