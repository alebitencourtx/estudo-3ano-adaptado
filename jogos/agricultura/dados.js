/* jogos/agricultura/dados.js — conteúdo declarativo dos jogos de Agricultura.
   Lido por jogos/jogar.html via ?jogo=<id>. Motores em ../jogo-kit.js.
   Substitui os 8 jogos antigos de jogos/agricultura/jogo-agricultura-*.html
   (livro p. 84, 85, 92, 93, 94 e 95).
   Os caminhos de imagem já estão no formato do jogador: ../img/... (o jogador fica em jogos/). */
(function (J) {

  /* ===== ordem-agr — encaixar os 3 passos nos números (era jogo-agricultura-ordem.html) ===== */
  J['ordem-agr'] = {
    id:'ordem-agr', topico:'agricultura', tipo:'ordem',
    icone:'🌾', titulo:'Do leite ao queijo',
    fala:'Ponha as fotos na ordem do trabalho do senhor Alfredo: 1, 2 e 3.',
    dica:'Ponha as fotos na ordem do trabalho do senhor Alfredo: 1, 2 e 3.',
    detalhes:{ titulo:'A fala do senhor Alfredo',
      texto:'O senhor Alfredo acordava muito cedo: juntava o gado, ordenhava as vacas e fazia os queijos.' },
    creditos:[
      'Fotos do livro didático, p. 94 e 95 (uso escolar).',
      'Depoimento do senhor Alfredo (livro, p. 94 e 95).',
      'Ícones: Twemoji, CC-BY 4.0.'
    ],
    passos:[
      { foto:'../img/hga/agr/gado.jpg',    nome:'Juntar o gado',     msg:'Primeiro, juntar o gado.' },
      { foto:'../img/hga/agr/ordenha.jpg', nome:'Ordenhar as vacas', msg:'Depois, ordenhar as vacas.' },
      { foto:'../img/hga/agr/queijo.jpg',  nome:'Fazer os queijos',  msg:'Por último, fazer os queijos.' }
    ]
  };

  /* ===== agr-subsistencia — 6 cartões em 2 caixas, 2 rodadas (era jogo-agricultura-subsistencia.html) ===== */
  J['agr-subsistencia'] = {
    id:'agr-subsistencia', topico:'agricultura', tipo:'classificar',
    icone:'🌱', titulo:'Subsistência ou comercial?',
    instrucao:'Leia o cartão. Leve-o até Subsistência ou Comercial.',
    apoio:'Leia o cartão. Leve-o até Subsistência ou Comercial.',
    erroComDestino:false,      /* o jogo antigo mostrava só a frase do cartão, sem "Vai na caixa ..." */
    lembrete:'Na subsistência, quem cuida da plantação come o que produz. O que sobra é vendido em mercados próximos. Na comercial, os produtos são destinados à venda. A produção comercial é vendida dentro do país e para outros países.',
    creditos:[
      'Fotos do livro didático, p. 84: o arado (instrumento simples) e a colheita mecanizada (máquina) — uso escolar.',
      'Ícones de plantação, trator e agricultor: Twemoji, CC-BY 4.0.',
      'Texto base: livro do 3º ano, p. 84 e 85 (subsistência e comercial).'
    ],
    alvos:[
      { id:'subsistencia', nome:'Subsistência', ico:'../img/jogo/agr/plantacao.svg' },
      { id:'comercial',    nome:'Comercial',    ico:'../img/jogo/agr/trator.svg' }
    ],
    pecas:[
      { id:'pequenas',      alvo:'subsistencia', nome:'Propriedades pequenas',
        msg:'Na subsistência, as propriedades são pequenas.' },
      { id:'familiar',      alvo:'subsistencia', nome:'Mão de obra familiar',
        ico:'../img/jogo/agr/agricultor.svg',
        msg:'Na subsistência, a mão de obra é da família.' },
      { id:'instrumentos',  alvo:'subsistencia', nome:'Instrumentos simples: enxada, foice e arado',
        foto:'../img/hga/agr/arado.jpg',
        msg:'Na subsistência, são usados instrumentos simples.' },
      { id:'extensao',      alvo:'comercial', nome:'Média e grande extensão',
        msg:'Na comercial, as propriedades são de média e grande extensão.' },
      { id:'maquinas',      alvo:'comercial', nome:'Máquinas: trator e colheitadeira',
        foto:'../img/hga/agr/colheitadeira.jpg',
        msg:'Na comercial, usamos máquinas.' },
      { id:'trabalhadores', alvo:'comercial', nome:'Assalariados ou meeiros',
        ico:'../img/jogo/agr/agricultor.svg',
        msg:'Na comercial, os trabalhadores são assalariados ou meeiros.' }
    ],
    /* 2 rodadas de 3 cartões */
    rodadas:[
      ['pequenas', 'familiar', 'instrumentos'],
      ['extensao', 'maquinas', 'trabalhadores']
    ],
    porRodada:3
  };

  /* ===== tempo-cana — linha do tempo da cana (era jogo-agricultura-cana.html) ===== */
  J['tempo-cana'] = {
    id:'tempo-cana', topico:'agricultura', tipo:'trilha',
    icone:'🌾', titulo:'A cana no tempo',
    instrucao:'Toque na parada destacada.',
    painel:true,
    creditos:[
      'Fotos da colheita da cana (1996 e 2020): livro do 3º ano, História e Geografia — p. 92 e 93 (uso escolar).',
      'Conteúdo conforme a linha do tempo da cana-de-açúcar (livro, p. 92 e 93).'
    ],
    paradas:[
      { ano:'1996', foto:'../img/hga/agr/cana-facao.jpg',
        alt:'Foto de 1996: trabalhador colhendo cana com facão',
        frase:'1996: a colheita era manual, com facão.',
        completo:'Em Pitangueiras (SP), a colheita era manual, com facão.' },
      { ano:'2020', foto:'../img/hga/agr/harvester.jpg',
        alt:'Foto de 2020: máquina colhendo cana',
        frase:'2020: a colheita é com máquinas.',
        completo:'Em Potirendaba (SP), a colheita é com colheitadeira e caminhão.' },
      /* harvester.jpg é a foto de cana com máquina (p. 93); colheitadeira.jpg é outra
         cultura (p. 84) e não pode ilustrar a cana */
      { ano:'Hoje', foto:'../img/hga/agr/harvester.jpg',
        alt:'Foto da colheita de cana com máquina',
        frase:'Hoje, 9 em cada 10 usam só colheita mecanizada.',
        completo:'Hoje, 9 em cada 10 propriedades usam só colheita mecanizada.' }
    ],
    msgFim:'Muito bem! Você viu a colheita da cana mudar no tempo.',
    extraFim:'<section class="card">' +
      '<details class="detalhes" open><summary>O que a cana produz</summary><ul>' +
        '<li>Até 2010, cerca de metade da colheita da cana no Brasil era manual.</li>' +
        '<li>Com a cana se faz açúcar e álcool.</li>' +
        '<li>Mesmo com máquinas, há trabalhadores: quem conduz a colheitadeira e o caminhão.</li>' +
      '</ul></details>' +
    '</section>'
  };

  /* ===== agr-perguntas — quiz de 4 rodadas (era jogo-agricultura-perguntas.html) ===== */
  J['agr-perguntas'] = {
    id:'agr-perguntas', topico:'agricultura', tipo:'quiz',
    icone:'🤖', titulo:'Perguntas da agricultura',
    dica:'Toque na resposta.',
    creditos:[
      'Fotos e textos do livro didático, p. 92, 94 e 95 (uso escolar).',
      'Perguntas com palavras do livro (p. 84, 85, 92, 93, 94 e 95).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    rodadas:[
      { pergunta:'O que faz um meeiro?',
        certa:'Um agricultor que reparte a produção com o dono da terra',
        opcoes:['Um agricultor que reparte a produção com o dono da terra', 'Um robô que tira o leite', 'Um instrumento simples'],
        msg:'O meeiro reparte a produção.' },
      { pergunta:'O que atrai a vaca até a sala de ordenha com robôs?',
        certa:'A ração no cocho',
        opcoes:['A ração no cocho', 'O facão', 'A enxada'],
        apoio:'Em 2013, chegou ao Brasil a ordenha com robôs.',
        msg:'A vaca vai sozinha, atraída pela ração.' },
      { pergunta:'O que a cana vira?',
        certa:'Açúcar e álcool',
        opcoes:['Açúcar e álcool', 'Leite e queijo', 'Máquinas'],
        icones:['../img/jogo/agr/acucar.svg', '../img/jogo/agr/leite.svg', '../img/jogo/agr/trator.svg'],
        msg:'A cana vira açúcar e álcool.',
        img:'../img/hga/agr/cana-facao.jpg', alt:'Colheita de cana com facão' },
      { pergunta:'Para que serve o chip no pescoço da vaca?',
        certa:'Traz informações de cada animal',
        opcoes:['Traz informações de cada animal', 'Atrai a vaca ao cocho', 'Faz o queijo'],
        msg:'O chip informa cada animal.',
        img:'../img/hga/agr/chip.jpg', alt:'Chip no pescoço da vaca' }
    ]
  };

  /* ===== mem-agr — memória de 3 pares (era jogo-agricultura-memoria.html) ===== */
  J['mem-agr'] = {
    id:'mem-agr', topico:'agricultura', tipo:'memoria',
    icone:'🌾', titulo:'Memória do campo',
    instrucao:'Encontre duas cartas com a mesma imagem. Ache os 3 pares.',
    colunas:3,
    pares:[
      { id:'arado',         nome:'Arado',         foto:'../img/hga/agr/arado.jpg',
        frase:'Instrumento simples: o arado.' },
      { id:'colheitadeira', nome:'Colheitadeira', foto:'../img/hga/agr/colheitadeira.jpg',
        frase:'Máquina: a colheitadeira.' },
      { id:'ordenha',       nome:'Ordenha',       foto:'../img/hga/agr/ordenha.jpg',
        frase:'Há cem anos, a ordenha era manual.' }
    ],
    creditos:[
      'Fotos do livro didático, p. 84, 85, 92, 95 (uso escolar).',
      'Ícones: Twemoji, CC-BY 4.0.'
    ]
  };

  /* ===== tempo-leite — linha do tempo do leite (era jogo-agricultura-leite.html) ===== */
  J['tempo-leite'] = {
    id:'tempo-leite', topico:'agricultura', tipo:'trilha',
    icone:'🥛', titulo:'O leite no tempo',
    instrucao:'Toque na parada destacada.',
    painel:true,
    creditos:[
      'Ilustração da ordenha manual e foto da vaca com chip: livro do 3º ano, História e Geografia — p. 94 e 95 (uso escolar).',
      'Ícones: Twemoji, CC-BY 4.0.'
    ],
    paradas:[
      /* ordenha.jpg é a ilustração da ordenha MANUAL (p. 94) — não é foto de robô */
      { ano:'Há cem anos', foto:'../img/hga/agr/ordenha.jpg',
        alt:'Ilustração do livro: ordenhar as vacas à mão',
        frase:'Há cem anos, a ordenha era só manual.',
        completo:'O senhor Alfredo acordava muito cedo. Depois, juntava o gado e ordenhava as vacas.' },
      /* "Hoje" fica SEM foto: o acervo não tem imagem da ordenha mecânica */
      { ano:'Hoje', foto:'',
        alt:'',
        frase:'Hoje, cresceu a ordenha mecânica.',
        completo:'Algumas fazendas ainda usam ordenha manual. Mas cresceu a ordenha mecânica.' },
      /* chip.jpg é a p. 95: vaca com chip no pescoço (não há foto de ordenha mecânica no acervo) */
      { ano:'2013', foto:'../img/hga/agr/chip.jpg',
        alt:'Vaca com um chip no pescoço',
        frase:'Em 2013, chegou a ordenha com robôs.',
        completo:'A vaca vai sozinha até a sala de ordenha. Ela é atraída pela ração no cocho. Um braço robótico tira o leite. O leite vai direto ao tanque.' }
    ],
    msgFim:'Muito bem! Você viu a ordenha mudar no tempo.',
    extraFim:'<section class="card">' +
      '<details class="detalhes" open><summary>O que é a ordenha</summary><ul>' +
        '<li>A retirada do leite das vacas e das cabras é a ordenha.</li>' +
        '<li>A ordenha com robôs acontece 24 horas por dia. Um chip no pescoço traz informações de cada animal.</li>' +
      '</ul></details>' +
    '</section>'
  };

  /* ===== agr-alimentos — toque nos certos, 2 telas (era jogo-agricultura-alimentos.html) ===== */
  J['agr-alimentos'] = {
    id:'agr-alimentos', topico:'agricultura', tipo:'toque',
    icone:'🍚', titulo:'De onde vem a comida?',
    apoio:'O arroz e o feijão, as frutas e as verduras vêm da agricultura.',
    creditos:[
      'Palavras do livro didático, p. 84, 85 e 92 a 95 (uso escolar).',
      'Fotos do livro didático (uso escolar).',
      'Ícones de emoji: Twemoji (CC BY 4.0).'
    ],
    /* banco padrão do motor: cada tela abaixo traz o seu próprio banco, igual ao do jogo antigo */
    fichas:[
      { nome:'Arroz',    ico:'../img/jogo/agr/arroz.svg' },
      { nome:'Feijão',   ico:'../img/jogo/agr/feijao.svg' },
      { nome:'Frutas',   ico:'../img/jogo/agr/frutas.svg' },
      { nome:'Verduras', ico:'../img/jogo/agr/verduras.svg' },
      { nome:'Açúcar',   ico:'../img/jogo/agr/acucar.svg' },
      { nome:'Álcool',   ico:'../img/jogo/agr/alcool.svg' },
      'Cana-de-açúcar'
    ],
    telas:[
      { pergunta:'Toque nos 4 alimentos que vêm da agricultura.',
        hint:'Toque em 4 fichas e depois em Conferir.',
        fichas:[
          { nome:'Arroz',    ico:'../img/jogo/agr/arroz.svg' },
          { nome:'Feijão',   ico:'../img/jogo/agr/feijao.svg' },
          { nome:'Frutas',   ico:'../img/jogo/agr/frutas.svg' },
          { nome:'Verduras', ico:'../img/jogo/agr/verduras.svg' },
          { nome:'Açúcar',   ico:'../img/jogo/agr/acucar.svg' },
          { nome:'Álcool',   ico:'../img/jogo/agr/alcool.svg' },
          'Cana-de-açúcar'
        ],
        certas:['Arroz', 'Feijão', 'Frutas', 'Verduras'],
        msg:'O arroz, o feijão, as frutas e as verduras vêm da agricultura.' },
      { pergunta:'Toque nos 2 produtos feitos da cana-de-açúcar.',
        hint:'Toque em 2 fichas e depois em Conferir.',
        fichas:[
          { nome:'Açúcar', ico:'../img/jogo/agr/acucar.svg' },
          { nome:'Álcool', ico:'../img/jogo/agr/alcool.svg' },
          { nome:'Arroz',  ico:'../img/jogo/agr/arroz.svg' },
          { nome:'Feijão', ico:'../img/jogo/agr/feijao.svg' },
          { nome:'Frutas', ico:'../img/jogo/agr/frutas.svg' }
        ],
        certas:['Açúcar', 'Álcool'],
        msg:'Da cana-de-açúcar se fazem açúcar e álcool.' }
    ],
    resumoFim:'Você acertou tudo!'
  };

  /* ===== agr-simnao — sim ou não, 5 rodadas (era jogo-agricultura-sim-nao.html) ===== */
  J['agr-simnao'] = {
    id:'agr-simnao', topico:'agricultura', tipo:'quiz',
    icone:'🌾', titulo:'Sim ou não? — Agricultura',
    apoio:'Responda sim ou não.',
    creditos:[
      'Fotos do livro didático (p. 84, 92 e 95); ícones Twemoji, CC-BY 4.0.'
    ],
    rodadas:[
      { pergunta:'Na agricultura de subsistência, as pessoas que cuidam da plantação comem o que plantam?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'Na subsistência, os alimentos são consumidos pelas pessoas que cuidam das plantações.',
        img:'../img/hga/agr/arado.jpg', alt:'Instrumento simples: o arado.' },
      { pergunta:'Na agricultura comercial, os produtos são feitos para vender?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'Na comercial, os produtos são destinados à venda.',
        img:'../img/hga/agr/colheitadeira.jpg', alt:'Máquina: a colheitadeira.' },
      { pergunta:'O facão é uma máquina usada para colher cana?',
        certa:'Não', opcoes:['Sim', 'Não'],
        msg:'O facão é um instrumento simples.',
        img:'../img/hga/agr/cana-facao.jpg', alt:'Trabalhador colhendo cana com facão.' },
      { pergunta:'Hoje, a cana é colhida somente à mão?',
        certa:'Não', opcoes:['Sim', 'Não'],
        msg:'Em 2020, a colheita da cana é com máquinas.',
        img:'../img/hga/agr/harvester.jpg', alt:'Colheitadeira de cana na lavoura.' },
      { pergunta:'O braço robótico tira o leite da vaca?',
        certa:'Sim', opcoes:['Sim', 'Não'],
        msg:'Em 2013 chegou a ordenha com robôs: o braço robótico tira o leite.',
        img:'../img/hga/agr/chip.jpg', alt:'Vaca com chip no pescoço.' }
    ],
    resumoFim:'Você respondeu tudo!',
    msgFim:'Muito bem! Você terminou o jogo.'
  };

})(window.JOGOS = window.JOGOS || {});
