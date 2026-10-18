/* jogos/impactos/dados.js — conteúdo declarativo dos jogos de Impactos ambientais.
   Lido por jogos/jogar.html via ?jogo=<id>. Motores em ../jogo-kit.js.
   Substitui os 9 jogos antigos de jogos/impactos/jogo-impactos-*.html (livro p. 108 a 113).
   Os caminhos de imagem já estão no formato do jogador: ../img/... (o jogador fica em jogos/). */
(function (J) {

  /* ===== campo-cidade-imp — 6 cartões em 2 caixas (era jogo-impactos-campo-cidade.html) ===== */
  J['campo-cidade-imp'] = {
    id:'campo-cidade-imp', topico:'impactos', tipo:'classificar',
    icone:'🚚', titulo:'Campo e cidade trocam',
    instrucao:'De onde vem cada produto?',
    apoio:'O campo abastece a cidade com comida. A cidade abastece o campo com produtos da indústria.',
    hint:'Arraste a peça para a caixa certa. Ou toque na peça e depois na caixa.',
    creditos:[
      'Ícones de leite, ovos, carne, roupa, remédio e celular: Twemoji, CC-BY 4.0.',
      'Texto base: livro do 3º ano, p. 108 (o campo abastece a cidade e a cidade abastece o campo).'
    ],
    alvos:[
      { id:'campo',  ico:'🚜', nome:'Vem do campo' },
      { id:'cidade', ico:'🏙️', nome:'Vem da cidade' }
    ],
    pecas:[
      { id:'leite',   alvo:'campo',  ico:'../img/jogo/imp/leite.svg',   nome:'Leite',
        msg:'O campo manda leite para a cidade.' },
      { id:'ovos',    alvo:'campo',  ico:'../img/jogo/imp/ovos.svg',    nome:'Ovos',
        msg:'O campo manda ovos para a cidade.' },
      { id:'carne',   alvo:'campo',  ico:'../img/jogo/imp/carne.svg',   nome:'Carne',
        msg:'O campo manda carne para a cidade.' },
      { id:'roupa',   alvo:'cidade', ico:'../img/jogo/imp/roupa.svg',   nome:'Roupa',
        msg:'A cidade manda roupa para o campo.' },
      { id:'remedio', alvo:'cidade', ico:'../img/jogo/imp/remedio.svg', nome:'Remédio',
        msg:'A cidade manda remédio para o campo.' },
      { id:'celular', alvo:'cidade', ico:'../img/jogo/imp/celular.svg', nome:'Celular',
        msg:'A cidade manda celular para o campo.' }
    ]
  };

  /* ===== imp-causas — 4 pares problema → causa (era jogo-impactos-causas.html) ===== */
  J['imp-causas'] = {
    id:'imp-causas', topico:'impactos', tipo:'ligar',
    icone:'⚠️', titulo:'O problema e a causa',
    instrucao:'Qual é a causa de cada problema?',
    fala:'Ligue cada problema do ambiente à sua causa.',
    dica:'Toque no problema e depois na causa.',
    lembrete:'Agrotóxicos servem para prevenir ou eliminar pragas. O uso frequente e inadequado pode prejudicar a saúde humana e animal. ' +
      'A agricultura, a pecuária e o extrativismo mineral usam muita água. ' +
      'O desmatamento também empobrece o solo e afeta os rios e as chuvas.',
    creditos:[
      'Fotos de desmatamento, agrotóxico, irrigação e esgoto: livro de História e Geografia do 3º ano, p. 110 a 113 (uso escolar).',
      'Ícone ⚠️: Twemoji, CC-BY 4.0.'
    ],
    pares:[
      { id:'desmatamento', palavra:'Desmatamento',
        foto:'../img/hga/imp/desmatamento.jpg', alt:'Área com a vegetação retirada',
        nome:'Tira a vegetação natural',
        msg:'O desmatamento tira a vegetação natural.' },
      { id:'agrotoxico', palavra:'Agrotóxico',
        foto:'../img/hga/imp/agrotoxico.jpg', alt:'Agrotóxico aplicado na plantação',
        nome:'Contamina o solo e a água',
        msg:'O agrotóxico contamina o solo e a água.' },
      { id:'irrigacao', palavra:'Irrigação',
        foto:'../img/hga/imp/irrigacao.jpg', alt:'Água usada na irrigação da plantação',
        nome:'Usa muita água',
        msg:'A irrigação usa muita água.' },
      { id:'esgoto', palavra:'Esgoto sem tratamento',
        foto:'../img/hga/imp/esgoto.jpg', alt:'Esgoto caindo no rio',
        nome:'Contamina os rios',
        msg:'O esgoto sem tratamento contamina os córregos e rios.' }
    ]
  };

  /* ===== imp-reciclagem — 4 lixos nas 4 lixeiras da coleta seletiva (era jogo-impactos-reciclagem.html) ===== */
  J['imp-reciclagem'] = {
    id:'imp-reciclagem', topico:'impactos', tipo:'classificar',
    layout:'lixeiras',
    icone:'♻️', titulo:'Cada lixo na sua lixeira',
    instrucao:'Onde vai cada lixo?',
    apoio:'Na coleta seletiva, cada material vai para uma lixeira de cor diferente.',
    hint:'Arraste o lixo para a lixeira certa. Ou toque no lixo e depois na lixeira.',
    resumoFim:'Tudo na lixeira certa!',
    lembrete:'Reduzir é consumir menos. Reutilizar é usar de novo. Reciclar é transformar em algo novo.',
    creditos:[
      'Ícones de papel, garrafa, vidro e lata: Twemoji, CC-BY 4.0.',
      'Texto base: livro do 3º ano, p. 113 (coleta seletiva: papel na lixeira azul, plástico na vermelha, vidro na verde, metal na amarela).'
    ],
    alvos:[
      { id:'azul',     nome:'Papel',    classe:'azul',     cor:'azul' },
      { id:'vermelha', nome:'Plástico', classe:'vermelha', cor:'vermelha' },
      { id:'verde',    nome:'Vidro',    classe:'verde',    cor:'verde' },
      { id:'amarela',  nome:'Metal',    classe:'amarela',  cor:'amarela' }
    ],
    pecas:[
      { id:'papel',   alvo:'azul',     ico:'../img/jogo/imp/papel.svg',   nome:'Jornal e papel',
        msg:'O papel vai na lixeira azul.' },
      { id:'garrafa', alvo:'vermelha', ico:'../img/jogo/imp/garrafa.svg', nome:'Garrafa de plástico',
        msg:'O plástico vai na lixeira vermelha.' },
      { id:'vidro',   alvo:'verde',    ico:'../img/jogo/imp/vidro.svg',   nome:'Vidro',
        msg:'O vidro vai na lixeira verde.' },
      { id:'lata',    alvo:'amarela',  ico:'../img/jogo/imp/lata.svg',    nome:'Lata de metal',
        msg:'O metal vai na lixeira amarela.' }
    ]
  };

  /* ===== imp-ajudar — toque nas fichas certas, 2 telas (era jogo-impactos-ajudar.html) ===== */
  J['imp-ajudar'] = {
    id:'imp-ajudar', topico:'impactos', tipo:'toque',
    icone:'💚', titulo:'Ajudar a natureza',
    resumoFim:'Você cuidou da natureza!',
    creditos:[
      'Fotos do livro didático, p. 108 a 113 (uso escolar).',
      'Palavras do livro (p. 108 a 113): separar o lixo reciclável, fechar a torneira, plantar árvores, esgoto sem tratamento, moradia em área de risco, coleta seletiva.',
      'Também ajudam: usar menos agrotóxicos e cuidar da água.',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    /* cada tela tem o seu próprio banco de fichas: as certas + os distratores da rodada */
    telas:[
      { pergunta:'Toque nas 3 atitudes que ajudam a natureza.',
        hint:'Toque em 3 fichas e depois em Conferir.',
        fichas:[
          { nome:'Separar o lixo reciclável', ico:'../img/jogo/imp/sacola.svg' },
          { nome:'Fechar a torneira',         ico:'../img/jogo/imp/torneira.svg' },
          { nome:'Plantar árvores',           ico:'../img/jogo/imp/arvore.svg' },
          { nome:'Usar muito agrotóxico',     ico:'../img/jogo/imp/reciclagem.svg' },
          { nome:'Retirar a vegetação natural', ico:'../img/jogo/imp/arvore.svg' },
          { nome:'Deixar o esgoto sem tratamento', ico:'../img/jogo/imp/agua.svg' }
        ],
        certas:['Separar o lixo reciclável', 'Fechar a torneira', 'Plantar árvores'],
        msg:'Essas atitudes ajudam a natureza.' },
      { pergunta:'Toque nos 2 problemas que podem acontecer na cidade.',
        hint:'Toque em 2 fichas e depois em Conferir.',
        fichas:[
          'Esgoto sem tratamento',
          'Moradia em área de risco',
          { nome:'Plantar árvores', ico:'../img/jogo/imp/arvore.svg' },
          'Coleta seletiva'
        ],
        certas:['Esgoto sem tratamento', 'Moradia em área de risco'],
        msg:'Esgoto e moradia em área de risco são problemas da cidade.' }
    ]
  };

  /* ===== imp-perguntas — quiz de 4 rodadas (era jogo-impactos-perguntas.html) ===== */
  J['imp-perguntas'] = {
    id:'imp-perguntas', topico:'impactos', tipo:'quiz',
    icone:'❓', titulo:'Perguntas do ambiente',
    dica:'Toque na resposta.',
    resumoFim:'Você respondeu tudo!',
    creditos:[
      'Fotos do livro didático, p. 108 a 113 (uso escolar).',
      'Perguntas com palavras do livro (p. 108 a 113).',
      'Na agricultura, tratores e colheitadeiras aumentam a produção, mas substituem o trabalho das pessoas e fazem crescer o desemprego no campo.',
      'O transporte coletivo deficiente aumenta o número de automóveis. Os congestionamentos dificultam o deslocamento e agravam a poluição do ar.',
      'As moradias em áreas de risco ficam em encostas de morros e margens de rios e córregos.',
      'Na agricultura, na pecuária e no extrativismo mineral usa-se muita água; a irrigação é uma das práticas que mais usam água.',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    rodadas:[
      { pergunta:'O que acontece quando máquinas fazem o trabalho no campo?',
        certa:'Aumenta a produção e o desemprego',
        opcoes:['Aumenta a produção e o desemprego', 'Usa muita água', 'Tira a vegetação natural'],
        msg:'As máquinas substituem o trabalho das pessoas.',
        img:'../img/hga/imp/colheitadeiras.jpg', alt:'Colheitadeiras no campo' },
      { pergunta:'A irrigação usa muita água ou pouca água?',
        certa:'Usa muita água',
        opcoes:['Usa muita água', 'Faz crescer o desemprego no campo', 'Empobrece o solo'],
        msg:'A irrigação é uma das práticas que mais usam água.',
        img:'../img/hga/imp/irrigacao.jpg', alt:'Irrigação na plantação' },
      { pergunta:'O engarrafamento piora qual problema?',
        certa:'A poluição do ar',
        opcoes:['A poluição do ar', 'Aumenta o desemprego no campo', 'Contamina os córregos e rios'],
        msg:'O engarrafamento agrava a poluição do ar.',
        img:'../img/hga/imp/engarrafamento.jpg', alt:'Carros no engarrafamento' },
      { pergunta:'Morar na encosta do morro é morar em que tipo de área?',
        certa:'É uma área de risco',
        opcoes:['É uma área de risco', 'Uma plantação de soja', 'Uma pastagem com gado'],
        msg:'Encostas de morros são áreas de risco.',
        img:'../img/hga/imp/morro.jpg', alt:'Moradias na encosta do morro' }
    ]
  };

  /* ===== imp-servicos — toque nos certos, 2 telas (era jogo-impactos-servicos.html) ===== */
  J['imp-servicos'] = {
    id:'imp-servicos', topico:'impactos', tipo:'toque',
    icone:'🏥', titulo:'Os serviços públicos',
    resumoFim:'Você acertou tudo!',
    lembrete:'Quando os serviços públicos são ruins, a vida das pessoas e as atividades econômicas da cidade ficam prejudicadas. ' +
      'Quem não pode comprar nem alugar moradia digna a preço acessível pode ocupar encostas de morros e margens de rios e córregos. ' +
      'O sistema de transporte coletivo deficiente aumenta o número de automóveis e causa congestionamentos.',
    /* cada tela tem o seu próprio banco de fichas: as certas + os distratores da rodada */
    telas:[
      { pergunta:'Toque nos 4 serviços públicos.',
        fichas:[
          'Atendimento de saúde',
          'Escola (educação)',
          'Coleta de lixo',
          'Segurança',
          'Plantar árvores',
          'Separar o lixo reciclável'
        ],
        certas:['Atendimento de saúde', 'Escola (educação)', 'Coleta de lixo', 'Segurança'],
        msg:'Saúde, educação, coleta de lixo e segurança são serviços públicos.',
        img:'../img/hga/imp/fila-servicos.jpg', alt:'' },
      { pergunta:'Toque nos 3 problemas que podem acontecer na cidade.',
        fichas:[
          'Esgoto sem tratamento',
          'Moradia em área de risco',
          'Engarrafamento',
          'Coleta seletiva',
          'Plantar árvores'
        ],
        certas:['Esgoto sem tratamento', 'Moradia em área de risco', 'Engarrafamento'],
        msg:'Esgoto, moradia em área de risco e engarrafamento são problemas da cidade.' }
    ]
  };

  /* ===== imp-paisagem — quiz de 4 rodadas (era jogo-impactos-paisagem.html) ===== */
  J['imp-paisagem'] = {
    id:'imp-paisagem', topico:'impactos', tipo:'quiz',
    icone:'🏞️', titulo:'O que se vê na paisagem',
    apoio:'O campo e a cidade trocam produtos.',
    resumoFim:'Você respondeu tudo!',
    lembrete:'Do campo vêm comida, carne, leite, ovos, frutas e madeira. Da cidade vêm roupa, remédio, celular, ferramentas, caminhão e trator. ' +
      'O campo abastece a cidade com produtos da agricultura, da pecuária e do extrativismo. ' +
      'Do campo também vêm laranja, banana, cana e cenoura. A cidade também envia caminhões, antenas, tratores e ferramentas por meio do comércio. ' +
      'No horizonte da foto de Unaí aparecem o céu e as nuvens.',
    rodadas:[
      { pergunta:'Na foto de Unaí (MG), o que é a área com gado?',
        certa:'Uma pastagem (pecuária)',
        opcoes:['Uma pastagem (pecuária)', 'Uma plantação (agricultura)', 'Uma cidade'],
        msg:'A pastagem com gado é a pecuária.',
        img:'../img/hga/imp/paisagem.jpg' },
      { pergunta:'E a área com plantação de soja?',
        certa:'Agricultura',
        opcoes:['Agricultura', 'Pecuária', 'Extrativismo mineral'],
        msg:'A plantação de soja é a agricultura.',
        img:'../img/hga/imp/paisagem.jpg' },
      { pergunta:'O que o campo manda para a cidade?',
        certa:'Comida, carne e leite',
        opcoes:['Comida, carne e leite', 'Roupa, remédio e celular', 'Máquinas e ferramentas'],
        msg:'O campo abastece a cidade com produtos da agricultura e da pecuária.',
        img:'../img/hga/imp/ciclo.jpg' },
      { pergunta:'O que a cidade manda para o campo?',
        certa:'Roupa, remédio e celular',
        opcoes:['Roupa, remédio e celular', 'Comida, carne e leite', 'Ovos e frutas'],
        msg:'A cidade abastece o campo com produtos da indústria, por meio do comércio.',
        img:'../img/hga/imp/ciclo.jpg' }
    ]
  };

  /* ===== imp-consequencias — quiz sim/não de 4 rodadas (era jogo-impactos-consequencias.html) ===== */
  J['imp-consequencias'] = {
    id:'imp-consequencias', topico:'impactos', tipo:'quiz',
    icone:'🐟', titulo:'O que isso pode causar?',
    apoio:'Veja o que cada problema pode causar.',
    resumoFim:'Você respondeu tudo!',
    lembrete:'O desmatamento também afeta o curso dos rios e o regime de chuvas. ' +
      'O uso frequente e inadequado de agrotóxicos pode prejudicar a saúde humana e animal. ' +
      'O uso excessivo de água pode reduzir a água disponível para o consumo das pessoas. ' +
      'O desmatamento é proibido em diversas localidades, mas ainda ocorre de forma irregular.',
    rodadas:[
      { pergunta:'O desmatamento pode levar espécies à extinção?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'O desmatamento leva espécies à extinção e empobrece o solo.',
        img:'../img/hga/imp/desmatamento.jpg' },
      { pergunta:'O lixo jogado nos rios deixa a água limpa?',
        certa:'Não', opcoes:['Sim', 'Não'],
        msg:'O lixo na água causa poluição e aumenta as doenças.',
        img:'../img/hga/imp/esgoto.jpg' },
      { pergunta:'Usar agrotóxicos sem cuidado faz bem à saúde?',
        certa:'Não', opcoes:['Sim', 'Não'],
        msg:'O agrotóxico contamina o solo e a água, e prejudica a saúde.',
        img:'../img/hga/imp/agrotoxico.jpg' },
      { pergunta:'Se usarmos água demais, pode faltar água para as pessoas?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'O uso excessivo pode reduzir a água disponível para as pessoas.',
        img:'../img/hga/imp/irrigacao.jpg' }
    ]
  };

  /* ===== imp-agua — ordenar os 3 passos do esgoto no rio (era jogo-impactos-agua.html) ===== */
  J['imp-agua'] = {
    id:'imp-agua', topico:'impactos', tipo:'ordem',
    icone:'💧', titulo:'A água do rio',
    fala:'Ponha as frases na ordem em que acontecem.',
    apoio:'O esgoto sem tratamento contamina os rios.',
    resumoFim:'Tudo na ordem certa!',
    lembrete:'O lixo na água também causa poluição.',
    creditos:[
      'Foto do livro didático, p. 113; ícones Twemoji, CC-BY 4.0.'
    ],
    passos:[
      { foto:'../img/hga/imp/esgoto.jpg', nome:'O esgoto não é tratado.',
        msg:'No passo 1, o esgoto não é tratado.' },
      { foto:'../img/jogo/imp/agua.svg', nome:'O esgoto contamina os córregos e rios.',
        msg:'No passo 2, o esgoto contamina os córregos e rios.' },
      { foto:'../img/jogo/imp/peixe.svg', nome:'A água suja pode aumentar as doenças.',
        msg:'No passo 3, a água suja pode aumentar as doenças.' }
    ]
  };

})(window.JOGOS = window.JOGOS || {});
