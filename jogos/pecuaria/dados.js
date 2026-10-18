/* jogos/pecuaria/dados.js — conteúdo declarativo dos jogos de Pecuária.
   Lido por jogos/jogar.html via ?jogo=<id>. Motores em ../jogo-kit.js.
   Substitui os 7 jogos antigos de jogos/pecuaria/jogo-pecuaria-*.html (livro p. 86 e 87).
   Os caminhos de imagem já estão no formato do jogador: ../img/... (o jogador fica em jogos/). */
(function (J) {

  /* ===== mem-pec — memória dos pares iguais (era jogo-pecuaria-memoria.html) ===== */
  J['mem-pec'] = {
    id:'mem-pec', topico:'pecuaria', tipo:'memoria',
    icone:'🐄', titulo:'Memória do pasto e do curral',
    instrucao:'Encontre os dois pares de fotos iguais.',
    colunas:4,
    pares:[
      { id:'extensiva', nome:'Pecuária extensiva', ico:'../img/hga/pec/pasto.jpg',
        frase:'Na extensiva, os animais são criados soltos em grandes áreas.' },
      { id:'intensiva', nome:'Pecuária intensiva', ico:'../img/hga/pec/curral.jpg',
        frase:'Na intensiva, os animais são criados confinados.' }
    ],
    creditos:[
      'Fotos do livro didático do 3º ano, página 86: gado solto no pasto e gado confinado no curral.'
    ]
  };

  /* ===== pec-perguntas — quiz de 7 rodadas (era jogo-pecuaria-perguntas.html) ===== */
  J['pec-perguntas'] = {
    id:'pec-perguntas', topico:'pecuaria', tipo:'quiz',
    icone:'🎯', titulo:'Perguntas da pecuária',
    dica:'Toque na resposta. Ou ouça com 🔊.',
    lembrete:'Por meio da pecuária obtemos leite, carnes, ovos e couro.',
    creditos:[
      'Fotos do livro do 3º ano, p. 86 e 87 (gado solto no pasto e gado confinado no curral).',
      'Ícone de emoji (leite): Twemoji, CC-BY 4.0.'
    ],
    rodadas:[
      { pergunta:'O que é pecuária?',
        certa:'Criação e reprodução de animais',
        errada:'Plantio ou colheita',
        msg:'Pecuária é a criação e a reprodução de animais.' },
      { pergunta:'Que importância a pecuária tem no Brasil?',
        certa:'É uma atividade econômica importante',
        errada:'É um trabalhador volante',
        msg:'A pecuária é uma atividade econômica importante no Brasil.' },
      { pergunta:'Na pecuária extensiva, onde o gado come?',
        certa:'Nas pastagens',
        errada:'No estábulo',
        msg:'Na extensiva, o gado come nas pastagens.',
        foto:'../img/hga/pec/pasto.jpg', alt:'Gado solto no pasto' },
      { pergunta:'Na pecuária intensiva, como o gado fica?',
        certa:'Confinado no curral',
        errada:'Solto no pasto',
        msg:'Na intensiva, o gado fica confinado.',
        foto:'../img/hga/pec/curral.jpg', alt:'Gado confinado no curral' },
      { pergunta:'Onde o gado recebe alimentação específica na intensiva?',
        certa:'No estábulo',
        errada:'Nas pastagens',
        msg:'No estábulo, o gado recebe alimentação específica.' },
      { pergunta:'O que se tira do gado na ordenha?',
        certa:'O leite',
        errada:'O couro',
        msg:'A ordenha retira o leite.',
        ico:'../img/jogo/pec/emoji/leite.svg', alt:'Leite' },
      { pergunta:'Como pode ser feita a ordenha na pecuária intensiva?',
        certa:'Por ordenha mecânica',
        errada:'Nas pastagens',
        msg:'Na intensiva, a retirada do leite pode ser feita por ordenha mecânica.' }
    ]
  };

  /* ===== pec-toque — toque nas 3 fichas certas, 2 telas (era jogo-pecuaria-toque.html) ===== */
  J['pec-toque'] = {
    id:'pec-toque', topico:'pecuaria', tipo:'toque',
    icone:'👆', titulo:'Toque nos certos',
    hint:'Toque em 3 fichas e depois em Conferir.',
    lembrete:'Na extensiva o gado fica solto. Na intensiva o gado fica confinado.',
    creditos:[
      'Fotos do livro do 3º ano, p. 86 e 87 (gado solto no pasto e gado confinado no curral).',
      'Ícones de emoji: Twemoji, CC-BY 4.0.'
    ],
    /* as mesmas 6 fichas nas 2 telas: 3 são da extensiva, 3 são da intensiva */
    fichas:[
      'Solto em grandes áreas',
      'Come nas pastagens',
      'Poucos trabalhadores',
      'Confinado',
      'Come no estábulo',
      'Mais trabalhadores'
    ],
    telas:[
      { titulo:'Pecuária extensiva',
        pergunta:'Toque nas 3 frases que combinam com a pecuária extensiva.',
        certas:['Solto em grandes áreas', 'Come nas pastagens', 'Poucos trabalhadores'],
        msg:'Na extensiva, o gado fica solto e come nas pastagens.',
        img:'../img/hga/pec/pasto.jpg', alt:'Gado solto no pasto' },
      { titulo:'Pecuária intensiva',
        pergunta:'Toque nas 3 frases que combinam com a pecuária intensiva.',
        certas:['Confinado', 'Come no estábulo', 'Mais trabalhadores'],
        msg:'Na intensiva, o gado fica confinado e come no estábulo.',
        img:'../img/hga/pec/curral.jpg', alt:'Gado confinado no curral' }
    ]
  };

  /* ===== pec-trabalhadores — ligar palavra → tarefa (era jogo-pecuaria-trabalhadores.html) ===== */
  J['pec-trabalhadores'] = {
    id:'pec-trabalhadores', topico:'pecuaria', tipo:'ligar',
    icone:'👷', titulo:'Trabalhadores do campo',
    instrucao:'Qual tarefa combina com cada trabalhador?',
    fala:'No campo, cada trabalhador tem uma tarefa.',
    dica:'Toque na palavra e depois na tarefa.',
    lembrete:'Nem todos os trabalhadores do campo têm boas condições de trabalho.',
    creditos:[
      'Ícones dos trabalhadores: Twemoji, CC-BY 4.0.',
      'Conteúdo (trabalhadores do campo): livro do 3º ano, páginas 86 e 87.'
    ],
    pares:[
      { id:'adm', palavra:'Administrador da propriedade',
        foto:'../img/jogo/pec/adm.svg', alt:'Organiza as atividades',
        nome:'Organiza as atividades',
        msg:'O administrador organiza os outros trabalhadores. Eles podem ser familiares ou contratados.' },
      { id:'trabalhador', palavra:'Trabalhador fixo',
        foto:'../img/jogo/pec/trabalhador.svg', alt:'Recebe um salário',
        nome:'Recebe um salário',
        msg:'O trabalhador fixo cuida das plantações ou dos animais. Recebe salário.' },
      { id:'parceiro', palavra:'Parceiro',
        foto:'../img/jogo/pec/parceiro.svg', alt:'Divide parte da produção',
        nome:'Divide parte da produção',
        msg:'O parceiro cuida das plantações ou dos animais. Divide parte da produção com o dono da propriedade.' },
      { id:'arrendatario', palavra:'Arrendatário',
        foto:'../img/jogo/pec/arrendatario.svg', alt:'Aluga parte da terra',
        nome:'Aluga parte da terra',
        msg:'O arrendatário aluga parte da terra. Escolhe o que vai plantar ou criar.' }
    ]
  };

  /* ===== pec-criacao — 8 cartões em 2 caixas, 3 rodadas (era jogo-pecuaria-criacao.html) ===== */
  J['pec-criacao'] = {
    id:'pec-criacao', topico:'pecuaria', tipo:'classificar',
    icone:'🐄', titulo:'Solto ou confinado?',
    instrucao:'Coloque cada cartão na caixa: Extensiva ou Intensiva.',
    apoio:'Na extensiva o gado vive solto. Na intensiva o gado fica no estábulo.',
    hint:'Arraste o cartão. Ou toque nele e na caixa.',
    creditos:[
      'Fotos de pasto e de curral: livro do 3º ano, p. 86 e 87.',
      'Emojis e ícones: Twemoji, CC-BY 4.0.'
    ],
    alvos:[
      { id:'extensiva', nome:'Extensiva', foto:'../img/hga/pec/pasto.jpg',
        alt:'Gado criado solto no pasto em Rio Rufino, Santa Catarina' },
      { id:'intensiva', nome:'Intensiva', foto:'../img/hga/pec/curral.jpg',
        alt:'Gado criado confinado em curral em Itaobim, Minas Gerais' }
    ],
    pecas:[
      { id:'solto',           alvo:'extensiva', nome:'Solto em grandes áreas',
        msg:'Na extensiva, o gado fica solto.' },
      { id:'pastagens',       alvo:'extensiva', nome:'Come nas pastagens',
        msg:'Na extensiva, o gado come nas pastagens.' },
      { id:'poucos',          alvo:'extensiva', nome:'Poucos trabalhadores',
        msg:'Na extensiva, poucos trabalhadores cuidam do gado.' },
      { id:'confinado',       alvo:'intensiva', nome:'Confinado',
        msg:'Na intensiva, o gado fica confinado. Confinado quer dizer mantido em ambiente cercado.' },
      { id:'sem-grande-area', alvo:'intensiva', nome:'Não precisa de grandes extensões de terra',
        msg:'Na intensiva, não são necessárias grandes extensões de terra.' },
      { id:'estabulo',        alvo:'intensiva', nome:'Alimentação específica no estábulo',
        msg:'No estábulo, área coberta onde o gado fica abrigado, ele recebe alimentação específica.' },
      { id:'ordenha',         alvo:'intensiva', nome:'Ordenha mecânica',
        msg:'A retirada de leite pode ser feita por ordenha mecânica.' },
      { id:'mais',            alvo:'intensiva', nome:'Mais trabalhadores',
        msg:'Na intensiva, é necessário um número maior de trabalhadores.' }
    ],
    /* 3 rodadas de até 3 cartões (cada rodada tem as 2 caixas) */
    rodadas:[
      ['solto', 'pastagens', 'confinado'],
      ['poucos', 'sem-grande-area', 'estabulo'],
      ['ordenha', 'mais']
    ],
    porRodada:3
  };

  /* ===== pec-volante — quiz de 5 rodadas (era jogo-pecuaria-volante.html) ===== */
  J['pec-volante'] = {
    id:'pec-volante', topico:'pecuaria', tipo:'quiz',
    icone:'🛻', titulo:'O trabalhador volante',
    dica:'Leia a pergunta e toque na resposta. Ou ouça com 🔊.',
    apoio:'O trabalhador volante faz plantio ou colheita por um tempo determinado.',
    lembrete:'Nem todos os trabalhadores do campo têm boas condições de trabalho: alguns trabalham sem equipamentos adequados, por um longo período e com baixa remuneração.',
    creditos:[
      'Ícones de emoji: Twemoji (CC BY 4.0).',
      'Conteúdo e fotos: livro didático do 3º ano, páginas 86 e 87 (uso escolar).'
    ],
    rodadas:[
      { pergunta:'Que outro nome o livro dá ao trabalhador volante?',
        certa:'Boia-fria',
        opcoes:['Administrador', 'Boia-fria', 'Arrendatário'],
        msg:'O trabalhador volante também é chamado boia-fria.',
        ico:'../img/jogo/pec/volante.svg', alt:'Trabalhador volante do campo' },
      { pergunta:'O que o trabalhador volante faz?',
        certa:'Plantio ou colheita por um tempo',
        opcoes:['Organiza as atividades', 'Plantio ou colheita por um tempo', 'Aluga parte da terra'],
        msg:'Ele faz plantio ou colheita por um tempo.' },
      { pergunta:'Onde muitos trabalhadores volantes vivem?',
        certa:'Nas cidades próximas',
        opcoes:['Nas pastagens', 'Nas cidades próximas', 'No estábulo'],
        msg:'Muitos vivem nas cidades próximas.' },
      { pergunta:'Como o trabalhador volante é levado até o trabalho?',
        certa:'De ônibus ou de caminhão',
        opcoes:['No plantio', 'De ônibus ou de caminhão', 'Na colheita'],
        msg:'Eles são transportados de ônibus ou de caminhão.' },
      { pergunta:'Como são as condições de trabalho de alguns trabalhadores do campo?',
        certa:'Sem equipamentos adequados, por longo período e com baixa remuneração',
        opcoes:['Recebendo um salário', 'Sem equipamentos adequados, por longo período e com baixa remuneração', 'Dividindo parte da produção'],
        msg:'Alguns trabalham sem equipamentos adequados, por um longo período e com baixa remuneração.' }
    ]
  };

  /* ===== pec-animais — 8 cartões em 2 grupos (era jogo-pecuaria-animais.html) ===== */
  J['pec-animais'] = {
    id:'pec-animais', topico:'pecuaria', tipo:'classificar',
    icone:'🧵', titulo:'Produtos da pecuária',
    instrucao:'Coloque os produtos citados em “Produtos citados”. Ponha os outros cartões em “Outras informações”.',
    apoio:'A pecuária é a criação e a reprodução de animais.',
    hint:'Arraste cada cartão para o grupo certo. Ou toque no cartão e depois no grupo.',
    erroComDestino:false,      /* o jogo antigo mostrava só a frase do cartão, sem "Vai na caixa ..." */
    lembrete:'Por meio da pecuária obtemos alimentos e matérias-primas, como leite, carnes, ovos e couro, que depois podem ser transformados em outros produtos nas indústrias.',
    creditos:[
      'Ícones ilustrativos: Twemoji, CC-BY 4.0.',
      'Texto base: livro do 3º ano, p. 86 e 87.'
    ],
    alvos:[
      { id:'produtos', nome:'Produtos citados',   ico:'../img/jogo/pec/emoji/leite.svg' },
      { id:'outras',   nome:'Outras informações', ico:'../img/jogo/pec/trabalhador.svg' }
    ],
    pecas:[
      { id:'leite',     alvo:'produtos', ico:'../img/jogo/pec/emoji/leite.svg', nome:'Leite',
        msg:'Leite é um dos produtos citados no texto.' },
      { id:'carnes',    alvo:'produtos', ico:'../img/jogo/pec/carne.svg', nome:'Carnes',
        msg:'Carnes são produtos citados no texto.' },
      { id:'ovos',      alvo:'produtos', ico:'../img/jogo/pec/emoji/ovos.svg', nome:'Ovos',
        msg:'Ovos são produtos citados no texto.' },
      { id:'couro',     alvo:'produtos', ico:'../img/jogo/pec/couro.svg', nome:'Couro',
        msg:'Couro é um dos produtos citados no texto.' },
      { id:'pastagens', alvo:'outras',   ico:'../img/jogo/pec/emoji/vaca.svg', nome:'Pastagens',
        msg:'Pastagens aparecem na descrição da pecuária extensiva.' },
      { id:'estabulo',  alvo:'outras',   ico:'../img/jogo/pec/emoji/vaca.svg', nome:'Estábulo',
        msg:'Estábulo aparece na descrição da pecuária intensiva.' },
      { id:'ordenha',   alvo:'outras',   ico:'../img/jogo/pec/emoji/leite.svg', nome:'Ordenha mecânica',
        msg:'Ordenha mecânica aparece na descrição da pecuária intensiva.' },
      { id:'volante',   alvo:'outras',   ico:'../img/jogo/pec/trabalhador.svg', nome:'Trabalhador volante',
        msg:'Trabalhador volante é um tipo de trabalhador rural descrito no texto.' }
    ]
  };

})(window.JOGOS = window.JOGOS || {});
