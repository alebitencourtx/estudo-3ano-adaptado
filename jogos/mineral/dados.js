/* jogos/mineral/dados.js — conteúdo declarativo dos jogos de Extrativismo mineral.
   Lido por jogos/jogar.html via ?jogo=<id>. Motores em ../jogo-kit.js.
   Substitui os 7 jogos antigos de jogos/mineral/jogo-mineral-*.html (livro p. 90 e 91).
   Os caminhos de imagem já estão no formato do jogador: ../img/... (o jogador fica em jogos/). */
(function (J) {

  /* ===== ligar-min — ligar mineral → produto (era jogo-mineral-ligar.html) ===== */
  J['ligar-min'] = {
    id:'ligar-min', topico:'mineral', tipo:'ligar',
    icone:'⛏️', titulo:'De onde vem?',
    instrucao:'Ligue cada mineral ao produto que ele ajuda a fazer.',
    fala:'Ligue cada mineral ao produto que ele ajuda a fazer.',
    dica:'Arraste um mineral até o produto. Ou toque no mineral e depois no produto.',
    apoio:'Os minerais saem da natureza e viram produtos.',
    lembrete:'O ferro, com outros elementos e altas temperaturas, vira aço.',
    creditos:[
      'Fotos do livro de História e Geografia do 3º ano, p. 90 e 91 (uso escolar).',
      'Fios de cobre, portão de ferro, sacos de cimento e leiteira de alumínio.'
    ],
    pares:[
      { id:'cobre',    palavra:'Cobre',    foto:'../img/hga/min/cobre.jpg',    alt:'Fios de cobre',
        nome:'Fios de cobre',        msg:'Do cobre vêm os fios elétricos.' },
      { id:'ferro',    palavra:'Ferro',    foto:'../img/hga/min/ferro.jpg',    alt:'Portão de ferro',
        nome:'Portão de ferro',      msg:'Do ferro vêm portões e ferramentas.' },
      { id:'calcario', palavra:'Calcário', foto:'../img/hga/min/cimento.jpg',  alt:'Sacos de cimento',
        nome:'Sacos de cimento',     msg:'Do calcário vem o cimento.' },
      { id:'bauxita',  palavra:'Bauxita',  foto:'../img/hga/min/aluminio.jpg', alt:'Leiteira de alumínio',
        nome:'Leiteira de alumínio', nota:'Objeto de alumínio (vem da bauxita)',
        msg:'Da bauxita vem o alumínio.' }
    ]
  };

  /* ===== mem-min — memória dos 3 pares iguais (era jogo-mineral-memoria.html) ===== */
  J['mem-min'] = {
    id:'mem-min', topico:'mineral', tipo:'memoria',
    icone:'⛏️', titulo:'Memória dos minerais',
    instrucao:'Encontre os 3 pares de fotos iguais.',
    colunas:3,
    pares:[
      { id:'cobre',   nome:'Cobre',   ico:'../img/hga/min/cobre.jpg',   frase:'Fios de cobre.' },
      { id:'ferro',   nome:'Ferro',   ico:'../img/hga/min/ferro.jpg',   frase:'Portão de ferro.' },
      { id:'cimento', nome:'Calcário', ico:'../img/hga/min/cimento.jpg', frase:'Do calcário vem o cimento.' }
    ],
    creditos:[
      'Fotos do livro didático, páginas 90 e 91 (uso escolar).',
      'Ícones: Twemoji, CC-BY 4.0.'
    ]
  };

  /* ===== min-perguntas — quiz de 5 rodadas (era jogo-mineral-produtos.html) ===== */
  J['min-perguntas'] = {
    id:'min-perguntas', topico:'mineral', tipo:'quiz',
    icone:'🔩', titulo:'Para que serve?',
    dica:'Toque na resposta.',
    creditos:[
      'Fotos do livro didático, p. 90 e 91 (uso escolar).',
      'Perguntas com palavras do livro (p. 90 e 91).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    /* icones vai alinhado com opcoes: cobre, ferro, areia, calcário→cimento,
       cimento e alumínio (da bauxita) tinham foto do livro; as demais opções não. */
    rodadas:[
      { pergunta:'Qual mineral é usado para fazer fios elétricos?',
        certa:'Cobre', opcoes:['Cobre', 'Areia', 'Calcário'],
        icones:['../img/hga/min/cobre.jpg', '../img/hga/min/areia.jpg', '../img/hga/min/cimento.jpg'],
        msg:'O cobre faz fios elétricos.' },
      { pergunta:'O ferro, com outros elementos e muito calor, vira o quê?',
        certa:'Aço', opcoes:['Aço', 'Cimento', 'Alumínio'],
        icones:['', '../img/hga/min/cimento.jpg', '../img/hga/min/aluminio.jpg'],
        msg:'O ferro pode virar aço.' },
      { pergunta:'Qual mineral é usado para fazer alumínio?',
        certa:'Bauxita', opcoes:['Bauxita', 'Cobre', 'Areia'],
        icones:['../img/hga/min/aluminio.jpg', '../img/hga/min/cobre.jpg', '../img/hga/min/areia.jpg'],
        msg:'O alumínio vem da bauxita.' },
      { pergunta:'Qual recurso é usado para fazer cimento?',
        certa:'Calcário', opcoes:['Calcário', 'Ferro', 'Areia'],
        icones:['../img/hga/min/cimento.jpg', '../img/hga/min/ferro.jpg', '../img/hga/min/areia.jpg'],
        msg:'O cimento vem do calcário.' },
      { pergunta:'Em que atividade a areia é usada?',
        certa:'Na construção', opcoes:['Na construção', 'Para fazer fios elétricos', 'Para virar aço'],
        icones:['', '', ''],
        msg:'A areia é usada na construção.' }
    ]
  };

  /* ===== min-natureza — ordem dos 3 passos (era jogo-mineral-natureza.html) ===== */
  J['min-natureza'] = {
    id:'min-natureza', topico:'mineral', tipo:'ordem',
    icone:'🌎', titulo:'Da natureza ao produto',
    fala:'Coloque os 3 passos na ordem.',
    dica:'Arraste um passo até o número. Ou toque no passo e depois no número.',
    detalhes:{ titulo:'Ver dica',
      texto:'Os minerais levam milhões de anos para se formar. Quando são retirados, diminuem na natureza.' },
    resumoFim:'Tudo na ordem certa!',
    creditos:[
      'Fotos do livro didático, p. 90 e 91 (uso escolar): fios de cobre e portão de ferro.',
      'Ícones Twemoji, CC-BY 4.0.'
    ],
    passos:[
      { nome:'Os minerais levam milhões de anos para se formar.',
        msg:'Os minerais levam milhões de anos para se formar.' },
      { nome:'Eles são extraídos da natureza.',
        msg:'Eles são extraídos da natureza.' },
      { nome:'Eles viram produtos do nosso dia a dia.',
        msg:'Eles viram produtos do nosso dia a dia.' }
    ]
  };

  /* ===== min-toque — toque nas 2 fichas certas, 3 telas (era jogo-mineral-toque.html) ===== */
  J['min-toque'] = {
    id:'min-toque', topico:'mineral', tipo:'toque',
    icone:'👆', titulo:'Toque nos certos',
    hint:'Toque em 2 fichas.',
    creditos:[
      'Fotos do livro didático, p. 90 e 91 (uso escolar).',
      'Palavras do livro (p. 90 e 91): cobre, ferro, areia, calcário.',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    /* cada tela tem o seu próprio banco: 2 certas + 1 distrator (3 fichas por tela) */
    telas:[
      { pergunta:'Toque nas duas opções feitas com cobre.',
        fichas:['Fios elétricos', 'Utensílios domésticos', 'Portão de ferro'],
        certas:['Fios elétricos', 'Utensílios domésticos'],
        msg:'O cobre faz fios e utensílios.',
        img:'../img/hga/min/cobre.jpg', alt:'Fios de cobre' },
      { pergunta:'Toque nas duas opções feitas de ferro.',
        fichas:['Ferramentas', 'Automóveis', 'Cimento'],
        certas:['Ferramentas', 'Automóveis'],
        msg:'Com o ferro fazemos ferramentas e automóveis.',
        img:'../img/hga/min/ferro.jpg', alt:'Portão de ferro' },
      { pergunta:'Toque nos dois recursos minerais.',
        fichas:['Areia', 'Calcário', 'Fios elétricos'],
        certas:['Areia', 'Calcário'],
        msg:'Os minerais saem do solo e do subsolo.',
        img:'../img/hga/min/areia.jpg', alt:'Monte de areia' }
    ]
  };

  /* ===== min-objetos — 7 cartões em 3 caixas de metal, 2 rodadas (era jogo-mineral-objetos.html) ===== */
  J['min-objetos'] = {
    id:'min-objetos', topico:'mineral', tipo:'classificar',
    icone:'🍳', titulo:'Do metal ao objeto',
    instrucao:'Qual metal é usado para fazer cada objeto?',
    hint:'Arraste um objeto até o metal. Ou toque no objeto e depois no metal.',
    erroComDestino:false,      /* o jogo antigo mostrava só a frase do cartão, sem "Vai na caixa ..." */
    detalhes:{ titulo:'Ver dica',
      texto:'O alumínio vem da bauxita. O ferro, com outros elementos e altas temperaturas, vira aço. O ferro também é usado em máquinas e eletrodomésticos.' },
    creditos:[
      'Fotos do livro didático, p. 90 e 91 (uso escolar): cobre, ferro e alumínio.',
      'Ícones: Twemoji, CC-BY 4.0.',
      'Texto base: livro do 3º ano, p. 90 e 91 (os minerais viram produtos de uso cotidiano).'
    ],
    alvos:[
      { id:'cobre',    nome:'Cobre',                foto:'../img/hga/min/cobre.jpg' },
      { id:'ferro',    nome:'Ferro',                foto:'../img/hga/min/ferro.jpg' },
      { id:'aluminio', nome:'Alumínio (da bauxita)', foto:'../img/hga/min/aluminio.jpg' }
    ],
    pecas:[
      { id:'fios',        alvo:'cobre',    ico:'../img/jogo/min/energia.svg',     nome:'Fios elétricos',
        msg:'O cobre faz fios elétricos.' },
      { id:'domesticos',  alvo:'cobre',                                           nome:'Utensílios domésticos',
        msg:'O cobre faz utensílios domésticos.' },
      { id:'ferramentas', alvo:'ferro',    ico:'../img/jogo/min/ferramentas.svg', nome:'Ferramentas',
        msg:'O ferro faz ferramentas.' },
      { id:'automoveis',  alvo:'ferro',                                           nome:'Automóveis',
        msg:'O ferro faz automóveis.' },
      { id:'cozinha',     alvo:'aluminio', ico:'../img/jogo/min/cozinha.svg',     nome:'Utensílios de cozinha',
        msg:'O alumínio faz utensílios de cozinha.' },
      { id:'bicicletas',  alvo:'aluminio', ico:'../img/jogo/min/bicicleta.svg',   nome:'Bicicletas',
        msg:'O alumínio faz bicicletas.' },
      { id:'avioes',      alvo:'aluminio', ico:'../img/jogo/min/aviao.svg',       nome:'Partes de aviões',
        msg:'O alumínio faz partes de aviões.' }
    ],
    /* 2 rodadas: cobre + ferro e, depois, o alumínio */
    rodadas:[
      ['fios', 'domesticos', 'ferramentas', 'automoveis'],
      ['cozinha', 'bicicletas', 'avioes']
    ],
    porRodada:4
  };

  /* ===== min-qual — quiz com foto, 5 rodadas (era jogo-mineral-qual-e.html) ===== */
  J['min-qual'] = {
    id:'min-qual', topico:'mineral', tipo:'quiz',
    icone:'🔍', titulo:'Qual é este material?',
    apoio:'Olhe a foto e escolha o material.',
    resumoFim:'Você acertou tudo!',
    creditos:[
      'Fotos do livro didático, p. 91; ícones Twemoji, CC-BY 4.0.',
      'Palavras do livro didático (p. 90 e 91).'
    ],
    rodadas:[
      { pergunta:'Que material aparece na foto?',
        certa:'Cobre', opcoes:['Cobre', 'Ferro', 'Areia'],
        msg:'A foto mostra fios de cobre.',
        img:'../img/hga/min/cobre.jpg', alt:'Fios de cobre' },
      { pergunta:'Que material aparece na foto?',
        certa:'Ferro', opcoes:['Ferro', 'Cobre', 'Cimento'],
        msg:'A foto mostra um portão de ferro.',
        img:'../img/hga/min/ferro.jpg', alt:'Portão de ferro' },
      { pergunta:'Que material aparece na foto?',
        certa:'Areia', opcoes:['Areia', 'Calcário', 'Alumínio'],
        msg:'A foto mostra um monte de areia.',
        img:'../img/hga/min/areia.jpg', alt:'Monte de areia' },
      { pergunta:'Que material aparece na foto?',
        certa:'Alumínio', opcoes:['Alumínio', 'Ferro', 'Areia'],
        msg:'A foto mostra um objeto de alumínio, que vem da bauxita.',
        img:'../img/hga/min/aluminio.jpg', alt:'Objeto de alumínio' },
      { pergunta:'Que material aparece na foto?',
        certa:'Cimento', opcoes:['Cimento', 'Areia', 'Cobre'],
        msg:'O cimento é feito de calcário.',
        img:'../img/hga/min/cimento.jpg', alt:'Sacos de cimento' }
    ]
  };

})(window.JOGOS = window.JOGOS || {});
